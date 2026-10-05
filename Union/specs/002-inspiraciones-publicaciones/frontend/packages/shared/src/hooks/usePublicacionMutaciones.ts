// Hook de mutaciones de publicaciones: crear, editar y borrar (T037).
// Gestiona el ciclo de vida de mutaciones y la invalidación de claves de consulta.
// Spec: HU-01, HU-02, HU-03, RF-01 a RF-05, RF-28. Plan sección 6.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Publicacion } from "../domain/tipos";
import type {
  DatosCrearPublicacion,
  DatosEditarPublicacion,
  PublicacionesService,
} from "../services/publicacionesService";
import { clavesConsulta } from "./claves";

export interface ParametrosEditarPublicacion {
  readonly id: string;
  readonly datos: DatosEditarPublicacion;
}

export interface UsePublicacionMutacionesOpciones {
  readonly publicacionesService: PublicacionesService;
  readonly onCrearExito?: (publicacion: Publicacion) => void;
  readonly onEditarExito?: (publicacion: Publicacion) => void;
  readonly onBorrarExito?: (id: string) => void;
  readonly onError?: (error: unknown) => void;
}

export interface UsePublicacionMutacionesResultado {
  readonly crear: (datos: DatosCrearPublicacion) => Promise<Publicacion>;
  readonly editar: (parametros: ParametrosEditarPublicacion) => Promise<Publicacion>;
  readonly borrar: (id: string) => Promise<void>;
  readonly estaCreando: boolean;
  readonly estaEditando: boolean;
  readonly estaBorrando: boolean;
  readonly estaProcesando: boolean;
  readonly errorCrear: unknown;
  readonly errorEditar: unknown;
  readonly errorBorrar: unknown;
  readonly resetear: () => void;
}

export function usePublicacionMutaciones({
  publicacionesService,
  onCrearExito,
  onEditarExito,
  onBorrarExito,
  onError,
}: UsePublicacionMutacionesOpciones): UsePublicacionMutacionesResultado {
  const queryClient = useQueryClient();

  const mutacionCrear = useMutation({
    mutationFn: (datos: DatosCrearPublicacion) => publicacionesService.crear(datos),
    onSuccess: async (publicacion) => {
      // Invalida todos los listados de publicaciones (feed público y mis publicaciones)
      await queryClient.invalidateQueries({
        queryKey: clavesConsulta.publicaciones.todas(),
      });
      onCrearExito?.(publicacion);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  const mutacionEditar = useMutation({
    mutationFn: ({ id, datos }: ParametrosEditarPublicacion) =>
      publicacionesService.editar(id, datos),
    onSuccess: async (publicacion) => {
      // Invalida listados y el detalle de la publicación editada
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: clavesConsulta.publicaciones.todas(),
        }),
        queryClient.invalidateQueries({
          queryKey: clavesConsulta.publicaciones.detalle(publicacion.id),
        }),
      ]);
      onEditarExito?.(publicacion);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  const mutacionBorrar = useMutation({
    mutationFn: (id: string) => publicacionesService.borrar(id),
    onSuccess: async (_data, id) => {
      // Invalida listados, detalle y también carpetas donde pudiera estar contenida
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: clavesConsulta.publicaciones.todas(),
        }),
        queryClient.invalidateQueries({
          queryKey: clavesConsulta.publicaciones.detalle(id),
        }),
        queryClient.invalidateQueries({
          queryKey: clavesConsulta.carpetas.todas(),
        }),
      ]);
      onBorrarExito?.(id);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  const estaProcesando =
    mutacionCrear.isPending || mutacionEditar.isPending || mutacionBorrar.isPending;

  return {
    crear: async (datos: DatosCrearPublicacion) => mutacionCrear.mutateAsync(datos),
    editar: async (parametros: ParametrosEditarPublicacion) =>
      mutacionEditar.mutateAsync(parametros),
    borrar: async (id: string) => mutacionBorrar.mutateAsync(id),
    estaCreando: mutacionCrear.isPending,
    estaEditando: mutacionEditar.isPending,
    estaBorrando: mutacionBorrar.isPending,
    estaProcesando,
    errorCrear: mutacionCrear.error,
    errorEditar: mutacionEditar.error,
    errorBorrar: mutacionBorrar.error,
    resetear: () => {
      mutacionCrear.reset();
      mutacionEditar.reset();
      mutacionBorrar.reset();
    },
  };
}
