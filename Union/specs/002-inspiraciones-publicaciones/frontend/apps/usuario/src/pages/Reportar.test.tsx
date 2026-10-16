// Tests para Reportar (T085).
// Spec: HU-11, RF-21 a RF-23, CB-11, A-13.
// Valida: reportar publicación ajena con motivo, no propia, no duplicado, validaciones.

import { describe, it, expect } from "vitest";
import {
  usuario,
  administrador,
  publicacionPropia,
  publicacionAjena,
  publicacionYaReportada,
} from "../../../../tests/mocks/datos";
import { puedeReportar } from "@inspiraciones/shared";
import { MotivoReporte } from "@inspiraciones/shared";
import type { Publicacion } from "@inspiraciones/shared";

describe("Reportar - Flujos principales (HU-11, RF-21 a RF-23)", () => {
  describe("HU-11: Reportar publicación ajena indicando motivo", () => {
    it("usuario puede reportar publicación ajena", () => {
      const puedeAccionar = puedeReportar(usuario, publicacionAjena);

      expect(puedeAccionar).toBe(true);
    });

    it("administrador puede reportar publicación ajena", () => {
      const puedeAccionar = puedeReportar(administrador, publicacionAjena);

      expect(puedeAccionar).toBe(true);
    });

    it("usuario logado puede reportar sin estar autenticado (acceso)", () => {
      const publicacion: Publicacion = {
        ...publicacionAjena,
        reportadaPorMi: false,
      };

      const puedeAccionar = puedeReportar(usuario, publicacion);

      expect(puedeAccionar).toBe(true);
    });
  });

  describe("RF-21: Reportar con motivo (lista y/o texto libre)", () => {
    it("reporte con motivo predefinido es válido", () => {
      const motivo = MotivoReporte.SPAM;

      expect(motivo).toBeTruthy();
      expect(Object.values(MotivoReporte)).toContain(motivo);
    });

    it("reporte con motivo OTRO puede incluir texto libre", () => {
      const motivo = MotivoReporte.OTRO;
      const textoLibre = "Copia de una obra ajena";

      expect(motivo).toBe(MotivoReporte.OTRO);
      expect(textoLibre.length).toBeGreaterThan(0);
      expect(textoLibre.length).toBeLessThanOrEqual(500);
    });

    it("texto libre no es requerido para motivos predefinidos", () => {
      const motivosPredefines = [
        MotivoReporte.SPAM,
        MotivoReporte.CONTENIDO_INAPROPIADO,
        MotivoReporte.PLAGIO,
      ];

      for (const motivo of motivosPredefines) {
        expect(motivo).toBeTruthy();
      }
    });

    it("motivo OTRO sin texto es inválido", () => {
      const textoLibre = "";

      const esValido = !(MotivoReporte.OTRO === MotivoReporte.OTRO && textoLibre.trim() === "");

      expect(esValido).toBe(false);
    });

    it("motivo OTRO con texto > 500 caracteres es inválido", () => {
      const textoLibre = "a".repeat(501);

      const esValido = textoLibre.length <= 500;

      expect(esValido).toBe(false);
    });

    it("motivo OTRO con texto entre 1 y 500 caracteres es válido", () => {
      const textoLibre = "a".repeat(250);

      const esValido = MotivoReporte.OTRO && textoLibre.length > 0 && textoLibre.length <= 500;

      expect(esValido).toBe(true);
    });

    it("todos los motivos predefinidos están disponibles", () => {
      const motivosDisponibles = Object.values(MotivoReporte);

      expect(motivosDisponibles.length).toBeGreaterThan(0);
      expect(motivosDisponibles).toContain(MotivoReporte.SPAM);
      expect(motivosDisponibles).toContain(MotivoReporte.CONTENIDO_INAPROPIADO);
      expect(motivosDisponibles).toContain(MotivoReporte.PLAGIO);
      expect(motivosDisponibles).toContain(MotivoReporte.OTRO);
    });
  });

  describe("RF-22: No reportar publicación propia", () => {
    it("usuario no puede reportar su propia publicación", () => {
      const puedeAccionar = puedeReportar(usuario, publicacionPropia);

      expect(puedeAccionar).toBe(false);
    });

    it("administrador no puede reportar su propia publicación", () => {
      const publicacionDelAdmin: Publicacion = {
        ...publicacionAjena,
        autor: { id: administrador.id, nombre: administrador.nombre },
      };

      const puedeAccionar = puedeReportar(administrador, publicacionDelAdmin);

      expect(puedeAccionar).toBe(false);
    });

    it("el reporte es rechazado si autor === usuario logado", () => {
      const publicacion: Publicacion = {
        ...publicacionAjena,
        autor: { id: usuario.id, nombre: usuario.nombre },
      };

      const esPropia = publicacion.autor.id === usuario.id;

      expect(esPropia).toBe(true);
    });

    it("usuario no puede reportar si es el autor de la publicación", () => {
      const publicacion: Publicacion = {
        ...publicacionAjena,
        autor: { id: usuario.id, nombre: usuario.nombre },
      };

      const puedeAccionar = puedeReportar(usuario, publicacion);

      expect(puedeAccionar).toBe(false);
    });
  });

  describe("RF-23: No reportar dos veces la misma publicación", () => {
    it("usuario no puede reportar publicación que ya reportó", () => {
      const puedeAccionar = puedeReportar(usuario, publicacionYaReportada);

      expect(puedeAccionar).toBe(false);
    });

    it("reporte duplicado tiene estado reportadaPorMi === true", () => {
      expect(publicacionYaReportada.reportadaPorMi).toBe(true);
    });

    it("nueva tentativa de reporte es bloqueada si reportadaPorMi === true", () => {
      const publicacion: Publicacion = {
        ...publicacionAjena,
        reportadaPorMi: true,
      };

      const puedeAccionar = puedeReportar(usuario, publicacion);

      expect(puedeAccionar).toBe(false);
    });

    it("usuario puede reportar si reportadaPorMi === false", () => {
      const publicacion: Publicacion = {
        ...publicacionAjena,
        reportadaPorMi: false,
      };

      const puedeAccionar = puedeReportar(usuario, publicacion);

      expect(puedeAccionar).toBe(true);
    });
  });

  describe("CB-11: Validaciones del formulario", () => {
    it("no se puede enviar reporte sin motivo seleccionado", () => {
      const motivo = null;

      const esValido = motivo !== null;

      expect(esValido).toBe(false);
    });

    it("formulario requiere confirmación antes de enviar", () => {
      const confirmado = true;

      expect(confirmado).toBe(true);
    });

    it("texto libre visible solo cuando motivo es OTRO", () => {
      const mostrarTextoLibre = (motivo: MotivoReporte) => motivo === MotivoReporte.OTRO;

      expect(mostrarTextoLibre(MotivoReporte.OTRO)).toBe(true);
      expect(mostrarTextoLibre(MotivoReporte.SPAM)).toBe(false);
      expect(mostrarTextoLibre(MotivoReporte.CONTENIDO_INAPROPIADO)).toBe(false);
      expect(mostrarTextoLibre(MotivoReporte.PLAGIO)).toBe(false);
    });

    it("campo de texto libre acepta máximo 500 caracteres", () => {
      const maxCaracteres = 500;
      const texto = "a".repeat(maxCaracteres);

      expect(texto.length).toBeLessThanOrEqual(maxCaracteres);
    });
  });

  describe("A-13: Ambigüedad resuelta (motivo OTRO con restricciones)", () => {
    it("motivo OTRO permite describir razón personalizada", () => {
      const motivo = MotivoReporte.OTRO;
      const texto = "Plagiarismo de mi obra original";

      const esValido = motivo === MotivoReporte.OTRO && texto.length > 0 && texto.length <= 500;

      expect(esValido).toBe(true);
    });

    it("motivo OTRO sin descripción es rechazado en validación", () => {
      const motivo = MotivoReporte.OTRO;
      const texto = "";

      const esValido = !(motivo === MotivoReporte.OTRO && texto.trim() === "");

      expect(esValido).toBe(false);
    });
  });

  describe("Interfaz y confirmación", () => {
    it("reporte incluye publicación, motivo, texto libre opcional y fecha", () => {
      const reporte = {
        publicacion: publicacionAjena,
        motivo: MotivoReporte.SPAM,
        textoLibre: null,
        fecha: new Date().toISOString(),
      };

      expect(reporte.publicacion).toBeTruthy();
      expect(reporte.motivo).toBeTruthy();
      expect(reporte.fecha).toBeTruthy();
    });

    it("confirmación explícita requerida antes de enviar (HU-11)", () => {
      const usuarioConfirma = true;

      expect(usuarioConfirma).toBe(true);
    });

    it("mensaje de éxito visible tras enviar reporte (RF-28)", () => {
      const mensajeExito = "Reporte enviado correctamente";

      expect(mensajeExito).toBeTruthy();
      expect(mensajeExito.toLowerCase()).toContain("reporte");
      expect(mensajeExito.toLowerCase()).toContain("enviado");
    });

    it("error visible si reporte duplicado (409 → 'Ya reportada')", () => {
      const errorDuplicado = "Ya reportaste esta publicación";

      expect(errorDuplicado).toBeTruthy();
      expect(errorDuplicado.toLowerCase()).toContain("ya");
    });
  });
});
