// Servicio de publicaciones (T029).
// Consume la API REST de publicaciones mediante HttpClient (RF-01 a RF-05, RF-25 a RF-27).
// Maneja subida multipart/form-data al crear y JSON al editar/listar.

import type { TipoContenido } from "../domain/enums";
import type { Paginacion, Publicacion } from "../domain/tipos";
import type { HttpClient, ParametrosConsulta } from "./httpClient";

export interface FiltrosPublicaciones {
  readonly q?: string;
  readonly etiqueta?: string;
  readonly categoria?: string;
  readonly tipo?: TipoContenido;
  readonly cursor?: string;
  readonly limite?: number;
}

export interface OpcionesPaginacion {
  readonly cursor?: string;
  readonly limite?: number;
}

export interface DatosCrearPublicacion {
  readonly titulo: string;
  readonly descripcion: string;
  readonly categoria: string;
  readonly etiquetas: readonly string[];
  readonly archivo: File;
}

export interface DatosEditarPublicacion {
  readonly titulo?: string;
  readonly descripcion?: string;
  readonly categoria?: string;
  readonly etiquetas?: readonly string[];
  readonly archivo?: File;
}

export interface PublicacionesService {
  listar(filtros?: FiltrosPublicaciones): Promise<Paginacion<Publicacion>>;
  listarPropias(opciones?: OpcionesPaginacion): Promise<Paginacion<Publicacion>>;
  obtenerPorId(id: string): Promise<Publicacion>;
  crear(datos: DatosCrearPublicacion): Promise<Publicacion>;
  editar(id: string, datos: DatosEditarPublicacion): Promise<Publicacion>;
  borrar(id: string): Promise<void>;
}

export function crearPublicacionesService(cliente: HttpClient): PublicacionesService {
  return {
    async listar(filtros?: FiltrosPublicaciones): Promise<Paginacion<Publicacion>> {
      const params: ParametrosConsulta = {
        q: filtros?.q,
        etiqueta: filtros?.etiqueta,
        categoria: filtros?.categoria,
        tipo: filtros?.tipo,
        cursor: filtros?.cursor,
        limite: filtros?.limite,
      };
      return cliente.get<Paginacion<Publicacion>>("/publicaciones", { params });
    },

    async listarPropias(opciones?: OpcionesPaginacion): Promise<Paginacion<Publicacion>> {
      const params: ParametrosConsulta = {
        cursor: opciones?.cursor,
        limite: opciones?.limite,
      };
      return cliente.get<Paginacion<Publicacion>>("/me/publicaciones", { params });
    },

    async obtenerPorId(id: string): Promise<Publicacion> {
      return cliente.get<Publicacion>(`/publicaciones/${id}`);
    },

    async crear(datos: DatosCrearPublicacion): Promise<Publicacion> {
      const formData = new FormData();
      formData.append("titulo", datos.titulo);
      formData.append("descripcion", datos.descripcion);
      formData.append("categoria", datos.categoria);
      formData.append("archivo", datos.archivo);

      for (const etiqueta of datos.etiquetas) {
        formData.append("etiquetas[]", etiqueta);
      }

      return cliente.post<Publicacion>("/publicaciones", formData);
    },

    async editar(id: string, datos: DatosEditarPublicacion): Promise<Publicacion> {
      if (datos.archivo !== undefined) {
        const formData = new FormData();
        if (datos.titulo !== undefined) formData.append("titulo", datos.titulo);
        if (datos.descripcion !== undefined) formData.append("descripcion", datos.descripcion);
        if (datos.categoria !== undefined) formData.append("categoria", datos.categoria);
        if (datos.etiquetas !== undefined) {
          for (const etiqueta of datos.etiquetas) {
            formData.append("etiquetas[]", etiqueta);
          }
        }
        formData.append("archivo", datos.archivo);
        return cliente.put<Publicacion>(`/publicaciones/${id}`, formData);
      }

      return cliente.put<Publicacion>(`/publicaciones/${id}`, datos);
    },

    async borrar(id: string): Promise<void> {
      return cliente.delete<void>(`/publicaciones/${id}`);
    },
  };
}
