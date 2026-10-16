/**
 * Hook useListarAmbitos - Consulta de ámbitos disponibles
 *
 * Proporciona acceso a la lista de ámbitos disponibles para filtrar y crear desafíos.
 * Esta consulta es relativamente estática y se cachea por largo tiempo.
 *
 * Tarea: T039
 * Depende de: T036 (useDesafiosPort), T037 (clavesDesafios), T038 (configuracionConsultas), T023 (ListarAmbitos)
 *
 * Fuente de verdad:
 * - plan.md: Sección 5 (gestión de estado)
 * - spec.md: HU-10 (filtros), A-02 (catálogo de ámbitos)
 * - tasks.md: T039 (Consultas)
 */

import { useQuery } from "@tanstack/react-query";
import type { AmbitoDesafio } from "../domain/AmbitoDesafio";
import { useDesafiosPort } from "./DesafiosProvider";
import { clavesDesafios } from "./clavesDesafios";
import { configuracionQueries, staleTimesPorTipo } from "./configuracionConsultas";

/**
 * Hook para listar los ámbitos disponibles
 *
 * Utiliza `useQuery` de React Query para cachear la lista de ámbitos.
 * La lista de ámbitos cambia raramente, por lo que tiene un staleTime largo.
 *
 * @returns Objeto con propiedades de consulta simple
 *
 * @example
 * function FiltroAmbito() {
 *   const { data: ambitos, isLoading } = useListarAmbitos();
 *
 *   if (isLoading) return <div>Cargando ámbitos...</div>;
 *
 *   return (
 *     <select>
 *       {ambitos?.map((ambito) => (
 *         <option key={ambito.id} value={ambito.valor}>
 *           {ambito.valor}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 */
export function useListarAmbitos() {
  const puerto = useDesafiosPort();

  return useQuery({
    queryKey: clavesDesafios.ambitos.lista().queryKey,
    queryFn: async () => {
      return await puerto.listarAmbitos();
    },
    staleTime: staleTimesPorTipo.estático,
    ...configuracionQueries,
  });
}
