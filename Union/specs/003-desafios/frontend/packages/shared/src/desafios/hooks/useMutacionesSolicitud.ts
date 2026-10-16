/**
 * Hook useMutacionesSolicitud - Mutaciones para proponer, editar, eliminar, aprobar y rechazar solicitudes
 *
 * Proporciona acceso a las operaciones de escritura sobre solicitudes de desafío:
 * - Proponer: crear una nueva solicitud (nace en PENDIENTE)
 * - Editar: modificar datos de una solicitud PENDIENTE
 * - Eliminar: eliminar una solicitud PENDIENTE
 * - Aprobar: cambiar estado de PENDIENTE a APROBADA
 * - Rechazar: cambiar estado de PENDIENTE a RECHAZADA
 *
 * Características:
 * - NO usan actualizaciones optimistas (T045 está bloqueado)
 * - Invalidan claves de caché tras completarse
 * - Requieren sesión autenticada
 * - Sin reintentos automáticos (configuración T038)
 * - El permiso y estado se validan en el backend (RF-21, A-04)
 *
 * Tarea: T042
 * Depende de: T036 (useDesafiosPort), T037 (clavesDesafios), T038 (configuracionConsultas), T025 (casos de uso)
 *
 * Fuente de verdad:
 * - plan.md: Sección 5 (gestión de estado)
 * - spec.md: HU-04, HU-05, HU-06, HU-07 (gestión de solicitudes)
 * - data-model.md: Sección 6 (casos de uso de solicitud)
 * - tasks.md: T042 (Mutaciones)
 * - research.md: Sección 3 (sin optimistas para operaciones destructivas)
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SolicitudDesafio as SolicitudDesafioEntidad,
  type SolicitudDesafio,
} from "../domain/entidades/SolicitudDesafio";
import type { SesionActual } from "../domain/SesionActual";
import { useDesafiosPort } from "./DesafiosProvider";
import { clavesDesafios } from "./clavesDesafios";
import { configuracionMutations } from "./configuracionConsultas";

/**
 * Hook para las mutaciones de solicitud
 *
 * Retorna cinco funciones de mutación (proponer, editar, eliminar, aprobar, rechazar)
 * que invalidan el caché automáticamente al completarse.
 *
 * @returns Objeto con cinco funciones de mutación
 *
 * @example
 * function MisSolicitudes() {
 *   const {
 *     proponer,
 *     editar,
 *     eliminar,
 *     aprobar,
 *     rechazar,
 *   } = useMutacionesSolicitud();
 *
 *   const handleProponer = async () => {
 *     try {
 *       await proponer.mutateAsync({
 *         datos: nuevosDatos,
 *         sesion,
 *       });
 *     } catch (err) {
 *       console.error("Error al proponer:", err);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleProponer} disabled={proponer.isPending}>
 *       {proponer.isPending ? "Proponiendo..." : "Enviar solicitud"}
 *     </button>
 *   );
 * }
 */
