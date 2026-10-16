/**
 * `vitest.config.ts`: Configuración del runner de tests para `frontend/`.
 *
 * Fuente de verdad:
 * - Union/specs/002-frontend-admin/tasks.md (T005)
 * - Union/specs/002-frontend-admin/plan.md → Technical Context, RNF-09 de
 *   Union/specs/002-frontend-admin/spec.md
 *
 * Habilita explícitamente las 4 carpetas de tests exigidas por RNF-09:
 * `tests/domain`, `tests/application`, `tests/presentation`, `tests/integration`.
 */
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setupTests.ts'],
    include: [
      'tests/domain/**/*.test.{ts,tsx}',
      'tests/application/**/*.test.{ts,tsx}',
      'tests/presentation/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}',
      // `tests/services` es la suite preexistente del frontend de usuario (001-plataforma-unificada),
      // anterior a la estructura de 002-frontend-admin. Se mantiene incluida para no romper la
      // cobertura ya existente; no forma parte de las 4 carpetas exigidas por RNF-09.
      'tests/services/**/*.test.{ts,tsx}',
    ],
  },
})
