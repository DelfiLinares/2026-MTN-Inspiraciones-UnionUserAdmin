/**
 * `tests/setupTests.ts`: Configuración global del runner de tests (Vitest).
 *
 * Fuente de verdad:
 * - Union/specs/002-frontend-admin/tasks.md (T005)
 * - Union/specs/002-frontend-admin/plan.md → Technical Context (Vitest/Jest + Testing Library)
 *
 * Registra los matchers de `@testing-library/jest-dom` (p. ej. `toBeInTheDocument`) para que
 * estén disponibles en todos los tests de `tests/domain`, `tests/application`,
 * `tests/presentation` y `tests/integration`.
 */
import '@testing-library/jest-dom/vitest'
