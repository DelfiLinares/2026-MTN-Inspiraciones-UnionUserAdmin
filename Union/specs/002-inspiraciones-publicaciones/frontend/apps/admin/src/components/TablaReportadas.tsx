// Tabla de publicaciones reportadas (T056): motivos, cantidad de reportes y fecha (HU-13, RF-24).
import React from "react";
import type { PublicacionReportada } from "@inspiraciones/shared";
import { ETIQUETAS_MOTIVO, EstadoVacio, formatearFecha } from "@inspiraciones/shared";
import styles from "./TablaReportadas.module.css";

export interface TablaReportadasProps {
  readonly reportadas: readonly PublicacionReportada[];
  readonly onVerDetalle?: (reportada: PublicacionReportada) => void;
}

/** Fecha del reporte más reciente de la publicación, o null si no hay reportes. */
function fechaUltimoReporte(reportada: PublicacionReportada): string | null {
  let ultima: string | null = null;
  for (const reporte of reportada.reportes) {
    if (ultima === null || Date.parse(reporte.fecha) > Date.parse(ultima)) {
      ultima = reporte.fecha;
    }
  }
  return ultima;
}

export const TablaReportadas: React.FC<TablaReportadasProps> = ({ reportadas, onVerDetalle }) => {
  if (reportadas.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay publicaciones reportadas"
        descripcion="Cuando alguien reporte una publicación, la vas a ver acá."
      />
    );
  }

  return (
    <div className={styles.contenedor}>
      <table className={styles.tabla}>
        <caption>Publicaciones reportadas</caption>
        <thead>
          <tr>
            <th scope="col">Publicación</th>
            <th scope="col">Autor</th>
            <th scope="col">Motivos</th>
            <th scope="col">Reportes</th>
            <th scope="col">Último reporte</th>
            {onVerDetalle && <th scope="col">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {reportadas.map((reportada) => {
            const { publicacion } = reportada;
            const fecha = fechaUltimoReporte(reportada);
            return (
              <tr key={publicacion.id} className={styles.fila}>
                <th scope="row">{publicacion.titulo}</th>
                <td>{publicacion.autor.nombre}</td>
                <td>
                  <ul className={styles.motivos} aria-label="Motivos de reporte">
                    {reportada.motivos.map((motivo) => (
                      <li key={motivo} className={styles.motivo}>
                        {ETIQUETAS_MOTIVO[motivo]}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className={styles.cantidad}>{reportada.cantidadReportes}</td>
                <td>{fecha ? formatearFecha(fecha) : "—"}</td>
                {onVerDetalle && (
                  <td>
                    <button
                      type="button"
                      className={styles.verDetalle}
                      onClick={() => onVerDetalle(reportada)}
                      aria-label={`Ver reportes de ${publicacion.titulo}`}
                    >
                      Ver reportes
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
