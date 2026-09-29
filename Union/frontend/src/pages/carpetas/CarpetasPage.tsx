/**
 * Pantalla Carpetas (Mis Carpetas) — `CarpetasPage.tsx` (HU-09).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-09, RF-48 a RF-53, AC-09.1 a AC-09.7)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T093)
 *
 * Descripción:
 * - Listado propio de carpetas usando `carpetaService.obtenerCarpetas` (T061), con nombre y
 *   cantidad de posts por carpeta (AC-09.3), visible sin degradación hasta 100 carpetas (AC-09.6).
 * - Creación de carpeta indicando un nombre (AC-09.1), bloqueando la creación al alcanzar el
 *   límite máximo (`puedeCrearNuevaCarpeta`, RF-52, AC-09.6).
 * - Eliminación de carpeta con advertencia explícita de que el contenido guardado se perderá,
 *   aclarando que los posts originales no se eliminan de la plataforma (AC-09.4).
 * - Reutiliza `CarpetaCard` (T082) para la presentación de cada carpeta.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../services/AuthContext'
import { carpetaService, LIMITE_MAXIMO_CARPETAS, puedeCrearNuevaCarpeta } from '../../services/carpetaService'
import type { Carpeta } from '../../domain/Carpeta'
import { CarpetaCard } from '../../components/carpetas'
import { Spinner, Skeleton, EmptyState } from '../../components/comunes'

export const CarpetasPage: React.FC = () => {
  const { usuario } = useAuth()
  const usuarioActualId = usuario?.id ?? ''

  const [carpetas, setCarpetas] = useState<Carpeta[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [nombreNuevaCarpeta, setNombreNuevaCarpeta] = useState('')
  const [creando, setCreando] = useState(false)
  const [errorCreacion, setErrorCreacion] = useState<string | null>(null)

  const [idEliminando, setIdEliminando] = useState<string | null>(null)

  const cargarCarpetas = useCallback(async () => {
    if (!usuarioActualId) {
      return
    }
    setCargando(true)
    setError(null)
    try {
      const items = await carpetaService.obtenerCarpetas(usuarioActualId)
      setCarpetas(items)
    } catch {
      setError('No se pudieron cargar tus carpetas. Intentá nuevamente más tarde.')
    } finally {
      setCargando(false)
    }
  }, [usuarioActualId])

  useEffect(() => {
    cargarCarpetas()
  }, [cargarCarpetas])

  const limiteAlcanzado = !puedeCrearNuevaCarpeta(carpetas.length)

  const handleCrearCarpeta = async (e: React.FormEvent) => {
    e.preventDefault()
    const nombreLimpio = nombreNuevaCarpeta.trim()

    if (!nombreLimpio) {
      setErrorCreacion('Ingresá un nombre para la carpeta.')
      return
    }

    if (limiteAlcanzado) {
      setErrorCreacion(`Alcanzaste el límite máximo de ${LIMITE_MAXIMO_CARPETAS} carpetas.`)
      return
    }

    setCreando(true)
    setErrorCreacion(null)
    try {
      const nueva = await carpetaService.crearCarpeta(nombreLimpio, carpetas.length)
      setCarpetas((actuales) => [...actuales, nueva])
      setNombreNuevaCarpeta('')
    } catch (err: unknown) {
      const mensaje =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'No se pudo crear la carpeta.'
      setErrorCreacion(mensaje)
    } finally {
      setCreando(false)
    }
  }

  const handleEliminarCarpeta = async (carpeta: Carpeta) => {
    // AC-09.4: Advertencia explícita de que el contenido guardado se perderá
    // (los posts originales no se eliminan de la plataforma).
    const confirmado = window.confirm(
      `¿Eliminar la carpeta "${carpeta.nombre}"? Se perderá la organización de las ${carpeta.cantidadPosts} publicaciones guardadas en ella. Las publicaciones originales no se eliminarán de la plataforma.`
    )
    if (!confirmado) {
      return
    }

    setIdEliminando(carpeta.id)
    try {
      await carpetaService.eliminarCarpeta(carpeta.id)
      setCarpetas((actuales) => actuales.filter((c) => c.id !== carpeta.id))
    } catch {
      setError('No se pudo eliminar la carpeta. Intentá nuevamente.')
    } finally {
      setIdEliminando(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Mis carpetas</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Formulario de creación de carpeta (AC-09.1, RF-52) */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <form onSubmit={handleCrearCarpeta} className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="input-nueva-carpeta" className="block text-xs font-medium text-gray-600 mb-1">
                Nueva carpeta
              </label>
              <input
                id="input-nueva-carpeta"
                type="text"
                value={nombreNuevaCarpeta}
                onChange={(e) => setNombreNuevaCarpeta(e.target.value)}
                disabled={creando || limiteAlcanzado}
                placeholder="Ej: Inspiración 2026"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={creando || limiteAlcanzado || nombreNuevaCarpeta.trim() === ''}
              className="py-2.5 px-5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {creando && <Spinner tamano="sm" />}
              <span>{creando ? 'Creando...' : 'Crear'}</span>
            </button>
          </form>

          {errorCreacion && <p className="mt-2 text-xs text-red-600">{errorCreacion}</p>}

          {limiteAlcanzado && !errorCreacion && (
            <p className="mt-2 text-xs text-amber-700">
              Alcanzaste el límite máximo de {LIMITE_MAXIMO_CARPETAS} carpetas.
            </p>
          )}
        </section>

        {/* Listado propio de carpetas (AC-09.3, AC-09.6) */}
        <section className="space-y-4">
          {cargando ? (
            <Skeleton variante="tarjeta" cantidad={3} />
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          ) : carpetas.length === 0 ? (
            <EmptyState titulo="Todavía no tenés carpetas" mensaje="Creá tu primera carpeta para empezar a organizar tus publicaciones guardadas." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {carpetas.map((carpeta) => (
                <div key={carpeta.id} className={idEliminando === carpeta.id ? 'opacity-50 pointer-events-none' : ''}>
                  <CarpetaCard
                    carpeta={carpeta}
                    usuarioActualId={usuarioActualId}
                    onEliminar={handleEliminarCarpeta}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
