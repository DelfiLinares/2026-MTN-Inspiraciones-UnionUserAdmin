/**
 * `ConfirmDialog`: Diálogo de confirmación explícita reutilizable para acciones destructivas.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T024, conforme al contrato de T023b)
 * - Union/specs/002-frontend-admin/spec.md RF-23, RNF-06
 * - Clarifications Session 2026-10-05: no toda acción sensible lo invoca incondicionalmente
 *   (ver T057, excepción de "Aceptar reporte" simple). Por eso este componente no decide CUÁNDO
 *   mostrarse: es el consumidor quien controla su renderizado condicional (p. ej. mediante un
 *   `abierto`/estado local propio), manteniendo este componente sin lógica de negocio.
 *
 * Responsabilidades:
 * - UI de confirmación genérica: título, mensaje, botón confirmar/cancelar, estado de carga.
 * - Sin lógica de negocio: no decide qué acción se confirma, solo delega a `onConfirmar`/`onCancelar`.
 *
 * Nota sobre renderizado condicional: a diferencia de `ConfirmacionAccionSensibleModal.tsx`
 * (componente preexistente de `001-plataforma-unificada`, T096B, con prop `abierto`), este
 * componente conforme al contrato de T023b NO incluye `abierto` en sus props: se asume que el
 * consumidor solo lo monta/renderiza cuando corresponde mostrarlo (patrón de renderizado
 * condicional en JSX del padre), evitando duplicar esa responsabilidad.
 */

import React from 'react'
import type { ConfirmDialogProps } from './ConfirmDialog.types'

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  titulo,
  mensaje,
  onConfirmar,
  onCancelar,
  cargando = false,
}) => {
  return (
    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-titulo">
      <div className="confirm-dialog__contenido">
        <h2 id="confirm-dialog-titulo" className="confirm-dialog__titulo">
          {titulo}
        </h2>
        <p className="confirm-dialog__mensaje">{mensaje}</p>
        <div className="confirm-dialog__acciones">
          <button
            type="button"
            className="confirm-dialog__boton confirm-dialog__boton--cancelar"
            onClick={onCancelar}
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="confirm-dialog__boton confirm-dialog__boton--confirmar"
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando ? 'Procesando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
