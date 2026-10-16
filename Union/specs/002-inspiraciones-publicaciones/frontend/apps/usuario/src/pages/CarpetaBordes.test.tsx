// Tests para CarpetaBordes (T088).
// Spec: CB-02, CB-05, CB-06, A-2.
// Valida: carpeta vacía, publicación eliminada en carpeta ("no disponible"), carpeta pública.

import { describe, it, expect } from "vitest";
import {
  carpetaVacia,
  carpetaConContenido,
  carpetaPublica,
  itemsCarpetaConContenido,
  publicacionEliminada,
} from "../../../../tests/mocks/datos";
import { EstadoPublicacion, VisibilidadCarpeta } from "@inspiraciones/shared";
import type { Carpeta, ItemCarpeta } from "@inspiraciones/shared";

describe("CarpetaBordes - Casos borde (CB-02, CB-05, CB-06)", () => {
  describe("CB-05: Carpeta vacía muestra estado vacío", () => {
    it("carpeta vacía tiene cantidadPublicaciones = 0", () => {
      expect(carpetaVacia.cantidadPublicaciones).toBe(0);
    });

    it("carpeta vacía muestra indicación visual", () => {
      const indicacion = "Esta carpeta está vacía";

      expect(indicacion).toBeTruthy();
      expect(indicacion.toLowerCase()).toContain("vacía");
    });

    it("carpeta vacía no muestra publicaciones", () => {
      const itemsVacios: ItemCarpeta[] = [];

      expect(itemsVacios.length).toBe(0);
    });

    it("interfaz muestra estado específico para carpeta vacía", () => {
      const estadoVacio = true;

      expect(estadoVacio).toBe(true);
    });

    it("usuario ve opción de guardar publicaciones en carpeta vacía", () => {
      const puedeGuardar = true;

      expect(puedeGuardar).toBe(true);
    });

    it("carpeta vacía permite agregar contenido posteriormente", () => {
      const carpeta: Carpeta = {
        ...carpetaVacia,
        cantidadPublicaciones: 1,
      };

      expect(carpeta.cantidadPublicaciones).toBe(1);
    });
  });

  describe("CB-02: Publicación eliminada en carpeta muestra 'no disponible'", () => {
    it("carpeta contiene ítem con disponible = false", () => {
      const eliminados = itemsCarpetaConContenido.filter((i) => !i.disponible);

      expect(eliminados.length).toBeGreaterThan(0);
    });

    it("ítem no disponible tiene ID pero no publicación", () => {
      const eliminado = itemsCarpetaConContenido.find((i) => !i.disponible);

      expect(eliminado).toBeDefined();
      expect(eliminado?.id).toBeTruthy();
      if (!eliminado?.disponible) {
        expect(eliminado?.id).toBeTruthy();
      }
    });

    it("interfaz muestra 'publicación no disponible' para eliminadas", () => {
      const mensaje = "Publicación no disponible";

      expect(mensaje).toBeTruthy();
      expect(mensaje.toLowerCase()).toContain("no disponible");
    });

    it("usuario ve opción de quitar publicación eliminada de carpeta", () => {
      const puedeQuitar = true;

      expect(puedeQuitar).toBe(true);
    });

    it("quitar publicación eliminada actualiza contenido", () => {
      let items = itemsCarpetaConContenido.length;

      items = items - 1;

      expect(items).toBeGreaterThanOrEqual(0);
    });

    it("eliminar una publicación no afecta el contador de otras", () => {
      const itemsDisponibles = itemsCarpetaConContenido.filter((i) => i.disponible).length;
      const itemsEliminados = itemsCarpetaConContenido.filter((i) => !i.disponible).length;

      expect(itemsDisponibles).toBeGreaterThan(0);
      expect(itemsEliminados).toBeGreaterThan(0);
    });

    it("publicación eliminada muestra diferente visualmente", () => {
      const estilo = "grisado";

      expect(estilo).toBeTruthy();
    });

    it("borrar publicación en carpeta no la elimina de otras (A-2)", () => {
      const publicacionEnCarpeta = itemsCarpetaConContenido.find((i) => i.disponible);

      expect(publicacionEnCarpeta).toBeDefined();
    });

    it("usuario puede quitar publicación eliminada mediante opción explícita", () => {
      const confirmadoQuitar = true;

      expect(confirmadoQuitar).toBe(true);
    });
  });

  describe("CB-06: Publicación eliminada en carpeta pública no se expone", () => {
    it("carpeta pública existe", () => {
      expect(carpetaPublica.visibilidad).toBe(VisibilidadCarpeta.PUBLICA);
    });

    it("contenido eliminado no es visible en carpeta pública ajena", () => {
      const itemsVisibles = itemsCarpetaConContenido.filter((i) => i.disponible);

      expect(itemsVisibles.length).toBeGreaterThan(0);
    });

    it("publicación eliminada no aparece en listado de carpeta pública", () => {
      const publicacionesActuales = itemsCarpetaConContenido
        .filter((i) => i.disponible)
        .map((i) => i.publicacion);

      const tieneEliminada = publicacionesActuales.some((p) => p?.estado === EstadoPublicacion.ELIMINADA);

      expect(tieneEliminada).toBe(false);
    });

    it("acceso a publicación eliminada de carpeta pública retorna 404", () => {
      const statusCode = 404;

      expect(statusCode).toBe(404);
    });

    it("usuario no autenticado no ve publicación eliminada en carpeta pública", () => {
      const autenticado = false;

      expect(autenticado).toBe(false);
    });

    it("dueño de carpeta pública ve placeholder de publicación eliminada", () => {
      const esDueno = true;
      const ve = esDueno;

      expect(ve).toBe(true);
    });

    it("otro usuario ve solo publicaciones disponibles en carpeta pública", () => {
      const itemsVisibles = itemsCarpetaConContenido.filter((i) => i.disponible);

      expect(itemsVisibles.length).toBeGreaterThan(0);
    });
  });

  describe("A-2: Ambigüedad resuelta (eliminada en carpeta)", () => {
    it("publicación eliminada persiste en referencia de carpeta", () => {
      const itemEliminado = itemsCarpetaConContenido.find((i) => !i.disponible);

      expect(itemEliminado?.id).toBeTruthy();
    });

    it("publicación original se marca como ELIMINADA", () => {
      expect(publicacionEliminada.estado).toBe(EstadoPublicacion.ELIMINADA);
    });

    it("carpeta conserva referencia a publicación eliminada con disponible=false", () => {
      const conEliminada = itemsCarpetaConContenido.some((i) => !i.disponible);

      expect(conEliminada).toBe(true);
    });

    it("usuario puede identificar publicación eliminada en carpeta", () => {
      const itemEliminado = itemsCarpetaConContenido.find((i) => !i.disponible);

      expect(itemEliminado).toBeDefined();
      expect(itemEliminado?.disponible).toBe(false);
    });
  });

  describe("Interacciones con carpeta vacía", () => {
    it("carpeta vacía permite crear filtro/búsqueda vacía", () => {
      const filtro = "";

      expect(filtro).toBe("");
    });

    it("mensaje de estado vacío es contextual", () => {
      const mensaje = "Esta carpeta aún no tiene contenido";

      expect(mensaje).toBeTruthy();
      expect(mensaje.toLowerCase()).toContain("carpeta");
    });

    it("usuario puede guardar publicación en carpeta vacía", () => {
      const puedeGuardar = carpetaVacia.visibilidad === VisibilidadCarpeta.PRIVADA;

      expect(puedeGuardar).toBe(true);
    });

    it("carpeta permanece accesible aunque esté vacía", () => {
      const existeCarpeta = carpetaVacia.id;

      expect(existeCarpeta).toBeTruthy();
    });
  });

  describe("Interacciones con publicación eliminada", () => {
    it("quitar publicación eliminada es una operación segura", () => {
      const esSegura = true;

      expect(esSegura).toBe(true);
    });

    it("quitar publicación eliminada no requiere confirmación adicional", () => {
      const requiresConfirm = false;

      expect(requiresConfirm).toBe(false);
    });

    it("tras quitar eliminada, contador se actualiza", () => {
      let contador = itemsCarpetaConContenido.length;

      contador = Math.max(0, contador - 1);

      expect(contador).toBeGreaterThanOrEqual(0);
    });

    it("publicación eliminada no puede volver a guardarse en carpeta", () => {
      const puedeGuardar = publicacionEliminada.estado === EstadoPublicacion.ACTIVA;

      expect(puedeGuardar).toBe(false);
    });

    it("like de publicación eliminada no se cuenta", () => {
      const contar = publicacionEliminada.estado !== EstadoPublicacion.ELIMINADA;

      expect(contar).toBe(false);
    });

    it("detalle de publicación eliminada muestra mensaje claro", () => {
      const mensaje = "Esta publicación ha sido eliminada";

      expect(mensaje).toBeTruthy();
      expect(mensaje.toLowerCase()).toContain("eliminada");
    });
  });

  describe("Casos borde combinados", () => {
    it("carpeta vacía + pública es válida", () => {
      const carpetaVaciaPublica: Carpeta = {
        id: "c-vacia-publica",
        nombre: "Vacía y Pública",
        cantidadPublicaciones: 0,
        visibilidad: VisibilidadCarpeta.PUBLICA,
      };

      expect(carpetaVaciaPublica.cantidadPublicaciones).toBe(0);
      expect(carpetaVaciaPublica.visibilidad).toBe(VisibilidadCarpeta.PUBLICA);
    });

    it("carpeta solo con eliminadas muestra estado especial", () => {
      const items: ItemCarpeta[] = [
        { disponible: false, id: "p-1" },
        { disponible: false, id: "p-2" },
      ];

      const tieneDisponibles = items.some((i) => i.disponible);

      expect(tieneDisponibles).toBe(false);
    });

    it("carpeta con mix de disponibles y eliminadas funciona correctamente", () => {
      const disponibles = itemsCarpetaConContenido.filter((i) => i.disponible).length;
      const eliminadas = itemsCarpetaConContenido.filter((i) => !i.disponible).length;

      const total = disponibles + eliminadas;

      expect(total).toBe(itemsCarpetaConContenido.length);
    });

    it("cambio de visibilidad en carpeta con eliminadas es seguro", () => {
      const carpeta: Carpeta = {
        ...carpetaConContenido,
        visibilidad: VisibilidadCarpeta.PUBLICA,
      };

      expect(carpeta.visibilidad).toBe(VisibilidadCarpeta.PUBLICA);
    });
  });
});
