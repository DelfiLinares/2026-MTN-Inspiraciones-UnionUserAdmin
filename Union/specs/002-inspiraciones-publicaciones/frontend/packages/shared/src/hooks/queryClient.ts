// Configuración de TanStack Query para el frontend (T034).
// - staleTime: 30 segundos (30_000 ms) por defecto (RNF-02, D-02).
// - retry en queries: delegado a ErrorHttp o hasta 2 reintentos ante error de red / 500 (D-11).
//   Si el error es 4xx (400, 401, 403, 404, 409, 413, 415, 422), no se reintenta (retry: false).
// - retry en mutaciones: 0 (nunca reintentar mutaciones para evitar duplicados - D-11).

import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";
import { ErrorHttp } from "../services/errores";

export const TIEMPO_OBSOLESCENCIA_MS = 30_000; // 30 segundos

/**
 * Función que evalúa si un fallo de consulta debe ser reintentado por TanStack Query.
 * Respeta la decisión D-11: no reintentar errores de cliente (4xx).
 */
export function debeReintentarConsulta(failureCount: number, error: unknown): boolean {
  if (error instanceof ErrorHttp) {
    if (typeof error.codigo === "number" && error.codigo >= 400 && error.codigo < 500) {
      return false;
    }
  }
  return failureCount < 2;
}

export function crearConfiguracionQueryClient(): QueryClientConfig {
  return {
    defaultOptions: {
      queries: {
        staleTime: TIEMPO_OBSOLESCENCIA_MS,
        retry: debeReintentarConsulta,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  };
}

export function crearQueryClient(): QueryClient {
  return new QueryClient(crearConfiguracionQueryClient());
}
