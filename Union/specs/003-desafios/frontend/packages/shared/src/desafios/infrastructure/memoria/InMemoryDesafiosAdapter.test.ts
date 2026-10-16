/**
 * Pruebas del adaptador en memoria (T032)
 *
 * Verifica que InMemoryDesafiosAdapter implementa correctamente el contrato DesafiosPort:
 * - Paginación por cursor (no offset)
 * - Filtros por ámbito y estado
 * - Permisos de lectura/escritura
 * - 404 para desafíos eliminados (CB-01)
 * - Control de versión (CB-02)
 *
 * Fuentes de verdad:
 * - spec.md: Criterios de aceptación y reglas de negocio
 * - data-model.md: Estados y transiciones válidas
 * - tasks.md: T032
 */

import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryDesafiosAdapter } from "./InMemoryDesafiosAdapter";
import { Foto, FormatoFoto } from "../../domain/Foto";
import { AmbitoDesafio } from "../../domain/AmbitoDesafio";
import { RangoFechas } from "../../domain/RangoFechas";
import { EstadoDesafio } from "../../domain/enums/EstadoDesafio";
import { EstadoSolicitudDesafio } from "../../domain/enums/EstadoSolicitudDesafio";
import type { DatosDesafio } from "../../domain/entidades/Desafio";

