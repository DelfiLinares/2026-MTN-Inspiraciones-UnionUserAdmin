// Servicio de reportes (T032).
// Permite a usuarios autenticados reportar publicaciones de terceros (RF-21 a RF-23).
// Sin React ni estado global mutable.

import type { MotivoReporte } from "../domain/enums";
import type { Reporte } from "../domain/tipos";
import type { HttpClient } from "./httpClient";

export interface DatosCrearReporte {
  readonly motivo: MotivoReporte;
  readonly textoLibre?: string;
}

export interface ReportesService {
  reportar(publicacionId: string, datos: DatosCrearReporte): Promise<Reporte>;
}

export function crearReportesService(cliente: HttpClient): ReportesService {
  return {
    async reportar(publicacionId: string, datos: DatosCrearReporte): Promise<Reporte> {
      return cliente.post<Reporte>(`/publicaciones/${publicacionId}/reportes`, datos);
    },
  };
}
