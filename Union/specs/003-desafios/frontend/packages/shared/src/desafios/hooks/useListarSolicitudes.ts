/**
 * Hook useListarSolicitudes - Consulta infinita paginada de solicitudes
 *
 * Proporciona acceso a la lista de solicitudes de desafío con soporte para:
 * - Paginación por cursor (infinite scroll)
 * - Filtros (estado)
 * - Invalidación de caché tras mutaciones
 *
 * Tarea: T040
 * Depende de: T036 (useDesafiosPort), T037 (clavesDesafios), T038 (configuracionConsultas), T023 (ListarSolicitudes)
 *
 * Fuente de verdad:
 * - plan.md: Sección 5 (gestión de estado)
 * - spec.md: HU-05, HU-06, HU-08 (solicitudes)
 * - tasks.md: T040 (Consultas)
 * - research.md: Paginación por cursor
 */

import { useInfiniteQuery } from "@tanstack/react-query";
import type { EstadoSolicitudDesafio } from "../domain/enums/EstadoSolicitudDesafio";
import type { ParametrosPagina, Pagina } from "../application/ports/tiposDesafios";
import type { SolicitudDesafio } from "../domain/entidades/SolicitudDesafio";
import { useDesafiosPort } from "./DesafiosProvider";
import { clavesDesafios } from "./clavesDesafios";
import { configuracionQueries } from "./configuracionConsultas";

/**
 * Filtros para listado de solicitudes
 */
export interface FiltrosSolicitudes {
  readonly estado?: EstadoSolicitudDesafio;
}

/**
 * Hook para listar solicitudes con paginación por cursor
 *
 * Utiliza `useInfiniteQuery` de React Query para manejar la paginación automáticamente.
 * Permite cargar más solicitudes bajo demanda (infinite scroll).
 *
 * @param filtros - Filtros opcionales (estado) para la lista de solicitudes
 * @returns Objeto con propiedades de consulta infinita
 *
 * @example
 * function ListadoSolicitudes() {
 *   const {
 *     data,
 *     fetchNextPage,
 *     hasNextPage,
 *     isFetchingNextPage,
 *     isLoading,
 *   } = useListarSolicitudes({ estado: "PENDIENTE" });
 *
 *   if (isLoading) return <div>Cargando...</div>;
 *
 *   return (
 *     <div>
 *       {data?.pages.map((page) =>
 *         page.items.map((solicitud) => (
 *           <TarjetaSolicitud key={solicitud.id} solicitud={solicitud} />
 *         ))
 *       )}
 *       {hasNextPage && (
 *         <button onClick={() => fetchNextPage()}>
 *           {isFetchingNextPage ? "Cargando..." : "Cargar más"}
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 */
export function useListarSolicitudes(filtros?: FiltrosSolicitudes) {
  const puerto = useDesafiosPort();

  return useInfiniteQuery({
    queryKey: clavesDesafios.solicitudes.lista(filtros as any).queryKey,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const pagina: ParametrosPagina = {
        cursor: pageParam,
        limite: 10,
      };
      return await puerto.listarSolicitudes(filtros || {}, pagina);
    },
    getNextPageParam: (lastPage: Pagina<SolicitudDesafio>) =>
      lastPage.siguienteCursor,
    initialPageParam: undefined,
    ...configuracionQueries,
  });
}
