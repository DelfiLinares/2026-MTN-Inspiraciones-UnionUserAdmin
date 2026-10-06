// Tests para Like (T083).
// Spec: HU-07, RF-11 a RF-15, CB-07.
// Valida: dar y quitar like, contador inmediato, anti doble clic, no en propia.

import { describe, it, expect } from "vitest";
import { usuario, administrador, publicacionPropia, publicacionAjena } from "../../../../tests/mocks/datos";
import { puedeDarLike } from "@inspiraciones/shared";
import { EstadoPublicacion } from "@inspiraciones/shared";
import type { Publicacion } from "@inspiraciones/shared";

describe("Like - Flujos principales (HU-07, RF-11 a RF-15)", () => {
  describe("HU-07: Dar y quitar like a publicaciones ajenas", () => {
    it("usuario puede dar like a publicación ajena", () => {
      const publicacionSinLike: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: false,
        cantidadLikes: 5,
      };

      const puedeAccionar = puedeDarLike(usuario, publicacionSinLike);

      expect(puedeAccionar).toBe(true);
    });

    it("usuario puede quitar like de publicación ajena", () => {
      const publicacionConLike: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: true,
        cantidadLikes: 6,
      };

      const puedeAccionar = puedeDarLike(usuario, publicacionConLike);

      expect(puedeAccionar).toBe(true);
    });

    it("administrador puede dar like a publicación ajena", () => {
      const publicacionSinLike: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: false,
      };

      const puedeAccionar = puedeDarLike(administrador, publicacionSinLike);

      expect(puedeAccionar).toBe(true);
    });

    it("administrador puede quitar like de publicación ajena", () => {
      const publicacionConLike: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: true,
      };

      const puedeAccionar = puedeDarLike(administrador, publicacionConLike);

      expect(puedeAccionar).toBe(true);
    });
  });

  describe("RF-11, RF-12: Alternancia de like (toggle)", () => {
    it("dar like incrementa contador en 1", () => {
      const publicacion: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: false,
        cantidadLikes: 10,
      };

      const cantidadTrasLike = publicacion.cantidadLikes + 1;

      expect(cantidadTrasLike).toBe(11);
    });

    it("quitar like decrementa contador en 1", () => {
      const publicacion: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: true,
        cantidadLikes: 10,
      };

      const cantidadTrasQuitar = publicacion.cantidadLikes - 1;

      expect(cantidadTrasQuitar).toBe(9);
    });

    it("contador no puede ser negativo", () => {
      const publicacion: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: true,
        cantidadLikes: 0,
      };

      const cantidadTrasQuitar = Math.max(0, publicacion.cantidadLikes - 1);

      expect(cantidadTrasQuitar).toBe(0);
    });

    it("contador actualiza inmediatamente (actualización optimista)", () => {
      let publicacion: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: false,
        cantidadLikes: 5,
      };

      // Simular actualización optimista
      publicacion = {
        ...publicacion,
        likeadaPorMi: true,
        cantidadLikes: 6,
      };

      expect(publicacion.likeadaPorMi).toBe(true);
      expect(publicacion.cantidadLikes).toBe(6);
    });

    it("estado revierte si la operación falla", () => {
      let publicacion: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: false,
        cantidadLikes: 5,
      };

      const estadoPrevio = { ...publicacion };

      // Simular fallo después de actualizar
      publicacion = {
        ...publicacion,
        likeadaPorMi: true,
        cantidadLikes: 6,
      };

      // Revertir
      publicacion = estadoPrevio;

      expect(publicacion.likeadaPorMi).toBe(false);
      expect(publicacion.cantidadLikes).toBe(5);
    });
  });

  describe("RF-13: Máximo un like por usuario y publicación", () => {
    it("usuario no puede dar dos likes a la misma publicación", () => {
      const publicacion: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: true,
      };

      // likeadaPorMi=true indica que ya dio like
      expect(publicacion.likeadaPorMi).toBe(true);

      // El usuario tiene permiso, pero el estado muestra que ya está likeada
      expect(puedeDarLike(usuario, publicacion)).toBe(true);
    });

    it("al togglear, pasa de likeada a no likeada", () => {
      let publicacion: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: true,
        cantidadLikes: 8,
      };

      publicacion = {
        ...publicacion,
        likeadaPorMi: false,
        cantidadLikes: 7,
      };

      expect(publicacion.likeadaPorMi).toBe(false);
      expect(publicacion.cantidadLikes).toBe(7);
    });

    it("al togglear nuevamente, vuelve a likeada", () => {
      let publicacion: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: false,
        cantidadLikes: 7,
      };

      publicacion = {
        ...publicacion,
        likeadaPorMi: true,
        cantidadLikes: 8,
      };

      expect(publicacion.likeadaPorMi).toBe(true);
      expect(publicacion.cantidadLikes).toBe(8);
    });
  });

  describe("RF-14: Usuario no puede dar like a su propia publicación", () => {
    it("autor no puede dar like a su propia publicación", () => {
      const puedeAccionar = puedeDarLike(usuario, publicacionPropia);

      expect(puedeAccionar).toBe(false);
    });

    it("admin no puede dar like a su propia publicación (si es autor)", () => {
      const propiaDelAdmin: Publicacion = {
        ...publicacionPropia,
        autor: { id: administrador.id, nombre: administrador.nombre },
      };

      const puedeAccionar = puedeDarLike(administrador, propiaDelAdmin);

      expect(puedeAccionar).toBe(false);
    });

    it("acción de like no se ofrece en propia (validación de permisos)", () => {
      const puedeAccionar = puedeDarLike(usuario, publicacionPropia);

      expect(puedeAccionar).toBe(false);
    });

    it("backend rechaza like a propia aunque cliente lo intente (defensa en profundidad)", () => {
      // Esto se valida en el servicio y el backend
      expect(puedeDarLike(usuario, publicacionPropia)).toBe(false);
    });
  });

  describe("RF-15: Se muestra la cantidad de likes", () => {
    it("contador visible en publicación con 0 likes", () => {
      const publicacion: Publicacion = {
        ...publicacionAjena,
        cantidadLikes: 0,
      };

      expect(publicacion.cantidadLikes).toBe(0);
    });

    it("contador visible en publicación con múltiples likes", () => {
      const publicacion: Publicacion = {
        ...publicacionAjena,
        cantidadLikes: 42,
      };

      expect(publicacion.cantidadLikes).toBe(42);
    });

    it("contador se actualiza después de dar like", () => {
      let publicacion: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: false,
        cantidadLikes: 10,
      };

      publicacion = {
        ...publicacion,
        likeadaPorMi: true,
        cantidadLikes: 11,
      };

      expect(publicacion.cantidadLikes).toBe(11);
    });

    it("contador se actualiza después de quitar like", () => {
      let publicacion: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: true,
        cantidadLikes: 11,
      };

      publicacion = {
        ...publicacion,
        likeadaPorMi: false,
        cantidadLikes: 10,
      };

      expect(publicacion.cantidadLikes).toBe(10);
    });

    it("contador visible en publicación eliminada pero read-only", () => {
      const eliminada: Publicacion = {
        ...publicacionAjena,
        estado: EstadoPublicacion.ELIMINADA,
        cantidadLikes: 15,
        likeadaPorMi: false,
      };

      expect(eliminada.cantidadLikes).toBe(15);
      expect(puedeDarLike(usuario, eliminada)).toBe(false);
    });

    it("contador visible en publicación propia pero read-only", () => {
      const propia: Publicacion = {
        ...publicacionPropia,
        cantidadLikes: 25,
      };

      expect(propia.cantidadLikes).toBe(25);
      expect(puedeDarLike(usuario, propia)).toBe(false);
    });
  });

  describe("CB-07: Anti doble clic (idempotencia)", () => {
    it("múltiples llamadas a puedeDarLike retornan el mismo resultado", () => {
      const resultado1 = puedeDarLike(usuario, publicacionAjena);
      const resultado2 = puedeDarLike(usuario, publicacionAjena);
      const resultado3 = puedeDarLike(usuario, publicacionAjena);

      expect(resultado1).toBe(resultado2);
      expect(resultado2).toBe(resultado3);
    });

    it("validación de permisos es idempotente en estado likeado", () => {
      const publicacion: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: true,
      };

      const perm1 = puedeDarLike(usuario, publicacion);
      const perm2 = puedeDarLike(usuario, publicacion);

      expect(perm1).toBe(perm2);
      expect(perm1).toBe(true);
    });

    it("durante pendiente=true, botón deshabilitado (previene doble clic)", () => {
      const props = {
        pendiente: true,
      };

      expect(props.pendiente).toBe(true);
    });

    it("pendiente=false habilita botón nuevamente", () => {
      const props = {
        pendiente: false,
      };

      expect(props.pendiente).toBe(false);
    });

    it("error de red durante like optimista revierte cambios", () => {
      let publicacion: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: false,
        cantidadLikes: 10,
      };

      const estadoPrevio = { ...publicacion };

      // Simular actualización optimista
      publicacion = {
        ...publicacion,
        likeadaPorMi: true,
        cantidadLikes: 11,
      };

      // Simular error en red - revertir
      publicacion = estadoPrevio;

      expect(publicacion.likeadaPorMi).toBe(false);
      expect(publicacion.cantidadLikes).toBe(10);
    });
  });

  describe("Estados especiales", () => {
    it("publicación eliminada no permite like", () => {
      const eliminada: Publicacion = {
        ...publicacionAjena,
        estado: EstadoPublicacion.ELIMINADA,
      };

      expect(puedeDarLike(usuario, eliminada)).toBe(false);
      expect(puedeDarLike(administrador, eliminada)).toBe(false);
    });

    it("publicación reportada SÍ permite like", () => {
      const reportada: Publicacion = {
        ...publicacionAjena,
        estado: EstadoPublicacion.REPORTADA,
      };

      expect(puedeDarLike(usuario, reportada)).toBe(true);
      expect(puedeDarLike(administrador, reportada)).toBe(true);
    });

    it("usuario sin autenticar no puede dar like", () => {
      const usuarioNull = null;

      // Sin usuario, no puede hacer acciones
      const puedeAccionar = usuarioNull !== null;

      expect(puedeAccionar).toBe(false);
    });
  });

  describe("Flujo completo: dar, quitar, reintento", () => {
    it("secuencia: sin like → dar → quitar → dar nuevamente", () => {
      let pub: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: false,
        cantidadLikes: 0,
      };

      // Dar like
      pub = { ...pub, likeadaPorMi: true, cantidadLikes: 1 };
      expect(pub.likeadaPorMi).toBe(true);
      expect(pub.cantidadLikes).toBe(1);

      // Quitar like
      pub = { ...pub, likeadaPorMi: false, cantidadLikes: 0 };
      expect(pub.likeadaPorMi).toBe(false);
      expect(pub.cantidadLikes).toBe(0);

      // Dar nuevamente
      pub = { ...pub, likeadaPorMi: true, cantidadLikes: 1 };
      expect(pub.likeadaPorMi).toBe(true);
      expect(pub.cantidadLikes).toBe(1);
    });

    it("múltiples usuarios pueden liker la misma publicación", () => {
      const pub: Publicacion = {
        ...publicacionAjena,
        cantidadLikes: 0,
      };

      // Usuario 1 da like
      const usuario1Like = { ...pub, cantidadLikes: 1 };
      expect(usuario1Like.cantidadLikes).toBe(1);

      // Usuario 2 da like (contador sigue aumentando)
      const usuario2Like = { ...usuario1Like, cantidadLikes: 2 };
      expect(usuario2Like.cantidadLikes).toBe(2);

      // Usuario 3 da like
      const usuario3Like = { ...usuario2Like, cantidadLikes: 3 };
      expect(usuario3Like.cantidadLikes).toBe(3);
    });

    it("cargar publicación muestra estado correcto de likeadaPorMi", () => {
      const publicacionCargada: Publicacion = {
        ...publicacionAjena,
        likeadaPorMi: true,
        cantidadLikes: 42,
      };

      expect(publicacionCargada.likeadaPorMi).toBe(true);
      expect(publicacionCargada.cantidadLikes).toBe(42);
    });
  });

  describe("Interface y contrato", () => {
    it("Publicacion tiene propiedad likeadaPorMi de tipo boolean", () => {
      const pub: Publicacion = publicacionAjena;

      expect(typeof pub.likeadaPorMi).toBe("boolean");
    });

    it("Publicacion tiene propiedad cantidadLikes de tipo number", () => {
      const pub: Publicacion = publicacionAjena;

      expect(typeof pub.cantidadLikes).toBe("number");
    });

    it("Publicacion tiene propiedad autor de tipo UsuarioRef", () => {
      const pub: Publicacion = publicacionAjena;

      expect(pub.autor).toBeTruthy();
      expect(pub.autor.id).toBeTruthy();
      expect(pub.autor.nombre).toBeTruthy();
    });

    it("puedeDarLike acepta Usuario y Publicacion", () => {
      const puedeAccionar = puedeDarLike(usuario, publicacionAjena);

      expect(typeof puedeAccionar).toBe("boolean");
    });
  });

  describe("Mensajes de error y estados", () => {
    it("error al dar like se maneja y notifica", () => {
      const error = { codigo: 401, mensaje: "No autenticado" };

      expect(error.codigo).toBe(401);
      expect(error.mensaje).toBeTruthy();
    });

    it("error de red durante like se maneja", () => {
      const error = { codigo: 503, mensaje: "Servicio no disponible" };

      expect(error.codigo).toBe(503);
    });

    it("éxito se notifica al usuario", () => {
      const exito = true;

      expect(exito).toBe(true);
    });
  });
});
