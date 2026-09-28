/**
 * Pantalla de Cuestionario de Onboarding (`CuestionarioPage.tsx`, HU-05, RF-09, AC-05.4).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (AC-05.4, RF-09)
 * - Union/specs/001-plataforma-unificada/plan.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T086)
 *
 * Descripción:
 * - Flujo posterior a un registro exitoso (RF-09: DEBE iniciarse inmediatamente después del
 *   registro).
 * - Solicita al usuario nuevo sus preferencias de contenido artístico (`TipoContenido`) para
 *   personalizar su experiencia inicial de descubrimiento.
 * - No existe un endpoint dedicado de onboarding en `contracts/api-contracts.md`; las preferencias
 *   seleccionadas se guardan localmente (para uso posterior por la pantalla Descubrir) sin
 *   bloquear el flujo si el usuario decide omitir el paso.
 * - Al finalizar (o al omitir), redirige al home (`/feed`).
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TipoContenido } from '../../domain/enums/TipoContenido'

export const CLAVE_PREFERENCIAS_ONBOARDING = 'onboarding.preferenciasTipoContenido'

const ETIQUETAS_TIPO_CONTENIDO: Record<TipoContenido, string> = {
  [TipoContenido.IMAGEN]: 'Imagen',
  [TipoContenido.VIDEO]: 'Video',
  [TipoContenido.MUSICA]: 'Música',
  [TipoContenido.TUTORIAL]: 'Tutorial',
  [TipoContenido.ESCULTURA]: 'Escultura',
  [TipoContenido.DIGITAL]: 'Arte digital',
}

const TODOS_LOS_TIPOS: TipoContenido[] = Object.values(TipoContenido)

export const guardarPreferenciasOnboarding = (preferencias: TipoContenido[]): void => {
  try {
    window.localStorage.setItem(CLAVE_PREFERENCIAS_ONBOARDING, JSON.stringify(preferencias))
  } catch {
    // Si el almacenamiento local no está disponible, se omite silenciosamente (no bloquea el flujo)
  }
}

export const CuestionarioPage: React.FC = () => {
  const navigate = useNavigate()
  const [seleccionados, setSeleccionados] = useState<TipoContenido[]>([])

  const alternarSeleccion = (tipo: TipoContenido) => {
    setSeleccionados((actual) =>
      actual.includes(tipo) ? actual.filter((t) => t !== tipo) : [...actual, tipo],
    )
  }

  const finalizarOnboarding = () => {
    guardarPreferenciasOnboarding(seleccionados)
    navigate('/feed', { replace: true })
  }

  const handleOmitir = () => {
    navigate('/feed', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          ¡Bienvenido/a a la comunidad!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Contanos qué tipo de contenido artístico te interesa para personalizar tu experiencia.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-2xl sm:px-10 border border-gray-100">
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-3">
              Seleccioná tus intereses (opcional)
            </legend>

            <div className="grid grid-cols-2 gap-3">
              {TODOS_LOS_TIPOS.map((tipo) => {
                const estaSeleccionado = seleccionados.includes(tipo)
                return (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => alternarSeleccion(tipo)}
                    aria-pressed={estaSeleccionado}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                      estaSeleccionado
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {ETIQUETAS_TIPO_CONTENIDO[tipo]}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleOmitir}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 underline cursor-pointer"
            >
              Omitir por ahora
            </button>

            <button
              type="button"
              onClick={finalizarOnboarding}
              className="py-2.5 px-6 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
