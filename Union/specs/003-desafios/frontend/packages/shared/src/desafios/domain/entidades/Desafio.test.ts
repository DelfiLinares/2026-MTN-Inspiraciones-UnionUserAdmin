import { describe, expect, it } from "vitest";
import { RolUsuario } from "../../../domain/enums";
import { AmbitoDesafio } from "../AmbitoDesafio";
import { Foto } from "../Foto";
import { RangoFechas } from "../RangoFechas";
import { SesionActual } from "../SesionActual";
import { Desafio, type DatosDesafio, type PropsDesafio } from "./Desafio";

const fecha = (anio: number, mes: number, dia: number, hora = 0): Date => new Date(anio, mes - 1, dia, hora);

const INICIO = fecha(2026, 10, 10, 10);
const FIN = fecha(2026, 10, 12, 18);
const OPCIONES = { finInclusivo: false };
const ANTES = fecha(2026, 10, 9);
const DURANTE = fecha(2026, 10, 11);
const DESPUES = fecha(2026, 10, 13);

const ADMIN = new SesionActual("admin-1", RolUsuario.ADMIN);
const USUARIO = new SesionActual("usuario-1", RolUsuario.USER);

// principal: índice de la foto principal, o -1 si no hay ninguna.
const fotos = (cantidad: number, principal = 0, formato = "JPEG"): Foto[] =>
  Array.from({ length: cantidad }, (_, i) => new Foto(`f${i}`, `https://example.test/${i}.jpg`, formato, i === principal));

const datosValidos = (sobrescribir: Partial<DatosDesafio> = {}): DatosDesafio => ({
  nombre: "Desafío",
  descripcionLarga: "Descripción",
  fotos: fotos(1),
  ambitos: [new AmbitoDesafio("Deporte")],
  fechaInicio: INICIO,
  fechaFin: FIN,
  ...sobrescribir,
});

const desafio = (sobrescribir: Partial<PropsDesafio> = {}): Desafio =>
  new Desafio({
    id: "d1",
    nombre: "Desafío",
    descripcionLarga: "Descripción",
    fotos: fotos(1),
    rango: new RangoFechas(INICIO, FIN),
    ambitos: [new AmbitoDesafio("Deporte")],
    tieneRespuestas: false,
    version: 1,
    eliminado: false,
    ...sobrescribir,
  });

describe("Desafio", () => {
  describe("validar fotos", () => {
    it("no reporta error con una foto principal", () => {
      expect(Desafio.validar(datosValidos({ fotos: fotos(1) })).fotos).toBeUndefined();
    });

    it("no reporta error con cinco fotos y una principal", () => {
      expect(Desafio.validar(datosValidos({ fotos: fotos(5) })).fotos).toBeUndefined();
    });

    it("reporta error sin fotos", () => {
      expect(Desafio.validar(datosValidos({ fotos: [] })).fotos).toBeDefined();
    });

    it("reporta error con seis fotos", () => {
      expect(Desafio.validar(datosValidos({ fotos: fotos(6) })).fotos).toBeDefined();
    });

    it("reporta error si ninguna foto es principal", () => {
      expect(Desafio.validar(datosValidos({ fotos: fotos(2, -1) })).fotos).toBeDefined();
    });

    it("reporta error si hay más de una foto principal", () => {
      const dosPrincipales = [
        new Foto("a", "https://example.test/a.jpg", "JPEG", true),
        new Foto("b", "https://example.test/b.jpg", "JPEG", true),
      ];
      expect(Desafio.validar(datosValidos({ fotos: dosPrincipales })).fotos).toBeDefined();
    });

    it("acepta fotos JPEG y PNG", () => {
      expect(Desafio.validar(datosValidos({ fotos: fotos(1, 0, "JPEG") })).fotos).toBeUndefined();
      expect(Desafio.validar(datosValidos({ fotos: fotos(1, 0, "PNG") })).fotos).toBeUndefined();
    });

    it("rechaza formatos distintos de JPEG y PNG", () => {
      expect(() => new Foto("f", "https://example.test/f.gif", "GIF", true)).toThrow(
        "El formato de la foto debe ser JPEG o PNG.",
      );
    });
  });

  describe("validar ámbitos", () => {
    it("no reporta error con al menos un ámbito", () => {
      expect(Desafio.validar(datosValidos()).ambitos).toBeUndefined();
    });

    it("reporta error sin ámbitos", () => {
      expect(Desafio.validar(datosValidos({ ambitos: [] })).ambitos).toBeDefined();
    });

    it("rechaza un ámbito vacío", () => {
      expect(() => new AmbitoDesafio("   ")).toThrow("El ámbito no puede estar vacío.");
    });
  });

  describe("permisos de edición y eliminación", () => {
    it("ADMIN puede editar y eliminar", () => {
      const d = desafio();
      expect(d.puedeEditarPor(ADMIN)).toBe(true);
      expect(d.puedeEliminarPor(ADMIN)).toBe(true);
    });

    it("USER no puede editar ni eliminar", () => {
      const d = desafio();
      expect(d.puedeEditarPor(USUARIO)).toBe(false);
      expect(d.puedeEliminarPor(USUARIO)).toBe(false);
    });
  });

  describe("requiereConfirmacionEdicion", () => {
    it("es true cuando el desafío está ACTIVO", () => {
      expect(desafio().requiereConfirmacionEdicion(DURANTE, OPCIONES)).toBe(true);
    });

    it("es false cuando está PROGRAMADO sin respuestas", () => {
      expect(desafio().requiereConfirmacionEdicion(ANTES, OPCIONES)).toBe(false);
    });

    it("es true cuando está PROGRAMADO con respuestas", () => {
      expect(desafio({ tieneRespuestas: true }).requiereConfirmacionEdicion(ANTES, OPCIONES)).toBe(true);
    });

    it("es true cuando está FINALIZADO con respuestas", () => {
      expect(desafio({ tieneRespuestas: true }).requiereConfirmacionEdicion(DESPUES, OPCIONES)).toBe(true);
    });

    it("es false cuando está FINALIZADO sin respuestas", () => {
      expect(desafio().requiereConfirmacionEdicion(DESPUES, OPCIONES)).toBe(false);
    });
  });

  describe("aceptaRespuestas", () => {
    it("es true solo cuando el desafío está ACTIVO", () => {
      expect(desafio().aceptaRespuestas(DURANTE, OPCIONES)).toBe(true);
    });

    it("es false cuando está PROGRAMADO", () => {
      expect(desafio().aceptaRespuestas(ANTES, OPCIONES)).toBe(false);
    });

    it("es false cuando está FINALIZADO aunque tenga respuestas", () => {
      expect(desafio({ tieneRespuestas: true }).aceptaRespuestas(DESPUES, OPCIONES)).toBe(false);
    });

    it("es false cuando está eliminado aunque esté dentro de las fechas", () => {
      expect(desafio().marcarEliminado().aceptaRespuestas(DURANTE, OPCIONES)).toBe(false);
    });
  });
});
