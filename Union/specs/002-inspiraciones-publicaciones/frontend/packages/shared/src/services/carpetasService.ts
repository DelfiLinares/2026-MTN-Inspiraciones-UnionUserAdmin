// Servicio de carpetas y guardado de publicaciones (T031).
// Consume la API REST mediante HttpClient (RF-16 a RF-20).
// Sin React ni estado global mutable.

import type { VisibilidadCarpeta } from "../domain/enums";
import type { Carpeta, ItemCarpeta, Paginacion } from "../domain/tipos";
import type { HttpClient, ParametrosConsulta } from "./httpClient";

export interface OpcionesPaginacionCarpeta {
  readonly cursor?: string;
  readonly limite?: number;
}

export interface DatosCrearCarpeta {
  readonly nombre: string;
}

export interface DatosActualizarCarpeta {
  readonly nombre?: string;
  readonly visibilidad?: VisibilidadCarpeta;
}

export interface CarpetasPublicacion {
  readonly carpetaIds: readonly string[];
}

export interface CarpetasService {
  listar(): Promise<readonly Carpeta[]>;
  crear(datos: DatosCrearCarpeta): Promise<Carpeta>;
  actualizar(id: string, datos: DatosActualizarCarpeta): Promise<Carpeta>;
  borrar(id: string): Promise<void>;
  obtenerContenido(id: string, opciones?: OpcionesPaginacionCarpeta): Promise<Paginacion<ItemCarpeta>>;
  guardarPublicacion(carpetaId: string, publicacionId: string): Promise<void>;
  quitarPublicacion(carpetaId: string, publicacionId: string): Promise<void>;
  obtenerCarpetasDePublicacion(publicacionId: string): Promise<readonly string[]>;
}

export function crearCarpetasService(cliente: HttpClient): CarpetasService {
  return {
    async listar(): Promise<readonly Carpeta[]> {
      return cliente.get<readonly Carpeta[]>("/carpetas");
    },

    async crear(datos: DatosCrearCarpeta): Promise<Carpeta> {
      return cliente.post<Carpeta>("/carpetas", datos);
    },

    async actualizar(id: string, datos: DatosActualizarCarpeta): Promise<Carpeta> {
      return cliente.patch<Carpeta>(`/carpetas/${id}`, datos);
    },

    async borrar(id: string): Promise<void> {
      return cliente.delete<void>(`/carpetas/${id}`);
    },

    async obtenerContenido(
      id: string,
      opciones?: OpcionesPaginacionCarpeta,
    ): Promise<Paginacion<ItemCarpeta>> {
      const params: ParametrosConsulta = {
        cursor: opciones?.cursor,
        limite: opciones?.limite,
      };
      return cliente.get<Paginacion<ItemCarpeta>>(`/carpetas/${id}/publicaciones`, { params });
    },

    async guardarPublicacion(carpetaId: string, publicacionId: string): Promise<void> {
      return cliente.put<void>(`/carpetas/${carpetaId}/publicaciones/${publicacionId}`);
    },

    async quitarPublicacion(carpetaId: string, publicacionId: string): Promise<void> {
      return cliente.delete<void>(`/carpetas/${carpetaId}/publicaciones/${publicacionId}`);
    },

    async obtenerCarpetasDePublicacion(publicacionId: string): Promise<readonly string[]> {
      const respuesta = await cliente.get<CarpetasPublicacion>(`/publicaciones/${publicacionId}/carpetas`);
      return respuesta.carpetaIds;
    },
  };
}