export function useMutacionesSolicitud() {
  const puerto = useDesafiosPort();
  const queryClient = useQueryClient();

  /**
   * Mutación: Proponer una nueva solicitud
   *
   * Crea una solicitud en estado PENDIENTE con los datos proporcionados.
   * Requiere datos completos y sesión autenticada.
   * El backend asigna el autorId a partir de la sesión.
   * Invalida el listado de solicitudes tras completarse.
   *
   * Nota: Los parámetros de datos quedarían aquí tras resolver A-08 (campos de solicitud).
   * Por ahora, la firma se mantiene acorde a DesafiosPort.
   */
  const proponer = useMutation(
    {
      mutationFn: async ({
        sesion,
      }: {
        sesion: SesionActual;
      }) => {
        return await puerto.proponerSolicitud();
      },
      onSuccess: () => {
        // Invalidar listados de solicitudes (todas las variantes de filtros)
        queryClient.invalidateQueries({
          queryKey: clavesDesafios.solicitudes._def,
        });
      },
    },
    ...configuracionMutations,
  );

  /**
   * Mutación: Editar una solicitud existente
   *
   * Requiere ID, datos nuevos, versión y sesión autenticada.
   * Solo pueden editarse solicitudes en estado PENDIENTE (A-04).
   * El backend valida los permisos (autor o ADMIN) (HU-05, HU-07).
   * Invalida el listado de solicitudes tras completarse.
   *
   * Nota: Los parámetros de datos quedarían aquí tras resolver A-08 (campos de solicitud).
   * Por ahora, la firma se mantiene acorde a DesafiosPort.
   */
  const editar = useMutation(
    {
      mutationFn: async ({
        id,
        version,
        sesion,
      }: {
        id: string;
        version: number;
        sesion: SesionActual;
      }) => {
        return await puerto.editarSolicitud(id, version);
      },
      // T045 (P-04, opción A): actualización optimista con rollback.
      // Solo se aplica `version + 1`; los campos de la solicitud siguen pendientes de A-08.
      onMutate: async ({ id, version }: { id: string; version: number }) => {
        await queryClient.cancelQueries({ queryKey: clavesDesafios.solicitudes._def });
        const anteriores = queryClient.getQueriesData<any>({
          queryKey: clavesDesafios.solicitudes._def,
        });
        queryClient.setQueriesData<any>(
          { queryKey: clavesDesafios.solicitudes._def },
          (datos: any) =>
            datos?.pages
              ? {
                  ...datos,
                  pages: datos.pages.map((pagina: any) => ({
                    ...pagina,
                    items: pagina.items.map((s: SolicitudDesafio) =>
                      s.id === id
                        ? new SolicitudDesafioEntidad({
                            id: s.id,
                            autorId: s.autorId,
                            estado: s.estado,
                            version: version + 1,
                          })
                        : s,
                    ),
                  })),
                }
              : datos,
        );
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
          queryKey: clavesDesafios.solicitudes._def,
        });
      },
    },
    ...configuracionMutations,
  );

  /**
   * Mutación: Eliminar una solicitud (borrado lógico)
   *
   * Requiere ID de la solicitud y sesión autenticada.
   * Solo pueden eliminarse solicitudes en estado PENDIENTE (A-04).
   * El backend valida los permisos (autor o ADMIN) (HU-05, HU-07).
   * Invalida el listado de solicitudes tras completarse.
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
        await puerto.eliminarSolicitud(id);
      },
      onSuccess: () => {
        // Invalidar todos los listados de solicitudes
        queryClient.invalidateQueries({
          queryKey: clavesDesafios.solicitudes._def,
        });
      },
    },
    ...configuracionMutations,
  );

  /**
   * Mutación: Aprobar una solicitud
   *
   * Requiere ID de la solicitud y sesión ADMIN.
   * Cambia el estado de PENDIENTE a APROBADA.
   * Si la solicitud ya está APROBADA o RECHAZADA, el backend rechaza la acción (CB-06).
   * Publicar el desafío es un paso aparte del admin (A-03).
   * Invalida el listado de solicitudes tras completarse.
   */
  const aprobar = useMutation(
    {
      mutationFn: async ({
        id,
        sesion,
      }: {
        id: string;
        sesion: SesionActual;
      }) => {
        return await puerto.aprobarSolicitud(id);
      },
      onSuccess: () => {
        // Invalidar listados de solicitudes (especialmente PENDIENTE y APROBADA)
        queryClient.invalidateQueries({
          queryKey: clavesDesafios.solicitudes._def,
        });
      },
    },
    ...configuracionMutations,
  );

  /**
   * Mutación: Rechazar una solicitud
   *
   * Requiere ID de la solicitud y sesión ADMIN.
   * Cambia el estado de PENDIENTE a RECHAZADA.
   * Si la solicitud ya está APROBADA o RECHAZADA, el backend rechaza la acción (CB-06).
   * Invalida el listado de solicitudes tras completarse.
   */
  const rechazar = useMutation(
    {
      mutationFn: async ({
        id,
        sesion,
      }: {
        id: string;
        sesion: SesionActual;
      }) => {
        return await puerto.rechazarSolicitud(id);
      },
      onSuccess: () => {
        // Invalidar listados de solicitudes (especialmente PENDIENTE y RECHAZADA)
        queryClient.invalidateQueries({
          queryKey: clavesDesafios.solicitudes._def,
        });
      },
    },
    ...configuracionMutations,
  );

  return {
    proponer,
    editar,
    eliminar,
    aprobar,
    rechazar,
  };
}
