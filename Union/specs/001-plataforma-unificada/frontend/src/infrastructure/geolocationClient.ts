/**
 * Cliente de geolocalización (frontend de usuario).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-45, CB-10)
 * - Union/specs/001-plataforma-unificada/tasks.md (T041, T111)
 * - Union/specs/001-plataforma-unificada/frontend/src/infrastructure/config.ts
 *
 * Responsabilidades:
 * - Expone si la geolocalización está activa y las coordenadas actuales (`Coordenadas`).
 * - Se suscribe a cambios de permisos (Permissions API / eventos de revocación) para notificar
 *   a los consumidores si el usuario revoca el permiso durante la sesión (CB-10).
 * - Permite suscripción/desuscripción mediante callbacks (`onPermissionChange`, `onRevoke`).
 */

import { config } from './config'

export interface Coordenadas {
  latitud: number
  longitud: number
}

export type PermissionStateListener = (state: PermissionState) => void
export type RevocationListener = () => void

export class GeolocationError extends Error {
  readonly code: number

  constructor(message: string, code: number) {
    super(message)
    this.name = 'GeolocationError'
    this.code = code
  }
}

let estadoPermisoActual: PermissionState = 'prompt'
let coordenadasActuales: Coordenadas | null = null
let geolocalizacionActiva = config.geolocationEnabledDefault ?? false
let permissionStatusRef: PermissionStatus | null = null

const oyentesEstadoPermiso = new Set<PermissionStateListener>()
const oyentesRevocacion = new Set<RevocationListener>()

/**
 * Determina si el navegador soporta la API de geolocalización.
 */
export function estaSoportada(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator
}

/**
 * Indica si la geolocalización se encuentra actualmente activa y autorizada.
 */
export function estaActiva(): boolean {
  return geolocalizacionActiva && estadoPermisoActual === 'granted'
}

/**
 * Obtiene las últimas coordenadas conocidas en memoria o null si no se han obtenido.
 */
export function obtenerUltimasCoordenadas(): Coordenadas | null {
  return coordenadasActuales
}

/**
 * Inicializa la escucha de cambios de permiso a través de la Permissions API
 * para detectar revocación en tiempo de ejecución (CB-10).
 */
export async function inicializarObservadorPermisos(): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
    return
  }

  try {
    const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
    permissionStatusRef = status
    estadoPermisoActual = status.state

    status.onchange = () => {
      const estadoPrevio = estadoPermisoActual
      estadoPermisoActual = status.state

      if (status.state === 'denied' || status.state === 'prompt') {
        geolocalizacionActiva = false
        coordenadasActuales = null

        if (estadoPrevio === 'granted') {
          // Disparo de eventos de revocación en sesión (CB-10)
          for (const oyente of oyentesRevocacion) {
            oyente()
          }
        }
      }

      for (const oyente of oyentesEstadoPermiso) {
        oyente(status.state)
      }
    }
  } catch {
    // Si la Permissions API falla o no soporta query de geolocation, fallback silencioso
  }
}

/**
 * Solicita la posición actual del usuario mediante navigator.geolocation.
 */
export function obtenerPosicionActual(): Promise<Coordenadas> {
  if (!estaSoportada()) {
    return Promise.reject(
      new GeolocationError('La geolocalización no está soportada en este entorno.', 0),
    )
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const coords: Coordenadas = {
          latitud: posicion.coords.latitude,
          longitud: posicion.coords.longitude,
        }
        coordenadasActuales = coords
        geolocalizacionActiva = true
        estadoPermisoActual = 'granted'
        resolve(coords)
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          estadoPermisoActual = 'denied'
          geolocalizacionActiva = false
          coordenadasActuales = null
          for (const oyente of oyentesRevocacion) {
            oyente()
          }
        }
        reject(new GeolocationError(error.message, error.code))
      },
    )
  })
}

/**
 * Suscribe un callback que se ejecuta cuando el permiso de geolocalización cambia.
 */
export function onCambioPermiso(callback: PermissionStateListener): () => void {
  oyentesEstadoPermiso.add(callback)
  return () => {
    oyentesEstadoPermiso.delete(callback)
  }
}

/**
 * Suscribe un callback que se ejecuta específicamente cuando el permiso es revocado (CB-10).
 */
export function onRevocacionPermiso(callback: RevocationListener): () => void {
  oyentesRevocacion.add(callback)
  return () => {
    oyentesRevocacion.delete(callback)
  }
}

/**
 * Permite establecer manualmente el estado activo (por ejemplo al activar/desactivar toggle de filtro).
 */
export function setGeolocalizacionActiva(activa: boolean): void {
  geolocalizacionActiva = activa
  if (!activa) {
    coordenadasActuales = null
  }
}

export const geolocationClient = {
  estaSoportada,
  estaActiva,
  obtenerPosicionActual,
  obtenerUltimasCoordenadas,
  inicializarObservadorPermisos,
  onCambioPermiso,
  onRevocacionPermiso,
  setGeolocalizacionActiva,
}
