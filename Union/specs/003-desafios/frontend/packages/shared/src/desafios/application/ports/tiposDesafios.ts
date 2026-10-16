import type { FormatoFoto } from "../../domain/Foto";
import type { EstadoDesafio } from "../../domain/enums/EstadoDesafio";

export interface ParametrosPagina {
  readonly cursor?: string;
  readonly limite?: number;
}

export interface Pagina<T> {
  readonly items: readonly T[];
  readonly siguienteCursor: string | null;
}

export interface FotoLectura {
  readonly id: string;
  readonly url: string;
  readonly formato: FormatoFoto;
  readonly principal: boolean;
}

export interface DesafioResumen {
  readonly id: string;
  readonly nombre: string;
  readonly fotoPrincipal: FotoLectura;
  readonly ambitos: readonly string[];
  readonly fechaInicio: Date;
  readonly fechaFin: Date;
  readonly estado: EstadoDesafio;
}
