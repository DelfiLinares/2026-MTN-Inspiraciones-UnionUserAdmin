# Carpeta: application/dto

## Propósito

Objetos de Transferencia de Datos (DTOs): tipado de payloads de request/response y modelos intermedios de aplicación.

## DTOs (según tasks.md)

- `ResultadoValidacion.ts` — Resultado de validaciones con error y campo (T013)
- `ResultadoCarpetasPaginado.ts` — Respuesta paginada de carpetas (T014)
- `ActualizarPerfilPayload.ts` — Payload para actualización de perfil (T015)
- `SubirFotoPayload.ts` — Payload para upload de foto (T016)

Otros DTOs implícitos en tasks:
- `FiltroUsuarios.ts` — Parámetros de paginación
- `PaginaPublicaciones.ts` — Respuesta paginada de publicaciones

## Trazabilidad

- Tasks: T013, T014, T015, T016
- Usados por: Servicios de aplicación, componentes de presentación
- Alineados con: `contracts/openapi.yaml` schemas

## Notas

- DTOs son tipos puros (no métodos, no lógica)
- Mapean entre API REST y dominio interno
- No tienen comportamiento; solo transporte de datos
- Interfaces TypeScript (`interface` o `type`)
