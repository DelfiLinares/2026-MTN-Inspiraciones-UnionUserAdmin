// Tests del servicio de likes (T030).
// Spec: RF-11 a RF-13. Contrato: contracts/api-client.md (Likes).

import { beforeEach, describe, expect, it } from "vitest";
import {
  publicacionAjena,
  publicacionEliminada,
  publicacionLikeadaYGuardada,
  publicacionPropia,
} from "../../../../tests/mocks/datos";
import { reiniciarLikesSimulados } from "../../../../tests/mocks/handlers/likes";
import { crearHttpClient } from "./httpClient";
import { crearLikesService } from "./likesService";

describe("likesService", () => {
  const cliente = crearHttpClient({ baseUrl: "http://localhost/api/v1", retrasoReintentoMs: 0 });
  const servicio = crearLikesService(cliente);

  beforeEach(() => {
    reiniciarLikesSimulados();
  });

  describe("darLike", () => {
    it("da like a una publicación ajena y devuelve el nuevo estado con contador incrementado", async () => {
      const resultado = await servicio.darLike(publicacionAjena.id);

      expect(resultado.likeadaPorMi).toBe(true);
      expect(resultado.cantidadLikes).toBe(publicacionAjena.cantidadLikes + 1);
    });

    it("es idempotente si ya se había dado like", async () => {
      const primeraVez = await servicio.darLike(publicacionAjena.id);
      const segundaVez = await servicio.darLike(publicacionAjena.id);

      expect(segundaVez.likeadaPorMi).toBe(true);
      expect(segundaVez.cantidadLikes).toBe(primeraVez.cantidadLikes);
    });

    it("falla con 403 al intentar dar like a una publicación propia (RF-14)", async () => {
      await expect(servicio.darLike(publicacionPropia.id)).rejects.toMatchObject({
        codigo: 403,
      });
    });

    it("falla con 404 si la publicación no existe o está eliminada", async () => {
      await expect(servicio.darLike("no-existe")).rejects.toMatchObject({
        codigo: 404,
      });

      await expect(servicio.darLike(publicacionEliminada.id)).rejects.toMatchObject({
        codigo: 404,
      });
    });
  });

  describe("quitarLike", () => {
    it("quita el like de una publicación previamente likeada y decrementa el contador", async () => {
      const resultado = await servicio.quitarLike(publicacionLikeadaYGuardada.id);

      expect(resultado.likeadaPorMi).toBe(false);
      expect(resultado.cantidadLikes).toBe(publicacionLikeadaYGuardada.cantidadLikes - 1);
    });

    it("es idempotente si la publicación no tenía like previo", async () => {
      const resultado = await servicio.quitarLike(publicacionAjena.id);

      expect(resultado.likeadaPorMi).toBe(false);
      expect(resultado.cantidadLikes).toBe(publicacionAjena.cantidadLikes);
    });

    it("falla con 404 si la publicación no existe o está eliminada", async () => {
      await expect(servicio.quitarLike("no-existe")).rejects.toMatchObject({
        codigo: 404,
      });

      await expect(servicio.quitarLike(publicacionEliminada.id)).rejects.toMatchObject({
        codigo: 404,
      });
    });
  });
});
