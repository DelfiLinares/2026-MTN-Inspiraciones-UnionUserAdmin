# Especificación — 008 Recuperar cuenta y contraseña (Frontend)

**Estado**: Clarificada | **Fecha**: 2026-10-22 | **Rama**: `008-inspiraciones-recuperarcuentaycontra`
**Constitution**: `Union/.specify/memory/constitution.md` (aplican I, III, IV, IX, XV)
**Naturaleza**: solo frontend React. El backend se implementa en el repo `2026-MTN-Inspiraciones-Api`; sus faltantes están en `research.md` y su contrato requerido en `contracts/openapi.yaml`. Esta especificación no contiene código.

---

## Clarificaciones

### Sesión 2026-10-22
- **(A-1) Alcance de "recuperar cuenta"**: incluye (a) recuperar contraseña olvidada y (b) apelar una cuenta `SUSPENDED` (baneada por un admin). La reactivación de cuentas `DELETED` queda fuera.
- **(A-2) Mecanismo**: código numérico (OTP) de 6 dígitos enviado por email. No se usan enlaces con token.
- **(A-3) Parámetros del OTP** (a validar con backend): 6 dígitos, vigencia 10 minutos, un solo uso, máximo 5 intentos fallidos (luego se invalida), reenvío con espera de 60 s, máximo 3 solicitudes por hora por email.
- **(A-4) Anti-enumeración**: la solicitud de código responde siempre igual exista o no el email; el frontend nunca revela si una cuenta existe.
- **(A-5) Política de nueva contraseña**: idéntica a la del registro (mínimo 8 caracteres, al menos una letra, un número y un carácter especial).
- **(A-6) Sesiones previas**: tras cambiar la contraseña, el backend debe invalidar los JWT emitidos antes. El frontend además limpia su sesión local y redirige a login.
- **(A-7) Cuenta suspendida en login**: el backend responde `403` con código `CUENTA_BANEADA` (el contrato que ya maneja `authService.ts`, RF-77) solo cuando la contraseña es correcta; el frontend muestra el aviso y el acceso a la apelación.
- **(A-8) Apelación sin sesión**: una cuenta suspendida no puede iniciar sesión, por lo que la apelación se envía con email + contraseña + mensaje (20–1000 caracteres).
- **(A-9) Reglas de apelación** (a validar con backend): una apelación `PENDIENTE` por cuenta; tras un rechazo, nueva apelación permitida después de 7 días.
- **(A-10) Revisión por admin**: el admin lista apelaciones, las acepta (cuenta vuelve a `ACTIVE`) o las rechaza con motivo. Esta pantalla es P2 y se integra en la consola admin de Union.
- **(A-11) Responsabilidades**: el frontend valida formato y guía el flujo; generación/validación de OTP, envío de emails, límites de tasa, invalidación de sesiones y reglas de apelación son del backend (principio IX).
- **(A-12) Estado en memoria**: email y paso del asistente viven en memoria; recargar la página reinicia el flujo. El código y la contraseña nunca se guardan en `localStorage`/`sessionStorage`.

---

## 1. Objetivo

Permitir que una persona que no puede acceder a su cuenta la recupere sin ayuda externa: restablecer una contraseña olvidada mediante un código enviado a su email, o apelar una suspensión para que un administrador revise su caso.

## 2. Actores

| Actor | Responsabilidades |
|---|---|
| Usuario sin sesión | Solicita el código, lo ingresa, define nueva contraseña; o envía una apelación. |
| Administrador | Revisa apelaciones y las acepta o rechaza. |
| Sistema (frontend) | Guía el flujo, valida formato, muestra estados y errores claros. |
| API REST Java | Genera/valida OTP, envía email, limita tasa, cambia contraseña, invalida sesiones, gestiona apelaciones. |

## 3. Fuera de alcance

- Implementación del backend (constitución III y IV) y funciones backend de prueba.
- Reactivación de cuentas `DELETED`.
- Recuperación vía SMS, preguntas de seguridad, OAuth Google/GitHub.
- Cambio de contraseña estando logueado y cambio de email.
- Verificación de email en el registro.

## 4. Historias de usuario

**P1 imprescindible · P2 importante · P3 deseable**

- **HU-01 (P1)** Como usuario que olvidó su contraseña, quiero pedir un código a mi email desde el enlace "¿Olvidaste tu contraseña?" del login.
- **HU-02 (P1)** Como usuario, quiero ingresar el código de 6 dígitos y mi nueva contraseña para recuperar el acceso.
- **HU-03 (P1)** Como usuario, quiero ver reglas claras de contraseña y errores comprensibles (código incorrecto, vencido, demasiados intentos).
- **HU-04 (P1)** Como usuario, quiero que al terminar se me lleve a iniciar sesión con confirmación de éxito.
- **HU-05 (P1)** Como usuario con cuenta suspendida, quiero que el login me explique que está suspendida y me ofrezca apelar.
- **HU-06 (P1)** Como usuario suspendido, quiero enviar una apelación con un mensaje y conocer su estado de recepción.
- **HU-07 (P2)** Como usuario, quiero reenviar el código cuando no llegó, respetando una espera visible.
- **HU-08 (P2)** Como administrador, quiero listar apelaciones pendientes y aceptarlas o rechazarlas con confirmación explícita.
- **HU-09 (P2)** Como usuario, quiero que el flujo sea accesible (teclado, lectores de pantalla) y usable en móvil.

## 5. Criterios de aceptación

