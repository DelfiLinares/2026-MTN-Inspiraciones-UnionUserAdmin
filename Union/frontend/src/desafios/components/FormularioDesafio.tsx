import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Desafio } from '../../domain/Desafio'
import { RangoFechas } from '../../domain/RangoFechas'
import { AmbitoDesafio } from '../../domain/AmbitoDesafio'
import { Foto } from '../../domain/Foto'
import { SelectorFotos } from '../../components/SelectorFotos'

// Clave para almacenar el borrador en localStorage
const BORRADOR_DESAFIO_KEY = 'borrador_formulario_desafio'

interface BorradorDesafio {
  nombre: string
  descripcionLarga: string
  fotos: Array<{
    id: string
    url: string
    formato: 'JPEG' | 'PNG'
    principal: boolean
  }>
  fechaInicio: string
  fechaFin: string
  ambitos: string[]
}

/**
 * Helper para serializar fotos a JSON (localStorage)
 */
const serializarBorrador = (
  nombre: string,
  descripcionLarga: string,
  fotos: Foto[],
  fechaInicio: string,
  fechaFin: string,
  ambitos: string[]
): BorradorDesafio => {
  return {
    nombre,
    descripcionLarga,
    fotos: fotos.map(f => ({
      id: f.id,
      url: f.url,
      formato: f.formato,
      principal: f.principal,
    })),
    fechaInicio,
    fechaFin,
    ambitos,
  }
}

/**
 * Helper para cargar borrador desde localStorage
 */
const cargarBorradorDelStorage = (): BorradorDesafio | null => {
  try {
    const borrador = localStorage.getItem(BORRADOR_DESAFIO_KEY)
    return borrador ? JSON.parse(borrador) : null
  } catch (error) {
    console.warn('Error al cargar borrador:', error)
    return null
  }
}

/**
 * Helper para guardar borrador en localStorage
 */
const guardarBorradorEnStorage = (borrador: BorradorDesafio): void => {
  try {
    localStorage.setItem(BORRADOR_DESAFIO_KEY, JSON.stringify(borrador))
  } catch (error) {
    console.warn('Error al guardar borrador:', error)
  }
}

/**
 * Helper para eliminar borrador de localStorage
 */
const eliminarBorradorDelStorage = (): void => {
  try {
    localStorage.removeItem(BORRADOR_DESAFIO_KEY)
  } catch (error) {
    console.warn('Error al eliminar borrador:', error)
  }
}

/**
 * Props para FormularioDesafio (T053)
 * 
 * Componente para crear o editar un desafío.
 * Incluye campos: nombre, descripción, fotos, fechas y ámbitos.
 * Muestra los errores de Desafio.validar() por campo.
 * 
 * Fuente: specs/003-desafios/tasks.md (T053)
 * Dependencias: T013 (Desafio), T008 (RangoFechas), T009 (AmbitoDesafio), T051 (SelectorFotos)
 */
export interface FormularioDesafioProps {
  desafioInicial?: Desafio
  ambitorDisponibles?: string[] // Catálogo de ámbitos (pendiente de A-02)
  cargando?: boolean
  deshabilitado?: boolean
  onEnviar: (desafio: Desafio) => void
}

/**
 * Componente FormularioDesafio
 * 
 * Formulario para crear o editar un desafío.
 * 
 * Campos:
 * - nombre (texto, requerido)
 * - descripcionLarga (texto, requerido)
 * - fotos (1-5, JPEG/PNG, una principal)
 * - rango de fechas (inicio < fin)
 * - ámbitos (al menos uno)
 * 
 * Validación:
 * - Los límites de nombre y descripción son provisionales hasta A-11
 * - El catálogo de ámbitos es entregado por la API (A-02)
 * - Las validaciones se ejecutan al enviar mediante Desafio.validar()
 * - Se muestran errores por campo en aria-live regions
 * 
 * Accesibilidad (T073):
 * - Labels asociados a inputs
 * - aria-describedby para errores
 * - aria-live para mensajes dinámicos
 * - Teclado navegable
 * 
 * Borrador (T071):
 * - Los datos se guardan en localStorage ante sesión caducada
 * - El borrador se recupera al cargar (pendiente de CB-08)
 */
