import { CarpetaPost } from '../domain/CarpetaPost'
import { Publicacion } from '../domain/Publicacion'
import { CarpetaRepository } from './ports/CarpetaRepository'
import {
  ResultadoCarpetasPaginado,
  ResultadoPublicacionesPaginado,
  ResultadoGuardadoPost,
} from './ports/CarpetaRepository'

/**
 * Servicio CarpetaService — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-05, HU-06, HU-07, HU-08, HU-09, HU-10)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 3, capa application)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (CarpetaPost entity, validaciones)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T037)
 *
 * Servicio de aplicación que orquesta casos de uso de carpetas de posts guardados.
 * Implementa la lógica de dominio sin estar acoplado a la infraestructura HTTP.
 *
 * Responsabilidades:
 * 1. HU-05: Crear carpeta propia (con validaciones de nombre y límite)
 * 2. HU-06: Renombrar carpeta propia (con confirmación implícita)
 * 3. HU-07: Eliminar carpeta propia (con advertencia sobre pérdida de contenido)
 * 4. HU-08: Listar carpetas de cualquier usuario (públicas, paginadas)
 * 5. HU-09: Guardar publicación en carpeta (idempotente, A8)
 * 6. HU-10: Quitar publicación de carpeta
 *
 * Validaciones de dominio:
 * - Nombre de carpeta: 1–15 caracteres, permite espacios (no vacío)
 * - Unicidad: Nombres únicos por usuario (A3, backend valida 409)
 * - Límite: Máximo 50 carpetas por usuario (A6)
 * - Paginación: Server-side con limit/offset (A6)
 * - Idempotencia: Guardar post ya guardado retorna 200 (A8)
 * - Privacidad: Carpetas públicas sin estado de privacidad (A9)
 *
 * Inyección de dependencias:
 * - repository: CarpetaRepository — Implementación concreta (HTTP adapter, T038)
 *
 * Historias de usuario:
 * - HU-05: Crear carpeta
 * - HU-06: Renombrar carpeta
 * - HU-07: Eliminar carpeta
 * - HU-08: Listar carpetas
 * - HU-09: Guardar post en carpeta
 * - HU-10: Quitar post de carpeta
 *
 * Clarificaciones aplicadas:
 * - A3: Nombres únicos por usuario (backend retorna 409 Conflict)
 * - A6: Paginación server-side con limit/offset
 * - A7: Eliminar con advertencia (frontend muestra confirmación clara)
 * - A8: Guardar es idempotente (200 si existe, 201 si es nueva)
 * - A9: Carpetas públicas sin privacidad
 */
export class CarpetaService {
  constructor(private repository: CarpetaRepository) {}

