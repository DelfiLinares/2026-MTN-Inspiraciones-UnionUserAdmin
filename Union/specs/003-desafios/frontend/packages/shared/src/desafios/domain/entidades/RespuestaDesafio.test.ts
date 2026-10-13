import { describe, expect, it } from "vitest";
import { RolUsuario } from "../../../domain/enums";
import { SesionActual } from "../SesionActual";
import { RespuestaDesafio } from "./RespuestaDesafio";

const respuesta = (): RespuestaDesafio => new RespuestaDesafio({ id: "r1", desafioId: "d1", autorId: "autor-1" });

const AUTOR = new SesionActual("autor-1", RolUsuario.USER);
const OTRO_USUARIO = new SesionActual("otro-1", RolUsuario.USER);
const ADMIN = new SesionActual("admin-1", RolUsuario.ADMIN);

describe("RespuestaDesafio", () => {
  describe("puedeEditarPor", () => {
    it("el autor puede editar", () => {
      expect(respuesta().puedeEditarPor(AUTOR)).toBe(true);
    });

    it("ADMIN no puede editar una respuesta ajena", () => {
      expect(respuesta().puedeEditarPor(ADMIN)).toBe(false);
    });

    it("otro usuario no puede editar", () => {
      expect(respuesta().puedeEditarPor(OTRO_USUARIO)).toBe(false);
    });
  });

  describe("puedeEliminarPor", () => {
    it("el autor puede eliminar", () => {
      expect(respuesta().puedeEliminarPor(AUTOR)).toBe(true);
    });

    it("ADMIN puede eliminar cualquier respuesta", () => {
      expect(respuesta().puedeEliminarPor(ADMIN)).toBe(true);
    });

    it("otro usuario no puede eliminar", () => {
      expect(respuesta().puedeEliminarPor(OTRO_USUARIO)).toBe(false);
    });
  });
});
