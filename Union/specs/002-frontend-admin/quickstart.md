# Quickstart: Validación Manual del Frontend Administrativo

**Feature**: 002-frontend-admin | **Date**: 2026-10-01

Este documento describe el flujo de validación manual de extremo a extremo para verificar, una vez
implementado, que las historias de usuario HU-01 a HU-10 de `spec.md` funcionan correctamente. Se
ejecuta contra la capa de `application/services` con el cliente HTTP apuntando a fixtures/mocks
locales (no existe backend real en este speckit, ver `research.md` §2 y §9) o, en la iteración de
integración futura, contra la API Java real descrita en `contracts/openapi.yaml`.

**No se implementa código como parte de este documento.**

## Prerrequisitos

1. `frontend-admin/` instalado (`npm install`) y corriendo en modo desarrollo.
2. Sesión simulada/real de un usuario con rol `ADMIN` ya autenticado (el flujo de login en sí mismo
   no forma parte del alcance de `spec.md`; se asume una sesión ADMIN válida ya establecida).
3. Datos de ejemplo (fixtures) cargados para usuarios, publicaciones y reportes, cubriendo al menos:
   - Un usuario con rol `USER` y estado `ACTIVO`.
   - Un usuario con rol `ADMIN` (distinto del actor autenticado).
   - Una publicación en estado `ACTIVA` y otra en estado `REPORTADA`.
   - Un reporte en estado `PENDIENTE`, uno en `EN_REVISION` y uno en estado final (`RESUELTO` o
     `DESESTIMADO`).

## Escenario 1 — Banear a un usuario (HU-01)

1. Ir a la pantalla de **Gestión de Usuarios**.
2. Buscar al usuario con rol `USER` y estado `ACTIVO`.
3. Verificar que la acción "Banear" está visualmente diferenciada como sensible (RF-22).
4. Iniciar la acción "Banear", elegir baneo **temporal** con una fecha de fin futura.
5. Confirmar explícitamente la acción (RF-23).
6. **Resultado esperado**: el estado de cuenta del usuario pasa a `BANEADO` en la interfaz (AC-01.4).
7. Repetir sobre un usuario con rol `ADMIN`.
8. **Resultado esperado**: la acción "Banear" aparece deshabilitada (AC-01.5, CB-01).

## Escenario 2 — Eliminar la cuenta de un usuario (HU-02)

1. En **Gestión de Usuarios**, buscar un usuario con rol `USER`.
2. Iniciar la acción "Eliminar" y confirmar explícitamente (RF-23).
3. **Resultado esperado**: el estado de cuenta pasa a `ELIMINADO` (AC-02.3).
4. Repetir sobre un usuario con rol `ADMIN` o sobre el propio administrador autenticado.
5. **Resultado esperado**: la acción "Eliminar" aparece deshabilitada (AC-02.4, CB-01).

## Escenario 3 — Promover un usuario a administrador (HU-03)

1. Ir a la pantalla de **Promoción de Usuarios**.
2. Seleccionar un usuario con rol `USER` e iniciar "Promover a administrador".
3. Confirmar explícitamente (RF-23).
4. **Resultado esperado**: el rol del usuario pasa a `ADMIN` (AC-03.3).
5. Intentar promover a un usuario que ya tiene rol `ADMIN`.
6. **Resultado esperado**: la operación se rechaza como no-op sin llamar a la API (AC-03.4, CB-02).

## Escenario 4 — Editar una publicación de cualquier usuario (HU-04)

1. Ir a la pantalla de **Gestión de Publicaciones**.
2. Abrir una publicación en estado `ACTIVA` cuyo autor no sea el administrador autenticado.
3. Editar el título/descripción y confirmar explícitamente el guardado (AC-04.2).
4. **Resultado esperado**: los cambios se reflejan sin recargar la página (AC-04.3).
5. Simular un fallo de guardado (por ejemplo, desconectando el mock).
6. **Resultado esperado**: se muestra un mensaje de error y el formulario conserva los datos
   editados (AC-04.4).

## Escenario 5 — Eliminar una publicación (HU-05)

1. En **Gestión de Publicaciones**, seleccionar una publicación en estado `REPORTADA`.
2. Verificar que la acción "Eliminar" está visualmente diferenciada como sensible (RF-22).
3. Iniciar "Eliminar" y confirmar explícitamente (RF-23).
4. **Resultado esperado**: el estado de la publicación pasa a `ELIMINADA` (AC-05.3).

## Escenario 6 — Ver reportes pendientes de revisión (HU-06)

1. Ir a la pantalla de **Revisión de Reportes**.
2. Verificar que el listado muestra estado de moderación, motivo y prioridad de cada reporte
   (AC-06.1).
