/**
 * Servicio admin de apelaciones de cuentas suspendidas (spec 008, HU-08, RF-11).
 * Autorización real a cargo del backend (/api/admin/** exige ADMIN).
 */

import type { HttpClient } from './ports/HttpClient'
import { httpClientAdmin } from '../infrastructure/httpClientAdmin'
import { apiEndpoints } from '../infrastructure/apiEndpoints'
import { EstadoApelacion, LONGITUD_MAXIMA_MOTIVO_RECHAZO } from '../domain/recuperacion'

export interface Apelacion {
  id: string
  usuarioId: string
  username: string
  email: string
  mensaje: string
  estado: EstadoApelacion
  creadaEn: string
  resueltaEn?: string | null
  motivoRechazo?: string | null
}

export interface PaginaApelaciones {
  contenido: Apelacion[]
  pagina: number
  tamanio: number
  totalElementos: number
}

export interface AppealsAdminService {
  listar(filtros?: { estado?: EstadoApelacion; page?: number; size?: number }): Promise<PaginaApelaciones>
  aceptar(apelacionId: string): Promise<Apelacion>
  rechazar(apelacionId: string, motivo: string): Promise<Apelacion>
}

export function crearAppealsAdminService(http: HttpClient): AppealsAdminService {
  return {
    listar(filtros = {}) {
      return http.get<PaginaApelaciones>(apiEndpoints.apelacionesAdmin(), {
        params: { estado: filtros.estado, page: filtros.page ?? 0, size: filtros.size ?? 20 },
      })
    },

    aceptar(apelacionId) {
      return http.post<Apelacion>(apiEndpoints.aceptarApelacion(apelacionId))
    },

    rechazar(apelacionId, motivoBruto) {
      const motivo = motivoBruto.trim()
      if (!motivo || motivo.length > LONGITUD_MAXIMA_MOTIVO_RECHAZO) {
        throw new Error(`El motivo es obligatorio y admite hasta ${LONGITUD_MAXIMA_MOTIVO_RECHAZO} caracteres.`)
      }
      return http.post<Apelacion>(apiEndpoints.rechazarApelacion(apelacionId), { motivo })
    },
  }
}

export const appealsAdminService = crearAppealsAdminService(httpClientAdmin)
