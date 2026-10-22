# Tasks — 008 Recuperar cuenta y contraseña (Frontend)

**Fecha**: 2026-10-22 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Contrato**: [contracts/openapi.yaml](./contracts/openapi.yaml)

Formato: `- [ ] T### [P?] [HU-xx] Descripción — ruta`. **[P]** = paralelizable (archivos distintos, sin dependencia). Sin backend de prueba (constitución III/IV). Los tests de cada tarea se escriben junto a ella.

---

## Fase 1 — Dominio (sin dependencias)

- [x] T001 [P] [HU-02] Constantes de dominio centralizadas (longitud OTP, vigencia mostrada, cooldown 60 s, límites de mensaje) — `src/domain/recuperacion/constantes.ts`
- [x] T002 [P] [HU-01] Value object `EmailRecuperacion` + test — `src/domain/recuperacion/EmailRecuperacion.ts`
- [x] T003 [P] [HU-02] Value object `CodigoOtp` (normaliza espacios/guiones) + test — `src/domain/recuperacion/CodigoOtp.ts`
- [x] T004 [P] [HU-02,03] Value object `NuevaContrasena` con requisitos faltantes + test — `src/domain/recuperacion/NuevaContrasena.ts`
- [x] T005 [P] [HU-06] Value object `MensajeApelacion` (20–1000) + test — `src/domain/recuperacion/MensajeApelacion.ts`
- [x] T006 [P] [HU-01,06,08] Enums `PasoRecuperacion`, `EstadoApelacion`, `CodigoErrorRecuperacion` — `src/domain/recuperacion/enums.ts`
- [x] T007 [HU-03] Mapeo `ErrorApi.code` → `CodigoErrorRecuperacion` + mensajes en español + test — `src/domain/recuperacion/errores.ts` (dep. T006)

## Fase 2 — Aplicación e infraestructura

- [x] T008 [P] Agregar rutas del contrato en `src/infrastructure/apiEndpoints.ts` (request, confirm, appeals, admin/apelaciones)
- [x] T009 [HU-01,07] `recoveryService.solicitarCodigo` (respuesta neutra, manejo de 429/Retry-After y de error de red/5xx, RF-14) + test con `HttpClient` simulado — `src/application/recoveryService.ts` (dep. T002, T007, T008)
- [x] T010 [HU-02,03,04] `recoveryService.confirmar` (mapeo OTP_INVALIDO/EXPIRADO/AGOTADO, limpieza de sesión local en éxito) + test (dep. T003, T004, T009)
- [x] T011 [HU-06] `recoveryService.apelar` (401/403/409/429) + test (dep. T005, T007, T008)
- [x] T012 [HU-08] `appealsAdminService` listar/aceptar/rechazar + test (dep. T006, T008)
- [x] T013 [HU-07] Hook/utilidad de cooldown de reenvío con reloj inyectable + test — `src/application/useCooldown.ts`

## Fase 3 — Recuperar contraseña (HU-01…04, 07) — MVP

- [x] T014 [HU-01] Página `RecuperarContrasenaPage` paso 1 (email) — `src/pages/recuperar/RecuperarContrasenaPage.tsx` (dep. T009)
- [x] T015 [HU-02,03] Paso 2 (código + nueva contraseña + confirmación + mostrar/ocultar) (dep. T010, T014)
- [x] T016 [HU-07] Reenvío con cuenta regresiva y manejo de 429 (dep. T013, T015)
- [x] T017 [P] [RNF-03] Estilos reutilizando `login.css` — `src/pages/recuperar/recuperar.css`
- [x] T018 [HU-01] Ruta pública `/recuperar-contrasena` y reemplazo del enlace `#recuperar` en `LoginPage.tsx` — `src/routes/AppRoutes.tsx`, `src/pages/login/LoginPage.tsx`
- [x] T019 [HU-04] Redirección a `/login` con mensaje de éxito (`location.state.mensaje`) (dep. T015, T018)
- [x] T020 [HU-01…04] Tests de página: flujo feliz, mensaje neutro, errores de OTP, contraseña inválida, doble envío bloqueado (dep. T014–T019)

