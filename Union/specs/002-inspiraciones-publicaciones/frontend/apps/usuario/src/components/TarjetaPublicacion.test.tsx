// Tests para TarjetaPublicacion (T076).
// Spec: RF-06 a RF-08, RF-14.
// Valida: acciones por rol (autor, ajeno, admin sin "Editar" ajeno).
// Nota: Los tests de componentes que usan shared se incluyen en la carpeta de tests transversales
// para evitar conflictos de versiones de React en el monorepo.
// Este archivo existe como referencia de la estructura de tests esperada.

import { describe, it, expect } from "vitest";
import { usuario, administrador, publicacionPropia, publicacionAjena } from "../../../../tests/mocks/datos";
import { puedeEditar, puedeBorrar, puedeDarLike, puedeGuardar, puedeReportar } from "@inspiraciones/shared";
import { EstadoPublicacion } from "@inspiraciones/shared";
import type { Publicacion } from "@inspiraciones/shared";

describe("TarjetaPublicacion - Reglas de permisos", () => {
  describe("Usuario como autor", () => {
    it("RF-06, RF-08: autor puede editar y borrar su propia publicación", () => {
      expect(puedeEditar(usuario, publicacionPropia)).toBe(true);
      expect(puedeBorrar(usuario, publicacionPropia)).toBe(true);
    });

    it("RF-11, RF-17, RF-21: autor NO puede likear, guardar ni reportar su propia publicación", () => {
      expect(puedeDarLike(usuario, publicacionPropia)).toBe(false);
      expect(puedeGuardar(usuario, publicacionPropia)).toBe(false);
      expect(puedeReportar(usuario, publicacionPropia)).toBe(false);
    });
  });

  describe("Usuario viendo publicación ajena", () => {
    it("RF-11, RF-14: usuario puede likear publicación ajena activa", () => {
      expect(puedeDarLike(usuario, publicacionAjena)).toBe(true);
    });

    it("RF-17: usuario puede guardar en carpetas", () => {
      expect(puedeGuardar(usuario, publicacionAjena)).toBe(true);
    });

    it("RF-21 a RF-23: usuario puede reportar si no la reportó antes", () => {
      const noReportada: Publicacion = {
        ...publicacionAjena,
        reportadaPorMi: false,
      };
      expect(puedeReportar(usuario, noReportada)).toBe(true);
    });

    it("RF-06, RF-08: usuario NO puede editar publicación ajena", () => {
      expect(puedeEditar(usuario, publicacionAjena)).toBe(false);
    });

    it("RF-07: usuario regular NO puede borrar publicación ajena", () => {
      expect(puedeBorrar(usuario, publicacionAjena)).toBe(false);
    });
  });

  describe("Admin viendo publicación ajena", () => {
    it("RF-07: admin puede borrar cualquier publicación (incluidas ajenas)", () => {
      expect(puedeBorrar(administrador, publicacionAjena)).toBe(true);
    });

    it("RF-08: admin NO edita publicaciones ajenas (no es autor)", () => {
      expect(puedeEditar(administrador, publicacionAjena)).toBe(false);
    });

    it("admin edita su propia publicación", () => {
      const adminPublicacion: Publicacion = {
        ...publicacionAjena,
        autor: { id: administrador.id, nombre: administrador.nombre },
      };
      expect(puedeEditar(administrador, adminPublicacion)).toBe(true);
    });

    it("admin puede likear, guardar y reportar (igual que usuario normal)", () => {
      expect(puedeDarLike(administrador, publicacionAjena)).toBe(true);
      expect(puedeGuardar(administrador, publicacionAjena)).toBe(true);
      expect(puedeReportar(administrador, publicacionAjena)).toBe(true);
    });
  });

  describe("Publicación eliminada", () => {
    it("Nadie puede interactuar con publicación eliminada", () => {
      const eliminada: Publicacion = {
        ...publicacionAjena,
        estado: EstadoPublicacion.ELIMINADA,
      };

      expect(puedeDarLike(usuario, eliminada)).toBe(false);
      expect(puedeGuardar(usuario, eliminada)).toBe(false);
      expect(puedeReportar(usuario, eliminada)).toBe(false);
      expect(puedeBorrar(administrador, eliminada)).toBe(false);
    });
  });

  describe("Reporte duplicado", () => {
    it("RF-23: Usuario NO puede reportar si ya reportó", () => {
      const yaReportada: Publicacion = {
        ...publicacionAjena,
        reportadaPorMi: true,
      };
      expect(puedeReportar(usuario, yaReportada)).toBe(false);
    });
  });
});

