// Tests para hooks de moderación: useModeracionReportadas, useModeracionDetalle, useModeracionMutaciones (T042).
// Spec: HU-12, HU-13, RF-07, RF-24. Res.: A-1, A-16. Plan sección 6.

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormatoArchivo, MotivoReporte, TipoContenido } from "../domain/enums";
import type { Publicacion, PublicacionReportada } from "../domain/tipos";
import { ErrorHttp } from "../services/errores";
import type { ModeracionService } from "../services/moderacionService";
import { clavesConsulta } from "./claves";
import {
  useModeracionDetalle,
  useModeracionMutaciones,
  useModeracionReportadas,
} from "./useModeracion";

function crearPublicacion(id: string): Publicacion {
  return {
    id,
    titulo: `Publicación ${id}`,
    descripcion: "Descripción",
    contenido: "https://ejemplo.test/img.png",
    formato: FormatoArchivo.PNG,
    tipoContenido: TipoContenido.IMAGEN,
    categoria: "General",
    etiquetas: ["test"],
    autor: { id: "u-autor", nombre: "Autor" },
    fechaCreacion: "2026-10-01T10:00:00Z",
    fechaUltimaEdicion: "2026-10-01T10:00:00Z",
    cantidadLikes: 2,
    estado: "ACTIVA" as const,
    likeadaPorMi: false,
    guardadaPorMi: false,
    reportadaPorMi: false,
  };
}

function crearPublicacionReportada(id: string): PublicacionReportada {
  const pub = crearPublicacion(id);
  return {
    publicacion: pub,
    cantidadReportes: 1,
    motivos: [MotivoReporte.SPAM],
    reportes: [
      {
        id: `rep-${id}`,
        publicacion: pub,
        motivo: MotivoReporte.SPAM,
        fecha: "2026-10-02T10:00:00Z",
        reportante: { id: "u-reportante", nombre: "Reportante" },
        resuelto: false,
      },
    ],
  };
}

describe("useModeracionReportadas", () => {
  it("obtiene listado paginado infinito de publicaciones reportadas (RF-24)", async () => {
    const queryClient = new QueryClient();
    const item1 = crearPublicacionReportada("p-1");
    const item2 = crearPublicacionReportada("p-2");

    const mockService: ModeracionService = {
      listarReportadas: vi.fn().mockImplementation(async (opciones) => {
        if (opciones?.cursor === "cursor-pag-2") {
          return {
            items: [item2],
            siguienteCursor: undefined,
          };
        }
        return {
          items: [item1],
          siguienteCursor: "cursor-pag-2",
        };
      }),
      obtenerReportadaPorId: vi.fn(),
      eliminarPublicacion: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useModeracionReportadas({
          moderacionService: mockService,
          limite: 10,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.estaCargando).toBe(false);
    });

    expect(result.current.reportadas).toEqual([item1]);
    expect(result.current.tieneMas).toBe(true);

    act(() => {
      result.current.cargarMas();
    });

    await waitFor(() => {
      expect(result.current.reportadas).toHaveLength(2);
    });

    expect(result.current.reportadas).toEqual([item1, item2]);
    expect(result.current.tieneMas).toBe(false);
  });
});

describe("useModeracionDetalle", () => {
  it("obtiene el detalle de una publicación reportada", async () => {
    const queryClient = new QueryClient();
    const repMock = crearPublicacionReportada("p-1");

    const mockService: ModeracionService = {
      listarReportadas: vi.fn(),
      obtenerReportadaPorId: vi.fn().mockResolvedValue(repMock),
      eliminarPublicacion: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useModeracionDetalle({
          publicacionId: "p-1",
          moderacionService: mockService,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.estaCargando).toBe(false);
    });

    expect(result.current.reportada).toEqual(repMock);
    expect(mockService.obtenerReportadaPorId).toHaveBeenCalledWith("p-1");
  });
});

describe("useModeracionMutaciones", () => {
  it("elimina una publicación reportada e invalida las cachés relevantes (RF-07, HU-12)", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const onEliminarExito = vi.fn();

    const mockService: ModeracionService = {
      listarReportadas: vi.fn(),
      obtenerReportadaPorId: vi.fn(),
      eliminarPublicacion: vi.fn().mockResolvedValue(undefined),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useModeracionMutaciones({
          moderacionService: mockService,
          onEliminarExito,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.eliminarPublicacion("p-1");
    });

    expect(mockService.eliminarPublicacion).toHaveBeenCalledWith("p-1");
    expect(onEliminarExito).toHaveBeenCalledWith("p-1");

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: clavesConsulta.moderacion.todas(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: clavesConsulta.publicaciones.todas(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: clavesConsulta.carpetas.todas(),
    });
  });

  it("captura errores al eliminar y ejecuta onError", async () => {
    const queryClient = new QueryClient();
    const errorHttp = new ErrorHttp(403, "No tenés permiso para moderar.");
    const onError = vi.fn();

    const mockService: ModeracionService = {
      listarReportadas: vi.fn(),
      obtenerReportadaPorId: vi.fn(),
      eliminarPublicacion: vi.fn().mockRejectedValue(errorHttp),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useModeracionMutaciones({
          moderacionService: mockService,
          onError,
        }),
      { wrapper },
    );

    await expect(result.current.eliminarPublicacion("p-1")).rejects.toThrow();
    expect(onError).toHaveBeenCalledWith(errorHttp);
  });
});
