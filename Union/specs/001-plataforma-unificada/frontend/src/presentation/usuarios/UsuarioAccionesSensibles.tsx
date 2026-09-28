/**
 * `UsuarioAccionesSensibles`: Botones de acciones sensibles sobre un usuario en el módulo
 * administrativo — banear, eliminar, promover y degradar (HU-12).
 *
 * Nota de ubicación: `Union/specs/001-plataforma-unificada/tasks.md` (T097B) define este componente
 * dentro de `Admin/my-proyect/frontend-admin/src/presentation/usuarios/UsuarioAccionesSensibles.tsx`.
 * Por instrucción explícita del usuario (misma confirmación que en T095/T096/T097A), la
 * implementación se coloca aquí, dentro de
 * `Union/specs/001-plataforma-unificada/frontend/src/presentation/usuarios/`, sin leer ni
 * modificar ningún archivo del proyecto `Admin/`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-57–RF-59, RF-76, RF-60/RNF-08, AC-12.2 a
 *   AC-12.8)
 * - Union/specs/001-plataforma-unificada/tasks.md (T097B, depende de T065, T096B, T097A)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección C: banear, eliminar,
 *   promover, degradar)
 *
 * Criterios de aceptación cubiertos:
 * - RF-57/AC-12.2: Banear requiere confirmación explícita (`ConfirmacionAccionSensibleModal`).
 * - RF-58/AC-12.3: Eliminar requiere confirmación explícita.
 * - RF-59/AC-12.4: Promover requiere confirmación explícita; solo ejecutable por rol ADMIN
 *   (asumido: quien accede a este componente ya es ADMIN autenticado).
 * - RF-76/AC-12.8: Degradar (ADMIN → USER) requiere confirmación explícita; un administrador no
 *   puede degradarse a sí mismo.
 * - AC-12.5: Banear/eliminar deshabilitadas si el usuario objetivo es ADMIN o es el propio
 *   administrador autenticado (`usuario.puedeSerBaneado()` / `puedeSerEliminado()`).
 * - AC-12.6: Promover deshabilitada (no-op) si el usuario objetivo ya es ADMIN
 *   (`usuario.puedeSerPromovido()`).
 * - AC-12.7 / RF-60 / RNF-08: Diferenciación visual de las acciones sensibles respecto de acciones
 *   de solo consulta, mediante `ConfirmacionAccionSensibleModal` (variantes de color/ícono) y
 *   estilos distintivos por botón (rojo=peligro, ámbar=advertencia).
 */

import React, { useState } from 'react'
import { UsuarioAdmin } from '../../domain/UsuarioAdmin'
import { RolUsuarioAdmin } from '../../domain/enums/RolUsuarioAdmin'
import {
  banearUsuario,
  eliminarUsuario,
  promoverUsuario,
  degradarUsuario,
  AccionAccesoAdminProhibidaError,
} from '../../services/UsuariosService'
import { ConfirmacionAccionSensibleModal } from '../shared/ConfirmacionAccionSensibleModal'
import type { VarianteAccionSensible } from '../shared/ConfirmacionAccionSensibleModal'

type AccionSensible = 'banear' | 'eliminar' | 'promover' | 'degradar'

export interface UsuarioAccionesSensiblesProps {
  usuario: UsuarioAdmin
  adminActualId: string
  onUsuarioActualizado?: (usuario: UsuarioAdmin) => void
  onUsuarioEliminado?: (usuario: UsuarioAdmin) => void
}

interface ConfiguracionAccion {
  clave: AccionSensible
  etiqueta: string
  variante: VarianteAccionSensible
  titulo: string
  mensaje: string
  claseBoton: string
  habilitada: boolean
}

