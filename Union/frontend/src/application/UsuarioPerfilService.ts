import { Usuario } from '../domain/Usuario'
import { ActualizarPerfilPayload } from './dto/ActualizarPerfilPayload'
import { ResultadoValidacion } from './dto/ResultadoValidacion'
import { UsuarioPerfilRepository } from './ports/UsuarioPerfilRepository'

/**
 * Servicio UsuarioPerfilService — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-01, HU-02, HU-03)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 4, capa application)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Entidades, DTOs, Value Objects)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T030)
 *
 * Servicio de aplicación que orquesta casos de uso de perfil de usuario.
 * Implementa la lógica de dominio sin estar acoplado a la infraestructura HTTP.
 *
 * Responsabilidades:
 * 1. HU-01: Obtener perfil propio del usuario autenticado
 * 2. HU-02: Editar perfil propio (username, sobreMi, descripcion, foto)
 * 3. HU-03: Obtener perfil ajeno (con validaciones de disponibilidad A10)
 *
 * Validaciones de dominio:
 * - Username: [A-Za-z0-9_.], 1-10 caracteres, único (A1)
 * - SobreMi: ≤80 caracteres, permite espacios
 * - Descripcion: ≤200 caracteres, permite espacios
 * - Foto: JPG/PNG/WebP, ≤5 MB (A2)
 * - Disponibilidad: Perfil ACTIVO es visible a terceros, BANEADO/ELIMINADO no (A10)
 *
 * Inyección de dependencias:
 * - repository: UsuarioPerfilRepository — Implementación concreta (HTTP adapter, T031)
 *
 * Historias de usuario:
 * - HU-01: Visualizar perfil propio
 * - HU-02: Editar perfil propio
 * - HU-03: Visualizar perfil ajeno
 *
 * Clarificaciones:
 * - A1: Unicidad de username (409 si ya existe)
 * - A2: Restricciones de foto (formatos, tamaño)
 * - A10: Perfil BANEADO/ELIMINADO no visible a terceros
 */
export class UsuarioPerfilService {
  constructor(private repository: UsuarioPerfilRepository) {}

  /**
   * HU-01: Obtener perfil propio del usuario autenticado.
   *
   * Caso de uso:
   * - Usuario accede a ruta `/perfil` (sin parámetro :id)
   * - Sistema obtiene datos del usuario autenticado actual
   * - Mostramos perfil propio (PerfilPropio.tsx)
   *
   * Validaciones de dominio:
   * - Perfil debe estar en estado ACTIVO (por ser usuario autenticado)
   * - Usuario debe estar autenticado (401 si no)
   *
   * Retorna:
   * - Usuario con todos sus datos (privados + públicos)
   *
   * Errores:
   * - 401: No autenticado (sin token)
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-01, AC-01.1–AC-01.5
   * - openapi.yaml GET /auth/me
   */
  async obtenerPerfilPropio(): Promise<Usuario> {
    // Delega al repository; validaciones en backend
    return this.repository.obtenerUsuarioActual()
  }

  /**
   * HU-03: Obtener perfil ajeno con validaciones de disponibilidad (A10).
   *
   * Caso de uso:
   * - Usuario accede a ruta `/perfil/:id` (con parámetro :id)
   * - Sistema obtiene datos del usuario con ID :id
   * - Validamos que esté ACTIVO; si BANEADO/ELIMINADO, no es visible (A10)
   * - Mostramos perfil ajeno (PerfilAjeno.tsx) o ProfileNotFoundView (T027)
   *
   * Validaciones de dominio (A10):
   * - Perfil debe estar ACTIVO para ser visible a terceros
   * - Si BANEADO o ELIMINADO: Lanzar error (backend responde 403/404)
   *
   * Parámetros:
   * - usuarioId: string — ID del usuario a consultar
   *
   * Retorna:
   * - Usuario con datos públicos si está ACTIVO
   * - Error si está BANEADO/ELIMINADO
   *
   * Errores:
   * - 401: No autenticado
   * - 403: Perfil no disponible (BANEADO, A10)
   * - 404: Usuario no encontrado o no disponible (ELIMINADO, A10)
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-03, AC-03.1–AC-03.5, A10
   * - openapi.yaml GET /usuarios/{usuarioId}
   */
  async obtenerPerfilAjeno(usuarioId: string): Promise<Usuario> {
    // Valida que usuarioId sea proporcionado
    if (!usuarioId || usuarioId.trim().length === 0) {
      throw new Error('ID de usuario es requerido')
    }

    // Delega al repository; backend valida A10 (403/404 si no está ACTIVO)
    const usuario = await this.repository.obtenerPerfil(usuarioId)

    // Validación adicional client-side (A10): si por alguna razón el backend
    // no valida, el frontend rechaza perfiles no disponibles
    if (!usuario.estaDisponible()) {
      throw new Error(`Perfil de usuario ${usuarioId} no está disponible`)
    }

    return usuario
  }

