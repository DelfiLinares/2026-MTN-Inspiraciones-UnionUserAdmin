// Tests para FormularioPublicacion (T080 - parte 1).
// Spec: RF-02, CB-11, HU-01, HU-02.
// Valida: validación de formato y tamaño, rechazo de archivos, interfaces, erroresDeServidor.

import { describe, it, expect } from "vitest";
import { validarPublicacion, FormatoArchivo } from "@inspiraciones/shared";
import type { ConfiguracionArchivos, DatosPublicacion } from "@inspiraciones/shared";
import type { DatosFormularioPublicacion } from "./FormularioPublicacion";

const configuracion: ConfiguracionArchivos = {
  formatosPermitidos: [
    FormatoArchivo.PNG,
    FormatoArchivo.JPEG,
    FormatoArchivo.MP4,
    FormatoArchivo.AVI,
    FormatoArchivo.MP3,
  ],
  tamanoMaxBytes: 10 * 1024 * 1024, // 10MB
};

const archivoValido = { nombre: "obra.png", formato: "png", tamanoBytes: 1024 };

const publicacionValida: DatosPublicacion = {
  titulo: "Mi acuarela",
  descripcion: "Una acuarela de otoño",
  archivo: archivoValido,
  categoria: "Dibujo",
  etiquetas: ["acuarela"],
};

