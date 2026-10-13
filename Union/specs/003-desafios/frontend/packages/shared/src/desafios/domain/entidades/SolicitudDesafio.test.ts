import { describe, expect, it } from "vitest";
import { RolUsuario } from "../../../domain/enums";
import { EstadoSolicitudDesafio } from "../enums/EstadoSolicitudDesafio";
import { TransicionInvalida } from "../errores/ErroresDominio";
import { SesionActual } from "../SesionActual";
import { SolicitudDesafio } from "./SolicitudDesafio";

const solicitud = (estado: EstadoSolicitudDesafio, autorId = "autor-1"): SolicitudDesafio =>
  new SolicitudDesafio({ id: "s1", autorId, estado, version: 1 });

const AUTOR = new SesionActual("autor-1", RolUsuario.USER);
const OTRO_USUARIO = new SesionActual("otro-1", RolUsuario.USER);
const ADMIN = new SesionActual("admin-1", RolUsuario.ADMIN);

describe("SolicitudDesafio", () => {
  describe("transiciones", () => {
    it("aprobar pasa de PENDIENTE a APROBADA", () => {
      const original = solicitud(EstadoSolicitudDesafio.PENDIENTE);
      const aprobada = original.aprobar();
      expect(aprobada.estado).toBe(EstadoSolicitudDesafio.APROBADA);
      expect(original.estado).toBe(EstadoSolicitudDesafio.PENDIENTE);
    });

    it("rechazar pasa de PENDIENTE a RECHAZADA", () => {
      const rechazada = solicitud(EstadoSolicitudDesafio.PENDIENTE).rechazar();
      expect(rechazada.estado).toBe(EstadoSolicitudDesafio.RECHAZADA);
    });

    it.each([EstadoSolicitudDesafio.APROBADA, EstadoSolicitudDesafio.RECHAZADA])(
      "aprobar desde %s lanza transición inválida",
      (estado) => {
        expect(() => solicitud(estado).aprobar()).toThrow(TransicionInvalida);
        expect(() => solicitud(estado).aprobar()).toThrow(`No se puede aprobar una solicitud en estado ${estado}.`);
      },
    );

    it.each([EstadoSolicitudDesafio.APROBADA, EstadoSolicitudDesafio.RECHAZADA])(
      "rechazar desde %s lanza transición inválida",
      (estado) => {
        expect(() => solicitud(estado).rechazar()).toThrow(TransicionInvalida);
        expect(() => solicitud(estado).rechazar()).toThrow(`No se puede rechazar una solicitud en estado ${estado}.`);
      },
    );
  });

  describe("estaResuelta", () => {
    it("es false en PENDIENTE", () => {
      expect(solicitud(EstadoSolicitudDesafio.PENDIENTE).estaResuelta()).toBe(false);
    });

    it.each([EstadoSolicitudDesafio.APROBADA, EstadoSolicitudDesafio.RECHAZADA])("es true en %s", (estado) => {
      expect(solicitud(estado).estaResuelta()).toBe(true);
    });
  });

  describe("permisos sobre solicitud pendiente", () => {
    const pendiente = () => solicitud(EstadoSolicitudDesafio.PENDIENTE);

    it("el autor puede editar y eliminar", () => {
      expect(pendiente().puedeEditarPor(AUTOR)).toBe(true);
      expect(pendiente().puedeEliminarPor(AUTOR)).toBe(true);
    });

    it("ADMIN puede editar y eliminar", () => {
      expect(pendiente().puedeEditarPor(ADMIN)).toBe(true);
      expect(pendiente().puedeEliminarPor(ADMIN)).toBe(true);
    });

    it("otro usuario no puede editar ni eliminar", () => {
      expect(pendiente().puedeEditarPor(OTRO_USUARIO)).toBe(false);
      expect(pendiente().puedeEliminarPor(OTRO_USUARIO)).toBe(false);
    });
  });

  describe("permisos sobre solicitud resuelta", () => {
    // Bloqueo provisional de A-04: las resueltas no se editan ni eliminan.
    it.each([EstadoSolicitudDesafio.APROBADA, EstadoSolicitudDesafio.RECHAZADA])(
      "ni el autor ni ADMIN editan o eliminan una %s",
      (estado) => {
        const resuelta = solicitud(estado);
        expect(resuelta.puedeEditarPor(AUTOR)).toBe(false);
        expect(resuelta.puedeEliminarPor(AUTOR)).toBe(false);
        expect(resuelta.puedeEditarPor(ADMIN)).toBe(false);
        expect(resuelta.puedeEliminarPor(ADMIN)).toBe(false);
      },
    );
  });
});
