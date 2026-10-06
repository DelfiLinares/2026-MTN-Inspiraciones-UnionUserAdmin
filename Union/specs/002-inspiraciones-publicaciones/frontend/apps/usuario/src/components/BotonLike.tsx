// Componente accesible de botón de Like (T049).
// Maneja atributo aria-pressed, contador en tiempo real, deshabilitado durante mutación pendiente y protección anti doble clic.
// No permite dar like a publicaciones propias (RF-14).
// Spec: HU-07, RF-11 a RF-15, CB-07.

import React from "react";
import type { Publicacion, UsuarioActual } from "@inspiraciones/shared";
import { puedeDarLike } from "@inspiraciones/shared";
import styles from "./BotonLike.module.css";

export interface BotonLikeProps {
  readonly publicacion: Publicacion;
  readonly usuarioActual?: UsuarioActual | null;
  readonly onToggleLike?: () => void;
  readonly pendiente?: boolean;
  readonly className?: string;
}

export const BotonLike: React.FC<BotonLikeProps> = ({
  publicacion,
  usuarioActual = null,
  onToggleLike,
  pendiente = false,
  className = "",
}) => {
  const esPropia = usuarioActual ? usuarioActual.id === publicacion.autor.id : false;
  const tienePermiso = usuarioActual ? puedeDarLike(usuarioActual, publicacion) : false;

  // Si es publicación propia de un usuario logueado o usuario no autenticado, solo mostramos el contador no interactivo
  if (esPropia || !tienePermiso || !onToggleLike) {
    return (
      <span
        className={`${styles.botonLike} ${styles.soloLectura} ${className}`.trim()}
        data-testid={`boton-like-estatico-${publicacion.id}`}
        role="img"
        aria-label={`${publicacion.cantidadLikes} me gusta`}
      >
        <span className={styles.icono} aria-hidden="true">
          ❤️
        </span>
        <span className={styles.contador}>{publicacion.cantidadLikes}</span>
      </span>
    );
  }

  const labelAria = publicacion.likeadaPorMi
    ? `Quitar me gusta, ${publicacion.cantidadLikes} me gusta`
    : `Dar me gusta, ${publicacion.cantidadLikes} me gusta`;

  return (
    <button
      type="button"
      className={`${styles.botonLike} ${
        publicacion.likeadaPorMi ? styles.activo : ""
      } ${className}`.trim()}
      onClick={onToggleLike}
      disabled={pendiente}
      aria-pressed={publicacion.likeadaPorMi}
      aria-label={labelAria}
      data-testid={`boton-like-${publicacion.id}`}
    >
      <span className={styles.icono} aria-hidden="true">
        {publicacion.likeadaPorMi ? "❤️" : "🤍"}
      </span>
      <span className={styles.contador}>{publicacion.cantidadLikes}</span>
    </button>
  );
};
