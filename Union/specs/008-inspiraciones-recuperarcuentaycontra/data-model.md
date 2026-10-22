# Data Model — 008 Recuperar cuenta y contraseña

Modelo del lado frontend (dominio y estado en memoria). Las tablas del backend se describen solo como contrato requerido.

## 1. Value objects (dominio)

| Nombre | Regla |
|---|---|
| `EmailRecuperacion` | Recortado; formato `^[^@\s]+@[^@\s]+\.[^@\s]+$`, máx. 254. |
| `CodigoOtp` | Exactamente 6 dígitos; normaliza espacios y guiones al construir. |
| `NuevaContrasena` | ≥ 8 caracteres, ≥ 1 letra, ≥ 1 dígito, ≥ 1 carácter especial; expone qué requisitos faltan. |
| `MensajeApelacion` | 20–1000 caracteres tras recortar. |

## 2. Enums

| Enum | Valores |
|---|---|
| `PasoRecuperacion` | `SOLICITAR_CODIGO`, `INGRESAR_CODIGO`, `COMPLETADO` |
| `EstadoApelacion` | `PENDIENTE`, `ACEPTADA`, `RECHAZADA` |
| `CodigoErrorRecuperacion` | `OTP_INVALIDO`, `OTP_EXPIRADO`, `OTP_AGOTADO`, `DEMASIADAS_SOLICITUDES`, `VALIDACION`, `CREDENCIALES_INVALIDAS`, `APELACION_DUPLICADA`, `APELACION_RECHAZO_RECIENTE`, `CUENTA_NO_APELABLE`, `RED` |

## 3. Estado en memoria del asistente

| Campo | Tipo | Notas |
|---|---|---|
| `paso` | `PasoRecuperacion` | Se reinicia al recargar (A-12). |
| `email` | `EmailRecuperacion` | Se conserva entre pasos. |
| `reenvioDisponibleEn` | timestamp | Cooldown de 60 s o el valor de `Retry-After`. |
| `intentosRestantes` | número opcional | Solo si el backend lo informa. |
| `enviando` | booleano | Bloquea envíos dobles. |

El código y las contraseñas viven solo en el estado local del formulario y se descartan al salir.

## 4. Entidades de intercambio

- **SolicitudCodigo**: `{ email }`.
- **ConfirmacionRestablecimiento**: `{ email, code, newPassword }`.
- **SolicitudApelacion**: `{ email, password, mensaje }`.
- **Apelacion** (vista admin): `{ id, usuarioId, username, email, mensaje, estado, creadaEn, resueltaEn?, resueltaPor?, motivoRechazo? }`.
- **ErrorApi**: `{ code, message, requestId? }` (formato existente de `ErrorResponse`).

## 5. Reglas de negocio del cliente

1. El botón de confirmar solo se habilita con `CodigoOtp` y `NuevaContrasena` válidos y confirmación coincidente.
2. El reenvío está bloqueado hasta `reenvioDisponibleEn`.
3. Cualquier error de solicitud de código (salvo 429/red) se presenta como el mensaje neutro (A-4).
4. Un `403 CUENTA_BANEADA` en login activa el aviso con enlace a la apelación; un `401` no.
5. Aceptar/rechazar una apelación requiere confirmación; rechazar exige motivo no vacío.

## 6. Tablas requeridas en el backend (contrato, no se implementan aquí)

- **`usuario`**: columna nueva `password_changed_at` (para invalidar JWT previos, G-05).
- **`apelacion_cuenta`**: `id`, `usuario_id` (FK), `mensaje`, `estado`, `motivo_rechazo`, `resuelta_por`, `created_at`, `resolved_at`; índice por (`usuario_id`, `estado`) y por `estado`, `created_at`.
- **OTP y contadores**: claves Redis con TTL (`pwreset:{email_normalizado}` con hash del código, intentos y expiración; `pwreset:rate:{email|ip}`).
- **`TipoEventoSeguridad`**: `PASSWORD_RESET_REQUESTED`, `PASSWORD_RESET_COMPLETED`, `PASSWORD_RESET_FAILED`, `APPEAL_SUBMITTED`, `APPEAL_ACCEPTED`, `APPEAL_REJECTED`, `ACCOUNT_REACTIVATED`.
