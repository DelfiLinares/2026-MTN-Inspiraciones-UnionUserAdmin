// Grilla tipo tablero con scroll infinito y skeletons (T053).
// Componente de presentación: recibe el estado de useFeed (T036) y renderiza TarjetaPublicacion (T048).
// Spec: HU-04, RF-25, RNF-02. Res.: D-08 (scroll infinito, 20 ítems por página).

import React, { useEffect, useRef } from "react";
import type { Publicacion, UsuarioActual } from "@inspiraciones/shared";
import { EstadoError, EstadoVacio, Skeleton } from "@inspiraciones/shared";
import { TarjetaPublicacion } from "./TarjetaPublicacion";
import type { TarjetaPublicacionProps } from "./TarjetaPublicacion";
import styles from "./GrillaPublicaciones.module.css";

const CANTIDAD_SKELETONS = 8;

export interface GrillaPublicacionesProps {
  readonly publicaciones: readonly Publicacion[];
  readonly usuarioActual?: UsuarioActual | null;
  readonly estaCargando?: boolean;
  readonly estaCargandoSiguientePagina?: boolean;
  readonly tieneSiguientePagina?: boolean;
  readonly tieneError?: boolean;
  readonly mensajeError?: string;
  readonly onCargarMas?: () => void;
  readonly onReintentar?: () => void;
  readonly acciones?: Omit<TarjetaPublicacionProps, "publicacion" | "usuarioActual">;
}

function SkeletonsTarjeta({ cantidad }: { readonly cantidad: number }) {
  return (
    <>
      {Array.from({ length: cantidad }, (_, i) => (
        <li key={i} className={`${styles.celda} ${styles.skeletonTarjeta}`} aria-hidden="true">
          <Skeleton variante="rectangulo" alto={180} />
          <Skeleton variante="texto" ancho="70%" />
          <Skeleton variante="texto" ancho="40%" />
        </li>
      ))}
    </>
  );
}

export const GrillaPublicaciones: React.FC<GrillaPublicacionesProps> = ({
  publicaciones,
  usuarioActual = null,
  estaCargando = false,
  estaCargandoSiguientePagina = false,
  tieneSiguientePagina = false,
  tieneError = false,
  mensajeError = "No pudimos cargar las publicaciones.",
  onCargarMas,
  onReintentar,
  acciones,
}) => {
  const sentinelaRef = useRef<HTMLDivElement>(null);
  const puedeCargarMas =
    tieneSiguientePagina && !estaCargandoSiguientePagina && !tieneError && onCargarMas !== undefined;

  // Scroll infinito: al llegar al final se pide la siguiente página (D-08).
  useEffect(() => {
    const elemento = sentinelaRef.current;
    if (!elemento || !puedeCargarMas || typeof IntersectionObserver === "undefined") return;

    const observador = new IntersectionObserver((entradas) => {
      if (entradas.some((entrada) => entrada.isIntersecting)) {
        onCargarMas?.();
      }
    });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [puedeCargarMas, onCargarMas, publicaciones.length]);

  if (estaCargando) {
    return (
      <ul className={styles.grilla} aria-busy="true" aria-label="Cargando publicaciones" data-testid="grilla-cargando">
        <SkeletonsTarjeta cantidad={CANTIDAD_SKELETONS} />
      </ul>
    );
  }

  if (tieneError && publicaciones.length === 0) {
    return <EstadoError mensaje={mensajeError} {...(onReintentar ? { onReintentar } : {})} />;
  }

  if (publicaciones.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay publicaciones para mostrar"
        descripcion="Probá con otra búsqueda o quitá los filtros."
      />
    );
  }

  return (
    <div data-testid="grilla-publicaciones">
      <ul className={styles.grilla} aria-label="Publicaciones">
        {publicaciones.map((publicacion) => (
          <li key={publicacion.id} className={styles.celda}>
            <TarjetaPublicacion {...acciones} publicacion={publicacion} usuarioActual={usuarioActual} />
          </li>
        ))}
        {estaCargandoSiguientePagina && <SkeletonsTarjeta cantidad={4} />}
      </ul>

      {tieneError && (
        <EstadoError mensaje={mensajeError} {...(onReintentar ? { onReintentar } : {})} />
      )}

      {tieneSiguientePagina && !tieneError && (
        <div className={styles.centro}>
          <div ref={sentinelaRef} className={styles.sentinela} aria-hidden="true" />
          {onCargarMas && typeof IntersectionObserver === "undefined" && (
            <button type="button" className={styles.botonMas} onClick={onCargarMas}>
              Cargar más
            </button>
          )}
        </div>
      )}
    </div>
  );
};
