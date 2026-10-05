// Tests para useGuardarEnCarpetas con actualización optimista y rollback (T040).
// Spec: HU-09, RF-17, RF-18, CB-02. Res.: D-10, A-9. Plan sección 6.

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormatoArchivo, TipoContenido, VisibilidadCarpeta } from "../domain/enums";
import type { Carpeta, Paginacion, Publicacion } from "../domain/tipos";
import { ErrorHttp } from "../services/errores";
import type { CarpetasService } from "../services/carpetasService";
import { clavesConsulta } from "./claves";
import { useGuardarEnCarpetas } from "./useGuardarEnCarpetas";

function crearPublicacion(id: string, guardadaPorMi: boolean): Publicacion {
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
    guardadaPorMi,
    reportadaPorMi: false,
  };
}

function crearCarpeta(id: string, nombre: string, cantidadPublicaciones = 0): Carpeta {
  return {
    id,
    nombre,
    visibilidad: VisibilidadCarpeta.PRIVADA,
    cantidadPublicaciones,
  };
}

describe("useGuardarEnCarpetas", () => {
  it("guarda optimísticamente una publicación en una carpeta y actualiza contadores y flags", async () => {
    const queryClient = new QueryClient();
    const pubId = "p-1";
    const carpetaA = crearCarpeta("c-1", "Favoritos", 0);
    const pubInicial = crearPublicacion(pubId, false);

    // Precargar caché
    queryClient.setQueryData(clavesConsulta.publicaciones.carpetas(pubId), []);
    queryClient.setQueryData(clavesConsulta.publicaciones.detalle(pubId), pubInicial);
    queryClient.setQueryData<Paginacion<Publicacion>>(
      clavesConsulta.publicaciones.listado(),
      { items: [pubInicial] },
    );
    queryClient.setQueryData<readonly Carpeta[]>(clavesConsulta.carpetas.listado(), [
      carpetaA,
    ]);

    let resolverGuardado!: () => void;
    const promesaGuardado = new Promise<void>((resolve) => {
      resolverGuardado = resolve;
    });

    const mockService: CarpetasService = {
      listar: vi.fn(),
      crear: vi.fn(),
      actualizar: vi.fn(),
      borrar: vi.fn(),
      obtenerContenido: vi.fn(),
      guardarPublicacion: vi.fn().mockReturnValue(promesaGuardado),
      quitarPublicacion: vi.fn(),
      obtenerCarpetasDePublicacion: vi.fn().mockResolvedValue([]),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const onExito = vi.fn();
    const { result } = renderHook(
      () =>
        useGuardarEnCarpetas({
          publicacionId: pubId,
          carpetasService: mockService,
          onExito,
        }),
      { wrapper },
    );

    // Ejecutar toggleGuardado
    let togglePromise: Promise<void> | undefined;
    act(() => {
      togglePromise = result.current.toggleGuardado("c-1");
    });

    // 1. Verificación optimista inmediata
    const carpetasIdsEnCaché = queryClient.getQueryData<readonly string[]>(
      clavesConsulta.publicaciones.carpetas(pubId),
    );
    expect(carpetasIdsEnCaché).toEqual(["c-1"]);

    const detalleEnCaché = queryClient.getQueryData<Publicacion>(
      clavesConsulta.publicaciones.detalle(pubId),
    );
    expect(detalleEnCaché?.guardadaPorMi).toBe(true);

    const carpetasEnCaché = queryClient.getQueryData<readonly Carpeta[]>(
      clavesConsulta.carpetas.listado(),
    );
    expect(carpetasEnCaché?.[0]?.cantidadPublicaciones).toBe(1);

    // Resolver llamada a la API
    await act(async () => {
      resolverGuardado();
      await togglePromise;
    });

    expect(mockService.guardarPublicacion).toHaveBeenCalledWith("c-1", pubId);
    expect(onExito).toHaveBeenCalledWith("c-1", true);
  });

  it("quita optimísticamente una publicación de una carpeta", async () => {
    const queryClient = new QueryClient();
    const pubId = "p-1";
    const carpetaA = crearCarpeta("c-1", "Favoritos", 1);
    const pubInicial = crearPublicacion(pubId, true);

    // Precargar caché con la publicación vinculada a c-1
    queryClient.setQueryData(clavesConsulta.publicaciones.carpetas(pubId), ["c-1"]);
    queryClient.setQueryData(clavesConsulta.publicaciones.detalle(pubId), pubInicial);
    queryClient.setQueryData<readonly Carpeta[]>(clavesConsulta.carpetas.listado(), [
      carpetaA,
    ]);

    const mockService: CarpetasService = {
      listar: vi.fn(),
      crear: vi.fn(),
      actualizar: vi.fn(),
      borrar: vi.fn(),
      obtenerContenido: vi.fn(),
      guardarPublicacion: vi.fn(),
      quitarPublicacion: vi.fn().mockResolvedValue(undefined),
      obtenerCarpetasDePublicacion: vi.fn().mockResolvedValue(["c-1"]),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const onExito = vi.fn();
    const { result } = renderHook(
      () =>
        useGuardarEnCarpetas({
          publicacionId: pubId,
          carpetasService: mockService,
          onExito,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.estaGuardadaEn("c-1")).toBe(true);
    });

    await act(async () => {
      await result.current.toggleGuardado("c-1");
    });

    expect(mockService.quitarPublicacion).toHaveBeenCalledWith("c-1", pubId);
    expect(onExito).toHaveBeenCalledWith("c-1", false);

    const carpetasIdsEnCaché = queryClient.getQueryData<readonly string[]>(
      clavesConsulta.publicaciones.carpetas(pubId),
    );
    expect(carpetasIdsEnCaché).toEqual([]);

    const detalleEnCaché = queryClient.getQueryData<Publicacion>(
      clavesConsulta.publicaciones.detalle(pubId),
    );
    expect(detalleEnCaché?.guardadaPorMi).toBe(false);

    const carpetasEnCaché = queryClient.getQueryData<readonly Carpeta[]>(
      clavesConsulta.carpetas.listado(),
    );
    expect(carpetasEnCaché?.[0]?.cantidadPublicaciones).toBe(0);
  });

  it("revierte todos los cambios en caché si el servidor devuelve un error", async () => {
    const queryClient = new QueryClient();
    const pubId = "p-1";
    const carpetaA = crearCarpeta("c-1", "Favoritos", 0);
    const pubInicial = crearPublicacion(pubId, false);

    queryClient.setQueryData(clavesConsulta.publicaciones.carpetas(pubId), []);
    queryClient.setQueryData(clavesConsulta.publicaciones.detalle(pubId), pubInicial);
    queryClient.setQueryData<readonly Carpeta[]>(clavesConsulta.carpetas.listado(), [
      carpetaA,
    ]);

    const errorHttp = new ErrorHttp(500, "Error de base de datos");
    const mockService: CarpetasService = {
      listar: vi.fn(),
      crear: vi.fn(),
      actualizar: vi.fn(),
      borrar: vi.fn(),
      obtenerContenido: vi.fn(),
      guardarPublicacion: vi.fn().mockRejectedValue(errorHttp),
      quitarPublicacion: vi.fn(),
      obtenerCarpetasDePublicacion: vi.fn().mockResolvedValue([]),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const onError = vi.fn();
    const { result } = renderHook(
      () =>
        useGuardarEnCarpetas({
          publicacionId: pubId,
          carpetasService: mockService,
          onError,
        }),
      { wrapper },
    );

    await act(async () => {
      try {
        await result.current.toggleGuardado("c-1");
      } catch {
        // Silenciar error capturado
      }
    });

    expect(onError).toHaveBeenCalledWith(errorHttp, "c-1", true);

    // Validar rollback
    const carpetasIdsEnCaché = queryClient.getQueryData<readonly string[]>(
      clavesConsulta.publicaciones.carpetas(pubId),
    );
    expect(carpetasIdsEnCaché).toEqual([]);

    const detalleEnCaché = queryClient.getQueryData<Publicacion>(
      clavesConsulta.publicaciones.detalle(pubId),
    );
    expect(detalleEnCaché?.guardadaPorMi).toBe(false);

    const carpetasEnCaché = queryClient.getQueryData<readonly Carpeta[]>(
      clavesConsulta.carpetas.listado(),
    );
    expect(carpetasEnCaché?.[0]?.cantidadPublicaciones).toBe(0);
  });
});
