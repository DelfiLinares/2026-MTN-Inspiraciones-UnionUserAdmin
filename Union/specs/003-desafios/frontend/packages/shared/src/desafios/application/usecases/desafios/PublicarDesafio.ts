/**
 * PublicarDesafio: Caso de uso de escritura
 *
 * Orquesta la operación de publicar un nuevo desafío.
 * Solo administradores pueden publicar (HU-01, RF-20).
 *
 * Fuentes de verdad:
 * - spec.md: HU-01, RF-01, RF-20
 * - data-model.md: sección 6 (casos de uso), sección 4.1 (validación)
 * - tasks.md: T024
 */

import { Desafio, type DatosDesafio, type ErroresCampos } from "../../../domain/entidades/Desafio";
import { PermisoDenegado, ErrorValidacion } from "../../../domain/errores/ErroresDominio";
import type { SesionActual } from "../../../domain/SesionActual";
import { RolUsuario } from "../../../../domain/enums";
import type { DesafiosPort } from "../../ports/DesafiosPort";

/**
 * PublicarDesafio: crea un nuevo desafío.
 *
 * Responsabilidades:
 * - Verificar que el usuario es ADMIN (RF-20).
 * - Validar datos del desafío (nombre, descripción, fotos, ámbitos, fechas) (HU-01, RF-01, RF-04).
 * - Delegar en el puerto para persistir.
 * - Lanzar excepciones de dominio si hay errores.
 *
 * Casos de uso:
 * - HU-01: Administrador publica un desafío completo con todos los campos.
 *
 * Criterios de aceptación (spec.md, sección 5):
 * - Solo ADMIN puede publicar (verifica rol y lanza PermisoDenegado).
 * - Validación por campo: nombre, descripción, fotos (1-5, JPEG/PNG), ámbitos (al menos uno),
 *   fechas (fin posterior a inicio).
 * - Si hay errores, lanza ErrorValidacion con el mapa de errores.
 * - Tras éxito, devuelve el desafío creado con id asignado por la API.
 *
 * No se implementan:
 * - Persistencia local (es responsabilidad del puerto/adaptador).
 * - Transacciones (responsabilidad del backend).
 */
export class PublicarDesafio {
  constructor(private readonly port: DesafiosPort) {}

  /**
   * Ejecuta el caso de uso.
   *
   * @param datos - Datos del desafío a publicar.
   * @param sesion - Usuario actual.
   * @returns El desafío publicado (con id asignado por la API).
   * @throws PermisoDenegado si el usuario no es ADMIN.
   * @throws ErrorValidacion si los datos no pasan la validación.
   */
  async ejecutar(datos: DatosDesafio, sesion: SesionActual): Promise<Desafio> {
    // RF-20: Solo ADMIN puede publicar
    if (sesion.rol !== RolUsuario.ADMIN) {
      throw new PermisoDenegado("Solo administradores pueden publicar desafíos.");
    }

    // HU-01, RF-01, RF-04: Validar datos
    const errores: ErroresCampos = Desafio.validar(datos);
    if (Object.keys(errores).length > 0) {
      throw new ErrorValidacion("No se puede publicar el desafío con los datos proporcionados.", errores);
    }

    // Delegar en el puerto
    return this.port.publicarDesafio(datos);
  }
}
