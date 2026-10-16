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

/**
 * T072: Manejo uniforme de respuestas 401/403 del futuro backend.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T072, depende de T031)
 * - Union/specs/002-frontend-admin/spec.md RNF-05
 *
 * Nota de ubicación/colisión de nombres: `tasks.md` indica la ruta
 * `frontend-admin/src/infrastructure/httpClient.ts` para esta tarea, pero (igual que en T031, ver
 * cabecera de este archivo) ese nombre ya está ocupado por la implementación real de
 * `001-plataforma-unificada`. Dado que este módulo (`002-frontend-admin`) todavía no cuenta con una
 * implementación concreta propia del puerto `HttpClient` (T031 solo definió la interfaz, sin tarea
 * posterior que la implemente), el manejo uniforme de 401/403 se agrega aquí, en
 * `AdminHttpClientPort.ts` (el archivo que de hecho cumple el rol de `httpClient.ts` de este
 * módulo), como una utilidad reutilizable (`interpretarEstadoHttpAdmin`) que cualquier futura
 * implementación concreta del puerto puede invocar antes de resolver una respuesta exitosa.
 *
 * Responsabilidades:
 * - RNF-05: ninguna acción administrativa se considera autorizada por estar habilitada en el
 *   frontend; ante un 401 (no autenticado/sesión expirada) o un 403 (sin permisos) del backend, se
 *   lanza siempre el mismo tipo de error con el mismo mensaje uniforme ("Sesión no válida o sin
 *   permisos."), sin distinguir el motivo exacto en el mensaje expuesto a la capa de presentación
 *   (que normalmente lo mostrará vía `MensajeError`, T027), reflejando que la autorización real
 *   depende exclusivamente del backend.
 */

export class HttpErrorAdmin extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(message)
    this.name = 'HttpErrorAdmin'
  }
}

export const MENSAJE_SESION_INVALIDA_O_SIN_PERMISOS = 'Sesión no válida o sin permisos.'

/**
 * Error uniforme para respuestas 401 (no autenticado/sesión expirada) y 403 (sin permisos) del
 * backend administrativo. Ambos casos exponen el mismo mensaje (RNF-05): el frontend no distingue
 * el motivo exacto, ya que en ambos casos la acción no debe considerarse autorizada.
 */
export class HttpSesionInvalidaOSinPermisosError extends HttpErrorAdmin {
  constructor(status: 401 | 403, body: unknown) {
    super(MENSAJE_SESION_INVALIDA_O_SIN_PERMISOS, status, body)
    this.name = 'HttpSesionInvalidaOSinPermisosError'
  }
}

/**
 * Inspecciona el código de estado de una respuesta HTTP del backend administrativo y, si
 * corresponde a 401 o 403, lanza `HttpSesionInvalidaOSinPermisosError` con el mensaje uniforme
 * (RNF-05). Para cualquier otro estado, no hace nada (no es responsabilidad de esta función
 * manejar otros códigos de error).
 */
export function interpretarEstadoHttpAdmin(status: number, body?: unknown): void {
  if (status === 401 || status === 403) {
    throw new HttpSesionInvalidaOSinPermisosError(status, body)
  }
}
