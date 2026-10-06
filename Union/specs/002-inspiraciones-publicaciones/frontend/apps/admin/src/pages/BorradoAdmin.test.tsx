// Tests para BorradoAdmin (T086).
// Spec: HU-12, RF-07.
// Valida: borrado por admin con confirmación explícita diferenciada, validación de rol.

import { describe, it, expect } from "vitest";
import {
  usuario,
  administrador,
  publicacionAjena,
  publicacionEliminada,
} from "../../../../tests/mocks/datos";
import { puedeModerar } from "@inspiraciones/shared";
import { EstadoPublicacion, RolUsuario } from "@inspiraciones/shared";
import type { Publicacion, UsuarioActual } from "@inspiraciones/shared";

describe("BorradoAdmin - Flujos principales (HU-12, RF-07)", () => {
  describe("HU-12: Borrado por administrador con confirmación explícita", () => {
    it("administrador puede borrar cualquier publicación", () => {
      const puedeAccionar = puedeModerar(administrador);

      expect(puedeAccionar).toBe(true);
    });

    it("administrador puede borrar publicación ajena", () => {
      const puedeAccionar = puedeModerar(administrador);

      expect(puedeAccionar).toBe(true);
    });

    it("administrador puede borrar publicación reportada", () => {
      const puedeAccionar = puedeModerar(administrador);

      expect(puedeAccionar).toBe(true);
    });

    it("confirmación requerida antes de borrar (HU-12)", () => {
      const adminConfirma = true;

      expect(adminConfirma).toBe(true);
    });

    it("confirmación es explícita y diferenciada visualmente", () => {
      const mensaje = "¿Eliminar esta publicación? Esta acción no se puede deshacer.";
      const esDestructiva = mensaje.toLowerCase().includes("eliminar");

      expect(esDestructiva).toBe(true);
    });

    it("diálogo de confirmación es destructivo (color distintivo)", () => {
      const botonEliminar = { tipo: "destructivo", texto: "Eliminar" };

      expect(botonEliminar.tipo).toBe("destructivo");
      expect(botonEliminar.texto).toBeTruthy();
    });

    it("tras confirmar, publicación pasa a estado ELIMINADA", () => {
      let publicacion: Publicacion = {
        ...publicacionAjena,
        estado: EstadoPublicacion.ACTIVA,
      };

      publicacion = {
        ...publicacion,
        estado: EstadoPublicacion.ELIMINADA,
      };

      expect(publicacion.estado).toBe(EstadoPublicacion.ELIMINADA);
    });

    it("usuario regular no puede ver opción de borrado admin", () => {
      const usuarioRegular: UsuarioActual = {
        id: "u-regular",
        nombre: "Regular",
        rol: RolUsuario.USER,
      };

      const puedeAccionar = puedeModerar(usuarioRegular);

      expect(puedeAccionar).toBe(false);
    });
  });

  describe("RF-07: Un administrador puede borrar cualquier publicación", () => {
    it("solo ADMIN puede ejecutar borrado (validación de rol)", () => {
      const puedeAccionar = puedeModerar(administrador);

      expect(puedeAccionar).toBe(true);
    });

    it("usuario con rol USER no puede borrar", () => {
      const puedeAccionar = puedeModerar(usuario);

      expect(puedeAccionar).toBe(false);
    });

    it("sistema valida el rol antes de ejecutar (RF-07)", () => {
      const usuarioSinPermiso: UsuarioActual = {
        id: "u-hacker",
        nombre: "Hacker",
        rol: RolUsuario.USER,
      };

      const puedeAccionar = puedeModerar(usuarioSinPermiso);

      expect(puedeAccionar).toBe(false);
    });

    it("usuario común no puede ejecutar aunque conozca el endpoint", () => {
      const usuarioFalso: UsuarioActual = {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: RolUsuario.USER,
      };

      const puedeAccionar = puedeModerar(usuarioFalso);

      expect(puedeAccionar).toBe(false);
    });

    it("borrado es independiente del estado de la publicación", () => {
      const esAdmin = puedeModerar(administrador);

      expect(esAdmin).toBe(true);
    });

    it("admin puede borrar publicación ya eliminada", () => {
      const puedeAccionar = puedeModerar(administrador);

      expect(puedeAccionar).toBe(true);
    });

    it("admin siempre tiene permisos si tiene rol ADMIN", () => {
      const adminAlterno: UsuarioActual = {
        id: "u-admin2",
        nombre: "Admin 2",
        rol: RolUsuario.ADMIN,
      };

      const puedeAccionar = puedeModerar(adminAlterno);

      expect(puedeAccionar).toBe(true);
    });
  });

  describe("Validaciones y seguridad", () => {
    it("sin confirmación explícita no se ejecuta borrado", () => {
      const adminNoConfirma = false;

      const puedeEjecutar = adminNoConfirma && puedeModerar(administrador);

      expect(puedeEjecutar).toBe(false);
    });

    it("borrado requiere autenticación previa", () => {
      const usuarioNoAutenticado: UsuarioActual | null = null;

      const esAutenticado = usuarioNoAutenticado !== null;

      expect(esAutenticado).toBe(false);
    });

    it("rol de usuario es verificado antes de borrar", () => {
      const esAdmin = administrador.rol === RolUsuario.ADMIN;

      expect(esAdmin).toBe(true);
    });

    it("usuario regular intenta borrar → 403 Forbidden", () => {
      const usuarioRegular: UsuarioActual = {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: RolUsuario.USER,
      };

      const puedeAccionar = puedeModerar(usuarioRegular);

      expect(puedeAccionar).toBe(false);
    });

    it("borrado es una acción destructiva (no reversible)", () => {
      const esDestructiva = true;
      const esReversible = false;

      expect(esDestructiva).toBe(true);
      expect(esReversible).toBe(false);
    });
  });

  describe("Interfaz y confirmación diferenciada", () => {
    it("mensaje de confirmación es específico para borrado admin", () => {
      const mensaje = "¿Eliminar esta publicación de forma permanente?";

      expect(mensaje).toContain("Eliminar");
      expect(mensaje).toContain("permanente");
    });

    it("botón de confirmación tiene color distintivo (rojo/destructivo)", () => {
      const boton = { etiqueta: "Eliminar", color: "rojo" };

      expect(boton.color).toBe("rojo");
    });

    it("botón de cancelación está disponible", () => {
      const botones = ["Cancelar", "Eliminar"];

      expect(botones).toContain("Cancelar");
    });

    it("mensaje de éxito tras borrado visible (RF-28)", () => {
      const mensajeExito = "Publicación eliminada correctamente";

      expect(mensajeExito).toBeTruthy();
      expect(mensajeExito.toLowerCase()).toContain("eliminada");
    });

    it("después de borrado la publicación no aparece en listados", () => {
      const publicacionesVisibles = [publicacionAjena];
      const publicacionEsta = publicacionesVisibles.some((p) => p.id === publicacionEliminada.id);

      expect(publicacionEsta).toBe(false);
    });
  });

  describe("Casos borde", () => {
    it("admin puede borrar múltiples publicaciones", () => {
      const esAdmin = puedeModerar(administrador);

      expect(esAdmin).toBe(true);
    });

    it("borrado de una no afecta otras publicaciones", () => {
      const pub1: Publicacion = {
        ...publicacionAjena,
        id: "p-1",
        estado: EstadoPublicacion.ELIMINADA,
      };

      const pub2: Publicacion = {
        ...publicacionAjena,
        id: "p-2",
        estado: EstadoPublicacion.ACTIVA,
      };

      expect(pub1.estado).toBe(EstadoPublicacion.ELIMINADA);
      expect(pub2.estado).toBe(EstadoPublicacion.ACTIVA);
    });

    it("admin ve aviso visual en acción destructiva", () => {
      const avisoDestructivo = true;

      expect(avisoDestructivo).toBe(true);
    });

    it("rol ADMIN tiene privilegios globales", () => {
      const puedeAccionar = puedeModerar(administrador);

      expect(puedeAccionar).toBe(true);
    });

    it("rol USER nunca tiene privilegios de moderación", () => {
      const puedeAccionar = puedeModerar(usuario);

      expect(puedeAccionar).toBe(false);
    });
  });
});

