/**
 * Cliente HTTP base para administración (`frontend-admin` / módulo administrativo unificado).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-11, RF-12, RF-75, CB-13)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T004, T042, T044)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección C)
 *
 * Responsabilidades:
 * - Implementa el puerto `HttpClient`.
 * - Agrega de forma centralizada `Authorization: Bearer <token>` a cada request saliente.
 * - Inyección tardía de token desde `sessionManager` (o proveedor registrado) para evitar dependencias
 *   circulares en tiempo de construcción.
 * - Manejo uniforme de errores HTTP (HttpError, HttpUnauthorizedError, HttpForbiddenError).
 */

import type { HttpClient, HttpRequestOptions } from '../application/ports/HttpClient'
import { config } from './config'

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export class HttpUnauthorizedError extends HttpError {
  constructor(body: unknown) {
    super('No autenticado o sesión administrativa expirada.', 401, body)
    this.name = 'HttpUnauthorizedError'
  }
}

export class HttpForbiddenError extends HttpError {
  constructor(body: unknown) {
    super('No tiene permisos suficientes para realizar esta acción administrativa.', 403, body)
    this.name = 'HttpForbiddenError'
  }
}

export type AdminTokenProvider = () => string | null | Promise<string | null>

let registeredAdminTokenProvider: AdminTokenProvider | null = null

export function registerAdminTokenProvider(provider: AdminTokenProvider): void {
  registeredAdminTokenProvider = provider
}

let explicitAuthToken: string | null = null

export function setAuthToken(token: string | null): void {
  explicitAuthToken = token
}

export function getAuthToken(): string | null {
  return explicitAuthToken
}

async function resolverTokenAdmin(): Promise<string | null> {
  if (explicitAuthToken) {
    return explicitAuthToken
  }
  if (registeredAdminTokenProvider) {
    return registeredAdminTokenProvider()
  }

  // Intento de inyección tardía en tiempo de ejecución desde sessionManager
  try {
    const sessionManagerPath = './sessionManager'
    const modulo: any = await import(/* @vite-ignore */ sessionManagerPath)
    if (modulo && typeof modulo.sessionManager?.getToken === 'function') {
      return modulo.sessionManager.getToken()
    }
    if (modulo && typeof modulo.obtenerSesion === 'function') {
      const sesion = modulo.obtenerSesion()
      return sesion?.token ?? null
    }
  } catch {
    // Si sessionManager aún no existe o no tiene token, continúa
  }

  return null
}

function construirUrl(path: string, params?: HttpRequestOptions['params']): string {
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

async function leerCuerpoSeguro(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json().catch(() => null)
  }
  return response.text().catch(() => null)
}

async function ejecutarRequest<T>(
  path: string,
  init: RequestInit,
  options?: HttpRequestOptions,
): Promise<T> {
  const token = await resolverTokenAdmin()
  const headers: Record<string, string> = {
    ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...options?.headers,
    ...((init.headers as Record<string, string>) || {}),
  }

  if (token && !headers.Authorization && !headers.authorization) {
    headers.Authorization = `Bearer ${token}`
  }

  const url = construirUrl(path, options?.params)

  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    signal: options?.signal,
    headers,
  })

  if (response.status === 401) {
    throw new HttpUnauthorizedError(await leerCuerpoSeguro(response))
  }

  if (response.status === 403) {
    throw new HttpForbiddenError(await leerCuerpoSeguro(response))
  }

  if (!response.ok) {
    throw new HttpError(
      `Error HTTP ${response.status} al solicitar ${path}`,
      response.status,
      await leerCuerpoSeguro(response),
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await leerCuerpoSeguro(response)) as T
}

export const httpClientAdmin: HttpClient = {
  get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return ejecutarRequest<T>(path, { method: 'GET' }, options)
  },

  post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    const data = body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined
    return ejecutarRequest<T>(path, { method: 'POST', body: data }, options)
  },

  patch<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    const data = body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined
    return ejecutarRequest<T>(path, { method: 'PATCH', body: data }, options)
  },

  put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    const data = body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined
    return ejecutarRequest<T>(path, { method: 'PUT', body: data }, options)
  },

  delete<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return ejecutarRequest<T>(path, { method: 'DELETE' }, options)
  },
}
