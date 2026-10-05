import React, { useEffect, useRef, useId } from "react";
import styles from "./ConfirmDialog.module.css";

export interface ConfirmDialogProps {
  readonly abierta: boolean;
  readonly titulo: string;
  readonly mensaje: string;
  readonly textoConfirmar?: string;
  readonly textoCancelar?: string;
  readonly destructiva?: boolean;
  readonly cargando?: boolean;
  readonly onConfirmar: () => void;
  readonly onCancelar: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  abierta,
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  destructiva = false,
  cargando = false,
  onConfirmar,
  onCancelar,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tituloId = useId();
  const mensajeId = useId();

  // Guardar el elemento que tenía foco antes de abrir el modal y recuperarlo al cerrar
  useEffect(() => {
    if (abierta) {
      triggerRef.current = document.activeElement as HTMLElement | null;
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [abierta]);

  // Manejo de foco atrapado (Focus Trap) y tecla Escape
  useEffect(() => {
    if (!abierta) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // Buscar elementos interactivos dentro del diálogo
    const selectorInteractivos =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const elementosEnfocables =
      dialog.querySelectorAll<HTMLElement>(selectorInteractivos);

    if (elementosEnfocables.length > 0) {
      // Enfocar primer elemento (o botón cancelar si es destructivo para seguridad)
      const primerElemento = elementosEnfocables[0];
      if (primerElemento) {
        primerElemento.focus();
      }
    } else {
      dialog.focus();
    }

    const handleKeyDown = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        if (!cargando) {
          onCancelar();
        }
        return;
      }

      if (evento.key === "Tab") {
        const elementos = Array.from(
          dialog.querySelectorAll<HTMLElement>(selectorInteractivos),
        );
        if (elementos.length === 0) {
          evento.preventDefault();
          return;
        }

        const primerElem = elementos[0];
        const ultimoElem = elementos[elementos.length - 1];

        if (evento.shiftKey) {
          if (
            document.activeElement === primerElem ||
            !dialog.contains(document.activeElement)
          ) {
            evento.preventDefault();
            ultimoElem?.focus();
          }
        } else {
          if (
            document.activeElement === ultimoElem ||
            !dialog.contains(document.activeElement)
          ) {
            evento.preventDefault();
            primerElem?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [abierta, cargando, onCancelar]);

  if (!abierta) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !cargando) {
          onCancelar();
        }
      }}
      data-testid="confirm-dialog-overlay"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={mensajeId}
        tabIndex={-1}
        className={styles.dialogo}
      >
        <h2 id={tituloId} className={styles.titulo}>
          {titulo}
        </h2>
        <p id={mensajeId} className={styles.mensaje}>
          {mensaje}
        </p>

        <div className={styles.acciones}>
          <button
            type="button"
            className={`${styles.boton} ${styles.botonCancelar}`}
            onClick={onCancelar}
            disabled={cargando}
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            className={`${styles.boton} ${
              destructiva ? styles.botonDestructivo : styles.botonPrimario
            }`}
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando ? "Procesando..." : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};
