// Hook para el feed público con paginación infinita y filtros (T036).
// Spec: HU-04, HU-05, HU-06, RF-25 a RF-27. Res.: D-08 (20 ítems por página), A-10, A-12.

import { useInfiniteQuery } from "@tanstack/react-query";
import type { TipoContenido } from "../domain/enums";
import type { Paginacion, Publicacion } from "../domain/tipos";
import type { PublicacionesService } from "../services/publicacionesService";
import { clavesConsulta, type FiltrosPublicacionesClave } from "./claves";

export const LIMITE_PAGINA_FEED = 20;

export interface FiltrosFeed {
  readonly q?: string;
  readonly etiqueta?: string;
  readonly categoria?: string;
  readonly tipo?: TipoContenido;
}

export interface UseFeedOpciones {
  readonly filtros?: FiltrosFeed;
  readonly publicacionesService: PublicacionesService;
  readonly habilitado?: boolean;
}

export interface UseFeedResultado {
  readonly publicaciones: readonly Publicacion[];
  readonly paginas: readonly Paginacion<Publicacion>[];
  readonly estaCargando: boolean;
  readonly estaCargandoSiguientePagina: boolean;
  readonly tieneSiguientePagina: boolean;
  readonly esVacio: boolean;
  readonly tieneError: boolean;
  readonly error: unknown;
  readonly cargarMas: () => Promise<void>;
  readonly recargar: () => Promise<void>;
}

export function useFeed({
  filtros,
  publicacionesService,
  habilitado = true,
}: UseFeedOpciones): UseFeedResultado {
  const claveFiltros: FiltrosPublicacionesClave | undefined = filtros
    ? {
        q: filtros.q,
        etiqueta: filtros.etiqueta,
        categoria: filtros.categoria,
        tipo: filtros.tipo,
      }
    : undefined;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    error,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: clavesConsulta.publicaciones.listado(claveFiltros),
    queryFn: async ({ pageParam }) => {
      return publicacionesService.listar({
        ...filtros,
        cursor: pageParam,
        limite: LIMITE_PAGINA_FEED,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (ultimaPagina) => ultimaPagina.siguienteCursor,
    enabled: habilitado,
  });

  const paginas = data?.pages ?? [];
  const publicaciones = paginas.flatMap((pag) => pag.items);
  const esVacio = !isLoading && !isError && publicaciones.length === 0;

  return {
    publicaciones,
    paginas,
    estaCargando: isLoading,
    estaCargandoSiguientePagina: isFetchingNextPage,
    tieneSiguientePagina: Boolean(hasNextPage),
    esVacio,
    tieneError: isError,
    error,
    cargarMas: async () => {
      if (hasNextPage && !isFetchingNextPage) {
        await fetchNextPage();
      }
    },
    recargar: async () => {
      await refetch();
    },
  };
}
