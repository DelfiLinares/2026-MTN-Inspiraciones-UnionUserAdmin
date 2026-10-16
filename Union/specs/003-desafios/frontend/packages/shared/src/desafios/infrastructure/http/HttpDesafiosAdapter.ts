/**
 * HttpDesafiosAdapter: Implementación del puerto sobre HTTP (T029)
 *
 * Consume la API de desafíos definida en openapi.yaml.
 * Implementa todas las 16 operaciones del puerto DesafiosPort.
 *
 * Características:
 * - Rutas basadas en openapi.yaml
 * - Multipart/form-data para desafíos con fotos (P-01, P-04)
 * - Header If-Match para control de versión (CB-02, P-04)
 * - Mapeo de errores HTTP a excepciones de dominio (T030)
 *
 * Fuentes de verdad:
 * - contracts/openapi.yaml: Rutas y esquemas
 * - spec.md: Criterios de aceptación
 * - tasks.md: T029, T030
 */

import { Desafio, type DatosDesafio } from "../../domain/entidades/Desafio";
import { SolicitudDesafio } from "../../domain/entidades/SolicitudDesafio";
import { RespuestaDesafio } from "../../domain/entidades/RespuestaDesafio";
import { AmbitoDesafio } from "../../domain/AmbitoDesafio";
import { Foto } from "../../domain/Foto";
import { RangoFechas } from "../../domain/RangoFechas";
import type { DesafiosPort, FiltrosDesafios } from "../../application/ports/DesafiosPort";
import type { DesafioResumen, Pagina, ParametrosPagina } from "../../application/ports/tiposDesafios";
import type { EstadoSolicitudDesafio } from "../../domain/enums/EstadoSolicitudDesafio";
import { mapearErrorDesafios } from "./mapearErrorDesafios";

/**
 * Cliente HTTP inyectado (de T006).
 * Debe proporcionar: get, post, put, delete con manejo de status y Content-Type.
 */
interface ClienteHTTP {
  get<T>(ruta: string, opciones?: any): Promise<T>;
  post<T>(ruta: string, cuerpo?: any, opciones?: any): Promise<T>;
  put<T>(ruta: string, cuerpo?: any, opciones?: any): Promise<T>;
  delete(ruta: string, opciones?: any): Promise<void>;
}

/**
 * HttpDesafiosAdapter: Adaptador de la API HTTP.
 *
 * Traducción de rutas openapi.yaml:
 * - GET /ambitos
 * - GET /desafios
 * - POST /desafios (multipart)
 * - GET /desafios/{id}
 * - PUT /desafios/{id} (multipart + If-Match)
 * - DELETE /desafios/{id}
 * - GET /desafios/{id}/respuestas
 * - POST /desafios/{id}/respuestas
 * - PUT /respuestas/{id}
 * - DELETE /respuestas/{id}
 * - GET /solicitudes
 * - POST /solicitudes
 * - PUT /solicitudes/{id} (If-Match)
 * - DELETE /solicitudes/{id}
 * - POST /solicitudes/{id}/aprobar
 * - POST /solicitudes/{id}/rechazar
 */
export class HttpDesafiosAdapter implements DesafiosPort {
  constructor(
    private httpClient: ClienteHTTP,
    private baseUrl: string = ""
  ) {}

  async listarAmbitos(): Promise<AmbitoDesafio[]> {
    const ambitoStrings = await this.httpClient.get<string[]>(`${this.baseUrl}/ambitos`);
    return ambitoStrings.map((valor) => new AmbitoDesafio(valor));
  }

  async listarDesafios(
    filtros: FiltrosDesafios,
    pagina: ParametrosPagina
  ): Promise<Pagina<DesafioResumen>> {
    const params = new URLSearchParams();

    if (filtros.ambitos) {
      for (const ambito of filtros.ambitos) {
        params.append("ambito", ambito);
      }
    }

    if (filtros.estados) {
      for (const estado of filtros.estados) {
        params.append("estado", estado);
      }
    }

    if (filtros.fechaDesde) {
      params.append("fechaDesde", filtros.fechaDesde.toISOString().split("T")[0]);
    }

    if (filtros.fechaHasta) {
      params.append("fechaHasta", filtros.fechaHasta.toISOString().split("T")[0]);
    }

    if (pagina.cursor) {
      params.append("cursor", pagina.cursor);
    }

    if (pagina.limite) {
      params.append("limite", pagina.limite.toString());
    }

    const ruta = `${this.baseUrl}/desafios?${params.toString()}`;
    const respuesta = await this.httpClient.get<{
      items: any[];
      siguienteCursor: string | null;
    }>(ruta);

    const resumenes = respuesta.items.map((item) =>
      this.parsearDesafioResumen(item)
    );

    return {
      items: resumenes,
      siguienteCursor: respuesta.siguienteCursor,
    };
  }

