/* eslint-disable @typescript-eslint/consistent-type-assertions -- useParams y manejo de datos de formulario generados requieren casting. */
// Modal para reportar una publicación (T051): motivo + texto libre y estado "Ya reportada".
// Valida con la regla pura validarReporte (RF-21, A-13); el envío lo resuelve el padre (useReportar, T041).
// Spec: HU-11, RF-21 a RF-23.

import React, { useEffect, useId, useRef, useState } from "react";
import type { MotivoReporte, Publicacion } from "@inspiraciones/shared";
import {
  ETIQUETAS_MOTIVO,
  MAX_TEXTO_REPORTE,
  MENSAJES_ERROR_ACCION,
  MotivoReporte as MotivosReporte,
  validarReporte,
} from "@inspiraciones/shared";
import styles from "./ModalReportar.module.css";

export interface DatosEnvioReporte {
  readonly motivo: MotivoReporte;
  readonly textoLibre?: string;
}

export interface ModalReportarProps {
  readonly abierta: boolean;
  readonly publicacion: Publicacion;
  readonly onEnviar: (datos: DatosEnvioReporte) => void | Promise<unknown>;
  readonly onCerrar: () => void;
  readonly enviando?: boolean;
  /** Fuerza el estado "Ya reportada" (por ejemplo ante un 409). */
  readonly yaReportada?: boolean;
  readonly errorGeneral?: string | null;
}

const SELECTOR_INTERACTIVOS =
  'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const ModalReportar: React.FC<ModalReportarProps> = ({
  abierta,
  publicacion,
  onEnviar,
  onCerrar,
  enviando = false,
  yaReportada = false,
  errorGeneral = null,
}) => {
  const [motivo, setMotivo] = useState<MotivoReporte | null>(null);
  const [textoLibre, setTextoLibre] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  const origenRef = useRef<HTMLElement | null>(null);
  const tituloId = useId();
  const textoId = useId();

  const reportada = yaReportada || publicacion.reportadaPorMi;

  // Reiniciar el formulario al abrir
  useEffect(() => {
    if (abierta) {
      setMotivo(null);
      setTextoLibre("");
      setErrores({});
    }
  }, [abierta]);

  // Guardar y restaurar el foco
  useEffect(() => {
    if (abierta) {
      origenRef.current = document.activeElement as HTMLElement | null;
    } else if (origenRef.current) {
      origenRef.current.focus();
      origenRef.current = null;
    }
  }, [abierta]);

  // Foco atrapado y Escape
  useEffect(() => {
    if (!abierta) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const primero = dialog.querySelector<HTMLElement>(SELECTOR_INTERACTIVOS);
    if (primero) {
      primero.focus();
    } else {
      dialog.focus();
    }

    const alPulsarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        if (!enviando) onCerrar();
        return;
      }
      if (evento.key !== "Tab") return;

      const elementos = Array.from(dialog.querySelectorAll<HTMLElement>(SELECTOR_INTERACTIVOS));
      if (elementos.length === 0) {
        evento.preventDefault();
        return;
      }
      const inicio = elementos[0];
      const fin = elementos[elementos.length - 1];
      const activo = document.activeElement;
      if (evento.shiftKey && (activo === inicio || !dialog.contains(activo))) {
        evento.preventDefault();
        fin?.focus();
      } else if (!evento.shiftKey && (activo === fin || !dialog.contains(activo))) {
        evento.preventDefault();
        inicio?.focus();
      }
    };

    document.addEventListener("keydown", alPulsarTecla);
    return () => document.removeEventListener("keydown", alPulsarTecla);
  }, [abierta, enviando, onCerrar, reportada]);

  if (!abierta) {
    return null;
  }

  const manejarEnvio = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (enviando) return;

    const resultado = validarReporte({ motivo, textoLibre });
    if (resultado.length > 0 || motivo === null) {
      const porCampo: Record<string, string> = {};
      for (const error of resultado) {
        porCampo[error.campo] ??= error.mensaje;
      }
      setErrores(porCampo);
      return;
    }

    setErrores({});
    const texto = textoLibre.trim();
    void onEnviar(texto.length > 0 ? { motivo, textoLibre: texto } : { motivo });
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !enviando) onCerrar();
      }}
      data-testid="modal-reportar-overlay"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className={styles.modal}
        data-testid="modal-reportar"
      >
        <header className={styles.cabecera}>
          <div>
            <h2 id={tituloId} className={styles.titulo}>
              Reportar publicación
            </h2>
            <span className={styles.subtitulo}>{publicacion.titulo}</span>
          </div>
          <button
            type="button"
            className={styles.botonCerrar}
            onClick={onCerrar}
            aria-label="Cerrar modal de reporte"
          >
            ✕
          </button>
        </header>

        {reportada ? (
          <>
            <div className={styles.cuerpo}>
              <p className={styles.yaReportada} role="status" data-testid="ya-reportada">
                {MENSAJES_ERROR_ACCION.reporteDuplicado}
              </p>
            </div>
            <footer className={styles.pie}>
              <button
                type="button"
                className={`${styles.boton} ${styles.botonCancelar}`}
                onClick={onCerrar}
              >
                Cerrar
              </button>
            </footer>
          </>
        ) : (
          <form className={styles.formulario} onSubmit={manejarEnvio} noValidate>
            <div className={styles.cuerpo}>
              {errorGeneral && (
                <p className={styles.errorGeneral} role="alert">
                  {errorGeneral}
                </p>
              )}

              <fieldset className={styles.grupo} aria-describedby={errores.motivo ? "error-motivo" : undefined}>
                <legend className={styles.leyenda}>Motivo</legend>
                {Object.values(MotivosReporte).map((valor) => (
                  <label key={valor} className={styles.opcion}>
                    <input
                      type="radio"
                      name="motivo"
                      className={styles.radio}
                      value={valor}
                      checked={motivo === valor}
                      onChange={() => setMotivo(valor)}
                      disabled={enviando}
                    />
                    <span>{ETIQUETAS_MOTIVO[valor]}</span>
                  </label>
                ))}
                {errores.motivo && (
                  <p id="error-motivo" className={styles.error} role="alert">
                    {errores.motivo}
                  </p>
                )}
              </fieldset>

              <div className={styles.grupo}>
                <label htmlFor={textoId} className={styles.etiquetaCampo}>
                  {motivo === "OTRO" ? "Detalle (obligatorio)" : "Detalle (opcional)"}
                </label>
                <textarea
                  id={textoId}
                  className={styles.areaTexto}
                  value={textoLibre}
                  onChange={(e) => setTextoLibre(e.target.value)}
                  disabled={enviando}
                  aria-invalid={errores.textoLibre ? true : undefined}
                  aria-describedby={errores.textoLibre ? `${textoId}-error` : undefined}
                />
                <span className={styles.contador}>
                  {textoLibre.length}/{MAX_TEXTO_REPORTE}
                </span>
                {errores.textoLibre && (
                  <p id={`${textoId}-error`} className={styles.error} role="alert">
                    {errores.textoLibre}
                  </p>
                )}
              </div>
            </div>

            <footer className={styles.pie}>
              <button
                type="button"
                className={`${styles.boton} ${styles.botonCancelar}`}
                onClick={onCerrar}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`${styles.boton} ${styles.botonEnviar}`}
                disabled={enviando}
              >
                {enviando ? "Enviando..." : "Enviar reporte"}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
};
