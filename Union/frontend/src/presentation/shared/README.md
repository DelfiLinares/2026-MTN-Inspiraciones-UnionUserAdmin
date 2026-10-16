# Carpeta: shared

## Propósito

Componentes React compartidos entre las funcionalidades del módulo de perfil: diálogos de confirmación, mensajes de error, vistas generales.

## Componentes (según tasks.md)

- `ConfirmacionAccionSensibleModal.tsx` — Modal reutilizable para confirmaciones de acciones destructivas (T065)
- `perfilErrorMessages.ts` — Centralización de mensajes de error de perfil (T066)
- `carpetaErrorMessages.ts` — Centralización de mensajes de error de carpetas (T067)
- `publicacionErrorMessages.ts` — Centralización de mensajes de error de publicaciones (T068)

## Trazabilidad

- Tasks: T006, T065–T068, T074, T075, T091
- Compartido por: `perfil/`, `carpetas/`, `publicaciones/`, `seguimiento/`

## Notas

- `ConfirmacionAccionSensibleModal` se usa en T069–T073 para cambio de username, renombrado, eliminación, edición y eliminación de posts.
- Todos los mensajes de error se centralizan aquí para mantener consistencia de tono y formato.
- Estos componentes son totalmente agnósticos de lógica de negocio; solo presentan información.
- No incluye componentes específicos de administración (esos están en otros módulos).
