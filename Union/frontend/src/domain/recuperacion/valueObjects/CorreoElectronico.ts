import { ErrorCorreoInvalido } from '../errors/ErrorCorreoInvalido';

export class CorreoElectronico {
  private readonly valor: string;

  private constructor(email: string) {
    const trimado = email.trim();

    if (!this.esValido(trimado)) {
      throw new ErrorCorreoInvalido(`Correo inválido: ${email}`);
    }

    this.valor = trimado.toLowerCase();
  }

  private esValido(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  obtenerValor(): string {
    return this.valor;
  }

  static crear(email: string): CorreoElectronico {
    return new CorreoElectronico(email);
  }

  esIgual(otro: CorreoElectronico): boolean {
    return this.valor === otro.valor;
  }

  toString(): string {
    return this.valor;
  }
}
