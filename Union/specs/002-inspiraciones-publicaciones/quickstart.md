# Quickstart (Frontend) — 002 Inspiraciones

> Guía prevista. El proyecto `frontend/` aún no se crea; los comandos aplican cuando exista (fase de implementación).

## Requisitos

- Node.js 20 o superior y npm.
- No hace falta backend: la API se simula con MSW.

## Instalación

1. Entrar a `frontend/`.
2. Instalar dependencias del workspace con `npm install`.

## Ejecución

| Objetivo | Comando previsto |
|---|---|
| App de usuario | `npm run dev -w apps/usuario` |
| App de administración | `npm run dev -w apps/admin` |
| Build | `npm run build` |
| Chequeo de tipos | `npm run typecheck` |

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API REST Java | `/api/v1` |
| `VITE_USE_MOCKS` | `true` activa MSW en desarrollo | `true` hasta conectar el backend |

Para conectar el backend real: poner `VITE_USE_MOCKS=false` y `VITE_API_URL` apuntando a la API (en una iteración futura).

## Simulación con MSW

- Los handlers viven en `frontend/tests/mocks/` y siguen `contracts/api-client.md`.
- Escenarios disponibles: usuario normal, administrador, no autenticado (401), sin permiso (403), no encontrado (404), error de red, carpeta vacía, publicación eliminada en carpeta, reporte duplicado (409).
- El rol simulado se cambia con una variable (`VITE_MOCK_ROL=USER|ADMIN`).

## Tests

| Objetivo | Comando previsto |
|---|---|
| Todos | `npm test` |
| Modo watch | `npm run test:watch` |
| Cobertura | `npm run test:coverage` |

Orden recomendado: permisos y validaciones, hooks y servicios, componentes, páginas.

## Verificación manual (cuando exista la implementación)

1. Como `USER`: crear una publicación, editarla, borrarla con confirmación.
2. Dar like a una ajena, quitarlo, y comprobar que en la propia no aparece el botón.
3. Guardar en carpetas, abrir una carpeta vacía y una con publicación no disponible.
4. Reportar una publicación y comprobar el estado "Ya reportada".
5. Como `ADMIN`: en la app admin, ver reportadas y borrar con confirmación; verificar que no hay "Editar" en ajenas.
6. Con rol `USER` en la app admin: debe rechazar el acceso.

## Referencias

`plan.md`, `research.md`, `data-model.md`, `contracts/api-client.md`, `spec.md`.
