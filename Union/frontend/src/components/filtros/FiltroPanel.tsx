/**
 * Componente `FiltroPanel`: Panel selector de criterios de filtrado y visualizador de chips activos.
 * Presentación pura.
 * Renderiza los filtros activos mediante `Filtro.activos()` (T018) y expone mutadores para la UI.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-40 a RF-45, CB-10)
 * - Union/specs/001-plataforma-unificada/tasks.md (T081)
 */

import React from 'react'
import { Filtro } from '../../domain/Filtro'
import { TipoFiltro } from '../../domain/enums/TipoFiltro'
import { TipoContenido } from '../../domain/enums/TipoContenido'
import { OpcionesFiltro } from '../../services/filtroOpcionesService'
import { FiltroChip } from './FiltroChip'

export interface FiltroPanelProps {
  filtro: Filtro
  opcionesFiltro: OpcionesFiltro | null
  cargandoOpciones?: boolean
  geolocalizacionHabilitada: boolean
  mensajeGeolocalizacion?: string | null
  onTextoChange?: (texto: string) => void
  onEstiloChange?: (estilo?: string) => void
  onTecnicaChange?: (tecnica?: string) => void
  onTipoContenidoChange?: (tipo?: TipoContenido) => void
  onDistanciaChange?: (km?: number) => void
  onActivarGeolocalizacion?: () => void
  onRemoverFiltro: (tipo: TipoFiltro) => void
  onLimpiarFiltros: () => void
}

export const FiltroPanel: React.FC<FiltroPanelProps> = ({
  filtro,
  opcionesFiltro,
  cargandoOpciones = false,
  geolocalizacionHabilitada,
  mensajeGeolocalizacion,
  onTextoChange,
  onEstiloChange,
  onTecnicaChange,
  onTipoContenidoChange,
  onDistanciaChange,
  onActivarGeolocalizacion,
  onRemoverFiltro,
  onLimpiarFiltros,
}) => {
  const filtrosActivos = filtro.activos()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
      {/* Campo de búsqueda por texto libre */}
      <div>
        <label htmlFor="input-busqueda-texto" className="block text-xs font-semibold text-gray-600 mb-1">
          Buscar por palabra clave
        </label>
        <div className="relative">
          <input
            id="input-busqueda-texto"
            type="text"
            value={filtro.texto ?? ''}
            onChange={(e) => onTextoChange?.(e.target.value)}
            placeholder="Buscar títulos, tags..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3 top-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Selectores de facetas (Estilo, Técnica, Tipo de Arte) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Estilo */}
        <div>
          <label htmlFor="select-estilo" className="block text-xs font-medium text-gray-600 mb-1">
            Estilo
          </label>
          <select
            id="select-estilo"
            value={filtro.estilo ?? ''}
            onChange={(e) => onEstiloChange?.(e.target.value || undefined)}
            disabled={cargandoOpciones}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos los estilos</option>
            {opcionesFiltro?.estilos.map((estilo) => (
              <option key={estilo} value={estilo}>
                {estilo}
              </option>
            ))}
          </select>
        </div>

        {/* Técnica */}
        <div>
          <label htmlFor="select-tecnica" className="block text-xs font-medium text-gray-600 mb-1">
            Técnica
          </label>
          <select
            id="select-tecnica"
            value={filtro.tecnica ?? ''}
            onChange={(e) => onTecnicaChange?.(e.target.value || undefined)}
            disabled={cargandoOpciones}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas las técnicas</option>
            {opcionesFiltro?.tecnicas.map((tecnica) => (
              <option key={tecnica} value={tecnica}>
                {tecnica}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Arte */}
        <div>
          <label htmlFor="select-tipo-arte" className="block text-xs font-medium text-gray-600 mb-1">
            Tipo de Arte
          </label>
          <select
            id="select-tipo-arte"
            value={filtro.tipoContenido ?? ''}
            onChange={(e) =>
              onTipoContenidoChange?.(e.target.value ? (e.target.value as TipoContenido) : undefined)
            }
            disabled={cargandoOpciones}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
          >
            <option value="">Todos los tipos</option>
            {opcionesFiltro?.tiposContenido.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo.toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Control de Geolocalización y Filtro por Distancia (RF-45, CB-10) */}
      <div className="pt-2 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2">
          {!geolocalizacionHabilitada ? (
            <button
              type="button"
              onClick={onActivarGeolocalizacion}
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Activar geolocalización</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Ubicación activa</span>
              </span>
              <select
                aria-label="Distancia máxima"
                value={filtro.distanciaKm ?? ''}
                onChange={(e) =>
                  onDistanciaChange?.(e.target.value ? Number(e.target.value) : undefined)
                }
                className="px-2.5 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none"
              >
                <option value="">Cualquier distancia</option>
                <option value="5">Hasta 5 km</option>
                <option value="10">Hasta 10 km</option>
                <option value="25">Hasta 25 km</option>
                <option value="50">Hasta 50 km</option>
                <option value="100">Hasta 100 km</option>
              </select>
            </div>
          )}
        </div>

        {mensajeGeolocalizacion && (
          <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
            {mensajeGeolocalizacion}
          </p>
        )}
      </div>

      {/* Renderizado de chips de filtros activos (Filtro.activos()) y botón Limpiar */}
      {filtrosActivos.length > 0 && (
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Filtros aplicados:</span>
            {filtrosActivos.map((f) => (
              <FiltroChip
                key={`${f.tipo}-${f.valor}`}
                tipo={f.tipo}
                valor={f.valor}
                onRemover={onRemoverFiltro}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onLimpiarFiltros}
            className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors underline cursor-pointer"
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  )
}
