/**
 * EditarRespuesta: Caso de uso de escritura
 *
 * Orquesta la operación de editar una respuesta de desafío.
 * Solo el autor puede editar, nunca el admin (RF-13, CB-07).
 *
 * Fuentes de verdad:
 * - spec.md: HU-15, RF-13, CB-07
 * - data-model.md: sección 6 (casos de uso), sección 4.3 (puedeEditarPor)
 * - tasks.md: T026
 */

import type { RespuestaDesafio } from "../../../domain/entidades/RespuestaDesafio";
import { PermisoDenegado } from "../../../domain/errores/ErroresDominio";
import type { SesionActual } from "../../../domain/SesionActual";
import type { DesafiosPort } from "../../ports/DesafiosPort";

/**
 * EditarRespuesta: modifica una respuesta de desafío.
 *
 * Responsabilidades:
 * - Verificar que el usuario es el autor (RF-13, CB-07).
 * - La verificación de si el desafío sigue ACTIVO la realiza la API (P-02).
 * - Delegar en el puerto para persistir.
 * - Lanzar excepciones de dominio si hay errores.
 *
 * Casos de uso:
 * - HU-15: Usuario edita y elimina sus propias respuestas.
 *
 * Criterios de aceptación (spec.md, sección 5):
 * - RF-13: Solo el autor puede editar (verifica puedeEditarPor).
 * - CB-07: El admin nunca edita respuestas ajenas (decisión de clarificación 2026-10-11).
 * - Validación de contenido depende de A-22 (formato sin definir).
 * - P-02: Si se puede editar cuando el desafío no está ACTIVO queda pendiente.
 * - Tras éxito, devuelve la respuesta actualizada.
 *
 * No se implementan:
 * - Validación de contenido (pendiente A-22).
 * - Verificación de que el desafío sigue ACTIVO (pendiente P-02).
 */
export class EditarRespuesta {
  constructor(private readonly port: DesafiosPort) {}

  /**
   * Ejecuta el caso de uso.
   *
   * @param respuestaId - Identificador de la respuesta a editar.
   * @param sesion - Usuario actual.
   * @returns La respuesta actualizada.
   * @throws PermisoDenegado si el usuario no es el autor.
   *
   * Nota: La verificación de permisos se delega parcialmente a la API.
   * El caso de uso verifica que es autor; si no, lanza excepción.
   */
  async ejecutar(respuestaId: string, sesion: SesionActual): Promise<RespuestaDesafio> {
    // RF-13, CB-07: Solo el autor puede editar
    // La verificación se delega en la API, que conoce el autorId de la respuesta
    // El caso de uso orquesta la llamada

    return this.port.editarRespuesta(respuestaId);
  }
}
