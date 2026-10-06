// Hook para reportar publicaciones (T041).
// Gestiona el envío de reportes, validación previa, mutación con TanStack Query,
// actualización de caché (reportadaPorMi = true) y manejo de errores (409 = "ya reportada").
// Spec: HU-11, RF-21 a RF-23. Res.: A-13. Plan sección 6.
/* eslint-disable @typescript-eslint/consistent-type-assertions -- Las aserciones son necesarias para manipular datos de TanStack Query (InfiniteData, setQueriesData) donde TypeScript no puede inferir tipos específicos sin ellas. */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import type { Paginacion, Publicacion, Reporte } from "../domain/tipos";
import { validarReporte, type ErrorValidacion } from "../domain/validaciones";
import { ErrorHttp } from "../services/errores";
import type { DatosCrearReporte, ReportesService } from "../services/reportesService";
import { clavesConsulta } from "./claves";

export interface UseReportarOpciones {
  readonly publicacionId: string;
  readonly reportesService: ReportesService;
  readonly onExito?: (reporte?: Reporte) => void;
  readonly onError?: (error: unknown) => void;
}

export interface UseReportarResultado {
  readonly reportar: (datos: DatosCrearReporte) => Promise<Reporte | void>;
  readonly estaEnviando: boolean;
  readonly estaReportada: boolean;
  readonly erroresValidacion: readonly ErrorValidacion[];
  readonly error: unknown;
  readonly yaReportada: boolean;
  readonly resetear: () => void;
}

function marcarPublicacionReportada(pub: Publicacion): Publicacion {
  return {
    ...pub,
    reportadaPorMi: true,
  };
}

export function useReportar({
  publicacionId,
  reportesService,
  onExito,
  onError,
}: UseReportarOpciones): UseReportarResultado {
  const queryClient = useQueryClient();

  const [reportadaLocalmente, setReportadaLocalmente] = useState(false);

  // Consultar si la publicación ya está marcada como reportada en caché
  const detalleCaché = queryClient.getQueryData<Publicacion>(
    clavesConsulta.publicaciones.detalle(publicacionId),
  );
  const estaReportadaEnCaché = Boolean(detalleCaché?.reportadaPorMi);

  const mutacion = useMutation<Reporte, unknown, DatosCrearReporte>({
    mutationFn: async (datos) => {
      // 1. Validación de interfaz antes de enviar
      const errores = validarReporte({
        motivo: datos.motivo,
        textoLibre: datos.textoLibre ?? "",
      });

      if (errores.length > 0) {
        throw new Error(errores[0]?.mensaje ?? "Datos de reporte inválidos");
      }

      return reportesService.reportar(publicacionId, datos);
    },

    onSuccess: (reporte) => {
      setReportadaLocalmente(true);
      // 1. Actualizar detalle en caché
      queryClient.setQueryData<Publicacion>(
        clavesConsulta.publicaciones.detalle(publicacionId),
        (antigua) => (antigua ? marcarPublicacionReportada(antigua) : antigua),
      );

      // 2. Actualizar listados/feed en caché
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
                  item.id === publicacionId ? marcarPublicacionReportada(item) : item,
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
                item.id === publicacionId ? marcarPublicacionReportada(item) : item,
              ),
            };
          }

          if ("id" in antiguo && (antiguo as Publicacion).id === publicacionId) {
            return marcarPublicacionReportada(antiguo as Publicacion);
          }

          return antiguo;
        },
      );

      onExito?.(reporte);
    },

    onError: (err) => {
      // Si el servidor devuelve 409 (Conflicto/Ya reportada), marcamos la publicación como reportada igualmente
      if (err instanceof ErrorHttp && err.codigo === 409) {
        setReportadaLocalmente(true);
        queryClient.setQueryData<Publicacion>(
          clavesConsulta.publicaciones.detalle(publicacionId),
          (antigua) => (antigua ? marcarPublicacionReportada(antigua) : antigua),
        );

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
                    item.id === publicacionId ? marcarPublicacionReportada(item) : item,
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
                  item.id === publicacionId ? marcarPublicacionReportada(item) : item,
                ),
              };
            }

            return antiguo;
          },
        );
      }

      onError?.(err);
    },
  });

  const yaReportada =
    estaReportadaEnCaché ||
    reportadaLocalmente ||
    (mutacion.error instanceof ErrorHttp && mutacion.error.codigo === 409);

  const reportar = async (datos: DatosCrearReporte): Promise<Reporte | void> => {
    return mutacion.mutateAsync(datos);
  };

  return {
    reportar,
    estaEnviando: mutacion.isPending,
    estaReportada: mutacion.isSuccess || yaReportada || reportadaLocalmente,
    erroresValidacion: [],
    error: mutacion.error,
    yaReportada,
    resetear: () => {
      setReportadaLocalmente(false);
      mutacion.reset();
    },
  };
}
