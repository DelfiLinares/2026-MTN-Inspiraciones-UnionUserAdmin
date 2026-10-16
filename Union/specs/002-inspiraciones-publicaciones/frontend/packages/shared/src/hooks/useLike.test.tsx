// Tests para useLike con mutación optimista, reversión y anti doble clic (T038).
// Spec: HU-07, RF-11 a RF-15, CB-07. Res.: D-10, S-3. Plan sección 6.

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormatoArchivo, TipoContenido } from "../domain/enums";
import type { Paginacion, Publicacion } from "../domain/tipos";
import { ErrorHttp } from "../services/errores";
import type { LikesService, ResultadoLike } from "../services/likesService";
import { clavesConsulta } from "./claves";
import { useLike } from "./useLike";

function crearPublicacion(id: string, likeadaPorMi: boolean, cantidadLikes: number): Publicacion {
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
    cantidadLikes,
    estado: "ACTIVA" as const,
    likeadaPorMi,
    guardadaPorMi: false,
    reportadaPorMi: false,
  };
}

describe("useLike", () => {
  it("da like optimista, actualiza la caché inmediatamente y confirma con la API", async () => {
    const queryClient = new QueryClient();
    const pubInicial = crearPublicacion("p-1", false, 5);

    // Pre-cargar caché con detalle y lista
    queryClient.setQueryData(clavesConsulta.publicaciones.detalle("p-1"), pubInicial);
    queryClient.setQueryData<Paginacion<Publicacion>>(
      clavesConsulta.publicaciones.listado(),
      { items: [pubInicial] },
    );

    let resolverLike!: (valor: ResultadoLike) => void;
    const promesaLike = new Promise<ResultadoLike>((resolve) => {
      resolverLike = (v) => resolve(v);
    });

    const mockLikesService: LikesService = {
      darLike: vi.fn().mockReturnValue(promesaLike),
      quitarLike: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const onExito = vi.fn();
    const { result } = renderHook(
      () =>
        useLike({
          publicacion: pubInicial,
          likesService: mockLikesService,
          onExito,
        }),
      { wrapper },
    );

    // Ejecutar toggleLike
    let togglePromise: Promise<void> | undefined;
    act(() => {
      togglePromise = result.current.toggleLike();
    });

    // Verificación de estado optimista inmediato en la caché
    const detalleEnProgreso = queryClient.getQueryData<Publicacion>(
      clavesConsulta.publicaciones.detalle("p-1"),
    );
    expect(detalleEnProgreso?.likeadaPorMi).toBe(true);
    expect(detalleEnProgreso?.cantidadLikes).toBe(6);

    const listaEnProgreso = queryClient.getQueryData<Paginacion<Publicacion>>(
      clavesConsulta.publicaciones.listado(),
    );
    expect(listaEnProgreso?.items[0]?.likeadaPorMi).toBe(true);
    expect(listaEnProgreso?.items[0]?.cantidadLikes).toBe(6);

    // Resolver la respuesta del backend
    await act(async () => {
      resolverLike({ likeadaPorMi: true, cantidadLikes: 6 });
      await togglePromise;
    });

    expect(mockLikesService.darLike).toHaveBeenCalledWith("p-1");
    expect(onExito).toHaveBeenCalledWith({ likeadaPorMi: true, cantidadLikes: 6 });
  });

  it("quita like optimista cuando la publicación ya tenía like", async () => {
    const queryClient = new QueryClient();
    const pubInicial = crearPublicacion("p-1", true, 3);

    queryClient.setQueryData(clavesConsulta.publicaciones.detalle("p-1"), pubInicial);

    const mockLikesService: LikesService = {
      darLike: vi.fn(),
      quitarLike: vi.fn().mockResolvedValue({ likeadaPorMi: false, cantidadLikes: 2 }),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useLike({
          publicacion: pubInicial,
          likesService: mockLikesService,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.toggleLike();
    });

    expect(mockLikesService.quitarLike).toHaveBeenCalledWith("p-1");
    const detalleFinal = queryClient.getQueryData<Publicacion>(
      clavesConsulta.publicaciones.detalle("p-1"),
    );
    expect(detalleFinal?.likeadaPorMi).toBe(false);
    expect(detalleFinal?.cantidadLikes).toBe(2);
  });

  it("revierte los cambios en la caché si la llamada a la API falla", async () => {
    const queryClient = new QueryClient();
    const pubInicial = crearPublicacion("p-1", false, 10);

    queryClient.setQueryData(clavesConsulta.publicaciones.detalle("p-1"), pubInicial);
    queryClient.setQueryData<Paginacion<Publicacion>>(
      clavesConsulta.publicaciones.listado(),
      { items: [pubInicial] },
    );

    const errorHttp = new ErrorHttp(500, "Error interno de servidor");
    const mockLikesService: LikesService = {
      darLike: vi.fn().mockRejectedValue(errorHttp),
      quitarLike: vi.fn(),
    };

    const onError = vi.fn();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useLike({
          publicacion: pubInicial,
          likesService: mockLikesService,
          onError,
        }),
      { wrapper },
    );

    await act(async () => {
      try {
        await result.current.toggleLike();
      } catch {
        // Silenciar error capturado en el hook
      }
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(errorHttp);
    });

    // Validar que la caché volvió a su estado inicial
    const detalleRevertido = queryClient.getQueryData<Publicacion>(
      clavesConsulta.publicaciones.detalle("p-1"),
    );
    expect(detalleRevertido?.likeadaPorMi).toBe(false);
    expect(detalleRevertido?.cantidadLikes).toBe(10);

    const listaRevertida = queryClient.getQueryData<Paginacion<Publicacion>>(
      clavesConsulta.publicaciones.listado(),
    );
    expect(listaRevertida?.items[0]?.likeadaPorMi).toBe(false);
    expect(listaRevertida?.items[0]?.cantidadLikes).toBe(10);
  });

  it("previene dobles clics mientras la mutación está pendiente (CB-07)", async () => {
    const queryClient = new QueryClient();
    const pubInicial = crearPublicacion("p-1", false, 0);

    let resolverLike!: (valor: ResultadoLike) => void;
    const promesaBloqueada = new Promise<ResultadoLike>((resolve) => {
      resolverLike = (v) => resolve(v);
    });

    const mockLikesService: LikesService = {
      darLike: vi.fn().mockReturnValue(promesaBloqueada),
      quitarLike: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useLike({
          publicacion: pubInicial,
          likesService: mockLikesService,
        }),
      { wrapper },
    );

    let primerClick: Promise<void> | undefined;
    act(() => {
      primerClick = result.current.toggleLike();
    });

    // Segundo click mientras primerClick está pendiente
    let segundoClick: Promise<void> | undefined;
    act(() => {
      segundoClick = result.current.toggleLike();
    });

    expect(result.current.estaPendiente).toBe(true);

    await act(async () => {
      resolverLike({ likeadaPorMi: true, cantidadLikes: 1 });
      await primerClick;
      await segundoClick;
    });

    // Solo se debe haber llamado darLike una sola vez
    expect(mockLikesService.darLike).toHaveBeenCalledTimes(1);
  });
});
