# Plan de implementación (Frontend) — 002 Inspiraciones

**Rama**: `002-inspiraciones-publicaciones` | **Fecha**: 2026-10-05
**Spec**: `spec.md` | **Constitution**: `constitution.md`
**Alcance**: solo frontend. La API REST Java es externa (ver `contracts/api-client.md`). No hay código en esta fase.

## 1. Resumen

Dos aplicaciones React (usuario y administración/moderación) dentro de `frontend/`, con un paquete compartido de tipos, permisos y cliente HTTP. Las apps consumen la API REST y no contienen lógica de backend.

## 2. Contexto técnico

| Aspecto | Decisión |
|---|---|
| Lenguaje | TypeScript en modo estricto |
| UI | React + Vite |
| Rutas | React Router |
| Estado de servidor | TanStack Query (ver `research.md` D-02) |
| Estilos | CSS Modules + variables CSS globales, sin librerías de UI |
| HTTP | `fetch` encapsulado en una capa de servicios |
| Tests | Vitest + React Testing Library + MSW |
| Backend | Fuera de alcance |

## 3. Verificación contra la constitution

| Principio | Cumplimiento |
|---|---|
| 1 Spec manda | Cada pantalla y regla referencia HU/RF (sección 8). |
| 2 OO / sin anemia | Reglas en el dominio (`domain/`) como funciones puras y entidades con comportamiento. Ver `data-model.md`. |
| 3-4 API externa, sin backend | MSW solo en tests y desarrollo; no es un backend. |
| 5 Capas | domain → services → hooks → pages/components. |
| 6 Dos apps | `apps/usuario` y `apps/admin` separadas. |
| 8 Tests | Sección 7. |
| 9 Seguridad | La UI solo oculta; 401/403 se manejan de forma central. |
| 10-11 Escala/usabilidad | Paginación, lazy loading, filtros por consulta. |
| 13 Confirmación | Diálogo reutilizable de confirmación. |
| 14 Analytics | Sin cálculos en cliente; se usan los datos de la API. |

**Conflictos con la constitution (a resolver, ver `research.md` sección 6):**
- C-1: la constitution dice que el admin edita publicaciones ajenas; spec RF-08 lo prohíbe. **Se sigue la spec.**
- C-2: la constitution incluye comentarios, baneo y promoción de usuarios, y `TUTORIAL`/`DISTANCIA`; la spec los excluye. **Se sigue la spec.**
- C-3: el principio 6 dice que el admin hace solo funciones administrativas; la spec lo define como usuario con extras. **Plan:** la app admin solo modera; el admin usa la app de usuario para publicar, dar like, etc.

## 4. Estructura del proyecto

```text
frontend/
├── package.json                 # workspaces
├── tsconfig.base.json           # strict: true
├── packages/
│   └── shared/
│       └── src/
│           ├── domain/          # tipos, enums, permisos (funciones puras), validaciones
│           ├── services/        # httpClient, errores, servicios por recurso
│           ├── hooks/           # casos de uso con TanStack Query
│           ├── components/      # UI común: ConfirmDialog, Estados, Skeleton
│           └── utils/           # helpers puros (fechas, formatos)
├── apps/
│   ├── usuario/
│   │   └── src/
│   │       ├── pages/           # Explorar, Detalle, Crear, Editar, MisPublicaciones, MisCarpetas, Carpeta
│   │       ├── components/      # TarjetaPublicacion, BotonLike, ModalReportar, ModalGuardar, Filtros, Grilla
│   │       ├── routes/
│   │       └── styles/
│   └── admin/
│       └── src/
│           ├── pages/           # Moderacion (reportadas), Detalle de reportada
│           ├── components/      # TablaReportadas, AccionPeligrosa
│           ├── routes/          # RequireAdmin
│           └── styles/
└── tests/
    ├── mocks/                   # handlers MSW
    └── setup.ts
```

Regla: componentes sin `fetch` ni reglas de negocio; usan hooks, que usan servicios. `any` y aserciones de tipo están prohibidos salvo justificación.

## 5. Rutas

**App usuario**

