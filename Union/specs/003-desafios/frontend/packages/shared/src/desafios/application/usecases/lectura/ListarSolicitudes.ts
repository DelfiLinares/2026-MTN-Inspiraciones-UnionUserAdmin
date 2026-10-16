/**
 * ListarSolicitudes: Caso de uso de lectura
 *
 * Orquesta la operación de listar solicitudes de desafío con filtros y paginación.
 *
 * Fuentes de verdad:
 * - spec.md: HU-05, HU-06, RF-09, RF-10
 * - data-model.md: sección 6 (casos de uso)
 * - tasks.md: T023
 */

import type { SolicitudDesafio } from "../../../domain/entidades/SolicitudDesafio";
import type { DesafiosPort } from "../../ports/DesafiosPort";
import type { Pagina, ParametrosPagina } from "../../ports/tiposDesafios";
import type { EstadoSolicitudDesafio } from "../../../domain/enums/EstadoSolicitudDesafio";

/**
 * ListarSolicitudes: lee solicitudes filtradas y paginadas.
 *
 * Responsabilidades:
 * - Recibir filtros (estado) y parámetros de paginación.
 * - Delegar en el puerto `DesafiosPort.listarSolicitudes`.
 * - No duplicar lógica de filtrado (lo hace la API).
 *
 * Casos de uso:
 * - HU-05: Usuario ve sus propias solicitudes con su estado (PENDIENTE, APROBADA, RECHAZADA).
 * - HU-06: Administrador ve solicitudes pendientes y las aprueba o rechaza.
 *
 * Criterios de aceptación (spec.md):
 * - La API filtra por estado opcional (RF-09).
 * - El usuario solo ve sus propias solicitudes (filtrado por la API según la sesión).
 * - El administrador ve todas las solicitudes.
 * - La paginación usa cursor (sin números de página).
 */
export class ListarSolicitudes {
  constructor(private readonly port: DesafiosPort) {}

  /**
   * Ejecuta el caso de uso.
   *
   * @param filtros - Filtros opcionales de estado.
   * @param pagina - Parámetros de paginación: cursor opcional y límite.
   * @returns Página con solicitudes y cursor siguiente.
   */
  async ejecutar(
    filtros: { readonly estado?: EstadoSolicitudDesafio },
    pagina: ParametrosPagina,
  ): Promise<Pagina<SolicitudDesafio>> {
    return this.port.listarSolicitudes(filtros, pagina);
  }
}
