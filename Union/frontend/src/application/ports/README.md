# Carpeta: application/ports

## Propósito

Contratos (interfaces TypeScript) que definen cómo los servicios de aplicación acceden a datos y servicios externos, sin depender de detalles de implementación.

## Puertos (según tasks.md)

- `UsuarioPerfilRepository.ts` — Contrato para obtener/editar perfil, subir foto (T029)
- `CarpetaRepository.ts` — Contrato para CRUD de carpetas y operaciones de guardado (T036)
- `PublicacionRepository.ts` — Contrato para listar, editar, eliminar publicaciones (T047)
- `SeguimientoRepository.ts` — Contrato para toggle de seguimiento (T058)

## Trazabilidad

- Tasks: T029, T036, T047, T058
- Servicios que usan estos puertos: `UsuarioPerfilService`, `CarpetaService`, `PublicacionService`, `SeguimientoService`

## Notas

- Cada puerto define una interfaz con métodos puros (sin lógica)
- Las implementaciones (adaptadores HTTP) viven en `src/services/` o `src/infrastructure/`
- Permiten testing sin backend real (inyección de dependencias)
- Arquitectura limpia: aplicación nunca conoce detalles de HTTP/BD
