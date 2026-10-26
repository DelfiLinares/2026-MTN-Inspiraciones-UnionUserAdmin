import React, { useMemo } from 'react'
import {
  FiltrosListadoDesafios,
  EstadoFiltroDesafio,
  construirSearchDesdeFiltros,
} from '../../pages/desafios/listado/filtrosUrl'

/**
 * T048 - FiltrosDesafio: Componente para filtrar desafíos.
 *
 * Características:
 * - Ámbito: selección múltiple (checkboxes)
 * - Estado: selección única (select)
 * - Sincronización con URL: mantiene filtros en query params
 * - Limpieza de filtros: opción para volver a valores por defecto (HU-10)
 *
 * Fuente: Union/specs/003-desafios/tasks.md (T048)
 * Dependencias: filtrosUrl.ts (T057)
 */

export interface FiltrosDesafioProps {
  filtros: FiltrosListadoDesafios
  ambitos: string[]
  onFiltrosChange: (nuevosFiltros: FiltrosListadoDesafios) => void
}

/**
 * Componente que renderiza los filtros de desafíos con sincronización a URL.
 */
export const FiltrosDesafio: React.FC<FiltrosDesafioProps> = ({
  filtros,
  ambitos,
  onFiltrosChange,
}) => {
  const handleEstadoChange = (nuevoEstado: string) => {
    const estado = nuevoEstado ? (nuevoEstado as EstadoFiltroDesafio) : undefined
    onFiltrosChange({
      ...filtros,
      estado,
    })
  }

  const handleAmbitoChange = (ambito: string, checked: boolean) => {
    const nuevosAmbitos = checked
      ? [...filtros.ambitos, ambito]
      : filtros.ambitos.filter((a: string) => a !== ambito)

    onFiltrosChange({
      ...filtros,
      ambitos: nuevosAmbitos,
    })
  }

  const handleLimpiarFiltros = () => {
    onFiltrosChange({
      ambitos: [],
      estado: undefined,
    })
  }

  const hayFiltrosActivos = useMemo(
    () => filtros.ambitos.length > 0 || Boolean(filtros.estado),
    [filtros],
  )

  return (
    <section className="filtros-desafio" aria-label="Filtros de desafíos">
      <div className="filtro-grupo">
        <label htmlFor="filtro-estado">Estado</label>
        <select
          id="filtro-estado"
          value={filtros.estado ?? ''}
          onChange={(e) => handleEstadoChange(e.target.value)}
          aria-describedby="filtro-estado-descripcion"
        >
          <option value="">Todos</option>
          <option value="PROGRAMADO">Programado</option>
          <option value="ACTIVO">Activo</option>
          <option value="FINALIZADO">Finalizado</option>
        </select>
        <span id="filtro-estado-descripcion" className="sr-only">
          Filtra los desafíos por su estado: programado, activo o finalizado.
        </span>
      </div>

      <fieldset className="filtro-grupo">
        <legend>Ámbitos</legend>
        <div role="group" aria-label="Ámbitos disponibles">
          {ambitos.length > 0 ? (
            ambitos.map((ambito) => (
              <label key={ambito} className="filtro-ambito">
                <input
                  type="checkbox"
                  value={ambito}
                  checked={filtros.ambitos.includes(ambito)}
                  onChange={(e) => handleAmbitoChange(ambito, e.target.checked)}
                  aria-describedby={`ambito-desc-${ambito}`}
                />
                {ambito}
              </label>
            ))
          ) : (
            <p className="sr-only">No hay ámbitos disponibles</p>
          )}
        </div>
      </fieldset>

      {hayFiltrosActivos && (
        <button
          type="button"
          onClick={handleLimpiarFiltros}
          className="filtro-limpiar"
          aria-label="Limpiar todos los filtros"
        >
          Limpiar filtros
        </button>
      )}
    </section>
  )
}

export default FiltrosDesafio
