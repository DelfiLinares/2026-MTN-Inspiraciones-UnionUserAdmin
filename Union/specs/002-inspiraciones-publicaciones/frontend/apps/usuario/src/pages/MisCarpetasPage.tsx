// Mis carpetas, ruta "/carpetas": crear, renombrar, cambiar visibilidad y eliminar.
// Spec: HU-08, HU-10, RF-16, RF-20. Las carpetas nacen privadas (RF-20).
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EstadoError,
  MENSAJES_ERROR,
  MENSAJES_EXITO,
  Skeleton,
  VisibilidadCarpeta,
  useCarpetas,
  useNotificaciones,
} from "@inspiraciones/shared";
import type { Carpeta } from "@inspiraciones/shared";
import {
  FormularioCarpeta,
  type DatosFormularioCarpeta,
} from "../components/FormularioCarpeta";
import { ListaCarpetas } from "../components/ListaCarpetas";
import { carpetasService } from "../servicios";

function codigoDe(error: unknown): number | string | null {
  if (typeof error === "object" && error !== null && "codigo" in error) {
    return (error as { codigo: number | string }).codigo;
  }
  return null;
}

type Modo = { readonly tipo: "lista" } | { readonly tipo: "crear" } | { readonly tipo: "editar"; readonly carpeta: Carpeta };

export default function MisCarpetasPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { notificarExito, notificarError } = useNotificaciones();
  const [modo, setModo] = useState<Modo>({ tipo: "lista" });
  const [errorNombre, setErrorNombre] = useState<string | null>(null);

  const carpetas = useCarpetas({
    carpetasService,
    onBorrarExito: () => notificarExito(MENSAJES_EXITO.carpetaEliminada),
    onError: () => undefined,
  });

  const cerrarFormulario = () => {
    setErrorNombre(null);
    setModo({ tipo: "lista" });
  };

  const manejarError = (error: unknown) => {
    if (codigoDe(error) === 409) {
      setErrorNombre("Ya tenés una carpeta con ese nombre.");
    } else {
      notificarError(MENSAJES_ERROR[500]);
    }
  };

  const enviar = async (datos: DatosFormularioCarpeta) => {
    setErrorNombre(null);
    try {
      if (modo.tipo === "editar") {
        await carpetas.actualizarCarpeta({
          id: modo.carpeta.id,
          datos: { nombre: datos.nombre, visibilidad: datos.visibilidad },
        });
        notificarExito(MENSAJES_EXITO.carpetaRenombrada);
      } else {
        const creada = await carpetas.crearCarpeta({ nombre: datos.nombre });
        if (datos.visibilidad === VisibilidadCarpeta.PUBLICA) {
          await carpetas.cambiarVisibilidadCarpeta(creada.id, datos.visibilidad);
        }
        notificarExito(MENSAJES_EXITO.carpetaCreada);
      }
      cerrarFormulario();
    } catch (error) {
      manejarError(error);
    }
  };

  if (carpetas.estaCargando) {
    return <Skeleton variante="rectangulo" alto={200} ariaLabel="Cargando carpetas" />;
  }

  if (carpetas.tieneError) {
    return (
      <EstadoError
        titulo="No pudimos cargar tus carpetas"
        mensaje={MENSAJES_ERROR[500]}
        onReintentar={() => void carpetas.recargar()}
      />
    );
  }

  const nombresExistentes = carpetas.carpetas
    .filter((c) => modo.tipo !== "editar" || c.id !== modo.carpeta.id)
    .map((c) => c.nombre);

  return (
    <section aria-labelledby="titulo-carpetas">
      <h1 id="titulo-carpetas">Mis carpetas</h1>

      {modo.tipo === "lista" ? (
        <>
          <button type="button" onClick={() => setModo({ tipo: "crear" })}>
            Nueva carpeta
          </button>
          <ListaCarpetas
            carpetas={carpetas.carpetas}
            eliminando={carpetas.estaBorrando}
            onAbrir={(c) => navigate(`/carpetas/${c.id}`)}
            onEditar={(c) => setModo({ tipo: "editar", carpeta: c })}
            onEliminar={(c) => void carpetas.borrarCarpeta(c.id).catch(() => notificarError(MENSAJES_ERROR[500]))}
            onCrear={() => setModo({ tipo: "crear" })}
          />
        </>
      ) : (
        <FormularioCarpeta
          {...(modo.tipo === "editar" ? { carpetaInicial: modo.carpeta } : {})}
          nombresExistentes={nombresExistentes}
          enviando={carpetas.estaCreando || carpetas.estaActualizando}
          errorNombre={errorNombre}
          onEnviar={enviar}
          onCancelar={cerrarFormulario}
        />
      )}
    </section>
  );
}
