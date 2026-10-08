# Carpeta: publicaciones

## Propósito

Componentes React para la presentación y gestión de publicaciones propias: listado, edición, eliminación, guardar en carpetas, quitar de carpetas.

## Componentes (según tasks.md)

- `PublicacionList.tsx` — Lista de publicaciones de un perfil (T025)
- `EditPostForm.tsx` — Formulario para editar texto de publicación (T050)
- `ConfirmDeletePostDialog.tsx` — Diálogo de confirmación para eliminar (T051)
- `SavePostToCarpetaDialog.tsx` — Diálogo para guardar post en carpeta (T052)

## Trazabilidad

- Historias de Usuario: HU-09, HU-10, HU-11, HU-12, HU-13
- Requisitos: RF-28..RF-34, RF-35..RF-42
- Clarificaciones: A5, A8
- Tasks: T025, T047–T057, T065, T068, T072, T075, T082, T087, T091

## Notas

- `EditPostForm` permite editar solo texto; la imagen es read-only (A5).
- `SavePostToCarpetaDialog` implementa guardado idempotente (A8).
- Componentes de diálogo reutilizan `ConfirmacionAccionSensibleModal` de `shared/` (T065).
- Mensajes de error centralizados en `publicacionErrorMessages.ts` en `shared/` (T068).
- Ningún componente aquí implementa creación de publicaciones (RF-33).
