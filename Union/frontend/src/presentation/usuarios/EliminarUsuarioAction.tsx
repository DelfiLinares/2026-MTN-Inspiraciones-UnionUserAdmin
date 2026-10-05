/**
 * `EliminarUsuarioAction`: Acción "Eliminar" de usuario.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T037, depende de T024, T025, T034c, T035)
 * - Union/specs/002-frontend-admin/spec.md HU-02, AC-02.2, AC-02.5
 *
 * Responsabilidades:
 * - Usa `AccionSensibleBoton` (T025) para el botón que dispara la acción y `ConfirmDialog` (T024,
 *   contrato de T023b) para la confirmación explícita antes de ejecutar la eliminación (RF-23,
 *   RNF-06).
 * - Delega la validación de negocio (CB-01) a `UsuariosServiceAdmin.eliminar()` (T034c): este
 *   componente no reimplementa esa regla, solo captura el error y lo expone mediante `onError`.
 * - AC-02.4 (CB-01): el botón se deshabilita cuando `usuario.puedeSerEliminado()` es false (rol
 *   ADMIN o uno mismo), delegando a la entidad `UsuarioAdmin` (T017).
 * - AC-02.5: tras confirmar, invoca `onEliminado` para que el consumidor (T038, `UsuariosPage`)
 *   pueda refrescar el listado.
 */

import React, { useState } from 'react'
import { AccionSensibleBoton } from '../shared/AccionSensibleBoton'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { UsuariosServiceAdmin } from '../../application/UsuariosServiceAdmin'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import type { UsuarioAdmin } from '../../domain/UsuarioAdmin'

export interface EliminarUsuarioActionProps {
  readonly usuario: UsuarioAdmin
  readonly httpClient: HttpClient
  readonly obtenerAdminActualId?: () => string | undefined
  readonly onEliminado?: () => void
  readonly onError?: (mensaje: string) => void
}

export const EliminarUsuarioAction: React.FC<EliminarUsuarioActionProps> = ({
  usuario,
  httpClient,
  obtenerAdminActualId,
  onEliminado,
  onError,
}) => {
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)

  const servicio = React.useMemo(
    () => new UsuariosServiceAdmin(httpClient, obtenerAdminActualId),
    [httpClient, obtenerAdminActualId]
  )

  const adminActualId = obtenerAdminActualId?.()
  const puedeEliminar = usuario.puedeSerEliminado(adminActualId)

  const confirmar = async () => {
    setCargando(true)
    try {
      await servicio.eliminar(usuario)
      setDialogoAbierto(false)
      onEliminado?.()
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo eliminar al usuario.'
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
          titulo="Eliminar usuario"
          mensaje={`¿Confirmás eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`}
          onConfirmar={confirmar}
          onCancelar={() => setDialogoAbierto(false)}
          cargando={cargando}
        />
      )}
    </>
  )
}
