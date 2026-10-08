import React, { useState, useRef } from 'react'
import {
  VALIDACIONES_FOTO,
  validarArchivo,
  crearFormDataFoto,
} from '../../application/dto/SubirFotoPayload'

/**
 * `PhotoUploadField`: Componente de subida de foto de perfil.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-02, AC-02.1, A2)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", perfil/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T023)
 *
 * Responsabilidades:
 * 1. Input file con restricciones A2:
 *    - Formatos: JPG, JPEG, PNG, WebP (A2)
 *    - Tamaño máximo: 5 MB (A2)
 *    - Validaciones client-side antes de envío
 *    - Backend es authoritative para validación final (A2)
 *
 * 2. Validación de archivo (A2):
 *    - Validar tamaño (≤5 MB)
 *    - Validar MIME type
 *    - Validar extensión del archivo
 *    - Mostrar mensajes de error específicos
 *
 * 3. Preview de imagen:
 *    - Mostrar preview después de seleccionar
 *    - Mostrar nombre del archivo
 *    - Opción de cambiar foto
 *
 * 4. Integración con servicios:
 *    - Callback onFotoSeleccionada: (archivo: File, preview: string) => Promise<void>
 *    - Envío a endpoint POST /perfil/foto (T029)
 *
 * Props:
 * - `fotoActual?: string` — URL de foto actual (para preview)
 * - `onFotoSeleccionada: (archivo: File) => Promise<void>` — Callback con archivo validado
 * - `enviando?: boolean` — true si se está subiendo
 * - `error?: string` — Mensaje de error del servidor
 * - `exito?: boolean` — true si foto se subió correctamente
 *
 * Historias de usuario:
 * - HU-02: Editar perfil propio (incluye cambio de foto)
 *
 * Criterios de aceptación:
 * - AC-02.1: Se pueden editar foto de perfil
 * - A2: Validaciones de formato y tamaño
 *
 * Clarificaciones:
 * - A2: Formatos JPG/PNG/WebP, 5 MB máximo
 * - Backend es authoritative para validación final (A2)
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo componente (Principio VI)
 * - Validaciones client-side antes de envío al servidor
 * - Backend puede rechazar si no cumple especificaciones
 * - Preview se muestra con FileReader API (lectura local, no enviado)
 */

export interface PhotoUploadFieldProps {
  fotoActual?: string
  onFotoSeleccionada: (archivo: File) => Promise<void>
  enviando?: boolean
  error?: string
  exito?: boolean
}

export const PhotoUploadField: React.FC<PhotoUploadFieldProps> = ({
  fotoActual,
  onFotoSeleccionada,
  enviando = false,
  error,
  exito,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | undefined>(fotoActual)
  const [nombreArchivo, setNombreArchivo] = useState<string>('')
  const [errorLocal, setErrorLocal] = useState<string | undefined>()
  const [exitoLocal, setExitoLocal] = useState<boolean>(false)

  /**
   * Manejo de selección de archivo.
   * A2: Validar archivo antes de procesar.
   */
  const handleArchivoSeleccionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    setErrorLocal(undefined)
    setExitoLocal(false)

    if (!archivo) {
      return
    }

    // A2: Validar archivo client-side
    const errorValidacion = validarArchivo(archivo)
    if (errorValidacion) {
      setErrorLocal(errorValidacion)
      return
    }

    // Mostrar preview local
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
      setNombreArchivo(archivo.name)
    }
    reader.readAsDataURL(archivo)

    try {
      // Enviar archivo al servidor
      await onFotoSeleccionada(archivo)
      setExitoLocal(true)
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : 'Error al subir foto'
      setErrorLocal(mensajeError)
    }
  }

  /**
   * Trigger del input file cuando usuario hace click.
   */
  const handleClickSubir = () => {
    fileInputRef.current?.click()
  }

  /**
   * Limpiar selección y reset de estado.
   */
  const handleLimpiar = () => {
    setPreview(fotoActual)
    setNombreArchivo('')
    setErrorLocal(undefined)
    setExitoLocal(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div
      style={{
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
      }}
    >
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
        Foto de perfil
      </h3>

      {/* Preview de foto actual o seleccionada */}
      {preview && (
        <div style={{ marginBottom: '1rem' }}>
          <img
            src={preview}
            alt="preview"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #d1d5db',
            }}
          />
          {nombreArchivo && (
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              {nombreArchivo}
            </p>
          )}
        </div>
      )}

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept={VALIDACIONES_FOTO.EXTENSIONES.map((ext) => `.${ext}`).join(',')}
        onChange={handleArchivoSeleccionado}
        disabled={enviando}
        style={{ display: 'none' }}
        aria-label="Seleccionar foto de perfil"
      />

      {/* A2: Mostrar error de validación */}
      {errorLocal && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '12px',
            color: '#991b1b',
          }}
        >
          {errorLocal}
        </div>
      )}

      {/* Mostrar error del servidor */}
      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '12px',
            color: '#991b1b',
          }}
        >
          {error}
        </div>
      )}

      {/* Mostrar éxito */}
      {(exitoLocal || exito) && (
        <div
          style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '12px',
            color: '#166534',
          }}
        >
          ✓ Foto subida correctamente
        </div>
      )}

      {/* Información sobre restricciones A2 */}
      <div
        style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          padding: '0.75rem',
          marginBottom: '1rem',
          fontSize: '11px',
          color: '#0c4a6e',
        }}
      >
        <p style={{ margin: '0 0 0.25rem 0', fontWeight: '500' }}>Requisitos (A2):</p>
        <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.25rem' }}>
          <li>Formatos: JPG, JPEG, PNG, WebP</li>
          <li>Tamaño máximo: {VALIDACIONES_FOTO.MAX_SIZE_MB} MB</li>
          <li>La validación final es responsabilidad del servidor</li>
        </ul>
      </div>

      {/* Botones de acción */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={handleClickSubir}
          disabled={enviando}
          style={{
            flex: 1,
            padding: '0.5rem 1rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: enviando ? 'not-allowed' : 'pointer',
            opacity: enviando ? 0.6 : 1,
          }}
        >
          {enviando ? 'Subiendo...' : nombreArchivo ? 'Cambiar foto' : 'Seleccionar foto'}
        </button>

        {nombreArchivo && !enviando && (
          <button
            type="button"
            onClick={handleLimpiar}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}
