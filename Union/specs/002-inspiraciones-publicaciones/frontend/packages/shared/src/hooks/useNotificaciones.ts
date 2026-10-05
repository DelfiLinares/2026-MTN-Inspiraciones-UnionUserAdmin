// Hook y contexto de notificaciones/toasts para feedback de acciones (T043).
// Maneja mensajes de éxito, error e informativos con auto-cierre, descarte manual y accesibilidad (aria-live).
// Spec: RF-28. Plan sección 6.

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type TipoNotificacion = "exito" | "error" | "info" | "advertencia";

export interface Notificacion {
  readonly id: string;
  readonly tipo: TipoNotificacion;
  readonly mensaje: string;
  readonly duracionMs?: number;
}

export interface OpcionesNotificacion {
  readonly duracionMs?: number;
}

export interface ContextoNotificacionesValor {
  readonly notificaciones: readonly Notificacion[];
  readonly notificar: (
    tipo: TipoNotificacion,
    mensaje: string,
    opciones?: OpcionesNotificacion,
  ) => string;
  readonly notificarExito: (mensaje: string, opciones?: OpcionesNotificacion) => string;
  readonly notificarError: (mensaje: string, opciones?: OpcionesNotificacion) => string;
  readonly notificarInfo: (mensaje: string, opciones?: OpcionesNotificacion) => string;
  readonly notificarAdvertencia: (mensaje: string, opciones?: OpcionesNotificacion) => string;
  readonly descartar: (id: string) => void;
  readonly limpiarTodas: () => void;
}

const DURACION_DEFECTO_MS = 5000;

export const ContextoNotificaciones = createContext<ContextoNotificacionesValor | null>(null);

let contadorIds = 0;
function generarIdNotificacion(): string {
  contadorIds += 1;
  return `notif-${Date.now()}-${contadorIds}`;
}

export interface ProveedorNotificacionesProps {
  readonly children?: React.ReactNode;
  readonly duracionDefectoMs?: number;
}

export function ProveedorNotificaciones({
  children,
  duracionDefectoMs = DURACION_DEFECTO_MS,
}: ProveedorNotificacionesProps): React.ReactElement {
  const [notificaciones, setNotificaciones] = useState<readonly Notificacion[]>([]);

  const descartar = useCallback((id: string) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const limpiarTodas = useCallback(() => {
    setNotificaciones([]);
  }, []);

  const notificar = useCallback(
    (
      tipo: TipoNotificacion,
      mensaje: string,
      opciones?: OpcionesNotificacion,
    ): string => {
      const id = generarIdNotificacion();
      const duracion = opciones?.duracionMs ?? duracionDefectoMs;

      const nueva: Notificacion = {
        id,
        tipo,
        mensaje,
        duracionMs: duracion,
      };

      setNotificaciones((prev) => [...prev, nueva]);

      if (duracion > 0 && duracion !== Infinity) {
        setTimeout(() => {
          descartar(id);
        }, duracion);
      }

      return id;
    },
    [descartar, duracionDefectoMs],
  );

  const notificarExito = useCallback(
    (mensaje: string, opciones?: OpcionesNotificacion) => {
      return notificar("exito", mensaje, opciones);
    },
    [notificar],
  );

  const notificarError = useCallback(
    (mensaje: string, opciones?: OpcionesNotificacion) => {
      return notificar("error", mensaje, opciones);
    },
    [notificar],
  );

  const notificarInfo = useCallback(
    (mensaje: string, opciones?: OpcionesNotificacion) => {
      return notificar("info", mensaje, opciones);
    },
    [notificar],
  );

  const notificarAdvertencia = useCallback(
    (mensaje: string, opciones?: OpcionesNotificacion) => {
      return notificar("advertencia", mensaje, opciones);
    },
    [notificar],
  );

  const valor = useMemo<ContextoNotificacionesValor>(
    () => ({
      notificaciones,
      notificar,
      notificarExito,
      notificarError,
      notificarInfo,
      notificarAdvertencia,
      descartar,
      limpiarTodas,
    }),
    [
      notificaciones,
      notificar,
      notificarExito,
      notificarError,
      notificarInfo,
      notificarAdvertencia,
      descartar,
      limpiarTodas,
    ],
  );

  return React.createElement(
    ContextoNotificaciones.Provider,
    { value: valor },
    children,
  );
}

export function useNotificaciones(): ContextoNotificacionesValor {
  const contexto = useContext(ContextoNotificaciones);
  if (!contexto) {
    throw new Error(
      "useNotificaciones debe usarse dentro de un ProveedorNotificaciones",
    );
  }
  return contexto;
}

