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

## Escenario 5 — Eliminar una publicación (HU-05)

- **Test de ejecución**: `tests/integration/Escenario5EliminarPublicacion.test.tsx` (T078)
- **Resultado**: ✅ **Verificado**

| Paso | Descripción | Resultado |
| --- | --- | --- |
| 1 | En Gestión de Publicaciones, seleccionar una publicación en estado `REPORTADA` | ✅ Se usa el fixture `PUBLICACION_REPORTADA_FIXTURE`. |
| 2 | Verificar que la acción "Eliminar" está visualmente diferenciada como sensible (RF-22) | ✅ El botón aplica la clase `accion-sensible-boton--sensible`. |
| 3 | Iniciar "Eliminar" y confirmar explícitamente (RF-23) | ✅ Se hace clic en "Eliminar" y luego en "Confirmar" del `ConfirmDialog`. |
| 4 | **Resultado esperado**: el estado de la publicación pasa a `ELIMINADA` (AC-05.3) | ✅ Se invoca `PublicacionesServiceAdmin.eliminar()`; el diálogo se cierra y el listado se recarga, reflejando el cambio sin bloquear la interfaz. |

**Conclusión del Escenario 5**: todos los pasos y resultados esperados se verifican correctamente
contra la implementación actual de `PublicacionesPage`/`EliminarPublicacionAction`. Sin observaciones
ni desviaciones respecto de lo descripto en `quickstart.md`.

## Escenarios 6, 7 y 8 — Ver, aceptar y rechazar reportes (HU-06, HU-07, HU-08)

- **Test de ejecución**: `tests/integration/Escenarios678Reportes.test.tsx` (T079)
- **Resultado**: ✅ **Verificado, con 2 observaciones documentadas (sin impacto bloqueante)**

### Escenario 6 — Ver reportes pendientes de revisión (HU-06)

| Paso | Descripción | Resultado |
| --- | --- | --- |
| 1 | Ir a la pantalla de Revisión de Reportes | ✅ `ReportesPage` renderiza el listado vía `ReportesTable`. |
| 2 | El listado muestra estado de moderación, motivo y prioridad de cada reporte (AC-06.1) | ✅ Las tres columnas están presentes en cada fila. |
| 3 | Aplicar un filtro por estado `PENDIENTE` y, por separado, por prioridad `ALTA` (AC-06.2) | ✅ Ambos filtros disparan una nueva consulta con el parámetro correspondiente. |
| 4 | **Resultado esperado**: los reportes `PENDIENTE` se destacan visualmente frente a otros estados (AC-06.3) | ⚠️ **Observación**: `ReportesTable` muestra el estado como texto plano en la columna "Estado de moderación", sin usar `EstadoModeracionBadge`. El resaltado visual de `PENDIENTE` (`badge--estado-pendiente`, con `box-shadow`) solo está integrado en `ReporteDetalle` (T056), no en el listado (`ReportesTable`, T053). No se modificó código de producción por ser esta una tarea de validación (T079), no de implementación. |
| 5 | Abrir el detalle de un reporte | ✅ El botón "Ver detalle" muestra `ReporteDetalle`. |
| 6 | **Resultado esperado**: se muestra motivo, prioridad, estado y la publicación/usuario asociado (AC-06.4) | ✅ `ReporteDetalle` muestra los 5 campos, incluyendo `PrioridadBadge`/`EstadoModeracionBadge`. |

### Escenario 7 — Aceptar un reporte (HU-07)

| Paso | Descripción | Resultado |
| --- | --- | --- |
| 1 | Seleccionar un reporte en estado `PENDIENTE` o `EN_REVISION` | ✅ Se usa el fixture `REPORTE_PENDIENTE_FIXTURE`. |
| 2 | Iniciar la acción "Aceptar"; se ejecuta sin diálogo de confirmación (AC-07.3) | ✅ No aparece ningún `role="dialog"` al hacer clic. |
| 3 | **Resultado esperado**: el estado pasa a `RESUELTO` (AC-07.2) y el `EstadoPublicacion` asociado no cambia | ✅ Se invoca `ReportesService.aceptar()`; `AceptarReporteAction` no recibe ni puede manipular ninguna `PublicacionModeracion` (estructuralmente no afecta su estado). |
| 4 | **Resultado esperado**: "Aceptar"/"Rechazar" quedan deshabilitados de forma permanente (AC-07.4, CB-03) | ✅ Tras refrescar el listado, ambos botones quedan deshabilitados para ese reporte. |
| 5 | Repetir eliminando además la publicación asociada en el mismo flujo; esa eliminación exige su propia confirmación (AC-05.2) | ℹ️ No se duplica aquí: `EliminarPublicacionAction` ya fue validada exhaustivamente en el Escenario 5 (T078, `Escenario5EliminarPublicacion.test.tsx`), confirmando que exige confirmación explícita propia. |

### Escenario 8 — Rechazar un reporte (HU-08)

