/* eslint-disable @typescript-eslint/consistent-type-assertions -- Los handlers MSW requieren casting para manipular datos de respuesta. */
// Handlers MSW para reportes y moderación (T026).
// Contrato: contracts/api-client.md (Reportes y moderación). Spec: RF-21 a RF-24, RF-07.

import { http, HttpResponse } from "msw";
import {
  EstadoPublicacion,
  MotivoReporte,
  RolUsuario,
} from "../../../packages/shared/src/domain/enums";
import type {
  Paginacion,
  PublicacionReportada,
  Reporte,
  UsuarioActual,
} from "../../../packages/shared/src/domain/tipos";
import {
  administrador,
  publicaciones,
  reportadasModeracion as reportadasIniciales,
  usuario,
} from "../datos";

let reportadasSimuladas: PublicacionReportada[] = [...reportadasIniciales];
const reportesPorPublicacion: Map<string, Reporte[]> = new Map();
let usuarioActualModeracion: UsuarioActual = usuario;

function inicializarReportes(): void {
  reportadasSimuladas = [...reportadasIniciales];
  reportesPorPublicacion.clear();
  for (const rep of reportadasIniciales) {
    reportesPorPublicacion.set(rep.publicacion.id, [...rep.reportes]);
  }
}

inicializarReportes();

export function reiniciarReportesSimulados(): void {
  inicializarReportes();
  usuarioActualModeracion = usuario;
}

export function fijarRolModeracion(esAdmin: boolean): void {
  usuarioActualModeracion = esAdmin ? administrador : usuario;
}

function paginar<T>(items: readonly T[], cursor?: string | null, limiteStr?: string | null): Paginacion<T> {
  const limite = limiteStr !== null && limiteStr !== undefined ? Math.max(1, parseInt(limiteStr, 10) || 20) : 20;
  const inicio = cursor ? Math.max(0, parseInt(cursor, 10) || 0) : 0;
  const pagina = items.slice(inicio, inicio + limite);
  const siguienteIndice = inicio + limite;
  const siguienteCursor = siguienteIndice < items.length ? String(siguienteIndice) : undefined;

  return {
    items: pagina,
    siguienteCursor,
  };
}

export const reportesHandlers = [
  // Crear reporte sobre una publicación (RF-21 a RF-23)
  http.post("*/api/v1/publicaciones/:id/reportes", async ({ params, request }) => {
    const { id } = params;
    const pubId = String(id);

    const pub = publicaciones.find((p) => p.id === pubId);
    if (!pub || pub.estado === EstadoPublicacion.ELIMINADA) {
      return HttpResponse.json(
        { codigo: 404, mensaje: "Publicación no encontrada o eliminada." },
        { status: 404 },
      );
    }

    // No se puede reportar la propia publicación (RF-22)
    if (pub.autor.id === usuario.id) {
      return HttpResponse.json(
        { codigo: 403, mensaje: "No podés reportar tu propia publicación." },
        { status: 403 },
      );
    }

    const reportesExistentes = reportesPorPublicacion.get(pubId) ?? [];
    // No se puede reportar dos veces la misma publicación por el mismo usuario (RF-23, 409)
    const yaReportada =
      pub.reportadaPorMi ||
      reportesExistentes.some((r) => r.reportante.id === usuario.id);

    if (yaReportada) {
      return HttpResponse.json(
        { codigo: 409, mensaje: "Ya reportaste esta publicación." },
        { status: 409 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const motivoStr = typeof body.motivo === "string" ? body.motivo : "";
    const textoLibre = typeof body.textoLibre === "string" ? body.textoLibre.trim() : undefined;

    if (!motivoStr || !(motivoStr in MotivoReporte)) {
      return HttpResponse.json(
        { codigo: 422, mensaje: "El motivo del reporte es obligatorio y debe ser válido." },
        { status: 422 },
      );
    }

    if (motivoStr === MotivoReporte.OTRO && !textoLibre) {
      return HttpResponse.json(
        { codigo: 422, mensaje: "Contanos el motivo del reporte cuando elegís 'Otro'." },
        { status: 422 },
      );
    }

    const nuevoReporte: Reporte = {
      id: `r-${Date.now()}`,
      publicacion: pub,
      motivo: motivoStr as MotivoReporte,
      textoLibre,
      fecha: new Date().toISOString(),
      reportante: { id: usuario.id, nombre: usuario.nombre },
      resuelto: false,
    };

    const nuevosReportes = [...reportesExistentes, nuevoReporte];
    reportesPorPublicacion.set(pubId, nuevosReportes);

    // Actualizar o crear la entrada en la lista de moderación
    const indexMod = reportadasSimuladas.findIndex((r) => r.publicacion.id === pubId);
    const motivosUnicos = Array.from(new Set(nuevosReportes.map((r) => r.motivo)));
    const repMod: PublicacionReportada = {
      publicacion: { ...pub, estado: EstadoPublicacion.REPORTADA, reportadaPorMi: true },
      cantidadReportes: nuevosReportes.length,
      motivos: motivosUnicos,
      reportes: nuevosReportes,
    };

    if (indexMod >= 0) {
      reportadasSimuladas[indexMod] = repMod;
    } else {
      reportadasSimuladas = [repMod, ...reportadasSimuladas];
    }

    return HttpResponse.json(nuevoReporte, { status: 201 });
  }),

  // Listar publicaciones reportadas para moderación (RF-24, solo ADMIN)
  http.get("*/api/v1/moderacion/reportadas", ({ request }) => {
    if (usuarioActualModeracion.rol !== RolUsuario.ADMIN) {
      return HttpResponse.json(
        { codigo: 403, mensaje: "Solo administradores pueden acceder al panel de moderación." },
        { status: 403 },
      );
    }

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limite = url.searchParams.get("limite");

    const noEliminadas = reportadasSimuladas.filter(
      (r) => r.publicacion.estado !== EstadoPublicacion.ELIMINADA,
    );

    const resultado = paginar(noEliminadas, cursor, limite);
    return HttpResponse.json(resultado, { status: 200 });
  }),

  // Detalle de publicación reportada para moderación (HU-13, solo ADMIN)
  http.get("*/api/v1/moderacion/reportadas/:id", ({ params }) => {
    if (usuarioActualModeracion.rol !== RolUsuario.ADMIN) {
      return HttpResponse.json(
        { codigo: 403, mensaje: "Solo administradores pueden acceder a este recurso." },
        { status: 403 },
      );
    }

    const { id } = params;
    const pubId = String(id);
    const encontrada = reportadasSimuladas.find((r) => r.publicacion.id === pubId);

    if (!encontrada || encontrada.publicacion.estado === EstadoPublicacion.ELIMINADA) {
      return HttpResponse.json(
        { codigo: 404, mensaje: "Publicación reportada no encontrada o ya eliminada." },
        { status: 404 },
      );
    }

    return HttpResponse.json(encontrada, { status: 200 });
  }),
];
