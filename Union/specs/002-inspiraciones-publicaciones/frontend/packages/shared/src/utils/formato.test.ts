// Tests de las utilidades puras de formato (T016). Se escriben antes de la implementación (T017).
// Spec: RNF-01 (interfaz amigable y en español), RF-02 (texto alternativo de imágenes).
//
// Contrato que debe cumplir T017 (diseño de este test):
// - formatearFecha(iso): fecha larga en español, calculada en UTC para no depender de la zona horaria.
// - formatearTamano(bytes): tamaño legible con coma decimal y unidades B, KB, MB, GB.
// - textoAlternativo(publicacion): texto alternativo para el medio de una publicación.

import { describe, expect, it } from "vitest";
import { EstadoPublicacion, FormatoArchivo, TipoContenido } from "./../domain/enums";
import type { Publicacion } from "./../domain/tipos";
import { formatearFecha, formatearTamano, textoAlternativo } from "./formato";

const publicacion: Publicacion = {
  id: "p1",
  titulo: "Acuarela de otoño",
  descripcion: "Una acuarela con hojas secas",
  contenido: "https://ejemplo.test/p1.png",
  formato: FormatoArchivo.PNG,
  tipoContenido: TipoContenido.IMAGEN,
  categoria: "Dibujo",
  etiquetas: ["acuarela"],
  autor: { id: "u1", nombre: "Ana" },
  fechaCreacion: "2026-10-01T12:00:00Z",
  fechaUltimaEdicion: "2026-10-01T12:00:00Z",
  cantidadLikes: 0,
  estado: EstadoPublicacion.ACTIVA,
  likeadaPorMi: false,
  guardadaPorMi: false,
  reportadaPorMi: false,
};

describe("formatearFecha (RNF-01)", () => {
  it("devuelve la fecha larga en español", () => {
    expect(formatearFecha("2026-10-01T12:00:00Z")).toBe("1 de octubre de 2026");
  });

  it("formatea otro mes y día de dos cifras", () => {
    expect(formatearFecha("2026-03-15T12:00:00Z")).toBe("15 de marzo de 2026");
  });

  it("usa UTC: una hora cercana a medianoche no cambia el día", () => {
    expect(formatearFecha("2026-12-31T23:30:00Z")).toBe("31 de diciembre de 2026");
  });

  it("devuelve un texto vacío ante una fecha inválida", () => {
    expect(formatearFecha("no-es-una-fecha")).toBe("");
  });

  it("devuelve un texto vacío ante una cadena vacía", () => {
    expect(formatearFecha("")).toBe("");
  });
});

describe("formatearTamano (RF-02, CB-11)", () => {
  it("muestra bytes por debajo de 1 KB", () => {
    expect(formatearTamano(0)).toBe("0 B");
    expect(formatearTamano(512)).toBe("512 B");
  });

  it("muestra kilobytes con coma decimal", () => {
    expect(formatearTamano(1024)).toBe("1 KB");
    expect(formatearTamano(1536)).toBe("1,5 KB");
  });

  it("muestra megabytes", () => {
    expect(formatearTamano(1024 * 1024)).toBe("1 MB");
    expect(formatearTamano(10 * 1024 * 1024)).toBe("10 MB");
    expect(formatearTamano(Math.round(2.5 * 1024 * 1024))).toBe("2,5 MB");
  });

  it("muestra gigabytes", () => {
    expect(formatearTamano(1024 * 1024 * 1024)).toBe("1 GB");
  });

  it("redondea a un decimal como máximo", () => {
    expect(formatearTamano(1024 * 1024 + 51_200)).toBe("1,1 MB");
  });

  it("trata un valor negativo o no finito como 0 B", () => {
    expect(formatearTamano(-5)).toBe("0 B");
    expect(formatearTamano(Number.NaN)).toBe("0 B");
  });
});

describe("textoAlternativo (RF-02, accesibilidad)", () => {
  it("incluye el título de la publicación", () => {
    expect(textoAlternativo(publicacion)).toContain("Acuarela de otoño");
  });

  it("incluye el nombre del autor", () => {
    expect(textoAlternativo(publicacion)).toContain("Ana");
  });

  it("nunca devuelve un texto vacío, aunque falte el título", () => {
    const sinTitulo: Publicacion = { ...publicacion, titulo: "   " };
    expect(textoAlternativo(sinTitulo).trim().length).toBeGreaterThan(0);
  });

  it("indica el tipo de contenido para video y audio", () => {
    const video: Publicacion = { ...publicacion, tipoContenido: TipoContenido.VIDEO };
    const audio: Publicacion = { ...publicacion, tipoContenido: TipoContenido.AUDIO };
    expect(textoAlternativo(video).toLowerCase()).toContain("video");
    expect(textoAlternativo(audio).toLowerCase()).toContain("audio");
  });
});
