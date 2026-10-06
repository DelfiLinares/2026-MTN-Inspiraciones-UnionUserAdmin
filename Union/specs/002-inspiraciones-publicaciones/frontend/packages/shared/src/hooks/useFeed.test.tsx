// Tests para los hooks useFeed y usePublicacion (T036).
// Spec: HU-04, HU-05, HU-06, RF-25 a RF-27. Res.: D-08, A-10, A-12.

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormatoArchivo, TipoContenido } from "../domain/enums";
import type { Publicacion } from "../domain/tipos";
import { ErrorHttp } from "../services/errores";
import type {
  FiltrosPublicaciones,
  PublicacionesService,
} from "../services/publicacionesService";
import { LIMITE_PAGINA_FEED, useFeed } from "./useFeed";
import { usePublicacion } from "./usePublicacion";

function crearPublicacionMock(id: string, titulo: string, tipo = TipoContenido.IMAGEN): Publicacion {
  return {
    id,
    titulo,
    descripcion: `Descripción de ${titulo}`,
    contenido: "https://ejemplo.test/img.png",
    formato: FormatoArchivo.PNG,
    tipoContenido: tipo,
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

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useFeed", () => {
  it("carga la primera página de publicaciones respetando el límite por página D-08", async () => {
    expect(LIMITE_PAGINA_FEED).toBe(20);

    const publicacionesPagina1 = Array.from({ length: 20 }, (_, i) =>
      crearPublicacionMock(`p-${i + 1}`, `Obra ${i + 1}`),
    );

    const publicacionesServiceMock: PublicacionesService = {
      listar: async (filtros?: FiltrosPublicaciones) => {
        expect(filtros?.limite).toBe(20);
        return {
          items: publicacionesPagina1,
          siguienteCursor: "20",
        };
      },
      listarPropias: async () => ({ items: [] }),
      obtenerPorId: async () => Promise.resolve(publicacionesPagina1[0] ?? crearPublicacionMock("fallback", "fallback")),
      crear: async () => Promise.resolve(publicacionesPagina1[0] ?? crearPublicacionMock("fallback", "fallback")),
      editar: async () => Promise.resolve(publicacionesPagina1[0] ?? crearPublicacionMock("fallback", "fallback")),
      borrar: async () => {},
    };

    const wrapper = crearWrapper();
    const { result } = renderHook(
      () => useFeed({ publicacionesService: publicacionesServiceMock }),
      { wrapper },
    );

    expect(result.current.estaCargando).toBe(true);

    await waitFor(() => {
      expect(result.current.estaCargando).toBe(false);
    });

    expect(result.current.publicaciones).toHaveLength(20);
    expect(result.current.tieneSiguientePagina).toBe(true);
    expect(result.current.esVacio).toBe(false);
    expect(result.current.tieneError).toBe(false);
  });

  it("permite paginación infinita cargando la siguiente página", async () => {
    const pagina1 = [crearPublicacionMock("p-1", "Obra 1")];
    const pagina2 = [crearPublicacionMock("p-2", "Obra 2")];

    const publicacionesServiceMock: PublicacionesService = {
      listar: async (filtros?: FiltrosPublicaciones) => {
        if (filtros?.cursor === "1") {
          return { items: pagina2, siguienteCursor: undefined };
        }
        return { items: pagina1, siguienteCursor: "1" };
      },
      listarPropias: async () => ({ items: [] }),
      obtenerPorId: async () => Promise.resolve(pagina1[0] ?? crearPublicacionMock("fallback", "fallback")),
      crear: async () => Promise.resolve(pagina1[0] ?? crearPublicacionMock("fallback", "fallback")),
      editar: async () => Promise.resolve(pagina1[0] ?? crearPublicacionMock("fallback", "fallback")),
      borrar: async () => {},
    };

    const wrapper = crearWrapper();
    const { result } = renderHook(
      () => useFeed({ publicacionesService: publicacionesServiceMock }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.estaCargando).toBe(false);
    });

    expect(result.current.publicaciones).toHaveLength(1);
    expect(result.current.tieneSiguientePagina).toBe(true);

    await result.current.cargarMas();

    await waitFor(() => {
      expect(result.current.publicaciones).toHaveLength(2);
    });

    expect(result.current.tieneSiguientePagina).toBe(false);
  });

  it("identifica el estado vacío cuando no hay publicaciones", async () => {
    const publicacionesServiceMock: PublicacionesService = {
      listar: async () => ({ items: [], siguienteCursor: undefined }),
      listarPropias: async () => ({ items: [] }),
      obtenerPorId: async () => {
        throw new ErrorHttp(404);
      },
      crear: async () => {
        throw new ErrorHttp(500);
      },
      editar: async () => {
        throw new ErrorHttp(500);
      },
      borrar: async () => {},
    };

    const wrapper = crearWrapper();
    const { result } = renderHook(
      () => useFeed({ publicacionesService: publicacionesServiceMock }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.estaCargando).toBe(false);
    });

    expect(result.current.publicaciones).toHaveLength(0);
    expect(result.current.esVacio).toBe(true);
    expect(result.current.tieneError).toBe(false);
  });

  it("propaga errores de red o servidor en el listado", async () => {
    const publicacionesServiceMock: PublicacionesService = {
      listar: async () => {
        throw new ErrorHttp("red");
      },
      listarPropias: async () => ({ items: [] }),
      obtenerPorId: async () => {
        throw new ErrorHttp(404);
      },
      crear: async () => {
        throw new ErrorHttp(500);
      },
      editar: async () => {
        throw new ErrorHttp(500);
      },
      borrar: async () => {},
    };

    const wrapper = crearWrapper();
    const { result } = renderHook(
      () => useFeed({ publicacionesService: publicacionesServiceMock }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.estaCargando).toBe(false);
    });

    expect(result.current.tieneError).toBe(true);
    expect(result.current.error).toBeInstanceOf(ErrorHttp);
  });
});

