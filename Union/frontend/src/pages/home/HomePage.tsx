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
 * - Presenta publicaciones y una consigna real en una grilla, sin carrusel.
 * - Conserva los servicios de likes y reportes y sus estados de carga/error.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { feedService } from '../../services/feedService'
import { publicacionService } from '../../services/publicacionService'
import { reporteService } from '../../services/reporteService'
import { ApiError } from '../../infrastructure/httpClient'
import { useInfiniteList } from '../../services/useInfiniteList'
import { useModalFocus } from '../../presentation/admin/useModalFocus'
import type { Publicacion } from '../../domain/Publicacion'
import type { MotivoReporte } from '../../domain/enums/MotivoReporte'
import './home.css'
import { ChallengeInicio } from './ChallengeInicio'

export const HomePage: React.FC = () => {
  const { usuario, estaAutenticado } = useAuth()
  const [seccion, setSeccion] = useState<'recomendados' | 'desafios'>('recomendados')
  const [errorLike, setErrorLike] = useState<string | null>(null)
  const [errorMotivos, setErrorMotivos] = useState(false)

  const [idsConLikeEnCurso, setIdsConLikeEnCurso] = useState<Set<string>>(new Set())
  const [idsReportados, setIdsReportados] = useState<Set<string>>(new Set())
  const [publicacionAReportar, setPublicacionAReportar] = useState<string | null>(null)
  const [motivoReporte, setMotivoReporte] = useState('')
  const [enviandoReporte, setEnviandoReporte] = useState(false)
  const [errorReporte, setErrorReporte] = useState<string | null>(null)
  const [avisoReporte, setAvisoReporte] = useState<string | null>(null)
  const [motivosReporte, setMotivosReporte] = useState<MotivoReporte[]>([])

  useEffect(() => {
    if (!avisoReporte) {
      return undefined
    }
    const temporizador = setTimeout(() => setAvisoReporte(null), 4000)
    return () => clearTimeout(temporizador)
  }, [avisoReporte])

  useEffect(() => {
    reporteService.obtenerMotivos().then(setMotivosReporte).catch(() => setErrorMotivos(true))
  }, [])
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
      setErrorLike(null)
      try {
        await publicacionService.alternarLike(
          publicacionActual,
          usuario?.id ?? '',
          estaAutenticado,
        )
        await recargar()
      } catch {
        setErrorLike('No pudimos actualizar el Me gusta. Volvé a intentar.')
      } finally {
        marcarLikeEnCurso(publicacionId, false)
      }
    },
    [items, usuario, estaAutenticado, recargar],
  )

  const handleReportar = useCallback((publicacionId: string) => {
    setMotivoReporte('')
    setErrorReporte(null)
    setAvisoReporte(null)
    setPublicacionAReportar(publicacionId)
  }, [])

  const cerrarModalReporte = () => {
    if (!enviandoReporte) {
      setPublicacionAReportar(null)
    }
  }
  const reporteModalRef = useModalFocus(publicacionAReportar !== null, cerrarModalReporte, enviandoReporte)

  const confirmarReporte = async () => {
    if (!publicacionAReportar || !motivoReporte) {
      return
    }
    setEnviandoReporte(true)
    setErrorReporte(null)
    try {
      await reporteService.enviarReporte(publicacionAReportar, motivoReporte)
      setIdsReportados((actual) => new Set(actual).add(publicacionAReportar))
      setAvisoReporte('Reporte enviado. Gracias por ayudarnos a moderar.')
      setPublicacionAReportar(null)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setIdsReportados((actual) => new Set(actual).add(publicacionAReportar))
        setAvisoReporte('Ya reportaste esta publicación.')
        setPublicacionAReportar(null)
      } else {
        setErrorReporte('No se pudo enviar el reporte. Intentá de nuevo.')
      }
    } finally {
      setEnviandoReporte(false)
    }
  }

  return (
    <div className="home-page">
      <main>
        <div className="home-heading">
          <div><p className="trama-eyebrow">Comunidad creativa</p><h1>Tu próxima idea empieza acá</h1></div>
          <Link to="/buscar">Explorar con filtros →</Link>
        </div>
        <nav className="trama-tabs" aria-label="Contenido de inicio">
          <button type="button" aria-pressed={seccion === 'recomendados'} onClick={() => setSeccion('recomendados')}>Para vos</button>
          <button type="button" aria-pressed={seccion === 'desafios'} onClick={() => setSeccion('desafios')}>Desafíos</button>
        </nav>
        {seccion === 'desafios' ? (
          <section aria-label="Desafíos de inicio">
            <ChallengeInicio />
            <div className="home-challenge-links">
              <Link to="/desafios">Explorar todas las consignas</Link>
              <Link to="/desafios/solicitar">Proponer un desafío</Link>
              <Link to="/desafios/mis-solicitudes">Mis solicitudes</Link>
            </div>
          </section>
        ) : (
        <section className="home-community" id="comunidad" aria-label="Publicaciones recomendadas">
          {errorLike && <p role="alert">{errorLike}</p>}

            <div className="home-post-grid">
              <ChallengeInicio />
                  {items.map((publicacion) => {
                    const contenido = String(publicacion.tipoContenido).toLocaleLowerCase('es-AR')
                    const likeEnCurso = idsConLikeEnCurso.has(publicacion.id)
                    const reportada = publicacion.reportadaPorUsuarioActual || idsReportados.has(publicacion.id)

                    return (
                      <article
                        className="home-post-card"
                        key={publicacion.id}
                      >
                        <Link className="home-post-media" to={`/publicaciones/${encodeURIComponent(publicacion.id)}`} aria-label={publicacion.contenido || `Ver publicación de ${contenido}`}>
                          {publicacion.fotoUrl ? (
                            <img src={publicacion.fotoUrl} alt={`Imagen de publicación: ${publicacion.contenido ?? contenido}`} />
                          ) : (
                            <span className="home-post-media-fallback" aria-hidden="true">{contenido}</span>
                          )}
                        </Link>
                        <div className="home-post-copy">
                          <div className="home-post-author">
                            <span className="home-post-avatar" aria-hidden="true">A</span>
                            <div>
                              <Link className="home-post-author-name" to={`/perfil/${encodeURIComponent(publicacion.autorId)}`}>Ver artista</Link>
                              <span className="home-post-type">{contenido}</span>
                            </div>
                          </div>

                          <h2>{publicacion.contenido || `Publicación de ${contenido}`}</h2>

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
                              aria-pressed={publicacion.likeDelUsuarioActual}
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
                              disabled={reportada}
                              aria-label={reportada ? 'Publicación reportada' : 'Reportar publicación'}
                              title={reportada ? 'Ya reportaste esta publicación' : 'Reportar publicación'}
                            >
                              {reportada ? 'Reportada' : 'Reportar'}
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
            </div>

          {!cargando && items.length === 0 && !error && (
            <div className="home-empty-state">
              <h2>Tu feed está vacío</h2>
              <p>Todavía no hay obras para mostrar. Explorá otras disciplinas.</p>
              <Link to="/buscar">Descubrir obras</Link>
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
        )}
      </main>

      {avisoReporte && (
        <div className="home-report-toast" role="status">{avisoReporte}</div>
      )}

      {publicacionAReportar && (
        <div className="home-report-backdrop" onClick={cerrarModalReporte}>
          <div
            className="home-report-modal"
            ref={reporteModalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-report-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="home-report-title">Reportar publicación</h2>
            <p>Elegí el motivo del reporte:</p>
            {errorMotivos && <p role="alert">No pudimos cargar los motivos. Cerrá este diálogo y recargá la página para volver a intentar.</p>}
            <div className="home-report-options">
              {motivosReporte.map((motivo) => (
                <label key={motivo.codigo}>
                  <input
                    type="radio"
                    name="motivo-reporte"
                    value={motivo.codigo}
                    checked={motivoReporte === motivo.codigo}
                    onChange={() => setMotivoReporte(motivo.codigo)}
                    disabled={enviandoReporte}
                  />
                  <span>{motivo.etiqueta}</span>
                </label>
              ))}
            </div>
            {errorReporte && <p className="home-report-error" role="alert">{errorReporte}</p>}
            <div className="home-report-buttons">
              <button type="button" onClick={cerrarModalReporte} disabled={enviandoReporte}>
                Cancelar
              </button>
              <button
                type="button"
                className="home-report-confirm"
                onClick={confirmarReporte}
                disabled={!motivoReporte || enviandoReporte}
              >
                {enviandoReporte ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
