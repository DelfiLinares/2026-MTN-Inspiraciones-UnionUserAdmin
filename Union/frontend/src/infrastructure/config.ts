/**
 * Configuración de entorno de frontend.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md
 * - Union/specs/001-plataforma-unificada/plan.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T003, T036)
 * - Union/specs/002-frontend-admin/tasks.md (T007): `apiBaseUrl` es también la URL base de la
 *   futura API Java consumida por el módulo administrativo (sin endpoints hardcodeados,
 *   Principio III de la constitución). Ver `.env.example` / `.env.admin.example`.
 */

import type { BusquedaRepository } from '../application/busqueda/BusquedaRepository'
import { BusquedaEnMemoriaRepository } from './busqueda/BusquedaEnMemoriaRepository'
import { BusquedaHttpRepository } from './busqueda/BusquedaHttpRepository'

export type BusquedaRepositorioModo = 'ejemplo' | 'http'

/**
 * Módulo 007 (búsqueda y descubrimiento): selecciona el repositorio de datos.
 * Variable `VITE_BUSQUEDA_REPOSITORIO`: `http` (por defecto) | `ejemplo` (demo explícita).
 * Fuente: Union/specs/007-inspiraciones-busqueda/tasks.md (T005, T025)
 */
function resolverBusquedaRepositorio(valor: string | undefined): BusquedaRepositorioModo {
  return valor === 'ejemplo' ? 'ejemplo' : 'http'
}

export const config = {
  apiBaseUrl: import.meta.env?.VITE_API_URL ?? import.meta.env?.VITE_API_BASE_URL ?? '/api',
  useMocks: import.meta.env?.VITE_USE_MOCKS === 'true',
  authGoogleRedirectUrl: import.meta.env?.VITE_AUTH_GOOGLE_REDIRECT_URL ?? '',
  authGithubRedirectUrl: import.meta.env?.VITE_AUTH_GITHUB_REDIRECT_URL ?? '',
  geolocationEnabledDefault: import.meta.env?.VITE_GEOLOCATION_ENABLED_DEFAULT === 'true',
  busquedaRepositorio: resolverBusquedaRepositorio(import.meta.env?.VITE_BUSQUEDA_REPOSITORIO),
}

/**
 * Punto de composición del módulo 007 (T025): único lugar donde se elige la implementación
 * de `BusquedaRepository` según `config.busquedaRepositorio`. Dominio, aplicación y
 * componentes solo conocen el puerto.
 *
 * Nota: los imports de infraestructura de búsqueda forman un ciclo con `httpClient`
 * (que importa `config`), pero es inocuo: `httpClient` solo lee `config` al ejecutar
 * una petición, nunca al cargar el módulo.
 */
export function crearBusquedaRepository(
  modo: BusquedaRepositorioModo = config.busquedaRepositorio,
): BusquedaRepository {
  return modo === 'http' ? new BusquedaHttpRepository() : new BusquedaEnMemoriaRepository()
}

let busquedaRepositorioUnico: BusquedaRepository | null = null

/** Instancia compartida para la aplicación (se crea en el primer uso). */
export function obtenerBusquedaRepository(): BusquedaRepository {
  busquedaRepositorioUnico ??= crearBusquedaRepository()
  return busquedaRepositorioUnico
}