describe("usePublicacion", () => {
  it("obtiene el detalle de una publicación existente por ID (HU-05)", async () => {
    const pubMock = crearPublicacionMock("p-100", "Acuarela Viva");

    const publicacionesServiceMock: PublicacionesService = {
      listar: async () => ({ items: [] }),
      listarPropias: async () => ({ items: [] }),
      obtenerPorId: async (id: string) => {
        expect(id).toBe("p-100");
        return pubMock;
      },
      crear: async () => pubMock,
      editar: async () => pubMock,
      borrar: async () => {},
    };

    const wrapper = crearWrapper();
    const { result } = renderHook(
      () => usePublicacion({ id: "p-100", publicacionesService: publicacionesServiceMock }),
      { wrapper },
    );

    expect(result.current.estaCargando).toBe(true);

    await waitFor(() => {
      expect(result.current.estaCargando).toBe(false);
    });

    expect(result.current.publicacion).toEqual(pubMock);
    expect(result.current.tieneError).toBe(false);
  });

  it("maneja el error 404 cuando la publicación no existe o fue eliminada", async () => {
    const publicacionesServiceMock: PublicacionesService = {
      listar: async () => ({ items: [] }),
      listarPropias: async () => ({ items: [] }),
      obtenerPorId: async () => {
        throw new ErrorHttp(404);
      },
      crear: async () => {
        throw new ErrorHttp(500);
      },
      editar: async () => {
        throw new ErrorHttp(500);
      },
      borrar: async () => {},
    };

    const wrapper = crearWrapper();
    const { result } = renderHook(
      () =>
        usePublicacion({
          id: "p-inexistente",
          publicacionesService: publicacionesServiceMock,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.estaCargando).toBe(false);
    });

    expect(result.current.publicacion).toBeNull();
    expect(result.current.tieneError).toBe(true);
    expect(result.current.error).toMatchObject({ codigo: 404 });
  });
});
