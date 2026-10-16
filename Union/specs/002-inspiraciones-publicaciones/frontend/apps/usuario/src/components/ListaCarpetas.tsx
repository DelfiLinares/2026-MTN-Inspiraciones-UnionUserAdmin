// Lista de carpetas del usuario (T055): abrir, editar y eliminar con confirmación (HU-08, HU-10).
import React, { useState } from "react";
import type { Carpeta } from "@inspiraciones/shared";
import { ConfirmDialog, EstadoVacio, VisibilidadCarpeta } from "@inspiraciones/shared";
import styles from "./Carpetas.module.css";

export interface ListaCarpetasProps {
  readonly carpetas: readonly Carpeta[];
  readonly onAbrir: (carpeta: Carpeta) => void;
  readonly onEditar?: (carpeta: Carpeta) => void;
  readonly onEliminar?: (carpeta: Carpeta) => void;
  readonly eliminando?: boolean;
  readonly onCrear?: () => void;
}

export const ListaCarpetas: React.FC<ListaCarpetasProps> = ({
  carpetas,
  onAbrir,
  onEditar,
  onEliminar,
  eliminando = false,
  onCrear,
}) => {
  const [aEliminar, setAEliminar] = useState<Carpeta | null>(null);

  if (carpetas.length === 0) {
    return (
      <EstadoVacio
        titulo="Todavía no tenés carpetas"
        descripcion="Creá una carpeta para organizar las publicaciones que te inspiran."
        {...(onCrear
          ? {
              accion: (
                <button type="button" className={`${styles.boton} ${styles.botonPrimario}`} onClick={onCrear}>
                  Crear carpeta
                </button>
              ),
            }
          : {})}
      />
    );
  }

  return (
    <>
      <ul className={styles.lista} aria-label="Mis carpetas">
        {carpetas.map((carpeta) => (
          <li key={carpeta.id} className={styles.carpeta}>
            <button type="button" className={styles.abrir} onClick={() => onAbrir(carpeta)}>
              <span className={styles.nombre}>{carpeta.nombre}</span>
              <span className={styles.meta}>
                {carpeta.cantidadPublicaciones === 1
                  ? "1 publicación"
                  : `${carpeta.cantidadPublicaciones} publicaciones`}
              </span>
            </button>
            <span className={styles.insignia}>
              {carpeta.visibilidad === VisibilidadCarpeta.PUBLICA ? "Pública" : "Privada"}
            </span>
            {(onEditar || onEliminar) && (
              <div className={styles.acciones}>
                {onEditar && (
                  <button
                    type="button"
                    className={styles.boton}
                    onClick={() => onEditar(carpeta)}
                    aria-label={`Editar carpeta ${carpeta.nombre}`}
                  >
                    Editar
                  </button>
                )}
                {onEliminar && (
                  <button
                    type="button"
                    className={`${styles.boton} ${styles.botonPeligro}`}
                    onClick={() => setAEliminar(carpeta)}
                    aria-label={`Eliminar carpeta ${carpeta.nombre}`}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        abierta={aEliminar !== null}
        titulo="Eliminar carpeta"
        mensaje={
          aEliminar
            ? `¿Eliminar la carpeta «${aEliminar.nombre}»? Las publicaciones no se borran.`
            : ""
        }
        textoConfirmar="Eliminar"
        destructiva
        cargando={eliminando}
        onConfirmar={() => {
          if (aEliminar && onEliminar) onEliminar(aEliminar);
          setAEliminar(null);
        }}
        onCancelar={() => setAEliminar(null)}
      />
    </>
  );
};
