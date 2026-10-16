/**
 * Hook useMutacionesRespuesta - Mutaciones para responder, editar y eliminar respuestas
 *
 * Proporciona acceso a las operaciones de escritura sobre respuestas de desafío:
 * - Responder: crear una nueva respuesta a un desafío ACTIVO
 * - Editar: modificar el contenido de una respuesta propia (solo el autor)
 * - Eliminar: eliminar una respuesta (autor o admin)
 *
 * Características:
 * - NO usan actualizaciones optimistas (T045 está bloqueado)
 * - Invalidan claves de caché tras completarse
 * - Requieren sesión autenticada
 * - Sin reintentos automáticos (configuración T038)
 * - El permiso y estado se validan en el backend (RF-21, A-05)
 * - El contenido de respuesta está pendiente de A-22
 *
 * Tarea: T043
 * Depende de: T036 (useDesafiosPort), T037 (clavesDesafios), T038 (configuracionConsultas), T026 (casos de uso)
 *
 * Fuente de verdad:
 * - plan.md: Sección 5 (gestión de estado)
 * - spec.md: HU-14, HU-15, HU-16 (gestión de respuestas)
 * - data-model.md: Sección 6 (casos de uso de respuesta)
 * - tasks.md: T043 (Mutaciones)
 * - research.md: Sección 3 (sin optimistas para operaciones destructivas)
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RespuestaDesafio } from "../domain/entidades/RespuestaDesafio";
import type { SesionActual } from "../domain/SesionActual";
import { useDesafiosPort } from "./DesafiosProvider";
import { clavesDesafios } from "./clavesDesafios";
import { configuracionMutations } from "./configuracionConsultas";

/**
 * Hook para las mutaciones de respuesta
 *
 * Retorna tres funciones de mutación (responder, editar, eliminar)
 * que invalidan el caché automáticamente al completarse.
 *
 * @returns Objeto con tres funciones de mutación
 *
 * @example
 * function ResponderDesafio() {
 *   const {
 *     responder,
 *     editar,
 *     eliminar,
 *   } = useMutacionesRespuesta();
 *
 *   const handleResponder = async () => {
 *     try {
 *       await responder.mutateAsync({
 *         desafioId: "desafio-123",
 *         sesion,
 *       });
 *     } catch (err) {
 *       console.error("Error al responder:", err);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleResponder} disabled={responder.isPending}>
 *       {responder.isPending ? "Enviando..." : "Enviar respuesta"}
 *     </button>
 *   );
 * }
 */
export function useMutacionesRespuesta() {
  const puerto = useDesafiosPort();
  const queryClient = useQueryClient();

  /**
   * Mutación: Responder a un desafío
   *
   * Crea una nueva respuesta del usuario autenticado al desafío especificado.
   * Solo se puede responder mientras el desafío está ACTIVO (A-05).
   * Cada usuario tiene una única respuesta por desafío (A-10); duplicados se rechazan (CB-04).
   * El contenido de la respuesta está pendiente de A-22.
   * Invalida el listado de respuestas del desafío tras completarse.
   */
  const responder = useMutation(
    {
      mutationFn: async ({
        desafioId,
        sesion,
      }: {
        desafioId: string;
        sesion: SesionActual;
      }) => {
        return await puerto.responderDesafio(desafioId);
      },
      onSuccess: (respuestaCreada: RespuestaDesafio) => {
        // Invalidar listado de respuestas del desafío específico
        queryClient.invalidateQueries({
          queryKey: clavesDesafios.respuestas.lista(respuestaCreada.desafioId).queryKey,
        });
      },
    },
    ...configuracionMutations,
  );

  /**
   * Mutación: Editar una respuesta propia
   *
   * Requiere ID de la respuesta, versión y sesión autenticada.
   * Solo el autor puede editar su respuesta (HU-15, RF-13).
   * El admin nunca edita respuestas ajenas (clarificación 2026-10-11).
   * El contenido de la respuesta está pendiente de A-22.
   * Invalida el listado de respuestas del desafío tras completarse.
   *
   * Nota: Las actualizaciones optimistas quedan pendientes de T045 y P-04
   * (regla sobre si se puede editar cuando el desafío no está ACTIVO).
   */
  const editar = useMutation(
    {
      mutationFn: async ({
        respuestaId,
        sesion,
      }: {
        respuestaId: string;
        sesion: SesionActual;
      }) => {
        return await puerto.editarRespuesta(respuestaId);
      },
      // T045 (P-04, opción A): snapshot y rollback. `RespuestaDesafio` no tiene campos
      // editables ni `version` hasta resolver A-22, por lo que no hay valores que aplicar
      // de forma optimista; el rollback queda listo para cuando existan.
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: clavesDesafios.respuestas._def });
        const anteriores = queryClient.getQueriesData<unknown>({
          queryKey: clavesDesafios.respuestas._def,
        });
        return { anteriores };
      },
      onError: (
        _error: unknown,
        _variables: unknown,
        contexto: { anteriores: [unknown, unknown][] } | undefined,
      ) => {
        // Rollback (incluye 409 por conflicto de versión, CB-02)
        contexto?.anteriores.forEach(([clave, datos]) =>
          queryClient.setQueryData(clave as readonly unknown[], datos),
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: clavesDesafios.respuestas._def,
        });
      },
    },
    ...configuracionMutations,
  );

  /**
   * Mutación: Eliminar una respuesta
   *
   * Requiere ID de la respuesta y sesión autenticada.
   * El autor puede eliminar su propia respuesta (HU-15).
   * El admin puede eliminar cualquier respuesta (HU-16, RF-14).
   * Antes de eliminar se pide confirmación explícita (RF-22).
   * Invalida el listado de respuestas del desafío tras completarse.
   */
  const eliminar = useMutation(
    {
      mutationFn: async ({
        respuestaId,
        desafioId,
        sesion,
      }: {
        respuestaId: string;
        desafioId: string;
        sesion: SesionActual;
      }) => {
        await puerto.eliminarRespuesta(respuestaId);
      },
      onSuccess: (
        _: void,
        variables: {
          respuestaId: string;
          desafioId: string;
          sesion: SesionActual;
        },
      ) => {
        // Invalidar listado de respuestas del desafío específico
        queryClient.invalidateQueries({
          queryKey: clavesDesafios.respuestas.lista(variables.desafioId).queryKey,
        });
      },
    },
    ...configuracionMutations,
  );

  return {
    responder,
    editar,
    eliminar,
  };
}
