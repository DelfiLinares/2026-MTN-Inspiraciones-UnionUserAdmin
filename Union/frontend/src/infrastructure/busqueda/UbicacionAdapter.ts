/**
 * Adaptador de `UbicacionPort` para el módulo 007 (T061).
 *
 * Fuente de verdad:
 * - Union/specs/007-inspiraciones-busqueda/plan.md (puertos adicionales; infraestructura)
 * - Union/specs/007-inspiraciones-busqueda/spec.md (A-02: diferida; la UI no pide ni envía ubicación)
 * - Union/specs/007-inspiraciones-busqueda/tasks.md (T061)
 *
 * Envuelve `geolocationClient` para las suscripciones a cambios y revocaciones de permiso.
 * `geolocationClient` no expone el estado de permiso actual, así que la lectura inicial
 * (prompt / denied / granted) se hace con la Permissions API. Las suscripciones a
 * `geolocationClient` solo existen mientras hay oyentes.
 */

import type { EstadoPermisoUbicacion, UbicacionPort } from '../../application/busqueda/UbicacionPort'
import { geolocationClient } from '../geolocationClient'

type OyentePermiso = (estado: EstadoPermisoUbicacion) => void

export function crearUbicacionAdapter(): UbicacionPort {
  const soportada = geolocationClient.estaSoportada()
  let estado: EstadoPermisoUbicacion = soportada ? 'prompt' : 'no_soportado'
  const oyentes = new Set<OyentePermiso>()
  let desuscribirGeolocation: (() => void) | null = null

  const actualizar = (nuevo: EstadoPermisoUbicacion) => {
    if (nuevo === estado) return
    estado = nuevo
    for (const oyente of oyentes) oyente(nuevo)
  }

  if (soportada && navigator.permissions?.query) {
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => actualizar(status.state))
      .catch(() => {})
  }

  return {
    estadoPermiso() {
      return estado
    },
    suscribirCambioPermiso(callback) {
      oyentes.add(callback)
      if (!desuscribirGeolocation) {
        const cancelarCambio = geolocationClient.onCambioPermiso(actualizar)
        const cancelarRevocacion = geolocationClient.onRevocacionPermiso(() => actualizar('denied'))
        desuscribirGeolocation = () => {
          cancelarCambio()
          cancelarRevocacion()
          desuscribirGeolocation = null
        }
      }
      return () => {
        oyentes.delete(callback)
        if (oyentes.size === 0) desuscribirGeolocation?.()
      }
    },
  }
}
