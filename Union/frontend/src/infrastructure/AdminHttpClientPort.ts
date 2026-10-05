/**
 * Interfaz `HttpClient` abstracta (sin implementación real) del módulo `002-frontend-admin`.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T031, depende de T007)
 * - Union/specs/002-frontend-admin/plan.md §Project Structure
 *   (`src/infrastructure/` → cliente HTTP)
 *
 * Nota de colisión de nombres (mismo patrón documentado en T012/T014/T015/T020/T022/T030):
 * `tasks.md` indica la ruta `frontend-admin/src/infrastructure/httpClient.ts`, pero ese nombre ya
 * está ocupado en `Union/frontend/src/infrastructure/httpClient.ts` por la implementación REAL
 * (fetch wrapper con inyección de token, manejo de errores `ApiError`/`HttpUnauthorizedError`/
 * `HttpForbiddenError`) del frontend de usuario (`001-plataforma-unificada`, T036/T037), consumida
 * activamente por `tokenStorage.ts` y los `authProviders/*`.
 *
 * Además, el puerto abstracto equivalente (misma forma: `get`/`post`/`patch`/`put`/`delete`) ya
 * existe en `Union/frontend/src/application/ports/HttpClient.ts` (T042 de `001-plataforma-unificada`).
 *
 * El nombre original previsto para este archivo era `HttpClientAdmin.ts` (siguiendo el patrón de
 * sufijo `*Admin` aplicado a los enums de este módulo: `RolUsuarioAdmin`, `EstadoPublicacionAdmin`,
 * `MotivoReporteAdmin`), pero ese nombre colisiona en sistemas de archivos case-insensitive con
 * `Union/frontend/src/infrastructure/httpClientAdmin.ts` (preexistente, distinto solo en
 * capitalización), lo cual TypeScript rechaza como archivos duplicados. Por eso se renombró a
 * `AdminHttpClientPort.ts`. Es intencionalmente idéntica en forma al puerto existente de
 * `001-plataforma-unificada`, ya que ambas representan el mismo contrato de abstracción sobre HTTP
 * (Principio V: la capa de aplicación no depende de `fetch` directamente). La implementación
 * concreta de este módulo se definirá en una tarea posterior, fuera de T031, que sólo pide la
 * interfaz SIN implementación real.
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
