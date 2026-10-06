// Acción de borrado de moderación (T057): botón destructivo con confirmación previa
// (HU-12, RF-07, principios 12 y 13). El borrado lo ejecuta el padre en onConfirmar.
import React, { useState } from "react";
import type { Publicacion } from "@inspiraciones/shared";
import { ConfirmDialog, MENSAJES_CONFIRMACION } from "@inspiraciones/shared";
import styles from "./BotonBorrarModeracion.module.css";

export interface BotonBorrarModeracionProps {
  readonly publicacion: Pick<Publicacion, "id" | "titulo">;
  readonly onConfirmar: (idPublicacion: string) => void | Promise<unknown>;
  readonly borrando?: boolean;
  readonly deshabilitado?: boolean;
}

export const BotonBorrarModeracion: React.FC<BotonBorrarModeracionProps> = ({
  publicacion,
  onConfirmar,
  borrando = false,
  deshabilitado = false,
}) => {
  const [abierta, setAbierta] = useState(false);

  const confirmar = async () => {
    try {
      await onConfirmar(publicacion.id);
    } finally {
      setAbierta(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.boton}
        onClick={() => setAbierta(true)}
        disabled={deshabilitado || borrando}
        aria-label={`Borrar publicación «${publicacion.titulo}»`}
      >
        {borrando ? "Borrando..." : "Borrar"}
      </button>
      <ConfirmDialog
        abierta={abierta}
        titulo={MENSAJES_CONFIRMACION.borrarPublicacionTitulo}
        mensaje={`«${publicacion.titulo}». ${MENSAJES_CONFIRMACION.borrarPublicacionDetalle}`}
        textoConfirmar="Borrar"
        textoCancelar={MENSAJES_CONFIRMACION.cancelar}
        destructiva
        cargando={borrando}
        onConfirmar={() => void confirmar()}
        onCancelar={() => setAbierta(false)}
      />
    </>
  );
};
