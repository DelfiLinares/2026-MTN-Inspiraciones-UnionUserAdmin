/**
 * SelectorFotos: selección de 1 a 5 fotos, JPEG o PNG, con mensajes por campo
 * (RF-02, A-06, CB-11).
 *
 * Tarea: T051
 * Depende de: T010 (Foto), T009
 *
 * Componente controlado. Valida cantidad y formato; el tamaño lo valida el backend (A-06).
 * Los errores externos (por ejemplo, de `Desafio.validar`) se reciben en `error`.
 */

import type { ChangeEvent } from "react";

export const MAXIMO_FOTOS = 5;
export const MINIMO_FOTOS = 1;
const TIPOS_ACEPTADOS: readonly string[] = ["image/jpeg", "image/png"];

export interface SelectorFotosProps {
  readonly fotos: readonly File[];
  readonly onChange: (fotos: File[]) => void;
  /** Error de validación externo (p. ej. el de `Desafio.validar` para el campo fotos). */
  readonly error?: string;
  readonly id?: string;
  readonly deshabilitado?: boolean;
}

/** Devuelve el mensaje de error de formato o cantidad, o undefined si es válido. */
export function validarSeleccionFotos(fotos: readonly File[]): string | undefined {
  if (fotos.some((f) => !TIPOS_ACEPTADOS.includes(f.type))) {
    return "Solo se admiten fotos JPEG o PNG.";
  }
  if (fotos.length > MAXIMO_FOTOS) {
    return `Puede subir como máximo ${MAXIMO_FOTOS} fotos.`;
  }
  return undefined;
}

export function SelectorFotos({
  fotos,
  onChange,
  error,
  id = "selector-fotos",
  deshabilitado = false,
}: SelectorFotosProps) {
  const idError = `${id}-error`;
  const errorSeleccion = validarSeleccionFotos(fotos);
  const mensaje = error ?? errorSeleccion;

  function alElegir(evento: ChangeEvent<HTMLInputElement>) {
    const nuevas: File[] = Array.from(evento.target.files ?? []);
    onChange([...fotos, ...nuevas]);
    evento.target.value = "";
  }

  function quitar(indice: number) {
    onChange(fotos.filter((_, i) => i !== indice));
  }

  return (
    <div className="selector-fotos">
      <label htmlFor={id}>
        Fotos ({MINIMO_FOTOS} a {MAXIMO_FOTOS}, JPEG o PNG)
      </label>
      <input
        id={id}
        type="file"
        accept={TIPOS_ACEPTADOS.join(",")}
        multiple
        disabled={deshabilitado || fotos.length >= MAXIMO_FOTOS}
        onChange={alElegir}
        aria-invalid={mensaje ? true : undefined}
        aria-describedby={mensaje ? idError : undefined}
      />

      <ul className="selector-fotos__lista" aria-label="Fotos seleccionadas">
        {fotos.map((foto, indice) => (
          <li key={`${foto.name}-${indice}`}>
            {foto.name}{" "}
            <button
              type="button"
              disabled={deshabilitado}
              onClick={() => quitar(indice)}
              aria-label={`Quitar ${foto.name}`}
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>

      {mensaje && (
        <p id={idError} className="selector-fotos__error" role="alert">
          {mensaje}
        </p>
      )}
    </div>
  );
}
