/**
 * Mapeo de errores HTTP a errores de dominio (T030)
 *
 * Convierte respuestas de error de la API HTTP a excepciones de dominio
 * para mantener la abstracción del puerto.
 *
 * Mapeos:
 * - 400: ErrorValidacion (con campos si está disponible)
 * - 401: Requiere reautenticación (el caso de uso o hook lo maneja)
 * - 403: PermisoDenegado
 * - 404: Error "No encontrado" (se lanza como Error genérico)
 * - 409 (transición): TransicionInvalida
 * - 409 (versión): Error "Conflicto de versión"
 *
 * Fuentes de verdad:
 * - openapi.yaml: Códigos de respuesta y esquemas
 * - data-model.md: Errores de dominio
 * - tasks.md: T030
 */

import { ErrorValidacion, PermisoDenegado, TransicionInvalida } from "../../domain/errores/ErroresDominio";

/**
 * Analiza una respuesta de error HTTP y la convierte a excepción tipada.
 *
 * @param status Código de estado HTTP
 * @param datos Cuerpo de la respuesta (JSON)
 * @returns Excepción correspondiente
 */
export function mapearErrorDesafios(status: number, datos: any): Error {
  switch (status) {
    case 400:
      // Error de validación con campos
      return new ErrorValidacion(
        datos.mensaje || "Error en los datos ingresados",
        datos.campos || {}
      );

    case 401:
      // No autenticado: se maneja en el nivel de caso de uso
      // Aquí solo documentamos que ocurrió
      return new Error("Sesión no válida o expirada (401)");

    case 403:
      // Permiso denegado
      return new PermisoDenegado(datos.mensaje || "No tiene permiso para esta acción");

    case 404:
      // Recurso no encontrado
      return new Error("Recurso no encontrado (404)");

    case 409:
      // Conflicto: puede ser versión o transición inválida
      if (datos.codigo === "CONFLICTO_VERSION") {
        return new Error(`Conflicto de versión: ${datos.mensaje || "Los datos fueron modificados"}`);
      }
      if (datos.codigo === "TRANSICION_INVALIDA") {
        return new TransicionInvalida(datos.mensaje || "Transición de estado no válida");
      }
      // Conflicto genérico (200 duplicado, doble envío)
      return new Error(`Conflicto: ${datos.mensaje || "Operación en conflicto"}`);

    default:
      // Error genérico
      return new Error(
        `Error ${status}: ${datos.mensaje || "Error en la operación"}`
      );
  }
}
