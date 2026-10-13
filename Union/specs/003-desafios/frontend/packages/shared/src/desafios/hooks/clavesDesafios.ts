/**
 * Claves de consulta para React Query
 *
 * Define las claves que React Query utiliza para cachear y invalidar consultas.
 * Cada clave es una tupla que incluye el nombre de la consulta y los parámetros
 * que la identifican de forma única.
 *
 * Tarea: T037
 * Depende de: T034 (tipos compartidos)
 *
 * Fuente de verdad:
 * - plan.md: Sección 5 (arquitectura de estado)
 * - spec.md: Datos y listados
 * - tasks.md: T037 (Claves de consulta)
 * - react-query docs: Query Keys (https://tanstack.com/query/latest/docs/react/guides/important-defaults)
 */

import type { FiltrosDesafios } from "../application/ports/DesafiosPort";

/**
 * Conjunto de claves de consulta para todas las operaciones de desafíos
 *
 * Las claves siguen la convención de React Query: tuplas anidadas que permiten
 * invalidación parcial de consultas mediante prefijos.
 *
 * Ejemplo: invalidar todas las consultas de desafíos
 * ```tsx
 * queryClient.invalidateQueries({ queryKey: clavesDesafios.desafios._def })
 * ```
 *
 * Ejemplo: invalidar solo desafíos con filtro específico
 * ```tsx
 * queryClient.invalidateQueries({
 *   queryKey: clavesDesafios.desafios.lista(filtros).queryKey
 * })
 * ```
 */
export const clavesDesafios = {
  /**
   * Raíz de todas las claves de desafíos
   */
  _def: ["desafios"] as const,

  /**
   * Claves para listado paginado de desafíos
   *
   * Estructura de clave:
   * - `["desafios", "lista", filtros]`
   *
   * Filtros pueden incluir: ámbito, estado, cursor, limite
   *
   * @example
   * ```tsx
   * // Listar todos los desafíos (sin filtros)
   * const clave = clavesDesafios.desafios.lista(undefined);
   *
   * // Listar desafíos filtrados
   * const clave = clavesDesafios.desafios.lista({
   *   ambitos: ["arte", "diseño"],
   *   estado: "ACTIVO"
   * });
   * ```
   */
  desafios: {
    _def: ["desafios"] as const,
    lista: (filtros?: FiltrosDesafios) =>
      ({
        queryKey: ["desafios", "lista", filtros] as const,
      } as const),
  },

  /**
   * Claves para obtener un desafío específico por ID
   *
   * Estructura de clave:
   * - `["desafios", "detalle", id]`
   *
   * @example
   * ```tsx
   * const clave = clavesDesafios.desafio.detalle("desafio-123");
   * ```
   */
  desafio: {
    _def: ["desafios", "detalle"] as const,
    detalle: (id: string) =>
      ({
        queryKey: ["desafios", "detalle", id] as const,
      } as const),
  },

  /**
   * Claves para listar ámbitos disponibles
   *
   * Estructura de clave:
   * - `["desafios", "ambitos"]`
   *
   * Esta clave es única (sin parámetros) ya que el listado de ámbitos
   * es relativamente estático.
   *
   * @example
   * ```tsx
   * const clave = clavesDesafios.ambitos.lista();
   * ```
   */
  ambitos: {
    _def: ["desafios", "ambitos"] as const,
    lista: () =>
      ({
        queryKey: ["desafios", "ambitos"] as const,
      } as const),
  },

  /**
   * Claves para listado paginado de solicitudes
   *
   * Estructura de clave:
   * - `["desafios", "solicitudes", filtros]`
   *
   * Los filtros pueden incluir: estado, cursor, limite
   *
   * @example
   * ```tsx
   * // Listar todas las solicitudes
   * const clave = clavesDesafios.solicitudes.lista(undefined);
   *
   * // Listar solo solicitudes pendientes
   * const clave = clavesDesafios.solicitudes.lista({ estado: "PENDIENTE" });
   * ```
   */
  solicitudes: {
    _def: ["desafios", "solicitudes"] as const,
    lista: (filtros?: FiltrosDesafios) =>
      ({
        queryKey: ["desafios", "solicitudes", filtros] as const,
      } as const),
  },

  /**
   * Claves para listado paginado de respuestas a un desafío específico
   *
   * Estructura de clave:
   * - `["desafios", "respuestas", desafioId]`
   *
   * @example
   * ```tsx
   * const clave = clavesDesafios.respuestas.lista("desafio-123");
   * ```
   */
  respuestas: {
    _def: ["desafios", "respuestas"] as const,
    lista: (desafioId: string) =>
      ({
        queryKey: ["desafios", "respuestas", desafioId] as const,
      } as const),
  },
};
