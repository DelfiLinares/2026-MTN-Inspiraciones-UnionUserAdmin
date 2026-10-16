// Componente de medio multimedia con carga diferida (lazy loading), skeleton placeholder y accesibilidad (T047).
// Soporta imagen, video y audio según RF-02 y RNF-02.

import React, { useState } from "react";
import type { TipoContenido } from "../domain/enums";
import { Skeleton } from "./Estados";
import styles from "./Medio.module.css";

export interface MedioProps {
  readonly tipo: TipoContenido;
  readonly src: string;
  readonly alt: string;
  readonly className?: string;
  readonly controls?: boolean;
  readonly autoPlay?: boolean;
}

export const Medio: React.FC<MedioProps> = ({
  tipo,
  src,
  alt,
  className = "",
  controls = true,
  autoPlay = false,
}) => {
  const [cargado, setCargado] = useState(false);
  const [error, setError] = useState(false);

  const handleCarga = () => {
    setCargado(true);
    setError(false);
  };

  const handleError = () => {
    setCargado(false);
    setError(true);
  };

  return (
    <div
      className={`${styles.contenedorMedio} ${className}`.trim()}
      data-testid="contenedor-medio"
    >
      {!cargado && !error && (
        <div className={styles.cargando} data-testid="medio-skeleton">
          <Skeleton variante="rectangulo" ariaLabel="Cargando archivo multimedia..." />
        </div>
      )}

      {error && (
        <div className={styles.errorMedio} role="alert" data-testid="medio-error">
          <span>⚠️</span>
          <p>No se pudo cargar el archivo multimedia</p>
        </div>
      )}

      {tipo === "IMAGEN" && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleCarga}
          onError={handleError}
          className={`${styles.imagen} ${!cargado ? styles.oculto : ""}`}
          data-testid="medio-imagen"
        />
      )}

      {tipo === "VIDEO" && (
        <video
          src={src}
          controls={controls}
          autoPlay={autoPlay}
          aria-label={alt}
          onLoadedData={handleCarga}
          onError={handleError}
          className={`${styles.video} ${!cargado ? styles.oculto : ""}`}
          data-testid="medio-video"
        >
          <track kind="captions" />
          Tu navegador no soporta la reproducción de video.
        </video>
      )}

      {tipo === "AUDIO" && (
        <div
          className={`${styles.audioContenedor} ${!cargado ? styles.oculto : ""}`}
          data-testid="medio-audio-contenedor"
        >
          <span className={styles.audioIcono} aria-hidden="true">
            🎵
          </span>
          <audio
            src={src}
            controls={controls}
            autoPlay={autoPlay}
            aria-label={alt}
            onLoadedData={handleCarga}
            onError={handleError}
            className={styles.audioElemento}
            data-testid="medio-audio"
          >
            Tu navegador no soporta la reproducción de audio.
          </audio>
        </div>
      )}
    </div>
  );
};
