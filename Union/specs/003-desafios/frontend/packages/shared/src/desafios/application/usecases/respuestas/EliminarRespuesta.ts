/**
 * EliminarRespuesta: Caso de uso de escritura
 *
 * Orquesta la operación de eliminar una respuesta de desafío.
 * El autor o ADMIN pueden eliminar (RF-14).
 * El admin puede eliminar cualquier respuesta, el usuario solo la suya (HU-16).
 *
 * Fuentes de verdad:
 * - spec.md: HU-15, HU-16, RF-13, RF-14
 * - data-model.md: sección 6 (casos de uso), sección 4.3 (puedeEliminarPor)
 * - tasks.md: T026
 */

import type { SesionActual } from "../../../domain/SesionActual";
import type { DesafiosPort } from "../../ports/DesafiosPort";

/**
 * EliminarRespuesta: elimina una respuesta de desafío.
 *
 * Responsabilidades:
 * - Verificar que el usuario es el autor o ADMIN (RF-14).
 * - La verificación la realiza la API.
 * - Delegar en el puerto para persistir.
 * - Lanzar excepciones de dominio si hay errores.
 *
 * Casos de uso:
 * - HU-15: Usuario edita y elimina sus propias respuestas.
 * - HU-16: Administrador elimina cualquier respuesta.
 *
 * Criterios de aceptación (spec.md, sección 5):
 * - RF-14: El autor o un ADMIN pueden eliminar (verifica puedeEliminarPor).
 * - Tras éxito, devuelve void (operación destructiva).
 *
 * Nota: La verificación de permisos se delega en la API.
 * El caso de uso orquesta y delega en el puerto.
 */
export class EliminarRespuesta {
  constructor(private readonly port: DesafiosPort) {}

  /**
   * Ejecuta el caso de uso.
   *
   * @param respuestaId - Identificador de la respuesta a eliminar.
   * @param sesion - Usuario actual.
   * @returns Promise que se resuelve sin valor (operación destructiva).
   * @throws PermisoDenegado si la API rechaza el acceso.
   *
   * Nota: La lógica de permisos se valida en la API, no localmente.
   */
  async ejecutar(respuestaId: string, sesion: SesionActual): Promise<void> {
    // RF-14: El autor o ADMIN pueden eliminar
    // La verificación se delega en la API, que conoce el autorId y el rol del usuario
    // El caso de uso orquesta la llamada

    return this.port.eliminarRespuesta(respuestaId);
  }
}
