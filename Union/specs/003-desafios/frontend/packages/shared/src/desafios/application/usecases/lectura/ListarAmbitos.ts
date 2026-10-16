/**
 * ListarAmbitos: Caso de uso de lectura
 *
 * Orquesta la operación de listar los ámbitos disponibles para filtrar desafíos.
 *
 * Fuentes de verdad:
 * - spec.md: HU-10, RF-17
 * - data-model.md: sección 3.2 (AmbitoDesafio), sección 6 (casos de uso)
 * - tasks.md: T023
 */

import type { AmbitoDesafio } from "../../../domain/AmbitoDesafio";
import type { DesafiosPort } from "../../ports/DesafiosPort";

/**
 * ListarAmbitos: lee el catálogo de ámbitos válidos.
 *
 * Responsabilidades:
 * - Delegar en el puerto `DesafiosPort.listarAmbitos`.
 * - No duplicar lógica de validación del catálogo.
 *
 * Casos de uso:
 * - HU-10: Usuario filtra desafíos por ámbito, seleccionando de una lista cerrada.
 *
 * Criterios de aceptación (spec.md):
 * - El catálogo es provisorio hasta resolver A-02 (lista exacta de ámbitos).
 * - El catálogo lo entrega la API (HU-10, RF-17).
 */
export class ListarAmbitos {
  constructor(private readonly port: DesafiosPort) {}

  /**
   * Ejecuta el caso de uso.
   *
   * @returns Arreglo de ámbitos disponibles.
   */
  async ejecutar(): Promise<AmbitoDesafio[]> {
    return this.port.listarAmbitos();
  }
}
