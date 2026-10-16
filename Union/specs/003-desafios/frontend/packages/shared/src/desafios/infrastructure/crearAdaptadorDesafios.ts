/**
 * Selector de adaptador según VITE_DESAFIOS_ADAPTER (T031)
 *
 * Selecciona la implementación del puerto DesafiosPort basado en
 * la variable de entorno VITE_DESAFIOS_ADAPTER.
 *
 * Configuración (de T003):
 * - memoria (default): adaptador en memoria para desarrollo
 * - http: adaptador HTTP para integración con API real
 *
 * Fuentes de verdad:
 * - spec.md: Principios de arquitectura
 * - plan.md: Decisión de usar adaptador en memoria por defecto
 * - tasks.md: T031, T003
 */

import { InMemoryDesafiosAdapter } from "./memoria";
import { HttpDesafiosAdapter } from "./http";
import type { DesafiosPort } from "../application/ports/DesafiosPort";

/**
 * Obtiene la variable de entorno VITE_DESAFIOS_ADAPTER.
 *
 * En Vite, las variables con prefijo VITE_ se reemplazan en tiempo de build.
 * Durante el desarrollo, se cargan desde .env.local.
 *
 * Valor por defecto: "memoria"
 */
function obtenerAdaptadorConfigurable(): string {
  // En Vite, accedemos con import.meta.env (optional chaining por seguridad)
  const adaptador = (import.meta.env as any)?.VITE_DESAFIOS_ADAPTER || "memoria";
  return adaptador.toLowerCase().trim();
}

/**
 * Crea la instancia del adaptador DesafiosPort según configuración.
 *
 * @param httpClient Cliente HTTP opcional (requerido si adaptador es "http")
 * @param baseUrl URL base de la API (requerido si adaptador es "http")
 * @returns Instancia de DesafiosPort
 * @throws Error si se solicita adaptador "http" sin httpClient
 */
export function crearAdaptadorDesafios(
  httpClient?: any,
  baseUrl?: string
): DesafiosPort {
  const tipo = obtenerAdaptadorConfigurable();

  switch (tipo) {
    case "memoria":
      // Adaptador en memoria: no requiere dependencias externas
      return new InMemoryDesafiosAdapter();

    case "http":
      // Adaptador HTTP: requiere cliente HTTP
      if (!httpClient) {
        throw new Error(
          "VITE_DESAFIOS_ADAPTER=http requiere inyectar httpClient"
        );
      }
      return new HttpDesafiosAdapter(httpClient, baseUrl || "");

    default:
      throw new Error(
        `Adaptador desconocido: VITE_DESAFIOS_ADAPTER=${tipo}. Valores válidos: "memoria", "http"`
      );
  }
}

/**
 * Obtiene el tipo de adaptador configurado (para logs o debugging).
 *
 * @returns El valor de VITE_DESAFIOS_ADAPTER normalizado
 */
export function obtenerTipoAdaptadorConfigurable(): string {
  return obtenerAdaptadorConfigurable();
}
