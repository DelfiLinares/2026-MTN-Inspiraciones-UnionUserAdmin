# Quickstart — 007 Búsqueda y Descubrimiento

Guía para validar el módulo una vez implementado. Aún no hay código: esta guía describe el flujo previsto.

## Requisitos
- Node y dependencias de `Union/frontend` instaladas.
- Sin backend: se usa el adaptador de datos de ejemplo. Se elige con la variable `VITE_BUSQUEDA_REPOSITORIO` (`ejemplo` por defecto | `http`), leída solo en `infrastructure/config.ts`.

## Ejecutar
1. `cd Union/frontend`
2. `npm install`
3. `npm run dev` y abrir la ruta de la página de búsqueda (definida en tasks).
4. Tests: `npm test` (Vitest).

## Escenarios de validación manual
1. **FYP**: al entrar con barra vacía se ven tarjetas; al bajar se piden más páginas (de 20) hasta que no haya más.
2. **Búsqueda**: escribir ≥ 2 caracteres; tras ~400 ms aparecen resultados. Con 1 carácter no se dispara. Espacios extra se normalizan.
3. **Borrar texto**: un solo paso vuelve al FYP.
4. **Filtros**: aplicar varios; ver chips activos; quitar uno; "Limpiar todos". Comprobar OR dentro de un tipo y AND entre tipos.
5. **Distancia**: sin permiso de ubicación el filtro está deshabilitado con aviso.
6. **Reinicio**: cambiar texto o filtros vuelve al inicio de la lista con paginación reiniciada.
7. **Carga concurrente**: scroll rápido no dispara cargas duplicadas ni tras el fin de resultados.
8. **Respuestas obsoletas**: escribir rápido; solo se muestran resultados del último texto.
9. **Estados**: esqueletos al cargar; "sin resultados" con acción limpiar filtros; error con Reintentar (simular con el adaptador de ejemplo).
10. **Errores de autorización**: 401 → login; 403 → aviso sin romper la pantalla (simulados en el adaptador).
11. **URL**: texto y filtros en la URL; recargar o compartir restaura; atrás/adelante funciona; al volver del detalle se conserva la posición.
12. **Accesibilidad**: operar todo con teclado; etiquetas presentes; foco visible.

## Cambio al backend real (otra persona, próxima iteración)
1. Implementar la API según `contracts/openapi.yaml`.
2. Cambiar en el punto único de composición el repositorio de ejemplo por el cliente HTTP.
3. No debe requerirse ningún cambio en dominio, aplicación ni componentes. Si se requiere, es un defecto del diseño.
4. Resolver los puntos `x-pending` del contrato antes de integrar.

## Fuera de alcance
Backend, mocks de servidor, DB, admin, detalle de publicación, likes/comentarios/guardado.
