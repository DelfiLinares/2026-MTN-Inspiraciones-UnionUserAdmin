/**
 * AprobarSolicitud: Caso de uso de escritura
 *
 * Orquesta la operación de aprobar una solicitud de desafío.
 * Solo ADMIN puede aprobar (RF-09, RF-20).
 * Solo se puede aprobar desde estado PENDIENTE (RF-09, CB-06).
 *
 * Fuentes de verdad:
 * - spec.md: HU-06, RF-09, CB-06
 * - data-model.md: sección 6 (casos de uso), sección 4.2 (aprobar, TransicionInvalida)
 * - tasks.md: T025
 */

import type { SolicitudDesafio } from "../../../domain/entidades/SolicitudDesafio";
import { PermisoDenegado, TransicionInvalida } from "../../../domain/errores/ErroresDominio";
import type { SesionActual } from "../../../domain/SesionActual";
import { RolUsuario } from "../../../../domain/enums";
import type { DesafiosPort } from "../../ports/DesafiosPort";

/**
 * AprobarSolicitud: cambia el estado de una solicitud a APROBADA.
 *
 * Responsabilidades:
 * - Verificar que el usuario es ADMIN (RF-09, RF-20).
 * - Verificar que la solicitud está en PENDIENTE (CB-06).
 * - Delegar en el puerto para persistir.
 * - Lanzar excepciones de dominio si hay errores.
 *
 * Casos de uso:
 * - HU-06: Administrador ve solicitudes pendientes y las aprueba o rechaza con pocos pasos.
 *
 * Criterios de aceptación (spec.md, sección 5):
 * - RF-09: Solo ADMIN puede aprobar (verifica rol).
 * - CB-06: Solo desde PENDIENTE (la API valida la transición).
 * - Tras éxito, devuelve la solicitud con estado APROBADA.
 *
 * Nota: La verificación de transición válida se valida en la API.
 * El caso de uso orquesta y delega en el puerto.
 */
export class AprobarSolicitud {
  constructor(private readonly port: DesafiosPort) {}

  /**
   * Ejecuta el caso de uso.
   *
   * @param id - Identificador de la solicitud a aprobar.
   * @param sesion - Usuario actual.
   * @returns La solicitud aprobada (con estado APROBADA).
   * @throws PermisoDenegado si el usuario no es ADMIN.
   * @throws TransicionInvalida si la solicitud no está en PENDIENTE (lanzada por la API).
   */
  async ejecutar(id: string, sesion: SesionActual): Promise<SolicitudDesafio> {
    // RF-09, RF-20: Solo ADMIN puede aprobar
    if (sesion.rol !== RolUsuario.ADMIN) {
      throw new PermisoDenegado("Solo administradores pueden aprobar solicitudes.");
    }

    // CB-06: Verificar que la solicitud está en PENDIENTE
    // La API valida la transición; si falla, lanza TransicionInvalida

    // Delegar en el puerto
    return this.port.aprobarSolicitud(id);
  }
}
