/**
 * Hook useListarDesafios - Consulta infinita paginada de desafíos
 *
 * Proporciona acceso a la lista de desafíos con soporte para:
 * - Paginación por cursor (infinite scroll)
 * - Filtros (ámbito, estado)
 * - Invalidación de caché tras mutaciones
 *
 * Tarea: T039
 * Depende de: T036 (useDesafiosPort), T037 (clavesDesafios), T038 (configuracionConsultas), T023 (ListarDesafios)
 *
 * Fuente de verdad:
 * - plan.md: Sección 5 (gestión de estado)
 * - spec.md: HU-09, HU-10 (listado y filtros)
 * - tasks.md: T039 (Consultas)
 * - research.md: Paginación por cursor
 */

import { useInfiniteQuery } from "@tanstack/react-query";
import type { FiltrosDesafios } from "../application/ports/DesafiosPort";
import type { ParametrosPagina, Pagina, DesafioResumen } from "../application/ports/tiposDesafios";
import { useDesafiosPort } from "./DesafiosProvider";
import { clavesDesafios } from "./clavesDesafios";
import { configuracionQueries } from "./configuracionConsultas";

/**
 * Hook para listar desafíos con paginación por cursor
 *
 * Utiliza `useInfiniteQuery` de React Query para manejar la paginación automáticamente.
 * Permite cargar más desafíos bajo demanda (infinite scroll).
 *
 * @param filtros - Filtros opcionales (ámbito, estado) para la lista
 * @returns Objeto con propiedades de consulta infinita
 *
 * @example
 * ```tsx
 * function ListadoDesafios() {
 *   const {
 *     data,
 *     fetchNextPage,
 *     hasNextPage,
 *     isFetchingNextPage,
 *     isLoading,
 *   } = useListarDesafios({ ambitos: ["arte"] });
 *
 *   if (isLoading) return <div>Cargando...</div>;
 *
 *   return (
 *     <div>
 *       {data?.pages.map((page) =>
 *         page.items.map((desafio) => (
 *           <TarjetaDesafio key={desafio.id} desafio={desafio} />
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
 * ```
 */
export function useListarDesafios(filtros?: FiltrosDesafios) {
  const puerto = useDesafiosPort();

  return useInfiniteQuery({
    queryKey: clavesDesafios.desafios.lista(filtros).queryKey,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const pagina: ParametrosPagina = {
        cursor: pageParam,
        limite: 10,
      };
      return await puerto.listarDesafios(filtros || {}, pagina);
    },
    getNextPageParam: (lastPage: Pagina<DesafioResumen>) => lastPage.siguienteCursor,
    initialPageParam: undefined,
    ...configuracionQueries,
  });
}
