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
import { Link } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { feedService } from '../../services/feedService'
import { publicacionService } from '../../services/publicacionService'
import { useInfiniteList } from '../../services/useInfiniteList'
import type { Publicacion } from '../../domain/Publicacion'
import './home.css'

const obtenerVarianteTarjeta = (indiceColumna: number, indiceEnColumna: number) => {
  if (indiceColumna === 1 && indiceEnColumna === 0) {
    return 'long'
  }
  if (indiceColumna === 2) {
    return indiceEnColumna % 2 === 0 ? 'tall' : 'long'
  }
  if (indiceColumna === 0 && indiceEnColumna % 2 === 1) {
    return 'tall'
  }
  return 'normal'
}

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

  const columnas: Publicacion[][] = [[], [], []]
  items.forEach((publicacion, indice) => {
    columnas[indice % columnas.length].push(publicacion)
  })

  return (
    <div className="home-page">
      <header className="home-site-header">
        <Link className="home-brand" to="/feed">InspiraBoard</Link>
        <nav className="home-site-nav" aria-label="Navegación principal">
          <a href="#comunidad">Descubre</a>
          <a href="#challenge">Challenge</a>
          <Link
            className="home-profile"
            to={usuario?.id ? `/perfil/${usuario.id}` : '/login'}
            aria-label="Mi perfil"
          >
            <span aria-hidden="true">{usuario?.nombre?.charAt(0).toUpperCase() ?? ''}</span>
          </Link>
        </nav>
      </header>

      <main>
        <section className="home-hero" aria-label="Contenido destacado">
          <button className="home-hero-arrow home-hero-arrow--previous" type="button" aria-label="Anterior" disabled />
          <button className="home-hero-arrow home-hero-arrow--next" type="button" aria-label="Siguiente" disabled />
        </section>

        <section className="home-challenge" id="challenge" aria-labelledby="home-challenge-title">
          <div className="home-challenge-art" aria-hidden="true" />
          <div className="home-challenge-copy">
            <h2 id="home-challenge-title">Challenge semanal</h2>
            <p>Te invitamos a hacer el challenge de esta semana, el cual consiste en:</p>
            <p className="home-challenge-details">pipipipi<br />pipippfiṕfa<br />fjskfhñfhñf</p>
          </div>
        </section>

        <section className="home-community" id="comunidad" aria-labelledby="home-community-title">
          <h1 id="home-community-title">Inspirate de nuestra comunidad</h1>

          {items.length > 0 && (
            <div className="home-post-grid">
              {columnas.map((columna, indiceColumna) => (
                <div className="home-post-column" key={`columna-${indiceColumna}`}>
                  {columna.map((publicacion, indiceEnColumna) => {
                    const variante = obtenerVarianteTarjeta(indiceColumna, indiceEnColumna)
                    const contenido = String(publicacion.tipoContenido).toLocaleLowerCase('es-AR')
                    const likeEnCurso = idsConLikeEnCurso.has(publicacion.id)

                    return (
                      <article
                        className={`home-post-card home-post-card--${variante}`}
                        key={publicacion.id}
                      >
                        <div className="home-post-media" aria-hidden="true" />
                        <div className="home-post-copy">
                          <div className="home-post-author">
                            <span className="home-post-avatar" aria-hidden="true">A</span>
                            <div>
                              <span className="home-post-author-name">Artista</span>
                              <span className="home-post-type">{contenido}</span>
                            </div>
                          </div>

                          <h2>Publicación de {contenido}</h2>

                          {publicacion.tags.length > 0 && (
                            <p className="home-post-tags">
                              {publicacion.tags.map((tag) => <span key={tag}>#{tag}</span>)}
                            </p>
                          )}

                          <div className="home-post-actions">
                            <button
                              className={`home-post-action home-post-like ${publicacion.likeDelUsuarioActual ? 'is-liked' : ''}`}
                              type="button"
                              onClick={() => handleToggleLike(publicacion.id)}
                              disabled={likeEnCurso}
                              aria-label={publicacion.likeDelUsuarioActual ? 'Quitar Me gusta' : 'Dar Me gusta'}
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span>{publicacion.cantidadLikes}</span>
                            </button>
                            <button
                              className="home-post-action home-post-report"
                              type="button"
                              onClick={() => handleReportar(publicacion.id)}
                              disabled={publicacion.reportadaPorUsuarioActual}
                              aria-label={publicacion.reportadaPorUsuarioActual ? 'Publicación reportada' : 'Reportar publicación'}
                              title={publicacion.reportadaPorUsuarioActual ? 'Ya reportaste esta publicación' : 'Reportar publicación'}
                            >
                              {publicacion.reportadaPorUsuarioActual ? 'Reportada' : 'Reportar'}
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          {!cargando && items.length === 0 && !error && (
            <div className="home-empty-state">
              <h2>Tu feed está vacío</h2>
              <p>Seguí a otros artistas para ver sus publicaciones acá.</p>
            </div>
          )}

          {error != null && (
            <div className="home-feed-error" role="alert">
              <span>Ocurrió un error al cargar las publicaciones.</span>
              <button type="button" onClick={() => { void recargar() }}>Intentar de nuevo</button>
            </div>
          )}

          {cargando && (
            <p className="home-feed-loading" role="status">
              {items.length === 0 ? 'Cargando publicaciones...' : 'Cargando más resultados...'}
            </p>
          )}

          {finDeResultados && !cargando && (
            <p className="home-feed-end">Llegaste al final de las publicaciones</p>
          )}

          {hayMas && !cargando && (
            <div className="home-feed-sentinel" ref={centinelaRef} aria-hidden="true" />
          )}
        </section>
      </main>

      <footer className="home-site-footer" aria-label="Pie de página" />
    </div>
  )
}
