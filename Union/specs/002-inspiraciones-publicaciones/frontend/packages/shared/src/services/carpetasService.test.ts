// Tests del servicio de carpetas (T031).
// Spec: RF-16 a RF-20, CB-02, CB-05. Contrato: contracts/api-client.md (Carpetas).

import { beforeEach, describe, expect, it } from "vitest";
import { VisibilidadCarpeta } from "../domain/enums";
import {
  carpetaConContenido,
  carpetaVacia,
  publicacionAjena,
  publicacionEliminada,
  publicacionPropia,
} from "../../../../tests/mocks/datos";
import { reiniciarCarpetasSimuladas } from "../../../../tests/mocks/handlers/carpetas";
import { crearCarpetasService } from "./carpetasService";
import { crearHttpClient } from "./httpClient";

describe("carpetasService", () => {
  const cliente = crearHttpClient({ baseUrl: "http://localhost/api/v1", retrasoReintentoMs: 0 });
  const servicio = crearCarpetasService(cliente);

  beforeEach(() => {
    reiniciarCarpetasSimuladas();
  });

  describe("listar", () => {
    it("obtiene la lista de carpetas del usuario autenticado", async () => {
      const carpetas = await servicio.listar();

      expect(carpetas.length).toBeGreaterThan(0);
      expect(carpetas.some((c) => c.id === carpetaConContenido.id)).toBe(true);
    });
  });

  describe("crear", () => {
    it("crea una carpeta con nombre válido", async () => {
      const nueva = await servicio.crear({ nombre: "Modelado 3D" });

      expect(nueva.id).toBeDefined();
      expect(nueva.nombre).toBe("Modelado 3D");
      expect(nueva.visibilidad).toBe(VisibilidadCarpeta.PRIVADA);
      expect(nueva.cantidadPublicaciones).toBe(0);
    });

    it("falla con 409 si ya existe una carpeta con el mismo nombre (insensible a mayúsculas)", async () => {
      await expect(servicio.crear({ nombre: "ideas de pintura" })).rejects.toMatchObject({
        codigo: 409,
      });
    });

    it("falla con 422 si el nombre está en blanco", async () => {
      await expect(servicio.crear({ nombre: "   " })).rejects.toMatchObject({
        codigo: 422,
      });
    });
  });

  describe("actualizar", () => {
    it("renombra una carpeta y modifica su visibilidad", async () => {
      const actualizada = await servicio.actualizar(carpetaConContenido.id, {
        nombre: "Ideas Renovadas",
        visibilidad: VisibilidadCarpeta.PUBLICA,
      });

      expect(actualizada.id).toBe(carpetaConContenido.id);
      expect(actualizada.nombre).toBe("Ideas Renovadas");
      expect(actualizada.visibilidad).toBe(VisibilidadCarpeta.PUBLICA);
    });

    it("falla con 404 si la carpeta no existe", async () => {
      await expect(
        servicio.actualizar("no-existe", { nombre: "Nueva" }),
      ).rejects.toMatchObject({
        codigo: 404,
      });
    });

    it("falla con 409 si se intenta renombrar a un nombre duplicado de otra carpeta", async () => {
      await expect(
        servicio.actualizar(carpetaConContenido.id, { nombre: carpetaVacia.nombre }),
      ).rejects.toMatchObject({
        codigo: 409,
      });
    });
  });

  describe("borrar", () => {
    it("elimina una carpeta correctamente", async () => {
      await expect(servicio.borrar(carpetaConContenido.id)).resolves.toBeUndefined();

      const lista = await servicio.listar();
      expect(lista.some((c) => c.id === carpetaConContenido.id)).toBe(false);
    });

    it("falla con 404 si la carpeta a borrar no existe", async () => {
      await expect(servicio.borrar("no-existe")).rejects.toMatchObject({
        codigo: 404,
      });
    });
  });

  describe("obtenerContenido", () => {
    it("obtiene el contenido paginado de una carpeta con items disponibles e indisponibles (CB-02)", async () => {
      const contenido = await servicio.obtenerContenido(carpetaConContenido.id);

      expect(contenido.items.length).toBeGreaterThan(0);
      const noDisponible = contenido.items.find((item) => !item.disponible);
      expect(noDisponible).toBeDefined();
    });

    it("devuelve lista vacía para una carpeta sin publicaciones (CB-05)", async () => {
      const contenido = await servicio.obtenerContenido(carpetaVacia.id);

      expect(contenido.items).toHaveLength(0);
    });

    it("falla con 404 si la carpeta no existe", async () => {
      await expect(servicio.obtenerContenido("no-existe")).rejects.toMatchObject({
        codigo: 404,
      });
    });
  });

  describe("guardarPublicacion y quitarPublicacion", () => {
    it("guarda una publicación ajena en una carpeta y permite quitarla", async () => {
      await expect(
        servicio.guardarPublicacion(carpetaVacia.id, publicacionAjena.id),
      ).resolves.toBeUndefined();

      const contenido = await servicio.obtenerContenido(carpetaVacia.id);
      expect(contenido.items.some((i) => i.disponible && i.publicacion.id === publicacionAjena.id)).toBe(true);

      await expect(
        servicio.quitarPublicacion(carpetaVacia.id, publicacionAjena.id),
      ).resolves.toBeUndefined();

      const contenidoDespues = await servicio.obtenerContenido(carpetaVacia.id);
      expect(contenidoDespues.items.some((i) => i.disponible && i.publicacion.id === publicacionAjena.id)).toBe(false);
    });

    it("falla con 403 al intentar guardar una publicación propia en una carpeta (A-9)", async () => {
      await expect(
        servicio.guardarPublicacion(carpetaVacia.id, publicacionPropia.id),
      ).rejects.toMatchObject({
        codigo: 403,
      });
    });

    it("falla con 404 si la publicación no existe o está eliminada", async () => {
      await expect(
        servicio.guardarPublicacion(carpetaVacia.id, publicacionEliminada.id),
      ).rejects.toMatchObject({
        codigo: 404,
      });
    });
  });

  describe("obtenerCarpetasDePublicacion", () => {
    it("devuelve los identificadores de carpetas donde está guardada la publicación", async () => {
      const carpetaIds = await servicio.obtenerCarpetasDePublicacion(publicacionAjena.id);

      expect(Array.isArray(carpetaIds)).toBe(true);
    });
  });
});
