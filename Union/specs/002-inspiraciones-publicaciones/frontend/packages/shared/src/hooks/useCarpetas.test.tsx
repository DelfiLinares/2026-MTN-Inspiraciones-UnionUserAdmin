// Tests para useCarpetas y useCarpetaContenido (T039).
// Spec: HU-08, HU-10, RF-16, RF-19, RF-20, CB-05. Res.: A-5, A-7. Plan sección 6.

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VisibilidadCarpeta } from "../domain/enums";
import type { Carpeta, ItemCarpeta, Paginacion } from "../domain/tipos";
import { ErrorHttp } from "../services/errores";
import type { CarpetasService } from "../services/carpetasService";
import { clavesConsulta } from "./claves";
import { useCarpetaContenido, useCarpetas } from "./useCarpetas";

function crearCarpetaMock(
  id: string,
  nombre: string,
  visibilidad: VisibilidadCarpeta = VisibilidadCarpeta.PRIVADA,
  cantidadPublicaciones = 0,
): Carpeta {
  return {
    id,
    nombre,
    visibilidad,
    cantidadPublicaciones,
  };
}

describe("useCarpetas", () => {
  it("obtiene el listado de carpetas exitosamente", async () => {
    const queryClient = new QueryClient();
    const carpetasMock: Carpeta[] = [
      crearCarpetaMock("c-1", "Diseño", VisibilidadCarpeta.PRIVADA, 3),
      crearCarpetaMock("c-2", "Fotografía", VisibilidadCarpeta.PUBLICA, 1),
    ];

    const mockService: CarpetasService = {
      listar: vi.fn().mockResolvedValue(carpetasMock),
      crear: vi.fn(),
      actualizar: vi.fn(),
      borrar: vi.fn(),
      obtenerContenido: vi.fn(),
      guardarPublicacion: vi.fn(),
      quitarPublicacion: vi.fn(),
      obtenerCarpetasDePublicacion: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCarpetas({ carpetasService: mockService }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.estaCargando).toBe(false);
    });

    expect(result.current.carpetas).toEqual(carpetasMock);
    expect(mockService.listar).toHaveBeenCalledTimes(1);
  });

  it("crea una carpeta e invalida la caché de carpetas", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const nuevaCarpeta = crearCarpetaMock("c-nueva", "Ilustración");
    const onCrearExito = vi.fn();

    const mockService: CarpetasService = {
      listar: vi.fn().mockResolvedValue([]),
      crear: vi.fn().mockResolvedValue(nuevaCarpeta),
      actualizar: vi.fn(),
      borrar: vi.fn(),
      obtenerContenido: vi.fn(),
      guardarPublicacion: vi.fn(),
      quitarPublicacion: vi.fn(),
      obtenerCarpetasDePublicacion: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useCarpetas({
          carpetasService: mockService,
          onCrearExito,
        }),
      { wrapper },
    );

    let res: Carpeta | undefined;
    await act(async () => {
      res = await result.current.crearCarpeta({ nombre: "Ilustración" });
    });

    expect(res).toEqual(nuevaCarpeta);
    expect(mockService.crear).toHaveBeenCalledWith({ nombre: "Ilustración" });
    expect(onCrearExito).toHaveBeenCalledWith(nuevaCarpeta);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: clavesConsulta.carpetas.todas(),
    });
  });

  it("renombra y actualiza visibilidad de una carpeta", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const actualizada = crearCarpetaMock("c-1", "Nuevo Nombre", VisibilidadCarpeta.PUBLICA);
    const onActualizarExito = vi.fn();

    const mockService: CarpetasService = {
      listar: vi.fn().mockResolvedValue([]),
      crear: vi.fn(),
      actualizar: vi.fn().mockResolvedValue(actualizada),
      borrar: vi.fn(),
      obtenerContenido: vi.fn(),
      guardarPublicacion: vi.fn(),
      quitarPublicacion: vi.fn(),
      obtenerCarpetasDePublicacion: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useCarpetas({
          carpetasService: mockService,
          onActualizarExito,
        }),
      { wrapper },
    );

    // Renombrar
    await act(async () => {
      await result.current.renombrarCarpeta("c-1", "Nuevo Nombre");
    });
    expect(mockService.actualizar).toHaveBeenCalledWith("c-1", { nombre: "Nuevo Nombre" });

    // Cambiar visibilidad
    await act(async () => {
      await result.current.cambiarVisibilidadCarpeta("c-1", VisibilidadCarpeta.PUBLICA);
    });
    expect(mockService.actualizar).toHaveBeenCalledWith("c-1", {
      visibilidad: VisibilidadCarpeta.PUBLICA,
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: clavesConsulta.carpetas.todas(),
    });
  });

  it("elimina una carpeta e invalida la caché", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const onBorrarExito = vi.fn();

    const mockService: CarpetasService = {
      listar: vi.fn().mockResolvedValue([]),
      crear: vi.fn(),
      actualizar: vi.fn(),
      borrar: vi.fn().mockResolvedValue(undefined),
      obtenerContenido: vi.fn(),
      guardarPublicacion: vi.fn(),
      quitarPublicacion: vi.fn(),
      obtenerCarpetasDePublicacion: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useCarpetas({
          carpetasService: mockService,
          onBorrarExito,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.borrarCarpeta("c-eliminar");
    });

    expect(mockService.borrar).toHaveBeenCalledWith("c-eliminar");
    expect(onBorrarExito).toHaveBeenCalledWith("c-eliminar");
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: clavesConsulta.carpetas.todas(),
    });
  });

  it("captura errores en mutaciones y llama a onError", async () => {
    const queryClient = new QueryClient();
    const onError = vi.fn();
    const errorHttp = new ErrorHttp(409, "Ya tenés una carpeta con ese nombre");

    const mockService: CarpetasService = {
      listar: vi.fn().mockResolvedValue([]),
      crear: vi.fn().mockRejectedValue(errorHttp),
      actualizar: vi.fn(),
      borrar: vi.fn(),
      obtenerContenido: vi.fn(),
      guardarPublicacion: vi.fn(),
      quitarPublicacion: vi.fn(),
      obtenerCarpetasDePublicacion: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useCarpetas({
          carpetasService: mockService,
          onError,
        }),
      { wrapper },
    );

    await expect(result.current.crearCarpeta({ nombre: "Duplicada" })).rejects.toThrow();
    expect(onError).toHaveBeenCalledWith(errorHttp);
  });
});

