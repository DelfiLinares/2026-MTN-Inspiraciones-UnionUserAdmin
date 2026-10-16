/**
 * ProponerSolicitud: Caso de uso de escritura
 *
 * Orquesta la operación de proponer una nueva solicitud de desafío.
 * Cualquier usuario puede proponer (usuarios autenticados).
 *
 * Fuentes de verdad:
 * - spec.md: HU-04, RF-07
 * - data-model.md: sección 6 (casos de uso), sección 4.2 (SolicitudDesafio)
 * - tasks.md: T025
 */

import type { SolicitudDesafio } from "../../../domain/entidades/SolicitudDesafio";
import type { SesionActual } from "../../../domain/SesionActual";
import type { DesafiosPort } from "../../ports/DesafiosPort";

/**
 * ProponerSolicitud: crea una nueva solicitud de desafío.
 *
 * Responsabilidades:
 * - Recibir datos de la solicitud (pendiente de A-08: campos sin definir).
 * - Asignar el usuario actual como autor.
 * - Crear en estado PENDIENTE.
 * - Delegar en el puerto para persistir.
 *
 * Casos de uso:
 * - HU-04: Usuario envía una solicitud para proponer un desafío.
 *
 * Criterios de aceptación (spec.md, sección 5):
 * - La solicitud se crea en estado PENDIENTE (sección 4, data-model.md).
 * - El usuario autenticado se asigna como autor.
 * - La validación de datos depende de A-08 (campos de solicitud sin definir).
 * - Tras éxito, devuelve la solicitud creada con id asignado por la API.
 *
 * No se implementan:
 * - Validación de campos (pendiente A-08).
 * - Persistencia local.
 */
export class ProponerSolicitud {
  constructor(private readonly port: DesafiosPort) {}

  /**
   * Ejecuta el caso de uso.
   *
   * @param sesion - Usuario actual (se asigna como autor).
   * @returns La solicitud creada con id asignado por la API.
   *
   * Nota: Los parámetros de datos quedarían aquí tras resolver A-08.
   * Por ahora, la firma se mantiene minimal según la definición en DesafiosPort.
   */
  async ejecutar(sesion: SesionActual): Promise<SolicitudDesafio> {
    // HU-04, RF-07: Crear solicitud en PENDIENTE con el usuario como autor
    // La sesión contiene el usuarioId que se asigna como autorId en el backend
    return this.port.proponerSolicitud();
  }
}
