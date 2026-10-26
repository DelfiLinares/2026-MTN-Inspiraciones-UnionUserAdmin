/**
 * Mapeo de errores HTTP a excepciones de dominio
 *
 * ESTRUCTURA ESQUELETO LISTA PARA T093
 *
 * Fuente de verdad:
 * - Union/specs/003-desafios/spec.md (códigos HTTP esperados)
 * - Union/specs/003-desafios/research.md (mapeo de errores)
 * - Union/specs/003-desafios/tasks.md (T093)
 *
 * Mapeos esperados según spec:
 * - 400 Bad Request: Validación fallida (CB-11, CB-12)
 * - 401 Unauthorized: Sesión expirada (RF-24, CB-08)
 * - 403 Forbidden: Permiso denegado (RF-21, CB-03)
 * - 404 Not Found: Recurso no existe (A-01 resuelto)
 * - 409 Conflict: Conflicto de versión (P-04, CB-02)
 * - 500+ Server Error: Error del servidor
 *
 * PENDIENTES DE T089:
 * - Confirmar codificación de errores en respuestas del API
 * - Definir estructura de body de error (ej: { code, message, details[] })
 * - Mapear a excepciones de dominio específicas
 */

import { ApiError, HttpUnauthorizedError, HttpForbiddenError } from '../httpClient'

/**
 * Excepciones de dominio para desafíos
 */

export class DesafioNoEncontradoError extends Error {
  constructor(id: string) {
    super(`Desafío con id ${id} no encontrado`)
    this.name = 'DesafioNoEncontradoError'
  }
}

export class ConflictoVersionError extends Error {
  constructor(mensaje?: string) {
    super(mensaje || 'El recurso fue modificado por otro usuario. Recarga la página para ver los cambios.')
    this.name = 'ConflictoVersionError'
  }
}

export class ValidacionError extends Error {
  readonly detalles: Record<string, string>

  constructor(mensaje: string, detalles: Record<string, string> = {}) {
    super(mensaje)
    this.name = 'ValidacionError'
    this.detalles = detalles
  }
}

export class OperacionNoPermitidaError extends Error {
  constructor(mensaje?: string) {
    super(mensaje || 'No tienes permiso para realizar esta operación')
    this.name = 'OperacionNoPermitidaError'
  }
}

export class SesionExpiradaError extends HttpUnauthorizedError {
  constructor() {
    super({ message: 'Sesión expirada' })
    this.name = 'SesionExpiradaError'
  }
}

/**
 * Mapeo de errores HTTP a excepciones de dominio
 *
 * TODO: T089 + T093 - Ajustar según respuestas reales del API
 *
 * @param error ApiError o HttpUnauthorizedError o HttpForbiddenError
 * @returns Excepción de dominio específica
 */
export function mapearErrorDesafios(error: Error): Error {
  if (error instanceof HttpUnauthorizedError) {
    // TODO: Confirmar con API si 401 siempre significa sesión expirada
    return new SesionExpiradaError()
  }

  if (error instanceof HttpForbiddenError) {
    // TODO: Confirmar estructura de body para permisos denegados
    return new OperacionNoPermitidaError()
  }

  if (error instanceof ApiError) {
    const status = error.status
    const body = error.body as Record<string, any>

    // TODO: T093 - Mapear según códigos reales
    switch (status) {
      case 400: {
        // Validación: esperar body.details o body.errors
        // body: { message: "...", details: { campo: "Error" } }
        const detalles = body?.details || body?.errors || {}
        return new ValidacionError(body?.message || 'Datos inválidos', detalles)
      }

      case 404: {
        // Recurso no encontrado
        // body: { message: "Desafío no encontrado" }
        return new DesafioNoEncontradoError(body?.id || 'desconocido')
      }

      case 409: {
        // Conflicto de versión (If-Match)
        // body: { message: "Versión desactualizada", code: "CONFLICT" }
        return new ConflictoVersionError(body?.message)
      }

      default:
        return error
    }
  }

  return error
}

/**
 * Utilidad para extraer mensaje de error de respuesta
 *
 * TODO: Ajustar según estructura real de errores del API
 */
export function extraerMensajeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, any>
    return obj.message || obj.error || String(error)
  }

  return 'Error desconocido'
}
