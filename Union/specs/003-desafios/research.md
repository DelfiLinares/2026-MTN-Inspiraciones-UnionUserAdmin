# Research — 003 Desafíos (Frontend)

**Spec**: `spec.md` | **Constitution**: `constitution.md` v1.1.0 | **Fecha**: 2026-10-11

Este documento registra las decisiones técnicas del plan, las alternativas consideradas y la justificación. Las recomendaciones de backend (sección 9) no son vinculantes: son orientación para el equipo de la API Java.

---

## 0. Supuestos de partida

| ID | Supuesto | Estado |
|---|---|---|
| S-01 | Las "2 aplicaciones React existentes" son `apps/usuario` y `apps/admin` del monorepo `Union/specs/002-inspiraciones-publicaciones/frontend/`, que comparten `packages/shared`. Son las únicas dos aplicaciones separadas que existen en el workspace (RF-23). `Union/frontend/` es una sola app Vite con rutas de usuario y de admin, y contiene código del módulo 001. | **Por confirmar** |
| S-02 | El módulo 003 usa la misma stack que 002 (React 18, React Router 6, Vite 5, TanStack Query 5, CSS Modules, Vitest, RTL). No se introducen librerías nuevas de UI. | Decidido |
| S-03 | La API Java expone JSON sobre HTTP. La sesión se obtiene con el mecanismo ya existente en 002 (`sesionService`). | Pendiente de confirmar mecanismo (P-05) |

---

## 1. Ubicación del código de 003

**Decisión**: el código de 003 vive en el monorepo de 002, en tres niveles:

- `packages/shared/src/desafios/`: dominio (entidades, value objects, enums, reglas) y aplicación (casos de uso y puerto). Infraestructura del puerto: cliente HTTP y adaptador en memoria.
- `apps/usuario/src/features/desafios/`: UI de usuario (páginas, componentes, hooks de presentación).
- `apps/admin/src/features/desafios/`: UI de administración.

**Justificación**: la carpeta `desafios/` evita colisiones con los nombres que ya usa 002 en `packages/shared/src/domain/` y con los del módulo 001 (`Desafio.ts`, `desafioService.ts`, `DesafiosAdminPage.tsx` en `Union/frontend/src`). Ese código 001 no se toca ni se reutiliza.

**Alternativas descartadas**:
- Reutilizar `Union/frontend/src/domain/Desafio.ts` y los servicios 001. Descartada: el modelo 001 (`titulo`, `activo`, `completadoPorUsuarioActual`) no coincide con las entidades de 003 y mezclarlos rompe la regla de no duplicar ni contaminar.
- Crear una app nueva. Descartada por la constitution 003 ("No se crean aplicaciones nuevas").

---

## 2. Dominio y aplicación compartidos entre las dos apps

Requisito: RNF-05 y RNF-06 exigen que las reglas estén fuera de la UI, y las dos apps deben aplicar las mismas reglas de permisos, fechas y transiciones (RF-20, RF-21).

### Opciones evaluadas

| Opción | Descripción | Pros | Contras |
|---|---|---|---|
| **A. Paquete compartido en `packages/shared/src/desafios/`** (elegida) | Una sola implementación de entidades, value objects, casos de uso, puerto y adaptadores, consumida por ambas apps. | Una sola fuente de reglas (principio 2 y RNF-05). Tests de dominio y aplicación se escriben una vez. Precedente de 002 (D-07). Sin nuevos paquetes ni configuración de workspace. | Acoplamiento de versiones entre apps. Riesgo de que `shared` crezca. Se mitiga con el espacio de nombres `desafios/` y con la regla de que `desafios/` no importa de otros módulos de `shared`. |
| B. Duplicación controlada (copia en cada app) | Cada app tiene su copia de entidades y casos de uso. | Independencia total de despliegue. | Reglas duplicadas que pueden divergir (por ejemplo, permisos de admin frente a usuario). Viola el principio 2 de la constitution 003 ("encapsulan sus reglas") en dos sitios. Viola la regla de evitar lógica duplicada. |
| C. Paquete nuevo `packages/desafios` | Igual que A, pero en un paquete de workspace propio. | Límites más claros entre módulos. | Nueva configuración de workspace, tsconfig, Vitest project y build. Obliga a mantener dos paquetes compartidos que ya comparten `httpClient` y `errores`. Se reserva como alternativa si 003 necesita ciclo de despliegue independiente. |

