/**
 * Configuración de ESLint para `frontend/`.
 *
 * Fuente de verdad:
 * - Union/specs/002-frontend-admin/tasks.md (T004)
 * - Union/specs/002-frontend-admin/plan.md → Technical Context, Principio V de
 *   Union/.specify/memory/constitution.md ("Separación de responsabilidades por capa")
 *
 * Regla clave (T004): prohibir el uso de `fetch` fuera de `src/infrastructure/`, para que
 * ningún componente de `presentation/`, `domain/` o `application/` invoque la red directamente.
 */
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: { version: 'detect' },
  },
  ignorePatterns: ['dist', 'node_modules', 'coverage', '*.config.*', '*.tsbuildinfo'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  overrides: [
    {
      // Principio V: toda invocación directa a `fetch` debe vivir en `src/infrastructure/`.
      files: ['src/**/*.{ts,tsx}'],
      excludedFiles: ['src/infrastructure/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-globals': [
          'error',
          {
            name: 'fetch',
            message:
              'No se permite invocar `fetch` fuera de `src/infrastructure/` (Principio V de la constitución). ' +
              'Usá el cliente HTTP encapsulado (`src/infrastructure/httpClient.ts` / `httpClientAdmin.ts`).',
          },
        ],
      },
    },
  ],
}
