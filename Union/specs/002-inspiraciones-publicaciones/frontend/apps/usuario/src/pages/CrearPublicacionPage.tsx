/* eslint-disable @typescript-eslint/consistent-type-assertions -- useParams de react-router devuelve tipos desconocidos que requieren casting. */
// Crear publicación, ruta "/publicaciones/nueva".
// Spec: HU-01, RF-01 a RF-03. Res.: A-11, S-2 (topes provisionales hasta recibir la configuración).
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FormatoArchivo,
  MENSAJES_ERROR,
  MENSAJES_EXITO,
  useNotificaciones,
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

function comoErrorFormulario(error: unknown): ErrorServidorFormulario | null {
  if (typeof error === "object" && error !== null && "codigo" in error) {
    return error as ErrorServidorFormulario;
  }
  return error ? { codigo: "red", mensaje: MENSAJES_ERROR[500] } : null;
}

export default function CrearPublicacionPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { configuracion } = useSesion();
  const { notificarExito } = useNotificaciones();

  const mutaciones = usePublicacionMutaciones({
    publicacionesService,
    onCrearExito: (publicacion) => {
      notificarExito(MENSAJES_EXITO.publicacionCreada);
      navigate(`/publicaciones/${publicacion.id}`);
    },
  });

  return (
    <section aria-labelledby="titulo-crear">
      <h1 id="titulo-crear">Nueva publicación</h1>
      <FormularioPublicacion
        configuracion={configuracion ?? CONFIGURACION_PROVISIONAL}
        enviando={mutaciones.estaCreando}
        errorServidor={comoErrorFormulario(mutaciones.errorCrear)}
        onCancelar={() => navigate(-1)}
        onEnviar={async (datos) => {
          if (!datos.archivo) return;
          try {
            await mutaciones.crear({
              titulo: datos.titulo,
              descripcion: datos.descripcion,
              categoria: datos.categoria,
              etiquetas: [...datos.etiquetas],
              archivo: datos.archivo,
            });
          } catch {
            // El error se muestra en el formulario (413, 415, 422) mediante errorCrear.
          }
        }}
      />
    </section>
  );
}
