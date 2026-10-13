import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "admin",
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