  /**
   * HU-02: Editar perfil propio (datos sin foto).
   *
   * Caso de uso:
   * - Usuario edita nombreUsuario, sobreMi, descripcion en EditarPerfilForm.tsx
   * - Sistema valida campos según AC-02.2..AC-02.5
   * - Si validación falla: Retorna errores, preserva datos en formulario (AC-02.8)
   * - Si validación pasa: Envía al backend
   * - Backend responde 200 (éxito) o 409 (username existe, A1)
   * - Mostramos perfil actualizado (AC-02.3)
   *
   * Validaciones de dominio:
   * - NombreUsuario: [A-Za-z0-9_.], 1-10 caracteres (AC-02.2–AC-02.3)
   * - SobreMi: ≤80 caracteres, permite espacios (AC-02.4)
   * - Descripcion: ≤200 caracteres, permite espacios (AC-02.5)
   * - Confirmación de cambio de username requiere modal (AC-02.6)
   *
   * Parámetros:
   * - payload: ActualizarPerfilPayload — Datos a actualizar
   *   - nombreUsuario?: string
   *   - sobreMi?: string
   *   - descripcion?: string
   *
   * Retorna:
   * - Usuario actualizado si éxito
   * - Error con detalles si validación falla (AC-02.7)
   *
   * Errores:
   * - 400: Validación fallida
   * - 401: No autenticado
   * - 409: Username ya existe (A1) — El usuario debe preservar datos (AC-02.8)
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-02, AC-02.1–AC-02.8, A1
   * - openapi.yaml PATCH /perfil
   * - data-model.md ActualizarPerfilPayload, Usuario validaciones
   */
  async actualizarPerfil(payload: ActualizarPerfilPayload): Promise<Usuario> {
    // Crear usuario temporal para validaciones con los datos del payload
    const usuarioTemp = new Usuario(
      '', // id no importa para validación
      payload.nombreUsuario || '', // usar nombreUsuario del payload
      undefined, // foto no se actualiza aquí
      payload.sobreMi || '', // sobreMi
      payload.descripcion || '', // descripcion
    )

    // AC-02.7: Validar cada campo según reglas de dominio
    const errores: string[] = []

    if (payload.nombreUsuario) {
      if (payload.nombreUsuario.length < 1 || payload.nombreUsuario.length > 10) {
        errores.push('El nombre de usuario debe tener entre 1 y 10 caracteres')
      }
      if (!/^[a-zA-Z0-9_.]+$/.test(payload.nombreUsuario)) {
        errores.push('El nombre de usuario solo puede contener letras, números, punto y guion bajo')
      }
    }

    if (payload.sobreMi && payload.sobreMi.length > 80) {
      errores.push('El "sobre mí" no debe superar los 80 caracteres')
    }

    if (payload.descripcion && payload.descripcion.length > 200) {
      errores.push('La descripción no debe superar los 200 caracteres')
    }

    // Si hay errores, lanzar excepción con detalles
    if (errores.length > 0) {
      const error = new Error(errores.join('; '))
      ;(error as any).detalles = {
        esValido: false,
        errores,
      }
      throw error
    }

    // Delega al repository; backend valida A1 (409 si username existe)
    // Backend también puede retornar 400 si validación adicional falla
    return this.repository.actualizarPerfil(payload)
  }

  /**
   * HU-02: Cambiar foto de perfil propia.
   *
   * Caso de uso:
   * - Usuario sube archivo en PhotoUploadField.tsx
   * - Sistema valida formato y tamaño (A2) client-side
   * - Si validación falla: Muestra error, usuario puede reintentar
   * - Si validación pasa: Envía multipart/form-data al backend
   * - Backend responde 200 (éxito) o 400/413/415 (error)
   * - Mostramos perfil con nueva foto (AC-02.3)
   *
   * Validaciones de dominio (A2):
   * - Formatos: JPG, JPEG, PNG, WebP
   * - Tamaño máximo: 5 MB
   * - Validación client-side en PhotoUploadField (SubirFotoPayload.validarArchivo)
   * - Backend es authoritative (A2)
   *
   * Parámetros:
   * - fotoFile: File — Archivo de foto a subir
   *
   * Retorna:
   * - Usuario actualizado con nueva URL de foto
   *
   * Errores:
   * - 400: Validación fallida (formato/tamaño inválido)
   * - 401: No autenticado
   * - 413: Archivo demasiado grande (> 5 MB)
   * - 415: Formato no soportado
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-02, AC-02.1, A2
   * - openapi.yaml POST /perfil/foto
   * - data-model.md SubirFotoPayload (validaciones)
   */
  async cambiarFotoPerfil(fotoFile: File): Promise<Usuario> {
    // Crear FormData para upload multipart
    const formData = new FormData()
    formData.append('foto', fotoFile)

    // Delega al repository; backend valida A2 (400/413/415 si inválido)
    return this.repository.cambiarFotoPerfil(formData)
  }
}
