# Carpeta: perfil

## Propósito

Componentes React para la presentación de pantallas de perfil (propio y ajeno), edición de datos de perfil, y cambio de foto de perfil.

## Componentes (según tasks.md)

- `PerfilPage.tsx` — Contenedor root que decide entre perfil propio vs ajeno (T019)
- `PerfilPropio.tsx` — Vista de perfil propio con acciones de edición (T020)
- `PerfilAjeno.tsx` — Vista de perfil ajeno con opción de seguir (T021)
- `EditarPerfilForm.tsx` — Formulario de edición de datos (T022)
- `PhotoUploadField.tsx` — Componente de subida de foto (T023)
- `ProfileNotFoundView.tsx` — Vista de perfil no disponible / baneado / eliminado (T027)

## Trazabilidad

- Historias de Usuario: HU-01, HU-02, HU-03
- Requisitos: RF-01..RF-16, RF-35..RF-42
- Clarificaciones: A1, A2, A10
- Tasks: T019–T028, T032–T035, T046, T057, T064, T066, T074, T091

## Notas

- Estructura organizada por funcionalidad (perfil), no por tipo de componente.
- Los diálogos/modales de edición viven aquí; los compartidos viven en `shared/`.
- La lógica de servicios y puertos vive en `src/application/`.
- Las validaciones de dominio viven en `src/domain/`.
