import React, { useCallback, useState } from 'react'
import { Foto, FormatoFoto } from '../domain/Foto'
import { leerImagenPersistente } from '../services/imagenPersistente'

/**
 * Props para SelectorFotos (T051)
 * 
 * Componente para seleccionar 1 a 5 fotos en formato JPEG o PNG.
 * Exactamente una foto debe marcarse como principal.
 * 
 * Dependencia: T010 (gestión de archivos)
 * Fuente: specs/003-desafios/tasks.md (T051)
 */
export interface SelectorFotosProps {
  fotos: Foto[]
  errores?: Record<string, string>
  onCambio: (fotos: Foto[]) => void
  deshabilitado?: boolean
}

/**
 * Componente SelectorFotos - Placeholder para T051
 * 
 * Nota: Este es un placeholder simple. La implementación real (T051)
 * debe incluir:
 * - Carga de archivos (1-5 fotos)
 * - Validación de formato (JPEG/PNG)
 * - Selección de foto principal
 * - Vista previa de imágenes
 * - Mensajes de error por campo
 */
export const SelectorFotos: React.FC<SelectorFotosProps> = ({
  fotos = [],
  errores = {},
  onCambio,
  deshabilitado = false,
}) => {
  const [inputKey, setInputKey] = useState(0)
  const [leyendo, setLeyendo] = useState(false)
  const [errorArchivo, setErrorArchivo] = useState('')

  const handleArchivoSeleccionado = useCallback(
    async (evento: React.ChangeEvent<HTMLInputElement>) => {
      const archivos = evento.currentTarget.files
      if (!archivos) return

      const nuevasFotos: Foto[] = [...fotos]
      setLeyendo(true); setErrorArchivo('')
      try {
      for (let i = 0; i < archivos.length && nuevasFotos.length < 5; i++) {
        const archivo = archivos[i]
        const formato = archivo.type === 'image/jpeg' ? 'JPEG' : 
                       archivo.type === 'image/png' ? 'PNG' : null

        if (formato) {
          const foto = new Foto({
            id: `temp-${Date.now()}-${Math.random()}`,
            url: await leerImagenPersistente(archivo),
            formato: formato as FormatoFoto,
            principal: nuevasFotos.length === 0, // Primera foto es principal por defecto
          })
          nuevasFotos.push(foto)
        }
      }

      onCambio(nuevasFotos)
      setInputKey(prev => prev + 1) // Reiniciar input para permitir el mismo archivo
      } catch (e) { setErrorArchivo(e instanceof Error ? e.message : 'No pudimos leer la imagen.') }
      finally { setLeyendo(false) }
    },
    [fotos, onCambio]
  )

  const handleEliminarFoto = useCallback(
    (idFoto: string) => {
      const fotasRestantes = fotos.filter(f => f.id !== idFoto)
      
      // Si se eliminó la foto principal, marcar la primera restante como principal
      if (fotasRestantes.length > 0 && !fotasRestantes.some(f => f.principal)) {
        fotasRestantes[0] = new Foto({
          ...fotasRestantes[0],
          principal: true,
        })
      }

      onCambio(fotasRestantes)
    },
    [fotos, onCambio]
  )

  const handleMarcarPrincipal = useCallback(
    (idFoto: string) => {
      const fotasActualizadas = fotos.map(f => new Foto({
        ...f,
        principal: f.id === idFoto,
      }))
      onCambio(fotasActualizadas)
    },
    [fotos, onCambio]
  )

  const puedeAgregarMas = fotos.length < 5
  const tienePrincipal = fotos.some(f => f.principal)

  return (
    <div className="space-y-4">
      {errorArchivo && <p role="alert">{errorArchivo}</p>}
      {leyendo && <p role="status">Preparando imágenes…</p>}
      <div>
        <label htmlFor="selector-fotos" className="block text-sm font-medium text-gray-700 mb-2">
          Fotos del desafío
          <span className="text-red-600 ml-1">*</span>
        </label>
        
        {puedeAgregarMas && (
          <input
            key={inputKey}
            id="selector-fotos"
            type="file"
            multiple
            accept="image/jpeg,image/png"
            onChange={handleArchivoSeleccionado}
            disabled={deshabilitado || leyendo}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:file:bg-gray-50 disabled:file:text-gray-500"
            aria-describedby={errores.fotos ? 'fotos-error' : undefined}
          />
        )}

        {/* Mostrar fotos seleccionadas */}
        {fotos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {fotos.map(foto => (
              <div
                key={foto.id}
                className="relative rounded-lg overflow-hidden border-2 border-gray-200"
              >
                <img
                  src={foto.url}
                  alt={foto.principal ? 'Foto principal' : 'Foto'}
                  className="w-full h-32 object-cover"
                />
                
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center gap-2">
                  {foto.principal ? (
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                      Principal
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarcarPrincipal(foto.id)}
                      className="bg-gray-800 bg-opacity-75 hover:bg-opacity-90 text-white px-2 py-1 rounded text-xs font-semibold transition-all"
                      disabled={deshabilitado}
                    >
                      Marcar principal
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleEliminarFoto(foto.id)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-all disabled:opacity-50"
                  disabled={deshabilitado}
                  aria-label="Eliminar foto"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Contador de fotos */}
        <p className="mt-2 text-sm text-gray-600">
          {fotos.length} de 5 fotos{tienePrincipal ? ' (una marcada como principal)' : ' (sin principal marcada)'}
        </p>
      </div>

      {/* Errores */}
      {errores.fotos && (
        <div id="fotos-error" className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
          {errores.fotos}
        </div>
      )}
    </div>
  )
}
