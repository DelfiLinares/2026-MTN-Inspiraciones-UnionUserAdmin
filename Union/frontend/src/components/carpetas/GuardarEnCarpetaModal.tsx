/**
 * Componente `GuardarEnCarpetaModal`: Modal de guardado de publicación en carpeta.
 * Cumple con CB-03:
 * - Bloquea la acción de guardar (`puedeGuardarEnCarpeta()`) mientras `cargando === true` o no hay carpeta seleccionada.
 * - Permite crear una nueva carpeta inline respetando el límite máximo de 100 carpetas (RF-52, `puedeCrearNuevaCarpeta()`).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-48, RF-49, RF-52, CB-03)
 * - Union/specs/001-plataforma-unificada/tasks.md (T082)
 */

import React, { useState } from 'react'
import { Carpeta } from '../../domain/Carpeta'
import {
  LIMITE_MAXIMO_CARPETAS,
  puedeCrearNuevaCarpeta,
  puedeGuardarEnCarpeta,
} from '../../services/carpetaService'

export interface GuardarEnCarpetaModalProps {
  abierto: boolean
  publicacionId: string
  carpetas: Carpeta[]
  cargandoCarpetas: boolean
  errorCarpetas?: string | null
  onCerrar: () => void
  onGuardar: (carpetaId: string, publicacionId: string) => Promise<void>
  onCrearCarpeta: (nombre: string, cantidadActual: number) => Promise<Carpeta>
}

export const GuardarEnCarpetaModal: React.FC<GuardarEnCarpetaModalProps> = ({
  abierto,
  publicacionId,
  carpetas,
  cargandoCarpetas,
  errorCarpetas,
  onCerrar,
  onGuardar,
  onCrearCarpeta,
}) => {
  const [carpetaSeleccionadaId, setCarpetaSeleccionadaId] = useState<string | null>(null)
  const [modoNuevaCarpeta, setModoNuevaCarpeta] = useState<boolean>(false)
  const [nuevoNombreCarpeta, setNuevoNombreCarpeta] = useState<string>('')
  const [guardando, setGuardando] = useState<boolean>(false)
  const [creandoCarpeta, setCreandoCarpeta] = useState<boolean>(false)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  if (!abierto) {
    return null
  }

  const limiteAlcanzado = !puedeCrearNuevaCarpeta(carpetas.length)
  const botonGuardarHabilitado = puedeGuardarEnCarpeta(cargandoCarpetas, carpetaSeleccionadaId) && !guardando

  const handleGuardar = async () => {
    if (!carpetaSeleccionadaId || !botonGuardarHabilitado) {
      return
    }

    setGuardando(true)
    setErrorMensaje(null)
    try {
      await onGuardar(carpetaSeleccionadaId, publicacionId)
      onCerrar()
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as any).message) : 'No se pudo guardar la publicación.'
      setErrorMensaje(msg)
    } finally {
      setGuardando(false)
    }
  }

  const handleCrearNueva = async (e: React.FormEvent) => {
    e.preventDefault()
    const nombreLimpio = nuevoNombreCarpeta.trim()
    if (!nombreLimpio) {
      setErrorMensaje('Ingresá un nombre para la carpeta.')
      return
    }

    if (limiteAlcanzado) {
      setErrorMensaje(`Alcanzaste el límite máximo de ${LIMITE_MAXIMO_CARPETAS} carpetas.`)
      return
    }

    setCreandoCarpeta(true)
    setErrorMensaje(null)
    try {
      const nueva = await onCrearCarpeta(nombreLimpio, carpetas.length)
      setCarpetaSeleccionadaId(nueva.id)
      setNuevoNombreCarpeta('')
      setModoNuevaCarpeta(false)
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as any).message) : 'No se pudo crear la carpeta.'
      setErrorMensaje(msg)
    } finally {
      setCreandoCarpeta(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 flex flex-col space-y-4">
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-lg font-bold text-gray-900">Guardar en carpeta</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Mensaje de error general */}
        {(errorMensaje || errorCarpetas) && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100">
            {errorMensaje ?? errorCarpetas}
          </div>
        )}

        {/* Estado de carga CB-03 */}
        {cargandoCarpetas ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Cargando tus carpetas...
          </div>
        ) : (
          <>
            {/* Formulario de creación rápida inline (RF-48, RF-52) */}
            {modoNuevaCarpeta ? (
              <form onSubmit={handleCrearNueva} className="space-y-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <label className="block text-xs font-semibold text-gray-700">Nombre de la nueva carpeta</label>
                <input
                  type="text"
                  value={nuevoNombreCarpeta}
                  onChange={(e) => setNuevoNombreCarpeta(e.target.value)}
                  placeholder="Ej: Inspiración 2026"
                  disabled={creandoCarpeta}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setModoNuevaCarpeta(false)}
                    className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creandoCarpeta || !nuevoNombreCarpeta.trim()}
                    className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-md"
                  >
                    {creandoCarpeta ? 'Creando...' : 'Crear'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {carpetas.length} / {LIMITE_MAXIMO_CARPETAS} carpetas
                </span>
                <button
                  type="button"
                  onClick={() => setModoNuevaCarpeta(true)}
                  disabled={limiteAlcanzado}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Nueva carpeta
                </button>
              </div>
            )}

            {/* Listado de carpetas existentes */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {carpetas.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  No tenés carpetas creadas. ¡Creá la primera para guardar!
                </div>
              ) : (
                carpetas.map((carpeta) => {
                  const seleccionada = carpetaSeleccionadaId === carpeta.id
                  return (
                    <div
                      key={carpeta.id}
                      onClick={() => setCarpetaSeleccionadaId(carpeta.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        seleccionada
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                          : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-sm truncate">{carpeta.nombre}</span>
                      <span className="text-xs text-gray-400 font-normal">{carpeta.cantidadPosts} posts</span>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}

        {/* Acciones del modal */}
        <div className="pt-3 border-t border-gray-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={!botonGuardarHabilitado}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
