# Quickstart — 008 Recuperar cuenta y contraseña

Guía de validación manual para cuando el frontend esté implementado y el backend publique el contrato. Hoy los endpoints **no existen** en el backend.

## Prerrequisitos
- Frontend: `cd Union/frontend; npm install; npm run dev`.
- Backend con los endpoints de `contracts/openapi.yaml` y un SMTP de desarrollo (p. ej. MailHog) o log del código.
- Cuentas de prueba: una `ACTIVE`, una `SUSPENDED`, un `ADMIN`.

## Escenarios
1. **Recuperar contraseña (feliz)**: Login → "¿Olvidaste tu contraseña?" → email → recibir código → ingresar código + nueva contraseña → vuelve a `/login` con mensaje de éxito → iniciar sesión con la nueva contraseña.
2. **Mensaje neutro**: pedir código para un email inexistente → mismo mensaje que para uno existente.
3. **Código incorrecto / vencido / agotado**: cada caso muestra su mensaje y la acción de pedir código nuevo.
4. **Reenvío**: botón deshabilitado 60 s con cuenta regresiva; al exceder 3 solicitudes/hora aparece el aviso de espera (429).
5. **Contraseña inválida**: se señalan los requisitos faltantes sin llamar a la API.
6. **Sesiones previas**: con sesión abierta en otra pestaña, tras el cambio de contraseña esa sesión deja de ser válida.
7. **Cuenta suspendida**: login con la cuenta `SUSPENDED` → aviso diferenciado + enlace a `/apelar-suspension`; con contraseña incorrecta → mensaje genérico.
8. **Apelación**: enviar mensaje de 20–1000 caracteres → confirmación; repetir → aviso de apelación pendiente.
9. **Admin**: abrir la vista de apelaciones → aceptar (la cuenta vuelve a poder iniciar sesión) y rechazar con motivo; ambas piden confirmación.
10. **Accesibilidad**: completar los flujos solo con teclado y verificar anuncios de error.

## Pruebas automatizadas previstas
`cd Union/frontend; npm run test` — dominio (política de contraseña, OTP, mensaje), servicios (mapeo de errores, cooldown) y páginas.
