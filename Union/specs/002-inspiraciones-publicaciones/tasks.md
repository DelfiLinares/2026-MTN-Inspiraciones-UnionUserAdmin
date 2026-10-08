# Tareas (Frontend) — 002 Inspiraciones

**Entradas**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/api-client.md`, `quickstart.md`
**Alcance**: solo `frontend/`. Sin backend, base de datos ni infraestructura de servidor.
**Esta fase no implementa código**: es solo el desglose de tareas.

## Convenciones

- `[P]`: paralelizable (archivos distintos y sin dependencia entre sí).
- **Spec**: historia (HU-xx) o requisito (RF-xx, RNF-xx, CB-xx) de `spec.md`. **Res.**: decisión (D-xx), supuesto (S-x) o ambigüedad (A-x) de `research.md`.
- Tests antes de la implementación que validan (TDD), o junto a ella. Los tests de componentes y páginas están en la fase 8 y se escriben junto a las fases 5 y 6.
- **Ajuste a la estructura:** el plan define un monorepo, así que las rutas usan `frontend/packages/shared/src/` (código común), `frontend/apps/usuario/src/` y `frontend/apps/admin/src/`. No se usa `frontend/src/` como en tu ejemplo. Los tipos viven en `domain/` según el plan.
- Dentro de `shared`, `types` = `domain/tipos.ts`, `utils` = `utils/`, y `hooks`, `services` y `components` siguen la arquitectura del plan.

Abreviaturas de rutas: **SH** = `frontend/packages/shared/src`, **US** = `frontend/apps/usuario/src`, **AD** = `frontend/apps/admin/src`. Los `*.test.*` van junto al archivo que validan.

---

## Fase 1 — Setup del frontend

- [x] **T001** Workspace raíz: `frontend/package.json` (workspaces), `frontend/tsconfig.base.json` (`strict`, `noUncheckedIndexedAccess`). **Spec**: RF-29, RNF-05. **Res.**: D-01, D-07. **Depende de**: —
- [x] **T002** [P] Paquete compartido: `frontend/packages/shared/package.json`, `frontend/packages/shared/tsconfig.json`, `SH/index.ts`. **Spec**: RF-29. **Res.**: D-07. **Depende de**: T001
- [x] **T003** [P] App usuario: `frontend/apps/usuario/package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `US/main.tsx`. **Spec**: RF-29. **Res.**: D-01, D-05. **Depende de**: T001, T002
- [x] **T004** [P] App admin: `frontend/apps/admin/package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `AD/main.tsx`. **Spec**: RF-29, HU-12. **Depende de**: T001, T002
- [x] **T005** [P] Lint y formato: `frontend/eslint.config.js` (prohíbe `any`, `!` y aserciones `as` salvo justificación), `frontend/.prettierrc`. **Spec**: RNF-04. **Depende de**: T001
- [x] **T006** [P] Tests: `frontend/vitest.workspace.ts`, `frontend/tests/setup.ts` (RTL, MSW, jest-dom). **Spec**: RNF-04. **Res.**: D-06. **Depende de**: T001
- [x] **T007** [P] Estilos base con variables CSS: `SH/styles/variables.css`, `SH/styles/base.css`, `US/styles/global.css`, `AD/styles/global.css` (mobile first, foco visible, color distintivo para acciones destructivas). **Spec**: RNF-01. **Res.**: D-03, sección 5. **Depende de**: T002
- [x] **T008** Scripts `typecheck`, `lint`, `test`, `build`, `dev` en `frontend/package.json` y en cada app. **Spec**: RNF-04. **Depende de**: T003, T004, T005, T006

**Checkpoint F1**: `npm install`, `typecheck`, `lint` y `build` pasan en las dos apps vacías, y `dev` muestra una pantalla en blanco.

---

## Fase 2 — Tipos y funciones puras de dominio

- [x] **T009** [P] Enums: `SH/domain/enums.ts` (`RolUsuario`, `EstadoPublicacion`, `TipoContenido`, `FormatoArchivo`, `MotivoReporte`, `VisibilidadCarpeta`). **Spec**: RF-02, RF-21, RF-20. **Res.**: data-model §1, A-11, A-13. **Depende de**: T002
- [x] **T010** Tipos: `SH/domain/tipos.ts` (`UsuarioActual`, `Publicacion`, `Carpeta`, `ItemCarpeta`, `Reporte`, `PublicacionReportada`, `Paginacion`, `ErrorApi`, estados de UI). **Spec**: RF-02, RF-15, RF-19, CB-02. **Depende de**: T009
- [x] **T011** [P] Mensajes en español centralizados: `SH/utils/mensajes.ts`. **Spec**: RF-28, RNF-01. **Res.**: sección 5. **Depende de**: T002
- [x] **T012** Tests de permisos (primero): `SH/domain/permisos.test.ts` con `puedeEditar`, `puedeBorrar`, `puedeDarLike`, `puedeGuardar`, `puedeReportar`, `puedeModerar` y publicación `ELIMINADA`. **Spec**: RF-06 a RF-08, RF-14, RF-22, RF-23, HU-02, HU-03, HU-07, HU-11. **Res.**: D-09, A-4, A-9. **Depende de**: T010
- [x] **T013** Implementar `SH/domain/permisos.ts` (funciones puras). **Spec**: RF-06 a RF-10b. **Depende de**: T012
- [x] **T014** [P] Tests de validaciones (primero): `SH/domain/validaciones.test.ts` (publicación, formato y tamaño, reporte con `OTRO` exige texto y máximo 500, carpeta de 1 a 50 caracteres). **Spec**: RF-02, RF-21, RF-16, CB-10, CB-11. **Res.**: A-7, A-11, A-13. **Depende de**: T010
- [x] **T015** Implementar `SH/domain/validaciones.ts`. **Depende de**: T014
- [x] **T016** [P] Tests de utilidades puras: `SH/utils/formato.test.ts` (fechas en español, tamaño legible, texto alternativo de imagen). **Spec**: RNF-01. **Depende de**: T010
- [x] **T017** Implementar `SH/utils/formato.ts`. **Depende de**: T016
- [x] **T018** Exportar el dominio: `SH/domain/index.ts`. **Depende de**: T013, T015

**Checkpoint F2**: los tests unitarios de permisos y validaciones pasan con la matriz regla → test de `data-model.md` §6, sin React ni red.

---

## Fase 3 — Servicios, cliente HTTP y mocks (MSW)

- [x] **T019** Tests del cliente HTTP (primero): `SH/services/httpClient.test.ts` (401, 403, 404, 409, 413, 415, 422, red; GET reintenta 2 veces, mutaciones 0). **Spec**: RF-09, CB-09. **Res.**: D-04, D-11. **Depende de**: T010, T011, T027
- [x] **T020** Implementar `SH/services/httpClient.ts` y `SH/services/errores.ts` (mapeo a `ErrorApi`, mensajes). Es el único lugar con `fetch`. **Spec**: RF-09, RNF-03. **Depende de**: T019
- [x] **T021** [P] Datos de prueba: `frontend/tests/mocks/datos.ts` (usuario, admin, publicaciones propias/ajenas/eliminadas, carpetas, reportes). **Spec**: CB-01 a CB-05. **Depende de**: T010
- [x] **T022** [P] Handlers de sesión y configuración: `frontend/tests/mocks/handlers/sesion.ts`. **Spec**: RF-10b. **Res.**: S-1, S-2. **Depende de**: T021
- [x] **T023** [P] Handlers de publicaciones: `frontend/tests/mocks/handlers/publicaciones.ts` (con filtros y paginación). **Spec**: RF-01 a RF-05, RF-25 a RF-27. **Depende de**: T021
- [x] **T024** [P] Handlers de likes: `frontend/tests/mocks/handlers/likes.ts` (idempotentes, 403 en propia). **Spec**: RF-11 a RF-15. **Res.**: S-3. **Depende de**: T021
- [x] **T025** [P] Handlers de carpetas: `frontend/tests/mocks/handlers/carpetas.ts` (incluye ítem `disponible:false`). **Spec**: RF-16 a RF-20. **Depende de**: T021
- [x] **T026** [P] Handlers de reportes y moderación: `frontend/tests/mocks/handlers/reportes.ts` (409 en duplicado, 403 si no es `ADMIN`). **Spec**: RF-21 a RF-24. **Depende de**: T021
- [x] **T027** Servidor y worker MSW con escenarios: `frontend/tests/mocks/server.ts`, `frontend/tests/mocks/browser.ts`, `frontend/tests/mocks/escenarios.ts` (rol `USER`/`ADMIN`, 401, 403, 404, red caída, carpeta vacía). **Spec**: CB-05, CB-09. **Res.**: D-06. **Depende de**: T022, T023, T024, T025, T026
- [x] **T028** [P] Servicios de sesión y configuración con su test: `SH/services/sesionService.test.ts`, `SH/services/sesionService.ts`. **Spec**: RF-10, RF-10b. **Res.**: A-15, S-2. **Depende de**: T020, T027
- [x] **T029** [P] Servicio de publicaciones con su test: `SH/services/publicacionesService.test.ts`, `SH/services/publicacionesService.ts` (subida `multipart`). **Spec**: RF-01 a RF-05, RF-25 a RF-27. **Depende de**: T020, T027
- [x] **T030** [P] Servicio de likes con su test: `SH/services/likesService.test.ts`, `SH/services/likesService.ts`. **Spec**: RF-11 a RF-13. **Depende de**: T020, T027
- [x] **T031** [P] Servicio de carpetas con su test: `SH/services/carpetasService.test.ts`, `SH/services/carpetasService.ts`. **Spec**: RF-16 a RF-20. **Depende de**: T020, T027
- [x] **T032** [P] Servicios de reportes y moderación con su test: `SH/services/reportesService.test.ts`, `SH/services/reportesService.ts`, `SH/services/moderacionService.test.ts`, `SH/services/moderacionService.ts`. **Spec**: RF-21 a RF-24, RF-07. **Depende de**: T020, T027
- [x] **T033** Exportar servicios: `SH/services/index.ts`. **Depende de**: T028, T029, T030, T031, T032

**Checkpoint F3**: todos los servicios pasan sus tests contra MSW; se pueden invocar desde la consola con los mocks activos. No hay UI.

---

## Fase 4 — Hooks de casos de uso

Cada hook lleva su test (`*.test.ts`) y se escribe primero, con MSW.

- [x] **T034** Configuración de TanStack Query y claves: `SH/hooks/queryClient.ts`, `SH/hooks/claves.ts` (`staleTime` 30 s, reintentos según D-11). **Spec**: RNF-02. **Res.**: D-02, D-11, sección 4. **Depende de**: T033
- [x] **T035** Sesión: `SH/hooks/useSesion.test.tsx`, `SH/hooks/useSesion.tsx` (proveedor, fuente única del usuario y rol). **Spec**: RF-10, RF-10b. **Res.**: A-15. **Depende de**: T034
- [x] **T036** [P] Feed y detalle: `SH/hooks/useFeed.test.tsx`, `SH/hooks/useFeed.ts` (scroll infinito, 20 por página), `SH/hooks/usePublicacion.ts`. **Spec**: HU-04, HU-05, HU-06, RF-25 a RF-27. **Res.**: D-08, A-10, A-12. **Depende de**: T034
- [x] **T037** [P] Mutaciones de publicaciones: `SH/hooks/usePublicacionMutaciones.test.tsx`, `SH/hooks/usePublicacionMutaciones.ts` (crear, editar, borrar; invalidaciones). **Spec**: HU-01, HU-02, HU-03, RF-01 a RF-05, RF-28. **Depende de**: T034
- [x] **T038** [P] Like optimista: `SH/hooks/useLike.test.tsx`, `SH/hooks/useLike.ts` (alternancia, contador inmediato, reversión, anti doble clic). **Spec**: HU-07, RF-11 a RF-15, CB-07. **Res.**: D-10, S-3. **Depende de**: T034, T013
- [x] **T039** [P] Carpetas: `SH/hooks/useCarpetas.test.tsx`, `SH/hooks/useCarpetas.ts` (listar, contenido, crear, renombrar, eliminar, visibilidad). **Spec**: HU-08, HU-10, RF-16, RF-19, RF-20, CB-05. **Res.**: A-5, A-7. **Depende de**: T034, T015
- [x] **T040** [P] Guardado en carpetas: `SH/hooks/useGuardarEnCarpetas.test.tsx`, `SH/hooks/useGuardarEnCarpetas.ts` (optimista, varias carpetas, quitar). **Spec**: HU-09, RF-17, RF-18, CB-02. **Res.**: D-10, A-9. **Depende de**: T034, T013
- [x] **T041** [P] Reportar: `SH/hooks/useReportar.test.tsx`, `SH/hooks/useReportar.ts` (409 equivale a "ya reportada"). **Spec**: HU-11, RF-21 a RF-23. **Res.**: A-13. **Depende de**: T034, T015
- [x] **T042** [P] Moderación: `SH/hooks/useModeracion.test.tsx`, `SH/hooks/useModeracion.ts` (reportadas, borrar como admin). **Spec**: HU-12, HU-13, RF-07, RF-24. **Res.**: A-1, A-16. **Depende de**: T034
- [x] **T043** Feedback de acciones: `SH/hooks/useNotificaciones.test.tsx`, `SH/hooks/useNotificaciones.ts` (éxito y error tras cada acción). **Spec**: RF-28. **Depende de**: T011, T034

**Checkpoint F4**: los hooks pasan sus tests; like y guardado revierten ante el error de red; un hook puede usarse en una página de prueba sin UI definitiva.

---

## Fase 5 — Componentes reutilizables de UI

Sin `fetch` ni reglas de negocio: usan hooks y las funciones de `permisos.ts`. Sus tests están en la fase 8 y se escriben a la par.

**Compartidos**
- [x] **T044** [P] Diálogo de confirmación reutilizable: `SH/components/ConfirmDialog.tsx`, `ConfirmDialog.module.css` (`role="dialog"`, foco atrapado, Escape, variante destructiva). **Spec**: HU-03, HU-12, RF-28, principio 13. **Res.**: sección 5. **Depende de**: T007
- [x] **T045** [P] Estados: `SH/components/Estados.tsx` (`Skeleton`, `EstadoVacio`, `EstadoError` con reintento). **Spec**: RF-28, CB-05. **Depende de**: T007
- [x] **T046** [P] Notificaciones: `SH/components/Notificaciones.tsx` (región `aria-live`). **Spec**: RF-28. **Depende de**: T043
- [x] **T047** [P] Medio con carga diferida: `SH/components/Medio.tsx` (imagen/video/audio, `loading="lazy"`, texto alternativo, placeholder). **Spec**: RF-02, RNF-02. **Res.**: sección 4. **Depende de**: T017, T045

**App usuario**
- [x] **T048** Tarjeta de publicación: `US/components/TarjetaPublicacion.tsx` (acciones según permisos). **Spec**: HU-04, HU-07, HU-09, HU-11. **Depende de**: T013, T047
- [x] **T049** [P] Botón de like: `US/components/BotonLike.tsx` (`aria-pressed`, contador, deshabilitado mientras la mutación está pendiente). **Spec**: HU-07, RF-15, CB-07. **Depende de**: T038
- [x] **T050** [P] Guardar en carpetas: `US/components/BotonGuardar.tsx`, `US/components/ModalGuardar.tsx`. **Spec**: HU-09, RF-17, RF-18. **Depende de**: T040, T044
- [x] **T051** [P] Reportar: `US/components/ModalReportar.tsx` (motivo + texto libre, estado "Ya reportada"). **Spec**: HU-11, RF-21 a RF-23. **Res.**: A-13. **Depende de**: T041, T044
- [x] **T052** [P] Búsqueda y filtros: `US/components/BarraBusqueda.tsx`, `US/components/Filtros.tsx` (texto, etiqueta/categoría, tipo). **Spec**: HU-06, RF-27. **Res.**: A-10. **Depende de**: T036
- [x] **T053** Grilla tipo tablero: `US/components/GrillaPublicaciones.tsx` (scroll infinito, skeletons). **Spec**: HU-04, RF-25, RNF-02. **Res.**: D-08. **Depende de**: T045, T048
- [x] **T054** [P] Formulario de publicación: `US/components/FormularioPublicacion.tsx` (validación de formato y tamaño, errores por campo, errores 413, 415, 422). **Spec**: HU-01, HU-02, RF-02, CB-11. **Res.**: A-11, S-2. **Depende de**: T015, T037
- [x] **T055** [P] Carpetas: `US/components/ListaCarpetas.tsx`, `US/components/FormularioCarpeta.tsx`, `US/components/ItemCarpeta.tsx` (variante "publicación no disponible"). **Spec**: HU-08, HU-09, HU-10, CB-02, CB-05. **Depende de**: T039, T044

**App admin**
- [x] **T056** [P] Tabla de reportadas: `AD/components/TablaReportadas.tsx` (motivos, cantidad de reportes, fecha). **Spec**: HU-13, RF-24. **Depende de**: T042, T045
- [x] **T057** [P] Acción de borrado de moderación: `AD/components/BotonBorrarModeracion.tsx` (estilo destructivo, confirmación). **Spec**: HU-12, RF-07, principios 12 y 13. **Depende de**: T042, T044

**Checkpoint F5**: los componentes se ven en una página temporal con datos de MSW; el diálogo de confirmación y las acciones respetan los permisos.

---

## Fase 6 — Pantallas y rutas

- [x] **T058** Rutas y layout de usuario con `React.lazy`: `US/App.tsx`, `US/routes/index.tsx`, `US/routes/RutaProtegida.tsx`, `US/layouts/Layout.tsx`. **Spec**: RF-29, RF-10. **Res.**: D-05. **Depende de**: T035, T043, T046
- [x] **T059** [P] Explorar (MVP): `US/pages/ExplorarPage.tsx` (ruta `/`). **Spec**: HU-04, HU-06, RF-25, RF-27. **Depende de**: T052, T053, T058
- [x] **T060** [P] Detalle: `US/pages/DetallePublicacionPage.tsx` (`/publicaciones/:id`; like, guardar, reportar, editar, borrar según permisos). **Spec**: HU-05, HU-03, HU-07, HU-09, HU-11, RF-26, CB-01. **Depende de**: T049, T050, T051, T044, T058
- [x] **T061** [P] Crear: `US/pages/CrearPublicacionPage.tsx` (`/publicaciones/nueva`). **Spec**: HU-01, RF-01 a RF-03. **Depende de**: T054, T058
- [x] **T062** [P] Editar propia: `US/pages/EditarPublicacionPage.tsx` (`/publicaciones/:id/editar`; 403 si es ajena). **Spec**: HU-02, RF-04, RF-06, RF-08. **Depende de**: T054, T058
- [x] **T063** [P] Mis publicaciones: `US/pages/MisPublicacionesPage.tsx` (`/mis-publicaciones`). **Spec**: HU-02, HU-03. **Depende de**: T048, T044, T058
- [x] **T064** [P] Mis carpetas: `US/pages/MisCarpetasPage.tsx` (`/carpetas`). **Spec**: HU-08, HU-10, RF-16, RF-20. **Depende de**: T055, T058
- [x] **T065** [P] Contenido de carpeta: `US/pages/CarpetaPage.tsx` (`/carpetas/:id`; vacía y "no disponible"). **Spec**: HU-09, RF-18, RF-19, CB-02, CB-05, CB-06. **Depende de**: T055, T058
- [x] **T066** Rutas de admin: `AD/App.tsx`, `AD/routes/index.tsx`, `AD/routes/RequireAdmin.tsx` (rechaza si el rol no es `ADMIN`), `AD/layouts/Layout.tsx`. **Spec**: RF-10b, RF-29, HU-13. **Res.**: A-15. **Depende de**: T035, T046
- [x] **T067** [P] Moderación: `AD/pages/ModeracionPage.tsx` (`/moderacion`). **Spec**: HU-13, RF-24. **Depende de**: T056, T066
- [x] **T068** [P] Detalle de reportada: `AD/pages/ModeracionDetallePage.tsx` (`/moderacion/:id`; borrar con confirmación; "ya eliminada"). **Spec**: HU-12, RF-07, CB-03, CB-08. **Res.**: A-1. **Depende de**: T057, T066

**Checkpoint F6**: se recorren las dos apps con MSW: explorar, detalle, crear/editar/borrar, like, guardar, reportar, carpetas y moderación.

---

## Fase 7 — Estados globales, errores, accesibilidad y performance

- [x] **T069** [P] Pantallas de estado global: `SH/components/EstadosGlobales.tsx` (no autenticado, 403, 404, error de red, listado vacío). **Spec**: RF-09, RF-10, CB-09. **Depende de**: T045
- [x] **T070** Manejo central de 401/403/404/red: `SH/hooks/manejadorErrores.ts`, `SH/components/LimiteDeErrores.tsx`, y conexión en `US/main.tsx` y `AD/main.tsx`. **Spec**: RF-09, CB-09. **Res.**: D-11. **Depende de**: T020, T069
- [x] **T071** [P] Conservar el borrador del formulario ante sesión expirada: `SH/hooks/useBorradorFormulario.ts`, integración en `US/components/FormularioPublicacion.tsx`. **Spec**: CB-09. **Res.**: sección 6. **Depende de**: T054
- [x] **T072** Accesibilidad: revisar teclado, foco visible, `aria-*` en modales y botones, texto alternativo (`SH/components/*`, `US/components/*`, `AD/components/*`). **Spec**: RNF-01. **Res.**: sección 5. **Depende de**: T059 a T068
- [x] **T073** Performance: code splitting por ruta, `staleTime`, lazy loading y chequeo del peso inicial en `frontend/apps/usuario/vite.config.ts` y `frontend/apps/admin/vite.config.ts`. **Spec**: RNF-02. **Res.**: D-05, sección 4 ("a definir"). **Depende de**: T059 a T068
- [x] **T074** Calidad: `typecheck` estricto sin `any` ni aserciones innecesarias (buscar con `grep` `: any`, ` as `, `!.`), `lint` y `build` limpios en las tres paquetes. **Spec**: RNF-04. **Depende de**: T072, T073

**Checkpoint F7**: 401/403/404/red se ven correctamente en ambas apps; revisión de accesibilidad sin hallazgos críticos; build sin avisos.

---

## Fase 8 — Tests de componentes y de páginas

Se escriben junto a las fases 5 y 6 (TDD) aunque aquí se agrupen.

**Componentes**
- [x] **T075** [P] `SH/components/ConfirmDialog.test.tsx` (foco, Escape, confirmar y cancelar). **Spec**: HU-03, RF-28. **Depende de**: T044
- [x] **T076** [P] `US/components/TarjetaPublicacion.test.tsx` (acciones por rol: autor, ajeno, admin sin "Editar" ajeno). **Spec**: RF-06 a RF-08, RF-14. **Depende de**: T048
- [x] **T077** [P] `US/components/BotonLike.test.tsx` (alternancia, contador inmediato, doble clic, no aparece en propia). **Spec**: RF-11 a RF-15, CB-07. **Depende de**: T049
- [x] **T078** [P] `US/components/ModalReportar.test.tsx` (motivo obligatorio, `OTRO` exige texto, "Ya reportada"). **Spec**: RF-21 a RF-23. **Depende de**: T051
- [x] **T079** [P] `US/components/ModalGuardar.test.tsx` (varias carpetas, quitar). **Spec**: RF-17, RF-18. **Depende de**: T050
- [x] **T080** [P] `US/components/FormularioPublicacion.test.tsx`, `US/components/Filtros.test.tsx`. **Spec**: RF-02, RF-27, CB-11. **Depende de**: T052, T054
- [x] **T081** [P] `AD/components/TablaReportadas.test.tsx`. **Spec**: RF-24. **Depende de**: T056

**Páginas (flujos principales)**
- [x] **T082** [P] `US/pages/GestionPublicacion.test.tsx`: crear, editar y borrar publicación con confirmación. **Spec**: HU-01 a HU-03. **Depende de**: T061, T062, T063
- [x] **T083** [P] `US/pages/Like.test.tsx`: dar y quitar like. **Spec**: HU-07. **Depende de**: T060
- [x] **T084** [P] `US/pages/GuardarEnCarpeta.test.tsx`. **Spec**: HU-09. **Depende de**: T060, T065
- [x] **T085** [P] `US/pages/Reportar.test.tsx`. **Spec**: HU-11. **Depende de**: T060
- [x] **T086** [P] `AD/pages/BorradoAdmin.test.tsx`: borrado por admin con confirmación. **Spec**: HU-12, RF-07. **Depende de**: T067, T068
- [x] **T087** [P] `US/pages/Explorar.test.tsx` (búsqueda, filtros, estado vacío), `US/pages/Carpetas.test.tsx` (crear, renombrar, eliminar, visibilidad). **Spec**: HU-06, HU-08, HU-10. **Depende de**: T059, T064

**Casos borde desde la UI**
- [x] **T088** [P] `US/pages/CarpetaBordes.test.tsx`: carpeta vacía; publicación eliminada dentro de una carpeta ("no disponible" con opción de quitarla). **Spec**: CB-02, CB-05, CB-06. **Res.**: A-2. **Depende de**: T065
- [x] **T089** [P] `US/pages/DetalleEliminada.test.tsx`: publicación eliminada mientras se la mira (404 al revalidar, mensaje claro, likes sin contar). **Spec**: CB-01, CB-03, CB-08. **Res.**: A-1, A-2. **Depende de**: T060
- [x] **T090** [P] `US/pages/AccionesOptimistas.test.tsx`: doble clic en like y error de red durante una acción optimista (reversión y mensaje). **Spec**: CB-07, RF-28. **Res.**: D-10, D-11. **Depende de**: T060
- [x] **T091** [P] `US/pages/ReporteDuplicado.test.tsx`: 409 y estado "Ya reportada". **Spec**: RF-23. **Depende de**: T060
- [x] **T092** [P] `US/pages/ErroresGlobales.test.tsx`: 401 (sesión expirada con borrador), 403, 404 y error de red. **Spec**: RF-09, CB-09. **Depende de**: T070, T071
- [ ] **T093** [P] `AD/routes/RequireAdmin.test.tsx`: un `USER` es rechazado. **Spec**: RF-10b. **Res.**: A-15. **Depende de**: T066
- [ ] **T094** [P] `frontend/tests/a11y.test.tsx`: chequeo automático de accesibilidad de modales y páginas clave. **Spec**: RNF-01. **Depende de**: T072

**Checkpoint F8**: toda la suite pasa con cobertura de las reglas de `data-model.md` §6, incluidos los casos borde.

---

## Fase 9 — Integración con la API real

Solo del lado del cliente. Requiere que alguien tenga la API Java disponible.

- [ ] **T095** Configuración de entorno: `frontend/apps/usuario/.env.example`, `frontend/apps/admin/.env.example`, `SH/services/config.ts` (`VITE_API_URL`, `VITE_USE_MOCKS`). **Spec**: RNF-05. **Res.**: quickstart. **Depende de**: T074
- [ ] **T096** Arranque condicional de MSW: `US/main.tsx`, `AD/main.tsx` (solo si `VITE_USE_MOCKS=true`). **Spec**: principio 4. **Depende de**: T095
- [ ] **T097** Contrastar el contrato con la API real y registrar diferencias en `Union/specs/002-inspiraciones-publicaciones/contracts/api-client.md`. **Spec**: todo el contrato. **Res.**: S-1 a S-5. **Depende de**: T095
- [ ] **T098** Ajustar servicios, tipos y handlers a las diferencias: `SH/services/*.ts`, `SH/domain/tipos.ts`, `frontend/tests/mocks/handlers/*.ts`. **Depende de**: T097
- [ ] **T099** Verificar 401/403 reales, sesión y rol, y que los permisos del backend coincidan con `permisos.ts`. **Spec**: RF-09, RF-10b, RNF-03. **Depende de**: T098
- [ ] **T100** Resolver los abiertos: topes de tamaño (S-2), orden del feed (A-12), motivos (A-13) y carpetas públicas (A-5), actualizando `research.md` y `data-model.md`. **Depende de**: T097

**Checkpoint F9**: las dos apps funcionan contra la API real con `VITE_USE_MOCKS=false`, y la suite con MSW sigue pasando.

---

## Fase 10 — Validación end-to-end (según `quickstart.md`)

- [ ] **T101** Como `USER`: crear, editar y borrar una publicación con confirmación. **Spec**: HU-01 a HU-03. **Depende de**: T099
- [ ] **T102** Like y quitar like a una ajena; comprobar que en la propia no aparece. **Spec**: HU-07. **Depende de**: T099
- [ ] **T103** Guardar en carpetas; abrir una carpeta vacía y una con una publicación no disponible. **Spec**: HU-08, HU-09, CB-02, CB-05. **Depende de**: T099
- [ ] **T104** Reportar y comprobar "Ya reportada". **Spec**: HU-11, RF-23. **Depende de**: T099
- [ ] **T105** Como `ADMIN`, en la app admin: ver reportadas y borrar con confirmación; verificar que no hay "Editar" en ajenas. **Spec**: HU-12, HU-13, RF-07, RF-08. **Depende de**: T099
- [ ] **T106** Con rol `USER` en la app admin: debe rechazar el acceso. **Spec**: RF-10b. **Depende de**: T099
- [ ] **T107** Pasada final: `typecheck`, `lint`, `test` y `build` limpios; actualizar `checklists/functional-quality.md`. **Spec**: RNF-04. **Depende de**: T101 a T106

**Checkpoint F10**: la verificación manual de `quickstart.md` está completa y todos los criterios de aceptación de HU-01 a HU-13 se cumplen.

---

## Dependencias y orden de ejecución

- Fases secuenciales: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 (los tests de la fase 8 se escriben junto a las 5 y 6).
- Dentro de una fase, las `[P]` se pueden hacer en paralelo.
- Los tests de cada capa (T012, T014, T019, tests de hooks y servicios) van antes de su implementación.

### Camino crítico

`T001 → T002 → T009 → T010 → T012 → T013 → T020 → T027 → T029 → T034 → T036 → T052/T053 → T059` (Explorar), y en paralelo `T037 → T054 → T061`, `T038 → T049 → T060`. Luego `T074 → T095 → T097 → T099 → T107`.

### MVP sugerido por historia prioritaria

| Entrega | Historias | Tareas |
|---|---|---|
| **MVP 1: ver contenido** | HU-04, HU-05, HU-06 | T001–T011, T018, T019–T023, T027, T029, T034–T036, T044–T045, T047–T048, T052–T053, T058–T060 |
| **MVP 2: publicar** | HU-01, HU-02, HU-03 | T012–T015, T037, T043, T046, T054, T061–T063, T082 |
| **MVP 3: moderar (P1)** | HU-12 | T026, T032, T042, T056–T057, T066–T068, T086 |
| **Segunda entrega (P2)** | HU-07, HU-08, HU-09, HU-11, HU-13 | T024, T025, T030, T031, T038–T041, T049–T051, T055, T064–T065, T067 |
| **Tercera entrega (P3)** | HU-10 | T039 (visibilidad), T055, T064 |

Esta agrupación sigue las prioridades de `spec.md`: P1 = HU-01 a HU-06 y HU-12.

## Resumen

- 107 tareas en 10 fases.
- Tareas con tests previos o a la par: permisos, validaciones, cliente HTTP, servicios y hooks.
- Casos borde cubiertos: T088 a T093.
- **Pendientes de decisión de producto** que afectan tareas: A-3, A-5, A-8, A-10, A-12, A-13 (ver T100) y la actualización de la constitution (conflictos C-1 a C-3 de `plan.md`).
