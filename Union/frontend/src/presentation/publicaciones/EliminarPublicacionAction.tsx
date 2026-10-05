/**
 * `EliminarPublicacionAction`: Acción "Eliminar" de publicación.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T045, depende de T024, T025, T042c, T043)
 * - Union/specs/002-frontend-admin/spec.md HU-05, AC-05.2, AC-05.4
 *
 * Responsabilidades:
 * - Usa `AccionSensibleBoton` (T025) para el botón que dispara la acción y `ConfirmDialog` (T024,
 *   contrato de T023b) para la confirmación explícita antes de aplicarse (AC-05.2).
 * - AC-05.4: `AccionSensibleBoton` aplica el estilo visual diferenciado de acción
 *   sensible/destructiva (`sensible={true}`).
 * - Delega la validación de negocio a `PublicacionesServiceAdmin.eliminar()` (T042c): este
 *   componente no reimplementa la regla `puedeSerEliminada()`, solo captura el error y lo expone
 *   mediante `onError`.
 * - Tras confirmar, invoca `onEliminada` para que el consumidor (T046, `PublicacionesPage`) pueda
 *   refrescar el listado.
 *
 * Nota (HU-05, independencia de acciones): esta acción es independiente de "Aceptar reporte"
 * (HU-07): no se encadenan automáticamente (Clarifications Session 2026-10-05, ver A2 en
 * `spec.md`). No corresponde a este componente integrar lógica de reportes.
 */

import React, { useState } from 'react'
import { AccionSensibleBoton } from '../shared/AccionSensibleBoton'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { PublicacionesServiceAdmin } from '../../application/PublicacionesServiceAdmin'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import type { PublicacionModeracion } from '../../domain/PublicacionModeracion'

export interface EliminarPublicacionActionProps {
  readonly publicacion: PublicacionModeracion
  readonly httpClient: HttpClient
  readonly onEliminada?: () => void
  readonly onError?: (mensaje: string) => void
}

export const EliminarPublicacionAction: React.FC<EliminarPublicacionActionProps> = ({
  publicacion,
  httpClient,
  onEliminada,
  onError,
}) => {
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)

  const servicio = React.useMemo(() => new PublicacionesServiceAdmin(httpClient), [httpClient])

  const puedeEliminar = publicacion.puedeSerEliminada()

  const confirmar = async () => {
    setCargando(true)
    try {
      await servicio.eliminar(publicacion)
      setDialogoAbierto(false)
      onEliminada?.()
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo eliminar la publicación.'
      onError?.(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <AccionSensibleBoton
        etiqueta="Eliminar"
        sensible
        onClick={() => setDialogoAbierto(true)}
        deshabilitado={!puedeEliminar}
      />

      {dialogoAbierto && (
        <ConfirmDialog
          titulo="Eliminar publicación"
          mensaje="¿Confirmás eliminar esta publicación? Esta acción no se puede deshacer."
          onConfirmar={confirmar}
          onCancelar={() => setDialogoAbierto(false)}
          cargando={cargando}
        />
      )}
    </>
  )
}