describe("useCarpetaContenido", () => {
  it("obtiene el contenido de una carpeta con paginación infinita (CB-05, RF-19)", async () => {
    const queryClient = new QueryClient();

    const item1: ItemCarpeta = {
      disponible: true,
      publicacion: {
        id: "p-1",
        titulo: "Post 1",
        descripcion: "",
        contenido: "https://ejemplo.test/1.png",
        formato: "PNG" as any,
        tipoContenido: "IMAGEN" as any,
        categoria: "General",
        etiquetas: [],
        autor: { id: "u-1", nombre: "Autor 1" },
        fechaCreacion: "2026-10-01T10:00:00Z",
        fechaUltimaEdicion: "2026-10-01T10:00:00Z",
        cantidadLikes: 2,
        estado: "ACTIVA",
        likeadaPorMi: false,
        guardadaPorMi: true,
        reportadaPorMi: false,
      },
    };

    const item2NoDisponible: ItemCarpeta = {
      id: "item-2",
      disponible: false,
    };

    const pagina1: Paginacion<ItemCarpeta> = {
      items: [item1],
      siguienteCursor: "cursor-pag-2",
    };

    const pagina2: Paginacion<ItemCarpeta> = {
      items: [item2NoDisponible],
      siguienteCursor: undefined,
    };

    const mockService: CarpetasService = {
      listar: vi.fn(),
      crear: vi.fn(),
      actualizar: vi.fn(),
      borrar: vi.fn(),
      obtenerContenido: vi.fn().mockImplementation(async (_id, opciones) => {
        if (opciones?.cursor === "cursor-pag-2") {
          return pagina2;
        }
        return pagina1;
      }),
      guardarPublicacion: vi.fn(),
      quitarPublicacion: vi.fn(),
      obtenerCarpetasDePublicacion: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useCarpetaContenido({
          carpetaId: "c-1",
          carpetasService: mockService,
          limite: 10,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.estaCargando).toBe(false);
    });

    expect(result.current.items).toEqual([item1]);
    expect(result.current.tieneMas).toBe(true);

    // Cargar siguiente página
    act(() => {
      result.current.cargarMas();
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2);
    });

    expect(result.current.items).toEqual([item1, item2NoDisponible]);
    expect(result.current.tieneMas).toBe(false);
  });
});
