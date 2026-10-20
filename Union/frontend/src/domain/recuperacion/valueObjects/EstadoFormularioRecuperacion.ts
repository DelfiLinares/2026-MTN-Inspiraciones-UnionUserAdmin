enum EstadoEnum {
  REPOSO = 'reposo',
  CARGANDO = 'cargando',
  EXITO = 'exito',
  ERROR = 'error'
}

export class EstadoFormularioRecuperacion {
  private readonly estado: EstadoEnum;
  private readonly mensaje?: string;

  private constructor(estado: EstadoEnum, mensaje?: string) {
    this.estado = estado;
    this.mensaje = mensaje;
  }

  static reposo(): EstadoFormularioRecuperacion {
    return new EstadoFormularioRecuperacion(EstadoEnum.REPOSO);
  }

  static cargando(): EstadoFormularioRecuperacion {
    return new EstadoFormularioRecuperacion(EstadoEnum.CARGANDO);
  }

  static exito(): EstadoFormularioRecuperacion {
    return new EstadoFormularioRecuperacion(EstadoEnum.EXITO);
  }

  static error(mensaje: string): EstadoFormularioRecuperacion {
    return new EstadoFormularioRecuperacion(EstadoEnum.ERROR, mensaje);
  }

  obtenerEstado(): EstadoEnum {
    return this.estado;
  }

  obtenerMensaje(): string | undefined {
    return this.mensaje;
  }

  esReposo(): boolean {
    return this.estado === EstadoEnum.REPOSO;
  }

  esCargando(): boolean {
    return this.estado === EstadoEnum.CARGANDO;
  }

  esExito(): boolean {
    return this.estado === EstadoEnum.EXITO;
  }

  esError(): boolean {
    return this.estado === EstadoEnum.ERROR;
  }
}
