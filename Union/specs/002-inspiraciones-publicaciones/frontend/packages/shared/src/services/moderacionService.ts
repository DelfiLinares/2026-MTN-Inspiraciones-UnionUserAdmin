// Servicio de moderación (T032).
// Permite a usuarios con rol ADMIN consultar y gestionar publicaciones reportadas (RF-24, RF-07, HU-13).
// Sin React ni estado global mutable.

import type { Paginacion, PublicacionReportada } from "../domain/tipos";
import type { HttpClient, ParametrosConsulta } from "./httpClient";

export interface OpcionesPaginacionModeracion {
  readonly cursor?: string;
  readonly limite?: number;
}

export interface ModeracionService {
  listarReportadas(opciones?: OpcionesPaginacionModeracion): Promise<Paginacion<PublicacionReportada>>;
  obtenerReportadaPorId(publicacionId: string): Promise<PublicacionReportada>;
  eliminarPublicacion(publicacionId: string): Promise<void>;
}

export function crearModeracionService(cliente: HttpClient): ModeracionService {
  return {
    async listarReportadas(
      opciones?: OpcionesPaginacionModeracion,
    ): Promise<Paginacion<PublicacionReportada>> {
      const params: ParametrosConsulta = {
        cursor: opciones?.cursor,
        limite: opciones?.limite,
      };
      return cliente.get<Paginacion<PublicacionReportada>>("/moderacion/reportadas", { params });
    },

    async obtenerReportadaPorId(publicacionId: string): Promise<PublicacionReportada> {
      return cliente.get<PublicacionReportada>(`/moderacion/reportadas/${publicacionId}`);
    },

    async eliminarPublicacion(publicacionId: string): Promise<void> {
      return cliente.delete<void>(`/publicaciones/${publicacionId}`);
    },
  };
}
