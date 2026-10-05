// Tipos del dominio del frontend (data-model.md §2 y §3).
// Solo tipos: sin lógica, sin React y sin red.

import type {
  EstadoPublicacion,
  FormatoArchivo,
  MotivoReporte,
  RolUsuario,
  TipoContenido,
  VisibilidadCarpeta,
} from "./enums";

export interface UsuarioActual {
  readonly id: string;
  readonly nombre: string;
  readonly rol: RolUsuario;
}

export interface AutorResumen {
  readonly id: string;
  readonly nombre: string;
}

export interface Publicacion {
  readonly id: string;
  readonly titulo: string;
  readonly descripcion: string;
  /** URL del contenido principal. */
  readonly contenido: string;
  readonly formato: FormatoArchivo;
  readonly tipoContenido: TipoContenido;
  readonly categoria: string;
  readonly etiquetas: readonly string[];
  readonly autor: AutorResumen;
  readonly fechaCreacion: string;
  readonly fechaUltimaEdicion: string;
  readonly cantidadLikes: number;
  readonly estado: EstadoPublicacion;
  /** Banderas calculadas por la API para el usuario actual. */
  readonly likeadaPorMi: boolean;
  readonly guardadaPorMi: boolean;
  readonly reportadaPorMi: boolean;
}

export interface Carpeta {
  readonly id: string;
  readonly nombre: string;
  readonly cantidadPublicaciones: number;
  readonly visibilidad: VisibilidadCarpeta;
}

/** Publicación eliminada dentro de una carpeta (CB-02). */
export interface ItemCarpetaNoDisponible {
  readonly id: string;
  readonly disponible: false;
}

export interface ItemCarpetaDisponible {
  readonly disponible: true;
  readonly publicacion: Publicacion;
}

export type ItemCarpeta = ItemCarpetaDisponible | ItemCarpetaNoDisponible;

export interface Reporte {
  readonly id: string;
  readonly publicacion: Publicacion;
  readonly motivo: MotivoReporte;
  readonly textoLibre?: string;
  readonly fecha: string;
  readonly reportante: AutorResumen;
  readonly resuelto: boolean;
}

/** Vista de moderación: una publicación con sus reportes. */
export interface PublicacionReportada {
  readonly publicacion: Publicacion;
  readonly cantidadReportes: number;
  readonly motivos: readonly MotivoReporte[];
  readonly reportes: readonly Reporte[];
}

export interface Paginacion<T> {
  readonly items: readonly T[];
  readonly siguienteCursor?: string;
}

/** Código de error HTTP conocido, o "red" cuando no hubo respuesta. */
export type CodigoError = 400 | 401 | 403 | 404 | 409 | 413 | 415 | 422 | 500 | "red";

export interface ErrorApi {
  readonly codigo: CodigoError;
  readonly mensaje: string;
  readonly detalles?: Readonly<Record<string, string>>;
}

// Estados de UI (data-model.md §3).

export type EstadoRecurso = "cargando" | "error" | "vacio" | "exito";

export type EstadoGlobal =
  | "no-autenticado"
  | "sin-permiso"
  | "no-encontrado"
  | "error-de-red";

export type EstadoMutacion = "inactiva" | "pendiente" | "exito" | "error";
