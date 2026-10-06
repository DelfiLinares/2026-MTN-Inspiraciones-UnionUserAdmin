// Mis publicaciones, ruta "/mis-publicaciones": listado propio con editar y borrar.
// Spec: HU-02, HU-03. Plan: pantalla "Listado propio con editar/borrar".
import React, { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ConfirmDialog,
  MENSAJES_CONFIRMACION,
  MENSAJES_ERROR,
  MENSAJES_EXITO,
  clavesConsulta,
  useNotificaciones,
  usePublicacionMutaciones,
  useSesion,
} from "@inspiraciones/shared";
import type { Publicacion } from "@inspiraciones/shared";
import { GrillaPublicaciones } from "../components/GrillaPublicaciones";
import { publicacionesService } from "../servicios";

const LIMITE_PAGINA = 20;

export default function MisPublicacionesPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { usuario } = useSesion();
  const { notificarExito, notificarError } = useNotificaciones();
  const [aBorrar, setAborrar] = useState<Publicacion | null>(null);

  const consulta = useInfiniteQuery({
    queryKey: clavesConsulta.publicaciones.propias({ limite: LIMITE_PAGINA }),
    queryFn: ({ pageParam }) =>
      publicacionesService.listarPropias({
        limite: LIMITE_PAGINA,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (ultima) => ultima.siguienteCursor,
  });

  const mutaciones = usePublicacionMutaciones({
    publicacionesService,
    onBorrarExito: () => {
      notificarExito(MENSAJES_EXITO.publicacionBorrada);
      void consulta.refetch();
    },
    onError: () => notificarError(MENSAJES_ERROR[500]),
  });

  const publicaciones = (consulta.data?.pages ?? []).flatMap((pagina) => pagina.items);

  return (
    <section aria-labelledby="titulo-mis-publicaciones">
      <h1 id="titulo-mis-publicaciones">Mis publicaciones</h1>
      <GrillaPublicaciones
        publicaciones={publicaciones}
        usuarioActual={usuario}
        estaCargando={consulta.isLoading}
        estaCargandoSiguientePagina={consulta.isFetchingNextPage}
        tieneSiguientePagina={Boolean(consulta.hasNextPage)}
        tieneError={consulta.isError}
        mensajeError={MENSAJES_ERROR[500]}
        onCargarMas={() => void consulta.fetchNextPage()}
        onReintentar={() => void consulta.refetch()}
        acciones={{
          onVerDetalle: (p) => navigate(`/publicaciones/${p.id}`),
          onEditar: (p) => navigate(`/publicaciones/${p.id}/editar`),
          onBorrar: (p) => setAborrar(p),
        }}
      />

      <ConfirmDialog
        abierta={aBorrar !== null}
        titulo={MENSAJES_CONFIRMACION.borrarPublicacionTitulo}
        mensaje={
          aBorrar
            ? `«${aBorrar.titulo}». ${MENSAJES_CONFIRMACION.borrarPublicacionDetalle}`
            : MENSAJES_CONFIRMACION.borrarPublicacionDetalle
        }
        textoConfirmar="Borrar"
        textoCancelar={MENSAJES_CONFIRMACION.cancelar}
        destructiva
        cargando={mutaciones.estaBorrando}
        onConfirmar={() => {
          const objetivo = aBorrar;
          setAborrar(null);
          if (objetivo) void mutaciones.borrar(objetivo.id).catch(() => undefined);
        }}
        onCancelar={() => setAborrar(null)}
      />
    </section>
  );
}
