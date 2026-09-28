/**
 * Pantalla Home (Feed) — `HomePage.tsx`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-43, CB-05, RF-31 a RF-35)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T087)
 *
 * Descripción:
 * - Usa `feedService.obtenerPagina` (T056) como fuente de datos paginados del feed.
 * - Usa `useInfiniteList` (T054) para orquestar la paginación/scroll infinito, exponiendo el
 *   estado explícito de fin de resultados (CB-05).
 * - Renderiza cada publicación mediante `PublicacionCard` (T080), delegando alternar-like y
 *   reporte a `publicacionService` (RF-31 a RF-35).
 * - Usa `InfiniteScrollList` (T083) para los estados de carga/vacío/fin de lista reutilizables.
 */

import React, { useCallback, useState } from 'react'
import { useAuth } from '../../services/AuthContext'
import { feedService } from '../../services/feedService'
import { publicacionService } from '../../services/publicacionService'
import { useInfiniteList } from '../../services/useInfiniteList'
import { InfiniteScrollList } from '../../components/comunes'
import { PublicacionCard } from '../../components/publicacion'
import type { Publicacion } from '../../domain/Publicacion'

export const HomePage: React.FC = () => {
  const { usuario, estaAutenticado } = useAuth()

  const [idsConLikeEnCurso, setIdsConLikeEnCurso] = useState<Set<string>>(new Set())

  const {
    items,
    cargando,
    hayMas,
    finDeResultados,
    error,
    centinelaRef,
    recargar,
  } = useInfiniteList<Publicacion>(feedService.obtenerPagina)

  const marcarLikeEnCurso = (publicacionId: string, enCurso: boolean) => {
    setIdsConLikeEnCurso((actual) => {
      const nuevo = new Set(actual)
      if (enCurso) {
        nuevo.add(publicacionId)
      } else {
        nuevo.delete(publicacionId)
      }
      return nuevo
    })
  }

  const handleToggleLike = useCallback(
    async (publicacionId: string) => {
      const publicacionActual = items.find((p) => p.id === publicacionId)
      if (!publicacionActual) {
        return
      }

      marcarLikeEnCurso(publicacionId, true)
      try {
        await publicacionService.alternarLike(
          publicacionActual,
          usuario?.id ?? '',
          estaAutenticado,
        )
        await recargar()
      } catch {
        // El servicio ya gestiona la reversión optimista internamente ante fallo (CB-02)
      } finally {
        marcarLikeEnCurso(publicacionId, false)
      }
    },
    [items, usuario, estaAutenticado, recargar],
  )

  const handleReportar = useCallback((publicacionId: string) => {
    // La apertura del flujo de selección de motivo de reporte (RF-34) se resuelve en la
    // pantalla/modal dedicada de reporte (fuera del alcance de T087).
    // Aquí solo se expone el punto de entrada delegando el id de la publicación.
    console.info('Reportar publicación', publicacionId)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Inicio</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <InfiniteScrollList<Publicacion>
          items={items}
          cargando={cargando}
          hayMas={hayMas}
          finDeResultados={finDeResultados}
          error={error}
          centinelaRef={centinelaRef}
          tituloVacio="Tu feed está vacío"
          mensajeVacio="Seguí a otros artistas para ver sus publicaciones acá."
          renderItem={(publicacion) => (
            <PublicacionCard
              publicacion={publicacion}
              onToggleLike={handleToggleLike}
              onReportar={handleReportar}
              cargandoLike={idsConLikeEnCurso.has(publicacion.id)}
            />
          )}
        />
      </main>
    </div>
  )
}
