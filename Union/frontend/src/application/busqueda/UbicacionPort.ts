/**
 * Puerto de permiso de ubicación del módulo 007 (T060).
 *
 * La UI no importa `geolocationClient`: la implementación (`UbicacionAdapter`, T061) lo envuelve.
 * Mientras A-02 esté diferida al backend, solo se define la interfaz mínima que consume la UI.
 *
 * Fuente de verdad:
 * - Union/specs/007-inspiraciones-busqueda/plan.md (puertos adicionales; infraestructura)
 * - Union/specs/007-inspiraciones-busqueda/spec.md (A-02)
 * - Union/specs/007-inspiraciones-busqueda/tasks.md (T060)
 */
export type EstadoPermisoUbicacion = 'no_soportado' | 'prompt' | 'granted' | 'denied'

export interface UbicacionPort {
  /** Estado actual del permiso; `no_soportado` si el navegador no ofrece geolocalización. */
  estadoPermiso(): EstadoPermisoUbicacion
  /** Notifica cambios de permiso (incluida la revocación). Devuelve la función para cancelar la suscripción. */
  suscribirCambioPermiso(callback: (estado: EstadoPermisoUbicacion) => void): () => void
}
