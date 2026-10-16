/* eslint-disable @typescript-eslint/consistent-type-assertions -- useParams de react-router devuelve tipos desconocidos que requieren casting. */
// Contenido de carpeta, ruta "/carpetas/:id": vacía y "publicación no disponible".
// Spec: HU-09, RF-18, RF-19, CB-02, CB-05, CB-06.
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  EstadoError,
  EstadoVacio,
  MENSAJES_ERROR,
  MENSAJES_EXITO,
  Skeleton,
  useCarpetaContenido,
  useNotificaciones,
  useSesion,
} from "@inspiraciones/shared";
import { ItemCarpeta } from "../components/ItemCarpeta";
import { carpetasService } from "../servicios";

function codigoDe(error: unknown): number | string | null {
  if (typeof error === "object" && error !== null && "codigo" in error) {
    return (error as { codigo: number | string }).codigo;
  }
  return null;
}

export default function CarpetaPage(): React.JSX.Element {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useSesion();
  const { notificarExito, notificarError } = useNotificaciones();
  const [quitandoId, setQuitandoId] = useState<string | null>(null);

  const contenido = useCarpetaContenido({ carpetaId: id, carpetasService });

  const quitar = async (idPublicacion: string) => {
    setQuitandoId(idPublicacion);
    try {
      await carpetasService.quitarPublicacion(id, idPublicacion);
      notificarExito(MENSAJES_EXITO.quitadaDeCarpeta);
      await contenido.recargar();
    } catch {
      notificarError(MENSAJES_ERROR[500]);
    } finally {
      setQuitandoId(null);
    }
  };

  if (contenido.estaCargando) {
    return <Skeleton variante="rectangulo" alto={240} ariaLabel="Cargando carpeta" />;
  }

  if (contenido.tieneError) {
    if (codigoDe(contenido.error) === 404) {
      return (
        <EstadoError titulo="Carpeta no encontrada" mensaje="La carpeta no existe o no es accesible." />
      );
    }
    return (
      <EstadoError
        titulo="No pudimos cargar la carpeta"
        mensaje={MENSAJES_ERROR[500]}
        onReintentar={() => void contenido.recargar()}
      />
    );
  }

  return (
    <section aria-labelledby="titulo-carpeta">
      <button type="button" onClick={() => navigate("/carpetas")}>
        ← Mis carpetas
      </button>
      <h1 id="titulo-carpeta">Carpeta</h1>

      {contenido.items.length === 0 ? (
        <EstadoVacio
          titulo="Esta carpeta está vacía"
          descripcion="Guardá publicaciones desde su detalle para verlas acá."
        />
      ) : (
        <ul
          aria-label="Publicaciones de la carpeta"
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))",
          }}
        >
          {contenido.items.map((item) => {
            const idItem = item.disponible ? item.publicacion.id : item.id;
            return (
              <li key={idItem}>
                <ItemCarpeta
                  item={item}
                  usuarioActual={usuario}
                  quitando={quitandoId === idItem}
                  onQuitar={(idPub) => void quitar(idPub)}
                  onVerDetalle={(idPub) => navigate(`/publicaciones/${idPub}`)}
                />
              </li>
            );
          })}
        </ul>
      )}

      {contenido.tieneMas && (
        <button type="button" onClick={() => contenido.cargarMas()} disabled={contenido.estaCargandoMas}>
          {contenido.estaCargandoMas ? "Cargando..." : "Cargar más"}
        </button>
      )}
    </section>
  );
}
