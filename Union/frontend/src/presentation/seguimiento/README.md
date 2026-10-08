# Carpeta: seguimiento

## Propósito

Componentes React para la gestión de seguimiento: botón de seguir/dejar de seguir con optimistic updates y manejo de errores.

## Componentes (según tasks.md)

- `FollowButton.tsx` — Botón de seguimiento con estado visual y optimistic update (T026)

## Trazabilidad

- Historias de Usuario: HU-04
- Requisitos: RF-13, RF-35..RF-42
- Clarificaciones: A4
- Tasks: T012, T026, T058–T064, T065, T078, T083, T085, T091

## Notas

- El componente implementa optimistic update: cambia estado inmediatamente y revierte ante error (A4).
- Integrado en `PerfilAjeno.tsx`; no se muestra en perfil propio.
- Servicios de seguimiento en `SeguimientoService` (`src/application/`).
- Estado de seguimiento inicial proviene de `Usuario.siguiendoPorUsuarioActual` en el contrato.
