# Validación Manual del Frontend Administrativo (`002-frontend-admin`)

**Feature**: 002-frontend-admin | Documento de registro de resultados de `quickstart.md`.

Este documento registra el resultado de la ejecución de cada escenario descripto en
`Union/specs/002-frontend-admin/quickstart.md`. Conforme a ese documento, no existe backend real en
este speckit (`research.md` §2): cada escenario se ejecuta contra la capa de presentación construida
(`UsuariosPage`, `PublicacionesPage`, `ReportesPage`, `PromocionPage`) usando los fixtures de T073
(`tests/fixtures/*.fixtures.ts`) y un `HttpClient` simulado, en lugar de clics manuales reales sobre
un navegador. La ejecución mecánica de cada escenario queda registrada como un test repetible en
`tests/integration/`, referenciado desde la fila correspondiente de este documento, para que el
resultado sea verificable y no dependa de un registro subjetivo del ejecutor.

**No se implementó código como parte de este documento** (el documento en sí mismo no contiene
código; únicamente referencia los tests de `tests/integration/` que ejecutan cada escenario).

## Escenario 1 — Banear a un usuario (HU-01)

- **Test de ejecución**: `tests/integration/Escenario1BanearUsuario.test.tsx` (T074)
- **Resultado**: ✅ **Verificado**

| Paso | Descripción | Resultado |
| --- | --- | --- |
| 1-2 | Ir a Gestión de Usuarios; buscar usuario `USER`/`ACTIVO` | ✅ El usuario fixture `USUARIO_USER_ACTIVO_FIXTURE` aparece en el listado de `UsuariosPage`. |
| 3 | La acción "Banear" está visualmente diferenciada como sensible (RF-22) | ✅ El botón aplica la clase `accion-sensible-boton--sensible`. |
| 4 | Iniciar "Banear", elegir baneo **temporal** con fecha de fin futura | ✅ Se selecciona la opción "Temporal" y se ingresa `2099-12-31`. |
| 5 | Confirmar explícitamente la acción (RF-23) | ✅ Se hace clic en "Confirmar" del `ConfirmDialog`. |
| 6 | **Resultado esperado**: el estado de cuenta pasa a `BANEADO` en la interfaz (AC-01.4) | ✅ Se invoca `UsuariosServiceAdmin.banear()` con `{ fechaFin: "2099-12-31..." }`; el diálogo se cierra y el listado se recarga, reflejando el cambio sin bloquear la interfaz. |
| 7 | Repetir sobre un usuario con rol `ADMIN` | ✅ Se usa el fixture `USUARIO_ADMIN_EXISTENTE_FIXTURE`. |
| 8 | **Resultado esperado**: la acción "Banear" aparece deshabilitada (AC-01.5, CB-01) | ✅ El botón está deshabilitado (`disabled`) y un clic sobre él no invoca `httpClient.post`. |

**Conclusión del Escenario 1**: todos los pasos y resultados esperados se verifican correctamente
contra la implementación actual de `UsuariosPage`/`BanearUsuarioAction`. Sin observaciones ni
desviaciones respecto de lo descripto en `quickstart.md`.

## Escenario 2 — Eliminar la cuenta de un usuario (HU-02)

- **Test de ejecución**: `tests/integration/Escenario2EliminarUsuario.test.tsx` (T075)
- **Resultado**: ✅ **Verificado**

| Paso | Descripción | Resultado |
| --- | --- | --- |
| 1 | En Gestión de Usuarios, buscar un usuario con rol `USER` | ✅ El usuario fixture `USUARIO_USER_ACTIVO_FIXTURE` aparece en el listado de `UsuariosPage`. |
| 2 | Iniciar la acción "Eliminar" y confirmar explícitamente (RF-23) | ✅ Se hace clic en "Eliminar" y luego en "Confirmar" del `ConfirmDialog`. |
| 3 | **Resultado esperado**: el estado de cuenta pasa a `ELIMINADO` (AC-02.3) | ✅ Se invoca `UsuariosServiceAdmin.eliminar()`; el diálogo se cierra y el listado se recarga, reflejando el cambio sin bloquear la interfaz. |
| 4 | Repetir sobre un usuario con rol `ADMIN` o sobre el propio administrador autenticado | ✅ Se usa el fixture `USUARIO_ADMIN_EXISTENTE_FIXTURE`. |
| 5 | **Resultado esperado**: la acción "Eliminar" aparece deshabilitada (AC-02.4, CB-01) | ✅ El botón está deshabilitado (`disabled`) y un clic sobre él no invoca `httpClient.delete`. |

**Conclusión del Escenario 2**: todos los pasos y resultados esperados se verifican correctamente
contra la implementación actual de `UsuariosPage`/`EliminarUsuarioAction`. Sin observaciones ni
desviaciones respecto de lo descripto en `quickstart.md`.