export const FormularioDesafio: React.FC<FormularioDesafioProps> = ({
  desafioInicial,
  ambitorDisponibles = [],
  cargando = false,
  deshabilitado = false,
  onEnviar,
}) => {
  // Estado del formulario
  const [nombre, setNombre] = useState(desafioInicial?.nombre ?? '')
  const [descripcionLarga, setDescripcionLarga] = useState(desafioInicial?.descripcionLarga ?? '')
  const [fotos, setFotos] = useState<Foto[]>(desafioInicial?.fotos ?? [])
  const [fechaInicio, setFechaInicio] = useState(
    desafioInicial?.rango?.inicio ? 
      desafioInicial.rango.inicio.toISOString().split('T')[0] : ''
  )
  const [fechaFin, setFechaFin] = useState(
    desafioInicial?.rango?.fin ? 
      desafioInicial.rango.fin.toISOString().split('T')[0] : ''
  )
  const [ambitos, setAmbitos] = useState<string[]>(
    desafioInicial?.ambitos?.map(a => a.valor) ?? []
  )
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)
  const [huboRecuperacion, setHuboRecuperacion] = useState(false)

  // T071: Cargar borrador desde localStorage al montar el componente
  useEffect(() => {
    // Solo cargar borrador si no hay desafioInicial (creación nueva)
    if (!desafioInicial) {
      const borrador = cargarBorradorDelStorage()
      if (borrador) {
        setNombre(borrador.nombre)
        setDescripcionLarga(borrador.descripcionLarga)
        setFotos(
          borrador.fotos.map(
            f => new Foto({ id: f.id, url: f.url, formato: f.formato, principal: f.principal })
          )
        )
        setFechaInicio(borrador.fechaInicio)
        setFechaFin(borrador.fechaFin)
        setAmbitos(borrador.ambitos)
        setHuboRecuperacion(true)
      }
    }
  }, [desafioInicial])

  // T071: Guardar borrador en localStorage cuando los datos cambien
  useEffect(() => {
    // Solo guardar si no hay desafioInicial (creación nueva)
    if (!desafioInicial) {
      const borrador = serializarBorrador(
        nombre,
        descripcionLarga,
        fotos,
        fechaInicio,
        fechaFin,
        ambitos
      )
      guardarBorradorEnStorage(borrador)
    }
  }, [nombre, descripcionLarga, fotos, fechaInicio, fechaFin, ambitos, desafioInicial])

  // Crear instancia de Desafio con datos actuales para validar
  const desafioActual = useMemo(() => {
    const rangoFechas = fechaInicio && fechaFin ? 
      new RangoFechas({
        inicio: new Date(fechaInicio),
        fin: new Date(fechaFin),
      }) : 
      undefined

    const ambitosEntidad = ambitos.map(a => new AmbitoDesafio({ valor: a }))

    return new Desafio({
      id: desafioInicial?.id,
      nombre,
      descripcionLarga,
      fotos,
      rango: rangoFechas,
      ambitos: ambitosEntidad,
    })
  }, [nombre, descripcionLarga, fotos, fechaInicio, fechaFin, ambitos, desafioInicial?.id])

  const handleEnviar = useCallback(
    async (evento: React.FormEvent) => {
      evento.preventDefault()

      // Validar con el método de la entidad
      const nuevosErrores = desafioActual.validar()
      setErrores(nuevosErrores)

      // Si hay errores, no enviar
      if (Object.keys(nuevosErrores).length > 0) {
        return
      }

      setEnviando(true)
      try {
        onEnviar(desafioActual)
        // T071: Limpiar borrador después de enviar con éxito
        eliminarBorradorDelStorage()
      } finally {
        setEnviando(false)
      }
    },
    [desafioActual, onEnviar]
  )

  const estaDeshabilitado = deshabilitado || cargando || enviando
  const tieneErrores = Object.keys(errores).length > 0

  return (
    <form onSubmit={handleEnviar} className="space-y-6">
      {/* T071: Indicador cuando se recupera un borrador */}
      {huboRecuperacion && (
        <div
          role="status"
          aria-live="polite"
          className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">
            Se recuperaron los datos de tu borrador anterior.
          </span>
        </div>
      )}

      {/* Mensaje de errores general */}
      {tieneErrores && (
        <div
          role="alert"
          aria-live="polite"
          aria-atomic="true"
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded"
        >
          <p className="font-semibold">Por favor, revisa los errores a continuación:</p>
          <ul className="mt-2 list-disc list-inside text-sm space-y-1">
            {Object.values(errores).map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Campo: Nombre */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del desafío
          <span className="text-red-600 ml-1">*</span>
        </label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          disabled={estaDeshabilitado}
          placeholder="Ej: Reciclar plástico en casa"
          aria-describedby={errores.nombre ? 'nombre-error' : undefined}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 ${
            errores.nombre ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errores.nombre && (
          <p id="nombre-error" className="mt-1 text-sm text-red-600" role="alert">
            {errores.nombre}
          </p>
        )}
      </div>

      {/* Campo: Descripción */}
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
          Descripción del desafío
          <span className="text-red-600 ml-1">*</span>
        </label>
        <textarea
          id="descripcion"
          value={descripcionLarga}
          onChange={e => setDescripcionLarga(e.target.value)}
          disabled={estaDeshabilitado}
          placeholder="Describe en detalle el desafío..."
          rows={5}
          aria-describedby={errores.descripcionLarga ? 'descripcion-error' : undefined}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 resize-none ${
            errores.descripcionLarga ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errores.descripcionLarga && (
          <p id="descripcion-error" className="mt-1 text-sm text-red-600" role="alert">
            {errores.descripcionLarga}
          </p>
        )}
      </div>

      {/* Campo: Fotos */}
      <div>
        <SelectorFotos
          fotos={fotos}
          errores={errores}
          onCambio={setFotos}
          deshabilitado={estaDeshabilitado}
        />
      </div>

      {/* Campos: Fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fecha de inicio */}
        <div>
          <label htmlFor="fecha-inicio" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de inicio
            <span className="text-red-600 ml-1">*</span>
          </label>
          <input
            id="fecha-inicio"
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            disabled={estaDeshabilitado}
            aria-describedby={errores.rango || errores.inicio ? 'fecha-inicio-error' : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 ${
              errores.rango || errores.inicio ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>

        {/* Fecha de fin */}
        <div>
          <label htmlFor="fecha-fin" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de fin
            <span className="text-red-600 ml-1">*</span>
          </label>
          <input
            id="fecha-fin"
            type="date"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
            disabled={estaDeshabilitado}
            aria-describedby={errores.fin || errores.rango ? 'fecha-fin-error' : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 ${
              errores.fin || errores.rango ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
      </div>

      {/* Errores de fechas */}
      {(errores.rango || errores.inicio || errores.fin) && (
        <p id="fecha-inicio-error" className="text-sm text-red-600" role="alert">
          {errores.rango || errores.fin}
        </p>
      )}

      {/* Campo: Ámbitos */}
      <div>
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-3">
            Ámbitos del desafío
            <span className="text-red-600 ml-1">*</span>
          </legend>

          {ambitorDisponibles.length > 0 ? (
            <div className="space-y-2">
              {ambitorDisponibles.map(ambito => (
                <label key={ambito} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={ambitos.includes(ambito)}
                    onChange={e => {
                      if (e.target.checked) {
                        setAmbitos([...ambitos, ambito])
                      } else {
                        setAmbitos(ambitos.filter(a => a !== ambito))
                      }
                    }}
                    disabled={estaDeshabilitado}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="ml-2 text-gray-700">{ambito}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No hay ámbitos disponibles para seleccionar.
            </p>
          )}

          {errores.ambitos && (
            <p id="ambitos-error" className="mt-2 text-sm text-red-600" role="alert">
              {errores.ambitos}
            </p>
          )}
        </fieldset>
      </div>

      {/* Botón de envío */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={estaDeshabilitado}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {enviando ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Guardando...
            </>
          ) : (
            'Guardar desafío'
          )}
        </button>
      </div>
    </form>
  )
}