**Decisión**: opción A.

**Consecuencias**:
- `desafios/domain/` y `desafios/application/` no importan componentes React ni nada de `apps/*`.
- Las apps solo importan desde `@.../shared/desafios` (API pública del módulo mediante un `index.ts`).
- Los componentes llaman a hooks de `features/desafios/`, que llaman a casos de uso. Ningún componente hace `fetch` ni aplica reglas de negocio.

---

## 3. Puerto, adaptador HTTP y adaptador en memoria

**Decisión**: un puerto único `DesafiosPort` (interfaz) en `packages/shared/src/desafios/application/ports/`, con dos implementaciones:

1. `HttpDesafiosAdapter` en `packages/shared/src/desafios/infrastructure/`: usa el `httpClient` existente en `shared/src/services/httpClient.ts`. Es el adaptador real para la API Java, pendiente de integración.
2. `InMemoryDesafiosAdapter` en `packages/shared/src/desafios/infrastructure/`: guarda los datos en memoria, sin red. Es el adaptador por defecto.

La selección se hace en un proveedor de contexto por app (`DesafiosProvider`), con la variable `VITE_DESAFIOS_ADAPTER` (`memoria` por defecto, `http` cuando exista backend). Cambiar de adaptador no toca dominio, aplicación ni componentes.

**Por qué no MSW**: la constitution 003 (principio 4) prohíbe servidores y lógica de servidor simulada. Un adaptador en memoria implementa el puerto directamente y no intercepta peticiones HTTP. Por eso 003 no añade handlers MSW de desafíos. El MSW existente de 002 (`tests/mocks/handlers/`) no se amplía. Los tests de 003 usan el adaptador en memoria o un doble del puerto.

**Contrato del puerto** (descrito, la implementación sigue en la fase de tareas): operaciones agrupadas por recurso, todas asíncronas y paginadas por cursor cuando devuelven listas: listar y obtener desafíos, publicar, editar, eliminar; proponer, listar, editar, eliminar, aprobar y rechazar solicitudes; listar, responder, editar y eliminar respuestas; listar ámbitos.

**Contrato HTTP**: se describe en `contracts/openapi.yaml`. Los tests de contrato opcionales validan que las peticiones y respuestas del `HttpDesafiosAdapter` cumplen ese archivo.

---

## 4. Estado de servidor y caché en cliente

**Decisión**: TanStack Query 5 (precedente 002, D-02).

- Claves por recurso: `['desafios', filtros]`, `['desafio', id]`, `['solicitudes', filtros]`, `['respuestas', desafioId]`, `['ambitos']`.
- Listados con `useInfiniteQuery` para scroll infinito (RF-15, HU-09, HU-12).
- Mutaciones: sin actualización optimista en acciones destructivas o administrativas. Tras éxito, se invalidan las claves afectadas.
- Reintentos (precedente 002, D-11): 2 reintentos en consultas GET; 0 en mutaciones, para no duplicar publicaciones ni solicitudes (CB-04).
- `staleTime` corto en listados (de 30 a 60 s) para que los cambios de estado por fecha se vean al recargar (CB-05). El valor exacto queda para tareas.

---

## 5. Paginación

**Decisión**: paginación por cursor (keyset) en todos los listados: desafíos, solicitudes, respuestas. El cliente envía `cursor` y `limite`. La respuesta devuelve `items` y `siguienteCursor` (nulo al final).

**Justificación**: los listados cambian mientras se navegan (nuevos desafíos, respuestas nuevas). La paginación por desplazamiento (`offset`) repite o salta elementos en esas condiciones y se degrada con volúmenes grandes (principio 10). La paginación por cursor mantiene el orden estable y evita escanear filas saltadas.

**Alternativa**: `offset`/`limit`. Se descarta por lo anterior. Podría usarse en la pantalla de administración de solicitudes pendientes si el volumen es pequeño, pero se unifica para simplificar el cliente.

---

## 6. Filtros

