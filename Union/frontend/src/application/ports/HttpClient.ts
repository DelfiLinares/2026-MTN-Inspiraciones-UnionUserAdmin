/**
 * Puerto `HttpClient` para servicios de aplicación.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2 y 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T042, T070–T075)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección C)
 */

export interface HttpRequestOptions {
  /** Query params opcionales (paginación/filtros server-side). */
  params?: Record<string, string | number | boolean | undefined>
  /** Headers adicionales opcionales. */
  headers?: Record<string, string>
  /** Señal de cancelación (AbortController). */
  signal?: AbortSignal
}

export interface HttpClient {
  get<T>(path: string, options?: HttpRequestOptions): Promise<T>
  post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>
  patch<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>
  put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>
  delete<T>(path: string, options?: HttpRequestOptions): Promise<T>
}
