export class ErrorValidacion extends Error {
  readonly codigo = "VALIDACION";
  readonly campos: Readonly<Record<string, string>>;

  constructor(mensaje: string, campos: Record<string, string> = {}) {
    super(mensaje);
    this.name = "ErrorValidacion";
    this.campos = { ...campos };
  }
}

export class TransicionInvalida extends Error {
  readonly codigo = "TRANSICION_INVALIDA";

  constructor(mensaje: string) {
    super(mensaje);
    this.name = "TransicionInvalida";
  }
}

export class PermisoDenegado extends Error {
  readonly codigo = "PERMISO_DENEGADO";

  constructor(mensaje: string) {
    super(mensaje);
    this.name = "PermisoDenegado";
  }
}