export const UsuarioAccionesSensibles: React.FC<UsuarioAccionesSensiblesProps> = ({
  usuario,
  adminActualId,
  onUsuarioActualizado,
  onUsuarioEliminado,
}) => {
  const [accionActiva, setAccionActiva] = useState<AccionSensible | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  const puedeBanear = usuario.puedeSerBaneado(adminActualId)
  const puedeEliminar = usuario.puedeSerEliminado(adminActualId)
  const puedePromover = usuario.puedeSerPromovido()
  const puedeDegradar = usuario.rol === RolUsuarioAdmin.ADMIN && usuario.puedeSerDegradado(adminActualId)

  const configuraciones: ConfiguracionAccion[] = [
    {
      clave: 'banear',
      etiqueta: 'Banear',
      variante: 'peligro',
      titulo: 'Banear usuario',
      mensaje: `¿Confirmás banear a "${usuario.nombre}"? La cuenta pasará a estado BANEADO.`,
      claseBoton: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
      habilitada: puedeBanear,
    },
    {
      clave: 'eliminar',
      etiqueta: 'Eliminar',
      variante: 'peligro',
      titulo: 'Eliminar usuario',
      mensaje: `¿Confirmás eliminar a "${usuario.nombre}"? Esta acción marca la cuenta como ELIMINADA.`,
      claseBoton: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
      habilitada: puedeEliminar,
    },
    {
      clave: 'promover',
      etiqueta: 'Promover a admin',
      variante: 'advertencia',
      titulo: 'Promover a administrador',
      mensaje: `¿Confirmás promover a "${usuario.nombre}" a rol ADMIN?`,
      claseBoton: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200',
      habilitada: puedePromover,
    },
    {
      clave: 'degradar',
      etiqueta: 'Degradar a usuario',
      variante: 'advertencia',
      titulo: 'Degradar a usuario',
      mensaje: `¿Confirmás degradar a "${usuario.nombre}" de rol ADMIN a rol USER?`,
      claseBoton: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200',
      habilitada: puedeDegradar,
    },
  ]

  const configuracionActiva = configuraciones.find((c) => c.clave === accionActiva) ?? null

  const ejecutarAccion = async () => {
    if (!accionActiva) {
      return
    }
    setProcesando(true)
    setErrorMensaje(null)
    try {
      switch (accionActiva) {
        case 'banear': {
          const actualizado = await banearUsuario(usuario, adminActualId)
          onUsuarioActualizado?.(actualizado)
          break
        }
        case 'eliminar': {
          await eliminarUsuario(usuario, adminActualId)
          onUsuarioEliminado?.(usuario)
          break
        }
        case 'promover': {
          const actualizado = await promoverUsuario(usuario)
          onUsuarioActualizado?.(actualizado)
          break
        }
        case 'degradar': {
          const actualizado = await degradarUsuario(usuario, adminActualId)
          onUsuarioActualizado?.(actualizado)
          break
        }
      }
      setAccionActiva(null)
    } catch (err: unknown) {
      if (err instanceof AccionAccesoAdminProhibidaError) {
        setErrorMensaje(err.message)
      } else {
        setErrorMensaje('No se pudo completar la acción. Intentá nuevamente.')
      }
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label={`Acciones sensibles sobre ${usuario.nombre}`}>
        {configuraciones.map((config) => (
          <button
            key={config.clave}
            type="button"
            onClick={() => setAccionActiva(config.clave)}
            disabled={!config.habilitada}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${config.claseBoton}`}
          >
            {config.etiqueta}
          </button>
        ))}
      </div>

      {errorMensaje && (
        <p role="alert" className="text-xs text-red-600">
          {errorMensaje}
        </p>
      )}

      {configuracionActiva && (
        <ConfirmacionAccionSensibleModal
          abierto={accionActiva !== null}
          titulo={configuracionActiva.titulo}
          mensaje={configuracionActiva.mensaje}
          variante={configuracionActiva.variante}
          confirmando={procesando}
          onConfirmar={ejecutarAccion}
          onCancelar={() => {
            if (!procesando) {
              setAccionActiva(null)
            }
          }}
        />
      )}
    </div>
  )
}
