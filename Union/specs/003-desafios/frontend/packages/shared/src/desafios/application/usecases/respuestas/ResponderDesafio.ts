/**
 * ResponderDesafio: Caso de uso de escritura
 *
 * Orquesta la operación de crear una respuesta a un desafío.
 * Solo se puede responder si el desafío está ACTIVO (RF-12, A-05).
 * Una respuesta por usuario y desafío (A-10).
 *
 * Fuentes de verdad:
 * - spec.md: HU-14, RF-12, A-05, A-10
 * - data-model.md: sección 6 (casos de uso), sección 4.3 (RespuestaDesafio)
 * - tasks.md: T026
 */

import type { Desafio } from "../../../domain/entidades/Desafio";
import type { RespuestaDesafio } from "../../../domain/entidades/RespuestaDesafio";
import { PermisoDenegado } from "../../../domain/errores/ErroresDominio";
import type { SesionActual } from "../../../domain/SesionActual";
import type { DesafiosPort } from "../../ports/DesafiosPort";

/**
 * ResponderDesafio: crea una respuesta a un desafío.
 *
 * Responsabilidades:
 * - Obtener el desafío para verificar que está ACTIVO (RF-12, A-05).
 * - Asignar el usuario actual como autor.
 * - Crear la respuesta.
 * - Delegar en el puerto para persistir.
 * - Lanzar excepciones de dominio si hay errores.
 *
 * Casos de uso:
 * - HU-14: Usuario envía una respuesta a un desafío.
 *
 * Criterios de aceptación (spec.md, sección 5):
 * - RF-12: Solo se responde si el desafío está ACTIVO (A-05).
 * - A-10: Una respuesta por usuario y desafío (enforced por la API).
 * - El usuario autenticado se asigna como autor.
 * - Validación de contenido depende de A-22 (formato sin definir).
 * - Tras éxito, devuelve la respuesta creada con id asignado por la API.
 *
 * No se implementan:
 * - Validación de contenido (pendiente A-22).
 * - Persistencia local.
 */
export class ResponderDesafio {
  constructor(private readonly port: DesafiosPort) {}

  /**
   * Ejecuta el caso de uso.
   *
   * @param desafioId - Identificador del desafío a responder.
   * @param sesion - Usuario actual (se asigna como autor).
   * @returns La respuesta creada con id asignado por la API.
   * @throws PermisoDenegado si el desafío no está ACTIVO.
   *
   * Nota: Los parámetros de contenido quedarían aquí tras resolver A-22.
   * Por ahora, la firma se mantiene minimal según la definición en DesafiosPort.
   */
  async ejecutar(desafioId: string, sesion: SesionActual): Promise<RespuestaDesafio> {
    // Obtener desafío para verificar que está ACTIVO
    const desafio = await this.port.obtenerDesafio(desafioId);

    // RF-12, A-05: Verificar que el desafío acepta respuestas (está ACTIVO)
    if (!desafio.aceptaRespuestas(new Date(), { finInclusivo: false })) {
      throw new PermisoDenegado("El desafío no está activo y no acepta respuestas.");
    }

    // HU-14: Crear respuesta en ACTIVO con el usuario como autor
    // La sesión contiene el usuarioId que se asigna como autorId en el backend
    // A-10: La API enforza una respuesta por usuario y desafío
    return this.port.responderDesafio(desafioId);
  }
}
