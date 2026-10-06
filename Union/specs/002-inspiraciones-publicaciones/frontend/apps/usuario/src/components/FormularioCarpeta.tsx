/* eslint-disable @typescript-eslint/consistent-type-assertions -- useParams y conversiones de tipos generados por formularios requieren casting. */
// Formulario de carpeta (T055): nombre 1–50, sin repetir (RF-16, CB-10) y visibilidad (HU-10).
import React, { useId, useState } from "react";
import type { Carpeta } from "@inspiraciones/shared";
import { VisibilidadCarpeta, MAX_NOMBRE_CARPETA, validarNombreCarpeta } from "@inspiraciones/shared";
import styles from "./Carpetas.module.css";

export interface DatosFormularioCarpeta {
  readonly nombre: string;
  readonly visibilidad: VisibilidadCarpeta;
}

export interface FormularioCarpetaProps {
  readonly carpetaInicial?: Carpeta;
  /** Nombres de las demás carpetas del usuario, para detectar repetidos. */
  readonly nombresExistentes?: readonly string[];
  readonly onEnviar: (datos: DatosFormularioCarpeta) => void | Promise<unknown>;
  readonly onCancelar?: () => void;
  readonly enviando?: boolean;
  /** Error del servidor sobre el nombre (por ejemplo 409). */
  readonly errorNombre?: string | null;
}

export const FormularioCarpeta: React.FC<FormularioCarpetaProps> = ({
  carpetaInicial,
  nombresExistentes = [],
  onEnviar,
  onCancelar,
  enviando = false,
  errorNombre = null,
}) => {
  const id = useId();
  const [nombre, setNombre] = useState(carpetaInicial?.nombre ?? "");
  const [visibilidad, setVisibilidad] = useState<VisibilidadCarpeta>(
    carpetaInicial?.visibilidad ?? VisibilidadCarpeta.PRIVADA,
  );
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const mensaje = errorLocal ?? errorNombre;

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    const errores = validarNombreCarpeta(nombre, nombresExistentes);
    if (errores.length > 0) {
      setErrorLocal(errores[0]?.mensaje ?? "Nombre no válido.");
      return;
    }
    setErrorLocal(null);
    void onEnviar({ nombre: nombre.trim(), visibilidad });
  };

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate data-testid="formulario-carpeta">
      <div className={styles.grupo}>
        <label htmlFor={`${id}-nombre`} className={styles.etiqueta}>
          Nombre de la carpeta
        </label>
        <input
          id={`${id}-nombre`}
          type="text"
          className={`${styles.control} ${mensaje ? styles.invalido : ""}`}
          value={nombre}
          maxLength={MAX_NOMBRE_CARPETA + 10}
          onChange={(e) => setNombre(e.target.value)}
          disabled={enviando}
          aria-invalid={mensaje ? true : undefined}
          aria-describedby={mensaje ? `${id}-error` : undefined}
        />
        {mensaje && (
          <p id={`${id}-error`} className={styles.error} role="alert">
            {mensaje}
          </p>
        )}
      </div>

      <div className={styles.grupo}>
        <label htmlFor={`${id}-visibilidad`} className={styles.etiqueta}>
          Visibilidad
        </label>
        <select
          id={`${id}-visibilidad`}
          className={styles.control}
          value={visibilidad}
          onChange={(e) => setVisibilidad(e.target.value as VisibilidadCarpeta)}
          disabled={enviando}
        >
          <option value={VisibilidadCarpeta.PRIVADA}>Privada (solo vos)</option>
          <option value={VisibilidadCarpeta.PUBLICA}>Pública (cualquiera con el enlace)</option>
        </select>
      </div>

      <div className={styles.acciones}>
        {onCancelar && (
          <button type="button" className={styles.boton} onClick={onCancelar} disabled={enviando}>
            Cancelar
          </button>
        )}
        <button type="submit" className={`${styles.boton} ${styles.botonPrimario}`} disabled={enviando}>
          {enviando ? "Guardando..." : carpetaInicial ? "Guardar cambios" : "Crear carpeta"}
        </button>
      </div>
    </form>
  );
};
