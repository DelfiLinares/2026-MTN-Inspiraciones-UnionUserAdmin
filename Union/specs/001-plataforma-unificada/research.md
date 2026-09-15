# Phase 0 Research: Plataforma Unificada — Frontend Usuario + Frontend Admin

**Input**: `plan.md`, `spec.md` (Union/specs/001-plataforma-unificada)

Este documento evalúa alternativas tecnológicas para las decisiones técnicas transversales a ambos
frontends (`frontend/` y `frontend-admin/`) y documenta la decisión tomada con su justificación,
siempre respetando el stack ya fijado (React + Vite + TypeScript + CSS simple) y sin introducir
tecnologías no mencionadas en los documentos de origen.

---

## 1. Manejo de estado (global vs. local)

**Alternativas evaluadas**:
1. Librería de estado global (Redux Toolkit, Zustand, Jotai).
2. React Context API + hooks propios por dominio funcional (sin librería externa).
3. Solo `useState`/`props drilling` sin ningún contexto.

**Decisión**: **Opción 2 — Context API + hooks propios**, con un contexto de sesión por aplicación
(`AuthContext` en `frontend/`, `AuthAdminService`/contexto equivalente en `frontend-admin/`) y hooks
de aplicación dedicados por caso de uso (`useInfiniteList`, `useDescubrirFiltros`,
`usePublicacionForm`, `useUsuariosAdmin`, etc.).

**Justificación**:
- Ninguno de los specify originales ni el contexto técnico mencionan una librería de estado global;
  agregar una violaría la regla de "no agregar frameworks/librerías no mencionadas" (sección 11 de
  `spec.md`).
- El alcance funcional (sesión + listados paginados + formularios + estado optimista puntual) no
  presenta la complejidad de sincronización cruzada entre pantallas que justificaría una librería de
  estado global dedicada.
- Mantiene la separación de capas: el contexto de sesión vive en la frontera entre
  `infrastructure` (origen del token) y `services`/`application` (exposición del usuario actual a la
  presentación), sin acoplar lógica de negocio a un store global.
- Rechazo de la Opción 1: complejidad y curva de aprendizaje innecesarias para el alcance actual;
  no está mencionada en ningún documento de origen. Rechazo de la Opción 3: generaría duplicación de
  lógica de sesión y de estado de listados en múltiples componentes, violando el Principio IV
  (constitución) de evitar duplicación.

---

## 2. Cliente HTTP

**Alternativas evaluadas**:
1. `axios` como dependencia externa.
2. `fetch` nativo del navegador, envuelto en un módulo propio de infraestructura
   (`infrastructure/httpClient.ts`).
3. Librería de data-fetching con cache integrado (React Query / SWR).

**Decisión**: **Opción 2 — `fetch` nativo envuelto en un cliente HTTP propio**, ubicado en
`infrastructure/httpClient.ts` en ambos frontends, responsable de:
- Adjuntar automáticamente el token de sesión en cada request (RF-06).
- Normalizar el manejo de errores HTTP (4xx/5xx) hacia un formato consistente para `services/`.
- Centralizar la detección de sesión expirada (401) para disparar la redirección a login (RF-13,
  CB-06, RF-75, CB-13).

**Justificación**:
- El contexto técnico especifica "Cliente HTTP (fetch o axios)"; se elige `fetch` nativo para no
  sumar una dependencia externa cuando el navegador ya la provee de forma nativa y suficiente para
  el alcance (sin necesidad de interceptores complejos de axios).
- Se descarta la Opción 3 (React Query/SWR) por no estar mencionada en ningún documento de origen y
  por introducir un modelo de cache automático que podría entrar en conflicto con el requisito
  explícito de resolver búsquedas/filtros/paginación siempre contra la API sin cachear
  agresivamente en cliente (RNF-05, RF-40).
- El wrapper propio permite encapsular la regla "las llamadas a la API deben pasar por la capa de
  servicios" (Principio VI de constitución) de forma explícita y auditable.

---

## 3. Autenticación de terceros (Google, GitHub)

**Alternativas evaluadas**:
1. SDKs oficiales de cada proveedor integrados directamente en componentes de presentación.
2. Redirección a un endpoint de autenticación del backend (`/auth/google`, `/auth/github`) que
   maneja el flujo OAuth completo, con el frontend solo iniciando la redirección y procesando el
   callback de retorno.
3. Librería de terceros genérica de autenticación social del lado del cliente (ej. Firebase Auth
   client SDK) que gestiona tokens de proveedor directamente en el navegador.

**Decisión**: **Opción 2 — Redirección al backend + manejo de callback en `infrastructure/`**,
mediante un módulo de estrategias (`authProviders/googleProvider.ts`,
`authProviders/githubProvider.ts`) que:
- Inicia la redirección hacia el endpoint correspondiente del backend.
- Procesa el callback de retorno (parámetros de la URL) y delega a `authService`/`AuthAdminService`
  el establecimiento de la sesión con el token recibido.

**Justificación**:
- Los specify originales indican que el frontend "maneja el callback de retorno" (AC-04.4 de
  `spec.md`), lo cual es coherente con un flujo donde el backend orquesta el intercambio OAuth real
  (client secret, validación de firma) y el frontend solo participa del redireccionamiento y la
  recepción del resultado.
