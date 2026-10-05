// Handlers MSW para carpetas y guardado (T025).
// Contrato: contracts/api-client.md (Carpetas). Spec: RF-16 a RF-20, CB-02, CB-05. Decisiones: A-5, A-7, A-9.

import { http, HttpResponse } from "msw";
import { EstadoPublicacion, VisibilidadCarpeta } from "../../../packages/shared/src/domain/enums";
import type {
  Carpeta,
  ItemCarpeta,
  Paginacion,
} from "../../../packages/shared/src/domain/tipos";
import {
  carpetas as carpetasIniciales,
  itemsCarpetaConContenido,
  itemsCarpetaPublica,
  publicaciones,
  usuario,
} from "../datos";

let carpetasSimuladas: Carpeta[] = [...carpetasIniciales];
const itemsPorCarpetaSimulados: Map<string, ItemCarpeta[]> = new Map([
  ["c-ideas", [...itemsCarpetaConContenido]],
  ["c-vacia", []],
  ["c-publica", [...itemsCarpetaPublica]],
]);

export function reiniciarCarpetasSimuladas(): void {
  carpetasSimuladas = [...carpetasIniciales];
  itemsPorCarpetaSimulados.clear();
  itemsPorCarpetaSimulados.set("c-ideas", [...itemsCarpetaConContenido]);
  itemsPorCarpetaSimulados.set("c-vacia", []);
  itemsPorCarpetaSimulados.set("c-publica", [...itemsCarpetaPublica]);
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

export const carpetasHandlers = [
  // Listar carpetas propias (RF-16)
  http.get("*/api/v1/carpetas", () => {
    return HttpResponse.json(carpetasSimuladas, { status: 200 });
  }),

  // Crear carpeta (RF-16, A-7)
  http.post("*/api/v1/carpetas", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";

    if (!nombre) {
      return HttpResponse.json(
        { codigo: 422, mensaje: "El nombre de la carpeta es obligatorio." },
        { status: 422 },
      );
    }

    const duplicada = carpetasSimuladas.some(
      (c) => c.nombre.toLowerCase() === nombre.toLowerCase(),
    );
    if (duplicada) {
      return HttpResponse.json(
        { codigo: 409, mensaje: "Ya tenés una carpeta con ese nombre." },
        { status: 409 },
      );
    }

    const nuevaCarpeta: Carpeta = {
      id: `c-${Date.now()}`,
      nombre,
      cantidadPublicaciones: 0,
      visibilidad: VisibilidadCarpeta.PRIVADA,
    };

    carpetasSimuladas = [...carpetasSimuladas, nuevaCarpeta];
    itemsPorCarpetaSimulados.set(nuevaCarpeta.id, []);

    return HttpResponse.json(nuevaCarpeta, { status: 201 });
  }),

  // Renombrar o cambiar visibilidad de carpeta (RF-16, RF-20)
  http.patch("*/api/v1/carpetas/:id", async ({ params, request }) => {
    const { id } = params;
    const index = carpetasSimuladas.findIndex((c) => c.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { codigo: 404, mensaje: "Carpeta no encontrada." },
        { status: 404 },
      );
    }

    const actual = carpetasSimuladas[index];
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    let nombre = actual.nombre;
    if (typeof body.nombre === "string") {
      const nombreLimpio = body.nombre.trim();
      if (!nombreLimpio) {
        return HttpResponse.json(
          { codigo: 422, mensaje: "El nombre no puede estar vacío." },
          { status: 422 },
        );
      }
      const duplicada = carpetasSimuladas.some(
        (c) => c.id !== id && c.nombre.toLowerCase() === nombreLimpio.toLowerCase(),
      );
      if (duplicada) {
        return HttpResponse.json(
          { codigo: 409, mensaje: "Ya tenés una carpeta con ese nombre." },
          { status: 409 },
        );
      }
      nombre = nombreLimpio;
    }

    const visibilidad =
      body.visibilidad === VisibilidadCarpeta.PUBLICA || body.visibilidad === VisibilidadCarpeta.PRIVADA
        ? (body.visibilidad as VisibilidadCarpeta)
        : actual.visibilidad;

    const actualizada: Carpeta = {
      ...actual,
      nombre,
      visibilidad,
    };

    carpetasSimuladas[index] = actualizada;
    return HttpResponse.json(actualizada, { status: 200 });
  }),

  // Eliminar carpeta (RF-16)
  http.delete("*/api/v1/carpetas/:id", ({ params }) => {
    const { id } = params;
    const index = carpetasSimuladas.findIndex((c) => c.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { codigo: 404, mensaje: "Carpeta no encontrada." },
        { status: 404 },
      );
    }

    carpetasSimuladas = carpetasSimuladas.filter((c) => c.id !== id);
    itemsPorCarpetaSimulados.delete(String(id));

    return new HttpResponse(null, { status: 204 });
  }),

  // Ver contenido de una carpeta (RF-19, CB-02, CB-05)
  http.get("*/api/v1/carpetas/:id/publicaciones", ({ params, request }) => {
    const { id } = params;
    const carpetaId = String(id);
    const carpeta = carpetasSimuladas.find((c) => c.id === carpetaId);

    if (!carpeta) {
      return HttpResponse.json(
        { codigo: 404, mensaje: "Carpeta no encontrada." },
        { status: 404 },
      );
    }

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limite = url.searchParams.get("limite");

    const items = itemsPorCarpetaSimulados.get(carpetaId) ?? [];
    const resultado = paginar(items, cursor, limite);

    return HttpResponse.json(resultado, { status: 200 });
  }),

  // Guardar publicación en una carpeta (RF-17, A-9)
  http.put("*/api/v1/carpetas/:id/publicaciones/:pubId", ({ params }) => {
    const { id, pubId } = params;
    const carpetaId = String(id);
    const publicacionId = String(pubId);

    const carpetaIndex = carpetasSimuladas.findIndex((c) => c.id === carpetaId);
    if (carpetaIndex === -1) {
      return HttpResponse.json(
        { codigo: 404, mensaje: "Carpeta no encontrada." },
        { status: 404 },
      );
    }

    const pub = publicaciones.find((p) => p.id === publicacionId);
    if (!pub || pub.estado === EstadoPublicacion.ELIMINADA) {
      return HttpResponse.json(
        { codigo: 404, mensaje: "Publicación no encontrada o eliminada." },
        { status: 404 },
      );
    }

    // No se pueden guardar publicaciones propias (A-9)
    if (pub.autor.id === usuario.id) {
      return HttpResponse.json(
        { codigo: 403, mensaje: "No podés guardar tus propias publicaciones en carpetas." },
        { status: 403 },
      );
    }

    const itemsActuales = itemsPorCarpetaSimulados.get(carpetaId) ?? [];
    const yaEsta = itemsActuales.some(
      (item) => (item.disponible && item.publicacion.id === publicacionId) || (!item.disponible && item.id === publicacionId),
    );

    if (!yaEsta) {
      const nuevoItem: ItemCarpeta = { disponible: true, publicacion: pub };
      const nuevosItems = [...itemsActuales, nuevoItem];
      itemsPorCarpetaSimulados.set(carpetaId, nuevosItems);

      const actualCarpeta = carpetasSimuladas[carpetaIndex];
      carpetasSimuladas[carpetaIndex] = {
        ...actualCarpeta,
        cantidadPublicaciones: nuevosItems.length,
      };
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // Quitar publicación de una carpeta (RF-18)
  http.delete("*/api/v1/carpetas/:id/publicaciones/:pubId", ({ params }) => {
    const { id, pubId } = params;
    const carpetaId = String(id);
    const publicacionId = String(pubId);

    const carpetaIndex = carpetasSimuladas.findIndex((c) => c.id === carpetaId);
    if (carpetaIndex === -1) {
      return HttpResponse.json(
        { codigo: 404, mensaje: "Carpeta no encontrada." },
        { status: 404 },
      );
    }

    const itemsActuales = itemsPorCarpetaSimulados.get(carpetaId) ?? [];
    const filtrados = itemsActuales.filter((item) => {
      if (item.disponible) {
        return item.publicacion.id !== publicacionId;
      }
      return item.id !== publicacionId;
    });

    itemsPorCarpetaSimulados.set(carpetaId, filtrados);

    const actualCarpeta = carpetasSimuladas[carpetaIndex];
    carpetasSimuladas[carpetaIndex] = {
      ...actualCarpeta,
      cantidadPublicaciones: filtrados.length,
    };

    return new HttpResponse(null, { status: 204 });
  }),

  // Consultar en qué carpetas del usuario está guardada una publicación (RF-17)
  http.get("*/api/v1/publicaciones/:id/carpetas", ({ params }) => {
    const { id } = params;
    const pubId = String(id);

    const carpetaIds: string[] = [];
    for (const [carpetaId, items] of itemsPorCarpetaSimulados.entries()) {
      const guardada = items.some(
        (item) => (item.disponible && item.publicacion.id === pubId) || (!item.disponible && item.id === pubId),
      );
      if (guardada) {
        carpetaIds.push(carpetaId);
      }
    }

    return HttpResponse.json({ carpetaIds }, { status: 200 });
  }),
];
