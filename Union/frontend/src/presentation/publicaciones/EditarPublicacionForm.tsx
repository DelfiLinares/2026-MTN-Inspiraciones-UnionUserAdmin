/**
 * `EditarPublicacionForm`: Formulario de edición de publicación con confirmación explícita de
 * guardado y conservación de datos ante error.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T044, depende de T024, T042b, T043)
 * - Union/specs/002-frontend-admin/spec.md HU-04, AC-04.2, AC-04.3, AC-04.4
 *
 * Responsabilidades:
 * - AC-04.1: Permite editar el contenido de cualquier publicación, sin distinguir autor.
 * - AC-04.2: Guardar requiere confirmación explícita vía `ConfirmDialog` (T024, contrato de T023b).
 * - AC-04.3: Tras guardar exitosamente, invoca `onGuardado` para que el consumidor (T046,
 *   `PublicacionesPage`) refleje el cambio sin recargar la página.
 * - AC-04.4: Si el guardado falla, muestra un mensaje de error descriptivo (vía `onError`) y
 *   conserva el contenido ya editado en el formulario (no se reinicia el estado local al fallar).
 * - Delega la validación de negocio (`puedeSerEditada()`) a `PublicacionesServiceAdmin.editar()`
 *   (T042b): este componente no reimplementa esa regla.
 */

import React, { useState } from 'react'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { PublicacionesServiceAdmin } from '../../application/PublicacionesServiceAdmin'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import type { PublicacionModeracion } from '../../domain/PublicacionModeracion'

export interface EditarPublicacionFormProps {
  readonly publicacion: PublicacionModeracion
  readonly contenidoInicial?: string
  readonly httpClient: HttpClient
  readonly onGuardado?: () => void
  readonly onError?: (mensaje: string) => void
}

export const EditarPublicacionForm: React.FC<EditarPublicacionFormProps> = ({
  publicacion,
  contenidoInicial = '',
  httpClient,
  onGuardado,
  onError,
}) => {
  const [contenido, setContenido] = useState(contenidoInicial)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)

  const servicio = React.useMemo(() => new PublicacionesServiceAdmin(httpClient), [httpClient])

  const handleSubmit = (evento: React.FormEvent) => {
    evento.preventDefault()
    setDialogoAbierto(true)
  }

  const confirmarGuardado = async () => {
    setCargando(true)
    try {
      await servicio.editar(publicacion, { contenido })
      setDialogoAbierto(false)
      // AC-04.3: tras guardar exitosamente, se notifica al consumidor sin recargar la página.
      onGuardado?.()
    } catch (error) {
      // AC-04.4: el contenido editado NO se descarta; el formulario conserva lo ya ingresado.
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la publicación.'
      setDialogoAbierto(false)
      onError?.(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="editar-publicacion-form">
      <form onSubmit={handleSubmit} aria-label="Formulario de edición de publicación">
        <label>
          Contenido:
          <textarea
            value={contenido}
            onChange={(evento) => setContenido(evento.target.value)}
            aria-label="Contenido de la publicación"
          />
        </label>
        <button type="submit">Guardar</button>
      </form>

      {dialogoAbierto && (
        <ConfirmDialog
          titulo="Guardar cambios"
          mensaje="¿Confirmás guardar los cambios de esta publicación?"
          onConfirmar={confirmarGuardado}
          onCancelar={() => setDialogoAbierto(false)}
          cargando={cargando}
        />
      )}
    </div>
  )
}
