// Tests de las funciones puras de permisos (T012). Se escriben antes de la implementación (T013).
// Reglas: data-model.md §4. Spec: RF-06 a RF-08, RF-14, RF-22, RF-23, HU-02, HU-03, HU-07, HU-11.

import { describe, expect, it } from "vitest";
import { EstadoPublicacion, FormatoArchivo, RolUsuario, TipoContenido } from "./enums";
import type { Publicacion, UsuarioActual } from "./tipos";
import {
  puedeBorrar,
  puedeDarLike,
  puedeEditar,
  puedeGuardar,
  puedeModerar,
  puedeReportar,
} from "./permisos";

const autor: UsuarioActual = { id: "u1", nombre: "Ana", rol: RolUsuario.USER };
const otroUsuario: UsuarioActual = { id: "u2", nombre: "Beto", rol: RolUsuario.USER };
const admin: UsuarioActual = { id: "u3", nombre: "Admin", rol: RolUsuario.ADMIN };

const base: Publicacion = {
  id: "p1",
  titulo: "Título",
  descripcion: "Descripción",
  contenido: "https://ejemplo.test/p1.png",
  formato: FormatoArchivo.PNG,
  tipoContenido: TipoContenido.IMAGEN,
  categoria: "Dibujo",
  etiquetas: ["acuarela"],
  autor: { id: autor.id, nombre: autor.nombre },
  fechaCreacion: "2026-10-01T10:00:00Z",
  fechaUltimaEdicion: "2026-10-01T10:00:00Z",
  cantidadLikes: 0,
  estado: EstadoPublicacion.ACTIVA,
  likeadaPorMi: false,
  guardadaPorMi: false,
  reportadaPorMi: false,
};

const eliminada: Publicacion = { ...base, estado: EstadoPublicacion.ELIMINADA };
const reportadaPorMi: Publicacion = { ...base, reportadaPorMi: true };
const estadoReportada: Publicacion = { ...base, estado: EstadoPublicacion.REPORTADA };

describe("puedeEditar (RF-04, RF-06, RF-08)", () => {
  it("permite al autor editar su publicación", () => {
    expect(puedeEditar(autor, base)).toBe(true);
  });

  it("no permite a otro usuario editar una publicación ajena", () => {
    expect(puedeEditar(otroUsuario, base)).toBe(false);
  });

  it("no permite al administrador editar una publicación ajena", () => {
    expect(puedeEditar(admin, base)).toBe(false);
  });

  it("permite al administrador editar su propia publicación", () => {
    const propiaDelAdmin: Publicacion = { ...base, autor: { id: admin.id, nombre: admin.nombre } };
    expect(puedeEditar(admin, propiaDelAdmin)).toBe(true);
  });

  it("no permite editar una publicación eliminada, ni siquiera al autor", () => {
    expect(puedeEditar(autor, eliminada)).toBe(false);
  });

  it("permite al autor editar una publicación en estado REPORTADA", () => {
    expect(puedeEditar(autor, estadoReportada)).toBe(true);
  });
});

describe("puedeBorrar (RF-05, RF-06, RF-07)", () => {
  it("permite al autor borrar su publicación", () => {
    expect(puedeBorrar(autor, base)).toBe(true);
  });

  it("no permite a otro usuario borrar una publicación ajena", () => {
    expect(puedeBorrar(otroUsuario, base)).toBe(false);
  });

  it("permite al administrador borrar cualquier publicación", () => {
    expect(puedeBorrar(admin, base)).toBe(true);
  });

  it("permite al administrador borrar una publicación reportada", () => {
    expect(puedeBorrar(admin, estadoReportada)).toBe(true);
  });

  it("no ofrece borrar una publicación ya eliminada, ni al autor ni al administrador", () => {
    expect(puedeBorrar(autor, eliminada)).toBe(false);
    expect(puedeBorrar(admin, eliminada)).toBe(false);
  });
});

describe("puedeDarLike (RF-11, RF-14)", () => {
  it("permite dar like a una publicación ajena", () => {
    expect(puedeDarLike(otroUsuario, base)).toBe(true);
  });

  it("no permite dar like a la propia publicación", () => {
    expect(puedeDarLike(autor, base)).toBe(false);
  });

  it("permite al administrador dar like a una publicación ajena (A-4)", () => {
    expect(puedeDarLike(admin, base)).toBe(true);
  });

  it("no permite al administrador dar like a su propia publicación", () => {
    const propiaDelAdmin: Publicacion = { ...base, autor: { id: admin.id, nombre: admin.nombre } };
    expect(puedeDarLike(admin, propiaDelAdmin)).toBe(false);
  });

  it("no permite dar like a una publicación eliminada", () => {
    expect(puedeDarLike(otroUsuario, eliminada)).toBe(false);
  });

  it("sigue permitiendo quitar el like ya dado (la función solo decide si se ofrece la acción)", () => {
    const conLike: Publicacion = { ...base, likeadaPorMi: true };
    expect(puedeDarLike(otroUsuario, conLike)).toBe(true);
  });
});

describe("puedeGuardar (RF-17, A-9)", () => {
  it("permite guardar una publicación ajena", () => {
    expect(puedeGuardar(otroUsuario, base)).toBe(true);
  });

  it("no permite guardar la propia publicación", () => {
    expect(puedeGuardar(autor, base)).toBe(false);
  });

  it("permite al administrador guardar una publicación ajena", () => {
    expect(puedeGuardar(admin, base)).toBe(true);
  });

  it("no permite guardar una publicación eliminada", () => {
    expect(puedeGuardar(otroUsuario, eliminada)).toBe(false);
  });
});

describe("puedeReportar (RF-21, RF-22, RF-23)", () => {
  it("permite reportar una publicación ajena que no reporté", () => {
    expect(puedeReportar(otroUsuario, base)).toBe(true);
  });

  it("no permite reportar la propia publicación", () => {
    expect(puedeReportar(autor, base)).toBe(false);
  });

  it("no permite reportar dos veces la misma publicación", () => {
    expect(puedeReportar(otroUsuario, reportadaPorMi)).toBe(false);
  });

  it("permite al administrador reportar una publicación ajena (A-4)", () => {
    expect(puedeReportar(admin, base)).toBe(true);
  });

  it("no permite reportar una publicación eliminada", () => {
    expect(puedeReportar(otroUsuario, eliminada)).toBe(false);
  });

  it("permite reportar una publicación ajena en estado REPORTADA si no la reporté yo (A-16)", () => {
    expect(puedeReportar(otroUsuario, estadoReportada)).toBe(true);
  });
});

describe("puedeModerar (RF-10b, RF-24)", () => {
  it("permite moderar solo al rol ADMIN", () => {
    expect(puedeModerar(admin)).toBe(true);
  });

  it("no permite moderar al rol USER", () => {
    expect(puedeModerar(autor)).toBe(false);
    expect(puedeModerar(otroUsuario)).toBe(false);
  });
});