| Ruta | Pantalla | Cubre |
|---|---|---|
| `/` | Explorar: grilla, búsqueda, filtros | HU-04, HU-06, RF-25, RF-27 |
| `/publicaciones/:id` | Detalle con acciones por permisos | HU-05, HU-07, HU-09, HU-11, RF-26 |
| `/publicaciones/nueva` | Crear | HU-01, RF-01 a RF-03 |
| `/publicaciones/:id/editar` | Editar propia | HU-02, RF-04, RF-06 |
| `/mis-publicaciones` | Listado propio con editar/borrar | HU-02, HU-03 |
| `/carpetas` | Crear, renombrar, eliminar carpetas | HU-08, RF-16 |
| `/carpetas/:id` | Contenido; vacía; "no disponible" | HU-09, RF-18, RF-19, CB-02, CB-05 |
| Modales | Guardar en carpetas, Reportar, Confirmar borrado | HU-09, HU-11, HU-03, RF-28 |
| Estados globales | 401, 403, 404, error de red, vacío | RF-09, RF-10, CB-09 |

**App admin**

| Ruta | Pantalla | Cubre |
|---|---|---|
| `/moderacion` | Listado de publicaciones reportadas (motivos, cantidad) | HU-13, RF-24 |
| `/moderacion/:id` | Detalle y borrar con confirmación diferenciada | HU-12, RF-07, RF-28 |

Cada ruta usa carga diferida (`React.lazy`) para dividir el código por ruta.

## 6. Estrategia de estado

- **Servidor** (TanStack Query): claves por recurso (`publicaciones`, `carpetas`, `reportadas`, `sesion`).
- **Optimista** para like y guardado: actualización inmediata, reversión y mensaje si falla; el doble clic se evita con `isPending` y la idempotencia del contrato.
- **Invalidación**: crear/editar/borrar invalida listados y detalle; al borrar un detalle abierto se muestra "no disponible" (CB-01, CB-03).
- **Sesión**: `GET /sesion` entrega usuario y rol; una única fuente de verdad en un proveedor; la app admin rechaza si el rol no es `ADMIN`.
- **Errores**: un único manejador HTTP (401 → login/sesión expirada, 403 → pantalla sin permiso, 404, red con reintento acotado para GET y sin reintento para mutaciones) con mensajes en español.
- **UI local**: `useState` para formularios y modales.

## 7. Estrategia de testing

| Nivel | Qué | Herramientas |
|---|---|---|
| Unitario | Permisos (`puedeEditar`, `puedeBorrar`, `puedeDarLike`, `puedeGuardar`, `puedeReportar`) y validaciones (formato, tamaño, motivo, nombre de carpeta) | Vitest |
| Hooks y servicios | Contrato, errores, optimista y reversión | Vitest + MSW |
| Componentes | TarjetaPublicacion, BotonLike, ModalReportar, ModalGuardar, ConfirmDialog | RTL |
| Páginas | Crear/editar/borrar, like, guardar, reportar, borrado por admin | RTL + MSW |
| Bordes | Carpeta vacía, publicación eliminada en carpeta o mientras se mira, doble clic en like, reporte duplicado, error de red optimista | RTL + MSW |

Matriz de trazabilidad regla → test en `data-model.md` sección 5.

## 8. Trazabilidad con spec.md

| Requisito | Dónde se cubre |
|---|---|
| RF-01 a RF-05 | Pages Crear/Editar/MisPublicaciones; `usePublicaciones`; permisos |
| RF-06 a RF-10b | `domain/permisos`; manejador 401/403; `RequireAdmin` |
| RF-11 a RF-15 | `useLike`; `BotonLike`; `puedeDarLike` |
| RF-16 a RF-20 | Pages Carpetas; `useCarpetas`; `ModalGuardar` |
| RF-21 a RF-24 | `ModalReportar`; `useReporte`; app admin Moderación |
| RF-25 a RF-27 | Explorar; `useFeed`; `Filtros` |
| RF-28 | `ConfirmDialog`; notificaciones de éxito/error |
| RF-29 | Estructura de dos apps |
| RNF-01 a RNF-05 | `research.md` secciones 4 y 5 |

## 9. Riesgos y dependencias

- La API aún no existe: el contrato es una propuesta a validar por el equipo de backend.
- Decisiones abiertas en `research.md` sección 6.
- Los objetivos de performance (RNF-02) están "a definir" en la spec; se propone un valor provisional.

## 10. Fases siguientes

1. `/speckit.checklist` sobre el plan.
2. `/speckit.tasks`: desglose por historias de usuario.
3. `/speckit.implement` solo cuando se autorice código.