3. Aplicar un filtro por estado `PENDIENTE` y, por separado, por prioridad `ALTA` (AC-06.2).
4. **Resultado esperado**: los reportes `PENDIENTE` se destacan visualmente frente a otros estados
   (AC-06.3).
5. Abrir el detalle de un reporte.
6. **Resultado esperado**: se muestra motivo, prioridad, estado y la publicación/usuario asociado
   (AC-06.4).

## Escenario 7 — Aceptar un reporte (HU-07)

1. Desde el listado de reportes, seleccionar uno en estado `PENDIENTE` o `EN_REVISION`.
2. Iniciar la acción "Aceptar". **Resultado esperado**: se ejecuta directamente, sin diálogo de
   confirmación (resuelto, Clarifications Session 2026-10-05, AC-07.3).
3. **Resultado esperado**: el estado de moderación pasa a `RESUELTO` (AC-07.2) y el
   `EstadoPublicacion` de la publicación asociada **no cambia**.
4. Verificar que, sobre este mismo reporte, las acciones "Aceptar"/"Rechazar" quedan ahora
   deshabilitadas de forma permanente (AC-07.4, CB-03).
5. Repetir sobre otro reporte, pero esta vez eligiendo además eliminar la publicación asociada
   (acción independiente de HU-05) en el mismo flujo. **Resultado esperado**: la eliminación de la
   publicación sí exige confirmación explícita por separado (AC-05.2).

## Escenario 8 — Rechazar un reporte (HU-08)

1. Seleccionar un reporte distinto en estado `PENDIENTE` o `EN_REVISION`, asociado a una
   publicación en estado `REPORTADA` sin otros reportes pendientes.
2. Iniciar la acción "Rechazar" y confirmar explícitamente (AC-08.3).
3. **Resultado esperado**: el estado de moderación pasa a `DESESTIMADO` (AC-08.2).
4. **Resultado esperado**: dado que la publicación no tenía otros reportes `PENDIENTE`/
   `EN_REVISION`, su `EstadoPublicacion` vuelve automáticamente a `ACTIVA` (AC-08.6, resuelto
   Clarifications Session 2026-10-01). Verificar este cambio en la pantalla de Gestión de
   Publicaciones.
5. Verificar que las acciones "Aceptar"/"Rechazar" quedan deshabilitadas para este reporte
   (AC-08.4).

## Escenario 9 — Exportar reportes (HU-09)

1. En la pantalla de **Revisión de Reportes** (`/reportes`), aplicar un filtro (por ejemplo,
   prioridad `ALTA`).
2. Hacer clic en el botón "Exportar" **dentro de la misma pantalla** (no existe una pantalla
   separada de exportación, resuelto Clarifications Session 2026-10-01), respetando el filtro
   activo (AC-09.1).
3. **Resultado esperado**: se muestra un estado de carga sin bloquear el resto de la interfaz
   (AC-09.2); al finalizar, se ofrece una acción de descarga (AC-09.3).
4. Simular un fallo en la generación del archivo.
5. **Resultado esperado**: se muestra un mensaje de error claro (AC-09.4, CB-05).

## Escenario 10 — Acceso restringido al frontend administrativo (HU-10)

1. Intentar acceder a cualquier pantalla administrativa con una sesión simulada de rol `USER` (no
   `ADMIN`).
2. **Resultado esperado**: el acceso se rechaza o redirige, conforme a AC-10.1.
3. Documentar explícitamente (en el reporte de validación) que esta restricción es solo una
   verificación de interfaz: la autorización definitiva depende del backend que se integrará en una
   iteración futura (AC-10.3, RNF-05).

## Checklist final de reglas de negocio críticas (sección 6 de `spec.md`)

- [ ] Solo el administrador edita/elimina publicaciones de cualquier usuario (Escenarios 4 y 5).
- [ ] Solo el administrador banea/elimina/promueve usuarios (Escenarios 1, 2 y 3).
- [ ] Solo el administrador lee/exporta/acepta/rechaza reportes (Escenarios 6 a 9).
- [ ] Solo un administrador puede promover a otro usuario a administrador (Escenario 3).
- [ ] Solo rol `ADMIN` accede al frontend administrativo (Escenario 10).
- [ ] Toda acción destructiva requiere confirmación explícita, salvo "aceptar reporte" simple sin
  acción adicional (Escenarios 1, 2, 3, 4, 5, 8; excepción documentada en Escenario 7).
- [ ] No se puede banear/eliminar a un `ADMIN` (Escenarios 1 y 2, paso final).
- [ ] No se puede promover a quien ya es `ADMIN` (Escenario 3, paso final).
- [ ] No se puede aceptar/rechazar un reporte ya en estado final (Escenarios 7 y 8, paso final).
- [ ] Rechazar un reporte reactiva automáticamente la publicación asociada si no quedan otros
  reportes pendientes (Escenario 8, paso 4).

**No se implementó código como parte de este documento de validación.**
