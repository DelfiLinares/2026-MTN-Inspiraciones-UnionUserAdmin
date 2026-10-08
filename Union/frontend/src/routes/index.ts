/**
 * `routes/index.ts`: Exportaciones centralizadas del módulo de rutas.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", routes/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T017, T018)
 *
 * Exporta:
 * - `AppRoutes`: Árbol de rutas del frontend (SPA), incluye:
 *   - Rutas públicas: `/login`, `/registro`
 *   - Rutas protegidas: `/feed`, `/perfil`, `/perfil/:id` (T017), `/editar-perfil`
 *   - Redirecciones por defecto: `/` → `/feed`, `/*` → `/feed`
 * - `RutaProtegida`: Guard de rutas que requiere sesión activa (rechaza ADMIN, RF-78)
 *
 * Uso típico:
 * ```tsx
 * import { AppRoutes, RutaProtegida } from 'src/routes'
 * ```
 */

export * from './RutaProtegida'
export * from './AppRoutes'
