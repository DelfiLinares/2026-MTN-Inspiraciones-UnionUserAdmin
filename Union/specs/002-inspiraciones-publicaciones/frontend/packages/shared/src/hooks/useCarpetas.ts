// Hooks para la gestión y consulta de carpetas (T039).
// Maneja listado de carpetas, contenido de carpeta paginado y mutaciones (crear, renombrar, eliminar, cambiar visibilidad).
// Invalida automáticamente las claves de consulta correspondientes.
// Spec: HU-08, HU-10, RF-16, RF-19, RF-20, CB-05. Res.: A-5, A-7. Plan sección 6.

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import type { VisibilidadCarpeta } from "../domain/enums";
import type { Carpeta, ItemCarpeta, Paginacion } from "../domain/tipos";
import type {
  CarpetasService,
  DatosActualizarCarpeta,
  DatosCrearCarpeta,
  OpcionesPaginacionCarpeta,
} from "../services/carpetasService";
import { clavesConsulta } from "./claves";

export interface UseCarpetasOpciones {
  readonly carpetasService: CarpetasService;
  readonly onCrearExito?: (carpeta: Carpeta) => void;
  readonly onActualizarExito?: (carpeta: Carpeta) => void;
  readonly onBorrarExito?: (id: string) => void;
  readonly onError?: (error: unknown) => void;
}

export interface ParametrosActualizarCarpeta {
  readonly id: string;
  readonly datos: DatosActualizarCarpeta;
}

export interface UseCarpetasResultado {
  readonly carpetas: readonly Carpeta[];
  readonly estaCargando: boolean;
  readonly tieneError: boolean;
  readonly error: unknown;
  readonly recargar: () => Promise<unknown>;

  readonly crearCarpeta: (datos: DatosCrearCarpeta) => Promise<Carpeta>;
  readonly actualizarCarpeta: (parametros: ParametrosActualizarCarpeta) => Promise<Carpeta>;
  readonly renombrarCarpeta: (id: string, nuevoNombre: string) => Promise<Carpeta>;
  readonly cambiarVisibilidadCarpeta: (
    id: string,
    visibilidad: VisibilidadCarpeta,
  ) => Promise<Carpeta>;
  readonly borrarCarpeta: (id: string) => Promise<void>;

  readonly estaCreando: boolean;
  readonly estaActualizando: boolean;
  readonly estaBorrando: boolean;
  readonly estaProcesando: boolean;
}

export function useCarpetas({
  carpetasService,
  onCrearExito,
  onActualizarExito,
  onBorrarExito,
  onError,
}: UseCarpetasOpciones): UseCarpetasResultado {
  const queryClient = useQueryClient();

  // Consulta de lista de carpetas
  const consultaCarpetas = useQuery<readonly Carpeta[]>({
    queryKey: clavesConsulta.carpetas.listado(),
    queryFn: () => carpetasService.listar(),
  });

  // Mutación para crear carpeta
  const mutacionCrear = useMutation<Carpeta, unknown, DatosCrearCarpeta>({
    mutationFn: (datos) => carpetasService.crear(datos),
    onSuccess: (carpetaCreada) => {
      queryClient.invalidateQueries({ queryKey: clavesConsulta.carpetas.todas() });
      onCrearExito?.(carpetaCreada);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  // Mutación para actualizar carpeta (nombre y/o visibilidad)
  const mutacionActualizar = useMutation<Carpeta, unknown, ParametrosActualizarCarpeta>({
    mutationFn: ({ id, datos }) => carpetasService.actualizar(id, datos),
    onSuccess: (carpetaActualizada) => {
      queryClient.invalidateQueries({ queryKey: clavesConsulta.carpetas.todas() });
      onActualizarExito?.(carpetaActualizada);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  // Mutación para borrar carpeta
  const mutacionBorrar = useMutation<void, unknown, string>({
    mutationFn: (id) => carpetasService.borrar(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: clavesConsulta.carpetas.todas() });
      onBorrarExito?.(id);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  const crearCarpeta = async (datos: DatosCrearCarpeta): Promise<Carpeta> => {
    return mutacionCrear.mutateAsync(datos);
  };

  const actualizarCarpeta = async (
    parametros: ParametrosActualizarCarpeta,
  ): Promise<Carpeta> => {
    return mutacionActualizar.mutateAsync(parametros);
  };

  const renombrarCarpeta = async (id: string, nuevoNombre: string): Promise<Carpeta> => {
    return mutacionActualizar.mutateAsync({ id, datos: { nombre: nuevoNombre } });
  };

  const cambiarVisibilidadCarpeta = async (
    id: string,
    visibilidad: VisibilidadCarpeta,
  ): Promise<Carpeta> => {
    return mutacionActualizar.mutateAsync({ id, datos: { visibilidad } });
  };

  const borrarCarpeta = async (id: string): Promise<void> => {
    return mutacionBorrar.mutateAsync(id);
  };

  const estaProcesando =
    mutacionCrear.isPending || mutacionActualizar.isPending || mutacionBorrar.isPending;

  return {
    carpetas: consultaCarpetas.data ?? [],
    estaCargando: consultaCarpetas.isLoading,
    tieneError: consultaCarpetas.isError,
    error: consultaCarpetas.error,
    recargar: consultaCarpetas.refetch,

    crearCarpeta,
    actualizarCarpeta,
    renombrarCarpeta,
    cambiarVisibilidadCarpeta,
    borrarCarpeta,

    estaCreando: mutacionCrear.isPending,
    estaActualizando: mutacionActualizar.isPending,
    estaBorrando: mutacionBorrar.isPending,
    estaProcesando,
  };
}

export interface UseCarpetaContenidoOpciones {
  readonly carpetaId: string;
  readonly carpetasService: CarpetasService;
  readonly limite?: number;
}

export interface UseCarpetaContenidoResultado {
  readonly items: readonly ItemCarpeta[];
  readonly estaCargando: boolean;
  readonly estaCargandoMas: boolean;
  readonly tieneMas: boolean;
  readonly cargarMas: () => void;
  readonly tieneError: boolean;
  readonly error: unknown;
  readonly recargar: () => Promise<unknown>;
}

export function useCarpetaContenido({
  carpetaId,
  carpetasService,
  limite = 20,
}: UseCarpetaContenidoOpciones): UseCarpetaContenidoResultado {
  const query = useInfiniteQuery<
    Paginacion<ItemCarpeta>,
    unknown,
    InfiniteData<Paginacion<ItemCarpeta>>,
    ReturnType<typeof clavesConsulta.carpetas.contenido>,
    string | undefined
  >({
    queryKey: clavesConsulta.carpetas.contenido(carpetaId, { limite }),
    queryFn: async ({ pageParam }) => {
      const opciones: OpcionesPaginacionCarpeta = {
        limite,
        cursor: pageParam,
      };
      return carpetasService.obtenerContenido(carpetaId, opciones);
    },
    initialPageParam: undefined,
    getNextPageParam: (ultimaPagina) => ultimaPagina.siguienteCursor ?? undefined,
    enabled: Boolean(carpetaId),
  });

  const items = query.data?.pages.flatMap((pagina) => pagina.items) ?? [];

  return {
    items,
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
