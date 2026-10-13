import React, { useState } from 'react'
import { Publicacion } from '../../domain/Publicacion'
import {
  ResultadoValidacion,
  validacionOk,
  validacionError,
} from '../../application/dto/ResultadoValidacion'
import { publicacionService } from '../../services/perfilPublicacionService'

/**
 * `EditPostForm`: Formulario para editar una publicación propia.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-11, AC-11.1–AC-11.4, A5)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", publicaciones/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T050)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Publicacion entity)
 *
 * Responsabilidades:
 * 1. Formulario de edición de publicación (HU-11):
 *    - Imagen: Solo lectura, no editable (A5)
 *    - Texto: Editable, máximo 2000 caracteres (A5, openapi.yaml)
 *    - Validaciones en cliente (AC-11.2):
 *      - No vacío
 *      - Max 2000 caracteres
 *    - Confirmación explícita antes de guardar (AC-11.2)
 *
 * 2. Validaciones de negocio:
 *    - Texto: 1–2000 caracteres
 *    - Imagen: No se envía al backend (immutable, A5)
 *    - Autorización: Solo propietario (backend valida, 403 Forbidden)
 *    - AC-11.4: Preservar contenido si hay error
 *
 * 3. Integración con servicios (PublicacionService, T048/T049):
 *    - Invoca publicacionService.editarPublicacion(publicacionId, nuevoTexto)
 *    - Callback onSuccess: (publicacion: Publicacion) => void
 *    - Callback onCancel: () => void
 *
 * Props:
 * - `publicacion: Publicacion` — Publicación a editar (contiene texto actual e imagen)
 * - `onSuccess: (publicacion: Publicacion) => void` — Callback tras editar exitosamente
 * - `onCancel: () => void` — Callback de cancelación
 * - `deshabilitado?: boolean` — Opcional, deshabilitar si no está autenticado
 *
 * Historias de usuario:
 * - HU-11: Editar publicación propia
 *
 * Criterios de aceptación:
 * - AC-11.1: Solo disponible para publicaciones propias
 * - AC-11.2: Requiere confirmación explícita
 * - AC-11.3: Tras editar, el perfil refleja contenido actualizado
 * - AC-11.4: Si error, mostrar mensaje y preservar contenido editado en formulario
 *
 * Clarificaciones:
 * - A5: Solo texto es editable; imagen es inmutable
 * - openapi.yaml PATCH /publicaciones/{publicacionId}: solo `texto` en body
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo formulario (Principio VI)
 * - Imagen mostrada como referencia, no editable
 * - Si falla servidor: mostrar error específico (400 validación, 403 no propietario, 404 no existe)
 * - T053: Integración con PublicacionList
 */

export interface EditPostFormProps {
  publicacion: Publicacion
  onSuccess: (publicacion: Publicacion) => void
  onCancel: () => void
  deshabilitado?: boolean
}

/**
 * Constantes de validación.
 */
const LONGITUD_MINIMA_TEXTO = 1
const LONGITUD_MAXIMA_TEXTO = 2000