**Decisión**: los filtros se envían a la API como parámetros de consulta (`ambito`, `estado`, y `fechaDesde`/`fechaHasta` cuando A-14 se resuelva). El frontend no filtra listas completas en memoria (HU-10, principio 10).

- El estado de los filtros se refleja en la URL (parámetros de búsqueda de React Router), para que una vista filtrada sea enlazable y se conserve al recargar.
- Filtro por fecha (HU-13, RF-19): no se implementa hasta resolver A-14. La UI no muestra el control.

---

## 7. Derivación del estado y zona horaria

**Hecho**: la constitution 003 dice que `PROGRAMADO`, `ACTIVO` y `FINALIZADO` se derivan de `RangoFechas` y de la fecha actual. La spec (sección 2, actor Sistema) dice que el backend deriva el estado y sirve listados filtrados.

**Decisión**:
- La entidad `Desafio` calcula `estado(ahora)` a partir de su `RangoFechas`. Así la UI tiene la regla en el dominio, y las reglas de presentación (`requiereConfirmacionEdicion`, `aceptaRespuestas`) no dependen del servidor.
- Para filtrar y ordenar, la API es la fuente de verdad. El `estado` que devuelve la API se usa en los filtros.
- Si el estado calculado y el devuelto por la API difieren (por ejemplo, un desafío que acaba de cambiar de `PROGRAMADO` a `ACTIVO`), prevalece el de la API tras recargar (CB-05).

**Pendiente A-16**: zona horaria y si el día de fin es inclusivo para `ACTIVO`. La frontera de `estado(ahora)` queda parametrizada y no se fija un valor hasta resolver A-16. Los tests de frontera se marcan como pendientes.

---

## 8. Permisos, sesión y errores

**Permisos**:
- Las reglas de quién puede hacer qué viven en las entidades (`puedeEditarPor`, `puedeEliminarPor`, `puedeResponder`, etc.). La UI las consulta para mostrar u ocultar acciones (RF-21).
- El backend valida siempre. Un 403 de la API se muestra como "permiso denegado" sin cambiar la vista (CB-07).

**Sesión expirada (CB-08)**:
- Un 401 durante un envío lleva al login conservando el borrador. Se reutiliza el hook `useBorradorFormulario` de 002 (`packages/shared/src/hooks/useBorradorFormulario.ts`), que guarda el borrador localmente.
- Tras reautenticar, se vuelve a la ruta original.

**Conflictos de edición (CB-02)**:
- Propuesta: las entidades editables llevan `version` y el `PUT` envía `If-Match`. Un 409 muestra el aviso de conflicto y no sobrescribe. Pendiente P-04, porque la spec solo pide el aviso y no define el mecanismo.

**Errores**: `packages/shared/src/services/errores.ts` (002) ya clasifica errores HTTP. Los errores de validación de negocio (por ejemplo, fecha de fin no posterior) se representan como un objeto de errores por campo que produce la entidad, no el componente (RF-03, RF-04).

---

## 9. Recomendaciones de backend (no vinculantes)

Estas recomendaciones son orientación para la API Java. No forman parte del frontend y no se implementan aquí (principio 4).

**Índices de base de datos**:
- `desafios (eliminado, ambito)`: para filtro por ámbito sobre desafíos visibles. Ámbito suele ser una tabla de relación (`desafio_ambito (ambito_id, desafio_id)`), con índice en ambos lados.
- `desafios (fecha_inicio, fecha_fin)` y un índice por `fecha_fin` para derivar `FINALIZADO`, `ACTIVO` y `PROGRAMADO` con rangos.
- `desafios (eliminado, fecha_inicio, id)`: para el listado paginado por cursor.
- `solicitudes_desafio (estado, id)` para la bandeja de pendientes del admin; `solicitudes_desafio (autor_id, id)` para "mis solicitudes".
- `respuestas_desafio (desafio_id, id)` para respuestas paginadas por cursor; `UNIQUE (desafio_id, autor_id)` para aplicar A-10 a nivel de base de datos.

**Paginación**: cursor keyset sobre `id` o `(fecha, id)`, como en la sección 5.

