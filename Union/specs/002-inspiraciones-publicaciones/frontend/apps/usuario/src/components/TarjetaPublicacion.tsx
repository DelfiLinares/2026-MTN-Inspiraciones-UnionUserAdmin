// Componente de Tarjeta de Publicación para usuario final (T048).
// Muestra cabecera de autor, medio interactivo, título, descripción y barra de acciones según permisos.
// Spec: HU-04, HU-07, HU-09, HU-11, RF-06 a RF-08, RF-14.

import React from "react";
import type { Publicacion, UsuarioActual } from "@inspiraciones/shared";
import {
  Medio,
  formatearFecha,
  textoAlternativo,
  puedeEditar,
  puedeBorrar,
  puedeDarLike,
  puedeGuardar,
  puedeReportar,
} from "@inspiraciones/shared";
import styles from "./TarjetaPublicacion.module.css";

export interface TarjetaPublicacionProps {
  readonly publicacion: Publicacion;
  readonly usuarioActual?: UsuarioActual | null;
  readonly onLike?: (publicacion: Publicacion) => void;
  readonly onGuardar?: (publicacion: Publicacion) => void;
  readonly onReportar?: (publicacion: Publicacion) => void;
  readonly onEditar?: (publicacion: Publicacion) => void;
  readonly onBorrar?: (publicacion: Publicacion) => void;
  readonly onVerDetalle?: (publicacion: Publicacion) => void;
  readonly likePendiente?: boolean;
}

export const TarjetaPublicacion: React.FC<TarjetaPublicacionProps> = ({
  publicacion,
  usuarioActual = null,
  onLike,
  onGuardar,
  onReportar,
  onEditar,
  onBorrar,
  onVerDetalle,
  likePendiente = false,
}) => {
  const alt = textoAlternativo(publicacion);
  const fecha = formatearFecha(publicacion.fechaCreacion);

  const permiteLike = usuarioActual ? puedeDarLike(usuarioActual, publicacion) : false;
  const permiteGuardar = usuarioActual ? puedeGuardar(usuarioActual, publicacion) : false;
  const permiteReportar = usuarioActual ? puedeReportar(usuarioActual, publicacion) : false;
  const permiteEditar = usuarioActual ? puedeEditar(usuarioActual, publicacion) : false;
  const permiteBorrar = usuarioActual ? puedeBorrar(usuarioActual, publicacion) : false;

  const inicialAutor = publicacion.autor.nombre
    ? publicacion.autor.nombre.charAt(0).toUpperCase()
    : "?";

  const handleVerDetalle = () => {
    if (onVerDetalle) {
      onVerDetalle(publicacion);
    }
  };

  return (
    <article className={styles.tarjeta} data-testid={`tarjeta-publicacion-${publicacion.id}`}>
      {/* Cabecera: Autor y fecha */}
      <header className={styles.cabecera}>
        <div className={styles.autorInfo}>
          <div className={styles.avatar}>
            <span>{inicialAutor}</span>
          </div>
          <div>
            <span className={styles.autorNombre}>{publicacion.autor.nombre}</span>
            {fecha && <div className={styles.fecha}>{fecha}</div>}
          </div>
        </div>
      </header>

      {/* Medio multimedia */}
      <div
        className={styles.medioWrapper}
        onClick={handleVerDetalle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleVerDetalle();
          }
        }}
        aria-label={`Ver detalle de ${publicacion.titulo}`}
      >
        <Medio
          tipo={publicacion.tipoContenido}
          src={publicacion.contenido}
          alt={alt}
        />
      </div>

      {/* Contenido textual */}
      <div className={styles.cuerpo}>
        <h3 className={styles.titulo}>
          {onVerDetalle ? (
            <button
              type="button"
              className={styles.enlaceDetalle}
              onClick={handleVerDetalle}
              style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", font: "inherit" }}
            >
              {publicacion.titulo}
            </button>
          ) : (
            publicacion.titulo
          )}
        </h3>

        {publicacion.descripcion && (
          <p className={styles.descripcion}>{publicacion.descripcion}</p>
        )}

        {publicacion.etiquetas.length > 0 && (
          <div className={styles.etiquetas} aria-label="Etiquetas">
            {publicacion.etiquetas.map((etiqueta) => (
              <span key={etiqueta} className={styles.etiqueta}>
                #{etiqueta}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pie de acciones según permisos */}
      <footer className={styles.pie}>
        <div className={styles.accionesSociales}>
          {/* Like */}
          {permiteLike ? (
            <button
              type="button"
              className={`${styles.botonAccion} ${
                publicacion.likeadaPorMi ? styles.botonLikeActivo : ""
              }`}
              onClick={() => onLike?.(publicacion)}
              disabled={likePendiente}
              aria-pressed={publicacion.likeadaPorMi}
              aria-label={
                publicacion.likeadaPorMi
                  ? `Quitar like, ${publicacion.cantidadLikes} likes`
                  : `Dar like, ${publicacion.cantidadLikes} likes`
              }
            >
              <span aria-hidden="true">{publicacion.likeadaPorMi ? "❤️" : "🤍"}</span>
              <span>{publicacion.cantidadLikes}</span>
            </button>
          ) : (
            <span
              className={styles.botonAccion}
              style={{ cursor: "default" }}
              aria-label={`${publicacion.cantidadLikes} likes`}
            >
              <span aria-hidden="true">❤️</span>
              <span>{publicacion.cantidadLikes}</span>
            </span>
          )}

          {/* Guardar en carpetas */}
          {permiteGuardar && onGuardar && (
            <button
              type="button"
              className={styles.botonAccion}
              onClick={() => onGuardar(publicacion)}
              aria-label="Guardar en carpeta"
            >
              <span aria-hidden="true">📁</span>
              <span>Guardar</span>
            </button>
          )}

          {/* Reportar */}
          {permiteReportar && onReportar && (
            <button
              type="button"
              className={styles.botonAccion}
              onClick={() => onReportar(publicacion)}
              aria-label={publicacion.reportadaPorMi ? "Ya reportada" : "Reportar publicación"}
              disabled={publicacion.reportadaPorMi}
            >
              <span aria-hidden="true">🚩</span>
              <span>{publicacion.reportadaPorMi ? "Reportada" : "Reportar"}</span>
            </button>
          )}
        </div>

        {/* Acciones de autor / administración */}
        <div className={styles.accionesGestion}>
          {permiteEditar && onEditar && (
            <button
              type="button"
              className={styles.botonAccion}
              onClick={() => onEditar(publicacion)}
              aria-label={`Editar ${publicacion.titulo}`}
            >
              ✏️
            </button>
          )}

          {permiteBorrar && onBorrar && (
            <button
              type="button"
              className={`${styles.botonAccion} ${styles.botonDestructivo}`}
              onClick={() => onBorrar(publicacion)}
              aria-label={`Borrar ${publicacion.titulo}`}
            >
              🗑️
            </button>
          )}
        </div>
      </footer>
    </article>
  );
};
