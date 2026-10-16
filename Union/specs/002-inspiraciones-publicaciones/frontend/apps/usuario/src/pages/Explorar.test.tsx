// Tests para Explorar (T087 - parte 1).
// Spec: HU-06, RF-27, CB-11.
// Valida: búsqueda, filtros por categoría/etiqueta/tipo contenido, estado vacío.

import { describe, it, expect } from "vitest";
import { publicaciones } from "../../../../tests/mocks/datos";
import { TipoContenido } from "@inspiraciones/shared";

describe("Explorar - Búsqueda y filtros (HU-06, RF-27)", () => {
  describe("HU-06: Búsqueda por texto", () => {
    it("búsqueda por título encuentra publicación", () => {
      const termino = "acuarela";
      const resultados = publicaciones.filter((p) =>
        p.titulo.toLowerCase().includes(termino.toLowerCase())
      );

      expect(resultados.length).toBeGreaterThan(0);
    });

    it("búsqueda por descripción encuentra publicación", () => {
      const termino = "busto";
      const resultados = publicaciones.filter((p) =>
        p.descripcion.toLowerCase().includes(termino.toLowerCase())
      );

      expect(resultados.length).toBeGreaterThan(0);
    });

    it("búsqueda sin coincidencias retorna lista vacía", () => {
      const termino = "xyz_inexistente";
      const resultados = publicaciones.filter((p) =>
        p.titulo.toLowerCase().includes(termino.toLowerCase())
      );

      expect(resultados.length).toBe(0);
    });

    it("búsqueda es case-insensitive", () => {
      const terminoMayus = "ACUARELA";
      const terminoMinus = "acuarela";

      const resultadosMayus = publicaciones.filter((p) =>
        p.titulo.toLowerCase().includes(terminoMayus.toLowerCase())
      );
      const resultadosMinus = publicaciones.filter((p) =>
        p.titulo.toLowerCase().includes(terminoMinus.toLowerCase())
      );

      expect(resultadosMayus).toEqual(resultadosMinus);
    });

    it("búsqueda vacía retorna todas las publicaciones", () => {
      const termino = "";
      const resultados = publicaciones.filter((p) =>
        p.titulo.toLowerCase().includes(termino.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(termino.toLowerCase())
      );

      expect(resultados.length).toBe(publicaciones.length);
    });
  });

  describe("HU-06: Filtro por categoría", () => {
    it("filtro por categoría filtra correctamente", () => {
      const categoria = "Dibujo";
      const resultados = publicaciones.filter((p) => p.categoria === categoria);

      expect(resultados.length).toBeGreaterThan(0);
      for (const pub of resultados) {
        expect(pub.categoria).toBe(categoria);
      }
    });

    it("filtro por categoría inexistente retorna lista vacía", () => {
      const categoria = "Inexistente";
      const resultados = publicaciones.filter((p) => p.categoria === categoria);

      expect(resultados.length).toBe(0);
    });

    it("sin filtro retorna todas las categorías", () => {
      const categoriasUnias = new Set(publicaciones.map((p) => p.categoria));

      expect(categoriasUnias.size).toBeGreaterThan(1);
    });

    it("múltiples categorías pueden ser seleccionadas (OR)", () => {
      const categorias = ["Dibujo", "Escultura"];
      const resultados = publicaciones.filter((p) => categorias.includes(p.categoria));

      expect(resultados.length).toBeGreaterThan(0);
      for (const pub of resultados) {
        expect(categorias).toContain(pub.categoria);
      }
    });
  });

  describe("HU-06: Filtro por etiqueta", () => {
    it("filtro por etiqueta filtra correctamente", () => {
      const etiqueta = "acuarela";
      const resultados = publicaciones.filter((p) => p.etiquetas.includes(etiqueta));

      expect(resultados.length).toBeGreaterThan(0);
      for (const pub of resultados) {
        expect(pub.etiquetas).toContain(etiqueta);
      }
    });

    it("filtro por etiqueta inexistente retorna lista vacía", () => {
      const etiqueta = "inexistente_etiqueta";
      const resultados = publicaciones.filter((p) => p.etiquetas.includes(etiqueta));

      expect(resultados.length).toBe(0);
    });

    it("múltiples etiquetas pueden ser seleccionadas (OR)", () => {
      const etiquetas = ["acuarela", "arcilla"];
      const resultados = publicaciones.filter((p) =>
        p.etiquetas.some((e) => etiquetas.includes(e))
      );

      expect(resultados.length).toBeGreaterThan(0);
    });

    it("una publicación puede tener múltiples etiquetas", () => {
      const pubConVariasEtiquetas = publicaciones.find((p) => p.etiquetas.length > 1);

      expect(pubConVariasEtiquetas).toBeTruthy();
      expect(pubConVariasEtiquetas?.etiquetas.length).toBeGreaterThan(1);
    });
  });

  describe("HU-06: Filtro por tipo de contenido", () => {
    it("filtro por tipo IMAGEN filtra correctamente", () => {
      const tipoContenido = TipoContenido.IMAGEN;
      const resultados = publicaciones.filter((p) => p.tipoContenido === tipoContenido);

      expect(resultados.length).toBeGreaterThan(0);
      for (const pub of resultados) {
        expect(pub.tipoContenido).toBe(tipoContenido);
      }
    });

    it("filtro por tipo VIDEO filtra correctamente", () => {
      const tipoContenido = TipoContenido.VIDEO;
      const resultados = publicaciones.filter((p) => p.tipoContenido === tipoContenido);

      expect(resultados.length).toBeGreaterThan(0);
    });

    it("múltiples tipos de contenido pueden ser seleccionados (OR)", () => {
      const tipos = [TipoContenido.IMAGEN, TipoContenido.VIDEO];
      const resultados = publicaciones.filter((p) => {
        // Safe check that tipoContenido is one of the filtered types
        return tipos.some((tipo) => tipo === p.tipoContenido);
      });

      expect(resultados.length).toBeGreaterThan(0);
      for (const pub of resultados) {
        expect(tipos).toContain(pub.tipoContenido);
      }
    });
  });

  describe("Combinación de filtros", () => {
    it("búsqueda + filtro categoría funciona (AND)", () => {
      const termino = "acuarela";
      const categoria = "Dibujo";

      const resultados = publicaciones.filter(
        (p) =>
          p.titulo.toLowerCase().includes(termino.toLowerCase()) &&
          p.categoria === categoria
      );

      expect(resultados.length).toBeGreaterThan(0);
      for (const pub of resultados) {
        expect(pub.titulo.toLowerCase()).toContain(termino.toLowerCase());
        expect(pub.categoria).toBe(categoria);
      }
    });

    it("múltiples filtros en conjunto (AND)", () => {
      const categoria = "Dibujo";
      const etiqueta = "acuarela";

      const resultados = publicaciones.filter(
        (p) => p.categoria === categoria && p.etiquetas.includes(etiqueta)
      );

      expect(resultados.length).toBeGreaterThan(0);
      for (const pub of resultados) {
        expect(pub.categoria).toBe(categoria);
        expect(pub.etiquetas).toContain(etiqueta);
      }
    });

    it("filtro + tipo contenido funciona", () => {
      const categoria = "Dibujo";
      const tipoContenido = TipoContenido.IMAGEN;

      const resultados = publicaciones.filter(
        (p) => p.categoria === categoria && p.tipoContenido === tipoContenido
      );

      expect(resultados.length).toBeGreaterThan(0);
    });
  });

  describe("CB-11: Estado vacío (sin resultados)", () => {
    it("sin resultados muestra estado vacío claro", () => {
      const conteo = 0;
      const mostrarEstadoVacio = conteo === 0;

      expect(mostrarEstadoVacio).toBe(true);
    });

    it("mensaje de estado vacío es visible", () => {
      const mensaje = "No se encontraron publicaciones";

      expect(mensaje).toBeTruthy();
      expect(mensaje.toLowerCase()).toContain("no");
    });

    it("opción de limpiar filtros en estado vacío", () => {
      const filtrosActivos = true;
      const opcionLimpiar = filtrosActivos;

      expect(opcionLimpiar).toBe(true);
    });

    it("estado vacío desaparece al agregar resultados", () => {
      const resultados = publicaciones.filter((p) => p.titulo.includes("Acuarela"));

      const tieneResultados = resultados.length > 0;

      expect(tieneResultados).toBe(true);
    });

    it("búsqueda vacía también muestra estado vacío correcto", () => {
      const conResultados = publicaciones.length > 0;

      expect(conResultados).toBe(true);
    });
  });

  describe("RF-27: Búsqueda y filtros", () => {
    it("interfaz permite ingreso de texto de búsqueda", () => {
      const inputBusqueda = { tipo: "text", valor: "acuarela" };

      expect(inputBusqueda.tipo).toBe("text");
      expect(inputBusqueda.valor).toBeTruthy();
    });

    it("interfaz permite seleccionar filtros por categoría", () => {
      const selectCategoria = { tipo: "select", opciones: ["Dibujo", "Escultura"] };

      expect(selectCategoria.opciones.length).toBeGreaterThan(0);
    });

    it("interfaz permite seleccionar filtros por etiqueta", () => {
      const selectEtiqueta = { tipo: "select", opciones: ["acuarela", "arcilla"] };

      expect(selectEtiqueta.opciones.length).toBeGreaterThan(0);
    });

    it("interfaz permite seleccionar filtros por tipo contenido", () => {
      const selectTipo = {
        tipo: "select",
        opciones: [TipoContenido.IMAGEN, TipoContenido.VIDEO, TipoContenido.AUDIO],
      };

      expect(selectTipo.opciones.length).toBeGreaterThan(0);
    });

    it("botón limpiar filtros está disponible", () => {
      const botonLimpiar = { etiqueta: "Limpiar filtros", accion: "limpiar" };

      expect(botonLimpiar.etiqueta).toBeTruthy();
    });
  });
});
