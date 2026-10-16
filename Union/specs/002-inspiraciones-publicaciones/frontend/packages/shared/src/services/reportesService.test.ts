// Tests del servicio de reportes (T032).
// Spec: RF-21 a RF-23. Contrato: contracts/api-client.md (Reportes).

import { beforeEach, describe, expect, it } from "vitest";
import { MotivoReporte } from "../domain/enums";
import {
  publicacionAjena,
  publicacionEliminada,
  publicacionPropia,
  publicacionYaReportada,
} from "../../../../tests/mocks/datos";
import { reiniciarReportesSimulados } from "../../../../tests/mocks/handlers/reportes";
import { crearHttpClient } from "./httpClient";
import { crearReportesService, type DatosCrearReporte } from "./reportesService";

describe("reportesService", () => {
  const cliente = crearHttpClient({ baseUrl: "http://localhost/api/v1", retrasoReintentoMs: 0 });
  const servicio = crearReportesService(cliente);

  beforeEach(() => {
    reiniciarReportesSimulados();
  });

  describe("reportar", () => {
    it("crea un reporte válido sobre una publicación ajena", async () => {
      const datos: DatosCrearReporte = {
        motivo: MotivoReporte.SPAM,
      };

      const reporte = await servicio.reportar(publicacionAjena.id, datos);

      expect(reporte.id).toBeDefined();
      expect(reporte.motivo).toBe(MotivoReporte.SPAM);
      expect(reporte.publicacion.id).toBe(publicacionAjena.id);
      expect(reporte.resuelto).toBe(false);
    });

    it("crea un reporte con motivo OTRO y texto libre", async () => {
      const datos: DatosCrearReporte = {
        motivo: MotivoReporte.OTRO,
        textoLibre: "El contenido infringe derechos de autor externos",
      };

      const reporte = await servicio.reportar(publicacionAjena.id, datos);

      expect(reporte.motivo).toBe(MotivoReporte.OTRO);
      expect(reporte.textoLibre).toBe("El contenido infringe derechos de autor externos");
    });

    it("falla con 403 al intentar reportar una publicación propia (RF-22)", async () => {
      const datos: DatosCrearReporte = { motivo: MotivoReporte.SPAM };

      await expect(servicio.reportar(publicacionPropia.id, datos)).rejects.toMatchObject({
        codigo: 403,
      });
    });

    it("falla con 409 si el usuario ya reportó esa publicación (RF-23)", async () => {
      const datos: DatosCrearReporte = { motivo: MotivoReporte.CONTENIDO_INAPROPIADO };

      await expect(servicio.reportar(publicacionYaReportada.id, datos)).rejects.toMatchObject({
        codigo: 409,
      });
    });

    it("falla con 404 si la publicación no existe o está eliminada", async () => {
      const datos: DatosCrearReporte = { motivo: MotivoReporte.SPAM };

      await expect(servicio.reportar("no-existe", datos)).rejects.toMatchObject({
        codigo: 404,
      });

      await expect(servicio.reportar(publicacionEliminada.id, datos)).rejects.toMatchObject({
        codigo: 404,
      });
    });
  });
});
