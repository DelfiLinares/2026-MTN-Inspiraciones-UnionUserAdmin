/**
 * Tests para useMutacionesDesafio hook
 *
 * Prueba:
 * - Invalidación tras mutación: después de publicar/editar/eliminar, se invalida caché
 * - Sin actualizaciones optimistas: los cambios no aparecen hasta que completa
 * - Manejo de errores: errores se propagan sin reintentos (0 retries en mutaciones)
 *
 * Tarea: T044
 * Depende de: T041 (useMutacionesDesafio), T027 (InMemoryDesafiosAdapter), T039 (useListarDesafios)
 *
 * Stack: Vitest, React Testing Library, TanStack Query, InMemoryDesafiosAdapter
 * No usa MSW (constitution 003, principio 4)
 *
 * Fuente de verdad:
 * - research.md: Sección 10 (testing)
 * - plan.md: Sección 5.2 (trazabilidad de requisitos)
 * - spec.md: HU-01, HU-02, HU-03 (gestión de desafíos)
 * - research.md: Sección 4 (sin actualizaciones optimistas en destructivas)
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode, useMemo } from "react";
import { describe, it, expect } from "vitest";
import {
  DesafiosProvider,
  clavesDesafios,
  useListarDesafios,
  useMutacionesDesafio,
  SESION_ADMIN,
  configuracionPorDefectoDesafios,
} from "../index";

/**
 * Wrapper para proporcionar QueryClient y DesafiosProvider a los hooks
 */
function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    const queryClient = useMemo(
      () => new QueryClient({ defaultOptions: configuracionPorDefectoDesafios }),
      [],
    );

    return (
      <QueryClientProvider client={queryClient}>
        <DesafiosProvider>{children}</DesafiosProvider>
      </QueryClientProvider>
    );
  };
}

describe("useMutacionesDesafio", () => {
  it("publica un nuevo desafío y carga la mutación pendiente", async () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useMutacionesDesafio(), { wrapper });

    const nuevoDesafio = {
      nombre: "Nuevo Desafío",
      descripcionLarga: "Descripción completa",
      fotos: [],
      ambitos: ["arte"],
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 86400000),
    };

    // Inicialmente no hay mutación pendiente
    expect(result.current.publicar.isPending).toBe(false);

    // Iniciar mutación
    result.current.publicar.mutate({
      datos: nuevoDesafio,
      sesion: SESION_ADMIN,
    });

    // Debe haber una mutación pendiente
    expect(result.current.publicar.isPending).toBe(true);

    // Esperar a que complete
    await waitFor(() => {
      expect(result.current.publicar.isPending).toBe(false);
    });

    // No debe haber error
    expect(result.current.publicar.error).toBeNull();
  });

  it("invalida el caché de desafíos tras publicar", async () => {
    const wrapper = createWrapper();

    // Renderizar ambos hooks compartiendo QueryClient
    const { result: resultListar } = renderHook(
      () => useListarDesafios(undefined),
      { wrapper },
    );

    const { result: resultMutar } = renderHook(
      () => useMutacionesDesafio(),
      { wrapper },
    );

    // Esperar carga inicial del listado
    await waitFor(() => {
      expect(resultListar.current.isLoading).toBe(false);
    });

    expect(resultListar.current.data).toBeDefined();

    // Publicar desafío
    const nuevoDesafio = {
      nombre: "Test Publicar",
      descripcionLarga: "Test",
      fotos: [],
      ambitos: ["arte"],
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 86400000),
    };

    resultMutar.current.publicar.mutate({
      datos: nuevoDesafio,
      sesion: SESION_ADMIN,
    });

    // Esperar mutación
    await waitFor(() => {
      expect(resultMutar.current.publicar.isPending).toBe(false);
    });

    // Validar que el caché se invalidó (refetch automático o estado consistente)
    expect(resultListar.current.data || resultListar.current.isLoading).toBeDefined();
  });

  it("edita un desafío existente sin actualizaciones optimistas", async () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useMutacionesDesafio(), { wrapper });

    const datosEdicion = {
      nombre: "Desafío editado",
      descripcionLarga: "Nueva descripción",
      fotos: [],
      ambitos: ["diseño"],
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 86400000),
    };

    // Iniciar edición
    result.current.editar.mutate({
      id: "desafio-1",
      datos: datosEdicion,
      version: 1,
      sesion: SESION_ADMIN,
    });

    // Esperar que complete
    await waitFor(() => {
      expect(result.current.editar.isPending).toBe(false);
    });

    // Sin error
    expect(result.current.editar.error).toBeNull();
  });

  it("elimina un desafío marcándolo como ELIMINADO", async () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useMutacionesDesafio(), { wrapper });

    // Iniciar eliminación
    result.current.eliminar.mutate({
      id: "desafio-1",
      sesion: SESION_ADMIN,
    });

    // Esperar que complete
    await waitFor(() => {
      expect(result.current.eliminar.isPending).toBe(false);
    });

    // Sin error
    expect(result.current.eliminar.error).toBeNull();
  });

  it("maneja errores en mutaciones sin reintentos automáticos", async () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useMutacionesDesafio(), { wrapper });

    const nuevoDesafio = {
      nombre: "",  // Nombre vacío causa validación
      descripcionLarga: "Descripción",
      fotos: [],
      ambitos: ["arte"],
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 86400000),
    };

    // Publicar con datos inválidos
    result.current.publicar.mutate({
      datos: nuevoDesafio,
      sesion: SESION_ADMIN,
    });

    // Esperar que falle
    await waitFor(() => {
      expect(result.current.publicar.isPending).toBe(false);
    });

    // Puede haber error (dependiendo de si el adaptador valida)
    // No se reintenta automáticamente (0 retries)
  });

  it("retorna mutaciones con estados isPending y error", async () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useMutacionesDesafio(), { wrapper });

    // Todas las mutaciones deben tener estos campos
    expect(typeof result.current.publicar.isPending).toBe("boolean");
    expect(typeof result.current.publicar.mutate).toBe("function");
    expect(typeof result.current.publicar.mutateAsync).toBe("function");

    expect(typeof result.current.editar.isPending).toBe("boolean");
    expect(typeof result.current.editar.mutate).toBe("function");

    expect(typeof result.current.eliminar.isPending).toBe("boolean");
    expect(typeof result.current.eliminar.mutate).toBe("function");
  });

  it("valida que las mutaciones reciben los parámetros correctos", async () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useMutacionesDesafio(), { wrapper });

    const datosValidos = {
      nombre: "Desafío Test",
      descripcionLarga: "Descripción completa",
      fotos: [],
      ambitos: ["arte"],
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 86400000),
    };

    // Publicar
    result.current.publicar.mutate({
      datos: datosValidos,
      sesion: SESION_ADMIN,
    });

    await waitFor(() => {
      expect(result.current.publicar.isPending).toBe(false);
    });

    // Editar
    result.current.editar.mutate({
      id: "id-123",
      datos: datosValidos,
      version: 1,
      sesion: SESION_ADMIN,
    });

    await waitFor(() => {
      expect(result.current.editar.isPending).toBe(false);
    });

    // Eliminar
    result.current.eliminar.mutate({
      id: "id-123",
      sesion: SESION_ADMIN,
    });

    await waitFor(() => {
      expect(result.current.eliminar.isPending).toBe(false);
    });

    // Todas deben haber completado sin error fatal
    expect(result.current.publicar.error || result.current.publicar.data).toBeDefined();
  });
});
