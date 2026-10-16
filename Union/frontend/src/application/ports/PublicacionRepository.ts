import { PublicacionPerfil } from '../../domain/PublicacionPerfil'

/**
 * `PublicacionRepository`: Puerto para operaciones de publicaciones.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-09, HU-10, HU-11, HU-12, HU-13, A5, A8)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 6, capa application)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (PublicacionPerfil entity)
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml (endpoints publicaciones)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T047)
 *
 * Contrato para operaciones HTTP con publicaciones propias.
 * Implementación concreta: HttpPublicacionRepository (T049).
 *
 * Responsabilidades:
 * 1. Listar publicaciones de un usuario (HU-13, paginado A6)
 * 2. Editar publicación propia (HU-11, A5: solo texto editable)
 * 3. Eliminar publicación propia (HU-12)
 * 4. Guardar publicación en carpeta (HU-09, A8: idempotente)
 * 5. Quitar publicación de carpeta (HU-10)
 *
 * Manejo de errores:
 * - A5 (HU-11): Solo texto es editable; imagen es inmutable
 * - A8 (HU-09): Guardar es idempotente (200 si ya existe, 201 si nueva)
 * - Autorización (403): Solo propietario puede editar/eliminar
 *
 * Historias de usuario:
 * - HU-09: Guardar publicación en carpeta
 * - HU-10: Quitar publicación de carpeta
 * - HU-11: Editar publicación propia
 * - HU-12: Eliminar publicación propia
 * - HU-13: Visualizar publicaciones de un perfil
 *
 * Clarificaciones:
 * - A5: Solo texto es editable; imagen es inmutable
 * - A8: Guardar post en carpeta es idempotente
 */

/**
 * DTO para respuesta de paginación de publicaciones.
 */
export interface ResultadoPublicacionesPaginado {
  items: PublicacionPerfil[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

/**
 * DTO para resultado de guardar publicación en carpeta.
 * A8: Indica si es nueva (201) o ya existía (200).
 */
export interface ResultadoGuardadoPublicacion {
  esNueva: boolean // true si 201 (creada), false si 200 (ya existía)
  carpetaId: string
  publicacionId: string
  mensaje?: string
}

/**
 * DTO para resultado de edición de publicación.
 * A5: Solo texto es editable.
 */
export interface ResultadoEdicionPublicacion {
  id: string
  autorId: string
  imagenUrl: string // Inmutable (A5)
  texto: string // Actualizado (A5)
  fechaActualizacion: Date
}

/**
 * Interfaz del puerto PublicacionRepository.
 * Define contrato para todas las operaciones de publicaciones.
 */
export interface PublicacionRepository {
  /**
   * HU-13: Listar publicaciones de un usuario.
   * Endpoint: GET /usuarios/{usuarioId}/publicaciones?limit={limit}&offset={offset}
   * A6: Paginación server-side.
   * AC-13.1: Se muestran todas las publicaciones pertenecientes específicamente a esa persona.
   *
   * @param usuarioId ID del usuario cuyas publicaciones se listan
   * @param limit Cantidad de resultados por página (A6)
   * @param offset Posición de inicio (A6)
   * @returns Resultado paginado con publicaciones
   * @throws Error si usuarioId no existe o no está disponible
   */
  listarPublicaciones(
    usuarioId: string,
    limit: number,
    offset: number
  ): Promise<ResultadoPublicacionesPaginado>

  /**
   * HU-11: Editar una publicación propia.
   * Endpoint: PATCH /publicaciones/{publicacionId}
   * A5: Solo texto es editable; imagen es inmutable.
   * AC-11.1: La acción de editar solo está disponible sobre publicaciones propias.
   * AC-11.3: Tras editar con éxito, el perfil refleja el contenido actualizado.
   *
   * @param publicacionId ID de la publicación a editar
   * @param texto Nuevo texto (max 2000 chars per domain rule)
   * @returns Publicación editada con timestamp actualizado
   * @throws Error si no es propietario (403), si no existe (404), o si texto es inválido (400)
   */
  editarPublicacion(
    publicacionId: string,
    texto: string
  ): Promise<PublicacionPerfil>

  /**
   * HU-12: Eliminar una publicación propia.
   * Endpoint: DELETE /publicaciones/{publicacionId}
   * AC-12.1: La acción de eliminar solo está disponible sobre publicaciones propias.
   * AC-12.3: Tras eliminar con éxito, la publicación desaparece del perfil.
   *
   * @param publicacionId ID de la publicación a eliminar
   * @returns void (200 OK si éxito)
   * @throws Error si no es propietario (403), si no existe (404)
   */
  eliminarPublicacion(publicacionId: string): Promise<void>

  /**
   * HU-09: Guardar una publicación en una carpeta.
   * Endpoint: POST /carpetas/{carpetaId}/posts (con publicacionId en body)
   * A8: Idempotente (retorna 200 si ya está guardada, 201 si es nueva).
   * AC-09.1: Al guardar un post se puede seleccionar una carpeta existente.
   * AC-09.4: Tras guardar con éxito, la interfaz refleja que el post quedó guardado.
   *
   * @param carpetaId ID de la carpeta destino
   * @param publicacionId ID de la publicación a guardar
   * @returns Resultado indicando si es nueva (201) o ya existía (200)
   * @throws Error si carpeta no existe (404), no es propia (403), o si supera límite (507)
   */
  guardarPublicacionEnCarpeta(
    carpetaId: string,
    publicacionId: string
  ): Promise<ResultadoGuardadoPublicacion>

  /**
   * HU-10: Quitar una publicación de una carpeta.
   * Endpoint: DELETE /carpetas/{carpetaId}/posts/{publicacionId}
   * AC-10.1: Quitar un post de una carpeta NO elimina el post de la plataforma.
   * AC-10.2: Tras quitar con éxito, la cantidad de posts de esa carpeta se actualiza.
   * AC-10.3: La acción solo está disponible sobre carpetas propias.
   *
   * @param carpetaId ID de la carpeta
   * @param publicacionId ID de la publicación a quitar
   * @returns void (200 OK si éxito)
   * @throws Error si carpeta no existe (404), no es propia (403), o si post no está en carpeta (404)
   */
  quitarPublicacionDeCarpeta(
    carpetaId: string,
    publicacionId: string
  ): Promise<void>
}
