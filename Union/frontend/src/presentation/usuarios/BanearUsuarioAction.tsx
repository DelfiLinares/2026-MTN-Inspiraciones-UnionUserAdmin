/**
 * `BanearUsuarioAction`: Acción "Banear" con selección de baneo temporal/permanente.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T036, depende de T024, T025, T034b, T035)
 * - Union/specs/002-frontend-admin/spec.md HU-01, AC-01.2, AC-01.3, AC-01.6
 *
 * Responsabilidades:
 * - AC-01.2: Permite elegir entre baneo temporal (indicando una fecha de fin) o permanente.
 * - Usa `AccionSensibleBoton` (T025) para el botón que dispara la acción y `ConfirmDialog` (T024,
 *   contrato de T023b) para la confirmación explícita antes de ejecutar el baneo (RF-23, RNF-06).
 * - Delega la validación de negocio (CB-01, CB-08) a `UsuariosServiceAdmin.banear()` (T034b): este
 *   componente no reimplementa esas reglas, solo captura el error y lo expone mediante `onError`.
 * - AC-01.5 (CB-01): el botón se deshabilita cuando `usuario.puedeSerBaneado()` es false (rol
 *   ADMIN o uno mismo), delegando a la entidad `UsuarioAdmin` (T017).
 * - AC-01.6: tras confirmar, invoca `onBaneado` para que el consumidor (T038, `UsuariosPage`)
 *   pueda refrescar el listado.
 *
 * Nota de integración con el contrato de T023b: `ConfirmDialogProps` no admite `children` (contrato
 * cerrado: `titulo`, `mensaje`, `onConfirmar`, `onCancelar`, `cargando?`). Por eso el selector de
 * tipo de baneo (permanente/temporal + fecha de fin) se renderiza como un bloque separado, junto a
 * `ConfirmDialog`, en lugar de anidado dentro de él.
 */

import React, { useState } from 'react'
import { AccionSensibleBoton } from '../shared/AccionSensibleBoton'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { UsuariosServiceAdmin } from '../../application/UsuariosServiceAdmin'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import type { UsuarioAdmin } from '../../domain/UsuarioAdmin'

export interface BanearUsuarioActionProps {
  readonly usuario: UsuarioAdmin
  readonly httpClient: HttpClient
  readonly obtenerAdminActualId?: () => string | undefined
  readonly onBaneado?: () => void
  readonly onError?: (mensaje: string) => void
}

type TipoBaneo = 'permanente' | 'temporal'

export const BanearUsuarioAction: React.FC<BanearUsuarioActionProps> = ({
  usuario,
  httpClient,
  obtenerAdminActualId,
  onBaneado,
  onError,
}) => {
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [tipoBaneo, setTipoBaneo] = useState<TipoBaneo>('permanente')
  const [fechaFin, setFechaFin] = useState('')
  const [cargando, setCargando] = useState(false)

  const servicio = React.useMemo(
    () => new UsuariosServiceAdmin(httpClient, obtenerAdminActualId),
    [httpClient, obtenerAdminActualId]
  )

  const adminActualId = obtenerAdminActualId?.()
  const puedeBanear = usuario.puedeSerBaneado(adminActualId)

  const confirmar = async () => {
    setCargando(true)
    try {
      const opciones = tipoBaneo === 'temporal' && fechaFin !== '' ? { fechaFin: new Date(fechaFin) } : {}
      await servicio.banear(usuario, opciones)
      setDialogoAbierto(false)
      onBaneado?.()
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo banear al usuario.'
      onError?.(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <AccionSensibleBoton
        etiqueta="Banear"
        sensible
        onClick={() => setDialogoAbierto(true)}
        deshabilitado={!puedeBanear}
      />

      {dialogoAbierto && (
        <div className="banear-usuario-action__dialogo">
          <fieldset>
            <legend>Tipo de baneo</legend>
            <label>
              <input
                type="radio"
                name="tipoBaneo"
                value="permanente"
                checked={tipoBaneo === 'permanente'}
                onChange={() => setTipoBaneo('permanente')}
              />
              Permanente
            </label>
            <label>
              <input
                type="radio"
                name="tipoBaneo"
                value="temporal"
                checked={tipoBaneo === 'temporal'}
                onChange={() => setTipoBaneo('temporal')}
              />
              Temporal
            </label>
            {tipoBaneo === 'temporal' && (
              <input
                type="date"
                value={fechaFin}
                onChange={(evento) => setFechaFin(evento.target.value)}
                aria-label="Fecha de fin del baneo temporal"
              />
            )}
          </fieldset>

          <ConfirmDialog
            titulo="Banear usuario"
            mensaje={`¿Confirmás banear a ${usuario.nombre}?`}
            onConfirmar={confirmar}
            onCancelar={() => setDialogoAbierto(false)}
            cargando={cargando}
          />
        </div>
      )}
    </>
  )
}
