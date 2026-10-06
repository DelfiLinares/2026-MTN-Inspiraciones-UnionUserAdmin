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

## Escenario 3 — Promover un usuario a administrador (HU-03)

- **Test de ejecución**: `tests/integration/Escenario3PromoverUsuario.test.tsx` (T076)
- **Resultado**: ✅ **Verificado**

| Paso | Descripción | Resultado |
| --- | --- | --- |
| 1 | Ir a la pantalla de Promoción de Usuarios | ✅ `PromocionPage` renderiza el listado de candidatos vía `UsuariosTable`. |
| 2 | Seleccionar un usuario con rol `USER` e iniciar "Promover a administrador" | ✅ Se usa el fixture `USUARIO_USER_ACTIVO_FIXTURE`; el botón está habilitado. |
| 3 | Confirmar explícitamente (RF-23) | ✅ Se hace clic en "Confirmar" del `ConfirmDialog`. |
| 4 | **Resultado esperado**: el rol del usuario pasa a `ADMIN` (AC-03.3) | ✅ Se invoca `UsuariosServiceAdmin.promover()`; el diálogo se cierra y el listado se recarga, reflejando el cambio sin bloquear la interfaz. |
| 5 | Intentar promover a un usuario que ya tiene rol `ADMIN` | ✅ Se usa el fixture `USUARIO_ADMIN_EXISTENTE_FIXTURE`. |
| 6 | **Resultado esperado**: la operación se rechaza como no-op sin llamar a la API (AC-03.4, CB-02) | ✅ El botón está deshabilitado (`disabled`) y un clic sobre él no invoca `httpClient.post`. |

**Conclusión del Escenario 3**: todos los pasos y resultados esperados se verifican correctamente
contra la implementación actual de `PromocionPage`/`PromoverUsuarioAction`. Sin observaciones ni
desviaciones respecto de lo descripto en `quickstart.md`.

## Escenario 4 — Editar una publicación de cualquier usuario (HU-04)

- **Test de ejecución**: `tests/integration/Escenario4EditarPublicacion.test.tsx` (T077)
- **Resultado**: ✅ **Verificado**

| Paso | Descripción | Resultado |
| --- | --- | --- |
| 1 | Ir a la pantalla de Gestión de Publicaciones | ✅ `PublicacionesPage` renderiza el listado vía `PublicacionesTable`. |
| 2 | Abrir una publicación `ACTIVA` cuyo autor no sea el administrador autenticado | ✅ Se usa el fixture `PUBLICACION_ACTIVA_FIXTURE` (`autorId` distinto de `ADMIN_ACTOR_FIXTURE.id`). |
| 3 | Editar el contenido y confirmar explícitamente el guardado (AC-04.2) | ✅ Se edita el `textarea` y se confirma vía `ConfirmDialog`. |
| 4 | **Resultado esperado**: los cambios se reflejan sin recargar la página (AC-04.3) | ✅ Se invoca `PublicacionesServiceAdmin.editar()`; el formulario se cierra en el mismo árbol de React, sin navegación. |
| 5 | Simular un fallo de guardado | ✅ Se simula rechazando la llamada `httpClient.patch`. |
| 6 | **Resultado esperado**: se muestra un mensaje de error y el formulario conserva los datos editados (AC-04.4) | ✅ Se muestra el mensaje de error vía `MensajeError` y el `textarea` conserva el contenido editado. |

**Conclusión del Escenario 4**: todos los pasos y resultados esperados se verifican correctamente
contra la implementación actual de `PublicacionesPage`/`EditarPublicacionForm`. Sin observaciones ni
desviaciones respecto de lo descripto en `quickstart.md`.
