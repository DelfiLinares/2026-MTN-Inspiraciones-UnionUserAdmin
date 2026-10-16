import { PublicacionPerfil } from '../domain/PublicacionPerfil'
import { PublicacionRepository, ResultadoPublicacionesPaginado, ResultadoGuardadoPublicacion } from './ports/PublicacionRepository'

/**
 * Servicio PublicacionService — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-09, HU-10, HU-11, HU-12, HU-13, A5, A8)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 6, capa application)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (PublicacionPerfil entity, validaciones)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T048)
 *
 * Servicio de aplicación que orquesta casos de uso de publicaciones propias.
 * Implementa la lógica de dominio sin estar acoplado a la infraestructura HTTP.
 *
 * Responsabilidades:
 * 1. HU-09: Guardar publicación en carpeta (con validación de idempotencia, A8)
 * 2. HU-10: Quitar publicación de carpeta (sin eliminar del sistema)
 * 3. HU-11: Editar publicación propia (solo texto editable, A5)
 * 4. HU-12: Eliminar publicación propia (con advertencia)
 * 5. HU-13: Listar publicaciones de un usuario (públicas, paginadas)
 *
 * Validaciones de dominio:
 * - Texto: 1–2000 caracteres, no vacío (no editable después de imagen upload, A5)
 * - Imagen: Inmutable después de publicación (A5, solo lectura en edición)
 * - Autorización: Solo propietario puede editar/eliminar (403 backend)
 * - Idempotencia: Guardar post ya guardado retorna 200 (A8)
 * - Paginación: Server-side con limit/offset (A6)
 *
 * Inyección de dependencias:
 * - repository: PublicacionRepository — Implementación concreta (HTTP adapter, T049)
 *
 * Historias de usuario:
 * - HU-09: Guardar publicación en carpeta
 * - HU-10: Quitar publicación de carpeta
 * - HU-11: Editar publicación propia
 * - HU-12: Eliminar publicación propia
 * - HU-13: Visualizar publicaciones de un perfil
 *
 * Clarificaciones aplicadas:
 * - A5: Solo texto es editable; imagen es inmutable
 * - A8: Guardar es idempotente (200 si existe, 201 si es nueva)
 * - Autorización (403): Solo propietario puede editar/eliminar
 */
export class PublicacionService {
  constructor(private repository: PublicacionRepository) {}

