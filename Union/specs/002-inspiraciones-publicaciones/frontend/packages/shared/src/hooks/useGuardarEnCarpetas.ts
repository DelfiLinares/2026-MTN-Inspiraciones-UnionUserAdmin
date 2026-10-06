// Hook para guardar o quitar publicaciones en carpetas (T040).
// Permite alternar la pertenencia de una publicación a una o más carpetas con actualización optimista,
// sincronización con la caché (detalle, listados de publicaciones, pertenencia a carpetas y conteos de carpetas)
// y reversión automática en caso de error.
// Spec: HU-09, RF-17, RF-18, CB-02. Res.: D-10, A-9. Plan sección 6.
/* eslint-disable @typescript-eslint/consistent-type-assertions -- Las aserciones son necesarias para manipular datos de TanStack Query (InfiniteData, setQueriesData) donde TypeScript no puede inferir tipos específicos sin ellas. */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import type { Carpeta, Paginacion, Publicacion } from "../domain/tipos";
import type { CarpetasService } from "../services/carpetasService";
import { clavesConsulta } from "./claves";

export interface UseGuardarEnCarpetasOpciones {
  readonly publicacionId: string;
  readonly carpetasService: CarpetasService;
  readonly onExito?: (carpetaId: string, guardada: boolean) => void;
  readonly onError?: (error: unknown, carpetaId: string, guardada: boolean) => void;
}

export interface UseGuardarEnCarpetasResultado {
  readonly carpetasIds: readonly string[];
  readonly estaCargando: boolean;
  readonly tieneError: boolean;
  readonly error: unknown;
  readonly recargar: () => Promise<unknown>;

  readonly toggleGuardado: (carpetaId: string) => Promise<void>;
  readonly estaGuardadaEn: (carpetaId: string) => boolean;
  readonly estaPendiente: boolean;
  readonly carpetaEnProcesoId: string | null;
}

interface ContextoMutacionGuardar {
  readonly previasCarpetasIds?: readonly string[];
  readonly previoDetalle?: Publicacion;
  readonly previosListados?: Array<[readonly unknown[], unknown]>;
  readonly previasCarpetas?: readonly Carpeta[];
}

function actualizarPublicacionGuardada(
  pub: Publicacion,
  nuevoGuardadaPorMi: boolean,
): Publicacion {
  return {
    ...pub,
    guardadaPorMi: nuevoGuardadaPorMi,
  };
}