  async obtenerDesafio(id: string): Promise<Desafio> {
    try {
      const datos = await this.httpClient.get<any>(
        `${this.baseUrl}/desafios/${id}`
      );
      return this.parsearDesafio(datos);
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`Desafío ${id} no encontrado`);
      }
      throw mapearErrorDesafios(error.status || 500, error.datos || {});
    }
  }

  async publicarDesafio(datos: DatosDesafio): Promise<Desafio> {
    const formData = new FormData();
    
    const datosJson = {
      nombre: datos.nombre,
      descripcionLarga: datos.descripcionLarga,
      fechaInicio: datos.fechaInicio.toISOString(),
      fechaFin: datos.fechaFin.toISOString(),
      ambitos: datos.ambitos.map((a) => a.valor),
    };
    formData.append("datos", JSON.stringify(datosJson));

    for (let i = 0; i < datos.fotos.length; i++) {
      // En un caso real, aquí habría archivos File del DOM
      // Por ahora, asumimos que las fotos ya están codificadas
      formData.append("fotos", (datos.fotos[i] as any).blob || new Blob());
    }

    const respuesta = await this.httpClient.post<any>(
      `${this.baseUrl}/desafios`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return this.parsearDesafio(respuesta);
  }

  async editarDesafio(
    id: string,
    datos: DatosDesafio,
    version: number
  ): Promise<Desafio> {
    const formData = new FormData();

    const datosJson = {
      nombre: datos.nombre,
      descripcionLarga: datos.descripcionLarga,
      fechaInicio: datos.fechaInicio.toISOString(),
      fechaFin: datos.fechaFin.toISOString(),
      ambitos: datos.ambitos.map((a) => a.valor),
    };
    formData.append("datos", JSON.stringify(datosJson));

    for (let i = 0; i < datos.fotos.length; i++) {
      formData.append("fotos", (datos.fotos[i] as any).blob || new Blob());
    }

    try {
      const respuesta = await this.httpClient.put<any>(
        `${this.baseUrl}/desafios/${id}`,
        formData,
        {
          headers: {
            "If-Match": version.toString(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return this.parsearDesafio(respuesta);
    } catch (error: any) {
      throw mapearErrorDesafios(error.status || 500, error.datos || {});
    }
  }

  async eliminarDesafio(id: string): Promise<void> {
    try {
      await this.httpClient.delete(`${this.baseUrl}/desafios/${id}`);
    } catch (error: any) {
      throw mapearErrorDesafios(error.status || 500, error.datos || {});
    }
  }

  async listarRespuestas(
    desafioId: string,
    pagina: ParametrosPagina
  ): Promise<Pagina<RespuestaDesafio>> {
    const params = new URLSearchParams();

    if (pagina.cursor) {
      params.append("cursor", pagina.cursor);
    }

    if (pagina.limite) {
      params.append("limite", pagina.limite.toString());
    }

    const ruta = `${this.baseUrl}/desafios/${desafioId}/respuestas?${params.toString()}`;
    const respuesta = await this.httpClient.get<{
      items: any[];
      siguienteCursor: string | null;
    }>(ruta);

    const respuestas = respuesta.items.map((item) =>
      this.parsearRespuestaDesafio(item)
    );

    return {
      items: respuestas,
      siguienteCursor: respuesta.siguienteCursor,
    };
  }

  async responderDesafio(desafioId: string): Promise<RespuestaDesafio> {
    try {
      const datos = await this.httpClient.post<any>(
        `${this.baseUrl}/desafios/${desafioId}/respuestas`,
        {} // A-22: formato del contenido aún no definido
      );
      return this.parsearRespuestaDesafio(datos);
    } catch (error: any) {
      throw mapearErrorDesafios(error.status || 500, error.datos || {});
    }
  }

  async editarRespuesta(respuestaId: string): Promise<RespuestaDesafio> {
    try {
      const datos = await this.httpClient.put<any>(
        `${this.baseUrl}/respuestas/${respuestaId}`,
        {} // A-22: formato del contenido aún no definido
      );
      return this.parsearRespuestaDesafio(datos);
    } catch (error: any) {
      throw mapearErrorDesafios(error.status || 500, error.datos || {});
    }
  }

  async eliminarRespuesta(respuestaId: string): Promise<void> {
    try {
      await this.httpClient.delete(`${this.baseUrl}/respuestas/${respuestaId}`);
    } catch (error: any) {
      throw mapearErrorDesafios(error.status || 500, error.datos || {});
    }
  }

  async listarSolicitudes(
    filtros: { readonly estado?: EstadoSolicitudDesafio },
    pagina: ParametrosPagina
  ): Promise<Pagina<SolicitudDesafio>> {
    const params = new URLSearchParams();

    if (filtros.estado) {
      params.append("estado", filtros.estado);
    }

    if (pagina.cursor) {
      params.append("cursor", pagina.cursor);
    }

    if (pagina.limite) {
      params.append("limite", pagina.limite.toString());
    }

    const ruta = `${this.baseUrl}/solicitudes?${params.toString()}`;
    const respuesta = await this.httpClient.get<{
      items: any[];
      siguienteCursor: string | null;
    }>(ruta);

    const solicitudes = respuesta.items.map((item) =>
      this.parsearSolicitudDesafio(item)
    );

    return {
      items: solicitudes,
      siguienteCursor: respuesta.siguienteCursor,
    };
  }

  async proponerSolicitud(): Promise<SolicitudDesafio> {
    try {
      const datos = await this.httpClient.post<any>(
        `${this.baseUrl}/solicitudes`,
        {} // A-08: campos de la solicitud aún no definidos
      );
      return this.parsearSolicitudDesafio(datos);
    } catch (error: any) {
      throw mapearErrorDesafios(error.status || 500, error.datos || {});
    }
  }

  async editarSolicitud(id: string, version: number): Promise<SolicitudDesafio> {
    try {
      const datos = await this.httpClient.put<any>(
        `${this.baseUrl}/solicitudes/${id}`,
        {}, // A-08: campos editables
        {
          headers: {
            "If-Match": version.toString(),
          },
        }
      );
      return this.parsearSolicitudDesafio(datos);
    } catch (error: any) {
      throw mapearErrorDesafios(error.status || 500, error.datos || {});
    }
  }

  async eliminarSolicitud(id: string): Promise<void> {
    try {
      await this.httpClient.delete(`${this.baseUrl}/solicitudes/${id}`);
    } catch (error: any) {
      throw mapearErrorDesafios(error.status || 500, error.datos || {});
    }
  }

  async aprobarSolicitud(id: string): Promise<SolicitudDesafio> {
    try {
      const datos = await this.httpClient.post<any>(
        `${this.baseUrl}/solicitudes/${id}/aprobar`,
        {}
      );
      return this.parsearSolicitudDesafio(datos);
    } catch (error: any) {
      throw mapearErrorDesafios(error.status || 500, error.datos || {});
    }
  }

  async rechazarSolicitud(id: string): Promise<SolicitudDesafio> {
    try {
      const datos = await this.httpClient.post<any>(
        `${this.baseUrl}/solicitudes/${id}/rechazar`,
        {}
      );
      return this.parsearSolicitudDesafio(datos);
    } catch (error: any) {
      throw mapearErrorDesafios(error.status || 500, error.datos || {});
    }
  }

  // ============ Parsers privados ============

  private parsearDesafio(datos: any): Desafio {
    return new Desafio({
      id: datos.id,
      nombre: datos.nombre,
      descripcionLarga: datos.descripcionLarga,
      fotos: (datos.fotos || []).map(
        (f: any) => new Foto(f.id, f.url, f.formato, f.principal)
      ),
      rango: new RangoFechas(
        new Date(datos.fechaInicio),
        new Date(datos.fechaFin)
      ),
      ambitos: (datos.ambitos || []).map((a: string) => new AmbitoDesafio(a)),
      tieneRespuestas: datos.tieneRespuestas || false,
      version: datos.version || 1,
      eliminado: datos.eliminado || false,
    });
  }

  private parsearDesafioResumen(datos: any): DesafioResumen {
    return {
      id: datos.id,
      nombre: datos.nombre,
      fotoPrincipal: new Foto(
        datos.fotoPrincipal.id,
        datos.fotoPrincipal.url,
        datos.fotoPrincipal.formato,
        datos.fotoPrincipal.principal
      ),
      ambitos: datos.ambitos || [],
      fechaInicio: new Date(datos.fechaInicio),
      fechaFin: new Date(datos.fechaFin),
      estado: datos.estado,
    };
  }

  private parsearRespuestaDesafio(datos: any): RespuestaDesafio {
    return new RespuestaDesafio({
      id: datos.id,
      desafioId: datos.desafioId,
      autorId: datos.autorId,
    });
  }

  private parsearSolicitudDesafio(datos: any): SolicitudDesafio {
    return new SolicitudDesafio({
      id: datos.id,
      autorId: datos.autorId,
      estado: datos.estado,
      version: datos.version || 1,
    });
  }
}
