type ResultadoValidacion = {
  esValido: boolean;
  error?: string;
};

export class ValidadorCorreoElectronico {
  private readonly regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  validar(correo: string): ResultadoValidacion {
    const trimado = correo.trim();

    if (!trimado) {
      return {
        esValido: false,
        error: 'El correo electrónico es requerido'
      };
    }

    if (!this.esFormatoValido(trimado)) {
      return {
        esValido: false,
        error: 'Ingresa un correo electrónico válido'
      };
    }

    return { esValido: true };
  }

  esFormatoValido(correo: string): boolean {
    return this.regex.test(correo);
  }

  esValido(correo: string): boolean {
    const trimado = correo.trim();
    return trimado.length > 0 && this.esFormatoValido(trimado);
  }

  static crear(): ValidadorCorreoElectronico {
    return new ValidadorCorreoElectronico();
  }
}
