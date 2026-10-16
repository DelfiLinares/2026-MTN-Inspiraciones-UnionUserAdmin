/* eslint-disable @typescript-eslint/consistent-type-assertions -- useParams de react-router devuelve tipos desconocidos que requieren casting. */
// Editar publicación propia, ruta "/publicaciones/:id/editar" (403 si es ajena).
// Spec: HU-02, RF-04, RF-06, RF-08. Res.: A-11, S-2 (topes provisionales hasta recibir la configuración).
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  EstadoError,
  FormatoArchivo,
  MENSAJES_ERROR,
  MENSAJES_EXITO,
  Skeleton,
  puedeEditar,
  useNotificaciones,
  usePublicacion,
  usePublicacionMutaciones,
  useSesion,
} from "@inspiraciones/shared";
import type { ConfiguracionArchivos } from "@inspiraciones/shared";
import {
  FormularioPublicacion,
  type ErrorServidorFormulario,
} from "../components/FormularioPublicacion";
import { publicacionesService } from "../servicios";

/** Valores provisionales (S-2) si la API aún no entregó la configuración. */
const CONFIGURACION_PROVISIONAL: ConfiguracionArchivos = {
  formatosPermitidos: Object.values(FormatoArchivo),
  tamanoMaxBytes: 50 * 1024 * 1024,
};

function codigoDe(error: unknown): number | string | null {
  if (typeof error === "object" && error !== null && "codigo" in error) {
    return (error as { codigo: number | string }).codigo;
  }
  return null;
}

function comoErrorFormulario(error: unknown): ErrorServidorFormulario | null {
  if (typeof error === "object" && error !== null && "codigo" in error) {
    return error as ErrorServidorFormulario;
  }
  return error ? { codigo: "red", mensaje: MENSAJES_ERROR[500] } : null;
}

export default function EditarPublicacionPage(): React.JSX.Element {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario, configuracion } = useSesion();
  const { notificarExito } = useNotificaciones();
  const { publicacion, estaCargando, tieneError, error, recargar } = usePublicacion({
    id,
    publicacionesService,
  });

  const mutaciones = usePublicacionMutaciones({
    publicacionesService,
    onEditarExito: () => {
      notificarExito(MENSAJES_EXITO.publicacionEditada);
      navigate(`/publicaciones/${id}`);
    },
  });

  if (estaCargando) {
    return <Skeleton variante="rectangulo" alto={320} ariaLabel="Cargando publicación" />;
  }

  const codigo = codigoDe(error);

  if (codigo === 404) {
    return (
      <EstadoError
        titulo="Publicación no encontrada"
        mensaje="La publicación no existe o fue eliminada."
      />
    );
  }

  // 403: el servidor lo indica, o la publicación es ajena (RF-06, RF-08).
  if (codigo === 403 || (publicacion && usuario && !puedeEditar(usuario, publicacion))) {
    return <EstadoError titulo="Sin permiso" mensaje={MENSAJES_ERROR[403]} />;
  }

  if (tieneError || !publicacion) {
    return (
      <EstadoError
        titulo="No pudimos cargar la publicación"
        mensaje={MENSAJES_ERROR[500]}
        onReintentar={() => void recargar()}
      />
    );
  }

  return (
    <section aria-labelledby="titulo-editar">
      <h1 id="titulo-editar">Editar publicación</h1>
      <FormularioPublicacion
        configuracion={configuracion ?? CONFIGURACION_PROVISIONAL}
        publicacionInicial={publicacion}
        enviando={mutaciones.estaEditando}
        errorServidor={comoErrorFormulario(mutaciones.errorEditar)}
        onCancelar={() => navigate(`/publicaciones/${id}`)}
        onEnviar={async (datos) => {
          try {
            await mutaciones.editar({
              id,
              datos: {
                titulo: datos.titulo,
                descripcion: datos.descripcion,
                categoria: datos.categoria,
                etiquetas: [...datos.etiquetas],
                ...(datos.archivo ? { archivo: datos.archivo } : {}),
              },
            });
          } catch {
            // El error se muestra en el formulario (403, 413, 415, 422) mediante errorEditar.
          }
        }}
      />
      {codigoDe(mutaciones.errorEditar) === 403 && (
        <EstadoError titulo="Sin permiso" mensaje={MENSAJES_ERROR[403]} />
      )}
    </section>
  );
}
