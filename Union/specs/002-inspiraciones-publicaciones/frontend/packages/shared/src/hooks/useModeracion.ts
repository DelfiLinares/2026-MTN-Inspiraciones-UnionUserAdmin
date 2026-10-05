// Hooks para la moderación de publicaciones reportadas (T042).
// Permite a usuarios con rol ADMIN listar publicaciones reportadas (con paginación infinita),
// ver el detalle de una reportada y eliminar publicaciones con invalidación de caché.
// Spec: HU-12, HU-13, RF-07, RF-24. Res.: A-1, A-16. Plan sección 6.

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import type { Paginacion, PublicacionReportada } from "../domain/tipos";
import type {
  ModeracionService,
  OpcionesPaginacionModeracion,
} from "../services/moderacionService";
import { clavesConsulta } from "./claves";

export interface UseModeracionReportadasOpciones {
  readonly moderacionService: ModeracionService;
  readonly limite?: number;
}

export interface UseModeracionReportadasResultado {
  readonly reportadas: readonly PublicacionReportada[];
  readonly estaCargando: boolean;
  readonly estaCargandoMas: boolean;
  readonly tieneMas: boolean;
  readonly cargarMas: () => void;
  readonly tieneError: boolean;
  readonly error: unknown;
  readonly recargar: () => Promise<unknown>;
}

export function useModeracionReportadas({
  moderacionService,
  limite = 20,
}: UseModeracionReportadasOpciones): UseModeracionReportadasResultado {
  const query = useInfiniteQuery<
    Paginacion<PublicacionReportada>,
    unknown,
    InfiniteData<Paginacion<PublicacionReportada>>,
    ReturnType<typeof clavesConsulta.moderacion.reportadas>,
    string | undefined
  >({
    queryKey: clavesConsulta.moderacion.reportadas({ limite }),
    queryFn: async ({ pageParam }) => {
      const opciones: OpcionesPaginacionModeracion = {
        limite,
        cursor: pageParam,
      };
      return moderacionService.listarReportadas(opciones);
    },
    initialPageParam: undefined,
    getNextPageParam: (ultimaPagina) => ultimaPagina.siguienteCursor ?? undefined,
  });

  const reportadas = query.data?.pages.flatMap((pagina) => pagina.items) ?? [];

  return {
    reportadas,
    estaCargando: query.isLoading,
    estaCargandoMas: query.isFetchingNextPage,
    tieneMas: Boolean(query.hasNextPage),
    cargarMas: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    },
    tieneError: query.isError,
    error: query.error,
    recargar: query.refetch,
  };
}

export interface UseModeracionDetalleOpciones {
  readonly publicacionId: string;
  readonly moderacionService: ModeracionService;
}

export interface UseModeracionDetalleResultado {
  readonly reportada: PublicacionReportada | undefined;
  readonly estaCargando: boolean;
  readonly tieneError: boolean;
  readonly error: unknown;
  readonly recargar: () => Promise<unknown>;
}

export function useModeracionDetalle({
  publicacionId,
  moderacionService,
}: UseModeracionDetalleOpciones): UseModeracionDetalleResultado {
  const query = useQuery<PublicacionReportada>({
    queryKey: clavesConsulta.moderacion.detalle(publicacionId),
    queryFn: () => moderacionService.obtenerReportadaPorId(publicacionId),
    enabled: Boolean(publicacionId),
  });

  return {
    reportada: query.data,
    estaCargando: query.isLoading,
    tieneError: query.isError,
    error: query.error,
    recargar: query.refetch,
  };
}

export interface UseModeracionMutacionesOpciones {
  readonly moderacionService: ModeracionService;
  readonly onEliminarExito?: (publicacionId: string) => void;
  readonly onError?: (error: unknown) => void;
}

export interface UseModeracionMutacionesResultado {
  readonly eliminarPublicacion: (publicacionId: string) => Promise<void>;
  readonly estaEliminando: boolean;
  readonly error: unknown;
}

export function useModeracionMutaciones({
  moderacionService,
  onEliminarExito,
  onError,
}: UseModeracionMutacionesOpciones): UseModeracionMutacionesResultado {
  const queryClient = useQueryClient();

  const mutacionEliminar = useMutation<void, unknown, string>({
    mutationFn: (publicacionId) => moderacionService.eliminarPublicacion(publicacionId),
    onSuccess: (_data, publicacionId) => {
      // Invalida la cola de moderación
      queryClient.invalidateQueries({
        queryKey: clavesConsulta.moderacion.todas(),
      });
      // Invalida los listados públicos de publicaciones
      queryClient.invalidateQueries({
        queryKey: clavesConsulta.publicaciones.todas(),
      });
      // Invalida las carpetas de usuarios que contenían publicaciones
      queryClient.invalidateQueries({
        queryKey: clavesConsulta.carpetas.todas(),
      });

      onEliminarExito?.(publicacionId);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  return {
    eliminarPublicacion: (publicacionId: string) =>
      mutacionEliminar.mutateAsync(publicacionId),
    estaEliminando: mutacionEliminar.isPending,
    error: mutacionEliminar.error,
  };
}
