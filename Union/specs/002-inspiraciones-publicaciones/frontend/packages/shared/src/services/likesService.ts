// Servicio de likes (T030).
// Interactúa con la API REST mediante HttpClient para dar y quitar likes (RF-11 a RF-13).
// Respeta idempotencia y no muta estado local fuera de las respuestas de API.

import type { HttpClient } from "./httpClient";

export interface ResultadoLike {
  readonly likeadaPorMi: boolean;
  readonly cantidadLikes: number;
}

export interface LikesService {
  darLike(publicacionId: string): Promise<ResultadoLike>;
  quitarLike(publicacionId: string): Promise<ResultadoLike>;
}

export function crearLikesService(cliente: HttpClient): LikesService {
  return {
    async darLike(publicacionId: string): Promise<ResultadoLike> {
      return cliente.put<ResultadoLike>(`/publicaciones/${publicacionId}/like`);
    },

    async quitarLike(publicacionId: string): Promise<ResultadoLike> {
      return cliente.delete<ResultadoLike>(`/publicaciones/${publicacionId}/like`);
    },
  };
}
