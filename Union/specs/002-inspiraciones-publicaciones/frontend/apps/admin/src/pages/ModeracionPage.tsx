// Moderación, ruta "/moderacion": listado de publicaciones reportadas (motivos, cantidad, fecha).
// Spec: HU-13, RF-24.
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  EstadoError,
  MENSAJES_ERROR,
  Skeleton,
  useModeracionReportadas,
} from "@inspiraciones/shared";
import { TablaReportadas } from "../components/TablaReportadas";
import { moderacionService } from "../servicios";

export default function ModeracionPage(): React.JSX.Element {
  const navigate = useNavigate();
  const lista = useModeracionReportadas({ moderacionService });

  if (lista.estaCargando) {
    return <Skeleton variante="rectangulo" alto={240} ariaLabel="Cargando publicaciones reportadas" />;
  }

  if (lista.tieneError) {
    return (
      <EstadoError
        titulo="No pudimos cargar las publicaciones reportadas"
        mensaje={MENSAJES_ERROR[500]}
        onReintentar={() => void lista.recargar()}
      />
    );
  }

  return (
    <section aria-labelledby="titulo-moderacion">
      <h1 id="titulo-moderacion">Moderación</h1>
      <TablaReportadas
        reportadas={lista.reportadas}
        onVerDetalle={(r) => navigate(`/moderacion/${r.publicacion.id}`)}
      />
      {lista.tieneMas && (
        <button type="button" onClick={() => lista.cargarMas()} disabled={lista.estaCargandoMas}>
          {lista.estaCargandoMas ? "Cargando..." : "Cargar más"}
        </button>
      )}
    </section>
  );
}