describe("InMemoryDesafiosAdapter", () => {
  let adaptador: InMemoryDesafiosAdapter;

  // Datos de prueba comunes
  const fotoPrincipal = new Foto("foto-1", "http://example.com/1.jpg", FormatoFoto.JPEG, true);
  const fotoSecundaria = new Foto("foto-2", "http://example.com/2.jpg", FormatoFoto.PNG, false);
  const ambitoArte = new AmbitoDesafio("Arte");
  const ambitoDiseño = new AmbitoDesafio("Diseño");

  // Función auxiliar para crear desafío de prueba
  const crearDatosDesafio = (
    nombre: string,
    fechaInicio: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    fechaFin: Date = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  ): DatosDesafio => ({
    nombre,
    descripcionLarga: `Descripción de ${nombre}`,
    fotos: [fotoPrincipal, fotoSecundaria],
    ambitos: [ambitoArte],
    fechaInicio,
    fechaFin,
  });

  beforeEach(() => {
    adaptador = new InMemoryDesafiosAdapter();
  });

  describe("Ámbitos", () => {
    it("debe listar ámbitos disponibles", async () => {
      const ambitos = await adaptador.listarAmbitos();
      expect(ambitos).toHaveLength(5);
      expect(ambitos.map((a) => a.valor)).toContain("Pintura");
    });
  });

  describe("Desafíos - Lectura", () => {
    it("debe listar desafíos vacío inicialmente", async () => {
      const pagina = await adaptador.listarDesafios({}, { limite: 10 });
      expect(pagina.items).toHaveLength(0);
      expect(pagina.siguienteCursor).toBeNull();
    });

    it("debe publicar y listar un desafío", async () => {
      const datos = crearDatosDesafio("Desafío 1");
      await adaptador.publicarDesafio(datos);

      const pagina = await adaptador.listarDesafios({}, { limite: 10 });
      expect(pagina.items).toHaveLength(1);
      expect(pagina.items[0].nombre).toBe("Desafío 1");
      expect(pagina.items[0].estado).toBe(EstadoDesafio.ACTIVO);
    });

    it("debe obtener un desafío por ID", async () => {
      const datos = crearDatosDesafio("Desafío Único");
      const publicado = await adaptador.publicarDesafio(datos);

      const obtenido = await adaptador.obtenerDesafio(publicado.id);
      expect(obtenido.id).toBe(publicado.id);
      expect(obtenido.nombre).toBe("Desafío Único");
    });

    it("debe lanzar error 404 si el desafío no existe", async () => {
      await expect(adaptador.obtenerDesafio("id-inexistente")).rejects.toThrow(
        "no encontrado"
      );
    });

    it("debe lanzar error 404 para desafío eliminado", async () => {
      const datos = crearDatosDesafio("Desafío a Eliminar");
      const publicado = await adaptador.publicarDesafio(datos);

      await adaptador.eliminarDesafio(publicado.id);

      await expect(adaptador.obtenerDesafio(publicado.id)).rejects.toThrow(
        "no encontrado"
      );
    });
  });

  describe("Desafíos - Filtros", () => {
    beforeEach(async () => {
      // Crear desafíos con diferentes ámbitos y estados
      const datosArte: DatosDesafio = {
        ...crearDatosDesafio("Desafío de Arte", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
        ambitos: [new AmbitoDesafio("Arte")],
      };
      await adaptador.publicarDesafio(datosArte);

      const datosDiseño: DatosDesafio = {
        ...crearDatosDesafio("Desafío de Diseño", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
        ambitos: [new AmbitoDesafio("Diseño Gráfico")],
      };
      await adaptador.publicarDesafio(datosDiseño);

      // Crear desafío futuro (PROGRAMADO)
      const datosFuturo = crearDatosDesafio(
        "Desafío Futuro",
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      );
      await adaptador.publicarDesafio(datosFuturo);
    });

    it("debe filtrar por ámbito", async () => {
      const pagina = await adaptador.listarDesafios(
        { ambitos: ["Arte"] },
        { limite: 10 }
      );
      expect(pagina.items).toHaveLength(1);
      expect(pagina.items[0].nombre).toBe("Desafío de Arte");
    });

    it("debe filtrar por múltiples ámbitos", async () => {
      const pagina = await adaptador.listarDesafios(
        { ambitos: ["Arte", "Diseño Gráfico"] },
        { limite: 10 }
      );
      expect(pagina.items).toHaveLength(2);
    });

    it("debe filtrar por estado ACTIVO", async () => {
      const pagina = await adaptador.listarDesafios(
        { estados: [EstadoDesafio.ACTIVO] },
        { limite: 10 }
      );
      expect(pagina.items).toHaveLength(2);
      expect(pagina.items.every((d) => d.estado === EstadoDesafio.ACTIVO)).toBe(true);
    });

    it("debe filtrar por estado PROGRAMADO", async () => {
      const pagina = await adaptador.listarDesafios(
        { estados: [EstadoDesafio.PROGRAMADO] },
        { limite: 10 }
      );
      expect(pagina.items).toHaveLength(1);
      expect(pagina.items[0].nombre).toBe("Desafío Futuro");
    });

    it("debe combinar filtros (ámbito + estado)", async () => {
      const pagina = await adaptador.listarDesafios(
        { ambitos: ["Arte"], estados: [EstadoDesafio.ACTIVO] },
        { limite: 10 }
      );
      expect(pagina.items).toHaveLength(1);
      expect(pagina.items[0].nombre).toBe("Desafío de Arte");
    });

    it("debe excluir desafíos eliminados del filtro", async () => {
      const datos = crearDatosDesafio("Desafío a Filtrar");
      const publicado = await adaptador.publicarDesafio(datos);
      await adaptador.eliminarDesafio(publicado.id);

      const pagina = await adaptador.listarDesafios({}, { limite: 10 });
      expect(pagina.items.map((d) => d.id)).not.toContain(publicado.id);
    });
  });

  describe("Desafíos - Paginación", () => {
    beforeEach(async () => {
      // Crear 5 desafíos
      for (let i = 1; i <= 5; i++) {
        const datos = crearDatosDesafio(`Desafío ${i}`);
        await adaptador.publicarDesafio(datos);
      }
    });

    it("debe paginar con límite", async () => {
      const pagina = await adaptador.listarDesafios({}, { limite: 2 });
      expect(pagina.items).toHaveLength(2);
      expect(pagina.siguienteCursor).not.toBeNull();
    });

    it("debe navegar con cursor", async () => {
      const pagina1 = await adaptador.listarDesafios({}, { limite: 2 });
      expect(pagina1.items).toHaveLength(2);

      const pagina2 = await adaptador.listarDesafios(
        {},
        { limite: 2, cursor: pagina1.siguienteCursor! }
      );
      expect(pagina2.items).toHaveLength(2);
      expect(pagina2.items[0].id).not.toBe(pagina1.items[0].id);
    });

    it("debe retornar null como siguienteCursor en última página", async () => {
      const pagina = await adaptador.listarDesafios({}, { limite: 10 });
      expect(pagina.items).toHaveLength(5);
      expect(pagina.siguienteCursor).toBeNull();
    });
  });

  describe("Desafíos - Edición", () => {
    it("debe editar un desafío", async () => {
      const datos = crearDatosDesafio("Desafío Original");
      const publicado = await adaptador.publicarDesafio(datos);

      const datosModificados: DatosDesafio = {
        ...datos,
        nombre: "Desafío Modificado",
      };
      const editado = await adaptador.editarDesafio(
        publicado.id,
        datosModificados,
        publicado.version
      );

      expect(editado.nombre).toBe("Desafío Modificado");
      expect(editado.version).toBe(publicado.version + 1);
    });

    it("debe lanzar error si la versión no coincide", async () => {
      const datos = crearDatosDesafio("Desafío Versión");
      const publicado = await adaptador.publicarDesafio(datos);

      const datosModificados: DatosDesafio = {
        ...datos,
        nombre: "Modificado",
      };

      await expect(
        adaptador.editarDesafio(publicado.id, datosModificados, 999)
      ).rejects.toThrow("Conflicto de versión");
    });
  });

  describe("Desafíos - Eliminación", () => {
    it("debe eliminar un desafío (lógicamente)", async () => {
      const datos = crearDatosDesafio("Desafío a Eliminar");
      const publicado = await adaptador.publicarDesafio(datos);

      await adaptador.eliminarDesafio(publicado.id);

      await expect(adaptador.obtenerDesafio(publicado.id)).rejects.toThrow(
        "no encontrado"
      );
    });

    it("debe no listar desafíos eliminados", async () => {
      const datos = crearDatosDesafio("Desafío Invisible");
      const publicado = await adaptador.publicarDesafio(datos);

      await adaptador.eliminarDesafio(publicado.id);

      const pagina = await adaptador.listarDesafios({}, { limite: 10 });
      expect(pagina.items.map((d) => d.id)).not.toContain(publicado.id);
    });
  });

  describe("Solicitudes", () => {
    it("debe listar solicitudes vacío inicialmente", async () => {
      const pagina = await adaptador.listarSolicitudes({}, { limite: 10 });
      expect(pagina.items).toHaveLength(0);
    });

    it("debe proponer una solicitud", async () => {
      const solicitud = await adaptador.proponerSolicitud();
      expect(solicitud.estado).toBe(EstadoSolicitudDesafio.PENDIENTE);
      expect(solicitud.version).toBe(1);
    });

    it("debe filtrar solicitudes por estado", async () => {
      const s1 = await adaptador.proponerSolicitud();
      const s2 = await adaptador.proponerSolicitud();
      await adaptador.aprobarSolicitud(s2.id);

      const pendientes = await adaptador.listarSolicitudes(
        { estado: EstadoSolicitudDesafio.PENDIENTE },
        { limite: 10 }
      );
      const aprobadas = await adaptador.listarSolicitudes(
        { estado: EstadoSolicitudDesafio.APROBADA },
        { limite: 10 }
      );

      expect(pendientes.items).toHaveLength(1);
      expect(aprobadas.items).toHaveLength(1);
    });

    it("debe aprobar una solicitud", async () => {
      const solicitud = await adaptador.proponerSolicitud();
      const aprobada = await adaptador.aprobarSolicitud(solicitud.id);

      expect(aprobada.estado).toBe(EstadoSolicitudDesafio.APROBADA);
      expect(aprobada.version).toBe(solicitud.version + 1);
    });

    it("debe rechazar una solicitud", async () => {
      const solicitud = await adaptador.proponerSolicitud();
      const rechazada = await adaptador.rechazarSolicitud(solicitud.id);

      expect(rechazada.estado).toBe(EstadoSolicitudDesafio.RECHAZADA);
    });

    it("debe editar una solicitud", async () => {
      const solicitud = await adaptador.proponerSolicitud();
      const editada = await adaptador.editarSolicitud(solicitud.id, solicitud.version);

      expect(editada.version).toBe(solicitud.version + 1);
    });

    it("debe eliminar una solicitud", async () => {
      const solicitud = await adaptador.proponerSolicitud();
      await adaptador.eliminarSolicitud(solicitud.id);

      const pagina = await adaptador.listarSolicitudes({}, { limite: 10 });
      expect(pagina.items.map((s) => s.id)).not.toContain(solicitud.id);
    });
  });

  describe("Respuestas", () => {
    let desafioId: string;

    beforeEach(async () => {
      const datos = crearDatosDesafio("Desafío con Respuestas");
      const desafio = await adaptador.publicarDesafio(datos);
      desafioId = desafio.id;
    });

    it("debe listar respuestas vacío inicialmente", async () => {
      const pagina = await adaptador.listarRespuestas(desafioId, { limite: 10 });
      expect(pagina.items).toHaveLength(0);
    });

    it("debe responder a un desafío", async () => {
      const respuesta = await adaptador.responderDesafio(desafioId);
      expect(respuesta.desafioId).toBe(desafioId);
      expect(respuesta.autorId).toBe("usuario-demo");
    });

    it("debe listar respuestas de un desafío", async () => {
      await adaptador.responderDesafio(desafioId);
      await adaptador.responderDesafio(desafioId);

      const pagina = await adaptador.listarRespuestas(desafioId, { limite: 10 });
      expect(pagina.items).toHaveLength(2);
    });

    it("debe editar una respuesta", async () => {
      const respuesta = await adaptador.responderDesafio(desafioId);
      const editada = await adaptador.editarRespuesta(respuesta.id);

      expect(editada.id).toBe(respuesta.id);
    });

    it("debe eliminar una respuesta", async () => {
      const respuesta = await adaptador.responderDesafio(desafioId);
      await adaptador.eliminarRespuesta(respuesta.id);

      const pagina = await adaptador.listarRespuestas(desafioId, { limite: 10 });
      expect(pagina.items.map((r) => r.id)).not.toContain(respuesta.id);
    });
  });

  describe("Control de concurrencia (CB-02)", () => {
    it("debe rechazar edición si la versión cambió", async () => {
      const datos = crearDatosDesafio("Desafío Concurrencia");
      const publicado = await adaptador.publicarDesafio(datos);

      // Simular cambio de versión en la API
      const datosModificados: DatosDesafio = {
        ...datos,
        nombre: "Modificado 1",
      };
      await adaptador.editarDesafio(publicado.id, datosModificados, publicado.version);

      // Intentar editar con versión antigua
      const datosModificados2: DatosDesafio = {
        ...datos,
        nombre: "Modificado 2",
      };
      await expect(
        adaptador.editarDesafio(publicado.id, datosModificados2, publicado.version)
      ).rejects.toThrow("Conflicto de versión");
    });
  });

  describe("Paginación de respuestas", () => {
    let desafioId: string;

    beforeEach(async () => {
      const datos = crearDatosDesafio("Desafío Paginado");
      const desafio = await adaptador.publicarDesafio(datos);
      desafioId = desafio.id;

      // Crear 5 respuestas
      for (let i = 0; i < 5; i++) {
        await adaptador.responderDesafio(desafioId);
      }
    });

    it("debe paginar respuestas correctamente", async () => {
      const pagina1 = await adaptador.listarRespuestas(desafioId, { limite: 2 });
      expect(pagina1.items).toHaveLength(2);
      expect(pagina1.siguienteCursor).not.toBeNull();

      const pagina2 = await adaptador.listarRespuestas(desafioId, {
        limite: 2,
        cursor: pagina1.siguienteCursor!,
      });
      expect(pagina2.items).toHaveLength(2);
    });
  });
});
