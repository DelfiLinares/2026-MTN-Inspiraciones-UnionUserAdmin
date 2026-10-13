/**
 * EditarDesafio: Caso de uso de escritura
 *
 * Orquesta la operación de editar un desafío existente.
 * Solo administradores pueden editar (RF-05, RF-20).
 * Requiere confirmación si el desafío está ACTIVO o tiene respuestas (RF-22).
 *
 * Fuentes de verdad:
 * - spec.md: HU-02, RF-05, RF-22
 * - data-model.md: sección 6 (casos de uso), sección 4.1 (validación, requiereConfirmacionEdicion)
 * - tasks.md: T024
 */

import { Desafio, type DatosDesafio, type ErroresCampos } from "../../../domain/entidades/Desafio";
import { PermisoDenegado, ErrorValidacion } from "../../../domain/errores/ErroresDominio";
import type { SesionActual } from "../../../domain/SesionActual";
import type { DesafiosPort } from "../../ports/DesafiosPort";

/**
 * EditarDesafio: modifica un desafío existente.
 *
 * Responsabilidades:
 * - Obtener el desafío actual del puerto.
 * - Verificar que el usuario es ADMIN (RF-20).
 * - Validar nuevos datos (nombre, descripción, fotos, ámbitos, fechas).
 * - Calcular si requiere confirmación (si está ACTIVO o tiene respuestas).
 * - Delegar en el puerto para persistir.
 * - Lanzar excepciones de dominio si hay errores.
 *
 * Casos de uso:
 * - HU-02: Administrador edita un desafío existente.
 *
 * Criterios de aceptación (spec.md, sección 5):
 * - Solo ADMIN puede editar (verifica rol y lanza PermisoDenegado).
 * - Todos los campos son editables (A-07).
 * - Validación igual a PublicarDesafio (nombre, descripción, fotos, ámbitos, fechas).
 * - Si está ACTIVO o tiene respuestas, se debe pedir confirmación explícita al usuario
 *   (requiereConfirmacionEdicion). Esta responsabilidad es del cliente; el caso de uso
 *   expone el método para que la UI lo consulte.
 * - Tras éxito, devuelve el desafío actualizado.
 *
 * No se implementan:
 * - Persistencia local.
 * - Control de concurrencia con If-Match (pendiente de P-04).
 */
export class EditarDesafio {
  constructor(private readonly port: DesafiosPort) {}

  /**
   * Calcula si la edición requiere confirmación explícita.
   *
   * @param desafioActual - Desafío actual.
   * @param ahora - Fecha actual para evaluar estado.
   * @returns true si requiere confirmación, false en otro caso.
   *
   * Criterio (RF-22): Requiere confirmación si:
   * - El desafío está ACTIVO (según sus fechas).
   * - O el desafío tiene respuestas.
   */
  requiereConfirmacion(desafioActual: Desafio, ahora: Date): boolean {
    return desafioActual.requiereConfirmacionEdicion(ahora, { finInclusivo: false });
  }

  /**
   * Ejecuta el caso de uso.
   *
   * @param id - Identificador del desafío a editar.
   * @param datos - Nuevos datos del desafío.
   * @param sesion - Usuario actual.
   * @param confirmado - Si el usuario ha confirmado la edición (requerida si requiereConfirmacion es true).
   * @returns El desafío actualizado.
   * @throws PermisoDenegado si el usuario no es ADMIN.
   * @throws ErrorValidacion si los datos no pasan la validación.
   */
  async ejecutar(
    id: string,
    datos: DatosDesafio,
    sesion: SesionActual,
    confirmado: boolean = false,
  ): Promise<Desafio> {
    // Obtener desafío actual
    const desafioActual = await this.port.obtenerDesafio(id);

    // RF-20: Solo ADMIN puede editar
    if (!desafioActual.puedeEditarPor(sesion)) {
      throw new PermisoDenegado("Solo administradores pueden editar desafíos.");
    }

    // RF-22: Verificar si requiere confirmación (responsabilidad del cliente)
    // El caso de uso no rechaza, sino que expone el método para que la UI lo pregunte
    const requiereConfirmacion = this.requiereConfirmacion(desafioActual, new Date());
    if (requiereConfirmacion && !confirmado) {
      throw new ErrorValidacion(
        "La edición de este desafío requiere confirmación explícita.",
        {
          confirmacion:
            "El desafío está activo o tiene respuestas. ¿Deseas continuar con la edición?",
        },
      );
    }

    // HU-02, RF-01, RF-04: Validar nuevos datos
    const errores: ErroresCampos = Desafio.validar(datos);
    if (Object.keys(errores).length > 0) {
      throw new ErrorValidacion("No se puede editar el desafío con los datos proporcionados.", errores);
    }

    // Delegar en el puerto
    return this.port.editarDesafio(id, datos, desafioActual.version);
  }
}
