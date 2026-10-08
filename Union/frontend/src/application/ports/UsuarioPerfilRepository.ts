import { Usuario } from '../../domain/Usuario'
import { ActualizarPerfilPayload } from '../dto/ActualizarPerfilPayload'

/**
 * Puerto UsuarioPerfilRepository — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml (paths: /auth/me, /usuarios/{id}, /perfil, /perfil/foto)
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-01, HU-02, HU-03)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 4, capa application)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (DTOs: ActualizarPerfilPayload, SubirFotoPayload)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T029)
 *
 * Contrato (puerto) para operaciones de lectura/escritura sobre el perfil de usuarios.
 * Define los casos de uso de la aplicación sin acoplamiento a HTTP o bases de datos.
 *
 * Responsabilidades:
 * 1. Obtener usuario autenticado actual (HU-01, HU-03)
 * 2. Obtener perfil de cualquier usuario por ID (propio o ajeno) (HU-01, HU-03)
 * 3. Actualizar datos del perfil propio (HU-02)
 * 4. Cambiar foto de perfil propia (HU-02)
 *
 * Implementación:
 * - T031: HTTP adapter que mapea a endpoints de openapi.yaml
 * - Respuestas con errores HTTP: 400 (validación), 401 (no autenticado), 403 (no autorizado), 404 (no encontrado), 409 (conflicto - A1)
 *
 * Historias de usuario:
 * - HU-01: Visualizar perfil propio
 * - HU-02: Editar perfil propio
 * - HU-03: Visualizar perfil ajeno (con A10: solo si está ACTIVO)
 *
 * Clarificaciones:
 * - A1: Unicidad de nombre de usuario (409 si ya existe)
 * - A2: Restricciones de foto (formatos: JPG/PNG/WebP, máximo 5 MB)
 * - A10: Perfil BANEADO/ELIMINADO no visible a terceros (404/403)
 */
export interface UsuarioPerfilRepository {
  /**
   * Obtener usuario autenticado actual.
   *
   * Endpoint: GET /auth/me
   * Responsabilidad: Resolver "perfil propio" al acceder a `/perfil` sin parámetro :id
   *
   * Retorna:
   * - Usuario autenticado actual
   *
   * Errores:
   * - 401: No autenticado (sin token o token expirado)
   *
   * Historias: HU-01
   * Referencia: spec.md AC-01.1, AC-01.2, AC-01.3
   */
  obtenerUsuarioActual(): Promise<Usuario>

  /**
   * Obtener perfil de un usuario (propio o ajeno).
   *
   * Endpoint: GET /usuarios/{usuarioId}
   * Responsabilidad: Cargar datos del usuario para `/perfil/:id` o perfil propio si se necesita refresh
   *
   * Parámetros:
   * - usuarioId: string — ID del usuario a consultar
   *
   * Retorna:
   * - Usuario con datos públicos (foto, username, sobreMi, descripcion, etc.)
   *
   * Errores:
   * - 401: No autenticado
   * - 403: Perfil no disponible (usuario BANEADO/ELIMINADO, A10)
   * - 404: Usuario no encontrado o no disponible (A10)
   *
   * Historias: HU-01, HU-03
   * Referencia: spec.md AC-01.1, AC-03.1, A10
   */
  obtenerPerfil(usuarioId: string): Promise<Usuario>

  /**
   * Actualizar datos del perfil propio (sin cambiar foto).
   *
   * Endpoint: PATCH /perfil
   * Responsabilidad: Aplicar cambios a username, sobreMi, descripcion (foto se maneja en endpoint separado, A2)
   *
   * Parámetros:
   * - payload: ActualizarPerfilPayload — Datos a actualizar (contiene validaciones)
   *
   * Retorna:
   * - Usuario actualizado con los nuevos datos
   *
   * Errores:
   * - 400: Validación fallida (username inválido, campos fuera de límite, etc.)
   * - 401: No autenticado
   * - 409: Conflicto — username ya existe (A1)
   *
   * Validaciones client-side (AC-02.2..AC-02.5):
   * - Username: [A-Za-z0-9_.], 1-10 caracteres
   * - SobreMi: ≤80 caracteres, permite espacios
   * - Descripcion: ≤200 caracteres, permite espacios
   * - Se preservan en el formulario si falla (AC-02.8)
   *
   * Historias: HU-02
   * Referencia: spec.md AC-02.1..AC-02.8, A1
   */
  actualizarPerfil(payload: ActualizarPerfilPayload): Promise<Usuario>

  /**
   * Cambiar foto de perfil propia.
   *
   * Endpoint: POST /perfil/foto
   * Responsabilidad: Subir archivo de foto con validaciones A2
   * Content-Type: multipart/form-data
   *
   * Parámetros:
   * - fotoData: FormData — Objeto FormData con archivo a subir (contiene validaciones en SubirFotoPayload.ts)
   *
   * Retorna:
   * - Usuario actualizado con nueva URL de foto
   *
   * Errores:
   * - 400: Validación fallida (formato/tamaño inválido, etc.)
   * - 401: No autenticado
   * - 413: Payload too large (archivo > 5 MB, A2)
   * - 415: Unsupported media type (formato no soportado, A2)
   *
   * Validaciones client-side (A2):
   * - Formatos: JPG, JPEG, PNG, WebP
   * - Tamaño máximo: 5 MB
   * - Backend valida de forma autoritativa
   * - Validación preservada en UI si falla
   *
   * Historias: HU-02
   * Referencia: spec.md AC-02.1, A2
   */
  cambiarFotoPerfil(fotoData: FormData): Promise<Usuario>
}
