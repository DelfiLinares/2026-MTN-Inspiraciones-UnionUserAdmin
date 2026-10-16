import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/shared/vitest.config.ts",
  "apps/usuario/vitest.config.ts",
  "apps/admin/vitest.config.ts",
]);
