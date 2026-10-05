// Componentes de estado de UI compartidos (Skeleton, EstadoVacio, EstadoError) (T045).
// Cumple con accesibilidad aria, indicador de carga y acciones de reintento.
// Spec: RF-28, CB-05. Plan sección 5.

import React from "react";
import styles from "./Estados.module.css";

/* -------------------------------------------------------------------------- */
/*                                  Skeleton                                  */
/* -------------------------------------------------------------------------- */

export interface SkeletonProps {
  readonly variante?: "rectangulo" | "circulo" | "texto";
  readonly ancho?: string | number;
  readonly alto?: string | number;
  readonly radio?: string | number;
  readonly className?: string;
  readonly ariaLabel?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variante = "rectangulo",
  ancho,
  alto,
  radio,
  className = "",
  ariaLabel = "Cargando contenido...",
}) => {
  const varianteClase =
    variante === "circulo"
      ? styles.skeletonCirculo
      : variante === "texto"
        ? styles.skeletonTexto
        : styles.skeletonRectangulo;

  const estiloEnLinea: React.CSSProperties = {
    ...(ancho !== undefined ? { width: typeof ancho === "number" ? `${ancho}px` : ancho } : {}),
    ...(alto !== undefined ? { height: typeof alto === "number" ? `${alto}px` : alto } : {}),
    ...(radio !== undefined ? { borderRadius: typeof radio === "number" ? `${radio}px` : radio } : {}),
  };

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
      className={`${styles.skeleton} ${varianteClase} ${className}`.trim()}
      style={estiloEnLinea}
      data-testid="skeleton"
    />
  );
};

/* -------------------------------------------------------------------------- */
/*                                EstadoVacio                                 */
/* -------------------------------------------------------------------------- */

export interface EstadoVacioProps {
  readonly titulo: string;
  readonly descripcion?: string;
  readonly icono?: React.ReactNode;
  readonly accion?: React.ReactNode;
  readonly className?: string;
}

export const EstadoVacio: React.FC<EstadoVacioProps> = ({
  titulo,
  descripcion,
  icono,
  accion,
  className = "",
}) => {
  return (
    <div
      role="region"
      aria-label={titulo}
      className={`${styles.contenedorEstado} ${className}`.trim()}
      data-testid="estado-vacio"
    >
      {icono !== undefined && <div className={styles.icono}>{icono}</div>}
      <h3 className={styles.titulo}>{titulo}</h3>
      {descripcion !== undefined && <p className={styles.descripcion}>{descripcion}</p>}
      {accion !== undefined && <div className={styles.accion}>{accion}</div>}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                EstadoError                                 */
/* -------------------------------------------------------------------------- */

export interface EstadoErrorProps {
  readonly titulo?: string;
  readonly mensaje: string;
  readonly onReintentar?: () => void;
  readonly textoReintentar?: string;
  readonly className?: string;
}

export const EstadoError: React.FC<EstadoErrorProps> = ({
  titulo = "Ocurrió un error",
  mensaje,
  onReintentar,
  textoReintentar = "Reintentar",
  className = "",
}) => {
  return (
    <div
      role="alert"
      className={`${styles.contenedorEstado} ${styles.contenedorError} ${className}`.trim()}
      data-testid="estado-error"
    >
      <h3 className={`${styles.titulo} ${styles.tituloError}`}>{titulo}</h3>
      <p className={styles.descripcion}>{mensaje}</p>
      {onReintentar !== undefined && (
        <div className={styles.accion}>
          <button
            type="button"
            className={styles.botonReintentar}
            onClick={onReintentar}
          >
            {textoReintentar}
          </button>
        </div>
      )}
    </div>
  );
};
