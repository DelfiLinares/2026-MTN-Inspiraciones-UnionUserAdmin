// Elemento dentro de una carpeta (T055). Variante "publicación no disponible" (CB-02, CB-05).
import React from "react";
import type { ItemCarpeta as ItemCarpetaDatos, UsuarioActual } from "@inspiraciones/shared";
import { TarjetaPublicacion } from "./TarjetaPublicacion";
import styles from "./Carpetas.module.css";

export interface ItemCarpetaProps {
  readonly item: ItemCarpetaDatos;
  readonly usuarioActual?: UsuarioActual | null;
  /** Quita el elemento de la carpeta (también para publicaciones no disponibles, CB-05). */
  readonly onQuitar?: (idPublicacion: string) => void;
  readonly quitando?: boolean;
  readonly onVerDetalle?: (idPublicacion: string) => void;
}

export const ItemCarpeta: React.FC<ItemCarpetaProps> = ({
  item,
  usuarioActual = null,
  onQuitar,
  quitando = false,
  onVerDetalle,
}) => {
  if (!item.disponible) {
    return (
      <div className={styles.noDisponible} data-testid="item-no-disponible">
        <p className={styles.nombre}>Esta publicación ya no está disponible.</p>
        <p className={styles.meta}>Fue eliminada por su autor o por moderación.</p>
        {onQuitar && (
          <div className={styles.acciones}>
            <button
              type="button"
              className={`${styles.boton} ${styles.botonPeligro}`}
              onClick={() => onQuitar(item.id)}
              disabled={quitando}
            >
              Quitar de la carpeta
            </button>
          </div>
        )}
      </div>
    );
  }

  const { publicacion } = item;
  return (
    <div className={styles.carpeta}>
      <TarjetaPublicacion
        publicacion={publicacion}
        usuarioActual={usuarioActual}
        {...(onVerDetalle ? { onVerDetalle: (p: { id: string }) => onVerDetalle(p.id) } : {})}
      />
      {onQuitar && (
        <div className={styles.acciones}>
          <button
            type="button"
            className={styles.boton}
            onClick={() => onQuitar(publicacion.id)}
            disabled={quitando}
            aria-label={`Quitar «${publicacion.titulo}» de la carpeta`}
          >
            Quitar de la carpeta
          </button>
        </div>
      )}
    </div>
  );
};
