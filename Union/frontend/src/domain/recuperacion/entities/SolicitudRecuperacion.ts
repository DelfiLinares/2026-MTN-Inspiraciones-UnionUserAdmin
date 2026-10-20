export class SolicitudRecuperacion {
  private readonly correo: string;
  private readonly tocado: boolean;
  private readonly errores: Map<string, string>;

  constructor(correo?: string, tocado?: boolean, errores?: Map<string, string>) {
    this.correo = correo || '';
    this.tocado = tocado || false;
    this.errores = errores ? new Map(errores) : new Map();
  }

  private conErrores(errores: Map<string, string>): SolicitudRecuperacion {
    return new SolicitudRecuperacion(this.correo, this.tocado, errores);
  }

  establecerCorreo(correo: string): SolicitudRecuperacion {
    return new SolicitudRecuperacion(correo, this.tocado, this.errores);
  }

  obtenerCorreo(): string {
    return this.correo;
  }

  obtenerCorreoTrimado(): string {
    return this.correo.trim();
  }

  establecerTocado(tocado: boolean): SolicitudRecuperacion {
    return new SolicitudRecuperacion(this.correo, tocado, this.errores);
  }

  estaTocado(): boolean {
    return this.tocado;
  }

  agregarError(campo: string, mensaje: string): SolicitudRecuperacion {
    const nuevosErrores = new Map(this.errores);
    nuevosErrores.set(campo, mensaje);
    return this.conErrores(nuevosErrores);
  }

  obtenerError(campo: string): string | undefined {
    return this.errores.get(campo);
  }

  tieneErrores(): boolean {
    return this.errores.size > 0;
  }

  limpiarErrores(): SolicitudRecuperacion {
    return new SolicitudRecuperacion(this.correo, this.tocado);
  }

  reiniciar(): SolicitudRecuperacion {
    return new SolicitudRecuperacion();
  }

  static crear(): SolicitudRecuperacion {
    return new SolicitudRecuperacion();
  }
}
