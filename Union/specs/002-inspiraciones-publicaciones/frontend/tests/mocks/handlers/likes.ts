// Handlers MSW para likes (T024).
// Contrato: contracts/api-client.md (Likes). Spec: RF-11 a RF-15. Supuesto: S-3.

import { http, HttpResponse } from "msw";
import { EstadoPublicacion } from "../../../packages/shared/src/domain/enums";
import type { Publicacion } from "../../../packages/shared/src/domain/tipos";
import { publicaciones as datosIniciales, usuario } from "../datos";

interface EstadoLikePub {
  cantidadLikes: number;
  likeadaPorMi: boolean;
}

const estadoLikesSimulados: Map<string, EstadoLikePub> = new Map();

function inicializarEstadoLikes(): void {
  estadoLikesSimulados.clear();
  for (const pub of datosIniciales) {
    estadoLikesSimulados.set(pub.id, {
      cantidadLikes: pub.cantidadLikes,
      likeadaPorMi: pub.likeadaPorMi,
    });
  }
}

inicializarEstadoLikes();

export function reiniciarLikesSimulados(): void {
  inicializarEstadoLikes();
}

function buscarPublicacion(id: string): Publicacion | undefined {
  return datosIniciales.find((p) => p.id === id);
}

export const likesHandlers = [
  // Dar like (RF-11, RF-13, RF-14, S-3: idempotente)
  http.put("*/api/v1/publicaciones/:id/like", ({ params }) => {
    const { id } = params;
    const pubId = String(id);
    const pub = buscarPublicacion(pubId);

    if (!pub || pub.estado === EstadoPublicacion.ELIMINADA) {
      return HttpResponse.json(
        { codigo: 404, mensaje: "Publicación no encontrada o eliminada." },
        { status: 404 },
      );
    }

    if (pub.autor.id === usuario.id) {
      return HttpResponse.json(
        { codigo: 403, mensaje: "No podés dar like a tus propias publicaciones." },
        { status: 403 },
      );
    }

    const estadoActual = estadoLikesSimulados.get(pubId) ?? {
      cantidadLikes: pub.cantidadLikes,
      likeadaPorMi: pub.likeadaPorMi,
    };

    if (!estadoActual.likeadaPorMi) {
      estadoActual.likeadaPorMi = true;
      estadoActual.cantidadLikes += 1;
      estadoLikesSimulados.set(pubId, estadoActual);
    }

    return HttpResponse.json(
      {
        likeadaPorMi: true,
        cantidadLikes: estadoActual.cantidadLikes,
      },
      { status: 200 },
    );
  }),

  // Quitar like (RF-12, S-3: idempotente)
  http.delete("*/api/v1/publicaciones/:id/like", ({ params }) => {
    const { id } = params;
    const pubId = String(id);
    const pub = buscarPublicacion(pubId);

    if (!pub || pub.estado === EstadoPublicacion.ELIMINADA) {
      return HttpResponse.json(
        { codigo: 404, mensaje: "Publicación no encontrada o eliminada." },
        { status: 404 },
      );
    }

    const estadoActual = estadoLikesSimulados.get(pubId) ?? {
      cantidadLikes: pub.cantidadLikes,
      likeadaPorMi: pub.likeadaPorMi,
    };

    if (estadoActual.likeadaPorMi) {
      estadoActual.likeadaPorMi = false;
      estadoActual.cantidadLikes = Math.max(0, estadoActual.cantidadLikes - 1);
      estadoLikesSimulados.set(pubId, estadoActual);
    }

    return HttpResponse.json(
      {
        likeadaPorMi: false,
        cantidadLikes: estadoActual.cantidadLikes,
      },
      { status: 200 },
    );
  }),
];
