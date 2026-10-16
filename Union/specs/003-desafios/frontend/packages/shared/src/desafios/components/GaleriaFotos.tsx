/**
 * GaleriaFotos: muestra todas las fotos de un desafío en el detalle (HU-11, RF-18),
 * con carga diferida de imágenes.
 *
 * Tarea: T049
 * Depende de: T010 (Foto)
 *
 * Solo presenta: la regla de 1 a 5 fotos y una principal la valida el dominio (A-06).
 * La foto principal se muestra primero.
 */

import type { FotoLectura } from "../application/ports/tiposDesafios";

export interface GaleriaFotosProps {
  readonly fotos: readonly FotoLectura[];
  /** Nombre del desafío, usado en el texto alternativo. */
  readonly nombre: string;
  readonly className?: string;
}

export function GaleriaFotos({ fotos, nombre, className }: GaleriaFotosProps) {
  if (fotos.length === 0) {
    return null;
  }

  const clases = ["galeria-fotos", className].filter(Boolean).join(" ");
  const ordenadas = [...fotos].sort(
    (a, b) => Number(b.principal) - Number(a.principal),
  );

  return (
    <ul className={clases} aria-label={`Fotos de ${nombre}`}>
      {ordenadas.map((foto, indice) => (
        <li
          key={foto.id}
          className={
            foto.principal
              ? "galeria-fotos__item galeria-fotos__item--principal"
              : "galeria-fotos__item"
          }
        >
          <img
            src={foto.url}
            alt={`Foto ${indice + 1} de ${ordenadas.length} de ${nombre}`}
            loading="lazy"
            decoding="async"
          />
        </li>
      ))}
    </ul>
  );
}
