// Tests de las validaciones de interfaz (T014). Se escriben antes de la implementación (T015).
// Reglas: data-model.md §5. Spec: RF-02, RF-16, RF-21, CB-10, CB-11, HU-01.
//
// Contrato que debe cumplir T015 (docs/diseño de este test):
// - Cada función devuelve una lista de errores `{ campo, mensaje }`; lista vacía = válido.
// - Los topes de tamaño y los formatos permitidos llegan como parámetro (configuración de la API, S-2).

import { describe, expect, it } from "vitest";
import { FormatoArchivo, MotivoReporte } from "./enums";
import {
  validarArchivo,
  validarNombreCarpeta,
  validarPublicacion,
  validarReporte,
} from "./validaciones";

const configuracion = {
  formatosPermitidos: [
    FormatoArchivo.PNG,
    FormatoArchivo.JPEG,
    FormatoArchivo.MP4,
    FormatoArchivo.AVI,
    FormatoArchivo.MP3,
  ],
  tamanoMaxBytes: 10 * 1024 * 1024,
};

const archivoValido = { nombre: "obra.png", formato: "png", tamanoBytes: 1024 };

const publicacionValida = {
  titulo: "Mi acuarela",
  descripcion: "Una acuarela de otoño",
  archivo: archivoValido,
  categoria: "Dibujo",
  etiquetas: ["acuarela"],
};

function camposConError(errores: readonly { campo: string }[]): string[] {
  return errores.map((e) => e.campo);
}

describe("validarArchivo (RF-02, CB-11, A-11)", () => {
  it("acepta cada formato permitido", () => {
    for (const formato of ["png", "jpeg", "mp4", "avi", "mp3"]) {
      const errores = validarArchivo({ nombre: `x.${formato}`, formato, tamanoBytes: 10 }, configuracion);
      expect(errores).toEqual([]);
    }
  });

  it("rechaza un formato no admitido", () => {
    const errores = validarArchivo({ nombre: "x.gif", formato: "gif", tamanoBytes: 10 }, configuracion);
    expect(camposConError(errores)).toContain("archivo");
  });

  it("compara el formato sin distinguir mayúsculas", () => {
    const errores = validarArchivo({ nombre: "X.PNG", formato: "PNG", tamanoBytes: 10 }, configuracion);
    expect(errores).toEqual([]);
  });

  it("rechaza un archivo que supera el tamaño máximo", () => {
    const errores = validarArchivo(
      { nombre: "x.png", formato: "png", tamanoBytes: configuracion.tamanoMaxBytes + 1 },
      configuracion,
    );
    expect(camposConError(errores)).toContain("archivo");
  });

  it("acepta un archivo exactamente en el tamaño máximo", () => {
    const errores = validarArchivo(
      { nombre: "x.png", formato: "png", tamanoBytes: configuracion.tamanoMaxBytes },
      configuracion,
    );
    expect(errores).toEqual([]);
  });

  it("rechaza un archivo vacío (0 bytes)", () => {
    const errores = validarArchivo({ nombre: "x.png", formato: "png", tamanoBytes: 0 }, configuracion);
    expect(camposConError(errores)).toContain("archivo");
  });
});

