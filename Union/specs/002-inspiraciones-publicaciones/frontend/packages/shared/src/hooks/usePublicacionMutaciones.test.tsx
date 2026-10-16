// Tests para usePublicacionMutaciones (T037).
// Spec: HU-01, HU-02, HU-03, RF-01 a RF-05, RF-28. Plan sección 6.

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormatoArchivo, TipoContenido } from "../domain/enums";
import type { Publicacion } from "../domain/tipos";
import { ErrorHttp } from "../services/errores";
import type {
  DatosCrearPublicacion,
  DatosEditarPublicacion,
  PublicacionesService,
} from "../services/publicacionesService";
import { clavesConsulta } from "./claves";
import { usePublicacionMutaciones } from "./usePublicacionMutaciones";

function crearPublicacionMock(id: string, titulo: string): Publicacion {
  return {
    id,
    titulo,
    descripcion: `Descripción de ${titulo}`,
    contenido: "https://ejemplo.test/img.png",
    formato: FormatoArchivo.PNG,
    tipoContenido: TipoContenido.IMAGEN,
    categoria: "General",
    etiquetas: ["arte"],
    autor: { id: "u-1", nombre: "Ana" },
    fechaCreacion: "2026-10-01T10:00:00Z",
    fechaUltimaEdicion: "2026-10-01T10:00:00Z",
    cantidadLikes: 0,
    estado: "ACTIVA" as const,
    likeadaPorMi: false,
    guardadaPorMi: false,
    reportadaPorMi: false,
  };
}

describe("usePublicacionMutaciones", () => {
  it("crea una publicación, invalida listados y ejecuta callback onCrearExito", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const creadaMock = crearPublicacionMock("p-nueva", "Obra Nueva");
    const onCrearExito = vi.fn();

    const mockService: PublicacionesService = {
      listar: async () => ({ items: [] }),
      listarPropias: async () => ({ items: [] }),
      obtenerPorId: async () => creadaMock,
      crear: async (datos: DatosCrearPublicacion) => {
        expect(datos.titulo).toBe("Obra Nueva");
        return creadaMock;
      },
      editar: async () => creadaMock,
      borrar: async () => {},
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        usePublicacionMutaciones({
          publicacionesService: mockService,
          onCrearExito,
        }),
      { wrapper },
    );

    const archivoMock = new File(["arte"], "arte.png", { type: "image/png" });
    const datos: DatosCrearPublicacion = {
      titulo: "Obra Nueva",
      descripcion: "Una descripción",
      categoria: "Pintura",
      etiquetas: ["nueva"],
      archivo: archivoMock,
    };

    const respuesta = await result.current.crear(datos);

    expect(respuesta).toEqual(creadaMock);
    expect(onCrearExito).toHaveBeenCalledWith(creadaMock);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: clavesConsulta.publicaciones.todas(),
    });
  });

  it("edita una publicación, invalida listados y detalle, y ejecuta onEditarExito", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const editadaMock = crearPublicacionMock("p-1", "Obra Modificada");
    const onEditarExito = vi.fn();

    const mockService: PublicacionesService = {
      listar: async () => ({ items: [] }),
      listarPropias: async () => ({ items: [] }),
      obtenerPorId: async () => editadaMock,
      crear: async () => editadaMock,
      editar: async (id: string, datos: DatosEditarPublicacion) => {
        expect(id).toBe("p-1");
        expect(datos.titulo).toBe("Obra Modificada");
        return editadaMock;
      },
      borrar: async () => {},
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        usePublicacionMutaciones({
          publicacionesService: mockService,
          onEditarExito,
        }),
      { wrapper },
    );

    const respuesta = await result.current.editar({
      id: "p-1",
      datos: { titulo: "Obra Modificada" },
    });

    expect(respuesta).toEqual(editadaMock);
    expect(onEditarExito).toHaveBeenCalledWith(editadaMock);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: clavesConsulta.publicaciones.todas(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: clavesConsulta.publicaciones.detalle("p-1"),
    });
  });

  it("borra una publicación, invalida listados, detalle y carpetas, y ejecuta onBorrarExito", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const onBorrarExito = vi.fn();
    let idBorrado = "";

    const mockService: PublicacionesService = {
      listar: async () => ({ items: [] }),
      listarPropias: async () => ({ items: [] }),
      obtenerPorId: async () => crearPublicacionMock("p-1", "X"),
      crear: async () => crearPublicacionMock("p-1", "X"),
      editar: async () => crearPublicacionMock("p-1", "X"),
      borrar: async (id: string) => {
        idBorrado = id;
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        usePublicacionMutaciones({
          publicacionesService: mockService,
          onBorrarExito,
        }),
      { wrapper },
    );

    await result.current.borrar("p-eliminar");

    expect(idBorrado).toBe("p-eliminar");
    expect(onBorrarExito).toHaveBeenCalledWith("p-eliminar");
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: clavesConsulta.publicaciones.todas(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: clavesConsulta.publicaciones.detalle("p-eliminar"),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: clavesConsulta.carpetas.todas(),
    });
  });

  it("captura errores y ejecuta callback onError", async () => {
    const queryClient = new QueryClient();
    const onError = vi.fn();
    const errorEsperado = new ErrorHttp(422, "Error de validación");

    const mockService: PublicacionesService = {
      listar: async () => ({ items: [] }),
      listarPropias: async () => ({ items: [] }),
      obtenerPorId: async () => crearPublicacionMock("p-1", "X"),
      crear: async () => {
        throw errorEsperado;
      },
      editar: async () => {
        throw errorEsperado;
      },
      borrar: async () => {},
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        usePublicacionMutaciones({
          publicacionesService: mockService,
          onError,
        }),
      { wrapper },
    );

    const archivoMock = new File(["arte"], "arte.png", { type: "image/png" });
    await expect(
      result.current.crear({
        titulo: "Error",
        descripcion: "",
        categoria: "",
        etiquetas: [],
        archivo: archivoMock,
      }),
    ).rejects.toThrow();

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(errorEsperado);
      expect(result.current.errorCrear).toEqual(errorEsperado);
    });
  });
});
