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

export const config = {
  apiBaseUrl: import.meta.env?.VITE_API_BASE_URL ?? '/api',
  authGoogleRedirectUrl: import.meta.env?.VITE_AUTH_GOOGLE_REDIRECT_URL ?? '',
  authGithubRedirectUrl: import.meta.env?.VITE_AUTH_GITHUB_REDIRECT_URL ?? '',
  geolocationEnabledDefault: import.meta.env?.VITE_GEOLOCATION_ENABLED_DEFAULT === 'true',
}