describe("validarPublicacion (RF-02, HU-01)", () => {
  it("acepta una publicación completa", () => {
    expect(validarPublicacion(publicacionValida, configuracion)).toEqual([]);
  });

  it("exige título", () => {
    const errores = validarPublicacion({ ...publicacionValida, titulo: "" }, configuracion);
    expect(camposConError(errores)).toContain("titulo");
  });

  it("trata un título de solo espacios como vacío", () => {
    const errores = validarPublicacion({ ...publicacionValida, titulo: "   " }, configuracion);
    expect(camposConError(errores)).toContain("titulo");
  });

  it("exige descripción", () => {
    const errores = validarPublicacion({ ...publicacionValida, descripcion: "" }, configuracion);
    expect(camposConError(errores)).toContain("descripcion");
  });

  it("exige contenido principal al crear", () => {
    const errores = validarPublicacion({ ...publicacionValida, archivo: null }, configuracion);
    expect(camposConError(errores)).toContain("archivo");
  });

  it("no exige archivo nuevo al editar", () => {
    const errores = validarPublicacion({ ...publicacionValida, archivo: null }, configuracion, {
      archivoOpcional: true,
    });
    expect(errores).toEqual([]);
  });

  it("valida el archivo cuando se envía, incluso al editar", () => {
    const errores = validarPublicacion(
      { ...publicacionValida, archivo: { nombre: "x.gif", formato: "gif", tamanoBytes: 10 } },
      configuracion,
      { archivoOpcional: true },
    );
    expect(camposConError(errores)).toContain("archivo");
  });

  it("exige al menos una etiqueta o una categoría", () => {
    const errores = validarPublicacion(
      { ...publicacionValida, categoria: "", etiquetas: [] },
      configuracion,
    );
    expect(camposConError(errores)).toContain("etiquetas");
  });

  it("acepta solo categoría sin etiquetas", () => {
    const errores = validarPublicacion({ ...publicacionValida, etiquetas: [] }, configuracion);
    expect(errores).toEqual([]);
  });

  it("acepta solo etiquetas sin categoría", () => {
    const errores = validarPublicacion({ ...publicacionValida, categoria: "" }, configuracion);
    expect(errores).toEqual([]);
  });

  it("informa varios errores a la vez", () => {
    const errores = validarPublicacion(
      { titulo: "", descripcion: "", archivo: null, categoria: "", etiquetas: [] },
      configuracion,
    );
    expect(camposConError(errores)).toEqual(
      expect.arrayContaining(["titulo", "descripcion", "archivo", "etiquetas"]),
    );
  });
});

describe("validarReporte (RF-21, A-13)", () => {
  it("exige un motivo", () => {
    const errores = validarReporte({ motivo: null, textoLibre: "" });
    expect(camposConError(errores)).toContain("motivo");
  });

  it("acepta un motivo de la lista sin texto libre", () => {
    expect(validarReporte({ motivo: MotivoReporte.SPAM, textoLibre: "" })).toEqual([]);
  });

  it("acepta un motivo de la lista con texto libre opcional", () => {
    const errores = validarReporte({ motivo: MotivoReporte.PLAGIO, textoLibre: "Copia de otra obra" });
    expect(errores).toEqual([]);
  });

  it("exige texto libre cuando el motivo es OTRO", () => {
    const errores = validarReporte({ motivo: MotivoReporte.OTRO, textoLibre: "" });
    expect(camposConError(errores)).toContain("textoLibre");
  });

  it("trata el texto libre de solo espacios como vacío cuando el motivo es OTRO", () => {
    const errores = validarReporte({ motivo: MotivoReporte.OTRO, textoLibre: "   " });
    expect(camposConError(errores)).toContain("textoLibre");
  });

  it("acepta texto libre de exactamente 500 caracteres", () => {
    const errores = validarReporte({ motivo: MotivoReporte.OTRO, textoLibre: "a".repeat(500) });
    expect(errores).toEqual([]);
  });

  it("rechaza texto libre de más de 500 caracteres", () => {
    const errores = validarReporte({ motivo: MotivoReporte.SPAM, textoLibre: "a".repeat(501) });
    expect(camposConError(errores)).toContain("textoLibre");
  });
});

describe("validarNombreCarpeta (RF-16, CB-10, A-7)", () => {
  it("acepta un nombre de 1 carácter", () => {
    expect(validarNombreCarpeta("A")).toEqual([]);
  });

  it("acepta un nombre de exactamente 50 caracteres", () => {
    expect(validarNombreCarpeta("a".repeat(50))).toEqual([]);
  });

  it("rechaza un nombre vacío", () => {
    expect(camposConError(validarNombreCarpeta(""))).toContain("nombre");
  });

  it("rechaza un nombre de solo espacios", () => {
    expect(camposConError(validarNombreCarpeta("   "))).toContain("nombre");
  });

  it("rechaza un nombre de más de 50 caracteres", () => {
    expect(camposConError(validarNombreCarpeta("a".repeat(51)))).toContain("nombre");
  });

  it("rechaza un nombre repetido entre las carpetas existentes, sin distinguir mayúsculas", () => {
    const errores = validarNombreCarpeta("Inspiración", ["inspiración", "Otra"]);
    expect(camposConError(errores)).toContain("nombre");
  });

  it("acepta un nombre que no coincide con ninguna carpeta existente", () => {
    expect(validarNombreCarpeta("Nueva", ["Otra"])).toEqual([]);
  });
});
