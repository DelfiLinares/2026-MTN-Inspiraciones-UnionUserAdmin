/**
 * Constantes de dominio del módulo 008 (recuperar cuenta y contraseña).
 * Fuente: Union/specs/008-inspiraciones-recuperarcuentaycontra/spec.md (A-3, A-5, A-9, RF-10).
 * Son parámetros acordados con el backend; se centralizan para ajustarlos en un único lugar.
 */

export const LONGITUD_CODIGO_OTP = 6
export const VIGENCIA_CODIGO_MINUTOS = 10
export const COOLDOWN_REENVIO_SEGUNDOS = 60
export const LONGITUD_MINIMA_CONTRASENA = 8
export const LONGITUD_MAXIMA_EMAIL = 254
export const LONGITUD_MINIMA_MENSAJE_APELACION = 20
export const LONGITUD_MAXIMA_MENSAJE_APELACION = 1000
export const LONGITUD_MAXIMA_MOTIVO_RECHAZO = 500
