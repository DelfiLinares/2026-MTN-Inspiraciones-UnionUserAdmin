// Claves de consulta (Query Keys) para TanStack Query (T034).
// Estandariza la estructura de claves de caché por recurso del frontend:
// - sesion: ["sesion"]
// - configuracion: ["configuracion"]
// - publicaciones: ["publicaciones", { ...filtros }]
// - misPublicaciones: ["publicaciones", "me", { cursor, limite }]
// - publicacionDetalle: ["publicaciones", id]
// - carpetas: ["carpetas"]
// - carpetaContenido: ["carpetas", id, "publicaciones", { cursor, limite }]
// - carpetasDePublicacion: ["publicaciones", id, "carpetas"]
// - moderacionReportadas: ["moderacion", "reportadas", { cursor, limite }]
// - moderacionReportadaDetalle: ["moderacion", "reportadas", id]
// Spec: RNF-02. Res.: D-02, sección 6.

import type { TipoContenido } from "../domain/enums";

export interface FiltrosPublicacionesClave {
  readonly q?: string;
  readonly etiqueta?: string;
  readonly categoria?: string;
  readonly tipo?: TipoContenido;
}

export interface PaginacionClave {
  readonly cursor?: string;
  readonly limite?: number;
}

export const clavesConsulta = {
  sesion: () => ["sesion"] as const,
  configuracion: () => ["configuracion"] as const,

  publicaciones: {
    todas: () => ["publicaciones"] as const,
    listado: (filtros?: FiltrosPublicacionesClave) =>
      ["publicaciones", "listado", filtros ?? {}] as const,
    propias: (paginacion?: PaginacionClave) =>
      ["publicaciones", "me", paginacion ?? {}] as const,
    detalle: (id: string) => ["publicaciones", "detalle", id] as const,
    carpetas: (id: string) => ["publicaciones", id, "carpetas"] as const,
  },

  carpetas: {
    todas: () => ["carpetas"] as const,
    listado: () => ["carpetas", "listado"] as const,
    contenido: (id: string, paginacion?: PaginacionClave) =>
      ["carpetas", id, "publicaciones", paginacion ?? {}] as const,
  },

  moderacion: {
    todas: () => ["moderacion"] as const,
    reportadas: (paginacion?: PaginacionClave) =>
      ["moderacion", "reportadas", paginacion ?? {}] as const,
    detalle: (id: string) => ["moderacion", "reportadas", "detalle", id] as const,
  },
} as const;
