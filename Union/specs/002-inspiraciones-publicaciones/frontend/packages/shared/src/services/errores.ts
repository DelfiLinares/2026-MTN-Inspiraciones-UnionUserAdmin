// Error de la capa HTTP (T020). Implementa `ErrorApi` de data-model.md §2.
// Sin React. Lo usan el cliente HTTP y, más adelante, el manejador central de errores (T070).

import type { CodigoError, ErrorApi } from "../domain/tipos";
import { MENSAJES_ERROR } from "../utils/mensajes";

export class ErrorHttp extends Error implements ErrorApi {
  readonly codigo: CodigoError;
  readonly mensaje: string;
  readonly detalles?: Readonly<Record<string, string>>;

  constructor(codigo: CodigoError, mensaje?: string, detalles?: Readonly<Record<string, string>>) {
    const texto = mensaje ?? MENSAJES_ERROR[codigo];
    super(texto);
    this.name = "ErrorHttp";
    this.codigo = codigo;
    this.mensaje = texto;
    if (detalles !== undefined) {
      this.detalles = detalles;
    }
  }
}

/**
 * Traduce un estado HTTP al código de error conocido.
 * Cualquier 5xx se informa como 500; un 4xx no previsto se informa como 400.
 */
export function codigoDesdeEstado(estado: number): CodigoError {
  switch (estado) {
    case 400:
      return 400;
    case 401:
      return 401;
    case 403:
      return 403;
    case 404:
      return 404;
    case 409:
      return 409;
    case 413:
      return 413;
    case 415:
      return 415;
    case 422:
      return 422;
    default:
      return estado >= 500 ? 500 : 400;
  }
}
