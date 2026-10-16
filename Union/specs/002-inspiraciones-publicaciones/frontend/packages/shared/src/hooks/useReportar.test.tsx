// Tests para useReportar (T041).
// Spec: HU-11, RF-21 a RF-23. Res.: A-13. Plan sección 6.

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormatoArchivo, MotivoReporte, TipoContenido } from "../domain/enums";
import type { Paginacion, Publicacion, Reporte } from "../domain/tipos";
import { ErrorHttp } from "../services/errores";
import type { DatosCrearReporte, ReportesService } from "../services/reportesService";
import { clavesConsulta } from "./claves";
import { useReportar } from "./useReportar";

function crearPublicacion(id: string, reportadaPorMi = false): Publicacion {
  return {
    id,
    titulo: `Publicación ${id}`,
    descripcion: "Descripción",
    contenido: "https://ejemplo.test/img.png",
    formato: FormatoArchivo.PNG,
    tipoContenido: TipoContenido.IMAGEN,
    categoria: "Diseño",
    etiquetas: ["inspiracion"],
    autor: { id: "u-autor", nombre: "Autor" },
    fechaCreacion: "2026-10-01T10:00:00Z",
    fechaUltimaEdicion: "2026-10-01T10:00:00Z",
    cantidadLikes: 3,
    estado: "ACTIVA" as const,
    likeadaPorMi: false,
    guardadaPorMi: false,
    reportadaPorMi,
  };
}

describe("useReportar", () => {
  it("envía reporte exitosamente y actualiza caché a reportadaPorMi = true", async () => {
    const queryClient = new QueryClient();
    const pubId = "p-1";
    const pubInicial = crearPublicacion(pubId, false);

    // Precargar caché
    queryClient.setQueryData(clavesConsulta.publicaciones.detalle(pubId), pubInicial);
    queryClient.setQueryData<Paginacion<Publicacion>>(
      clavesConsulta.publicaciones.listado(),
      { items: [pubInicial] },
    );

    const reporteCreado: Reporte = {
      id: "rep-1",
      publicacion: pubInicial,
      motivo: MotivoReporte.SPAM,
      fecha: "2026-10-02T10:00:00Z",
      reportante: { id: "u-yo", nombre: "Usuario Actual" },
      resuelto: false,
    };

    const mockService: ReportesService = {
      reportar: vi.fn().mockResolvedValue(reporteCreado),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const onExito = vi.fn();
    const { result } = renderHook(
      () =>
        useReportar({
          publicacionId: pubId,
          reportesService: mockService,
          onExito,
        }),
      { wrapper },
    );

    const datosReporte: DatosCrearReporte = {
      motivo: MotivoReporte.SPAM,
      textoLibre: "",
    };

    let res: Reporte | void = undefined;
    await act(async () => {
      res = await result.current.reportar(datosReporte);
    });

    expect(res).toEqual(reporteCreado);
    expect(mockService.reportar).toHaveBeenCalledWith(pubId, datosReporte);
    expect(onExito).toHaveBeenCalledWith(reporteCreado);
    expect(result.current.estaReportada).toBe(true);

    // Comprobar actualización en caché
    const detalleEnCaché = queryClient.getQueryData<Publicacion>(
      clavesConsulta.publicaciones.detalle(pubId),
    );
    expect(detalleEnCaché?.reportadaPorMi).toBe(true);

    const listadoEnCaché = queryClient.getQueryData<Paginacion<Publicacion>>(
      clavesConsulta.publicaciones.listado(),
    );
    expect(listadoEnCaché?.items[0]?.reportadaPorMi).toBe(true);
  });

  it("trata el error 409 (Conflicto/Ya reportada) marcando la publicación como ya reportada (A-13, RF-23)", async () => {
    const queryClient = new QueryClient();
    const pubId = "p-1";
    const pubInicial = crearPublicacion(pubId, false);

    queryClient.setQueryData(clavesConsulta.publicaciones.detalle(pubId), pubInicial);

    const error409 = new ErrorHttp(409, "Ya reportaste esta publicación.");
    const mockService: ReportesService = {
      reportar: vi.fn().mockRejectedValue(error409),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const onError = vi.fn();
    const { result } = renderHook(
      () =>
        useReportar({
          publicacionId: pubId,
          reportesService: mockService,
          onError,
        }),
      { wrapper },
    );

    await act(async () => {
      try {
        await result.current.reportar({
          motivo: MotivoReporte.PLAGIO,
          textoLibre: "Copia",
        });
      } catch {
        // Silenciar error en test
      }
    });

    expect(onError).toHaveBeenCalledWith(error409);
    expect(result.current.yaReportada).toBe(true);
    expect(result.current.estaReportada).toBe(true);

    const detalleEnCaché = queryClient.getQueryData<Publicacion>(
      clavesConsulta.publicaciones.detalle(pubId),
    );
    expect(detalleEnCaché?.reportadaPorMi).toBe(true);
  });

  it("falla tempranamente con validación si el motivo no es válido o texto libre supera el límite", async () => {
    const queryClient = new QueryClient();
    const pubId = "p-1";

    const mockService: ReportesService = {
      reportar: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useReportar({
          publicacionId: pubId,
          reportesService: mockService,
        }),
      { wrapper },
    );

    // Texto libre de más de 500 caracteres
    await expect(
      result.current.reportar({
        motivo: MotivoReporte.SPAM,
        textoLibre: "a".repeat(501),
      }),
    ).rejects.toThrow();

    expect(mockService.reportar).not.toHaveBeenCalled();
  });
});