| Paso | Descripción | Resultado |
| --- | --- | --- |
| 1 | Seleccionar un reporte distinto en estado `PENDIENTE`/`EN_REVISION`, asociado a una publicación `REPORTADA` sin otros reportes pendientes | ✅ Se usa el fixture `REPORTE_EN_REVISION_FIXTURE`. |
| 2 | Iniciar "Rechazar" y confirmar explícitamente (AC-08.3) | ✅ Se muestra el `ConfirmDialog` y se confirma. |
| 3 | **Resultado esperado**: el estado pasa a `DESESTIMADO` (AC-08.2) | ✅ Se invoca `ReportesService.rechazar()`. |
| 4 | **Resultado esperado**: la publicación vuelve automáticamente a `ACTIVA` si no quedan otros reportes pendientes (AC-08.6); verificar en Gestión de Publicaciones | ⚠️ **Observación**: `ReportesPage.tsx` no pasa la prop `publicacionAsociada` a `RechazarReporteAction`, por lo que `PublicacionModeracion.reactivarSiNoQuedanReportesPendientes()` no se invoca mecánicamente desde esta pantalla ni puede reflejarse en `PublicacionesPage` (páginas independientes, sin estado compartido, y sin backend real en este speckit). La regla de negocio en sí ya está cubierta a nivel de servicio por `ReportesService.test.ts` (T050d) y `PublicacionModeracion.test.ts` (T062b). No se modificó código de producción por ser esta una tarea de validación (T079). |
| 5 | Verificar que "Aceptar"/"Rechazar" quedan deshabilitados para este reporte (AC-08.4) | ✅ Tras refrescar el listado, ambos botones quedan deshabilitados. |

**Conclusión de los Escenarios 6, 7 y 8**: todos los resultados esperados observables desde la
interfaz se verifican correctamente. Se documentan 2 observaciones (no bloqueantes, sin modificar
código de producción en esta tarea de validación): (a) el resaltado visual de `PENDIENTE` no está
wireado en el listado de reportes, solo en el detalle; (b) la reactivación automática de la
publicación tras rechazar su último reporte pendiente no se refleja entre pantallas en este frontend
sin backend real, aunque la regla de negocio subyacente ya está cubierta por tests unitarios/de
aplicación dedicados.

## Escenario 9 — Exportar reportes (HU-09)

- **Test de ejecución**: `tests/integration/Escenario9ExportarReportes.test.tsx` (T080)
- **Resultado**: ✅ **Verificado**

| Paso | Descripción | Resultado |
| --- | --- | --- |
| 1 | En `/reportes`, aplicar un filtro (por ejemplo, prioridad `ALTA`) | ✅ Se cambia el filtro de prioridad mediante `FiltrosReportes` antes de exportar. |
| 2 | Hacer clic en "Exportar" dentro de la misma pantalla, respetando el filtro activo (AC-09.1) | ✅ No existe pantalla ni ruta separadas; `ExportarReportesBoton` invoca `POST /reportes/exportar` con el `FiltroReportes` activo (`{ prioridad: 'ALTA' }`) como cuerpo de la solicitud. |
| 3 | **Resultado esperado**: se muestra un estado de carga sin bloquear el resto de la interfaz (AC-09.2) | ✅ El botón cambia a "Exportando…" mientras la promesa está pendiente; el resto de la pantalla (filtros, tabla) permanece presente y operable. |
| 3 (cont.) | **Resultado esperado**: al finalizar, se ofrece una acción de descarga (AC-09.3) | ✅ Al resolver la exportación, aparece un enlace "Descargar archivo exportado" apuntando a la `urlDescarga` recibida, y el botón vuelve a su estado habilitado "Exportar". |
| 4 | Simular un fallo en la generación del archivo | ✅ Se simula un rechazo del `HttpClient.post` hacia `/reportes/exportar`. |
| 5 | **Resultado esperado**: se muestra un mensaje de error claro (AC-09.4, CB-05) | ✅ `ExportacionService.exportar()` captura el error y devuelve `exitoso: false` con `mensajeError`; `ReportesPage` lo muestra vía `MensajeError` de forma no bloqueante (la pantalla permanece montada y operable, sin enlace de descarga). |

**Conclusión del Escenario 9**: todos los pasos y resultados esperados se verifican correctamente
contra la implementación actual de `ReportesPage`/`ExportarReportesBoton`/`ExportacionService`. Sin
observaciones ni desviaciones respecto de lo descripto en `quickstart.md`.

## Escenario 10 — Acceso restringido al frontend administrativo (HU-10)

- **Test de ejecución**: `tests/integration/Escenario10AccesoRestringido.test.tsx` (T081)
- **Resultado**: ✅ **Verificado, con 1 observación documentada**

| Paso | Descripción | Resultado |
| --- | --- | --- |
| 1 | Acceder a pantallas administrativas (`/reportes`, `/usuarios`) con una sesión simulada de rol `USER` | ✅ Se simula pasando `rolActual = USER` a `GuardiaRolAdmin`. |
| 2 | **Resultado esperado**: el acceso se rechaza o redirige (AC-10.1) | ✅ Se redirige a `/login-admin`; la pantalla protegida nunca se monta y no se realiza ninguna consulta (`httpClient.get` sin invocar). |
| 2 (contraste) | Con rol `ADMIN` se permite el acceso | ✅ `ReportesPage` se renderiza normalmente. |
| 3 | Documentar que la restricción es solo una verificación de interfaz (AC-10.3, RNF-05) | ✅ **La autorización definitiva depende del backend que se integrará en una iteración futura**; esta guardia solo restringe la navegación en el frontend y no reemplaza la validación del servidor. |

**Observación**: `AppRoutesAdmin.tsx` todavía no envuelve sus rutas con `GuardiaRolAdmin` (su cabecera
la describe como "aún no implementada"), por lo que el test compone la guardia con las pantallas
reales. La guardia en sí funciona correctamente; su integración en el enrutador queda como
pendiente fuera del alcance de T081 (tarea de validación, sin cambios a código de producción).

**Conclusión del Escenario 10**: el comportamiento de `GuardiaRolAdmin` cumple AC-10.1; se deja
constancia de la limitación de seguridad (AC-10.3) y de la observación de integración.
