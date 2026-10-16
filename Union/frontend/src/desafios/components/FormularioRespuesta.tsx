import React, { useCallback, useMemo, useState } from 'react'
import { RespuestaDesafio, ContenidoRespuesta, FormatoContenido } from '../../domain/RespuestaDesafio'
import { Desafio, TipoContenidoRespuesta } from '../../domain/Desafio'

/**
 * Props para FormularioRespuesta (T055)
 * 
 * Componente para crear o editar una respuesta a un desafío.
 * Permite cargar contenido en formato imagen, video o audio (A-22).
 * Valida según los formatos aceptados por el desafío.
 * 
 * Fuente: specs/003-desafios/tasks.md (T055)
 * Dependencia: T015 (RespuestaDesafio), A-22 (RESUELTO)
 */
export interface FormularioRespuestaProps {
  desafio?: Desafio
  respuestaInicial?: RespuestaDesafio
  cargando?: boolean
  deshabilitado?: boolean
  onEnviar: (respuesta: RespuestaDesafio) => void
}

/**
 * Componente FormularioRespuesta
 * 
 * Formulario para crear o editar una respuesta a un desafío.
 * 
 * Campo:
 * - contenido (imagen, video o audio)
 * 
 * Validación:
 * - Contenido requerido
 * - Formato válido para el tipo
 * - Tipo aceptado por el desafío
 * - Las validaciones se ejecutan al enviar mediante RespuestaDesafio.validar()
 * - Se muestran errores por campo en aria-live regions
 * 
 * Accesibilidad (T073):
 * - Labels asociados a inputs
 * - aria-describedby para errores
 * - aria-live para mensajes dinámicos
 * - Teclado navegable
 * - Indicadores visuales sin depender solo del color
 * 
 * Borrador (T071):
 * - Los datos se guardan en localStorage ante sesión caducada
 * - El borrador se recupera al cargar (pendiente de CB-08)
 * 
 * Fuente: specs/003-desafios/spec.md (A-22 RESUELTO)
 * Data model: specs/003-desafios/data-model.md (sección 4.3)
 */
