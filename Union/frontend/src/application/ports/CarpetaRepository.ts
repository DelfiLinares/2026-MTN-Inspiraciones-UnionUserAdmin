import { CarpetaPost } from '../../domain/CarpetaPost'
import { Publicacion } from '../../domain/Publicacion'

/**
 * `CarpetaRepository`: Puerto para operaciones de carpetas.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-05, HU-06, HU-07, HU-08, HU-09, HU-10)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 5, capa application)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (CarpetaPost entity)
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml (endpoints carpetas)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T036)
 *
 * Contrato para operaciones HTTP con carpetas de posts guardados.
 * Implementación concreta: HttpCarpetaRepository (T038).
 *
 * Responsabilidades:
 * 1. Listar carpetas públicas de un usuario (HU-08, paginado A6)
 * 2. Crear carpeta propia (HU-05, HU-09 con límite A3)
 * 3. Renombrar carpeta propia (HU-06, A3)
 * 4. Eliminar carpeta propia (HU-07, A7)
 * 5. Listar publicaciones guardadas en carpeta (HU-10)
 * 6. Guardar publicación en carpeta (HU-09, A8 idempotente)
 * 7. Quitar publicación de carpeta (HU-10)
 *
 * Manejo de errores:
 * - A3 (409): Nombre duplicado o inválido
 * - A6 (Paginación): Validar limit/offset
 * - A7 (Eliminación): Advertencias UI requeridas
 * - A8 (Idempotencia): GET 200 o 201 en guardar
 *
 * Historias de usuario:
 * - HU-05: Crear carpeta
 * - HU-06: Renombrar carpeta
 * - HU-07: Eliminar carpeta
 * - HU-08: Visualizar carpetas
 * - HU-09: Guardar post en carpeta
 * - HU-10: Quitar post de carpeta
 *
 * Clarificaciones:
 * - A3: Nombres de carpeta únicos por usuario
 * - A6: Paginación server-side
 * - A7: Advertencias de eliminación
 * - A8: Guardar es idempotente
 */

/**
 * DTO para respuesta de paginación de carpetas.
 */
export interface ResultadoCarpetasPaginado {
  carpetas: CarpetaPost[]
  total: number
  limit: number
  offset: number
}

/**
 * DTO para respuesta de paginación de publicaciones.
 */
export interface ResultadoPublicacionesPaginado {
  publicaciones: Publicacion[]
  total: number
  limit: number
  offset: number
}

/**
 * DTO para resultado de guardar post en carpeta.
 * A8: Indica si es nueva (201) o ya existía (200).
 */
export interface ResultadoGuardadoPost {
  esNueva: boolean // true si 201 (creada), false si 200 (ya existía)
  carpetaId: string
  publicacionId: string
  mensaje?: string
}

/**
 * Interfaz del puerto CarpetaRepository.
 * Define contrato para todas las operaciones de carpetas.
 */
export interface CarpetaRepository {
  /**
   * HU-08: Listar carpetas públicas de un usuario.
   * Endpoint: GET /usuarios/{usuarioId}/carpetas?limit={limit}&offset={offset}
   * A6: Paginación server-side.
   * A10: Valida disponibilidad del usuario (404/403 si no está ACTIVO).
   *
   * @param usuarioId ID del usuario cuyas carpetas se listan
   * @param limit Cantidad de resultados por página (A6)
   * @param offset Posición de inicio (A6)
   * @returns Resultado paginado con carpetas
   * @throws Error si usuarioId no existe o no está disponible (A10)
   */
  listarCarpetas(
    usuarioId: string,
    limit: number,
    offset: number
  ): Promise<ResultadoCarpetasPaginado>

  /**
   * HU-05: Crear carpeta propia.
   * Endpoint: POST /carpetas
   * A3: Nombre único por usuario, validación 1–15 caracteres.
   * A6: Límite de 50 carpetas (409 LIMITE_CARPETAS_ALCANZADO si se excede).
   *
   * @param nombre Nombre de la carpeta (1–15 caracteres, permite espacios)
   * @returns Carpeta creada
   * @throws Error si nombre inválido (400) o límite alcanzado (409 A3/A6)
   */
  crearCarpeta(nombre: string): Promise<CarpetaPost>

  /**
   * HU-06: Renombrar carpeta propia.
   * Endpoint: PATCH /carpetas/{carpetaId}
   * A3: Nombre único por usuario, validación 1–15 caracteres.
   * AC-06.4: No altera cantidad ni contenido de posts.
   *
   * @param carpetaId ID de la carpeta a renombrar
   * @param nombre Nuevo nombre (1–15 caracteres, permite espacios)
   * @returns Carpeta renombrada
   * @throws Error si nombre inválido (400), no es propietario (403), o no existe (404)
   */
  renombrarCarpeta(carpetaId: string, nombre: string): Promise<CarpetaPost>

  /**
   * HU-07: Eliminar carpeta propia.
   * Endpoint: DELETE /carpetas/{carpetaId}
   * A7: Elimina carpeta y asociaciones; publicaciones originales NO se eliminan.
   * AC-07.5: Libera cupo respecto del límite de 50.
   *
   * @param carpetaId ID de la carpeta a eliminar
   * @returns void (204 No Content)
   * @throws Error si no es propietario (403) o no existe (404)
   */
  eliminarCarpeta(carpetaId: string): Promise<void>

  /**
   * HU-10: Listar publicaciones guardadas en una carpeta.
   * Endpoint: GET /carpetas/{carpetaId}/posts?limit={limit}&offset={offset}
   * A6: Paginación server-side.
   * Necesario para quitar un post desde el detalle de carpeta.
   *
   * @param carpetaId ID de la carpeta
   * @param limit Cantidad de resultados por página (A6)
   * @param offset Posición de inicio (A6)
   * @returns Resultado paginado con publicaciones guardadas
   * @throws Error si carpeta no existe (404)
   */
  listarPostsDeCarpeta(
    carpetaId: string,
    limit: number,
    offset: number
  ): Promise<ResultadoPublicacionesPaginado>

  /**
   * HU-09: Guardar publicación en carpeta propia.
   * Endpoint: POST /carpetas/{carpetaId}/posts
   * A8: Idempotente (200 si ya estaba guardada, 201 si es nueva).
   * Puede crear carpeta nueva en el mismo flujo (AC-09.2).
   *
   * @param carpetaId ID de la carpeta donde guardar
   * @param publicacionId ID de la publicación a guardar
   * @returns Resultado con esNueva (true si 201, false si 200)
   * @throws Error si carpeta no existe (404), no es propietario (403)
   */
  guardarPostEnCarpeta(
    carpetaId: string,
    publicacionId: string
  ): Promise<ResultadoGuardadoPost>

  /**
   * HU-10: Quitar publicación de carpeta propia.
   * Endpoint: DELETE /carpetas/{carpetaId}/posts/{publicacionId}
   * AC-10.1: Publicación original NO se elimina de la plataforma.
   *
   * @param carpetaId ID de la carpeta
   * @param publicacionId ID de la publicación a quitar
   * @returns void (204 No Content)
   * @throws Error si carpeta no existe (404), no es propietario (403)
   */
  quitarPostDeCarpeta(
    carpetaId: string,
    publicacionId: string
  ): Promise<void>
}
