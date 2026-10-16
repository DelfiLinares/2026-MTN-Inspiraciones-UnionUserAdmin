/**
 * EliminarDesafio: Caso de uso de escritura
 *
 * Orquesta la operación de eliminar un desafío.
 * Solo administradores pueden eliminar (RF-05, RF-20).
 * Es un borrado lógico (marcar como ELIMINADO, no eliminar físicamente).
 *
 * Fuentes de verdad:
 * - spec.md: HU-03, RF-05, RF-22, A-01, A-12
 * - data-model.md: sección 6 (casos de uso), sección 4.1 (marcarEliminado)
 * - tasks.md: T024
 */

import { Desafio } from "../../../domain/entidades/Desafio";
import { PermisoDenegado } from "../../../domain/errores/ErroresDominio";
import type { SesionActual } from "../../../domain/SesionActual";
import type { DesafiosPort } from "../../ports/DesafiosPort";

/**
 * EliminarDesafio: marca un desafío como eliminado (borrado lógico).
 *
 * Responsabilidades:
 * - Obtener el desafío actual del puerto.
 * - Verificar que el usuario es ADMIN (RF-20).
 * - Marcar el desafío como eliminado (A-01).
 * - Delegar en el puerto para persistir.
 * - Las respuestas del desafío se mantienen ocultas (A-12).
 * - Lanzar excepciones de dominio si hay errores.
 *
 * Casos de uso:
 * - HU-03: Administrador elimina un desafío.
 *
 * Criterios de aceptación (spec.md, sección 5):
 * - Antes de eliminar, el usuario debe confirmar explícitamente (RF-23, diferenciado visualmente).
 *   Esto es responsabilidad de la UI; este caso de uso no lo comprueba.
 * - Solo ADMIN puede eliminar (verifica rol y lanza PermisoDenegado).
 * - Es un borrado lógico: el desafío se marca como ELIMINADO, no se borra físicamente.
 * - Las respuestas se conservan ocultas (A-12), no se borran.
 * - Tras éxito, devuelve void (la acción es destructiva y no requiere devolución).
 *
 * No se implementan:
 * - Borrado físico de la base de datos.
 * - Borrado en cascada de respuestas.
 */
export class EliminarDesafio {
  constructor(private readonly port: DesafiosPort) {}

  /**
   * Ejecuta el caso de uso.
   *
   * @param id - Identificador del desafío a eliminar.
   * @param sesion - Usuario actual.
   * @returns Promise que se resuelve sin valor (operación destructiva).
   * @throws PermisoDenegado si el usuario no es ADMIN.
   */
  async ejecutar(id: string, sesion: SesionActual): Promise<void> {
    // Obtener desafío actual
    const desafioActual = await this.port.obtenerDesafio(id);

    // RF-20: Solo ADMIN puede eliminar
    if (!desafioActual.puedeEliminarPor(sesion)) {
      throw new PermisoDenegado("Solo administradores pueden eliminar desafíos.");
    }

    // A-01: Marcar como eliminado (borrado lógico, no físico)
    // Nota: El desafío se marca como eliminado; las respuestas se mantienen ocultas (A-12).
    // La persistencia del estado ELIMINADO es responsabilidad del puerto/adaptador.

    // Delegar en el puerto
    return this.port.eliminarDesafio(id);
  }
}
