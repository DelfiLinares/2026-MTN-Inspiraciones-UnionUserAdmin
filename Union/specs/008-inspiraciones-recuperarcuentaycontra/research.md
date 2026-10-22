# Research — 008 Recuperar cuenta y contraseña

**Fecha**: 2026-10-22 | **Repo auditado**: `2026-MTN-Inspiraciones-Api` (rama `dev`, Spring Boot, MySQL, Redis, Flyway, JWT)

## 1. Veredicto

**El backend NO tiene los endpoints ni las funciones necesarias para el 008.** Existen bloques reutilizables (hash, normalización, auditoría, Redis, Flyway, manejador de errores) pero ningún endpoint de recuperación, ni envío de email, ni límites de tasa, ni invalidación de sesiones, ni apelaciones.

## 2. Inventario de lo existente (reutilizable)

| Elemento | Ubicación | Uso en 008 |
|---|---|---|
| `POST /api/auth/login`, `POST /api/auth/register` | `AuthController` | Único contacto actual; `/api/auth/**` ya es `permitAll` en `SecurityConfig`, por lo que los endpoints nuevos bajo `/api/auth/` serán públicos sin tocar la config. |
| `PasswordHashService` (BCrypt 12) | `service/` | Hashear nueva contraseña y el OTP. |
| `IdentifierNormalizationService` | `service/` | Normalizar/validar email (`normalizeEmail`, `isValidEmail`). |
| `UsuarioRepository.findByEmailNormalizado` | `repository/` | Localizar cuenta. |
| Regex de contraseña en `RegisterRequest` | `dto/` | Misma política (A-5); conviene extraerla a una constante compartida. |
| `SecurityAuditService` + tabla `evento_seguridad` | `service/`, `V1` | Auditoría; hay que ampliar el enum. |
| `ErrorResponse{code,message,requestId}` + `GlobalExceptionHandler` | `config/` | Formato de errores (400/401/403/404/409/500). |
| `spring-boot-starter-data-redis` configurado | `pom.xml`, `application.yml` | Almacén con TTL para OTP y contadores de tasa (timeout 200 ms). |
| Flyway (`V1`…`V11`, subcarpetas por módulo) | `db/migration/` | Próxima migración: `V12`. |
| `AdminUsuariosController`: `banear`, `eliminar`, `promover` | `controller/` | Origen de las cuentas `SUSPENDED`. |
| `EstadoCuenta {ACTIVE, SUSPENDED, DELETED}` | `entity/` | `SUSPENDED` = "baneada" del frontend. |

## 3. Brechas (lo que falta)

| ID | Brecha | Evidencia | Severidad |
|---|---|---|---|
| G-01 | No hay endpoints de recuperación: solicitar código, confirmar código + nueva contraseña, reenviar. | `AuthController` solo expone `/login` y `/register`. | Bloqueante |
| G-02 | No existe generación/almacenamiento de OTP (hash, TTL 10 min, intentos, un solo uso). | Sin entidad, tabla ni uso de Redis para esto. | Bloqueante |
| G-03 | No hay envío de email: sin `spring-boot-starter-mail`, sin `JavaMailSender`, sin configuración SMTP. | `pom.xml`, `application.yml`. | Bloqueante |
| G-04 | No hay límites de tasa; `429` no está mapeado. | Sin interceptor/filtro de rate limit; `GlobalExceptionHandler` no define `TooManyRequests`. | Alta |
| G-05 | Los JWT no se invalidan al cambiar contraseña: el filtro valida solo firma/claims, no consulta BD ni versión. | `JwtAuthenticationFilter`; no hay columna `password_changed_at`/versión en `usuario`. | Alta |
| G-06 | Login con cuenta `SUSPENDED` responde `401` genérico, por lo que el frontend no puede mostrar el aviso ni la apelación. | `CredentialVerificationService`: tras verificar la contraseña lanza `UnauthorizedException` si `estado != ACTIVE`. | Alta |
| G-07 | No existe el concepto de apelación: sin tabla, entidad, endpoints de usuario ni de admin. | Sin coincidencias en el repo. | Bloqueante (HU-06/08) |
| G-08 | No hay acción de admin para reactivar una cuenta: `AdminUsuariosService` solo suspende, elimina y promueve. | `AdminUsuariosService`. | Bloqueante (HU-08) |
| G-09 | La auditoría no cubre los eventos nuevos. | `TipoEventoSeguridad` no incluye reset ni apelación. | Media |
| G-10 | No hay notificación por email del resultado de la apelación. | Depende de G-03. | Media |
| G-11 | Sin configuración CORS en el backend; el frontend usa `VITE_API_BASE_URL=/api` (proxy). | Sin `CorsConfiguration` en el repo. | Baja (solo si se despliega sin proxy) |

## 4. Desalineaciones preexistentes detectadas (informativas, no son parte del 008)

- `authService.ts` llama a `GET /auth/me` y `POST /auth/logout`, que no existen en la API (la API expone `GET /api/usuarios/me` y no tiene logout).
- `authService.ts` espera `CUENTA_BANEADA` / `CUENTA_ELIMINADA` con `403`, pero el backend hoy responde `401` para ambos estados (relacionado con G-06).

## 5. Decisiones

| Decisión | Justificación | Alternativa descartada |
|---|---|---|
| OTP de 6 dígitos por email | Elección del solicitante. | Enlace con token. |
| Confirmación en una sola llamada (`email + code + newPassword`) | Menos endpoints y sin estado intermedio "código verificado" que robar. | Endpoint separado de verificación. |
| Código `CUENTA_BANEADA` con `403` solo tras contraseña correcta | Reutiliza contrato del frontend sin filtrar estado a quien no conoce la contraseña. | Nuevo código `CUENTA_SUSPENDIDA`. |
| Apelación autenticada con email + contraseña | Una cuenta suspendida no puede obtener JWT; evita spam anónimo. | Apelación anónima solo con email. |
| OTP y contadores en Redis (TTL) | Ya hay Redis; expiración nativa. Debe fallar cerrado si Redis cae. | Tabla SQL con limpieza programada. |
| Apelaciones en tabla SQL (`apelacion_cuenta`) | Requieren historial y revisión admin persistentes. | Redis. |
| Alcance de entrega separado | La constitución prohíbe backend en este repo; el backend necesita su propio spec en el repo API. | Implementar backend aquí. |

## 6. Recomendación de trabajo en el backend

Abrir un spec en `2026-MTN-Inspiraciones-Api` (p. ej. `010-recuperacion-cuenta`) cubriendo G-01…G-10 con el contrato de `contracts/openapi.yaml`. Orden sugerido: G-03 (email) → G-02/G-04 (OTP y tasa) → G-01 → G-05 → G-06 → G-07/G-08 → G-09/G-10.

## 7. Frontend: puntos de integración existentes

- `LoginPage.tsx`: enlace `#recuperar` por reemplazar por ruta real; manejo de `CuentaBloqueadaError` ya presente.
- `authService.ts` / `mailPasswordProvider.ts`: patrón de errores a reutilizar.
- `infrastructure/apiEndpoints.ts`, `httpClient.ts`: punto único de rutas y transporte.
- `routes/AppRoutes.tsx`: hoy define `/login`, `/registro`, `/feed`, `/perfil/:id`, `/editar-perfil`; se agregan rutas públicas.
- Stack de pruebas: Vitest + Testing Library.
