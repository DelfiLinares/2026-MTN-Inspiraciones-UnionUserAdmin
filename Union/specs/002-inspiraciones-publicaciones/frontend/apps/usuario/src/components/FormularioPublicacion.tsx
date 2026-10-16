// Formulario de creación/edición de publicación (T054).
// Valida con validarPublicacion (formato y tamaño según la configuración de la API), muestra errores por
// campo y traduce los rechazos del servidor 413, 415 y 422. El envío lo resuelve el padre
// (usePublicacionMutaciones, T037).
// Spec: HU-01, HU-02, RF-02, CB-11. Res.: A-11, S-2.

import React, { useEffect, useId, useState } from "react";
import type { ConfiguracionArchivos, Publicacion } from "@inspiraciones/shared";
import {
  MENSAJES_ERROR,
  formatearTamano,
  useBorradorFormulario,
  validarPublicacion,
} from "@inspiraciones/shared";
import styles from "./FormularioPublicacion.module.css";

export interface DatosFormularioPublicacion {
  readonly titulo: string;
  readonly descripcion: string;
  readonly categoria: string;
  readonly etiquetas: readonly string[];
  /** En la edición es null si no se eligió un archivo nuevo. */
  readonly archivo: File | null;
}

/** Forma mínima de un error del servidor (compatible con ErrorHttp). */
export interface ErrorServidorFormulario {
  readonly codigo: number | string;
  readonly mensaje?: string;
  readonly detalles?: Readonly<Record<string, string>>;
}

export interface FormularioPublicacionProps {
  readonly configuracion: ConfiguracionArchivos;
  /** Si se indica, el formulario funciona en modo edición. */
  readonly publicacionInicial?: Publicacion;
  readonly onEnviar: (datos: DatosFormularioPublicacion) => void | Promise<unknown>;
  readonly onCancelar?: () => void;
  readonly enviando?: boolean;
  readonly errorServidor?: ErrorServidorFormulario | null;
}

/** Texto del formulario conservado como borrador (CB-09); el archivo no se conserva. */
interface BorradorPublicacion {
  readonly titulo: string;
  readonly descripcion: string;
  readonly categoria: string;
  readonly etiquetas: string;
}

const CAMPOS_CONOCIDOS = ["titulo", "descripcion", "archivo", "etiquetas"] as const;

function extension(nombre: string): string {
  const punto = nombre.lastIndexOf(".");
  return punto >= 0 ? nombre.slice(punto + 1).toLowerCase() : "";
}

function separarEtiquetas(texto: string): string[] {
  return texto
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
}

/** Errores por campo derivados de un rechazo del servidor (413, 415, 422). */
function erroresDeServidor(error: ErrorServidorFormulario | null | undefined): {
  porCampo: Record<string, string>;
  general: string | null;
} {
  if (!error) return { porCampo: {}, general: null };

  if (error.codigo === 413) {
    return { porCampo: { archivo: error.mensaje ?? MENSAJES_ERROR[413] }, general: null };
  }
  if (error.codigo === 415) {
    return { porCampo: { archivo: error.mensaje ?? MENSAJES_ERROR[415] }, general: null };
  }
  if (error.codigo === 422) {
    const porCampo: Record<string, string> = {};
    for (const [campo, mensaje] of Object.entries(error.detalles ?? {})) {
      porCampo[campo] = mensaje;
    }
    const hayCampo = CAMPOS_CONOCIDOS.some((campo) => porCampo[campo] !== undefined);
    return { porCampo, general: hayCampo ? null : (error.mensaje ?? MENSAJES_ERROR[422]) };
  }
  return { porCampo: {}, general: error.mensaje ?? null };
}

