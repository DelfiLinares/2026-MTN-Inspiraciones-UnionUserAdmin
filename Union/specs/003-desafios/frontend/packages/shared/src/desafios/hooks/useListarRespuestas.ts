/**
 * Hook useListarRespuestas - Consulta infinita paginada de respuestas a un desafío
 *
 * Proporciona acceso a la lista de respuestas de un desafío específico con soporte para:
 * - Paginación por cursor (infinite scroll)
 * - Filtrado por desafío ID
 * - Invalidación de caché tras mutaciones
 *
 * Tarea: T040
 * Depende de: T036 (useDesafiosPort), T037 (clavesDesafios), T038 (configuracionConsultas), T023 (ListarRespuestas)
 *
 * Fuente de verdad:
 * - plan.md: Sección 5 (gestión de estado)
 * - spec.md: HU-12 (ver respuestas), HU-15, HU-16 (gestión de respuestas)
 * - tasks.md: T040 (Consultas)
 * - research.md: Paginación por cursor
 */

import { useInfiniteQuery } from "@tanstack/react-query";
import type { ParametrosPagina, Pagina } from "../application/ports/tiposDesafios";
import type { RespuestaDesafio } from "../domain/entidades/RespuestaDesafio";
import { useDesafiosPort } from "./DesafiosProvider";
import { clavesDesafios } from "./clavesDesafios";
import { configuracionQueries } from "./configuracionConsultas";

/**
 * Hook para listar respuestas de un desafío específico con paginación por cursor
 *
 * Utiliza `useInfiniteQuery` de React Query para manejar la paginación automáticamente.
 * Permite cargar más respuestas bajo demanda (infinite scroll).
 *
 * @param desafioId - ID del desafío para el cual listar respuestas
 * @returns Objeto con propiedades de consulta infinita
 *
 * @example
 * function RespuestasDesafio({ desafioId }: { desafioId: string }) {
 *   const {
 *     data,
 *     fetchNextPage,
 *     hasNextPage,
 *     isFetchingNextPage,
 *     isLoading,
 *   } = useListarRespuestas(desafioId);
 *
 *   if (isLoading) return <div>Cargando respuestas...</div>;
 *
 *   return (
 *     <div>
 *       {data?.pages.map((page) =>
 *         page.items.map((respuesta) => (
 *           <TarjetaRespuesta key={respuesta.id} respuesta={respuesta} />
 *         ))
 *       )}
 *       {hasNextPage && (
 *         <button onClick={() => fetchNextPage()}>
 *           {isFetchingNextPage ? "Cargando..." : "Cargar más respuestas"}
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 */
export function useListarRespuestas(desafioId: string) {
  const puerto = useDesafiosPort();

  return useInfiniteQuery({
    queryKey: clavesDesafios.respuestas.lista(desafioId).queryKey,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const pagina: ParametrosPagina = {
        cursor: pageParam,
        limite: 10,
      };
      return await puerto.listarRespuestas(desafioId, pagina);
    },
    getNextPageParam: (lastPage: Pagina<RespuestaDesafio>) =>
      lastPage.siguienteCursor,
    initialPageParam: undefined,
    ...configuracionQueries,
  });
}
