/* eslint-disable @typescript-eslint/consistent-type-assertions, prefer-const -- Los handlers MSW requieren casting para manipular datos de respuesta. */
// Handlers MSW para publicaciones (T023).
// Contrato: contracts/api-client.md (Publicaciones). Spec: RF-01 a RF-05, RF-25 a RF-27.

import { http, HttpResponse } from "msw";
import {
  EstadoPublicacion,
  FormatoArchivo,
  TipoContenido,
} from "../../../packages/shared/src/domain/enums";
import type {
  Paginacion,
  Publicacion,
} from "../../../packages/shared/src/domain/tipos";
import { publicaciones as datosIniciales, usuario } from "../datos";

let publicacionesSimuladas: Publicacion[] = [...datosIniciales];

export function reiniciarPublicacionesSimuladas(): void {
  publicacionesSimuladas = [...datosIniciales];
}

export function fijarPublicacionesSimuladas(nuevas: Publicacion[]): void {
  publicacionesSimuladas = [...nuevas];
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

export const publicacionesHandlers = [
  // Listado público / Feed con filtros y paginación (RF-25, RF-27)
  http.get("*/api/v1/publicaciones", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase();
    const etiqueta = url.searchParams.get("etiqueta")?.toLowerCase();
    const categoria = url.searchParams.get("categoria")?.toLowerCase();
    const tipo = url.searchParams.get("tipo");
    const cursor = url.searchParams.get("cursor");
    const limite = url.searchParams.get("limite");

    const activas = publicacionesSimuladas.filter(
      (p) => p.estado !== EstadoPublicacion.ELIMINADA,
    );

    const filtradas = activas.filter((p) => {
      if (q && !p.titulo.toLowerCase().includes(q) && !p.descripcion.toLowerCase().includes(q)) {
        return false;
      }
      if (categoria && p.categoria.toLowerCase() !== categoria) {
        return false;
      }
      if (etiqueta && !p.etiquetas.some((e) => e.toLowerCase() === etiqueta)) {
        return false;
      }
      if (tipo && p.tipoContenido !== tipo) {
        return false;
      }
      return true;
    });

    const resultado = paginar(filtradas, cursor, limite);
    return HttpResponse.json(resultado, { status: 200 });
  }),

  // Mis publicaciones (HU-02, HU-03)
  http.get("*/api/v1/me/publicaciones", ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limite = url.searchParams.get("limite");

    const misPubs = publicacionesSimuladas.filter(
      (p) => p.autor.id === usuario.id && p.estado !== EstadoPublicacion.ELIMINADA,
    );

    const resultado = paginar(misPubs, cursor, limite);
    return HttpResponse.json(resultado, { status: 200 });
  }),

  // Detalle de publicación (RF-26)
  http.get("*/api/v1/publicaciones/:id", ({ params }) => {
    const { id } = params;
    const encontrada = publicacionesSimuladas.find((p) => p.id === id);

    if (!encontrada || encontrada.estado === EstadoPublicacion.ELIMINADA) {
      return HttpResponse.json(
        { codigo: 404, mensaje: "Publicación no encontrada o eliminada." },
        { status: 404 },
      );
    }

    return HttpResponse.json(encontrada, { status: 200 });
  }),

  // Crear publicación (RF-01 a RF-03)
  http.post("*/api/v1/publicaciones", async ({ request }) => {
    let titulo = "";
    let descripcion = "";
    let categoria = "General";
    let etiquetas: string[] = [];
    let formato: FormatoArchivo = FormatoArchivo.PNG;
    let tipoContenido: TipoContenido = TipoContenido.IMAGEN;

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      titulo = String(formData.get("titulo") ?? "");
      descripcion = String(formData.get("descripcion") ?? "");
      categoria = String(formData.get("categoria") ?? "General");
      const etiquetasRaw = formData.getAll("etiquetas");
      if (etiquetasRaw.length > 0) {
        etiquetas = etiquetasRaw.map(String);
      } else if (formData.has("etiquetas[]")) {
        etiquetas = formData.getAll("etiquetas[]").map(String);
      }
    } else {
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      titulo = typeof body.titulo === "string" ? body.titulo : "";
      descripcion = typeof body.descripcion === "string" ? body.descripcion : "";
      categoria = typeof body.categoria === "string" ? body.categoria : "General";
      if (Array.isArray(body.etiquetas)) {
        etiquetas = body.etiquetas.map(String);
      }
    }

    const ahora = new Date().toISOString();
    const nueva: Publicacion = {
      id: `p-${Date.now()}`,
      titulo,
      descripcion,
      contenido: "https://ejemplo.test/media/subida.png",
      formato,
      tipoContenido,
      categoria,
      etiquetas,
      autor: { id: usuario.id, nombre: usuario.nombre },
      fechaCreacion: ahora,
      fechaUltimaEdicion: ahora,
      cantidadLikes: 0,
      estado: EstadoPublicacion.ACTIVA,
      likeadaPorMi: false,
      guardadaPorMi: false,
      reportadaPorMi: false,
    };

    publicacionesSimuladas = [nueva, ...publicacionesSimuladas];
    return HttpResponse.json(nueva, { status: 201 });
  }),

  // Editar publicación propia (RF-04, RF-06, RF-08)
  http.put("*/api/v1/publicaciones/:id", async ({ params, request }) => {
    const { id } = params;
    const index = publicacionesSimuladas.findIndex((p) => p.id === id);

    if (index === -1 || publicacionesSimuladas[index]?.estado === EstadoPublicacion.ELIMINADA) {
      return HttpResponse.json(
        { codigo: 404, mensaje: "Publicación no encontrada." },
        { status: 404 },
      );
    }

    const actual = publicacionesSimuladas[index];
    if (actual.autor.id !== usuario.id) {
      return HttpResponse.json(
        { codigo: 403, mensaje: "No tenés permiso para editar esta publicación." },
        { status: 403 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const titulo = typeof body.titulo === "string" ? body.titulo : actual.titulo;
    const descripcion = typeof body.descripcion === "string" ? body.descripcion : actual.descripcion;
    const categoria = typeof body.categoria === "string" ? body.categoria : actual.categoria;
    const etiquetas = Array.isArray(body.etiquetas) ? body.etiquetas.map(String) : actual.etiquetas;

    const actualizada: Publicacion = {
      ...actual,
      titulo,
      descripcion,
      categoria,
      etiquetas,
      fechaUltimaEdicion: new Date().toISOString(),
    };

    publicacionesSimuladas[index] = actualizada;
    return HttpResponse.json(actualizada, { status: 200 });
  }),

  // Borrar publicación (propia o admin) (RF-05, RF-07)
  http.delete("*/api/v1/publicaciones/:id", ({ params }) => {
    const { id } = params;
    const index = publicacionesSimuladas.findIndex((p) => p.id === id);

    if (index === -1 || publicacionesSimuladas[index]?.estado === EstadoPublicacion.ELIMINADA) {
      return HttpResponse.json(
        { codigo: 404, mensaje: "Publicación no encontrada." },
        { status: 404 },
      );
    }

    const actual = publicacionesSimuladas[index];
    // Borrado lógico (A-2)
    publicacionesSimuladas[index] = {
      ...actual,
      estado: EstadoPublicacion.ELIMINADA,
    };

    return new HttpResponse(null, { status: 204 });
  }),
];
