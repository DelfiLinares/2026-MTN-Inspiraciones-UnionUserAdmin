/**
 * FiltrosDesafio: filtro por ámbito (selección múltiple) y por estado (HU-10, RF-17).
 * El filtro por fecha queda fuera hasta resolver A-14.
 *
 * Tarea: T048
 * Depende de: T039 (useListarAmbitos), T007 (EstadoDesafio), T009
 *
 * Componente controlado: no filtra listas en memoria; solo emite los filtros
 * que se envían a la API.
 */

import type { FiltrosDesafios } from "../application/ports/DesafiosPort";
import { EstadoDesafio } from "../domain/enums/EstadoDesafio";
import { useListarAmbitos } from "../hooks/useListarAmbitos";

export interface FiltrosDesafioProps {
  readonly filtros: FiltrosDesafios;
  readonly onChange: (filtros: FiltrosDesafios) => void;
}

// ELIMINADO no se expone en la API (A-01), por lo que no se ofrece como filtro.
const ESTADOS_FILTRABLES: readonly EstadoDesafio[] = [
  EstadoDesafio.PROGRAMADO,
  EstadoDesafio.ACTIVO,
  EstadoDesafio.FINALIZADO,
];

const ETIQUETAS: Readonly<Record<EstadoDesafio, string>> = {
  [EstadoDesafio.PROGRAMADO]: "Programado",
  [EstadoDesafio.ACTIVO]: "Activo",
  [EstadoDesafio.FINALIZADO]: "Finalizado",
  [EstadoDesafio.ELIMINADO]: "Eliminado",
};

function alternar<T>(lista: readonly T[] | undefined, valor: T): T[] {
  const actual = lista ?? [];
  return actual.includes(valor) ? actual.filter((v) => v !== valor) : [...actual, valor];
}

export function FiltrosDesafio({ filtros, onChange }: FiltrosDesafioProps) {
  const { data: ambitos, isLoading, error } = useListarAmbitos();

  const hayFiltros =
    (filtros.ambitos?.length ?? 0) > 0 || (filtros.estados?.length ?? 0) > 0;

  return (
    <form className="filtros-desafio" aria-label="Filtros de desafíos">
      <fieldset className="filtros-desafio__ambitos">
        <legend>Ámbito</legend>
        {isLoading && <p>Cargando ámbitos...</p>}
        {error && <p role="alert">No se pudieron cargar los ámbitos.</p>}
        {ambitos?.map((ambito) => (
          <label key={ambito.valor}>
            <input
              type="checkbox"
              checked={filtros.ambitos?.includes(ambito.valor) ?? false}
              onChange={() =>
                onChange({ ...filtros, ambitos: alternar(filtros.ambitos, ambito.valor) })
              }
            />{" "}
            {ambito.valor}
          </label>
        ))}
      </fieldset>

      <fieldset className="filtros-desafio__estados">
        <legend>Estado</legend>
        {ESTADOS_FILTRABLES.map((estado) => (
          <label key={estado}>
            <input
              type="checkbox"
              checked={filtros.estados?.includes(estado) ?? false}
              onChange={() =>
                onChange({ ...filtros, estados: alternar(filtros.estados, estado) })
              }
            />{" "}
            {ETIQUETAS[estado]}
          </label>
        ))}
      </fieldset>

      <button type="button" disabled={!hayFiltros} onClick={() => onChange({})}>
        Limpiar filtros
      </button>
    </form>
  );
}