export const FormularioPublicacion: React.FC<FormularioPublicacionProps> = ({
  configuracion,
  publicacionInicial,
  onEnviar,
  onCancelar,
  enviando = false,
  errorServidor = null,
}) => {
  const esEdicion = publicacionInicial !== undefined;
  const idBase = useId();
  const {
    borradorInicial,
    guardar: guardarBorrador,
    limpiar: limpiarBorrador,
  } = useBorradorFormulario<BorradorPublicacion>(
    esEdicion ? `publicacion-${publicacionInicial.id}` : "publicacion-nueva",
  );

  const [titulo, setTitulo] = useState(borradorInicial?.titulo ?? publicacionInicial?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(
    borradorInicial?.descripcion ?? publicacionInicial?.descripcion ?? "",
  );
  const [categoria, setCategoria] = useState(
    borradorInicial?.categoria ?? publicacionInicial?.categoria ?? "",
  );
  const [etiquetas, setEtiquetas] = useState(
    borradorInicial?.etiquetas ?? (publicacionInicial?.etiquetas ?? []).join(", "),
  );
  const [archivo, setArchivo] = useState<File | null>(null);
  const [erroresLocales, setErroresLocales] = useState<Record<string, string>>({});

  // Conserva el texto ante sesión expirada (CB-09). El archivo no se puede conservar.
  useEffect(() => {
    guardarBorrador({ titulo, descripcion, categoria, etiquetas });
  }, [titulo, descripcion, categoria, etiquetas, guardarBorrador]);

  const delServidor = erroresDeServidor(errorServidor);
  const errores: Record<string, string> = { ...delServidor.porCampo, ...erroresLocales };

  const manejarEnvio = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (enviando) return;

    const lista = separarEtiquetas(etiquetas);
    const resultado = validarPublicacion(
      {
        titulo,
        descripcion,
        categoria,
        etiquetas: lista,
        archivo: archivo
          ? { nombre: archivo.name, formato: extension(archivo.name), tamanoBytes: archivo.size }
          : null,
      },
      configuracion,
      { archivoOpcional: esEdicion },
    );

    if (resultado.length > 0) {
      const porCampo: Record<string, string> = {};
      for (const error of resultado) {
        porCampo[error.campo] ??= error.mensaje;
      }
      setErroresLocales(porCampo);
      return;
    }

    setErroresLocales({});
    void Promise.resolve(
      onEnviar({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria: categoria.trim(),
        etiquetas: lista,
        archivo,
      }),
    ).then(
      () => limpiarBorrador(),
      () => undefined, // El error lo muestra el padre; el borrador se conserva.
    );
  };

  const campoError = (campo: string) => (errores[campo] ? `${idBase}-${campo}-error` : undefined);
  const aceptados = configuracion.formatosPermitidos.map((f) => `.${f}`).join(",");

  return (
    <form className={styles.formulario} onSubmit={manejarEnvio} noValidate data-testid="formulario-publicacion">
      {delServidor.general && (
        <p className={styles.errorGeneral} role="alert">
          {delServidor.general}
        </p>
      )}

      <div className={styles.grupo}>
        <label htmlFor={`${idBase}-titulo`} className={styles.etiqueta}>
          Título
        </label>
        <input
          id={`${idBase}-titulo`}
          type="text"
          className={`${styles.control} ${errores.titulo ? styles.invalido : ""}`}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          disabled={enviando}
          aria-invalid={errores.titulo ? true : undefined}
          aria-describedby={campoError("titulo")}
        />
        {errores.titulo && (
          <p id={`${idBase}-titulo-error`} className={styles.error} role="alert">
            {errores.titulo}
          </p>
        )}
      </div>

      <div className={styles.grupo}>
        <label htmlFor={`${idBase}-descripcion`} className={styles.etiqueta}>
          Descripción
        </label>
        <textarea
          id={`${idBase}-descripcion`}
          className={`${styles.control} ${styles.areaTexto} ${errores.descripcion ? styles.invalido : ""}`}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          disabled={enviando}
          aria-invalid={errores.descripcion ? true : undefined}
          aria-describedby={campoError("descripcion")}
        />
        {errores.descripcion && (
          <p id={`${idBase}-descripcion-error`} className={styles.error} role="alert">
            {errores.descripcion}
          </p>
        )}
      </div>

      <div className={styles.grupo}>
        <label htmlFor={`${idBase}-categoria`} className={styles.etiqueta}>
          Categoría
        </label>
        <input
          id={`${idBase}-categoria`}
          type="text"
          className={styles.control}
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          disabled={enviando}
        />
      </div>

      <div className={styles.grupo}>
        <label htmlFor={`${idBase}-etiquetas`} className={styles.etiqueta}>
          Etiquetas
        </label>
        <input
          id={`${idBase}-etiquetas`}
          type="text"
          className={`${styles.control} ${errores.etiquetas ? styles.invalido : ""}`}
          value={etiquetas}
          onChange={(e) => setEtiquetas(e.target.value)}
          disabled={enviando}
          aria-invalid={errores.etiquetas ? true : undefined}
          aria-describedby={`${idBase}-etiquetas-ayuda ${campoError("etiquetas") ?? ""}`.trim()}
        />
        <span id={`${idBase}-etiquetas-ayuda`} className={styles.ayuda}>
          Separalas con comas. Indicá al menos una categoría o una etiqueta.
        </span>
        {errores.etiquetas && (
          <p id={`${idBase}-etiquetas-error`} className={styles.error} role="alert">
            {errores.etiquetas}
          </p>
        )}
      </div>

      <div className={styles.grupo}>
        <label htmlFor={`${idBase}-archivo`} className={styles.etiqueta}>
          {esEdicion ? "Reemplazar contenido (opcional)" : "Contenido principal"}
        </label>
        <input
          id={`${idBase}-archivo`}
          type="file"
          accept={aceptados}
          className={`${styles.control} ${errores.archivo ? styles.invalido : ""}`}
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          disabled={enviando}
          aria-invalid={errores.archivo ? true : undefined}
          aria-describedby={`${idBase}-archivo-ayuda ${campoError("archivo") ?? ""}`.trim()}
        />
        <span id={`${idBase}-archivo-ayuda`} className={styles.ayuda}>
          Formatos: {configuracion.formatosPermitidos.join(", ")}. Tamaño máximo:{" "}
          {formatearTamano(configuracion.tamanoMaxBytes)}.
        </span>
        {errores.archivo && (
          <p id={`${idBase}-archivo-error`} className={styles.error} role="alert">
            {errores.archivo}
          </p>
        )}
      </div>

      <div className={styles.acciones}>
        {onCancelar && (
          <button
            type="button"
            className={`${styles.boton} ${styles.botonSecundario}`}
            onClick={onCancelar}
            disabled={enviando}
          >
            Cancelar
          </button>
        )}
        <button type="submit" className={`${styles.boton} ${styles.botonPrimario}`} disabled={enviando}>
          {enviando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Publicar"}
        </button>
      </div>
    </form>
  );
};
