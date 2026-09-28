/**
 * Pantalla Descubrir — `DescubrirPage.tsx` (HU-03).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-03, RF-40 a RF-45, CB-05, CB-10)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T088)
 *
 * Descripción:
 * - Usa `useDescubrirFiltros` (T055) como orquestador de filtros, geolocalización y paginación.
 * - Usa `FiltroPanel` (T081) para la selección de criterios y visualización de chips activos.
 * - Usa `InfiniteScrollList` (T083), que a su vez integra `EmptyState` y `Skeleton` para los
 *   estados de carga y vacío del listado de resultados.
 * - Renderiza cada resultado con `PublicacionCard` (T080).
 */

import React from 'react'
import { useDescubrirFiltros } from '../../services/useDescubrirFiltros'
import { FiltroPanel } from '../../components/filtros'
import { InfiniteScrollList } from '../../components/comunes'
import { PublicacionCard } from '../../components/publicacion'
import type { Publicacion } from '../../domain/Publicacion'

export const DescubrirPage: React.FC = () => {
  const {
    items,
    cargando,
    hayMas,
    finDeResultados,
    error,
    centinelaRef,
    filtro,
    opcionesFiltro,
    cargandoOpciones,
    geolocalizacionHabilitada,
    mensajeGeolocalizacion,
    establecerTexto,
    establecerEstilo,
    establecerTecnica,
    establecerDistancia,
    quitarFiltro,
    limpiarFiltros,
    activarGeolocalizacion,
  } = useDescubrirFiltros()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Descubrir</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <FiltroPanel
          filtro={filtro}
          opcionesFiltro={opcionesFiltro}
          cargandoOpciones={cargandoOpciones}
          geolocalizacionHabilitada={geolocalizacionHabilitada}
          mensajeGeolocalizacion={mensajeGeolocalizacion}
          onTextoChange={establecerTexto}
          onEstiloChange={establecerEstilo}
          onTecnicaChange={establecerTecnica}
          onDistanciaChange={establecerDistancia}
          onActivarGeolocalizacion={() => {
            void activarGeolocalizacion()
          }}
          onRemoverFiltro={quitarFiltro}
          onLimpiarFiltros={limpiarFiltros}
        />

        <InfiniteScrollList<Publicacion>
          items={items}
          cargando={cargando}
          hayMas={hayMas}
          finDeResultados={finDeResultados}
          error={error}
          centinelaRef={centinelaRef}
          tituloVacio="No encontramos resultados"
          mensajeVacio="Probá ajustar los filtros de búsqueda para descubrir más contenido."
          renderItem={(publicacion) => <PublicacionCard publicacion={publicacion} />}
        />
      </main>
    </div>
  )
}
