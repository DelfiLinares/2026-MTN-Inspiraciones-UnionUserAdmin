# Quickstart — 003 Desafíos (Frontend)

**Spec**: `spec.md` | **Plan**: `plan.md` | **Contrato**: `contracts/openapi.yaml`

Guía para levantar y validar el módulo de Desafíos en las dos aplicaciones, usando el adaptador en memoria. No hay backend en esta guía (constitution 003, principio 4).

---

## 1. Requisitos

- Node.js y npm compatibles con el monorepo de 002 (`Union/specs/002-inspiraciones-publicaciones/frontend/`).
- Dependencias instaladas en la raíz del monorepo.
- Ningún servidor de la API Java en ejecución. El frontend no lo necesita.

```powershell
cd Union\specs\002-inspiraciones-publicaciones\frontend
npm install
```

---

## 2. Configuración

Variable de entorno en cada app (archivo `.env.local`, no versionado):

```dotenv
VITE_DESAFIOS_ADAPTER=memoria
```

| Valor | Efecto |
|---|---|
| `memoria` (por defecto) | Usa `InMemoryDesafiosAdapter`. Datos de ejemplo en memoria; se pierden al recargar. |
| `http` | Usa `HttpDesafiosAdapter`. Solo cuando exista una API Java integrada (fuera de este plan). |

Persona de prueba: el adaptador en memoria acepta una sesión simulada de `USER` o `ADMIN` seleccionable en la pantalla de acceso de cada app. Ninguna credencial real se incluye en el repositorio.

---

## 3. Ejecutar las aplicaciones

Desde la raíz del monorepo (`Union/specs/002-inspiraciones-publicaciones/frontend/`):

```powershell
npm run dev:usuario
```

Abre la app de usuario (por defecto en el puerto de Vite de `apps/usuario`).

```powershell
npm run dev:admin
```

Abre la app de administración (por defecto en el puerto de Vite de `apps/admin`).

Ambas pueden ejecutarse a la vez en terminales separadas.

---

## 4. Ejecutar las pruebas

```powershell
npm test
```

Para ejecutar solo una parte, usar la configuración de Vitest del monorepo (proyectos `shared`, `usuario` y `admin`), por ejemplo:

```powershell
npx vitest run --project shared
npx vitest run --project usuario
npx vitest run --project admin
```

Lo que cubre cada proyecto está descrito en `research.md`, sección 10:
- `shared`: dominio (`RangoFechas`, estado derivado, permisos, validación) y casos de uso contra el adaptador en memoria.
- `usuario` y `admin`: componentes (acciones visibles por rol, validación de formularios, confirmación antes de eliminar o editar desafíos activos o con respuestas).

Las pruebas de contrato contra `openapi.yaml` son opcionales y requieren aprobar un validador (research.md, sección 10).

No hay pruebas de integración con repositorio ni con backend.

---

## 5. Validación manual

Comprobar en el adaptador en memoria, con las dos personas (USER y ADMIN). Cada paso indica la historia o el caso límite que verifica.

### 5.1 Como ADMIN (app `admin`)

| Paso | Resultado esperado | Ref. |
|---|---|---|
| Publicar un desafío con 0 fotos | Error por campo; no se publica | HU-01, RF-02 |
| Publicar con fecha de fin no posterior a la de inicio | Error en el campo de fin | HU-01, RF-03 |
| Publicar con foto en formato distinto de JPEG o PNG | Error en la foto; no se publica | CB-11 |
| Publicar sin ámbito | Error en ámbitos | CB-12 |
| Editar un desafío `ACTIVO` | Aparece confirmación antes de guardar | HU-02, RF-22 |
| Editar un desafío `PROGRAMADO` sin respuestas | Sin confirmación previa | RF-22 |
| Eliminar un desafío con respuestas | Confirmación; tras eliminar, deja de aparecer en el listado | HU-03, CB-13 |
| Abrir un desafío eliminado desde su enlace | "Desafío no disponible" | HU-11, CB-01 |
| Ver solicitudes pendientes | Lista de solicitudes con estado `PENDIENTE` | HU-06 |
| Aprobar una solicitud que otro usuario acaba de eliminar | Mensaje de solicitud no disponible | CB-03 |
| Aprobar o rechazar una solicitud ya resuelta | Mensaje de transición no permitida | HU-06, CB-06 |
| Eliminar una respuesta de cualquier usuario | Confirmación; respuesta eliminada | HU-16, RF-14 |
| Intentar editar una respuesta ajena | Acción no disponible | HU-15, CB-07 |

### 5.2 Como USER (app `usuario`)

| Paso | Resultado esperado | Ref. |
|---|---|---|
| Ver el listado sin sesión | Pide iniciar sesión | RF-24, A-18 |
| Ver listado con filtro por ámbito y por estado | Solo aparecen los que coinciden; la URL refleja el filtro | HU-10, RF-17 |
| Cargar más resultados | Se cargan más elementos; no se repiten al cambiar de página | RF-16, HU-09 |
| Proponer un desafío | Solicitud creada en `PENDIENTE` y visible en "mis solicitudes" | HU-04, RF-07, RF-08 |
| Doble clic en "enviar" | Una sola solicitud | CB-04 |
| Ver solicitudes de otro usuario | No aparecen en el listado | RF-10, RF-21 |
| Editar o eliminar una solicitud propia en `PENDIENTE` | Permitido con confirmación en eliminar | HU-05, HU-07 |
| Responder a un desafío `ACTIVO` | Respuesta creada; el formulario se oculta para una segunda respuesta | HU-14, A-10 |
| Responder a un desafío `PROGRAMADO` o `FINALIZADO` | Acción no disponible | RF-12, A-05 |
| Editar la propia respuesta | Permitido | HU-15, RF-13 |
| Ver desafío sin respuestas | Estado vacío claro | CB-09 |
| Sesión caducada al enviar un formulario | Vuelve al acceso; el borrador se conserva al reautenticarse | CB-08 |
| Acción sin permiso (ruta de otro usuario) | Mensaje de permiso denegado | CB-07, RF-21 |

### 5.3 Fechas

| Paso | Resultado esperado | Ref. |
|---|---|---|
| Cambiar la fecha del sistema a la frontera de inicio o fin | El estado se actualiza al recargar | CB-05, RF-06 |
| Frontera exacta del día de fin | Pendiente de A-16. No validar hasta resolverlo. | A-16 |

---

## 6. Criterios de salida

- `npm test` pasa en los tres proyectos.
- Todos los pasos de la sección 5 tienen resultado esperado observado en las dos apps.
- Ninguna petición sale del navegador hacia un backend.
- Los puntos pendientes (`plan.md`, sección 6, y `spec.md`, sección 9) siguen marcados como pendientes, no implementados.
