// Moderación, ruta "/moderacion/:id": detalle de una publicación reportada, con sus reportes
// y borrado con confirmación. Maneja "ya eliminada" (CB-03, CB-08, A-1).
// Spec: HU-12, RF-07.
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ETIQUETAS_MOTIVO,
  ErrorHttp,
  EstadoError,
  EstadoPublicacion,
  MENSAJES_ERROR,
  MENSAJES_ESTADO,
  MENSAJES_EXITO,
  Skeleton,
  useModeracionDetalle,
  useModeracionMutaciones,
  useNotificaciones,
} from "@inspiraciones/shared";
import { BotonBorrarModeracion } from "../components/BotonBorrarModeracion";
import { moderacionService } from "../servicios";

export default function ModeracionDetallePage(): React.JSX.Element {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notificarExito, notificarError } = useNotificaciones();
  const detalle = useModeracionDetalle({ publicacionId: id, moderacionService });

  const { eliminarPublicacion, estaEliminando } = useModeracionMutaciones({
    moderacionService,
    onEliminarExito: () => {
      notificarExito(MENSAJES_EXITO.publicacionBorrada);
      navigate("/moderacion");
    },
    onError: (error) => {
      if (error instanceof ErrorHttp && error.codigo === 404) {
        // Ya la eliminó otro administrador o su autor (CB-08).
        notificarError(MENSAJES_ESTADO.publicacionEliminada);
        void detalle.recargar();
        return;
      }
      notificarError(MENSAJES_ERROR[500]);
    },
  });

  if (detalle.estaCargando) {
    return <Skeleton variante="rectangulo" alto={240} ariaLabel="Cargando detalle" />;
  }

  if (detalle.tieneError || !detalle.reportada) {
    const noExiste = detalle.error instanceof ErrorHttp && detalle.error.codigo === 404;
    if (noExiste) {
      return (
        <section aria-labelledby="titulo-detalle-moderacion">
          <h1 id="titulo-detalle-moderacion">Publicación no disponible</h1>
          <p role="status">{MENSAJES_ESTADO.publicacionEliminada}</p>
          <Link to="/moderacion">Volver a moderación</Link>
        </section>
      );
    }
    return (
      <EstadoError
        titulo="No pudimos cargar la publicación"
        mensaje={MENSAJES_ERROR[500]}
        onReintentar={() => void detalle.recargar()}
      />
    );
  }

  const { publicacion, reportes, cantidadReportes } = detalle.reportada;
  const yaEliminada = publicacion.estado === EstadoPublicacion.ELIMINADA;

  return (
    <section aria-labelledby="titulo-detalle-moderacion">
      <p>
        <Link to="/moderacion">← Volver a moderación</Link>
      </p>
      <h1 id="titulo-detalle-moderacion">{publicacion.titulo}</h1>
      <p>Autor: {publicacion.autor.nombre}</p>
      <p>{publicacion.descripcion}</p>

      {yaEliminada && <p role="status">{MENSAJES_ESTADO.publicacionEliminada}</p>}

      <h2>Reportes ({cantidadReportes})</h2>
      <ul>
        {reportes.map((r) => (
          <li key={r.id}>
            <strong>{ETIQUETAS_MOTIVO[r.motivo]}</strong> — {r.reportante.nombre},{" "}
            {new Date(r.fecha).toLocaleDateString("es-AR")}
            {r.textoLibre ? <p>{r.textoLibre}</p> : null}
          </li>
        ))}
      </ul>

      {!yaEliminada && (
        <BotonBorrarModeracion
          publicacion={publicacion}
          onConfirmar={(pid) => eliminarPublicacion(pid)}
          borrando={estaEliminando}
        />
      )}
    </section>
  );
}
