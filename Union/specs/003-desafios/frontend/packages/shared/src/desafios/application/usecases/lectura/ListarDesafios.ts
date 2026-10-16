/**
 * ListarDesafios: Caso de uso de lectura
 *
 * Orquesta la operación de listar desafíos con filtros y paginación por cursor.
 *
 * Fuentes de verdad:
 * - spec.md: HU-09, HU-10, RF-16, RF-17
 * - data-model.md: sección 6 (casos de uso)
 * - tasks.md: T023
 */

import type { DesafiosPort } from "../../ports/DesafiosPort";
import type { DesafioResumen, Pagina, ParametrosPagina } from "../../ports/tiposDesafios";
import type { FiltrosDesafios } from "../../ports/DesafiosPort";

/**
 * ListarDesafios: lee desafíos filtrados y paginados.
 *
 * Responsabilidades:
 * - Recibir filtros (ámbitos, estados) y parámetros de paginación.
 * - Delegar en el puerto `DesafiosPort.listarDesafios`.
 * - No duplicar lógica de validación ni reglas de permisos (es responsabilidad de la API).
 *
 * Casos de uso:
 * - HU-09: Usuario ve listado de desafíos con nombre, foto, tags, fechas y estado.
 * - HU-10: Usuario filtra por ámbito y estado.
 *
 * Criterios de aceptación (spec.md):
 * - Se devuelven desafíos cuyo estado no es `ELIMINADO` (filtrado por la API).
 * - Los filtros son opcionales y se aplican en la API (RF-16, RF-17).
 * - La paginación usa cursor (sin números de página).
 */
export class ListarDesafios {
  constructor(private readonly port: DesafiosPort) {}

  /**
   * Ejecuta el caso de uso.
   *
   * @param filtros - Filtros opcionales de ámbito, estado y fechas.
   * @param pagina - Parámetros de paginación: cursor opcional y límite.
   * @returns Página con desafíos resumidos y cursor siguiente.
   */
  async ejecutar(
    filtros: FiltrosDesafios,
    pagina: ParametrosPagina,
  ): Promise<Pagina<DesafioResumen>> {
    return this.port.listarDesafios(filtros, pagina);
  }
}
