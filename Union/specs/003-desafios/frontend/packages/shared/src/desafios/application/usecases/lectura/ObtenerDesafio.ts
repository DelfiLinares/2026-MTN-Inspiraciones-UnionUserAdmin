/**
 * ObtenerDesafio: Caso de uso de lectura
 *
 * Orquesta la operación de obtener un desafío por su id.
 *
 * Fuentes de verdad:
 * - spec.md: HU-11, RF-18
 * - data-model.md: sección 6 (casos de uso)
 * - tasks.md: T023
 */

import type { Desafio } from "../../../domain/entidades/Desafio";
import type { DesafiosPort } from "../../ports/DesafiosPort";

/**
 * ObtenerDesafio: lee un desafío por su id.
 *
 * Responsabilidades:
 * - Recibir el id del desafío.
 * - Delegar en el puerto `DesafiosPort.obtenerDesafio`.
 * - No duplicar lógica de permisos ni validación.
 *
 * Casos de uso:
 * - HU-11: Usuario ve el detalle de un desafío con fotos, descripción, tags, fechas y estado.
 *
 * Criterios de aceptación (spec.md):
 * - Si el desafío no existe o está `ELIMINADO`, la API responde con 404 (CB-01).
 *   El componente debe mostrar "no disponible".
 * - El estado se deriva de `rango` y la API lo entrega en el DTO.
 */
export class ObtenerDesafio {
  constructor(private readonly port: DesafiosPort) {}

  /**
   * Ejecuta el caso de uso.
   *
   * @param id - Identificador del desafío.
   * @returns Desafío completo con todas sus propiedades.
   * @throws Si el desafío no existe o está eliminado (la API retorna 404).
   */
  async ejecutar(id: string): Promise<Desafio> {
    return this.port.obtenerDesafio(id);
  }
}
