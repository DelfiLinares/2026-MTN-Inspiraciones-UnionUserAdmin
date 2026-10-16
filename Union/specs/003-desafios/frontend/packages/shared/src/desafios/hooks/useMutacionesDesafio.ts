/**
 * Hook useMutacionesDesafio - Mutaciones para crear, editar y eliminar desafíos
 *
 * Proporciona acceso a las operaciones de escritura sobre desafíos:
 * - Publicar (crear) un nuevo desafío
 * - Editar un desafío existente
 * - Eliminar un desafío (borrado lógico)
 *
 * Características:
 * - NO usan actualizaciones optimistas (cambios son destructivos o requieren confirmación)
 * - Invalidan claves de caché tras completarse
 * - Requieren sesión autenticada (con rol ADMIN para publicar/editar/eliminar)
 * - Sin reintentos automáticos (configuración T038)
 *
 * Tarea: T041
 * Depende de: T036 (useDesafiosPort), T037 (clavesDesafios), T038 (configuracionConsultas), T024 (casos de uso)
 *
 * Fuente de verdad:
 * - plan.md: Sección 5 (gestión de estado)
 * - spec.md: HU-01, HU-02, HU-03 (gestión de desafíos)
 * - tasks.md: T041 (Mutaciones)
 * - research.md: Sección 3 (sin optimistas para operaciones destructivas)
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DatosDesafio, Desafio } from "../domain/entidades/Desafio";
import type { SesionActual } from "../domain/SesionActual";
import { useDesafiosPort } from "./DesafiosProvider";
import { clavesDesafios } from "./clavesDesafios";
import { configuracionMutations } from "./configuracionConsultas";

/**
 * Hook para las mutaciones de desafío
 *
 * Retorna tres funciones de mutación (publicar, editar, eliminar)
 * que invalidan el caché automáticamente al completarse.
 *
 * @returns Objeto con tres funciones de mutación
 *
 * @example
 * function AdminDesafios() {
 *   const {
 *     publicar,
 *     editar,
 *     eliminar,
 *   } = useMutacionesDesafio();
 *
 *   const handlePublicar = async () => {
 *     try {
 *       await publicar.mutateAsync({
 *         datos: nuevosDesafio,
 *         sesion,
 *       });
 *     } catch (err) {
 *       console.error("Error al publicar:", err);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handlePublicar} disabled={publicar.isPending}>
 *       {publicar.isPending ? "Publicando..." : "Publicar desafío"}
 *     </button>
 *   );
 * }
 */
export function useMutacionesDesafio() {
  const puerto = useDesafiosPort();
  const queryClient = useQueryClient();

  /**
   * Mutación: Publicar un nuevo desafío
   *
   * Requiere datos completos del desafío y sesión ADMIN.
   * Invalida el listado de desafíos tras completarse.
   */
  const publicar = useMutation(
    {
      mutationFn: async ({
        datos,
        sesion,
      }: {
        datos: DatosDesafio;
        sesion: SesionActual;
      }) => {
        return await puerto.publicarDesafio(datos);
      },
      onSuccess: () => {
        // Invalidar listados de desafíos (todas las variantes de filtros)
        queryClient.invalidateQueries({
          queryKey: clavesDesafios.desafios._def,
        });
      },
    },
    ...configuracionMutations,
  );

  /**
   * Mutación: Editar un desafío existente
   *
   * Requiere ID, datos nuevos, versión y sesión ADMIN.
   * Invalida el detalle y listados de desafíos tras completarse.
   * Si el desafío está ACTIVO o tiene respuestas, requiere confirmación explícita.
   */
  const editar = useMutation(
    {
      mutationFn: async ({
        id,
        datos,
        version,
        sesion,
      }: {
        id: string;
        datos: DatosDesafio;
        version: number;
        sesion: SesionActual;
      }) => {
        return await puerto.editarDesafio(id, datos, version);
      },
      onSuccess: (desafioEditado: Desafio) => {
        // Invalidar detalle específico del desafío editado
        queryClient.invalidateQueries({
          queryKey: clavesDesafios.desafio.detalle(desafioEditado.id).queryKey,
        });
        // Invalidar listados de desafíos (todas las variantes de filtros)
        queryClient.invalidateQueries({
          queryKey: clavesDesafios.desafios._def,
        });
      },
    },
    ...configuracionMutations,
  );

  /**
   * Mutación: Eliminar un desafío (borrado lógico)
   *
   * Requiere ID del desafío y sesión ADMIN.
   * El desafío se marca como ELIMINADO (no se borra físicamente).
   * Sus respuestas se conservan ocultas (A-12).
   * Invalida el detalle y listados de desafíos tras completarse.
   */
  const eliminar = useMutation(
    {
      mutationFn: async ({
        id,
        sesion,
      }: {
        id: string;
        sesion: SesionActual;
      }) => {
        await puerto.eliminarDesafio(id);
      },
      onSuccess: () => {
        // Invalidar todos los listados y detalles (el desafío desaparece)
        queryClient.invalidateQueries({
          queryKey: clavesDesafios.desafios._def,
        });
      },
    },
    ...configuracionMutations,
  );

  return {
    publicar,
    editar,
    eliminar,
  };
}
