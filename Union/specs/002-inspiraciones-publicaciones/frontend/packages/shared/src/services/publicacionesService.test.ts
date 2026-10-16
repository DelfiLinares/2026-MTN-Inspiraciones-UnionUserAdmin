// Tests del servicio de publicaciones (T029).
// Spec: RF-01 a RF-05, RF-25 a RF-27. Contrato: contracts/api-client.md.

import { beforeEach, describe, expect, it } from "vitest";
import { EstadoPublicacion, TipoContenido } from "../domain/enums";
import type { Publicacion } from "../domain/tipos";
import {
  publicacionAjena,
  publicacionAudio,
  publicacionEliminada,
  publicacionPropia,
  usuario,
} from "../../../../tests/mocks/datos";
import { reiniciarPublicacionesSimuladas } from "../../../../tests/mocks/handlers/publicaciones";
import { crearHttpClient } from "./httpClient";
import {
  crearPublicacionesService,
  type DatosCrearPublicacion,
  type DatosEditarPublicacion,
  type FiltrosPublicaciones,
} from "./publicacionesService";

describe("publicacionesService", () => {
  const cliente = crearHttpClient({ baseUrl: "http://localhost/api/v1", retrasoReintentoMs: 0 });
  const servicio = crearPublicacionesService(cliente);

  beforeEach(() => {
    reiniciarPublicacionesSimuladas();
  });

  describe("listar", () => {
    it("obtiene el listado paginado de publicaciones activas", async () => {
      const resultado = await servicio.listar();

      expect(resultado.items.length).toBeGreaterThan(0);
      expect(
        resultado.items.every((p: Publicacion) => p.estado !== EstadoPublicacion.ELIMINADA),
      ).toBe(true);
    });

    it("aplica filtros de búsqueda, categoría, etiqueta y tipo de contenido", async () => {
      const filtros: FiltrosPublicaciones = {
        q: "Acuarela",
        categoria: "Ilustración",
        tipo: TipoContenido.IMAGEN,
        limite: 10,
      };

      const resultado = await servicio.listar(filtros);

      expect(resultado.items.length).toBe(1);
      expect(resultado.items[0]?.id).toBe(publicacionPropia.id);
    });

    it("soporta paginación por cursor y límite", async () => {
      const resultado = await servicio.listar({ cursor: "1", limite: 1 });

      expect(resultado.items.length).toBe(1);
    });
  });

  describe("listarPropias", () => {
    it("obtiene las publicaciones activas del usuario en sesión", async () => {
      const resultado = await servicio.listarPropias();

      expect(resultado.items.length).toBeGreaterThan(0);
      expect(
        resultado.items.every((p: Publicacion) => p.autor.id === usuario.id),
      ).toBe(true);
    });

    it("soporta paginación en publicaciones propias", async () => {
      const resultado = await servicio.listarPropias({ cursor: "0", limite: 1 });

      expect(resultado.items.length).toBe(1);
    });
  });

  describe("obtenerPorId", () => {
    it("obtiene el detalle de una publicación existente", async () => {
      const pub = await servicio.obtenerPorId(publicacionPropia.id);

      expect(pub.id).toBe(publicacionPropia.id);
      expect(pub.titulo).toBe(publicacionPropia.titulo);
    });

    it("falla con 404 si la publicación no existe o está eliminada", async () => {
      await expect(servicio.obtenerPorId("id-inexistente")).rejects.toMatchObject({
        codigo: 404,
      });

      await expect(servicio.obtenerPorId(publicacionEliminada.id)).rejects.toMatchObject({
        codigo: 404,
      });
    });
  });

  describe("crear", () => {
    it("crea una nueva publicación enviando FormData multipart", async () => {
      const archivoMock = new File(["contenido simulado"], "arte.png", { type: "image/png" });
      const datos: DatosCrearPublicacion = {
        titulo: "Nuevo boceto",
        descripcion: "Un boceto nocturno",
        categoria: "Concept Art",
        etiquetas: ["sketch", "digital"],
        archivo: archivoMock,
      };

      const creada = await servicio.crear(datos);

      expect(creada.id).toBeDefined();
      expect(creada.titulo).toBe("Nuevo boceto");
      expect(creada.categoria).toBe("Concept Art");
      expect(creada.etiquetas).toEqual(["sketch", "digital"]);
      expect(creada.autor.id).toBe(usuario.id);
    });
  });

  describe("editar", () => {
    it("edita una publicación existente del autor", async () => {
      const datos: DatosEditarPublicacion = {
        titulo: "Título Actualizado",
        descripcion: "Descripción actualizada",
        categoria: "Pintura al óleo",
        etiquetas: ["oleo", "arte"],
      };

      const editada = await servicio.editar(publicacionPropia.id, datos);

      expect(editada.id).toBe(publicacionPropia.id);
      expect(editada.titulo).toBe("Título Actualizado");
      expect(editada.categoria).toBe("Pintura al óleo");
    });

    it("falla con 403 si se intenta editar una publicación ajena", async () => {
      const datos: DatosEditarPublicacion = {
        titulo: "Hack",
        descripcion: "No permitido",
      };

      await expect(servicio.editar(publicacionAudio.id, datos)).rejects.toMatchObject({
        codigo: 403,
      });
    });

    it("falla con 404 si la publicación no existe", async () => {
      await expect(
        servicio.editar("no-existe", { titulo: "X" }),
      ).rejects.toMatchObject({
        codigo: 404,
      });
    });
  });

  describe("borrar", () => {
    it("elimina una publicación propia con éxito", async () => {
      await expect(servicio.borrar(publicacionAjena.id)).rejects.toMatchObject({
        codigo: 403,
      });

      await expect(servicio.borrar(publicacionPropia.id)).resolves.toBeUndefined();

      // Ya no debe estar activa
      await expect(servicio.obtenerPorId(publicacionPropia.id)).rejects.toMatchObject({
        codigo: 404,
      });
    });

    it("falla con 404 si la publicación ya no existe", async () => {
      await expect(servicio.borrar("id-inexistente")).rejects.toMatchObject({
        codigo: 404,
      });
    });
  });
});

