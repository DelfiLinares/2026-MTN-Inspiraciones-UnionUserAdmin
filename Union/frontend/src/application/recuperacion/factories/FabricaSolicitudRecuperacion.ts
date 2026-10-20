import { SolicitudRecuperacion } from '../../../domain/recuperacion/entities/SolicitudRecuperacion';

/**
 * FabricaSolicitudRecuperacion
 *
 * Factory class para crear instancias de SolicitudRecuperacion con diferentes estados iniciales.
 * Proporciona 4 factory methods para los casos de uso más comunes:
 * - crear(): Crea solicitud vacía
 * - desdeCorreo(correo: string): Crea solicitud con correo inicial, tocado=false
 * - conError(correo: string, error: string): Crea solicitud con correo y error
 * - reiniciar(): Crea solicitud vacía (reinicia el estado)
 */
export class FabricaSolicitudRecuperacion {
  /**
   * crear()
   *
   * Factory method: Crea una solicitud recuperación vacía.
   * - Correo: ''
   * - Tocado: false
   * - Errores: vacío
   *
   * @returns SolicitudRecuperacion nueva instancia vacía
   */
  static crear(): SolicitudRecuperacion {
    return new SolicitudRecuperacion();
  }

  /**
   * desdeCorreo(correo: string)
   *
   * Factory method: Crea una solicitud con correo inicial.
   * - Correo: correo proporcionado
   * - Tocado: false
   * - Errores: vacío
   *
   * Caso de uso: Pre-llenar el formulario cuando ya tenemos el correo del usuario
   *
   * @param correo - Email del usuario
   * @returns SolicitudRecuperacion nueva instancia con correo inicial
   */
  static desdeCorreo(correo: string): SolicitudRecuperacion {
    return new SolicitudRecuperacion(correo, false);
  }

  /**
   * conError(correo: string, error: string)
   *
   * Factory method: Crea una solicitud con correo y error asociado.
   * - Correo: correo proporcionado
   * - Tocado: true
   * - Errores: {correo: error}
   *
   * Caso de uso: Mostrar error existente cuando se abre el formulario
   *
   * @param correo - Email del usuario
   * @param error - Mensaje de error a asociar
   * @returns SolicitudRecuperacion nueva instancia con error
   */
  static conError(correo: string, error: string): SolicitudRecuperacion {
    return new SolicitudRecuperacion(correo, true)
      .agregarError('correo', error);
  }

  /**
   * reiniciar()
   *
   * Factory method: Crea una solicitud vacía para reiniciar el formulario.
   * Equivalente a crear(), pero semánticamente expresa intención de reinicio.
   * - Correo: ''
   * - Tocado: false
   * - Errores: vacío
   *
   * Caso de uso: Reset del formulario después de envío exitoso o cancelación
   *
   * @returns SolicitudRecuperacion nueva instancia vacía
   */
  static reiniciar(): SolicitudRecuperacion {
    return new SolicitudRecuperacion();
  }
}