## Fase 4 — Cuenta suspendida y apelación (HU-05, 06)

- [x] T021 [HU-05] Mapear `403 CUENTA_BANEADA` a `CuentaBloqueadaError` con enlace de apelación en `LoginPage` + test — `src/services/authService.ts`, `src/pages/login/LoginPage.tsx`
- [x] T022 [HU-06] Página `ApelarSuspensionPage` (email, contraseña, mensaje con contador) — `src/pages/apelacion/ApelarSuspensionPage.tsx` (dep. T011)
- [x] T023 [P] [RNF-03] Estilos de apelación — `src/pages/apelacion/apelacion.css`
- [x] T024 [HU-06] Ruta pública `/apelar-suspension` (dep. T022)
- [x] T025 [HU-06] Tests de página: éxito, 409, 429, 401, validación de mensaje (dep. T022–T024)

## Fase 5 — Administración de apelaciones (HU-08, P2)

- [x] T026 [HU-08] Vista `ApelacionesAdminPage` con filtro por estado y paginación — `src/presentation/` (dep. T012)
- [x] T027 [HU-08] Diálogos de confirmación aceptar/rechazar (motivo obligatorio al rechazar) (dep. T026)
- [x] T028 [HU-08] Registrar la ruta en la consola admin y proteger con el guard de rol existente (dep. T026)
- [x] T029 [HU-08] Tests: lista, aceptar, rechazar sin motivo bloqueado, 403 (dep. T026–T028)

## Fase 6 — Calidad y cierre

- [x] T030 [P] [HU-09] Auditoría de accesibilidad: foco, `role="alert"`, etiquetas, `autocomplete` correcto (RNF-01/02)
- [x] T031 [P] [HU-09] Revisión responsive (móvil/escritorio) de las tres pantallas
- [x] T032 [P] [RNF-01] Verificar que no se loguea ni persiste código/contraseña (búsqueda de `console.*` y storage)
- [x] T033 Ejecutar `npm run test` y `npm run build`; corregir fallos — `tsc --noEmit` y `vite build` OK; los 78 tests nuevos pasan. Quedan 12 fallos **preexistentes** (`document is not defined` en tests de hooks sin entorno jsdom, y `AuthAdminService`), no relacionados con el 008.
- [ ] T034 Validar los escenarios de `quickstart.md` contra un backend real — **pendiente**: los endpoints B-01…B-08 aún no existen; el flujo está cubierto con tests de página y servicios (78 tests en `tests/recuperacion/`).

---

## Dependencias externas (repo `2026-MTN-Inspiraciones-Api`) — NO se implementan aquí

| ID | Entrega backend | Brecha | Bloquea |
|---|---|---|---|
| B-01 | Envío de email (starter mail + SMTP/MailHog) | G-03 | T009, T010 |
| B-02 | OTP en Redis (hash, TTL, intentos, un solo uso) + límites de tasa y `429`/`Retry-After` | G-02, G-04 | T009, T010 |
| B-03 | `POST /api/auth/password-reset/request` y `/confirm` | G-01 | Fase 3 en integración real |
| B-04 | `usuario.password_changed_at` + rechazo de JWT anteriores | G-05 | Escenario 6 |
| B-05 | Login: `403 CUENTA_BANEADA` para `SUSPENDED` con contraseña correcta | G-06 | T021 |
| B-06 | Tabla `apelacion_cuenta`, `POST /api/auth/appeals` | G-07 | Fase 4 en integración real |
| B-07 | Admin: listar/aceptar (reactiva a `ACTIVE`)/rechazar apelaciones | G-07, G-08 | Fase 5 en integración real |
| B-08 | Eventos de auditoría nuevos y email de resultado | G-09, G-10 | — |

## Orden y paralelismo

- MVP: Fases 1 → 2 → 3 (T001–T020).
- Tras la Fase 2, las Fases 3, 4 y 5 pueden avanzar en paralelo.
- Dentro de la Fase 1, T001–T006 son totalmente paralelas.
