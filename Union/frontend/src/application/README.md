# Carpeta: application

## Propósito

Capa de aplicación: servicios de casos de uso, puertos (interfaces), y objetos de transferencia de datos (DTOs).

## Subcarpetas

- `ports/` — Contratos/interfaces para acceso a datos y servicios externos
- `dto/` — Objetos de transferencia de datos (request/response)

## Servicios (según tasks.md)

- `UsuarioPerfilService.ts` — Casos de uso HU-01/HU-02/HU-03 (T030)
- `CarpetaService.ts` — Casos de uso HU-05..HU-10 (T037)
- `PublicacionService.ts` — Casos de uso HU-09..HU-13 (T048)
- `SeguimientoService.ts` — Casos de uso HU-04 (T059)

## Trazabilidad

- Tasks: T013–T016 (DTOs), T029–T037, T047–T059
- Historias: HU-01..HU-13
- Requisitos: RF-01..RF-49

## Notas

- Los servicios orquestan lógica de dominio (en `src/domain/`) con puertos
- Nunca invocan presentación directamente
- Error handling y validaciones de servicios viven aquí
- No persisten datos (eso es responsabilidad de puertos/adaptadores)
