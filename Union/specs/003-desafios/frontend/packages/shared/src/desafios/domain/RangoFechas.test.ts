import { describe, expect, it } from "vitest";
import { EstadoDesafio } from "./enums/EstadoDesafio";
import { RangoFechas } from "./RangoFechas";

// Fechas en hora local para que el día de fin se calcule igual que en RangoFechas.
const fecha = (anio: number, mes: number, dia: number, hora = 0, minuto = 0, segundo = 0, ms = 0): Date =>
  new Date(anio, mes - 1, dia, hora, minuto, segundo, ms);

const INICIO = fecha(2026, 10, 10, 10, 0);
const FIN = fecha(2026, 10, 12, 18, 0);

describe("RangoFechas", () => {
  describe("invariante de fechas", () => {
    it("acepta un fin posterior al inicio", () => {
      expect(() => new RangoFechas(INICIO, FIN)).not.toThrow();
    });

    it("rechaza un fin igual al inicio", () => {
      expect(() => new RangoFechas(INICIO, new Date(INICIO.getTime()))).toThrow(
        "La fecha de fin debe ser posterior a la de inicio.",
      );
    });

    it("rechaza un fin anterior al inicio", () => {
      expect(() => new RangoFechas(INICIO, fecha(2026, 10, 9))).toThrow(
        "La fecha de fin debe ser posterior a la de inicio.",
      );
    });
  });

  describe("estado con finInclusivo false", () => {
    const opciones = { finInclusivo: false };
    const rango = new RangoFechas(INICIO, FIN);

    it("es PROGRAMADO antes del inicio", () => {
      expect(rango.estado(fecha(2026, 10, 10, 9, 59, 59, 999), opciones)).toBe(EstadoDesafio.PROGRAMADO);
    });

    it("es ACTIVO exactamente en el inicio", () => {
      expect(rango.estado(INICIO, opciones)).toBe(EstadoDesafio.ACTIVO);
    });

    it("es ACTIVO durante el rango", () => {
      expect(rango.estado(fecha(2026, 10, 11, 12, 0), opciones)).toBe(EstadoDesafio.ACTIVO);
    });

    it("es ACTIVO un milisegundo antes del fin", () => {
      expect(rango.estado(new Date(FIN.getTime() - 1), opciones)).toBe(EstadoDesafio.ACTIVO);
    });

    it("es FINALIZADO exactamente en el fin", () => {
      expect(rango.estado(FIN, opciones)).toBe(EstadoDesafio.FINALIZADO);
    });

    it("es FINALIZADO después del fin", () => {
      expect(rango.estado(fecha(2026, 10, 13, 9, 0), opciones)).toBe(EstadoDesafio.FINALIZADO);
    });
  });

  describe("estado con finInclusivo true", () => {
    const opciones = { finInclusivo: true };
    const rango = new RangoFechas(INICIO, FIN);

    it("es ACTIVO después de la hora de fin dentro del mismo día", () => {
      expect(rango.estado(fecha(2026, 10, 12, 23, 59, 59, 999), opciones)).toBe(EstadoDesafio.ACTIVO);
    });

    it("es ACTIVO exactamente en la hora de fin", () => {
      expect(rango.estado(FIN, opciones)).toBe(EstadoDesafio.ACTIVO);
    });

    it("es FINALIZADO al inicio del día siguiente al fin", () => {
      expect(rango.estado(fecha(2026, 10, 13, 0, 0), opciones)).toBe(EstadoDesafio.FINALIZADO);
    });

    it("es PROGRAMADO antes del inicio", () => {
      expect(rango.estado(fecha(2026, 10, 10, 9, 59, 59, 999), opciones)).toBe(EstadoDesafio.PROGRAMADO);
    });
  });

  describe("frontera de finInclusivo", () => {
    const rango = new RangoFechas(INICIO, FIN);

    it("en la hora de fin difiere según el valor de finInclusivo", () => {
      expect(rango.estado(FIN, { finInclusivo: false })).toBe(EstadoDesafio.FINALIZADO);
      expect(rango.estado(FIN, { finInclusivo: true })).toBe(EstadoDesafio.ACTIVO);
    });

    it("al inicio del día siguiente coincide en FINALIZADO con ambos valores", () => {
      const siguienteDia = fecha(2026, 10, 13, 0, 0);
      expect(rango.estado(siguienteDia, { finInclusivo: false })).toBe(EstadoDesafio.FINALIZADO);
      expect(rango.estado(siguienteDia, { finInclusivo: true })).toBe(EstadoDesafio.FINALIZADO);
    });
  });
});
