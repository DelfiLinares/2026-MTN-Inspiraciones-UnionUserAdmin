// Límite de errores (T070): captura errores de render/consulta lanzados como excepción
// y muestra la pantalla global que corresponde (401, 403, 404, red u otro).
// Spec: RF-09, CB-09. Res.: D-11.

import React from "react";
import { clasificarError } from "../hooks/manejadorErrores";
import { MENSAJES_ERROR } from "../utils/mensajes";
import { EstadoError } from "./Estados";
import {
  PantallaErrorRed,
  PantallaNoAutenticado,
  PantallaNoEncontrado,
  PantallaSinPermiso,
} from "./EstadosGlobales";

export interface LimiteDeErroresProps {
  readonly children: React.ReactNode;
  /** Se invoca al detectar un 401 (por ejemplo, para limpiar la sesión). */
  readonly onNoAutenticado?: () => void;
  /** Acción mostrada en las pantallas informativas (por ejemplo, ir a iniciar sesión). */
  readonly accion?: React.ReactNode;
}

interface Estado {
  readonly error: unknown;
  readonly huboError: boolean;
}

export class LimiteDeErrores extends React.Component<LimiteDeErroresProps, Estado> {
  override state: Estado = { error: undefined, huboError: false };

  static getDerivedStateFromError(error: unknown): Estado {
    return { error, huboError: true };
  }

  override componentDidCatch(error: unknown): void {
    if (clasificarError(error) === "no-autenticado") {
      this.props.onNoAutenticado?.();
    }
  }

  private readonly reintentar = (): void => {
    this.setState({ error: undefined, huboError: false });
  };

  override render(): React.ReactNode {
    if (!this.state.huboError) {
      return this.props.children;
    }
    const accion = this.props.accion;
    const propsAccion = accion !== undefined ? { accion } : {};
    switch (clasificarError(this.state.error)) {
      case "no-autenticado":
        return <PantallaNoAutenticado {...propsAccion} />;
      case "sin-permiso":
        return <PantallaSinPermiso {...propsAccion} />;
      case "no-encontrado":
        return <PantallaNoEncontrado {...propsAccion} />;
      case "red":
        return <PantallaErrorRed onReintentar={this.reintentar} />;
      default:
        return <EstadoError mensaje={MENSAJES_ERROR[500]} onReintentar={this.reintentar} />;
    }
  }
}