  /**
   * HU-13: Listar publicaciones de un usuario.
   *
   * Caso de uso:
   * - Visitante accede a perfil propio o ajeno
   * - Sistema carga lista de publicaciones del usuario
   * - AC-13.1: Se muestran todas las publicaciones pertenecientes específicamente a esa persona
   * - AC-13.2: Las publicaciones se ubican debajo de la sección de carpetas
   * - AC-13.3: En un perfil ajeno, las publicaciones se muestran en modo consulta (sin edición)
   *
   * Validaciones de dominio:
   * - Publicaciones son visibles públicamente
   * - Paginación server-side: limit (1–100), offset (≥0)
   * - AC-13.1: Solo publicaciones propias del usuario
   *
   * Parámetros:
   * - usuarioId: string — ID del usuario cuyas publicaciones se listan
   * - limit: number — Cantidad de resultados por página (default 10)
   * - offset: number — Posición de inicio (default 0)
   *
   * Retorna:
   * - ResultadoPublicacionesPaginado con array de publicaciones
   *   - items: Array de PublicacionPerfil (hasta `limit` items)
   *   - total: Número total de publicaciones del usuario
   *   - limit: Cantidad retornada en esta página
   *   - offset: Posición de inicio de esta página
   *   - hasMore: true si hay más páginas
   *
   * Errores:
   * - 404: Usuario no encontrado o no disponible
   * - 400: Parámetros inválidos
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-13, AC-13.1–AC-13.3
   * - openapi.yaml GET /usuarios/{usuarioId}/publicaciones?limit={limit}&offset={offset}
   * - data-model.md PublicacionPerfil entity
   */
  async listarPublicaciones(
    usuarioId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<ResultadoPublicacionesPaginado> {
    if (!usuarioId || usuarioId.trim() === '') {
      throw new Error('ID de usuario requerido')
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit debe estar entre 1 y 100')
    }

    if (offset < 0) {
      throw new Error('Offset no puede ser negativo')
    }

    return this.repository.listarPublicaciones(usuarioId, limit, offset)
  }

  /**
   * HU-11: Editar una publicación propia.
   *
   * Caso de uso:
   * - Usuario autenticado edita una de sus publicaciones
   * - AC-11.1: La acción de editar solo está disponible sobre publicaciones propias
   * - AC-11.2: Editar requiere confirmación explícita antes de ejecutarse
   * - AC-11.3: Tras editar con éxito, el perfil refleja el contenido actualizado
   * - AC-11.4: Si la operación falla, se muestra un mensaje de error y el contenido editado no se pierde del formulario
   *
   * Validaciones de dominio:
   * - A5: Solo texto es editable; imagen es inmutable
   * - Texto: 1–2000 caracteres, no vacío
   * - Autorización: Solo propietario (403 si no es propietario)
   *
   * Parámetros:
   * - publicacionId: string — ID de la publicación a editar
   * - nuevoTexto: string — Nuevo contenido de texto (max 2000 chars)
   *
   * Retorna:
   * - PublicacionPerfil editada con timestamp actualizado
   *
   * Errores:
   * - 400: Texto inválido (vacío, > 2000 chars)
   * - 403: No es propietario (AC-11.1)
   * - 404: Publicación no encontrada
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-11, AC-11.1–AC-11.4, A5
   * - openapi.yaml PATCH /publicaciones/{publicacionId}
   * - domain/PublicacionPerfil.ts esTextoValido()
   */
  async editarPublicacion(publicacionId: string, nuevoTexto: string): Promise<PublicacionPerfil> {
    if (!publicacionId || publicacionId.trim() === '') {
      throw new Error('ID de publicación requerido')
    }

    if (!nuevoTexto || nuevoTexto.trim() === '') {
      throw new Error('El texto de la publicación no puede estar vacío')
    }

    if (nuevoTexto.length > 2000) {
      throw new Error('El texto de la publicación no puede superar 2000 caracteres')
    }

    // A5: Validar que el texto sea válido usando la regla de dominio
    const publicacionTemp = new PublicacionPerfil(
      publicacionId,
      '', // autorId no se valida aquí (backend valida autorización)
      '', // autorNombreUsuario no se valida aquí
      '', // imagenUrl no se edita (A5)
      nuevoTexto
    )

    if (!publicacionTemp.esTextoValido()) {
      throw new Error('Texto de publicación inválido')
    }

    // Delegar al repository (que incluye validación de autorización 403)
    return this.repository.editarPublicacion(publicacionId, nuevoTexto)
  }

  /**
   * HU-12: Eliminar una publicación propia.
   *
   * Caso de uso:
   * - Usuario autenticado elimina una de sus publicaciones
   * - AC-12.1: La acción de eliminar solo está disponible sobre publicaciones propias
   * - AC-12.2: Eliminar requiere confirmación explícita antes de ejecutarse
   * - AC-12.3: Tras eliminar con éxito, la publicación desaparece del perfil
   * - AC-12.4: La acción de eliminar se diferencia visualmente de las acciones de consulta
   *
   * Validaciones de dominio:
   * - Autorización: Solo propietario (403 si no es propietario)
   * - Existencia: Publicación debe existir (404)
   *
   * Parámetros:
   * - publicacionId: string — ID de la publicación a eliminar
   *
   * Retorna:
   * - void (200 OK si éxito)
   *
   * Errores:
   * - 403: No es propietario (AC-12.1)
   * - 404: Publicación no encontrada
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-12, AC-12.1–AC-12.4
   * - openapi.yaml DELETE /publicaciones/{publicacionId}
   * - domain/PublicacionPerfil.ts puedeSerEliminada()
   */
  async eliminarPublicacion(publicacionId: string): Promise<void> {
    if (!publicacionId || publicacionId.trim() === '') {
      throw new Error('ID de publicación requerido')
    }

    // Delegar al repository (que incluye validación de autorización 403)
    return this.repository.eliminarPublicacion(publicacionId)
  }

  /**
   * HU-09: Guardar una publicación en una carpeta.
   *
   * Caso de uso:
   * - Usuario autenticado guarda un post en una carpeta
   * - AC-09.1: Al guardar un post se puede seleccionar una carpeta existente
   * - AC-09.2: Al guardar un post se puede crear una carpeta nueva en el mismo flujo (delegado a HU-05)
   * - AC-09.3: La creación de carpeta dentro de este flujo aplica las mismas reglas que HU-05
   * - AC-09.4: Tras guardar con éxito, la interfaz refleja que el post quedó guardado
   * - AC-09.5: Si la operación falla, se muestra un mensaje de error y el post no queda marcado como guardado
   *
   * Validaciones de dominio:
   * - A8: Idempotente (retorna 200 si ya está guardada, 201 si es nueva)
   * - Autorización: Carpeta debe ser propia (403 si no es propietario)
   * - Existencia: Carpeta y publicación deben existir (404)
   * - Límite: No superar límite de posts en carpeta (507 si hay límite)
   *
   * Parámetros:
   * - carpetaId: string — ID de la carpeta destino
   * - publicacionId: string — ID de la publicación a guardar
   *
   * Retorna:
   * - ResultadoGuardadoPublicacion con:
   *   - esNueva: true si 201 (guardado por primera vez), false si 200 (ya estaba guardado)
   *   - carpetaId: ID de la carpeta
   *   - publicacionId: ID de la publicación
   *   - mensaje: Mensaje opcional de confirmación
   *
   * Errores:
   * - 400: Parámetros inválidos
   * - 403: Carpeta no es propia (AC-09.1)
   * - 404: Carpeta o publicación no encontrada
   * - 507: Límite de posts en carpeta superado
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-09, AC-09.1–AC-09.5, A8
   * - openapi.yaml POST /carpetas/{carpetaId}/posts
   * - data-model.md CarpetaPost entity
   */
  async guardarPublicacionEnCarpeta(
    carpetaId: string,
    publicacionId: string
  ): Promise<ResultadoGuardadoPublicacion> {
    if (!carpetaId || carpetaId.trim() === '') {
      throw new Error('ID de carpeta requerido')
    }

    if (!publicacionId || publicacionId.trim() === '') {
      throw new Error('ID de publicación requerido')
    }

    // A8: Delegar al repository (que maneja idempotencia: 200 si existe, 201 si es nueva)
    return this.repository.guardarPublicacionEnCarpeta(carpetaId, publicacionId)
  }

  /**
   * HU-10: Quitar una publicación de una carpeta.
   *
   * Caso de uso:
   * - Usuario autenticado quita un post de una de sus carpetas
   * - AC-10.1: Quitar un post de una carpeta NO elimina el post de la plataforma
   * - AC-10.2: Tras quitar con éxito, la cantidad de posts de esa carpeta se actualiza
   * - AC-10.3: La acción solo está disponible sobre carpetas propias
   *
   * Validaciones de dominio:
   * - Autorización: Carpeta debe ser propia (403 si no es propietario)
   * - Existencia: Carpeta y asociación deben existir (404)
   * - Invariante: El post NO se elimina de la plataforma (solo de la carpeta)
   *
   * Parámetros:
   * - carpetaId: string — ID de la carpeta
   * - publicacionId: string — ID de la publicación a quitar
   *
   * Retorna:
   * - void (200 OK si éxito)
   *
   * Errores:
   * - 403: Carpeta no es propia (AC-10.3)
   * - 404: Carpeta no encontrada, publicación no en carpeta
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-10, AC-10.1–AC-10.3
   * - openapi.yaml DELETE /carpetas/{carpetaId}/posts/{publicacionId}
   * - Invariante: El post sigue existiendo en la plataforma (AC-10.1)
   */
  async quitarPublicacionDeCarpeta(carpetaId: string, publicacionId: string): Promise<void> {
    if (!carpetaId || carpetaId.trim() === '') {
      throw new Error('ID de carpeta requerido')
    }

    if (!publicacionId || publicacionId.trim() === '') {
      throw new Error('ID de publicación requerido')
    }

    // AC-10.1: Solo se quita de la carpeta; el post NO se elimina de la plataforma
    return this.repository.quitarPublicacionDeCarpeta(carpetaId, publicacionId)
  }
}
