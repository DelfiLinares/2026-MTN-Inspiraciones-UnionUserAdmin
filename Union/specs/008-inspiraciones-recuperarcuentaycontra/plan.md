# Plan de implementación — 008 Recuperar cuenta y contraseña (Frontend)

**Rama**: `008-inspiraciones-recuperarcuentaycontra` | **Fecha**: 2026-10-22 | **Spec**: [spec.md](./spec.md)

## 1. Resumen

Agregar al frontend de Union dos flujos públicos (recuperar contraseña con OTP y apelar suspensión), el aviso de cuenta suspendida en login y una vista admin de apelaciones. Sin backend en este repo; el contrato requerido está en `contracts/openapi.yaml` y las brechas en `research.md`.

## 2. Contexto técnico

- **Lenguaje/stack**: TypeScript, React 18, react-router-dom 6, Vite.
- **Pruebas**: Vitest + Testing Library (ya instalados); sin MSW, se simula `HttpClient`.
- **Plataforma**: SPA web (`Union/frontend`), desktop y móvil.
- **Restricciones**: sin backend ni mocks de servidor (III, IV); sin código en fases de especificación (XV).
- **Escala**: formularios livianos; sin impacto de rendimiento.

## 3. Constitution Check

| Principio | Estado | Nota |
|---|---|---|
| I Spec manda | ✅ | Cada tarea trazada a HU/RF. |
| II Dominio OO | ✅ | Value objects con reglas encapsuladas (`data-model.md`). |
| III/IV Sin backend | ✅ | Solo cliente; backend documentado como dependencia. |
| V Capas | ✅ | Dominio / aplicación / infraestructura / presentación. |
| VII Enums/VO | ✅ | `PasoRecuperacion`, `EstadoApelacion`, etc. |
| VIII Tests | ✅ | Reglas de cliente con Vitest. |
| IX Seguridad en backend | ✅ | Cliente solo refleja; admin autorizado por API. |
| XIII Confirmación | ✅ | Aceptar/rechazar apelación confirmados. |
| XV Sin código en spec | ✅ | Solo documentos. |
| Nota | ⚠️ | La constitución de Union está redactada para admin; este módulo es de usuario final (igual que 006). Sin conflicto de fondo. |

## 4. Estructura de documentación

```
Union/specs/008-inspiraciones-recuperarcuentaycontra/
├── spec.md
├── research.md
├── data-model.md
├── plan.md
├── quickstart.md
├── tasks.md
├── analysis.md
├── contracts/openapi.yaml
└── checklists/requirements.md
```

## 5. Estructura de código prevista (`Union/frontend/src`)

```
domain/recuperacion/        value objects, enums, errores de dominio
application/
  ports/                    reutiliza HttpClient
  recoveryService.ts        solicitarCodigo, confirmar, apelar
  appealsAdminService.ts    listar, aceptar, rechazar
infrastructure/apiEndpoints.ts   (agregar rutas del contrato)
pages/recuperar/            RecuperarContrasenaPage + estilos
pages/apelacion/            ApelarSuspensionPage + estilos
presentation/ (admin)/      ApelacionesAdminPage
routes/AppRoutes.tsx        rutas públicas nuevas
pages/login/LoginPage.tsx   enlace real + aviso CUENTA_BANEADA
services/authService.ts     mapear 403 CUENTA_BANEADA (ya existe base)
tests/...                   dominio, servicios, páginas
```

## 6. Fases

| Fase | Contenido | Dependencia |
|---|---|---|
| 0 | Investigación y contrato (hecho: research, openapi). | — |
| 1 | Dominio: value objects, enums, errores, mapeo de códigos. | — |
| 2 | Servicios de aplicación y endpoints. | 1 |
| 3 | Pantalla de recuperación (HU-01…04, 07). | 2 |
| 4 | Aviso en login y apelación de usuario (HU-05, 06). | 2 |
| 5 | Vista admin de apelaciones (HU-08). | 2 |
| 6 | Accesibilidad, responsive y revisión final. | 3–5 |
| Ext. | Integración real cuando el backend publique el contrato (G-01…G-10). | Backend |

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| Backend sin los endpoints (hoy así). | Contrato explícito + spec backend recomendado; pruebas con `HttpClient` simulado. |
| Parámetros OTP/apelación distintos a A-3/A-9. | Centralizar constantes en un único módulo de dominio. |
| `authService` espera `/auth/me` inexistente. | Fuera de alcance; registrado en `research.md` §4. |
| Enumeración de cuentas por mensajes distintos. | Mensaje único (RF-02) con test dedicado. |
