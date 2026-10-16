// Configuración de Vite de la app admin.
// Performance (T073, RNF-02, D-05): separa las dependencias estables en chunks propios (mejor caché)
// y avisa si algún chunk supera el presupuesto provisional (RNF-02 está "a definir" en la spec).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** Presupuesto provisional por chunk, en kB sin comprimir. Ajustar cuando se defina RNF-02. */
const PRESUPUESTO_CHUNK_KB = 300;

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  build: {
    chunkSizeWarningLimit: PRESUPUESTO_CHUNK_KB,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "vendor-react";
          if (/[\\/]node_modules[\\/](react-router|react-router-dom|@remix-run)[\\/]/.test(id)) {
            return "vendor-router";
          }
          if (/[\\/]node_modules[\\/]@tanstack[\\/]/.test(id)) return "vendor-query";
          return undefined;
        },
      },
    },
  },
});
