import { DTOFormularioRecuperacion } from '../dtos/DTOFormularioRecuperacion';
import { SolicitudRecuperacion } from '../../../domain/recuperacion/entities/SolicitudRecuperacion';

/**
 * MapeadorFormularioRecuperacion
 *
 * Mapper class para convertir entre DTO y entidades del dominio.
 * Proporciona métodos para transformar datos entre capas:
 * - aDominio(dto): Convierte DTOFormularioRecuperacion → SolicitudRecuperacion
 * - aDTO(solicitud): Convierte SolicitudRecuperacion → DTOFormularioRecuperacion
 */
export class MapeadorFormularioRecuperacion {
  /**
   * aDominio(dto: DTOFormularioRecuperacion)
   *
   * Mapea un DTO hacia la entidad de dominio SolicitudRecuperacion.
   * Preserva todos los valores: correo, tocado, y errores.
   *
   * Proceso:
   * 1. Crea nueva SolicitudRecuperacion con correo y tocado del DTO
   * 2. Itera sobre los errores en el DTO (Record<string, string>)
   * 3. Agrega cada error a la solicitud usando agregarError
   * 4. Retorna la solicitud completamente construida
   *
   * @param dto - DTOFormularioRecuperacion con datos a mapear
   * @returns SolicitudRecuperacion con todos los valores del DTO
   */
  static aDominio(dto: DTOFormularioRecuperacion): SolicitudRecuperacion {
    let solicitud = new SolicitudRecuperacion(dto.correo, dto.tocado);

    for (const [campo, mensaje] of Object.entries(dto.errores)) {
      solicitud = solicitud.agregarError(campo, mensaje);
    }

    return solicitud;
  }

  /**
   * aDTO(solicitud: SolicitudRecuperacion)
   *
   * Mapea una entidad de dominio SolicitudRecuperacion hacia su DTO.
   * Extrae los errores del Map interno y los convierte a Record<string, string>.
   *
   * @param solicitud - SolicitudRecuperacion a mapear
   * @returns DTOFormularioRecuperacion con datos serializables
   */
  static aDTO(solicitud: SolicitudRecuperacion): DTOFormularioRecuperacion {
    const errores: Record<string, string> = {};

    const error = solicitud.obtenerError('correo');
    if (error) {
      errores['correo'] = error;
    }

    return {
      correo: solicitud.obtenerCorreo(),
      tocado: solicitud.estaTocado(),
      errores
    };
  }
}
