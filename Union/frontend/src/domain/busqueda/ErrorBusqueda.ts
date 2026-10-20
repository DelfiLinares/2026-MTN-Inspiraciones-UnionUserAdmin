import { TipoErrorBusqueda } from "../enums/TipoErrorBusqueda";

/**
 * Error de dominio tipado del módulo de búsqueda (007).
 * Los adaptadores traducen errores de transporte/API a esta clase.
 */
export class ErrorBusqueda extends Error {
  readonly tipo: TipoErrorBusqueda;
  readonly codigo?: string;
  readonly detalles?: unknown;

  constructor(
    tipo: TipoErrorBusqueda,
    mensaje: string,
    opciones: { codigo?: string; detalles?: unknown; causa?: unknown } = {},
  ) {
    super(mensaje);
    this.name = "ErrorBusqueda";
    this.tipo = tipo;
    this.codigo = opciones.codigo;
    this.detalles = opciones.detalles;
    if (opciones.causa !== undefined) {
      (this as { cause?: unknown }).cause = opciones.causa;
    }
    Object.setPrototypeOf(this, ErrorBusqueda.prototype);
  }

  /** Solo RED, LIMITE y SERVIDOR admiten reintento manual. */
  get esReintentable(): boolean {
    return (
      this.tipo === TipoErrorBusqueda.RED ||
      this.tipo === TipoErrorBusqueda.LIMITE ||
      this.tipo === TipoErrorBusqueda.SERVIDOR
    );
  }

  static esErrorBusqueda(error: unknown): error is ErrorBusqueda {
    return error instanceof ErrorBusqueda;
  }
}