  /**
   * HU-08: Listar carpetas públicas de un usuario.
   *
   * Caso de uso:
   * - Usuario accede a perfil propio o ajeno
   * - Sistema carga lista de carpetas con paginación (A6)
   * - Cada carpeta muestra nombre y cantidad de posts (AC-08.2)
   * - RF-24: Soporta hasta 50 carpetas con scroll o paginación (A6)
   *
   * Validaciones de dominio:
   * - Carpetas son visibles públicamente (A9)
   * - Paginación server-side: limit (1–50), offset (≥0)
   * - Total nunca supera 50 (RF-22)
   *
   * Parámetros:
   * - usuarioId: string — ID del usuario cuyas carpetas se listan
   * - limit: number — Cantidad de resultados por página (1–50, default 10)
   * - offset: number — Posición de inicio (≥0, default 0)
   *
   * Retorna:
   * - ResultadoCarpetasPaginado con array de carpetas
   *   - items: Array de CarpetaPost (hasta `limit` items)
   *   - total: Número total de carpetas del usuario (≤50)
   *   - limit: Cantidad retornada en esta página
   *   - offset: Posición de inicio de esta página
   *   - hasMore: true si hay más páginas
   *
   * Errores:
   * - 401: No autenticado
   * - 403: Sin permiso para listar (por usuario/rol) — A10
   * - 404: Usuario no encontrado o no disponible (ELIMINADO/BANEADO, A10)
   * - 400: Parámetros inválidos (limit fuera de rango, offset negativo)
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-08, AC-08.1–AC-08.3, A6, A9
   * - openapi.yaml GET /usuarios/{usuarioId}/carpetas?limit={limit}&offset={offset}
   * - data-model.md CarpetaPost entity
   */
  async listarCarpetas(
    usuarioId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<ResultadoCarpetasPaginado> {
    // Validaciones básicas de parámetros
    if (!usuarioId || usuarioId.trim().length === 0) {
      throw new Error('ID de usuario es requerido')
    }

    if (limit < 1 || limit > 50) {
      throw new Error('Limit debe estar entre 1 y 50')
    }

    if (offset < 0) {
      throw new Error('Offset debe ser mayor o igual a 0')
    }

    // Delega al repository; backend valida A6, A9, A10
    return this.repository.listarCarpetas(usuarioId, limit, offset)
  }

  /**
   * HU-05: Crear carpeta propia.
   *
   * Caso de uso:
   * - Usuario hace clic en "Crear carpeta" en su perfil
   * - Se abre diálogo CreateCarpetaDialog (T039) con campo de nombre
   * - Ingresa nombre y confirma
   * - Sistema crea carpeta (AC-05.5)
   * - RF-22/AC-05.4: Si ya tiene 50 carpetas, la acción está impedida
   *
   * Validaciones de dominio:
   * - Nombre: 1–15 caracteres, permite espacios (AC-05.2, RF-21)
   * - Unicidad: Nombre único por usuario (A3, backend retorna 409)
   * - Límite: Máximo 50 carpetas (AC-05.4, RF-22)
   *
   * Parámetros:
   * - nombre: string — Nombre de la carpeta (1–15 caracteres)
   *
   * Retorna:
   * - CarpetaPost creada (con id, usuarioId, nombre, fechaCreacion, postCount=0)
   *
   * Errores:
   * - 400: Nombre vacío o fuera de límite (AC-05.3)
   * - 401: No autenticado
   * - 409: Nombre duplicado (A3) o límite alcanzado (AC-05.4, RF-22)
   *   - Backend distingue entre:
   *     - NOMBRE_DUPLICADO: nombre ya existe para este usuario
   *     - LIMITE_CARPETAS_ALCANZADO: ya tiene 50 carpetas
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-05, AC-05.1–AC-05.5, A3, RF-22
   * - openapi.yaml POST /carpetas
   * - data-model.md CarpetaPost.esNombreValido()
   */
  async crearCarpeta(nombre: string): Promise<CarpetaPost> {
    // AC-05.3: Validar nombre (dominio)
    const errorValidacion = this.validarNombreCarpeta(nombre)
    if (errorValidacion) {
      throw new Error(errorValidacion)
    }

    // Delega al repository; backend valida A3 (409 si duplicado o límite)
    try {
      return await this.repository.crearCarpeta(nombre)
    } catch (error) {
      // Re-lanzar errores del repository (409, 400, etc.)
      throw error
    }
  }

  /**
   * HU-06: Renombrar carpeta propia.
   *
   * Caso de uso:
   * - Usuario hace clic en "Renombrar" en una carpeta
   * - Se abre diálogo RenameCarpetaDialog (T040) con nombre actual
   * - Modifica nombre y confirma
   * - Sistema renombra carpeta (AC-06.3)
   * - AC-06.4: No altera posts guardados ni su cantidad
   *
   * Validaciones de dominio:
   * - Nombre: 1–15 caracteres, permite espacios (AC-06.1, RF-21)
   * - Unicidad: Nuevo nombre único para este usuario (A3)
   * - Confirmación: Requiere confirmación explícita del usuario (AC-06.2)
   *   - (La confirmación se maneja en la UI; aquí asumimos que ya la dió)
   *
   * Parámetros:
   * - carpetaId: string — ID de la carpeta a renombrar
   * - nombre: string — Nuevo nombre (1–15 caracteres)
   *
   * Retorna:
   * - CarpetaPost con nuevo nombre actualizado
   *
   * Errores:
   * - 400: Nombre vacío o fuera de límite
   * - 401: No autenticado
   * - 403: No es propietario (AC-06.5)
   * - 404: Carpeta no existe
   * - 409: Nuevo nombre duplicado para este usuario (A3)
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-06, AC-06.1–AC-06.5, A3
   * - openapi.yaml PATCH /carpetas/{carpetaId}
   * - data-model.md CarpetaPost.esNombreValido()
   */
  async renombrarCarpeta(carpetaId: string, nombre: string): Promise<CarpetaPost> {
    // Validación de parámetros
    if (!carpetaId || carpetaId.trim().length === 0) {
      throw new Error('ID de carpeta es requerido')
    }

    // AC-06.1: Validar nombre (dominio)
    const errorValidacion = this.validarNombreCarpeta(nombre)
    if (errorValidacion) {
      throw new Error(errorValidacion)
    }

    // Delega al repository; backend valida AC-06.5 (403), A3 (409)
    return this.repository.renombrarCarpeta(carpetaId, nombre)
  }

  /**
   * HU-07: Eliminar carpeta propia.
   *
   * Caso de uso:
   * - Usuario hace clic en "Eliminar" en una carpeta
   * - Se abre diálogo ConfirmDeleteCarpetaDialog (T041) con advertencias
   *   - AC-07.2: Advierte que el contenido guardado se perderá
   *   - AC-07.3: Aclara que posts originales NO se eliminan
   * - Usuario confirma (confirmación explícita, AC-07.1)
   * - Sistema elimina carpeta (AC-07.4)
   * - AC-07.5: Libera cupo respecto del límite de 50
   *
   * Validaciones de dominio:
   * - Confirmación: Requiere confirmación explícita (AC-07.1)
   *   - (La confirmación se maneja en la UI; aquí asumimos que ya la dió)
   * - A7: Puede eliminarse con contenido (posts dentro)
   *
   * Parámetros:
   * - carpetaId: string — ID de la carpeta a eliminar
   *
   * Retorna:
   * - void (204 No Content)
   *
   * Errores:
   * - 401: No autenticado
   * - 403: No es propietario (AC-07.6)
   * - 404: Carpeta no existe
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-07, AC-07.1–AC-07.7, A7
   * - openapi.yaml DELETE /carpetas/{carpetaId}
   */
  async eliminarCarpeta(carpetaId: string): Promise<void> {
    // Validación de parámetros
    if (!carpetaId || carpetaId.trim().length === 0) {
      throw new Error('ID de carpeta es requerido')
    }

    // Delega al repository; backend valida AC-07.6 (403)
    return this.repository.eliminarCarpeta(carpetaId)
  }

  /**
   * HU-10: Listar publicaciones guardadas en una carpeta.
   *
   * Caso de uso:
   * - Usuario accede a detalle de una carpeta (futura funcionalidad)
   * - Sistema carga lista de publicaciones guardadas (paginadas)
   * - Usuario puede quitar publicaciones de la carpeta desde aquí
   *
   * Validaciones de dominio:
   * - Paginación server-side: limit (1–50), offset (≥0)
   * - Acceso público o privado según disponibilidad de carpeta
   *
   * Parámetros:
   * - carpetaId: string — ID de la carpeta
   * - limit: number — Cantidad de resultados por página (1–50, default 10)
   * - offset: number — Posición de inicio (≥0, default 0)
   *
   * Retorna:
   * - ResultadoPublicacionesPaginado con array de publicaciones
   *
   * Errores:
   * - 400: Parámetros inválidos
   * - 404: Carpeta no existe
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-10, AC-10.1
   * - openapi.yaml GET /carpetas/{carpetaId}/posts?limit={limit}&offset={offset}
   */
  async listarPostsDeCarpeta(
    carpetaId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<ResultadoPublicacionesPaginado> {
    // Validaciones básicas de parámetros
    if (!carpetaId || carpetaId.trim().length === 0) {
      throw new Error('ID de carpeta es requerido')
    }

    if (limit < 1 || limit > 50) {
      throw new Error('Limit debe estar entre 1 y 50')
    }

    if (offset < 0) {
      throw new Error('Offset debe ser mayor o igual a 0')
    }

    // Delega al repository
    return this.repository.listarPostsDeCarpeta(carpetaId, limit, offset)
  }

  /**
   * HU-09: Guardar publicación en carpeta propia.
   *
   * Caso de uso:
   * - Usuario hace clic en "Guardar" en una publicación
   * - Se abre diálogo de guardar con lista de carpetas
   * - Usuario selecciona carpeta existente (o crea nueva en el flujo)
   * - Sistema guarda publicación en carpeta (AC-09.4)
   * - A8: Idempotente — si ya estaba guardada, retorna 200 sin error
   *
   * Validaciones de dominio:
   * - Carpeta debe existir y ser propiedad del usuario autenticado
   * - Publicación debe existir
   * - A8: No duplica la relación si ya está guardada
   *
   * Parámetros:
   * - carpetaId: string — ID de la carpeta donde guardar
   * - publicacionId: string — ID de la publicación a guardar
   *
   * Retorna:
   * - ResultadoGuardadoPost
   *   - esNueva: true si 201 (relación nueva), false si 200 (ya existía, A8)
   *   - carpetaId: ID de la carpeta
   *   - publicacionId: ID de la publicación
   *   - mensaje: Descripción opcional
   *
   * Errores:
   * - 400: Parámetros inválidos
   * - 401: No autenticado
   * - 403: No es propietario de la carpeta (AC-09.1)
   * - 404: Carpeta o publicación no existe
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-09, AC-09.1–AC-09.5, A8
   * - openapi.yaml POST /carpetas/{carpetaId}/posts
   * - Plan: A8 — Idempotencia explicada en research.md
   */
  async guardarPostEnCarpeta(
    carpetaId: string,
    publicacionId: string,
  ): Promise<ResultadoGuardadoPost> {
    // Validaciones de parámetros
    if (!carpetaId || carpetaId.trim().length === 0) {
      throw new Error('ID de carpeta es requerido')
    }

    if (!publicacionId || publicacionId.trim().length === 0) {
      throw new Error('ID de publicación es requerido')
    }

    // Delega al repository; backend valida A8 (200/201 idempotente)
    return this.repository.guardarPostEnCarpeta(carpetaId, publicacionId)
  }

  /**
   * HU-10: Quitar publicación de carpeta propia.
   *
   * Caso de uso:
   * - Usuario visualiza carpeta con posts guardados
   * - Hace clic en "Quitar" o "Eliminar de carpeta" en una publicación
   * - Sistema quita publicación de carpeta (AC-10.1)
   * - AC-10.1: Publicación original NO se elimina de la plataforma
   *
   * Validaciones de dominio:
   * - Carpeta debe existir y ser propiedad del usuario autenticado
   * - Publicación debe estar guardada en esa carpeta
   *
   * Parámetros:
   * - carpetaId: string — ID de la carpeta
   * - publicacionId: string — ID de la publicación a quitar
   *
   * Retorna:
   * - void (204 No Content)
   *
   * Errores:
   * - 400: Parámetros inválidos
   * - 401: No autenticado
   * - 403: No es propietario de la carpeta
   * - 404: Carpeta o publicación no existe
   * - Otros: Propagados desde repository
   *
   * Referencias:
   * - spec.md HU-10, AC-10.1
   * - openapi.yaml DELETE /carpetas/{carpetaId}/posts/{publicacionId}
   */
  async quitarPostDeCarpeta(carpetaId: string, publicacionId: string): Promise<void> {
    // Validaciones de parámetros
    if (!carpetaId || carpetaId.trim().length === 0) {
      throw new Error('ID de carpeta es requerido')
    }

    if (!publicacionId || publicacionId.trim().length === 0) {
      throw new Error('ID de publicación es requerido')
    }

    // Delega al repository
    return this.repository.quitarPostDeCarpeta(carpetaId, publicacionId)
  }

  /**
   * Valida nombre de carpeta según reglas de dominio.
   *
   * Reglas (HU-05, HU-06, AC-05.1–AC-05.3, AC-06.1):
   * - No vacío
   * - 1–15 caracteres (RF-21)
   * - Permite espacios
   *
   * Retorna:
   * - undefined si es válido
   * - string (mensaje de error) si es inválido
   */
  private validarNombreCarpeta(nombre: string): string | undefined {
    if (!nombre || nombre.trim().length === 0) {
      return 'El nombre de la carpeta no puede estar vacío'
    }

    if (nombre.length < 1 || nombre.length > 15) {
      return 'El nombre de la carpeta debe tener entre 1 y 15 caracteres'
    }

    // Nota: Unicidad (A3) la valida el backend
    // Nota: Formato permitido es cualquier carácter (incluyendo espacios)

    return undefined
  }
}
