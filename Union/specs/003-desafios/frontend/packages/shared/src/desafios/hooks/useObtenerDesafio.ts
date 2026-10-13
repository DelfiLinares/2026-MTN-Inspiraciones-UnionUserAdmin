/**
 * Hook useObtenerDesafio - Consulta de desafío individual
 *
 * Proporciona acceso a los datos detallados de un desafío específico.
 *
 * Tarea: T039
 * Depende de: T036 (useDesafiosPort), T037 (clavesDesafios), T038 (configuracionConsultas), T023 (ObtenerDesafio)
 *
 * Fuente de verdad:
 * - plan.md: Sección 5 (gestión de estado)
 * - spec.md: HU-11 (detalle de desafío)
 * - tasks.md: T039 (Consultas)
 */

import { useQuery } from "@tanstack/react-query";
import type { Desafio } from "../domain/entidades/Desafio";
import { useDesafiosPort } from "./DesafiosProvider";
import { clavesDesafios } from "./clavesDesafios";
import { configuracionQueries, staleTimesPorTipo } from "./configuracionConsultas";

/**
 * Hook para obtener los datos detallados de un desafío
 *
 * Utiliza `useQuery` de React Query para cachear el detalle del desafío.
 * Apropiado para pantallas de detalle individual.
 *
 * @param id - ID del desafío a obtener
 * @returns Objeto con propiedades de consulta simple
 *
 * @example
 * function DetalleDesafio({ desafioId }: { desafioId: string }) {
 *   const { data: desafio, isLoading, error } = useObtenerDesafio(desafioId);
 *
 *   if (isLoading) return <div>Cargando...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>{desafio?.nombre}</h1>
 *       <p>{desafio?.descripcion}</p>
 *     </div>
 *   );
 * }
 */
export function useObtenerDesafio(id: string) {
  const puerto = useDesafiosPort();

  return useQuery({
    queryKey: clavesDesafios.desafio.detalle(id).queryKey,
    queryFn: async () => {
      return await puerto.obtenerDesafio(id);
    },
    staleTime: staleTimesPorTipo.detalle,
    ...configuracionQueries,
  });
}
