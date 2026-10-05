import { defineWorkspace } from "vitest/config";

const setupFiles = ["./tests/setup.ts"];

export default defineWorkspace([
  {
    test: {
      name: "shared",
      root: "./packages/shared",
      environment: "jsdom",
      globals: true,
      setupFiles: setupFiles.map((ruta) => new URL(ruta, import.meta.url).pathname),
      include: ["src/**/*.test.{ts,tsx}"],
    },
  },
  {
    test: {
      name: "usuario",
      root: "./apps/usuario",
      environment: "jsdom",
      globals: true,
      setupFiles: setupFiles.map((ruta) => new URL(ruta, import.meta.url).pathname),
      include: ["src/**/*.test.{ts,tsx}"],
    },
  },
  {
    test: {
      name: "admin",
      root: "./apps/admin",
      environment: "jsdom",
      globals: true,
      setupFiles: setupFiles.map((ruta) => new URL(ruta, import.meta.url).pathname),
      include: ["src/**/*.test.{ts,tsx}"],
    },
  },
  {
    test: {
      name: "transversales",
      root: "./tests",
      environment: "jsdom",
      globals: true,
      setupFiles: setupFiles.map((ruta) => new URL(ruta, import.meta.url).pathname),
      include: ["**/*.test.{ts,tsx}"],
      exclude: ["mocks/**"],
    },
  },
]);
