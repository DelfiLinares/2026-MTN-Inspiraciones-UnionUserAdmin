/**
 * Configuración centralizada del frontend.
 * Spec: RNF-05 (entorno)
 * Quickstart: variables VITE_API_URL, VITE_USE_MOCKS
 */

/**
 * URL base de la API REST.
 * Valor por defecto: "/api/v1" (mismo origen, desarrollo local)
 * En producción o con backend remoto: apunta a URL externa (env var VITE_API_URL)
 */
export const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

/**
 * Activar/desactivar MSW (mocks).
 * true: usa handlers de tests/mocks/ (desarrollo y testing)
 * false: conecta a API real (producción o integración con backend real)
 * Valor por defecto: true (seguro para desarrollo)
 */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";

/**
 * Rol simulado en MSW (solo si USE_MOCKS=true).
 * Valores: "USER", "ADMIN"
 * Permite testing de diferentes roles sin cambiar backend
 */
export const MOCK_ROL = (import.meta.env.VITE_MOCK_ROL || "USER") as "USER" | "ADMIN";

/**
 * Timeout de solicitudes HTTP en ms.
 * Spec: RNF-03 (reintentos y resiliencia)
 */
export const HTTP_TIMEOUT_MS = 30000;

/**
 * Reintentos automáticos.
 * Spec: D-11 (resiliencia de red)
 * GET: 2 reintentos (idempotente)
 * POST/PUT/DELETE: 0 reintentos (no idempotente)
 */
export const RETRY_CONFIG = {
  get: 2,
  mutate: 0,
} as const;

/**
 * Validar que la configuración es coherente.
 * Lanzar advertencia si USE_MOCKS=false pero no hay VITE_API_URL válida.
 */
export function validateConfig(): void {
  if (!USE_MOCKS && API_URL === "/api/v1") {
    console.warn(
      "[CONFIG] USE_MOCKS=false pero API_URL sigue siendo /api/v1. " +
      "Asegúrate de que el backend está disponible en " + API_URL
    );
  }

  if (typeof import.meta.env.VITE_USE_MOCKS === "undefined") {
    console.info(
      "[CONFIG] VITE_USE_MOCKS no definida; usando default: true (MSW activo)"
    );
  }
}

// Validar al importar
validateConfig();