export const FormularioRespuesta: React.FC<FormularioRespuestaProps> = ({
  desafio,
  respuestaInicial,
  cargando = false,
  deshabilitado = false,
  onEnviar,
}) => {
  // Estado del formulario
  const [tipoContenido, setTipoContenido] = useState<TipoContenidoRespuesta | ''>(
    respuestaInicial?.contenido?.tipo ?? ''
  )
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    respuestaInicial?.contenido?.url ?? null
  )
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)

  // Tipos aceptados por el desafío
  const tiposAceptados = useMemo(() => {
    if (desafio?.formatosContenidoAceptados && desafio.formatosContenidoAceptados.length > 0) {
      return desafio.formatosContenidoAceptados
    }
    return ['imagen', 'video', 'audio'] as TipoContenidoRespuesta[]
  }, [desafio?.formatosContenidoAceptados])

  // Mapeo de extensiones a formatos
  const extensionesValidas: Record<TipoContenidoRespuesta, { ext: string[], mimeTypes: string[] }> = {
    imagen: {
      ext: ['.jpg', '.jpeg', '.png'],
      mimeTypes: ['image/jpeg', 'image/png'],
    },
    video: {
      ext: ['.mp4', '.webm'],
      mimeTypes: ['video/mp4', 'video/webm'],
    },
    audio: {
      ext: ['.mp3', '.wav'],
      mimeTypes: ['audio/mpeg', 'audio/wav'],
    },
  }

  const handleArchivoSeleccionado = useCallback(
    (evento: React.ChangeEvent<HTMLInputElement>) => {
      const archivo = evento.currentTarget.files?.[0]
      if (!archivo) return

      // Crear preview
      const url = URL.createObjectURL(archivo)
      setPreviewUrl(url)
      setArchivoSeleccionado(archivo)
    },
    []
  )

  const handleEnviar = useCallback(
    async (evento: React.FormEvent) => {
      evento.preventDefault()

      // Validar que hay tipo seleccionado y archivo
      if (!tipoContenido) {
        setErrores({ tipoContenido: 'Debe seleccionar un tipo de contenido' })
        return
      }

      if (!archivoSeleccionado && !previewUrl) {
        setErrores({ contenido: 'Debe adjuntar un archivo' })
        return
      }

      // Crear contenido usando type narrowing
      const id = `respuesta-${Date.now()}`
      const url = previewUrl || ''
      const formato = obtenerFormato(archivoSeleccionado?.name || '')
      
      const nuevoContenido: ContenidoRespuesta = 
        tipoContenido === 'imagen'
          ? { id, url, formato: formato as 'JPEG' | 'PNG', tipo: 'imagen' }
          : tipoContenido === 'video'
          ? { id, url, formato: formato as 'MP4' | 'WebM', tipo: 'video' }
          : { id, url, formato: formato as 'MP3' | 'WAV', tipo: 'audio' }

      // Crear respuesta
      const respuesta = new RespuestaDesafio({
        id: respuestaInicial?.id,
        desafioId: desafio?.id,
        contenido: nuevoContenido,
      })

      // Validar con el método de la entidad
      const nuevosErrores = respuesta.validar(tiposAceptados)
      setErrores(nuevosErrores)

      // Si hay errores, no enviar
      if (Object.keys(nuevosErrores).length > 0) {
        return
      }

      setEnviando(true)
      try {
        onEnviar(respuesta)
      } finally {
        setEnviando(false)
      }
    },
    [tipoContenido, archivoSeleccionado, previewUrl, respuestaInicial?.id, desafio?.id, tiposAceptados, onEnviar]
  )

  const obtenerFormato = (nombreArchivo: string): FormatoContenido => {
    const ext = nombreArchivo.toLowerCase().split('.').pop() || ''
    const mapeoFormatos: Record<string, FormatoContenido> = {
      jpg: 'JPEG',
      jpeg: 'JPEG',
      png: 'PNG',
      mp4: 'MP4',
      webm: 'WebM',
      mp3: 'MP3',
      wav: 'WAV',
    }
    return mapeoFormatos[ext] || 'JPEG'
  }

  const estaDeshabilitado = deshabilitado || cargando || enviando
  const tieneErrores = Object.keys(errores).length > 0

  return (
    <form onSubmit={handleEnviar} className="space-y-6">
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

      {/* Campo: Tipo de contenido */}
      <div>
        <label htmlFor="tipo-contenido" className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de contenido
          <span className="text-red-600 ml-1">*</span>
        </label>
        <select
          id="tipo-contenido"
          value={tipoContenido}
          onChange={e => setTipoContenido(e.target.value as TipoContenidoRespuesta)}
          disabled={estaDeshabilitado}
          aria-describedby={errores.tipoContenido ? 'tipo-error' : undefined}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 ${
            errores.tipoContenido ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">-- Selecciona un tipo --</option>
          {tiposAceptados.includes('imagen') && <option value="imagen">Imagen</option>}
          {tiposAceptados.includes('video') && <option value="video">Video</option>}
          {tiposAceptados.includes('audio') && <option value="audio">Audio</option>}
        </select>
        {errores.tipoContenido && (
          <p id="tipo-error" className="mt-1 text-sm text-red-600" role="alert">
            {errores.tipoContenido}
          </p>
        )}
      </div>

      {/* Campo: Carga de archivo */}
      {tipoContenido && (
        <div>
          <label htmlFor="archivo-respuesta" className="block text-sm font-medium text-gray-700 mb-2">
            Adjuntar {tipoContenido}
            <span className="text-red-600 ml-1">*</span>
          </label>
          <input
            id="archivo-respuesta"
            type="file"
            accept={extensionesValidas[tipoContenido as TipoContenidoRespuesta]?.mimeTypes.join(',')}
            onChange={handleArchivoSeleccionado}
            disabled={estaDeshabilitado}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:file:bg-gray-50 disabled:file:text-gray-500"
            aria-describedby={errores.contenido ? 'archivo-error' : undefined}
          />

          {/* Preview */}
          {previewUrl && tipoContenido === 'imagen' && (
            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
              <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover" />
            </div>
          )}

          {previewUrl && tipoContenido === 'video' && (
            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
              <video src={previewUrl} controls className="w-full h-64 bg-black" />
            </div>
          )}

          {previewUrl && tipoContenido === 'audio' && (
            <div className="mt-4 rounded-lg border border-gray-200 p-4 bg-gray-50">
              <audio src={previewUrl} controls className="w-full" />
            </div>
          )}

          {errores.contenido && (
            <p id="archivo-error" className="mt-1 text-sm text-red-600" role="alert">
              {errores.contenido}
            </p>
          )}

          {errores.formato && (
            <p id="formato-error" className="mt-1 text-sm text-red-600" role="alert">
              {errores.formato}
            </p>
          )}
        </div>
      )}

      {/* Información de tipos aceptados */}
      {desafio?.formatosContenidoAceptados && desafio.formatosContenidoAceptados.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded text-sm">
          <p className="font-semibold">Tipos de contenido aceptados:</p>
          <p className="mt-1">{desafio.formatosContenidoAceptados.join(', ')}</p>
        </div>
      )}

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
              Enviando...
            </>
          ) : (
            respuestaInicial ? 'Actualizar respuesta' : 'Enviar respuesta'
          )}
        </button>
      </div>
    </form>
  )
}
