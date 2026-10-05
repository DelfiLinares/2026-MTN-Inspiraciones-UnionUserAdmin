// Componente visual de notificaciones flotantes / toasts (T046).
// Contenedor con regiones aria-live ("polite" y "assertive") para accesibilidad de lectores de pantalla.
// Spec: RF-28. Plan sección 5 y 6.

import React from "react";
import { useNotificaciones, type Notificacion } from "../hooks/useNotificaciones";
import styles from "./Notificaciones.module.css";

const ICONOS_POR_TIPO: Record<string, string> = {
  exito: "✓",
  error: "✕",
  advertencia: "⚠",
  info: "ℹ",
};

export interface NotificacionesProps {
  readonly className?: string;
}

export const Notificaciones: React.FC<NotificacionesProps> = ({ className = "" }) => {
  const { notificaciones, descartar } = useNotificaciones();

  if (notificaciones.length === 0) {
    return (
      <div
        className={`${styles.contenedor} ${className}`.trim()}
        aria-live="polite"
        aria-atomic="true"
        data-testid="contenedor-notificaciones"
      />
    );
  }

  return (
    <div
      className={`${styles.contenedor} ${className}`.trim()}
      aria-live="polite"
      aria-atomic="true"
      data-testid="contenedor-notificaciones"
    >
      {notificaciones.map((notif: Notificacion) => {
        const claseTipo =
          notif.tipo === "exito"
            ? styles.exito
            : notif.tipo === "error"
              ? styles.error
              : notif.tipo === "advertencia"
                ? styles.advertencia
                : styles.info;

        const rolAccesible = notif.tipo === "error" ? "alert" : "status";

        return (
          <div
            key={notif.id}
            role={rolAccesible}
            className={`${styles.notificacion} ${claseTipo}`}
            data-testid={`notificacion-${notif.id}`}
          >
            <div className={styles.cuerpo}>
              <span className={styles.icono} aria-hidden="true">
                {ICONOS_POR_TIPO[notif.tipo] ?? "ℹ"}
              </span>
              <p className={styles.mensaje}>{notif.mensaje}</p>
            </div>
            <button
              type="button"
              className={styles.botonCerrar}
              onClick={() => descartar(notif.id)}
              aria-label="Cerrar notificación"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};
