/**
 * `PromoverUsuarioAction`: Acción "Promover a administrador" de usuario.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T066, depende de T024, T025, T065)
 * - Union/specs/002-frontend-admin/spec.md HU-03, AC-03.1, AC-03.2, AC-03.5
 *
 * Responsabilidades:
 * - Usa `AccionSensibleBoton` (T025) con `sensible={true}` para el botón que dispara la acción
 *   (AC-03.5: distinción visual como acción sensible), deshabilitado cuando el usuario seleccionado
 *   ya tiene rol `ADMIN` (`!usuario.puedeSerPromovidoAAdmin()`, RF-08, AC-03.4).
 * - Usa `ConfirmDialog` (T024, contrato de T023b) para la confirmación explícita antes de aplicarse
 *   (AC-03.2), igual que las demás acciones destructivas del módulo (regla de negocio crítica #6
 *   de `spec.md` §6).
 * - Delega la validación de negocio a `UsuariosServiceAdmin.promover()` (T065): este componente no
 *   reimplementa las reglas `puedeSerPromovidoAAdmin()` ni la verificación de rol del actor
 *   (RF-07), solo captura el error y lo expone mediante `onError`.
 * - Tras confirmar, invoca `onPromovido` para que el consumidor (T067, `PromocionPage`) pueda
 *   refrescar el listado/selector de usuarios.
 *
 * Nota AC-03.1 (RF-07, solo un ADMIN puede ejecutar la acción): la verificación de que el actor
 * autenticado tenga rol `ADMIN` ocurre en `UsuariosServiceAdmin.promover()` (si se provee
 * `obtenerRolActorActual` al construir el servicio) o en una capa superior (guardia de ruta
 * `GuardiaRolAdmin`, T028); este componente no la reimplementa.
 */

import React, { useState } from 'react'
import { AccionSensibleBoton } from '../shared/AccionSensibleBoton'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { UsuariosServiceAdmin } from '../../application/UsuariosServiceAdmin'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import type { UsuarioAdmin } from '../../domain/UsuarioAdmin'

export interface PromoverUsuarioActionProps {
  readonly usuario: UsuarioAdmin
  readonly httpClient: HttpClient
  readonly obtenerRolActorActual?: () => string | undefined
  readonly onPromovido?: () => void
  readonly onError?: (mensaje: string) => void
}

export const PromoverUsuarioAction: React.FC<PromoverUsuarioActionProps> = ({
  usuario,
  httpClient,
  obtenerRolActorActual,
  onPromovido,
  onError,
}) => {
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)

  const servicio = React.useMemo(
    () => new UsuariosServiceAdmin(httpClient, undefined, obtenerRolActorActual),
    [httpClient, obtenerRolActorActual]
  )

  const puedePromover = usuario.puedeSerPromovidoAAdmin()

  const confirmar = async () => {
    setCargando(true)
    try {
      await servicio.promover(usuario)
      setDialogoAbierto(false)
      onPromovido?.()
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo promover al usuario.'
      onError?.(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <AccionSensibleBoton
        etiqueta="Promover a administrador"
        sensible
        onClick={() => setDialogoAbierto(true)}
        deshabilitado={!puedePromover}
      />

      {dialogoAbierto && (
        <ConfirmDialog
          titulo="Promover a administrador"
          mensaje="¿Confirmás promover a este usuario al rol ADMIN? Esta acción no se puede deshacer."
          onConfirmar={confirmar}
          onCancelar={() => setDialogoAbierto(false)}
          cargando={cargando}
        />
      )}
    </>
  )
}
