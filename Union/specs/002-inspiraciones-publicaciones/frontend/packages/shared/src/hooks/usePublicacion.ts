// Hook para obtener el detalle de una publicación por ID (T036).
// Spec: HU-05, RF-26.

import { useQuery } from "@tanstack/react-query";
import type { Publicacion } from "../domain/tipos";
import type { PublicacionesService } from "../services/publicacionesService";
import { clavesConsulta } from "./claves";

export interface UsePublicacionOpciones {
  readonly id: string;
  readonly publicacionesService: PublicacionesService;
  readonly habilitado?: boolean;
}

export interface UsePublicacionResultado {
  readonly publicacion: Publicacion | null;
  readonly estaCargando: boolean;
  readonly tieneError: boolean;
  readonly error: unknown;
  readonly recargar: () => Promise<void>;
}

export function usePublicacion({
  id,
  publicacionesService,
  habilitado = true,
}: UsePublicacionOpciones): UsePublicacionResultado {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: clavesConsulta.publicaciones.detalle(id),
    queryFn: () => publicacionesService.obtenerPorId(id),
    enabled: Boolean(id) && habilitado,
  });

  return {
    publicacion: data ?? null,
    estaCargando: isLoading,
    tieneError: isError,
    error,
    recargar: async () => {
      await refetch();
    },
  };
}