**HU-01**
- El enlace de `LoginPage` apunta a la ruta `/recuperar-contrasena` (hoy es `#recuperar`).
- El formulario pide solo email; valida formato antes de enviar y bloquea el envío doble.
- Tras enviar se muestra siempre el mismo mensaje neutro ("Si el correo está registrado, recibirás un código") y se avanza al paso del código.
- Si el backend responde 429, se muestra el tiempo de espera indicado.

**HU-02**
- El campo de código acepta solo 6 dígitos (pegar texto con espacios lo normaliza).
- La nueva contraseña requiere confirmación y se oculta por defecto con opción de mostrar.
- El botón queda deshabilitado hasta que código y contraseña cumplan el formato.

**HU-03**
- Respuesta `400` con código `OTP_INVALIDO`: "Código incorrecto" + intentos restantes si el backend lo informa.
- Código vencido o agotado: mensaje específico y acción "Pedir un código nuevo".
- Contraseña no válida: se indica qué requisito falta, sin esperar al backend.

**HU-04**
- Éxito: se limpia el estado en memoria, se redirige a `/login` y se muestra "Contraseña actualizada. Iniciá sesión".
- Cualquier sesión local previa se elimina.

**HU-05**
- Un `403` con `CUENTA_BANEADA` muestra aviso diferenciado del de credenciales inválidas, con enlace a `/apelar-suspension`.
- Un `401` sigue mostrando el mensaje genérico (no revela estado).

**HU-06**
- Formulario con email, contraseña y mensaje (20–1000 caracteres, contador visible).
- Éxito: confirmación "Apelación recibida"; `409` (ya hay una pendiente) y `429` (rechazo reciente) tienen mensajes propios.
- La pantalla no expone el motivo del ban salvo que el backend lo incluya en la respuesta.

**HU-07**
- El botón de reenvío está deshabilitado 60 s con cuenta regresiva visible.

**HU-08**
- Lista paginada con estado, fecha y mensaje. Aceptar/rechazar piden confirmación explícita (constitución XIII); rechazar exige motivo.
- Solo visible para rol `ADMIN` (la autorización real la valida el backend).

**HU-09**
- Errores con `role="alert"`, foco al primer campo inválido, etiquetas asociadas, uso completo con teclado.

## 6. Requisitos funcionales

| ID | Requisito | HU |
|---|---|---|
| RF-01 | Ruta pública `/recuperar-contrasena` con asistente de 2 pasos (email → código + nueva contraseña). | 01, 02 |
| RF-02 | Mensaje de solicitud idéntico exista o no la cuenta. | 01 |
| RF-03 | Validar email con el mismo criterio de formato que login/registro. | 01 |
| RF-04 | Campo de código: 6 dígitos numéricos, normalización de espacios. | 02 |
| RF-05 | Validar política de contraseña (A-5) y coincidencia con confirmación en cliente. | 02, 03 |
| RF-06 | Mapear errores de la API (`code`) a mensajes en español con acción sugerida. | 03 |
| RF-07 | Tras éxito, limpiar sesión local y redirigir a login con mensaje. | 04 |
| RF-08 | Login muestra aviso específico ante `403 CUENTA_BANEADA` con enlace a apelación. | 05 |
| RF-09 | Ruta pública `/apelar-suspension` con formulario email + contraseña + mensaje. | 06 |
| RF-10 | Cooldown de reenvío de 60 s y manejo de 429 con tiempo de espera. | 07 |
| RF-11 | Vista admin de apelaciones con aceptar/rechazar confirmados. | 08 |
| RF-12 | Estado del flujo solo en memoria; nunca persistir código ni contraseñas. | todas |
| RF-13 | Toda llamada usa `httpClient` y `apiEndpoints.ts`; sin URLs sueltas en componentes. | todas |
| RF-14 | Si la API no responde (red/5xx) mostrar error recuperable con reintento. | todas |

## 7. Requisitos no funcionales

- **RNF-01 Seguridad**: no registrar código ni contraseña en consola ni logs; `autocomplete="one-time-code"` y `new-password` en los campos.
- **RNF-02 Accesibilidad**: WCAG 2.1 AA en los formularios nuevos.
- **RNF-03 Consistencia visual**: reutilizar el estilo de `login.css` y componentes existentes.
- **RNF-04 Rendimiento**: validaciones locales instantáneas; sin llamadas por tecla.
- **RNF-05 Pruebas**: toda regla de negocio del cliente (política de contraseña, formato OTP, mapeo de errores, cooldown) con tests Vitest (constitución VIII).

## 8. Dependencias externas

La entrega completa depende de los endpoints descritos en `contracts/openapi.yaml`, que **hoy no existen** en el backend (ver `research.md`). Hasta entonces el frontend se desarrolla contra un `HttpClient` simulado en tests, sin crear backend de prueba (constitución IV).

## 9. Casos borde

- Código correcto pero contraseña inválida: no se consume el intento; se corrige y reenvía.
- Usuario abre el flujo en dos pestañas: gana el último código emitido; el anterior responde "código inválido".
- Email con mayúsculas/espacios: se recorta antes de enviar; la normalización final es del backend.
- Cuenta `DELETED`/inexistente: comportamiento indistinguible del caso normal (A-4).
- Admin que intenta recuperar contraseña desde la pantalla de usuario: el flujo es válido; el rechazo de admin en login (RF-78) sigue aplicando.
- Respuesta 429 sin cabecera de espera: usar 60 s por defecto.
