/**
 * Gestor de sesión administrativa (`sessionManager`).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-75, CB-13, RF-11, RF-12)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T044)
 * - Union/specs/001-plataforma-unificada/data-model.md
 *
 * Responsabilidades:
 * - Almacenar, recuperar y limpiar la `SesionAdministrativa` en `sessionStorage` (o memoria).
 * - Sincronizar el token con `httpClientAdmin` mediante `setAuthToken(token)`.
 * - Validar vigencia de la sesión delegando en `SesionAdministrativa.esValida()`.
 * - Soporte para cancelación de acciones pendientes ante expiración de sesión (CB-13):
 *   permite registrar callbacks / señales de cancelación para abortar confirmaciones
 *   y operaciones en curso en componentes de presentación.
 */

import { SesionAdministrativa } from '../domain/SesionAdministrativa'
import { UsuarioAdmin } from '../domain/UsuarioAdmin'
import { RolUsuarioAdmin as RolUsuario } from '../domain/enums/RolUsuarioAdmin'
import { EstadoCuentaUsuario } from '../domain/enums/EstadoCuentaUsuario'
import { setAuthToken } from './httpClientAdmin'

const CLAVE_ALMACENAMIENTO_ADMIN = 'inspiraciones.admin.sesion'

export type CancelacionAccionCallback = (motivo: string) => void

const callbacksCancelacion = new Set<CancelacionAccionCallback>()
let abortControllerAccionSensible: AbortController | null = null

interface SesionAdminDto {
  token: string
  expiraEn: string
  usuario: {
    id: string
    nombre: string
    mail: string
    rol: RolUsuario
    estadoCuenta: EstadoCuentaUsuario
  }
}

function obtenerStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage
    }
  } catch {
    // Entorno sin acceso a sessionStorage
  }
  return null
}

let sesionEnMemoria: SesionAdministrativa | null = null

function serializar(sesion: SesionAdministrativa): string {
  const dto: SesionAdminDto = {
    token: sesion.token,
    expiraEn: sesion.expiraEn.toISOString(),
    usuario: {
      id: sesion.usuario.id,
      nombre: sesion.usuario.nombre,
      mail: sesion.usuario.mail,
      rol: sesion.usuario.rol,
      estadoCuenta: sesion.usuario.estadoCuenta,
    },
  }
  return JSON.stringify(dto)
}

function deserializar(json: string): SesionAdministrativa | null {
  try {
    const dto = JSON.parse(json) as SesionAdminDto
    return new SesionAdministrativa({
      token: dto.token,
      expiraEn: new Date(dto.expiraEn),
      usuario: new UsuarioAdmin({
        id: dto.usuario.id,
        nombre: dto.usuario.nombre,
        mail: dto.usuario.mail,
        rol: dto.usuario.rol,
        estadoCuenta: dto.usuario.estadoCuenta,
      }),
    })
  } catch {
    return null
  }
}

/**
 * Persiste la sesión administrativa y actualiza el token en el cliente HTTP de administración.
 */
export function guardarSesion(sesion: SesionAdministrativa): void {
  sesionEnMemoria = sesion
  const storage = obtenerStorage()
  if (storage) {
    storage.setItem(CLAVE_ALMACENAMIENTO_ADMIN, serializar(sesion))
  }
  setAuthToken(sesion.token)
}

/**
 * Recupera la sesión administrativa activa en memoria o almacenamiento local.
 */
export function obtenerSesion(): SesionAdministrativa | null {
  if (sesionEnMemoria) {
    return sesionEnMemoria
  }
  const storage = obtenerStorage()
  if (storage) {
    const json = storage.getItem(CLAVE_ALMACENAMIENTO_ADMIN)
    if (json) {
      const sesion = deserializar(json)
      if (sesion) {
        sesionEnMemoria = sesion
        setAuthToken(sesion.token)
        return sesion
      }
    }
  }
  return null
}

/**
 * Obtiene el token actual de la sesión administrativa activa.
 */
export function getToken(): string | null {
  const sesion = obtenerSesion()
  return sesion ? sesion.token : null
}

/**
 * Comprueba si existe una sesión administrativa activa y vigente (RF-75).
 */
export function esValida(fechaActual: Date = new Date()): boolean {
  const sesion = obtenerSesion()
  if (!sesion) {
    return false
  }
  const vigente = sesion.esValida(fechaActual)
  if (!vigente) {
    // Si la sesión expiró mientras se consultaba, cancela acciones y limpia
    cancelarAccionesEnCurso('La sesión administrativa ha expirado.')
    limpiarSesion()
    return false
  }
  return true
}

/**
 * Cancela cualquier acción sensible pendiente o en curso (CB-13).
 */
export function cancelarAccionesEnCurso(motivo = 'Sesión expirada'): void {
  if (abortControllerAccionSensible) {
    abortControllerAccionSensible.abort(motivo)
    abortControllerAccionSensible = null
  }
  for (const cb of callbacksCancelacion) {
    cb(motivo)
  }
}

/**
 * Registra un callback de notificación para cuando se cancelan acciones por expiración de sesión.
 */
export function alCancelarAcciones(callback: CancelacionAccionCallback): () => void {
  callbacksCancelacion.add(callback)
  return () => {
    callbacksCancelacion.delete(callback)
  }
}

/**
 * Genera o renueva una señal de cancelación para operaciones sensibles en curso.
 */
export function crearSignalAccionSensible(): AbortSignal {
  if (!abortControllerAccionSensible || abortControllerAccionSensible.signal.aborted) {
    abortControllerAccionSensible = new AbortController()
  }
  return abortControllerAccionSensible.signal
}

/**
 * Limpia la sesión administrativa, cancela acciones pendientes y desautentica el cliente HTTP.
 */
export function limpiarSesion(): void {
  sesionEnMemoria = null
  const storage = obtenerStorage()
  if (storage) {
    storage.removeItem(CLAVE_ALMACENAMIENTO_ADMIN)
  }
  setAuthToken(null)
}

export const sessionManager = {
  guardarSesion,
  obtenerSesion,
  getToken,
  esValida,
  cancelarAccionesEnCurso,
  alCancelarAcciones,
  crearSignalAccionSensible,
  limpiarSesion,
}
