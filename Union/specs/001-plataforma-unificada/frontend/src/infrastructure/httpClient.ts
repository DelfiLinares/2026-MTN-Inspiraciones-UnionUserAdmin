/**
 * Cliente HTTP único de la aplicación frontend (wrapper delgado sobre `fetch` nativo).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-06, RF-13, CB-06)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/research.md (sección 2)
 * - Union/specs/001-plataforma-unificada/tasks.md (T036, T037)
 *
 * Responsabilidades:
 * - Wrapper de fetch que adjunta automáticamente `Authorization: Bearer <token>` (RF-06).
 * - Inyección tardía de token para evitar dependencias circulares: invoca `tokenStorage.getToken()`
 *   en cada request sin importar `tokenStorage` en tiempo de construcción.
 * - Base URL configurable vía `config.apiBaseUrl` o `VITE_API_BASE_URL`.
 * - Manejo uniforme de errores HTTP (`ApiError`, `HttpUnauthorizedError`, `HttpForbiddenError`).
 * - Soporte de cancelación de requests vía `AbortController` (signal).
 * - Expone métodos genéricos (`get`, `post`, `put`, `patch`, `delete`) consumidos únicamente
 *   desde la capa de servicios (Principio III y VI).
 */

import { config } from './config'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export class HttpUnauthorizedError extends ApiError {
  constructor(body: unknown) {
    super('No autenticado o sesión expirada (401).', 401, body)
    this.name = 'HttpUnauthorizedError'
  }
}

export class HttpForbiddenError extends ApiError {
  constructor(body: unknown) {
    super('No autorizado para realizar esta acción (403).', 403, body)
    this.name = 'HttpForbiddenError'
  }
}

export interface HttpRequestOptions {
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | undefined>
  signal?: AbortSignal
}

export type TokenProvider = () => string | null | Promise<string | null>

let lateTokenProvider: TokenProvider | null = null

/**
 * Registra el proveedor de tokens de sesión para inyección tardía.
 * Permite que `tokenStorage` o `sessionManager` provean el token sin generar ciclo de importación.
 */
export function registerTokenProvider(provider: TokenProvider): void {
  lateTokenProvider = provider
}

/**
 * Accesor para obtener el token actual en cada request mediante inyección tardía.
 * Si existe un módulo `tokenStorage` global o registrado, lo consulta en tiempo de ejecución.
 */
async function resolverToken(): Promise<string | null> {
  if (lateTokenProvider) {
    return lateTokenProvider()
  }

  // Intento de resolución dinámica en runtime (inyección tardía sin import estático)
  try {
    const tokenStoragePath = './tokenStorage'
    const modulo: any = await import(/* @vite-ignore */ tokenStoragePath)
    if (modulo && typeof modulo.tokenStorage?.getToken === 'function') {
      return modulo.tokenStorage.getToken()
    }
  } catch {
    // Si tokenStorage aún no existe o no tiene getToken, continúa sin token
  }

  return null
}

function normalizarUrl(path: string, params?: HttpRequestOptions['params']): string {
  const baseUrl = config.apiBaseUrl ?? ''
  let urlCompleta = path.startsWith('http')
    ? path
    : `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${path.startsWith('/') ? path : `/${path}`}`

  if (params) {
    const searchParams = new URLSearchParams()
    for (const [clave, valor] of Object.entries(params)) {
      if (valor !== undefined && valor !== null) {
        searchParams.set(clave, String(valor))
      }
    }
    const query = searchParams.toString()
    if (query) {
      urlCompleta += (urlCompleta.includes('?') ? '&' : '?') + query
    }
  }

  return urlCompleta
}

async function parsearCuerpo(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json().catch(() => null)
  }
  return response.text().catch(() => null)
}

async function request<T>(
  path: string,
  init: RequestInit,
  options: HttpRequestOptions = {},
): Promise<T> {
  const token = await resolverToken()
  const headers: Record<string, string> = {
    ...(init.body && !(init.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...options.headers,
    ...((init.headers as Record<string, string>) || {}),
  }

  if (token && !headers.Authorization && !headers.authorization) {
    headers.Authorization = `Bearer ${token}`
  }

  const url = normalizarUrl(path, options.params)

  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    signal: options.signal,
    headers,
  })

  const body = await parsearCuerpo(response)

  if (response.status === 401) {
    throw new HttpUnauthorizedError(body)
  }

  if (response.status === 403) {
    throw new HttpForbiddenError(body)
  }

  if (!response.ok) {
    throw new ApiError(
      `Error HTTP ${response.status} al solicitar ${path}`,
      response.status,
      body,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return body as T
}

export const httpClient = {
  get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return request<T>(path, { method: 'GET' }, options)
  },

  post<T>(path: string, data?: unknown, options?: HttpRequestOptions): Promise<T> {
    const body = data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined
    return request<T>(path, { method: 'POST', body }, options)
  },

  patch<T>(path: string, data?: unknown, options?: HttpRequestOptions): Promise<T> {
    const body = data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined
    return request<T>(path, { method: 'PATCH', body }, options)
  },

  put<T>(path: string, data?: unknown, options?: HttpRequestOptions): Promise<T> {
    const body = data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined
    return request<T>(path, { method: 'PUT', body }, options)
  },

  delete<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return request<T>(path, { method: 'DELETE' }, options)
  },
}
