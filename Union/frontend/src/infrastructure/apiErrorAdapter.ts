import { ApiError } from './httpClient'
import type { ApiErrorDto } from './dto/perfilDtos'

export class ErrorDeDominio extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly codigo: string,
    readonly detalleTecnico?: string,
    readonly requestId?: string,
  ) {
    super(message)
    this.name = 'ErrorDeDominio'
  }
}

function esObjeto(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function obtenerCodigoPorStatus(status: number): string {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONFLICT'
    case 413:
      return 'FILE_TOO_LARGE'
    case 415:
      return 'UNSUPPORTED_MEDIA_TYPE'
    default:
      return status >= 500 ? 'INTERNAL_SERVER_ERROR' : `HTTP_${status}`
  }
}

function obtenerMensajeUsuario(status: number, codigo: string, body: ApiErrorDto): string {
  if (status === 400) {
    return body.message ?? 'Revisá los datos ingresados.'
  }

  switch (codigo) {
    case 'UNAUTHORIZED':
      return 'Tu sesión expiró. Iniciá sesión nuevamente.'
    case 'FORBIDDEN':
      return 'No tenés permisos para esta acción.'
    case 'NOT_FOUND':
      return 'El recurso no existe o el perfil no está disponible.'
    case 'USERNAME_TAKEN':
      return 'Ese nombre de usuario ya está en uso.'
    case 'FOLDER_NAME_DUPLICATE':
      return 'Ya tenés una carpeta con ese nombre.'
    case 'FOLDER_LIMIT_REACHED':
      return 'Alcanzaste el máximo de 50 carpetas.'
    case 'FILE_TOO_LARGE':
      return 'La imagen supera los 5 MB.'
    case 'UNSUPPORTED_MEDIA_TYPE':
      return 'Formato no soportado. Usá JPG, PNG o WebP.'
    default:
      if (status >= 500 || codigo === 'INTERNAL_SERVER_ERROR') {
        return 'Error del servidor. Intentá nuevamente más tarde.'
      }
      if (status === 409) {
        return 'Esta acción entra en conflicto con el estado actual.'
      }
      return 'No se pudo completar la acción. Intentá nuevamente.'
  }
}

export function adaptarApiError(error: ApiError): ErrorDeDominio {
  const body = (esObjeto(error.body) ? error.body : {}) as ApiErrorDto
  const codigo =
    typeof body.code === 'string' ? body.code : obtenerCodigoPorStatus(error.status)
  const detalleTecnico = typeof body.message === 'string' ? body.message : undefined
  const requestId = typeof body.requestId === 'string' ? body.requestId : undefined

  return new ErrorDeDominio(
    obtenerMensajeUsuario(error.status, codigo, body),
    error.status,
    codigo,
    detalleTecnico,
    requestId,
  )
}

export function lanzarErrorAdaptado(error: unknown): never {
  if (error instanceof ApiError) {
    throw adaptarApiError(error)
  }
  throw error
}
