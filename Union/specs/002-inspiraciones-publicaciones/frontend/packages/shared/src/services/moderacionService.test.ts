// Tests del servicio de moderación (T032).
// Spec: RF-24, RF-07, HU-13. Contrato: contracts/api-client.md (Reportes y moderación).

import { beforeEach, describe, expect, it } from "vitest";
import { publicacionReportadaModeracion } from "../../../../tests/mocks/datos";
import {
  fijarRolModeracion,
  reiniciarReportesSimulados,
} from "../../../../tests/mocks/handlers/reportes";
import { crearHttpClient } from "./httpClient";
import {
  crearModeracionService,
  type ModeracionService,
} from "./moderacionService";

describe("moderacionService", () => {
  const cliente = crearHttpClient({ baseUrl: "http://localhost/api/v1", retrasoReintentoMs: 0 });
  const servicio: ModeracionService = crearModeracionService(cliente);

  beforeEach(() => {
    reiniciarReportesSimulados();
    // Por defecto en estos tests actuamos como ADMIN
    fijarRolModeracion(true);
  });

  describe("listarReportadas", () => {
    it("obtiene el listado paginado de publicaciones reportadas para administradores", async () => {
      const resultado = await servicio.listarReportadas();

      expect(resultado.items.length).toBeGreaterThan(0);
      expect(resultado.items[0]?.publicacion.id).toBe(publicacionReportadaModeracion.publicacion.id);
      expect(resultado.items[0]?.cantidadReportes).toBeGreaterThan(0);
    });

    it("falla con 403 si un usuario sin rol ADMIN intenta listar reportadas", async () => {
      fijarRolModeracion(false);

      await expect(servicio.listarReportadas()).rejects.toMatchObject({
        codigo: 403,
      });
    });

    it("soporta paginación por cursor y límite", async () => {
      const resultado = await servicio.listarReportadas({ cursor: "0", limite: 1 });

      expect(resultado.items.length).toBe(1);
    });
  });

  describe("obtenerReportadaPorId", () => {
    it("obtiene el detalle de una publicación reportada con sus motivos y reportes", async () => {
      const detalle = await servicio.obtenerReportadaPorId(
        publicacionReportadaModeracion.publicacion.id,
      );

      expect(detalle.publicacion.id).toBe(publicacionReportadaModeracion.publicacion.id);
      expect(detalle.reportes.length).toBeGreaterThan(0);
      expect(detalle.motivos.length).toBeGreaterThan(0);
    });

    it("falla con 403 si no es ADMIN", async () => {
      fijarRolModeracion(false);

      await expect(
        servicio.obtenerReportadaPorId(publicacionReportadaModeracion.publicacion.id),
      ).rejects.toMatchObject({
        codigo: 403,
      });
    });

    it("falla con 404 si la publicación reportada no existe", async () => {
      await expect(servicio.obtenerReportadaPorId("no-existe")).rejects.toMatchObject({
        codigo: 404,
      });
    });
  });

  describe("eliminarPublicacion", () => {
    it("permite a un ADMIN eliminar una publicación reportada (RF-07)", async () => {
      await expect(
        servicio.eliminarPublicacion(publicacionReportadaModeracion.publicacion.id),
      ).resolves.toBeUndefined();

      // Ya no debería aparecer en el detalle de reportadas
      await expect(
        servicio.obtenerReportadaPorId(publicacionReportadaModeracion.publicacion.id),
      ).rejects.toMatchObject({
        codigo: 404,
      });
    });

    it("falla con 404 si la publicación a eliminar no existe", async () => {
      await expect(servicio.eliminarPublicacion("no-existe")).rejects.toMatchObject({
        codigo: 404,
      });
    });
  });
});
