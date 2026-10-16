# Carpeta: carpetas

## Propósito

Componentes React para la presentación y gestión de carpetas de posts guardados: listado, creación, renombrado, eliminación.

## Componentes (según tasks.md)

- `CarpetaList.tsx` — Lista de carpetas con paginación server-side (T024)
- `CreateCarpetaDialog.tsx` — Diálogo para crear nueva carpeta (T039)
- `RenameCarpetaDialog.tsx` — Diálogo para renombrar carpeta (T040)
- `ConfirmDeleteCarpetaDialog.tsx` — Diálogo de confirmación con advertencia (T041)

## Trazabilidad

- Historias de Usuario: HU-05, HU-06, HU-07, HU-08, HU-10
- Requisitos: RF-17..RF-27, RF-35..RF-42
- Clarificaciones: A3, A6, A7, A8, A9
- Tasks: T024, T036–T046, T056, T065, T067, T075, T081, T086, T091

## Notas

- Componentes de diálogo reutilizan `ConfirmacionAccionSensibleModal` de `shared/` (T065).
- La lógica de paginación se implementa en `CarpetaList` con apoyo de `CarpetaService` en `application/`.
- Mensajes de error centralizados en `carpetaErrorMessages.ts` en `shared/` (T067).
- El límite de 50 carpetas se valida en backend; la UI deshabilita el botón cuando se alcanza.
