# Research — 002 Inspiraciones (Frontend)

## 1. Decisiones técnicas

| ID | Decisión | Alternativas | Justificación |
|---|---|---|---|
| D-01 | React + Vite + TypeScript estricto | Next.js, CRA | SPA suficiente, sin SSR; Vite es rápido. |
| D-02 | TanStack Query para estado de servidor | Redux Toolkit Query, SWR, estado manual | Caché, revalidación, paginación infinita y actualización optimista integradas; liviano. |
| D-03 | CSS Modules + variables CSS globales | Tailwind, MUI | Sin dependencias pesadas, estilos acotados por componente. |
| D-04 | `fetch` encapsulado | axios | Sin dependencia extra; un único `httpClient` centraliza errores. |
| D-05 | React Router con `React.lazy` por ruta | TanStack Router | Estándar y suficiente. |
| D-06 | Vitest + RTL + MSW | Jest, Cypress | Integrado con Vite; MSW simula la API sin crear un backend (principio 4). |
| D-07 | Monorepo con workspaces: `apps/usuario`, `apps/admin`, `packages/shared` | Dos repos duplicados | Cumple el principio 6 y evita duplicar permisos y tipos. |
| D-08 | Paginación por scroll infinito, **20 ítems por página** | Páginas numeradas | Grilla tipo tablero; el tamaño acotado es un valor propuesto. |
| D-09 | Permisos como funciones puras en `domain/` | Condiciones en componentes | Sin duplicación y testeable (principios 2 y 8). |
| D-10 | Actualización optimista en like y guardado | Esperar respuesta | Respuesta percibida inmediata, con reversión si falla. |
| D-11 | Reintentos: 2 en GET con red caída; 0 en mutaciones | Reintentar todo | Evita duplicar acciones. |

## 2. Supuestos de la API (a confirmar con backend)

- S-1 Sesión por token o cookie; `GET /sesion` devuelve `{id, nombre, rol}`.
- S-2 Los topes de tamaño de archivo los informa la API (`GET /configuracion`) o el rechazo con 413; hasta entonces el frontend usa valores provisionales.
- S-3 Las mutaciones de like y guardado son idempotentes.
- S-4 El backend impone permisos y responde 401/403.
- S-5 Los likes y la retención de reportes (4 años) son responsabilidad del backend.

## 3. Rol del admin (aclaración de arquitectura)

El administrador es un usuario con opciones extra. Para respetar el principio 6, las funciones de usuario (publicar, like, carpetas, reportar) viven en la app de usuario, y la app admin solo contiene moderación. Un admin usa ambas apps con la misma sesión. En la app de usuario, las reglas de permisos son iguales para el admin, salvo que ve "Borrar" en publicaciones ajenas (RF-07) y nunca "Editar" ajenas (RF-08).

## 4. Objetivos de performance (RNF-02, valores propuestos; la spec los deja "a definir")

| Métrica | Objetivo propuesto | Estado |
|---|---|---|
| Render inicial del listado (con datos en caché de red local) | < 2 s en 4G | a definir |
| Respuesta percibida de like y guardado | < 100 ms (optimista) | a definir |
| Respuesta de acciones no optimistas | < 1 s | a definir |
| Volumen de referencia | 10.000 usuarios, 500.000 publicaciones | a definir |
| Peso inicial JS por ruta | < 200 KB gzip | propuesto |

Técnicas: lazy loading de imágenes, skeletons, code splitting por ruta, caché con `staleTime` de 30 s en listados y revalidación al reenfocar.

## 5. Accesibilidad y usabilidad

- Navegación por teclado y foco visible.
- Modales con `role="dialog"`, `aria-modal`, `aria-labelledby`, foco atrapado y cierre con Escape.
- Botones de acción con `aria-label` y `aria-pressed` (like).
- Texto alternativo en imágenes (el título de la publicación si no hay descripción).
- Mobile first con grilla responsive.
- Mensajes en español, consistentes: éxito, error y confirmación.
- Acciones destructivas en color distintivo, separadas de las de consulta (principio 12).

## 6. Casos borde y ambigüedades → comportamiento de la UI

| Ref. | Comportamiento actual de la UI | Falta confirmar |
|---|---|---|
| A-1 / CB-03 Reportes al borrar | Si el admin abre una reportada ya borrada: "Publicación ya eliminada" y desaparece de la lista | Cómo la API marca el reporte "resuelto" |
| A-2 / CB-01, CB-02 Borrado lógico | Likes no cuentan; en carpetas "publicación no disponible" con botón quitar | Que la API devuelva el marcador `estado: ELIMINADA` |
| A-3 Notificación al autor | No se muestra ni se envía | Decisión de producto |
| A-4 Admin publica y da like | Mismas reglas que el usuario en la app de usuario | — (resuelta) |
| A-5 Carpetas públicas | Interruptor privada/pública; visibilidad a terceros no se implementa en esta fase | Quién las ve y cómo se descubren |
| A-6 Límites | El frontend no impone límites; muestra el error de la API | Valores del backend |
| A-7 Nombre de carpeta | Validación provisional: 1 a 50 caracteres, no vacío | Unicidad |
| A-8 Edición de reportada | La UI no hace nada especial | Si se reinician los reportes |
| A-10 Filtros | Texto, categoría/etiquetas y tipo de contenido (sin distancia) | Lista final |
| A-11 Tipos y tamaño | png, jpeg, mp4, avi, mp3; tamaño según S-2 | `TUTORIAL`; topes reales |
| A-12 Feed | Más recientes primero; el orden lo da la API | Criterio definitivo |
| A-13 Motivos de reporte | Provisional: spam, contenido inapropiado, plagio, otro (exige texto); texto libre hasta 500 caracteres | Lista final |
| A-14 Constitution vs spec | Se sigue la spec | Actualizar la constitution |
| CB-07 Doble clic | Botón deshabilitado mientras la mutación está pendiente | — |
| CB-09 Sesión expirada | Redirección al inicio de sesión conservando el borrador del formulario | Mecanismo de login (fuera de alcance) |
| Reporte duplicado | Botón en estado "Ya reportada" (`reportadaPorMi`); 409 se trata igual | — |

## 6b. Decisión pendiente sobre inconsistencias de la constitution

Ver `plan.md` sección 3 (C-1 a C-3). Se recomienda actualizar la constitution antes de `/speckit.tasks`.

## 7. Riesgos

- Contrato de API no validado.
- Subida de archivos grandes (progreso y cancelación): decisión pendiente; se propone `multipart/form-data` con indicador de progreso.
- Autenticación fuera de alcance: se asume sesión ya iniciada.
