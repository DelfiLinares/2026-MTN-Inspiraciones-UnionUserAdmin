import { useEffect, useState } from 'react'
import type { EstadoPermisoUbicacion, UbicacionPort } from '../../application/busqueda/UbicacionPort'

/**
 * Observa el permiso de ubicación a través del puerto `UbicacionPort` (T038b).
 * No importa `geolocationClient`; la implementación concreta se inyecta por parámetro.
 */
export function useUbicacionPermiso(ubicacion: UbicacionPort): EstadoPermisoUbicacion {
  const [estado, setEstado] = useState<EstadoPermisoUbicacion>(() => ubicacion.estadoPermiso())

  useEffect(() => {
    setEstado(ubicacion.estadoPermiso())
    return ubicacion.suscribirCambioPermiso(setEstado)
  }, [ubicacion])

  return estado
}