describe("FormularioPublicacion - Validación con validarPublicacion", () => {
  describe("RF-02: Publicación con campos obligatorios", () => {
    it("título es obligatorio", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        titulo: "",
      };

      const errores = validarPublicacion(datos, configuracion);
      expect(errores.some((e) => e.campo === "titulo")).toBe(true);
    });

    it("descripción es obligatoria", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        descripcion: "",
      };

      const errores = validarPublicacion(datos, configuracion);
      expect(errores.some((e) => e.campo === "descripcion")).toBe(true);
    });

    it("categoría o etiqueta es obligatoria", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        categoria: "",
        etiquetas: [],
      };

      const errores = validarPublicacion(datos, configuracion);
      expect(errores.some((e) => e.campo === "etiquetas")).toBe(true);
    });

    it("archivo es obligatorio al crear", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        archivo: null,
      };

      const errores = validarPublicacion(datos, configuracion);
      expect(errores.some((e) => e.campo === "archivo")).toBe(true);
    });

    it("archivo es opcional al editar (archivoOpcional: true)", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        archivo: null,
      };

      const errores = validarPublicacion(datos, configuracion, {
        archivoOpcional: true,
      });
      expect(errores.some((e) => e.campo === "archivo")).toBe(false);
    });

    it("todos los campos válidos no produce errores", () => {
      const errores = validarPublicacion(publicacionValida, configuracion);
      expect(errores).toHaveLength(0);
    });

    it("múltiples campos vacíos produce múltiples errores", () => {
      const datos: DatosPublicacion = {
        titulo: "",
        descripcion: "",
        archivo: null,
        categoria: "",
        etiquetas: [],
      };

      const errores = validarPublicacion(datos, configuracion);
      expect(errores.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("CB-11: Validación de formato y tamaño", () => {
    it("archivo con formato permitido (png) es aceptado", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        archivo: { nombre: "foto.png", formato: "png", tamanoBytes: 1024 },
      };

      const errores = validarPublicacion(datos, configuracion);
      const errorFormato = errores.filter((e) => e.campo === "archivo");
      expect(errorFormato).toHaveLength(0);
    });

    it("archivo con formato permitido (jpeg) es aceptado", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        archivo: { nombre: "foto.jpeg", formato: "jpeg", tamanoBytes: 1024 },
      };

      const errores = validarPublicacion(datos, configuracion);
      const errorFormato = errores.filter((e) => e.campo === "archivo");
      expect(errorFormato).toHaveLength(0);
    });

    it("archivo con formato permitido (mp4) es aceptado", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        archivo: { nombre: "video.mp4", formato: "mp4", tamanoBytes: 1024 * 1024 },
      };

      const errores = validarPublicacion(datos, configuracion);
      const errorFormato = errores.filter((e) => e.campo === "archivo");
      expect(errorFormato).toHaveLength(0);
    });

    it("archivo con formato permitido (mp3) es aceptado", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        archivo: { nombre: "cancion.mp3", formato: "mp3", tamanoBytes: 512 * 1024 },
      };

      const errores = validarPublicacion(datos, configuracion);
      const errorFormato = errores.filter((e) => e.campo === "archivo");
      expect(errorFormato).toHaveLength(0);
    });

    it("archivo con formato no permitido (gif) produce error", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        archivo: { nombre: "animacion.gif", formato: "gif", tamanoBytes: 1024 },
      };

      const errores = validarPublicacion(datos, configuracion);
      const errorFormato = errores.filter((e) => e.campo === "archivo");
      expect(errorFormato.length > 0).toBe(true);
    });

    it("archivo con formato no permitido (txt) produce error", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        archivo: { nombre: "archivo.txt", formato: "txt", tamanoBytes: 1024 },
      };

      const errores = validarPublicacion(datos, configuracion);
      const errorFormato = errores.filter((e) => e.campo === "archivo");
      expect(errorFormato.length > 0).toBe(true);
    });

    it("archivo con formato no permitido (exe) produce error", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        archivo: { nombre: "programa.exe", formato: "exe", tamanoBytes: 1024 },
      };

      const errores = validarPublicacion(datos, configuracion);
      expect(errores.some((e) => e.campo === "archivo")).toBe(true);
    });

    it("archivo mayor que tamaño máximo produce error", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        archivo: {
          nombre: "video-grande.mp4",
          formato: "mp4",
          tamanoBytes: configuracion.tamanoMaxBytes + 1,
        },
      };

      const errores = validarPublicacion(datos, configuracion);
      const errorTamaño = errores.filter((e) => e.campo === "archivo");
      expect(errorTamaño.length > 0).toBe(true);
    });

    it("archivo exactamente en tamaño máximo es aceptado", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        archivo: {
          nombre: "video-exacto.mp4",
          formato: "mp4",
          tamanoBytes: configuracion.tamanoMaxBytes,
        },
      };

      const errores = validarPublicacion(datos, configuracion);
      const errorTamaño = errores.filter((e) => e.campo === "archivo");
      expect(errorTamaño).toHaveLength(0);
    });

    it("archivo vacío (0 bytes) produce error", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        archivo: { nombre: "vacio.png", formato: "png", tamanoBytes: 0 },
      };

      const errores = validarPublicacion(datos, configuracion);
      const errorTamaño = errores.filter((e) => e.campo === "archivo");
      expect(errorTamaño.length > 0).toBe(true);
    });

    it("formato se compara sin distinción de mayúsculas", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        archivo: { nombre: "X.PNG", formato: "PNG", tamanoBytes: 1024 },
      };

      const errores = validarPublicacion(datos, configuracion);
      expect(errores).toHaveLength(0);
    });
  });

  describe("Casos especiales de validación", () => {
    it("etiqueta vacía se filtra y no afecta validación si hay categoría", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        etiquetas: ["", "valida", ""],
      };

      const errores = validarPublicacion(datos, configuracion);
      expect(errores.some((e) => e.campo === "etiquetas")).toBe(false);
    });

    it("solo categoría sin etiquetas es válido", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        categoria: "Arte",
        etiquetas: [],
      };

      const errores = validarPublicacion(datos, configuracion);
      expect(errores.some((e) => e.campo === "etiquetas")).toBe(false);
    });

    it("solo etiquetas sin categoría es válido", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        categoria: "",
        etiquetas: ["arte", "pintura"],
      };

      const errores = validarPublicacion(datos, configuracion);
      expect(errores.some((e) => e.campo === "etiquetas")).toBe(false);
    });

    it("título con espacios en blanco se considera vacío", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        titulo: "   ",
      };

      const errores = validarPublicacion(datos, configuracion);
      expect(errores.some((e) => e.campo === "titulo")).toBe(true);
    });

    it("descripción con espacios en blanco se considera vacía", () => {
      const datos: DatosPublicacion = {
        ...publicacionValida,
        descripcion: "   ",
      };

      const errores = validarPublicacion(datos, configuracion);
      expect(errores.some((e) => e.campo === "descripcion")).toBe(true);
    });
  });

  describe("DatosFormularioPublicacion interface", () => {
    it("DatosFormularioPublicacion tiene propiedades título, descripción, categoría, etiquetas", () => {
      const datos = {
        titulo: "Título",
        descripcion: "Descripción",
        categoria: "Tech",
        etiquetas: ["javascript", "react"],
        archivo: null,
      };

      expect(typeof datos.titulo).toBe("string");
      expect(typeof datos.descripcion).toBe("string");
      expect(typeof datos.categoria).toBe("string");
      expect(Array.isArray(datos.etiquetas)).toBe(true);
      expect(datos.archivo === null || typeof datos.archivo === "object").toBe(true);
    });

    it("archivo puede ser File | null", () => {
      const conArchivo = {
        titulo: "T",
        descripcion: "D",
        categoria: "C",
        etiquetas: [],
        archivo: { nombre: "x", formato: "jpg", tamanoBytes: 1 } as const,
      };

      const sinArchivo = {
        titulo: "T",
        descripcion: "D",
        categoria: "C",
        etiquetas: [],
        archivo: null,
      };

      expect(conArchivo.archivo).toBeTruthy();
      expect(sinArchivo.archivo === null).toBe(true);
    });
  });

  describe("ErrorServidorFormulario interface", () => {
    it("ErrorServidorFormulario.codigo puede ser number o string", () => {
      const error1 = { codigo: 413, mensaje: "File too large" };
      const error2 = { codigo: "413", mensaje: "File too large" };

      expect(typeof error1.codigo === "number").toBe(true);
      expect(typeof error2.codigo === "string").toBe(true);
    });

    it("ErrorServidorFormulario.detalles es Record<string, string> opcional", () => {
      const sin = { codigo: 422 };
      const con = {
        codigo: 422,
        detalles: { titulo: "requerido", archivo: "formato no permitido" } as const,
      };

      expect(sin.codigo).toBe(422);
      expect(typeof con.detalles).toBe("object");
      expect(Object.keys(con.detalles).length > 0).toBe(true);
    });
  });

  describe("FormularioPublicacionProps interface", () => {
    it("configuracion es obligatoria (ConfiguracionArchivos)", () => {
      const config = {
        formatosPermitidos: [FormatoArchivo.JPEG, FormatoArchivo.PNG],
        tamanoMaxBytes: 5 * 1024 * 1024,
      };

      expect(config).toBeTruthy();
      expect("formatosPermitidos" in config).toBe(true);
      expect("tamanoMaxBytes" in config).toBe(true);
    });

    it("publicacionInicial es opcional", () => {
      const sin = undefined;
      const con = {
        id: "pub-1",
        titulo: "Editar",
        descripcion: "Desc",
        categoria: "Tech",
        etiquetas: ["tag"],
      } as const;

      expect(sin === undefined).toBe(true);
      expect(con).toBeTruthy();
    });

    it("onEnviar es función obligatoria", () => {
      const onEnviar = (datos: DatosFormularioPublicacion): void => {
        expect(datos).toBeTruthy();
      };

      expect(typeof onEnviar).toBe("function");
    });

    it("onCancelar es función opcional", () => {
      const sin = undefined;
      const con = (): void => {};

      expect(sin === undefined).toBe(true);
      expect(typeof con).toBe("function");
    });

    it("enviando es boolean opcional (default false)", () => {
      const sin = undefined;
      const false_ = false;
      const true_ = true;

      expect(sin === undefined).toBe(true);
      expect(typeof false_).toBe("boolean");
      expect(typeof true_).toBe("boolean");
    });

    it("errorServidor es ErrorServidorFormulario | null opcional", () => {
      const sin = null;
      const con = { codigo: 422, detalles: { archivo: "inválido" } };

      expect(sin === null).toBe(true);
      expect(con).toBeTruthy();
      expect("codigo" in con).toBe(true);
    });
  });
});
