// Botón accesible de Guardar en Carpetas (T050).
// Muestra estado guardado/no guardado y abre el modal de selección de carpetas.
// Solo interactivo si el usuario tiene permiso (puedeGuardar - RF-17, RF-18).

import React from "react";
import type { Publicacion, UsuarioActual } from "@inspiraciones/shared";
import { puedeGuardar } from "@inspiraciones/shared";
import styles from "./BotonGuardar.module.css";

export interface BotonGuardarProps {
  readonly publicacion: Publicacion;
  readonly usuarioActual?: UsuarioActual | null;
  readonly onAbrirModal: () => void;
  readonly deshabilitado?: boolean;
  readonly className?: string;
}

export const BotonGuardar: React.FC<BotonGuardarProps> = ({
  publicacion,
  usuarioActual = null,
  onAbrirModal,
  deshabilitado = false,
  className = "",
}) => {
  const tienePermiso = usuarioActual ? puedeGuardar(usuarioActual, publicacion) : false;

  if (!tienePermiso) {
    return null;
  }

  const estaGuardada = publicacion.guardadaPorMi;
  const textoBoton = estaGuardada ? "Guardado" : "Guardar";
  const ariaLabel = estaGuardada
    ? `Guardado en carpetas. Abrir opciones de carpetas para ${publicacion.titulo}`
    : `Guardar ${publicacion.titulo} en carpetas`;

  return (
    <button
      type="button"
      className={`${styles.botonGuardar} ${estaGuardada ? styles.guardado : ""} ${className}`.trim()}
      onClick={onAbrirModal}
      disabled={deshabilitado}
      aria-haspopup="dialog"
      aria-label={ariaLabel}
      data-testid={`boton-guardar-${publicacion.id}`}
    >
      <span className={styles.icono} aria-hidden="true">
        {estaGuardada ? "📁" : "📂"}
      </span>
      <span>{textoBoton}</span>
    </button>
  );
};
