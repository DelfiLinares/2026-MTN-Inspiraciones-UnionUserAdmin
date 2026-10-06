// Pantallas de estado global (T069): no autenticado, 403, 404, error de red y listado vacío.
// Sin dependencia de router: la acción (ir a login, volver) la provee quien las usa.
// Spec: RF-09, RF-10, CB-09.

import React from "react";
import { EstadoError, EstadoVacio } from "./Estados";
import { MENSAJES_ERROR, MENSAJES_ESTADO } from "../utils/mensajes";

export interface PantallaGlobalProps {
  readonly titulo?: string;
  readonly mensaje?: string;
  /** Acción opcional (por ejemplo, un enlace o botón para iniciar sesión o volver). */
  readonly accion?: React.ReactNode;
  readonly className?: string;
}

const PantallaInformativa: React.FC<
  PantallaGlobalProps & { readonly tituloPorDefecto: string; readonly mensajePorDefecto: string }
> = ({ titulo, mensaje, accion, className, tituloPorDefecto, mensajePorDefecto }) => (
  <EstadoVacio
    titulo={titulo ?? tituloPorDefecto}
    descripcion={mensaje ?? mensajePorDefecto}
    {...(accion !== undefined ? { accion } : {})}
    {...(className !== undefined ? { className } : {})}
  />
);

/** 401: la persona no inició sesión o su sesión expiró (RF-09). */
export const PantallaNoAutenticado: React.FC<PantallaGlobalProps> = (props) => (
  <PantallaInformativa
    {...props}
    tituloPorDefecto="Iniciá sesión"
    mensajePorDefecto={MENSAJES_ERROR[401]}
  />
);

/** 403: sin permiso para ver el recurso (RF-10). */
export const PantallaSinPermiso: React.FC<PantallaGlobalProps> = (props) => (
  <PantallaInformativa
    {...props}
    tituloPorDefecto="Acceso denegado"
    mensajePorDefecto={MENSAJES_ERROR[403]}
  />
);

/** 404: recurso inexistente o eliminado (CB-09). */
export const PantallaNoEncontrado: React.FC<PantallaGlobalProps> = (props) => (
  <PantallaInformativa
    {...props}
    tituloPorDefecto={MENSAJES_ESTADO.publicacionNoDisponible}
    mensajePorDefecto={MENSAJES_ERROR[404]}
  />
);

export interface PantallaErrorRedProps {
  readonly onReintentar?: () => void;
  readonly className?: string;
}

/** Sin respuesta del servidor: ofrece reintentar. */
export const PantallaErrorRed: React.FC<PantallaErrorRedProps> = ({ onReintentar, className }) => (
  <EstadoError
    titulo="Sin conexión"
    mensaje={MENSAJES_ERROR.red}
    {...(onReintentar !== undefined ? { onReintentar } : {})}
    {...(className !== undefined ? { className } : {})}
  />
);

/** Listado sin elementos. */
export const PantallaListadoVacio: React.FC<PantallaGlobalProps> = (props) => (
  <PantallaInformativa
    {...props}
    tituloPorDefecto="Sin resultados"
    mensajePorDefecto={MENSAJES_ESTADO.vacioListado}
  />
);
