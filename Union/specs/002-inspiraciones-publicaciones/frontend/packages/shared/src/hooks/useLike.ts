// Hook de like con actualización optimista, reversión en caso de error y protección anti doble clic (T038).
// Actualiza inmediatamente la caché local (detalle y listados) y revierte en error.
// Spec: HU-07, RF-11 a RF-15, CB-07. Res.: D-10, S-3. Plan sección 6.

import { useRef, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import type { Paginacion, Publicacion } from "../domain/tipos";
import { type LikesService, type ResultadoLike } from "../services/likesService";
import { clavesConsulta } from "./claves";

export interface UseLikeOpciones {
  readonly publicacion: Publicacion;
  readonly likesService: LikesService;
  readonly onExito?: (resultado: ResultadoLike) => void;
  readonly onError?: (error: unknown) => void;
}

export interface UseLikeResultado {
  readonly toggleLike: () => Promise<void>;
  readonly estaPendiente: boolean;
  readonly likeadaPorMi: boolean;
  readonly cantidadLikes: number;
  readonly error: unknown;
}

interface ContextoMutacionLike {
  readonly previoDetalle?: Publicacion;
  readonly previosListados?: Array<[readonly unknown[], unknown]>;
  readonly estadoPrevioLocal: {
    likeadaPorMi: boolean;
    cantidadLikes: number;
  };
}

function actualizarPublicacion(
  pub: Publicacion,
  nuevoLikeadaPorMi: boolean,
  nuevoCantidadLikes: number,
): Publicacion {
  return {
    ...pub,
    likeadaPorMi: nuevoLikeadaPorMi,
    cantidadLikes: Math.max(0, nuevoCantidadLikes),
  };
}

export function useLike({
  publicacion,
  likesService,
  onExito,
  onError,
}: UseLikeOpciones): UseLikeResultado {
  const queryClient = useQueryClient();
  const id = publicacion.id;

  const [estadoLocal, setEstadoLocal] = useState({
    likeadaPorMi: publicacion.likeadaPorMi,
    cantidadLikes: publicacion.cantidadLikes,
  });

  // Mantener actualizado si cambia la prop
  useEffect(() => {
    setEstadoLocal({
      likeadaPorMi: publicacion.likeadaPorMi,
      cantidadLikes: publicacion.cantidadLikes,
    });
  }, [publicacion.likeadaPorMi, publicacion.cantidadLikes]);

  const estadoLocalRef = useRef(estadoLocal);
  estadoLocalRef.current = estadoLocal;

  const mutacion = useMutation<ResultadoLike, unknown, void, ContextoMutacionLike>({
    mutationFn: () => {
      // Usar publicacion original o estado previo para la llamada
      if (publicacion.likeadaPorMi) {
        return likesService.quitarLike(id);
      }
      return likesService.darLike(id);
    },

    onMutate: () => {
      // 1. Guardar estado previo del detalle
      const previoDetalle = queryClient.getQueryData<Publicacion>(
        clavesConsulta.publicaciones.detalle(id),
      );

      // 2. Guardar estado previo de todos los listados de publicaciones en caché
      const previosListados = queryClient.getQueriesData({
        queryKey: clavesConsulta.publicaciones.todas(),
      });

      const estadoPrevioLocal = { ...estadoLocalRef.current };

      // Calcular nuevo estado optimista
      const nuevoLikeadaPorMi = !estadoPrevioLocal.likeadaPorMi;
      const nuevoCantidadLikes = estadoPrevioLocal.likeadaPorMi
        ? Math.max(0, estadoPrevioLocal.cantidadLikes - 1)
        : estadoPrevioLocal.cantidadLikes + 1;

      // Actualizar estado local inmediato
      setEstadoLocal({
        likeadaPorMi: nuevoLikeadaPorMi,
        cantidadLikes: nuevoCantidadLikes,
      });

      // Actualizar detalle en caché si existe
      if (previoDetalle) {
        queryClient.setQueryData<Publicacion>(
          clavesConsulta.publicaciones.detalle(id),
          actualizarPublicacion(previoDetalle, nuevoLikeadaPorMi, nuevoCantidadLikes),
        );
      }

      // Actualizar todas las consultas paginadas o listados en caché
      queryClient.setQueriesData(
        { queryKey: clavesConsulta.publicaciones.todas() },
        (antiguo: unknown) => {
          if (!antiguo || typeof antiguo !== "object") return antiguo;

          // Si es InfiniteData de useInfiniteQuery
          if ("pages" in antiguo && Array.isArray((antiguo as InfiniteData<Paginacion<Publicacion>>).pages)) {
            const dataInfinita = antiguo as InfiniteData<Paginacion<Publicacion>>;
            return {
              ...dataInfinita,
              pages: dataInfinita.pages.map((pagina: Paginacion<Publicacion>) => ({
                ...pagina,
                items: pagina.items.map((item: Publicacion) =>
                  item.id === id
                    ? actualizarPublicacion(item, nuevoLikeadaPorMi, nuevoCantidadLikes)
                    : item,
                ),
              })),
            };
          }

          // Si es Paginacion directa
          if ("items" in antiguo && Array.isArray((antiguo as Paginacion<Publicacion>).items)) {
            const paginada = antiguo as Paginacion<Publicacion>;
            return {
              ...paginada,
              items: paginada.items.map((item: Publicacion) =>
                item.id === id
                  ? actualizarPublicacion(item, nuevoLikeadaPorMi, nuevoCantidadLikes)
                  : item,
              ),
            };
          }

          // Si es Publicacion directa (detalle)
          if ("id" in antiguo && (antiguo as Publicacion).id === id) {
            return actualizarPublicacion(antiguo as Publicacion, nuevoLikeadaPorMi, nuevoCantidadLikes);
          }

          return antiguo;
        },
      );

      return { previoDetalle, previosListados, estadoPrevioLocal };
    },

    onError: (err, _variables, context) => {
      // Revertir estado local
      if (context?.estadoPrevioLocal) {
        setEstadoLocal(context.estadoPrevioLocal);
      }
      // Revertir detalle
      if (context?.previoDetalle) {
        queryClient.setQueryData(
          clavesConsulta.publicaciones.detalle(id),
          context.previoDetalle,
        );
      }
      // Revertir listados
      if (context?.previosListados) {
        for (const [clave, datos] of context.previosListados) {
          queryClient.setQueryData(clave, datos);
        }
      }
      onError?.(err);
    },

    onSuccess: (resultado) => {
      if (resultado) {
        setEstadoLocal({
          likeadaPorMi: resultado.likeadaPorMi,
          cantidadLikes: resultado.cantidadLikes,
        });

        // Actualizar con los datos exactos del backend
        queryClient.setQueryData<Publicacion>(
          clavesConsulta.publicaciones.detalle(id),
          (antigua) =>
            antigua
              ? {
                  ...antigua,
                  likeadaPorMi: resultado.likeadaPorMi,
                  cantidadLikes: resultado.cantidadLikes,
                }
              : antigua,
        );

        queryClient.setQueriesData(
          { queryKey: clavesConsulta.publicaciones.todas() },
          (antiguo: unknown) => {
            if (!antiguo || typeof antiguo !== "object") return antiguo;

            if ("pages" in antiguo && Array.isArray((antiguo as InfiniteData<Paginacion<Publicacion>>).pages)) {
              const dataInfinita = antiguo as InfiniteData<Paginacion<Publicacion>>;
              return {
                ...dataInfinita,
                pages: dataInfinita.pages.map((pagina: Paginacion<Publicacion>) => ({
                  ...pagina,
                  items: pagina.items.map((item: Publicacion) =>
                    item.id === id
                      ? {
                          ...item,
                          likeadaPorMi: resultado.likeadaPorMi,
                          cantidadLikes: resultado.cantidadLikes,
                        }
                      : item,
                  ),
                })),
              };
            }

            if ("items" in antiguo && Array.isArray((antiguo as Paginacion<Publicacion>).items)) {
              const paginada = antiguo as Paginacion<Publicacion>;
              return {
                ...paginada,
                items: paginada.items.map((item: Publicacion) =>
                  item.id === id
                    ? {
                        ...item,
                        likeadaPorMi: resultado.likeadaPorMi,
                        cantidadLikes: resultado.cantidadLikes,
                      }
                    : item,
                ),
              };
            }

            if ("id" in antiguo && (antiguo as Publicacion).id === id) {
              return {
                ...(antiguo as Publicacion),
                likeadaPorMi: resultado.likeadaPorMi,
                cantidadLikes: resultado.cantidadLikes,
              };
            }

            return antiguo;
          },
        );

        onExito?.(resultado);
      }
    },
  });

  const toggleLike = async () => {
    // Si la mutación ya está pendiente (anti doble clic CB-07), ignorar invocación
    if (mutacion.isPending) {
      return;
    }
    await mutacion.mutateAsync();
  };

  return {
    toggleLike,
    estaPendiente: mutacion.isPending,
    likeadaPorMi: estadoLocal.likeadaPorMi,
    cantidadLikes: estadoLocal.cantidadLikes,
    error: mutacion.error,
  };
}
