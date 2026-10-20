export class ErrorCorreoInvalido extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErrorCorreoInvalido';
  }
}
