import { SolicitudRecuperacion } from '../../../domain/recuperacion/entities/SolicitudRecuperacion';
import { ValidadorCorreoElectronico } from '../../../domain/recuperacion/services/ValidadorCorreoElectronico';

export class ServicioFormularioRecuperacion {
  private emailValidator: ValidadorCorreoElectronico;

  constructor(emailValidator: ValidadorCorreoElectronico) {
    this.emailValidator = emailValidator;
  }

  validarCorreo(solicitud: SolicitudRecuperacion): SolicitudRecuperacion {
    const validacion = this.emailValidator.validar(solicitud.obtenerCorreo());

    if (!validacion.esValido) {
      return solicitud
        .establecerTocado(true)
        .agregarError('correo', validacion.error || 'Error');
    }

    return solicitud.establecerTocado(true).limpiarErrores();
  }

  manejarCambioCorreo(solicitud: SolicitudRecuperacion, correo: string): SolicitudRecuperacion {
    const actualizada = solicitud.establecerCorreo(correo);

    if (solicitud.estaTocado() && correo.length > 0) {
      return actualizada.limpiarErrores();
    }

    return actualizada;
  }

  manejarBlurCorreo(solicitud: SolicitudRecuperacion): SolicitudRecuperacion {
    return this.validarCorreo(solicitud);
  }

  prepararParaEnvio(solicitud: SolicitudRecuperacion): { esValido: boolean; solicitud: SolicitudRecuperacion } {
    const validada = this.validarCorreo(solicitud);
    return {
      esValido: !validada.tieneErrores(),
      solicitud: validada
    };
  }

  static crear(): ServicioFormularioRecuperacion {
    return new ServicioFormularioRecuperacion(ValidadorCorreoElectronico.crear());
  }
}
