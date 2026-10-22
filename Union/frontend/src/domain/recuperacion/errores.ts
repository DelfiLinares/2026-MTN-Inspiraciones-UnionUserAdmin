import { CodigoErrorRecuperacion } from './enums'
import { COOLDOWN_REENVIO_SEGUNDOS } from './constantes'

export interface ErrorRecuperacion {
  codigo: CodigoErrorRecuperacion
  mensaje: string
  esperaSegundos?: number
  intentosRestantes?: number
}

export class RecuperacionError extends Error {
  constructor(readonly detalle: ErrorRecuperacion) {
    super(detalle.mensaje)
    this.name = 'RecuperacionError'
  }
}

const MENSAJES: Record<CodigoErrorRecuperacion, string> = {
  [CodigoErrorRecuperacion.OTP_INVALIDO]: 'Código incorrecto. Revisalo e intentá de nuevo.',
  [CodigoErrorRecuperacion.OTP_EXPIRADO]: 'El código venció. Pedí uno nuevo.',
  [CodigoErrorRecuperacion.OTP_AGOTADO]: 'Superaste los intentos permitidos. Pedí un código nuevo.',
  [CodigoErrorRecuperacion.DEMASIADAS_SOLICITUDES]: 'Hiciste demasiadas solicitudes. Esperá un momento e intentá de nuevo.',
  [CodigoErrorRecuperacion.VALIDACION]: 'Revisá los datos ingresados.',
  [CodigoErrorRecuperacion.CREDENCIALES_INVALIDAS]: 'Mail o contraseña incorrectos.',
  [CodigoErrorRecuperacion.APELACION_DUPLICADA]: 'Ya tenés una apelación pendiente de revisión.',
  [CodigoErrorRecuperacion.APELACION_RECHAZO_RECIENTE]: 'Tu última apelación fue rechazada. Podrás enviar otra más adelante.',
  [CodigoErrorRecuperacion.CUENTA_NO_APELABLE]: 'Esta cuenta no está suspendida, por lo que no se puede apelar.',
  [CodigoErrorRecuperacion.RED]: 'No pudimos conectar con el servidor. Intentá de nuevo.',
}

const CODIGOS_CONOCIDOS = new Set<string>(Object.values(CodigoErrorRecuperacion))

/** Alias que el backend puede emitir (ErrorResponse.code) para los códigos del dominio. */
const ALIAS: Record<string, CodigoErrorRecuperacion> = {
  VALIDATION_ERROR: CodigoErrorRecuperacion.VALIDACION,
}

interface ErrorHttpLike {
  status: number
  body?: unknown
}

function esErrorHttp(error: unknown): error is ErrorHttpLike {
  return typeof error === 'object' && error !== null && typeof (error as ErrorHttpLike).status === 'number'
}

function leerCuerpo(body: unknown): Record<string, unknown> {
  return typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}
}

function numeroPositivo(valor: unknown): number | undefined {
  return typeof valor === 'number' && Number.isFinite(valor) && valor >= 0 ? valor : undefined
}

/**
 * Traduce un error de transporte/API al error de dominio con mensaje en español (RF-06).
 * Lee `code` (ErrorResponse del backend), `error` o `codigo`.
 */
export function mapearErrorRecuperacion(error: unknown): ErrorRecuperacion {
  if (error instanceof RecuperacionError) return error.detalle

  if (!esErrorHttp(error) || error.status >= 500) {
    return { codigo: CodigoErrorRecuperacion.RED, mensaje: MENSAJES[CodigoErrorRecuperacion.RED] }
  }

  const cuerpo = leerCuerpo(error.body)
  const bruto = String(cuerpo.code ?? cuerpo.error ?? cuerpo.codigo ?? '')
  const normalizado = ALIAS[bruto] ?? bruto
  let codigo: CodigoErrorRecuperacion

  if (CODIGOS_CONOCIDOS.has(normalizado)) {
    codigo = normalizado as CodigoErrorRecuperacion
  } else if (error.status === 429) {
    codigo = CodigoErrorRecuperacion.DEMASIADAS_SOLICITUDES
  } else if (error.status === 401) {
    codigo = CodigoErrorRecuperacion.CREDENCIALES_INVALIDAS
  } else if (error.status === 409) {
    codigo = CodigoErrorRecuperacion.APELACION_DUPLICADA
  } else {
    codigo = CodigoErrorRecuperacion.VALIDACION
  }

  const detalle: ErrorRecuperacion = { codigo, mensaje: MENSAJES[codigo] }
  if (error.status === 429) {
    detalle.esperaSegundos = numeroPositivo(cuerpo.retryAfterSeconds) ?? COOLDOWN_REENVIO_SEGUNDOS
  }
  const intentos = numeroPositivo(cuerpo.intentosRestantes)
  if (codigo === CodigoErrorRecuperacion.OTP_INVALIDO && intentos !== undefined) {
    detalle.intentosRestantes = intentos
    detalle.mensaje = `${MENSAJES[codigo]} Te quedan ${intentos} intento${intentos === 1 ? '' : 's'}.`
  }
  return detalle
}
