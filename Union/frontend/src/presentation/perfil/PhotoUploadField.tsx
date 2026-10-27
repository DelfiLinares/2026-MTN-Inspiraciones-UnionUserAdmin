import React, { useState, useRef } from 'react'
import {
  VALIDACIONES_FOTO,
  validarArchivo,
  crearFormDataFoto,
} from '../../application/dto/SubirFotoPayload'
import { usuarioPerfilService } from '../../services/perfilUsuarioService'

/**
 * `PhotoUploadField`: Componente de subida de foto de perfil.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-02, AC-02.1, A2)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", perfil/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T023, T033)
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
 * 4. Integración con servicios (T033: UsuarioPerfilService):
 *    - Invoca usuarioPerfilService.cambiarFotoPerfil() directamente
 *    - Maneja errores 400/413/415 (A2)
 *    - Callback onFotoActualizada: (usuario: Usuario) => void — Opcional
 *
 * Props:
 * - `fotoActual?: string` — URL de foto actual (para preview)
 * - `onFotoActualizada?: (usuario: Usuario) => void` — Callback después de subir (T033)
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
 * - T033: Integración con UsuarioPerfilService
 */

import { UsuarioPerfil as Usuario } from '../../domain/UsuarioPerfil'

export interface PhotoUploadFieldProps {
  fotoActual?: string
  onFotoActualizada?: (usuario: Usuario) => void
}

export const PhotoUploadField: React.FC<PhotoUploadFieldProps> = ({
  fotoActual,
  onFotoActualizada,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | undefined>(fotoActual)
  const [nombreArchivo, setNombreArchivo] = useState<string>('')
  const [errorLocal, setErrorLocal] = useState<string | undefined>()
  const [exitoLocal, setExitoLocal] = useState<boolean>(false)

  // T033: Estado para manejo de envío (integración con UsuarioPerfilService)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | undefined>()

  /**
   * Manejo de selección de archivo.
   * A2: Validar archivo antes de procesar.
   * T033: Invocar UsuarioPerfilService.cambiarFotoPerfil() directamente.
   */
  const handleArchivoSeleccionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    setErrorLocal(undefined)
    setError(undefined)
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

    // T033: Enviar archivo al servidor usando UsuarioPerfilService
    setEnviando(true)

    try {
      // T033: Enviar archivo al servidor usando UsuarioPerfilService
      // El servicio convierte el File a FormData internamente
      const usuarioActualizado = await usuarioPerfilService.cambiarFotoPerfil(archivo)

      // Éxito
      setExitoLocal(true)

      // Invocar callback opcional
      if (onFotoActualizada) {
        onFotoActualizada(usuarioActualizado)
      }
    } catch (err) {
      // A2: Manejo de errores 400/413/415
      const mensajeError = err instanceof Error ? err.message : 'Error al subir foto'
      setError(mensajeError)
      setExitoLocal(false)
    } finally {
      setEnviando(false)
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
        backgroundColor: 'var(--color-subtle)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
      }}
    >
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>
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
              border: '2px solid var(--color-control)',
            }}
          />
          {nombreArchivo && (
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px', color: 'var(--color-muted)' }}>
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
            backgroundColor: 'var(--color-error-surface)',
            border: '1px solid var(--color-error)',
            borderRadius: '10px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '14px',
            color: 'var(--color-error)',
          }}
        >
          {errorLocal}
        </div>
      )}

      {/* Mostrar error del servidor */}
      {error && (
        <div
          style={{
            backgroundColor: 'var(--color-error-surface)',
            border: '1px solid var(--color-error)',
            borderRadius: '10px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '14px',
            color: 'var(--color-error)',
          }}
        >
          {error}
        </div>
      )}

      {/* Mostrar éxito */}
      {exitoLocal && (
        <div
          style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '14px',
            color: '#166534',
          }}
        >
          ✓ Foto subida correctamente
        </div>
      )}

      {/* Información sobre restricciones A2 */}
      <div
        style={{
          backgroundColor: 'var(--color-subtle)',
          border: '1px solid var(--color-control)',
          borderRadius: '10px',
          padding: '0.75rem',
          marginBottom: '1rem',
          fontSize: '14px',
          color: 'var(--color-text)',
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
            backgroundColor: 'var(--color-action)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
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
              backgroundColor: 'var(--color-border)',
              color: 'var(--color-text)',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
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
