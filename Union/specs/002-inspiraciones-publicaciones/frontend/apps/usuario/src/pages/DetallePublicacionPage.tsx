// Detalle de publicación, ruta "/publicaciones/:id".
// Like, guardar, reportar, editar y borrar según permisos.
// Spec: HU-05, HU-03, HU-07, HU-09, HU-11, RF-26, CB-01.
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ConfirmDialog,
  EstadoError,
  Medio,
  MENSAJES_CONFIRMACION,
  MENSAJES_ERROR,
  MENSAJES_ERROR_ACCION,
  MENSAJES_EXITO,
  Skeleton,
  formatearFecha,
  puedeBorrar,
  puedeEditar,
  textoAlternativo,
  useCarpetas,
  useGuardarEnCarpetas,
  useLike,
  useNotificaciones,
  usePublicacion,
  usePublicacionMutaciones,
  useReportar,
  useSesion,
} from "@inspiraciones/shared";
import type { Publicacion } from "@inspiraciones/shared";
import { BotonGuardar } from "../components/BotonGuardar";
import { BotonLike } from "../components/BotonLike";
import { ModalGuardar } from "../components/ModalGuardar";
import { ModalReportar } from "../components/ModalReportar";
import {
  carpetasService,
  likesService,
  publicacionesService,
  reportesService,
} from "../servicios";

function codigoDe(error: unknown): number | string | null {
  if (typeof error === "object" && error !== null && "codigo" in error) {
    return (error as { codigo: number | string }).codigo;
  }
  return null;
}

interface AccionesProps {
  readonly publicacion: Publicacion;
}

function AccionesDetalle({ publicacion }: AccionesProps): React.JSX.Element {
  const navigate = useNavigate();
  const { usuario } = useSesion();
  const { notificarExito, notificarError } = useNotificaciones();
  const [modalGuardar, setModalGuardar] = useState(false);
  const [modalReportar, setModalReportar] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);

  const like = useLike({
    publicacion,
    likesService,
    onError: () => notificarError(MENSAJES_ERROR_ACCION.likeFallo),
  });

  const { carpetas, estaCargando: cargandoCarpetas } = useCarpetas({ carpetasService });
  const guardado = useGuardarEnCarpetas({
    publicacionId: publicacion.id,
    carpetasService,
    onExito: (_id, guardada) =>
      notificarExito(guardada ? MENSAJES_EXITO.guardada : MENSAJES_EXITO.quitadaDeCarpeta),
    onError: () => notificarError(MENSAJES_ERROR[500]),
  });

  const reporte = useReportar({
    publicacionId: publicacion.id,
    reportesService,
    onExito: () => {
      notificarExito(MENSAJES_EXITO.reporteEnviado);
      setModalReportar(false);
    },
  });

  const mutaciones = usePublicacionMutaciones({
    publicacionesService,
    onBorrarExito: () => {
      notificarExito(MENSAJES_EXITO.publicacionBorrada);
      navigate("/");
    },
    onError: (error) => {
      const codigo = codigoDe(error);
      notificarError(
        codigo === 403 ? MENSAJES_ERROR[403] : codigo === 404 ? MENSAJES_ERROR[404] : MENSAJES_ERROR[500],
      );
    },
  });

  const permiteEditar = usuario ? puedeEditar(usuario, publicacion) : false;
  const permiteBorrar = usuario ? puedeBorrar(usuario, publicacion) : false;
  const permiteReportar = usuario !== null && usuario.id !== publicacion.autor.id;
  const yaReportada = publicacion.reportadaPorMi || reporte.yaReportada || reporte.estaReportada;

  return (
    <>
      <div role="group" aria-label="Acciones de la publicación" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <BotonLike
          publicacion={{
            ...publicacion,
            likeadaPorMi: like.likeadaPorMi,
            cantidadLikes: like.cantidadLikes,
          }}
          usuarioActual={usuario}
          pendiente={like.estaPendiente}
          onToggleLike={() => void like.toggleLike()}
        />
        <BotonGuardar
          publicacion={publicacion}
          usuarioActual={usuario}
          onAbrirModal={() => setModalGuardar(true)}
        />
        {permiteReportar && (
          <button type="button" onClick={() => setModalReportar(true)} disabled={yaReportada}>
            {yaReportada ? "Ya reportaste esta publicación" : "Reportar"}
          </button>
        )}
        {permiteEditar && <Link to={`/publicaciones/${publicacion.id}/editar`}>Editar</Link>}
        {permiteBorrar && (
          <button
            type="button"
            onClick={() => setConfirmarBorrado(true)}
            disabled={mutaciones.estaBorrando}
          >
            Borrar
          </button>
        )}
      </div>

      <ModalGuardar
        abierta={modalGuardar}
        publicacion={publicacion}
        carpetas={carpetas}
        carpetasSeleccionadasIds={guardado.carpetasIds}
        estaCargando={cargandoCarpetas || guardado.estaCargando}
        carpetaEnProcesoId={guardado.carpetaEnProcesoId}
        onToggleCarpeta={(id) => void guardado.toggleGuardado(id)}
        onCerrar={() => setModalGuardar(false)}
      />

      <ModalReportar
        abierta={modalReportar}
        publicacion={publicacion}
        enviando={reporte.estaEnviando}
        yaReportada={yaReportada}
        errorGeneral={reporte.error ? MENSAJES_ERROR[500] : null}
        onEnviar={(datos) => reporte.reportar(datos)}
        onCerrar={() => setModalReportar(false)}
      />

      <ConfirmDialog
        abierta={confirmarBorrado}
        titulo={MENSAJES_CONFIRMACION.borrarPublicacionTitulo}
        mensaje={MENSAJES_CONFIRMACION.borrarPublicacionDetalle}
        textoConfirmar="Borrar"
        textoCancelar={MENSAJES_CONFIRMACION.cancelar}
        destructiva
        cargando={mutaciones.estaBorrando}
        onConfirmar={() => {
          setConfirmarBorrado(false);
          void mutaciones.borrar(publicacion.id).catch(() => undefined);
        }}
        onCancelar={() => setConfirmarBorrado(false)}
      />
    </>
  );
}

