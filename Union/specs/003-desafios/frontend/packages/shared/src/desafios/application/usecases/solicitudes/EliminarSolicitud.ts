/**
 * EliminarSolicitud: Caso de uso de escritura
 *
 * Orquesta la operación de eliminar una solicitud de desafío.
 * Solo el autor o ADMIN pueden eliminar (RF-11).
 * Solo se pueden eliminar solicitudes en estado PENDIENTE (A-04).
 *
 * Fuentes de verdad:
 * - spec.md: HU-05, HU-07, RF-10, RF-11
 * - data-model.md: sección 6 (casos de uso), sección 4.2 (puedeEliminarPor)
 * - tasks.md: T025
 */

import type { SesionActual } from "../../../domain/SesionActual";
import type { DesafiosPort } from "../../ports/DesafiosPort";

/**
 * EliminarSolicitud: elimina una solicitud de desafío.
 *
 * Responsabilidades:
 * - Verificar que el usuario es el autor o ADMIN (RF-11).
 * - La verificación de estado PENDIENTE la realiza la API (A-04).
 * - Delegar en el puerto para persistir.
 * - Lanzar excepciones de dominio si hay errores.
 *
 * Casos de uso:
 * - HU-05: Usuario ve, edita y elimina sus propias solicitudes.
 * - HU-07: Administrador edita o elimina solicitudes de cualquier usuario.
 *
 * Criterios de aceptación (spec.md, sección 5):
 * - RF-11: Solo autor o ADMIN puede eliminar (verificado por la API).
 * - A-04: Solo se eliminan solicitudes en PENDIENTE (validado por la API).
 * - Tras éxito, devuelve void (operación destructiva).
 *
 * Nota: La verificación de permisos y estado se delega en la API.
 * El caso de uso no las duplica localmente (la API es fuente de verdad).
 */
export class EliminarSolicitud {
  constructor(private readonly port: DesafiosPort) {}

  /**
   * Ejecuta el caso de uso.
   *
   * @param id - Identificador de la solicitud a eliminar.
   * @param sesion - Usuario actual.
   * @returns Promise que se resuelve sin valor (operación destructiva).
   * @throws PermisoDenegado si la API rechaza el acceso.
   *
   * Nota: La lógica de permisos se valida en la API, no localmente.
   */
  async ejecutar(id: string, sesion: SesionActual): Promise<void> {
    // RF-11, A-04: La verificación de permisos y estado la realiza la API
    // No duplicamos lógica aquí; solo orquestamos la llamada

    // Delegar en el puerto
    return this.port.eliminarSolicitud(id);
  }
}