export const EditPostForm: React.FC<EditPostFormProps> = ({
  publicacion,
  onSuccess,
  onCancel,
  deshabilitado = false,
}) => {
  // Form state
  const [texto, setTexto] = useState(publicacion.texto)

  // Validation state
  const [validacion, setValidacion] = useState<ResultadoValidacion>(validacionOk())

  // Server state
  const [enviando, setEnviando] = useState(false)
  const [errorServidor, setErrorServidor] = useState<string>('')

  // Confirmation dialog state
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)

  /**
   * Validar texto de publicación (AC-11.2, A5).
   * Retorna ResultadoValidacion con error si es inválido.
   */
  const validarTexto = (valor: string): ResultadoValidacion => {
    const textoTrimmed = valor.trim()

    if (textoTrimmed.length < LONGITUD_MINIMA_TEXTO) {
      return validacionError('El texto de la publicación no puede estar vacío.')
    }

    if (textoTrimmed.length > LONGITUD_MAXIMA_TEXTO) {
      return validacionError(
        `El texto no puede superar ${LONGITUD_MAXIMA_TEXTO} caracteres. Tienes ${textoTrimmed.length}.`,
      )
    }

    return validacionOk()
  }

  /**
   * Manejar cambio en el campo de texto.
   * Limpia validación previa si el usuario sigue editando.
   */
  const handleTextoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nuevoTexto = e.target.value
    setTexto(nuevoTexto)

    // Limpiar error de servidor si el usuario cambia el texto
    if (errorServidor) {
      setErrorServidor('')
    }

    // Validar mientras escribe (UX: feedback temprano)
    const resultado = validarTexto(nuevoTexto)
    setValidacion(resultado)
  }

  /**
   * Manejar click en "Editar" — muestra confirmación (AC-11.2).
   */
  const handleClickEditar = () => {
    const resultado = validarTexto(texto)
    setValidacion(resultado)

    if (!resultado.esValido) {
      return
    }

    // AC-11.2: Requiere confirmación explícita
    setMostrarConfirmacion(true)
  }

  /**
   * Confirmar edición — envía al servidor.
   * (AC-11.2: confirmación explícita)
   */
  const handleConfirmarEdicion = async () => {
    setMostrarConfirmacion(false)
    setEnviando(true)
    setErrorServidor('')

    try {
      // Validación final antes de enviar
      const resultado = validarTexto(texto)
      if (!resultado.esValido) {
        setValidacion(resultado)
        setEnviando(false)
        return
      }

      // Invocar servicio (T048/T049)
      const publicacionEditada = await publicacionService.editarPublicacion(
        publicacion.id,
        texto.trim(),
      )

      // AC-11.3: Tras editar con éxito, perfil refleja contenido actualizado
      setEnviando(false)
      onSuccess(publicacionEditada)
    } catch (error) {
      // AC-11.4: Si error, mostrar mensaje y preservar contenido
      const mensaje = (error as Error)?.message || 'Error al editar la publicación.'
      setErrorServidor(mensaje)
      setEnviando(false)
      // El contenido se preserva en `texto` (state)
    }
  }

  /**
   * Manejar cancelación de confirmación.
   */
  const handleCancelarConfirmacion = () => {
    setMostrarConfirmacion(false)
  }

  /**
   * Manejar click en "Cancelar" — cierra el formulario.
   */
  const handleCancelar = () => {
    onCancel()
  }

  return (
    <div className="edit-post-form" style={styles.container}>
      <h2 style={styles.titulo}>Editar publicación</h2>

      {/* Sección de imagen (solo lectura, A5) */}
      <div style={styles.seccionImagen}>
        <label style={styles.label}>Imagen (no editable)</label>
        <img
          src={publicacion.imagenUrl}
          alt="Publicación"
          style={styles.imagen}
        />
      </div>

      {/* Sección de texto (editable, A5) */}
      <div style={styles.seccionTexto}>
        <label htmlFor="texto-publicacion" style={styles.label}>
          Texto
          <span style={styles.contador}>
            {texto.length}/{LONGITUD_MAXIMA_TEXTO}
          </span>
        </label>
        <textarea
          id="texto-publicacion"
          value={texto}
          onChange={handleTextoChange}
          placeholder="Edita el texto de tu publicación..."
          disabled={enviando || deshabilitado}
          maxLength={LONGITUD_MAXIMA_TEXTO}
          rows={6}
          style={{
            ...styles.textarea,
            borderColor: validacion.esValido ? '#ccc' : '#d9534f',
            opacity: enviando || deshabilitado ? 0.6 : 1,
          }}
        />
        {!validacion.esValido && (
          <div style={styles.errorValidacion}>{validacion.error}</div>
        )}
      </div>

      {/* Mensaje de error del servidor (AC-11.4) */}
      {errorServidor && (
        <div style={styles.errorServidor}>
          <strong>Error:</strong> {errorServidor}
        </div>
      )}

      {/* Botones de acción */}
      <div style={styles.botones}>
        <button
          onClick={handleCancelar}
          disabled={enviando || deshabilitado}
          style={{
            ...styles.botonCancelar,
            opacity: enviando || deshabilitado ? 0.6 : 1,
            cursor: enviando || deshabilitado ? 'not-allowed' : 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleClickEditar}
          disabled={enviando || deshabilitado || !validacion.esValido}
          style={{
            ...styles.botonGuardar,
            opacity: enviando || deshabilitado || !validacion.esValido ? 0.6 : 1,
            cursor: enviando || deshabilitado || !validacion.esValido ? 'not-allowed' : 'pointer',
          }}
        >
          {enviando ? 'Guardando...' : 'Editar'}
        </button>
      </div>

      {/* Diálogo de confirmación (AC-11.2) */}
      {mostrarConfirmacion && (
        <div style={styles.overlay}>
          <div style={styles.dialogo}>
            <h3 style={styles.tituloDialogo}>Confirmar edición</h3>
            <p style={styles.mensajeDialogo}>
              ¿Estás seguro de que deseas editar esta publicación? Esta acción no se puede deshacer.
            </p>
            <div style={styles.botonesDialogo}>
              <button
                onClick={handleCancelarConfirmacion}
                disabled={enviando}
                style={{
                  ...styles.botonDialogoCancelar,
                  opacity: enviando ? 0.6 : 1,
                  cursor: enviando ? 'not-allowed' : 'pointer',
                }}
              >
                No, cancelar
              </button>
              <button
                onClick={handleConfirmarEdicion}
                disabled={enviando}
                style={{
                  ...styles.botonDialogoConfirmar,
                  opacity: enviando ? 0.6 : 1,
                  cursor: enviando ? 'not-allowed' : 'pointer',
                }}
              >
                {enviando ? 'Guardando...' : 'Sí, editar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Estilos inline para el formulario (sin CSS externo por simplicidad).
 * En producción, trasladar a archivo CSS o módulo de estilos.
 */
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  titulo: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  seccionImagen: {
    marginBottom: '20px',
  },
  seccionTexto: {
    marginBottom: '20px',
  },
  label: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    color: '#333',
  },
  contador: {
    color: '#666',
    fontSize: '12px',
  },
  imagen: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '4px',
    backgroundColor: '#e9ecef',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontFamily: 'Arial, sans-serif',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  errorValidacion: {
    color: '#d9534f',
    fontSize: '12px',
    marginTop: '5px',
  },
  errorServidor: {
    padding: '12px',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    color: '#721c24',
    fontSize: '13px',
    marginBottom: '15px',
  },
  botones: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  botonCancelar: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#e9ecef',
    color: '#333',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontWeight: '500',
  },
  botonGuardar: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '500',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialogo: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '400px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  tituloDialogo: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#333',
  },
  mensajeDialogo: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  botonesDialogo: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  botonDialogoCancelar: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#e9ecef',
    color: '#333',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontWeight: '500',
  },
  botonDialogoConfirmar: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#ffc107',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '500',
  },
}