export default function DetallePublicacionPage(): React.JSX.Element {
  const { id = "" } = useParams<{ id: string }>();
  const { publicacion, estaCargando, tieneError, error, recargar } = usePublicacion({
    id,
    publicacionesService,
  });

  if (estaCargando) {
    return <Skeleton variante="rectangulo" alto={320} ariaLabel="Cargando publicación" />;
  }

  if (tieneError || !publicacion) {
    const codigo = codigoDe(error);
    if (codigo === 404) {
      return (
        <EstadoError
          titulo="Publicación no encontrada"
          mensaje="La publicación no existe o fue eliminada."
        />
      );
    }
    return (
      <EstadoError
        titulo="No pudimos cargar la publicación"
        mensaje={typeof codigo === "number" && codigo in MENSAJES_ERROR ? MENSAJES_ERROR[codigo as 500] : MENSAJES_ERROR[500]}
        onReintentar={() => void recargar()}
      />
    );
  }

  return (
    <article aria-labelledby="titulo-detalle">
      <Medio tipo={publicacion.tipoContenido} src={publicacion.contenido} alt={textoAlternativo(publicacion)} />
      <h1 id="titulo-detalle">{publicacion.titulo}</h1>
      <p>
        Por {publicacion.autor.nombre} · {formatearFecha(publicacion.fechaCreacion)}
        {publicacion.fechaUltimaEdicion ? ` · Editada ${formatearFecha(publicacion.fechaUltimaEdicion)}` : ""}
      </p>
      <p>{publicacion.descripcion}</p>
      {publicacion.etiquetas.length > 0 && (
        <ul aria-label="Etiquetas" style={{ display: "flex", gap: "0.5rem", listStyle: "none", padding: 0 }}>
          {publicacion.etiquetas.map((etiqueta) => (
            <li key={etiqueta}>#{etiqueta}</li>
          ))}
        </ul>
      )}
      <AccionesDetalle publicacion={publicacion} />
    </article>
  );
}
