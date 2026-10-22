/**
 * Servicio de recuperación de cuenta y contraseña (spec 008, RF-02, RF-06, RF-07, RF-09, RF-14).
 * Contrato: Union/specs/008-inspiraciones-recuperarcuentaycontra/contracts/openapi.yaml
 *
 * Se construye con un `HttpClient` inyectado para poder probarlo sin backend (constitución III/IV).
 */

import type { HttpClient } from './ports/HttpClient'
import { httpClient } from '../infrastructure/httpClient'
import { tokenStorage } from '../infrastructure/tokenStorage'
import { apiEndpoints } from '../infrastructure/apiEndpoints'
import {
  CodigoErrorRecuperacion,
  CodigoOtp,
  EmailRecuperacion,
  MensajeApelacion,
  NuevaContrasena,
  RecuperacionError,
  mapearErrorRecuperacion,
} from '../domain/recuperacion'

export interface DependenciasRecoveryService {
  http: HttpClient
  limpiarSesionLocal: () => void
}

export interface RecoveryService {
  solicitarCodigo(email: string): Promise<void>
  confirmar(datos: { email: string; codigo: string; nuevaContrasena: string; confirmacion: string }): Promise<void>
  apelar(datos: { email: string; password: string; mensaje: string }): Promise<void>
}

/** Un 400/404 al pedir el código se trata como éxito para no revelar si la cuenta existe (A-4). */
const ESTADOS_NEUTROS = new Set([400, 404])

export function crearRecoveryService(deps: DependenciasRecoveryService): RecoveryService {
  return {
    async solicitarCodigo(emailBruto) {
      const email = EmailRecuperacion.crear(emailBruto).valor
      try {
        await deps.http.post<void>(apiEndpoints.solicitarCodigoRecuperacion(), { email })
      } catch (error) {
        const estado = (error as { status?: number }).status
        if (typeof estado === 'number' && ESTADOS_NEUTROS.has(estado)) return
        throw new RecuperacionError(mapearErrorRecuperacion(error))
      }
    },

    async confirmar({ email, codigo, nuevaContrasena, confirmacion }) {
      const payload = {
        email: EmailRecuperacion.crear(email).valor,
        code: CodigoOtp.crear(codigo).valor,
        newPassword: NuevaContrasena.crear(nuevaContrasena, confirmacion).valor,
      }
      try {
        await deps.http.post<void>(apiEndpoints.confirmarRestablecimiento(), payload)
      } catch (error) {
        throw new RecuperacionError(mapearErrorRecuperacion(error))
      }
      deps.limpiarSesionLocal()
    },

    async apelar({ email, password, mensaje }) {
      if (!password) {
        throw new RecuperacionError({
          codigo: CodigoErrorRecuperacion.VALIDACION,
          mensaje: 'Ingresá tu contraseña.',
        })
      }
      const payload = {
        email: EmailRecuperacion.crear(email).valor,
        password,
        mensaje: MensajeApelacion.crear(mensaje).valor,
      }
      try {
        await deps.http.post<void>(apiEndpoints.enviarApelacion(), payload)
      } catch (error) {
        throw new RecuperacionError(mapearErrorRecuperacion(error))
      }
    },
  }
}

export const recoveryService = crearRecoveryService({
  http: httpClient,
  limpiarSesionLocal: () => tokenStorage.clearToken(),
})