- Evita exponer client secrets o lógica sensible de OAuth en el cliente, alineado con RNF-06
  (la autorización crítica se valida en backend).
- Se aplica el patrón **Estrategia** (uno por proveedor: mail/contraseña, Google, GitHub) dado que
  simplifica genuinamente el manejo de múltiples mecanismos de login con una interfaz común,
  conforme al principio de "patrones de diseño con propósito" (no forzados) de la constitución.
- Se descarta la Opción 1 por acoplar lógica de infraestructura a componentes de presentación
  (violaría Principio VI). Se descarta la Opción 3 por introducir una dependencia/tecnología
  (Firebase Auth u otro SDK social) no mencionada en los documentos de origen.

---

## 4. Scroll infinito

**Alternativas evaluadas**:
1. Paginación clásica con botones "Anterior/Siguiente".
2. Scroll infinito implementado con `IntersectionObserver` nativo del navegador, encapsulado en un
   hook propio (`useInfiniteList`).
3. Librería externa de virtualización/scroll infinito (`react-window`, `react-infinite-scroll-component`).

**Decisión**: **Opción 2 — Hook propio `useInfiniteList` basado en `IntersectionObserver`**,
reutilizado por el feed de home, la pantalla Descubrir (`frontend/`), y los listados
paginados/con scroll de `frontend-admin/` donde el spec lo permita (los listados administrativos
usan primariamente paginación server-side explícita, ver punto siguiente).

**Justificación**:
- `spec.md` exige explícitamente "paginación o scroll infinito" (RF-43) sin mandar una librería
  específica; `IntersectionObserver` es una API nativa del navegador, no una dependencia externa.
- Evita sumar una librería no mencionada en el contexto técnico compartido, que solo lista React +
  Vite + TypeScript + CSS simple + cliente HTTP.
- El hook se ubica en la capa de servicios/aplicación (`services/useInfiniteList.ts`), consumido por
  componentes de presentación de forma declarativa, respetando la separación de capas.
- **Nota de diseño (frontend-admin)**: los listados administrativos (usuarios, publicaciones
  reportadas, reportes, desafíos) se diseñan con **paginación explícita** (números de página o
  "cargar más" con confirmación de posición), priorizando que el administrador pueda ubicar
  rápidamente un registro específico (RNF-13); el scroll infinito puro se reserva para el consumo
  editorial del frontend de usuario (feed, descubrir), donde la exploración continua es el patrón de
  uso esperado.

---

## 5. Lazy loading de imágenes/audio/video

**Alternativas evaluadas**:
1. Atributo nativo `loading="lazy"` de HTML para `<img>` (y equivalentes manuales para
   video/audio mediante `IntersectionObserver`).
2. Librería externa de lazy loading (`react-lazyload`, `react-lazy-load-image-component`).
3. Carga completa de todos los medios sin diferimiento.

**Decisión**: **Opción 1 — `loading="lazy"` nativo para imágenes**, complementado con un
componente propio `LazyMedia` (en `components/comunes/`) que usa `IntersectionObserver` para
diferir la carga de `<video>`/`<audio>` (elementos sin soporte nativo de `loading="lazy"`).

**Justificación**:
- Cumple RF-47 (lazy loading obligatorio de imágenes y medios) sin agregar dependencias externas no
  mencionadas en el contexto técnico.
- El atributo nativo cubre el caso mayoritario (imágenes); el componente propio con
  `IntersectionObserver` extiende el mismo criterio a video/audio de forma consistente,
  reutilizando la misma primitiva ya elegida para scroll infinito (punto 4), reduciendo superficie
  técnica nueva.
- Se descarta la Opción 3 por violar directamente RF-47 y RNF-10 (no bloquear la interfaz esperando
  medios). Se descarta la Opción 2 por no estar mencionada en los documentos de origen y ser
  redundante frente a la solución nativa/propia ya suficiente para el alcance.

---

## 6. Resumen de decisiones

| Decisión técnica | Elegido | Motivo principal |
|---|---|---|
| Estado global/local | Context API + hooks propios | Alcance no justifica librería externa; evita violar principio de no agregar tecnología no especificada |
| Cliente HTTP | `fetch` nativo envuelto en módulo propio | Suficiente para el alcance; centraliza token y errores sin dependencia externa |
| Auth Google/GitHub | Redirección a backend + manejo de callback en infraestructura | Evita lógica OAuth sensible en cliente; backend valida y emite el token |
| Scroll infinito | Hook propio con `IntersectionObserver` | API nativa; listados admin usan paginación explícita por eficiencia operativa (RNF-13) |
| Lazy loading de medios | `loading="lazy"` + componente propio para audio/video | Cumple RF-47 sin dependencias externas no mencionadas |

Todas las decisiones fueron validadas contra el Constitution Check de `plan.md`: ninguna introduce
una tecnología, framework o patrón no mencionado en los specify originales (Principio de sección 11
de `spec.md`), y todas mantienen la separación de capas exigida (Principio III de la constitución).