**Caché Redis**:
- Catálogo de ámbitos (`ambitos`): cambia poco. TTL largo, invalidado al cambiar el catálogo.
- Listados públicos de desafíos activos: TTL corto. Hay que tener en cuenta que el estado cambia al cruzar fechas (CB-05), así que la clave debe incluir el filtro de estado o el TTL debe ser menor que el intervalo entre cambios.
- Respuestas de un desafío: invalidación al crear, editar o eliminar una respuesta.
- No cachear permisos ni sesiones de forma compartida.

**Rankings y estadísticas**: si en el futuro existen (por ejemplo, desafíos más populares), los calcula el backend (principio 14, RNF-07). El frontend no los recalcula.

---

## 10. Testing

**Decisión**: Vitest y React Testing Library (precedente 002). Sin MSW para 003.

| Nivel | Qué prueba | Dónde |
|---|---|---|
| Dominio (unitario) | `RangoFechas`, `estado(ahora)`, `puedeEditarPor`, `requiereConfirmacionEdicion`, transiciones de `SolicitudDesafio`, `puedeEliminarPor` de respuestas, validación de nombre, descripción, fotos y ámbitos | `packages/shared/src/desafios/domain/**/*.test.ts` |
| Aplicación | Casos de uso contra `InMemoryDesafiosAdapter`: publicar, editar, aprobar, responder, con permisos | `packages/shared/src/desafios/application/**/*.test.ts` |
| Componentes (RTL) | Acciones visibles por rol, validación de formularios, confirmación antes de eliminar y editar desafío activo | `apps/usuario/src/features/desafios/**/*.test.tsx`, `apps/admin/src/features/desafios/**/*.test.tsx` |
| Contrato (opcional) | Peticiones y respuestas del `HttpDesafiosAdapter` contra `contracts/openapi.yaml` | `packages/shared/src/desafios/infrastructure/*.contract.test.ts` |

Sin pruebas de integración con repositorio ni con backend (constitution 003, apartado de testing).

**Dependencia nueva opcional**: si se hacen tests de contrato, se necesita un validador de esquemas OpenAPI (por ejemplo `ajv`). Requiere aprobación antes de añadirla.

---

## 11. Accesibilidad y componentes compartidos

- Confirmaciones destructivas: reutilizar `ConfirmDialog` de `packages/shared/src/components/` (002). Las acciones administrativas destructivas usan el estilo de peligro, diferenciado de las de consulta (principio 12, RNF-01).
- Estados vacíos y de carga: `EstadosGlobales`, `Estados` y `Medio` de `shared/src/components/` (002).
- Mensajes de error por campo: el formulario muestra el mensaje junto al campo y enlaza el mensaje con `aria-describedby`.

---

## 12. Pendientes que condicionan el diseño

| ID | Tema | Efecto en el diseño |
|---|---|---|
| A-02 | Catálogo de ámbitos | Validación de tags (CB-12) y el endpoint `/ambitos` se marcan pendientes. El tipo `AmbitoDesafio` no tiene valores fijos. |
| A-04 | Editar o borrar solicitudes resueltas | La UI no ofrece esas acciones hasta resolverlo. Sin regla en el dominio. |
| A-08 | Campos de una solicitud | El esquema `SolicitudDesafioEscritura` no define campos. |
| A-11 | Longitud de nombre y descripción | Sin límites de longitud en validación ni en el contrato. |
| A-13 | Visibilidad de `FINALIZADO` | Sin filtro por visibilidad temporal. |
| A-14 | Filtro por fecha | No se implementa HU-13 ni RF-19. |
| A-15 | Tiempos y volúmenes (RNF-02, RNF-03) | Sin objetivo medible. Las recomendaciones de la sección 9 son genéricas. |
| A-16 | Zona horaria y día de fin | Frontera de `estado(ahora)` parametrizada, sin valor fijado. |
| A-17 | Motivo de rechazo | `rechazar` no recibe motivo en el contrato. |
| A-19 | Admin como usuario | Sin decisión sobre que el admin envíe solicitudes o respuestas. |
| A-20 | Duplicados lógicos | Solo se contempla el doble envío (CB-04) por idempotencia de la UI. |
| A-21 | Fechas pasadas al publicar | Sin validación de fecha de inicio frente a hoy. |
| A-22 | Formatos de respuesta | `contenido` sin tipo definido. |

Pendientes nuevos de planificación: ver `plan.md`, sección 6 (P-01 a P-05).
