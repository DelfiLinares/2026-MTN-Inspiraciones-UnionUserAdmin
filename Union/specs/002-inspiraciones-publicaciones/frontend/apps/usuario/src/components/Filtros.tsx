// Filtros del feed por categoría, etiqueta y tipo de contenido (T052).
// Componente controlado: la página combina estos valores con el texto de BarraBusqueda.
// Spec: HU-06, RF-27. Res.: A-10 (solo filtros disponibles en el contrato: categoría/etiqueta y tipo).

import React, { useId } from "react";
import type { TipoContenido } from "@inspiraciones/shared";
import { TipoContenido as TiposContenido } from "@inspiraciones/shared";
import styles from "./Filtros.module.css";

export interface ValoresFiltros {
  readonly categoria?: string;
  readonly etiqueta?: string;
  readonly tipo?: TipoContenido;
}

export interface FiltrosProps {
  readonly valores: ValoresFiltros;
  readonly onCambiar: (valores: ValoresFiltros) => void;
  readonly className?: string;
}

const ETIQUETAS_TIPO: Readonly<Record<TipoContenido, string>> = {
  IMAGEN: "Imagen",
  VIDEO: "Video",
  AUDIO: "Audio",
};

/** Quita las claves vacías para no enviar filtros en blanco a la API. */
function limpiar(valores: {
  categoria?: string | undefined;
  etiqueta?: string | undefined;
  tipo?: TipoContenido | undefined;
}): ValoresFiltros {
  const resultado: { categoria?: string; etiqueta?: string; tipo?: TipoContenido } = {};
  const categoria = valores.categoria?.trim();
  const etiqueta = valores.etiqueta?.trim();
  if (categoria) resultado.categoria = categoria;
  if (etiqueta) resultado.etiqueta = etiqueta;
  if (valores.tipo) resultado.tipo = valores.tipo;
  return resultado;
}

export const Filtros: React.FC<FiltrosProps> = ({ valores, onCambiar, className = "" }) => {
  const idBase = useId();
  const hayFiltros = Boolean(valores.categoria || valores.etiqueta || valores.tipo);

  return (
    <fieldset className={`${styles.filtros} ${className}`.trim()} data-testid="filtros">
      <legend className={styles.etiqueta}>Filtros</legend>

      <div className={styles.campoGrupo}>
        <label htmlFor={`${idBase}-categoria`} className={styles.etiqueta}>
          Categoría
        </label>
        <input
          id={`${idBase}-categoria`}
          type="text"
          className={styles.control}
          value={valores.categoria ?? ""}
          onChange={(e) => onCambiar(limpiar({ ...valores, categoria: e.target.value }))}
        />
      </div>

      <div className={styles.campoGrupo}>
        <label htmlFor={`${idBase}-etiqueta`} className={styles.etiqueta}>
          Etiqueta
        </label>
        <input
          id={`${idBase}-etiqueta`}
          type="text"
          className={styles.control}
          value={valores.etiqueta ?? ""}
          onChange={(e) => onCambiar(limpiar({ ...valores, etiqueta: e.target.value }))}
        />
      </div>

      <div className={styles.campoGrupo}>
        <label htmlFor={`${idBase}-tipo`} className={styles.etiqueta}>
          Tipo de contenido
        </label>
        <select
          id={`${idBase}-tipo`}
          className={styles.control}
          value={valores.tipo ?? ""}
          onChange={(e) => {
            const elegido = Object.values(TiposContenido).find((t) => t === e.target.value);
            onCambiar(limpiar({ ...valores, tipo: elegido }));
          }}
        >
          <option value="">Todos</option>
          {Object.values(TiposContenido).map((tipo) => (
            <option key={tipo} value={tipo}>
              {ETIQUETAS_TIPO[tipo]}
            </option>
          ))}
        </select>
      </div>

      {hayFiltros && (
        <button type="button" className={styles.botonLimpiar} onClick={() => onCambiar({})}>
          Quitar filtros
        </button>
      )}
    </fieldset>
  );
};
