import type { AmbitoDesafio } from "../../domain/AmbitoDesafio";
import type { DatosDesafio, Desafio } from "../../domain/entidades/Desafio";
import type { RespuestaDesafio } from "../../domain/entidades/RespuestaDesafio";
import type { SolicitudDesafio } from "../../domain/entidades/SolicitudDesafio";
import type { EstadoDesafio } from "../../domain/enums/EstadoDesafio";
import type { EstadoSolicitudDesafio } from "../../domain/enums/EstadoSolicitudDesafio";
import type { DesafioResumen, Pagina, ParametrosPagina } from "./tiposDesafios";

export interface FiltrosDesafios {
  readonly ambitos?: readonly string[];
  readonly estados?: readonly EstadoDesafio[];
  readonly fechaDesde?: Date;
  readonly fechaHasta?: Date;
}

// Pendiente de A-08 (solicitud) y A-22 (respuesta): sus cuerpos de escritura no se tipan.
export interface DesafiosPort {
  listarAmbitos(): Promise<AmbitoDesafio[]>;

  listarDesafios(filtros: FiltrosDesafios, pagina: ParametrosPagina): Promise<Pagina<DesafioResumen>>;
  obtenerDesafio(id: string): Promise<Desafio>;
  publicarDesafio(datos: DatosDesafio): Promise<Desafio>;
  editarDesafio(id: string, datos: DatosDesafio, version: number): Promise<Desafio>;
  eliminarDesafio(id: string): Promise<void>;

  listarRespuestas(desafioId: string, pagina: ParametrosPagina): Promise<Pagina<RespuestaDesafio>>;
  responderDesafio(desafioId: string): Promise<RespuestaDesafio>;
  editarRespuesta(respuestaId: string): Promise<RespuestaDesafio>;
  eliminarRespuesta(respuestaId: string): Promise<void>;

  listarSolicitudes(
    filtros: { readonly estado?: EstadoSolicitudDesafio },
    pagina: ParametrosPagina,
  ): Promise<Pagina<SolicitudDesafio>>;
  proponerSolicitud(): Promise<SolicitudDesafio>;
  editarSolicitud(id: string, version: number): Promise<SolicitudDesafio>;
  eliminarSolicitud(id: string): Promise<void>;
  aprobarSolicitud(id: string): Promise<SolicitudDesafio>;
  rechazarSolicitud(id: string): Promise<SolicitudDesafio>;
}
