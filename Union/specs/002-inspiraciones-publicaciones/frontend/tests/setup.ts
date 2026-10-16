import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Desmonta los componentes renderizados después de cada test.
afterEach(() => {
  cleanup();
});

// Nota: el servidor MSW (`frontend/tests/mocks/server.ts`) se crea en T027.
// Cuando exista, se conecta aquí con listen() en beforeAll, resetHandlers() en afterEach
// y close() en afterAll.