export function useGuardarEnCarpetas({
  publicacionId,
  carpetasService,
  onExito,
  onError,
}: UseGuardarEnCarpetasOpciones): UseGuardarEnCarpetasResultado {
  const queryClient = useQueryClient();

  // Consulta de las carpetas a las que pertenece esta publicación actualmente
  const consultaCarpetasPublicacion = useQuery<readonly string[]>({
    queryKey: clavesConsulta.publicaciones.carpetas(publicacionId),
    queryFn: () => carpetasService.obtenerCarpetasDePublicacion(publicacionId),
    enabled: Boolean(publicacionId),
  });

  const carpetasIds = consultaCarpetasPublicacion.data ?? [];

  const mutacion = useMutation<
    void,
    unknown,
    { carpetaId: string; actualmenteGuardada: boolean },
    ContextoMutacionGuardar
  >({
    mutationFn: ({ carpetaId, actualmenteGuardada }) => {
      if (actualmenteGuardada) {
        return carpetasService.quitarPublicacion(carpetaId, publicacionId);
      }
      return carpetasService.guardarPublicacion(carpetaId, publicacionId);
    },

    onMutate: ({ carpetaId, actualmenteGuardada }) => {
      // 1. Guardar estados previos
      const previasCarpetasIds = queryClient.getQueryData<readonly string[]>(
        clavesConsulta.publicaciones.carpetas(publicacionId),
      );
      const previoDetalle = queryClient.getQueryData<Publicacion>(
        clavesConsulta.publicaciones.detalle(publicacionId),
      );
      const previosListados = queryClient.getQueriesData({
        queryKey: clavesConsulta.publicaciones.todas(),
      });
      const previasCarpetas = queryClient.getQueryData<readonly Carpeta[]>(
        clavesConsulta.carpetas.listado(),
      );

      // 2. Actualizar optimísticamente la lista de carpetas vinculadas
      const nuevosCarpetasIds = actualmenteGuardada
        ? (previasCarpetasIds ?? []).filter((id) => id !== carpetaId)
        : [...(previasCarpetasIds ?? []), carpetaId];

      queryClient.setQueryData(
        clavesConsulta.publicaciones.carpetas(publicacionId),
        nuevosCarpetasIds,
      );

      // Calcular si la publicación sigue guardada en al menos una carpeta
      const nuevoGuardadaPorMi = nuevosCarpetasIds.length > 0;

      // 4. Actualizar detalle de la publicación
      if (previoDetalle) {
        queryClient.setQueryData<Publicacion>(
          clavesConsulta.publicaciones.detalle(publicacionId),
          actualizarPublicacionGuardada(previoDetalle, nuevoGuardadaPorMi),
        );
      }

      // 5. Actualizar listados / feed
      queryClient.setQueriesData(
        { queryKey: clavesConsulta.publicaciones.todas() },
        (antiguo: unknown) => {
          if (!antiguo || typeof antiguo !== "object") return antiguo;

          if (
            "pages" in antiguo &&
            Array.isArray((antiguo as InfiniteData<Paginacion<Publicacion>>).pages)
          ) {
            const dataInfinita = antiguo as InfiniteData<Paginacion<Publicacion>>;
            return {
              ...dataInfinita,
              pages: dataInfinita.pages.map((pagina: Paginacion<Publicacion>) => ({
                ...pagina,
                items: pagina.items.map((item: Publicacion) =>
                  item.id === publicacionId
                    ? actualizarPublicacionGuardada(item, nuevoGuardadaPorMi)
                    : item,
                ),
              })),
            };
          }

          if (
            "items" in antiguo &&
            Array.isArray((antiguo as Paginacion<Publicacion>).items)
          ) {
            const paginada = antiguo as Paginacion<Publicacion>;
            return {
              ...paginada,
              items: paginada.items.map((item: Publicacion) =>
                item.id === publicacionId
                  ? actualizarPublicacionGuardada(item, nuevoGuardadaPorMi)
                  : item,
              ),
            };
          }

          if ("id" in antiguo && (antiguo as Publicacion).id === publicacionId) {
            return actualizarPublicacionGuardada(
              antiguo as Publicacion,
              nuevoGuardadaPorMi,
            );
          }

          return antiguo;
        },
      );

      // 6. Actualizar contadores en la lista de carpetas si existe en caché
      if (previasCarpetas) {
        queryClient.setQueryData<readonly Carpeta[]>(
          clavesConsulta.carpetas.listado(),
          previasCarpetas.map((c) => {
            if (c.id === carpetaId) {
              const delta = actualmenteGuardada ? -1 : 1;
              return {
                ...c,
                cantidadPublicaciones: Math.max(0, c.cantidadPublicaciones + delta),
              };
            }
            return c;
          }),
        );
      }

      return {
        previasCarpetasIds,
        previoDetalle,
        previosListados,
        previasCarpetas,
      };
    },

    onError: (err, variables, context) => {
      // Revertir carpetasIds
      if (context?.previasCarpetasIds) {
        queryClient.setQueryData(
          clavesConsulta.publicaciones.carpetas(publicacionId),
          context.previasCarpetasIds,
        );
      }

      // Revertir detalle
      if (context?.previoDetalle) {
        queryClient.setQueryData(
          clavesConsulta.publicaciones.detalle(publicacionId),
          context.previoDetalle,
        );
      }

      // Revertir listados
      if (context?.previosListados) {
        for (const [clave, datos] of context.previosListados) {
          queryClient.setQueryData(clave, datos);
        }
      }

      // Revertir carpetas
      if (context?.previasCarpetas) {
        queryClient.setQueryData(
          clavesConsulta.carpetas.listado(),
          context.previasCarpetas,
        );
      }

      onError?.(err, variables.carpetaId, !variables.actualmenteGuardada);
    },

    onSuccess: (_data, variables) => {
      // Invalidar contenido específico de la carpeta modificada
      queryClient.invalidateQueries({
        queryKey: clavesConsulta.carpetas.contenido(variables.carpetaId),
      });

      onExito?.(variables.carpetaId, !variables.actualmenteGuardada);
    },
  });

  const estaGuardadaEn = (carpetaId: string): boolean => {
    return carpetasIds.includes(carpetaId);
  };

  const toggleGuardado = async (carpetaId: string): Promise<void> => {
    // Si la mutación ya está en curso para esta u otra carpeta, evitar doble clic / solapamiento
    if (mutacion.isPending) {
      return;
    }
    const actualmenteGuardada = estaGuardadaEn(carpetaId);
    await mutacion.mutateAsync({ carpetaId, actualmenteGuardada });
  };

  return {
    carpetasIds,
    estaCargando: consultaCarpetasPublicacion.isLoading,
    tieneError: consultaCarpetasPublicacion.isError,
    error: consultaCarpetasPublicacion.error,
    recargar: consultaCarpetasPublicacion.refetch,

    toggleGuardado,
    estaGuardadaEn,
    estaPendiente: mutacion.isPending,
    carpetaEnProcesoId: mutacion.variables?.carpetaId ?? null,
  };
}
