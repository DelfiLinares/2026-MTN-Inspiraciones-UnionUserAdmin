// Tests para el proveedor y hook useSesion (T035).
// Spec: RF-10, RF-10b. Res.: A-15.

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormatoArchivo, RolUsuario } from "../domain/enums";
import type { UsuarioActual } from "../domain/tipos";
import { ErrorHttp } from "../services/errores";
import type { ConfiguracionArchivos, SesionService } from "../services/sesionService";
import { ProveedorSesion, useSesion } from "./useSesion";

const usuarioRegularMock: UsuarioActual = {
  id: "u-1",
  nombre: "Ana Artista",
  rol: RolUsuario.USER,
};

const usuarioAdminMock: UsuarioActual = {
  id: "u-admin",
  nombre: "Carlos Admin",
  rol: RolUsuario.ADMIN,
};

const configMock: ConfiguracionArchivos = {
  formatosPermitidos: [FormatoArchivo.PNG, FormatoArchivo.JPEG],
  tamanoMaxBytes: 5 * 1024 * 1024,
};

function crearSesionServiceMock(
  usuario: UsuarioActual | null,
  error?: ErrorHttp,
): SesionService {
  return {
    obtenerSesion: async () => {
      if (error) throw error;
      if (!usuario) throw new ErrorHttp(401);
      return usuario;
    },
    obtenerConfiguracion: async () => configMock,
  };
}

function crearWrapper(sesionService: SesionService) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ProveedorSesion sesionService={sesionService}>{children}</ProveedorSesion>
      </QueryClientProvider>
    );
  };
}

describe("useSesion y ProveedorSesion", () => {
  it("lanza un error si se invoca useSesion fuera de ProveedorSesion", () => {
    expect(() => renderHook(() => useSesion())).toThrow(
      "useSesion debe utilizarse dentro de un ProveedorSesion",
    );
  });

  it("provee datos de usuario autenticado con rol USER (RF-10, A-15)", async () => {
    const mockService = crearSesionServiceMock(usuarioRegularMock);
    const wrapper = crearWrapper(mockService);

    const { result } = renderHook(() => useSesion(), { wrapper });

    expect(result.current.estaCargando).toBe(true);

    await waitFor(() => {
      expect(result.current.estaCargando).toBe(false);
    });

    expect(result.current.usuario).toEqual(usuarioRegularMock);
    expect(result.current.rol).toBe(RolUsuario.USER);
    expect(result.current.esAdmin).toBe(false);
    expect(result.current.estaAutenticado).toBe(true);
    expect(result.current.configuracion).toEqual(configMock);
    expect(result.current.tieneError).toBe(false);
  });

  it("provee datos de usuario autenticado con rol ADMIN (RF-10b, A-15)", async () => {
    const mockService = crearSesionServiceMock(usuarioAdminMock);
    const wrapper = crearWrapper(mockService);

    const { result } = renderHook(() => useSesion(), { wrapper });

    await waitFor(() => {
      expect(result.current.estaCargando).toBe(false);
    });

    expect(result.current.usuario).toEqual(usuarioAdminMock);
    expect(result.current.rol).toBe(RolUsuario.ADMIN);
    expect(result.current.esAdmin).toBe(true);
    expect(result.current.estaAutenticado).toBe(true);
  });

  it("maneja el caso de sesión no autenticada (401)", async () => {
    const mockService = crearSesionServiceMock(null);
    const wrapper = crearWrapper(mockService);

    const { result } = renderHook(() => useSesion(), { wrapper });

    await waitFor(() => {
      expect(result.current.estaCargando).toBe(false);
    });

    expect(result.current.usuario).toBeNull();
    expect(result.current.rol).toBeNull();
    expect(result.current.estaAutenticado).toBe(false);
    expect(result.current.esAdmin).toBe(false);
    expect(result.current.tieneError).toBe(true);
  });

  it("permite recargar la sesión manualmente", async () => {
    let usuarioActual: UsuarioActual | null = usuarioRegularMock;
    const servicioDinamico: SesionService = {
      obtenerSesion: async () => {
        if (!usuarioActual) throw new ErrorHttp(401);
        return usuarioActual;
      },
      obtenerConfiguracion: async () => configMock,
    };

    const wrapper = crearWrapper(servicioDinamico);
    const { result } = renderHook(() => useSesion(), { wrapper });

    await waitFor(() => {
      expect(result.current.estaAutenticado).toBe(true);
    });

    // Cambiamos el usuario a ADMIN y recargamos
    usuarioActual = usuarioAdminMock;
    await result.current.recargarSesion();

    await waitFor(() => {
      expect(result.current.esAdmin).toBe(true);
      expect(result.current.usuario?.nombre).toBe("Carlos Admin");
    });
  });
});
