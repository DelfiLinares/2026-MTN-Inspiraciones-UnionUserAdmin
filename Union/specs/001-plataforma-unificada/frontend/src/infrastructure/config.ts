/**
 * Configuración de entorno de frontend.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md
 * - Union/specs/001-plataforma-unificada/plan.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T003, T036)
 */

export const config = {
  apiBaseUrl: import.meta.env?.VITE_API_BASE_URL ?? '',
  authGoogleRedirectUrl: import.meta.env?.VITE_AUTH_GOOGLE_REDIRECT_URL ?? '',
  authGithubRedirectUrl: import.meta.env?.VITE_AUTH_GITHUB_REDIRECT_URL ?? '',
  geolocationEnabledDefault: import.meta.env?.VITE_GEOLOCATION_ENABLED_DEFAULT === 'true',
}
