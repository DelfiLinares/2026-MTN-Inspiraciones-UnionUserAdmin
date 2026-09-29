/**
 * Pantalla de Desafíos (usuario) — `DesafiosPage.tsx`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (sección Resumen Ejecutivo — "participar de
 *   desafíos"; HU-14 describe la contraparte administrativa de revisión de propuestas)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T090)
 *
 * Descripción:
 * - Listado de desafíos vigentes usando `desafioService.listarDesafios` (T060).
 * - Formulario de propuesta de un nuevo desafío usando `desafioService.proponerDesafio`
 *   (`contenidoFormulario: Record<string, unknown>`, contrato genérico por Ambigüedad B2 diferida).
 * - Usa los componentes comunes `Spinner`, `Skeleton` y `EmptyState` (T083) para los estados de
 *   carga y vacío del listado.
 * - Bloquea el envío del formulario de propuesta mientras `enviando === true` o el usuario no está
 *   autenticado (`Desafio.puedeParticiparUsuarioActual`).
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../services/AuthContext'
import { desafioService } from '../../services/desafioService'
import type { Desafio } from '../../domain/Desafio'
import { Spinner, Skeleton, EmptyState } from '../../components/comunes'

export const DesafiosPage: React.FC = () => {
  const { estaAutenticado } = useAuth()

  const [desafios, setDesafios] = useState<Desafio[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensajePropuesta, setMensajePropuesta] = useState<string | null>(null)

  const cargarDesafios = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const items = await desafioService.listarDesafios()
      setDesafios(items)
    } catch {
      setError('No se pudieron cargar los desafíos. Intentá nuevamente más tarde.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarDesafios()
  }, [cargarDesafios])

  const puedeProponer = estaAutenticado && titulo.trim().length > 0 && descripcion.trim().length > 0

  const handleSubmitPropuesta = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!puedeProponer || enviando) {
      return
    }

    setEnviando(true)
    setMensajePropuesta(null)
    try {
      await desafioService.proponerDesafio({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
      })
      setMensajePropuesta('¡Tu propuesta fue enviada! Quedará pendiente de revisión.')
      setTitulo('')
      setDescripcion('')
    } catch {
      setMensajePropuesta('No se pudo enviar tu propuesta. Intentá nuevamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Desafíos</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Listado de desafíos vigentes */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Desafíos vigentes
          </h2>

          {cargando ? (
            <Skeleton variante="tarjeta" cantidad={3} />
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          ) : desafios.length === 0 ? (
            <EmptyState
              titulo="No hay desafíos activos"
              mensaje="Todavía no hay desafíos vigentes. ¡Proponé uno nuevo más abajo!"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {desafios.map((desafio) => (
                <article
                  key={desafio.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2"
                >
                  <h3 className="text-sm font-semibold text-gray-900">{desafio.titulo}</h3>
                  <p className="text-sm text-gray-600">{desafio.descripcion}</p>
                  {desafio.completadoPorUsuarioActual && (
                    <span className="inline-block text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">
                      Ya participaste
                    </span>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Formulario de propuesta de nuevo desafío */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Proponer un nuevo desafío
          </h2>

          {!estaAutenticado && (
            <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-100">
              Iniciá sesión para poder proponer un desafío.
            </div>
          )}

          {mensajePropuesta && (
            <div
              role="status"
              className="p-3 bg-indigo-50 text-indigo-800 text-sm rounded-lg border border-indigo-100"
            >
              {mensajePropuesta}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmitPropuesta}>
            <div>
              <label htmlFor="input-desafio-titulo" className="block text-xs font-medium text-gray-600 mb-1">
                Título
              </label>
              <input
                id="input-desafio-titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={enviando || !estaAutenticado}
                placeholder="Ej: Retrato en acuarela"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="input-desafio-descripcion" className="block text-xs font-medium text-gray-600 mb-1">
                Descripción
              </label>
              <textarea
                id="input-desafio-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={enviando || !estaAutenticado}
                rows={4}
                placeholder="Contá de qué se trata el desafío propuesto..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!puedeProponer || enviando}
              className="w-full py-2.5 px-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {enviando ? <Spinner tamano="sm" /> : null}
              <span>{enviando ? 'Enviando propuesta...' : 'Enviar propuesta'}</span>
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
