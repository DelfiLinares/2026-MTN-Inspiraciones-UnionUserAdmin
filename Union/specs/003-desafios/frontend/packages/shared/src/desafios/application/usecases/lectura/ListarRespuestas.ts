/**
 * ListarRespuestas: Caso de uso de lectura
 *
 * Orquesta la operación de listar respuestas a un desafío específico.
 *
 * Fuentes de verdad:
 * - spec.md: HU-12, RF-18
 * - data-model.md: sección 6 (casos de uso)
 * - tasks.md: T023
 */

import type { RespuestaDesafio } from "../../../domain/entidades/RespuestaDesafio";
import type { DesafiosPort } from "../../ports/DesafiosPort";
import type { Pagina, ParametrosPagina } from "../../ports/tiposDesafios";

/**
 * ListarRespuestas: lee respuestas a un desafío, paginadas por cursor.
 *
 * Responsabilidades:
 * - Recibir el id del desafío y parámetros de paginación.
 * - Delegar en el puerto `DesafiosPort.listarRespuestas`.
 * - No duplicar lógica de filtrado.
 *
 * Casos de uso:
 * - HU-12: Usuario ve las respuestas de otros usuarios a un desafío, cargadas de forma progresiva.
 *
 * Criterios de aceptación (spec.md):
 * - Las respuestas solo se muestran si el desafío está en estado `ACTIVO` (A-05, RF-12).
 *   Esto lo valida la UI del detalle; este caso de uso no lo comprueba.
 * - Una respuesta por usuario y desafío (A-10). La API asegura la unicidad.
 * - La paginación usa cursor.
 */
export class ListarRespuestas {
  constructor(private readonly port: DesafiosPort) {}

  /**
   * Ejecuta el caso de uso.
   *
   * @param desafioId - Identificador del desafío cuyas respuestas se quieren listar.
   * @param pagina - Parámetros de paginación: cursor opcional y límite.
   * @returns Página con respuestas y cursor siguiente.
   */
  async ejecutar(
    desafioId: string,
    pagina: ParametrosPagina,
  ): Promise<Pagina<RespuestaDesafio>> {
    return this.port.listarRespuestas(desafioId, pagina);
  }
}
