// Hook y proveedor de sesión única (T035).
// Centraliza la información del usuario autenticado y su rol (RF-10, RF-10b, A-15).
// Integra TanStack Query con SesionService.

import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { RolUsuario } from "../domain/enums";
import type { UsuarioActual } from "../domain/tipos";
import { clavesConsulta } from "./claves";
import type { ConfiguracionArchivos, SesionService } from "../services/sesionService";

export interface ContextoSesionValor {
  /** Usuario actualmente autenticado, o null si no hay sesión activa / falló */
  readonly usuario: UsuarioActual | null;
  /** Rol del usuario actual derivado de la sesión, o null */
  readonly rol: RolUsuario | null;
  /** Configuración informada por la API */
  readonly configuracion: ConfiguracionArchivos | null;
  /** Indica si la sesión está cargando por primera vez */
  readonly estaCargando: boolean;
  /** Indica si hay un error en la carga de la sesión (ej. 401, error de red) */
  readonly tieneError: boolean;
  /** Error capturado durante la obtención de la sesión */
  readonly error: unknown;
  /** Helper booleano para chequear si el usuario tiene rol ADMIN */
  readonly esAdmin: boolean;
  /** Helper booleano para chequear si hay un usuario autenticado */
  readonly estaAutenticado: boolean;
  /** Permite revalidar la sesión manualmente */
  readonly recargarSesion: () => Promise<void>;
}

const ContextoSesion = createContext<ContextoSesionValor | undefined>(undefined);

export interface ProveedorSesionProps {
  readonly children: React.ReactNode;
  readonly sesionService: SesionService;
}

export function ProveedorSesion({
  children,
  sesionService,
}: ProveedorSesionProps): React.JSX.Element {
  const {
    data: usuario,
    isLoading: cargandoSesion,
    isError: errorSesion,
    error: errSesion,
    refetch: refetchSesion,
  } = useQuery({
    queryKey: clavesConsulta.sesion(),
    queryFn: () => sesionService.obtenerSesion(),
  });

  const {
    data: configuracion,
    isLoading: cargandoConfig,
    isError: errorConfig,
  } = useQuery({
    queryKey: clavesConsulta.configuracion(),
    queryFn: () => sesionService.obtenerConfiguracion(),
  });

  const valor = useMemo<ContextoSesionValor>(() => {
    const usr = usuario ?? null;
    const rol = usr?.rol ?? null;
    const esAdmin = rol === RolUsuario.ADMIN;
    const estaAutenticado = usr !== null;
    const estaCargando = cargandoSesion || cargandoConfig;
    const tieneError = errorSesion || errorConfig;

    return {
      usuario: usr,
      rol,
      configuracion: configuracion ?? null,
      estaCargando,
      tieneError,
      error: errSesion,
      esAdmin,
      estaAutenticado,
      recargarSesion: async () => {
        await refetchSesion();
      },
    };
  }, [
    usuario,
    cargandoSesion,
    errorSesion,
    errSesion,
    configuracion,
    cargandoConfig,
    errorConfig,
    refetchSesion,
  ]);

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

export function useSesion(): ContextoSesionValor {
  const contexto = useContext(ContextoSesion);
  if (!contexto) {
    throw new Error("useSesion debe utilizarse dentro de un ProveedorSesion");
  }
  return contexto;
}
