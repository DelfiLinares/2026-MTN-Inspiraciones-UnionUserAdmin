/* eslint-disable @typescript-eslint/consistent-type-assertions -- useParams y manipulación de formularios con datos genéricos requieren casting. */
// Modal para guardar o quitar una publicación en una o más carpetas (T050).
// Cumple con accesibilidad aria (role="dialog", foco atrapado, Escape), selección múltiple y sincronización optimista.
// Spec: HU-09, RF-17, RF-18.

import React, { useEffect, useRef, useId } from "react";
import type { Carpeta, Publicacion } from "@inspiraciones/shared";
import { EstadoVacio, Skeleton } from "@inspiraciones/shared";
import styles from "./ModalGuardar.module.css";

export interface ModalGuardarProps {
  readonly abierta: boolean;
  readonly publicacion: Publicacion;
  readonly carpetas: readonly Carpeta[];
  readonly carpetasSeleccionadasIds: readonly string[];
  readonly estaCargando?: boolean;
  readonly carpetaEnProcesoId?: string | null;
  readonly onToggleCarpeta: (carpetaId: string) => void;
  readonly onCerrar: () => void;
}

export const ModalGuardar: React.FC<ModalGuardarProps> = ({
  abierta,
  publicacion,
  carpetas,
  carpetasSeleccionadasIds,
  estaCargando = false,
  carpetaEnProcesoId = null,
  onToggleCarpeta,
  onCerrar,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tituloId = useId();

  // Guardar y restaurar foco
  useEffect(() => {
    if (abierta) {
      triggerRef.current = document.activeElement as HTMLElement | null;
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [abierta]);

  // Manejo de foco atrapado y tecla Escape
  useEffect(() => {
    if (!abierta) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const selectorInteractivos =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const elementosEnfocables = dialog.querySelectorAll<HTMLElement>(selectorInteractivos);
    if (elementosEnfocables.length > 0) {
      elementosEnfocables[0]?.focus();
    } else {
      dialog.focus();
    }

    const handleKeyDown = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        onCerrar();
        return;
      }

      if (evento.key === "Tab") {
        const elementos = Array.from(dialog.querySelectorAll<HTMLElement>(selectorInteractivos));
        if (elementos.length === 0) {
          evento.preventDefault();
          return;
        }

        const primerElem = elementos[0];
        const ultimoElem = elementos[elementos.length - 1];

        if (evento.shiftKey) {
          if (document.activeElement === primerElem || !dialog.contains(document.activeElement)) {
            evento.preventDefault();
            ultimoElem?.focus();
          }
        } else {
          if (document.activeElement === ultimoElem || !dialog.contains(document.activeElement)) {
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
  }, [abierta, onCerrar]);

  if (!abierta) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCerrar();
        }
      }}
      data-testid="modal-guardar-overlay"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className={styles.modal}
        data-testid="modal-guardar"
      >
        <header className={styles.cabecera}>
          <div>
            <h2 id={tituloId} className={styles.titulo}>
              Guardar en carpeta
            </h2>
            <span style={{ fontSize: "0.875rem", color: "var(--color-texto-suave)" }}>
              {publicacion.titulo}
            </span>
          </div>
          <button
            type="button"
            className={styles.botonCerrar}
            onClick={onCerrar}
            aria-label="Cerrar modal de guardado"
          >
            ✕
          </button>
        </header>

        <div className={styles.cuerpo}>
          {estaCargando ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Skeleton variante="rectangulo" alto={48} />
              <Skeleton variante="rectangulo" alto={48} />
              <Skeleton variante="rectangulo" alto={48} />
            </div>
          ) : carpetas.length === 0 ? (
            <EstadoVacio
              titulo="No tienes carpetas creadas"
              descripcion="Crea una carpeta en tu perfil para organizar tus publicaciones guardadas."
            />
          ) : (
            <ul className={styles.listaCarpetas}>
              {carpetas.map((carpeta) => {
                const estaSeleccionada = carpetasSeleccionadasIds.includes(carpeta.id);
                const enProceso = carpetaEnProcesoId === carpeta.id;

                return (
                  <li key={carpeta.id} className={styles.itemCarpeta}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={estaSeleccionada}
                        onChange={() => onToggleCarpeta(carpeta.id)}
                        disabled={enProceso}
                        aria-label={`Guardar en carpeta ${carpeta.nombre}`}
                      />
                      <div className={styles.infoCarpeta}>
                        <span className={styles.nombreCarpeta}>{carpeta.nombre}</span>
                        <span className={styles.metaCarpeta}>
                          {carpeta.cantidadPublicaciones} publicaciones •{" "}
                          {carpeta.visibilidad === "PUBLICA" ? "Pública" : "Privada"}
                        </span>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className={styles.pie}>
          <button type="button" className={styles.botonListo} onClick={onCerrar}>
            Listo
          </button>
        </footer>
      </div>
    </div>
  );
};
