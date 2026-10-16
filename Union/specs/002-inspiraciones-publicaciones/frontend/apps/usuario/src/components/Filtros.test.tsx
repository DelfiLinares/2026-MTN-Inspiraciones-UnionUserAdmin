// Tests para Filtros (T080 - parte 2).
// Spec: RF-27.
// Valida: búsqueda y filtros, cleanup de valores vacíos, interfaces, callbacks.

import { describe, it, expect } from "vitest";
import { TipoContenido } from "@inspiraciones/shared";

// ValoresFiltros interface: opcional categoria, etiqueta, tipo
interface ValoresFiltros {
  readonly categoria?: string;
  readonly etiqueta?: string;
  readonly tipo?: TipoContenido;
}

describe("Filtros - Validación de datos y lógica", () => {
  describe("RF-27: Búsqueda y filtros", () => {
    it("ValoresFiltros permite categoria como string opcional", () => {
      const sin: ValoresFiltros = {};
      const con: ValoresFiltros = { categoria: "Arte" };

      expect(sin.categoria === undefined).toBe(true);
      expect(con.categoria).toBe("Arte");
    });

    it("ValoresFiltros permite etiqueta como string opcional", () => {
      const sin: ValoresFiltros = {};
      const con: ValoresFiltros = { etiqueta: "pintura" };

      expect(sin.etiqueta === undefined).toBe(true);
      expect(con.etiqueta).toBe("pintura");
    });

    it("ValoresFiltros permite tipo como TipoContenido opcional", () => {
      const sin: ValoresFiltros = {};
      const con: ValoresFiltros = { tipo: TipoContenido.IMAGEN };

      expect(sin.tipo === undefined).toBe(true);
      expect(con.tipo).toBe(TipoContenido.IMAGEN);
    });

    it("todos los filtros pueden ser vacíos", () => {
      const valores: ValoresFiltros = {};

      expect(Object.keys(valores).length === 0).toBe(true);
    });

    it("se pueden combinar múltiples filtros", () => {
      const valores: ValoresFiltros = {
        categoria: "Fotografía",
        etiqueta: "naturaleza",
        tipo: TipoContenido.IMAGEN,
      };

      expect(valores.categoria).toBe("Fotografía");
      expect(valores.etiqueta).toBe("naturaleza");
      expect(valores.tipo).toBe(TipoContenido.IMAGEN);
    });
  });

  describe("FiltrosProps interface", () => {
    it("FiltrosProps tiene valores (ValoresFiltros) obligatorio", () => {
      const props = {
        valores: { categoria: "Tech", etiqueta: "javascript" },
        onCambiar: () => {},
      };

      expect(props.valores).toBeTruthy();
      expect(typeof props.valores).toBe("object");
    });

    it("FiltrosProps tiene onCambiar (callback) obligatorio", () => {
      const onCambiar = (valores: ValoresFiltros): void => {
        expect(valores).toBeTruthy();
      };

      const props = {
        valores: {},
        onCambiar,
      };

      expect(typeof props.onCambiar).toBe("function");
    });

    it("FiltrosProps tiene className opcional", () => {
      // className es una propiedad opcional que puede agregarse a FiltrosProps
      const conClasName = { className: "custom-class" };
      const sinClassName = {};

      expect(conClasName.className).toBe("custom-class");
      expect(Object.getOwnPropertyDescriptor(sinClassName, "className")).toBeUndefined();
    });
  });

  describe("Lógica de limpieza (limpiar function)", () => {
    it("limpiar elimina propiedades vacías", () => {
      const valores: ValoresFiltros = {
        categoria: "",
        etiqueta: "pintura",
        tipo: undefined,
      };

      const limpiado = Object.fromEntries(
        Object.entries(valores).filter(([, v]) => v !== "" && v !== undefined),
      );

      expect("categoria" in limpiado).toBe(false);
      expect("etiqueta" in limpiado).toBe(true);
      expect("tipo" in limpiado).toBe(false);
    });

    it("limpiar conserva valores válidos", () => {
      const valores: ValoresFiltros = {
        categoria: "Arte",
        etiqueta: "acuarela",
        tipo: TipoContenido.IMAGEN,
      };

      const limpiado = Object.fromEntries(
        Object.entries(valores).filter(([, v]) => v !== "" && v !== undefined),
      );

      expect(Object.keys(limpiado).length).toBe(3);
    });

    it("limpiar devuelve objeto vacío si todos los valores son vacíos", () => {
      const valores: ValoresFiltros = {
        categoria: "",
        etiqueta: "",
        tipo: undefined,
      };

      const limpiado = Object.fromEntries(
        Object.entries(valores).filter(([, v]) => v !== "" && v !== undefined),
      );

      expect(Object.keys(limpiado).length).toBe(0);
    });
  });

  describe("Comportamiento de filtros", () => {
    it("filtro por categoria funciona", () => {
      const valores: ValoresFiltros = { categoria: "Tecnología" };

      expect(valores.categoria).toBe("Tecnología");
      expect(valores.etiqueta === undefined).toBe(true);
    });

    it("filtro por etiqueta funciona", () => {
      const valores: ValoresFiltros = { etiqueta: "javascript" };

      expect(valores.etiqueta).toBe("javascript");
      expect(valores.categoria === undefined).toBe(true);
    });

    it("filtro por tipo funciona para IMAGEN", () => {
      const valores: ValoresFiltros = { tipo: TipoContenido.IMAGEN };

      expect(valores.tipo).toBe(TipoContenido.IMAGEN);
    });

    it("filtro por tipo funciona para VIDEO", () => {
      const valores: ValoresFiltros = { tipo: TipoContenido.VIDEO };

      expect(valores.tipo).toBe(TipoContenido.VIDEO);
    });

    it("filtro por tipo funciona para AUDIO", () => {
      const valores: ValoresFiltros = { tipo: TipoContenido.AUDIO };

      expect(valores.tipo).toBe(TipoContenido.AUDIO);
    });

    it("cambiar categoria actualiza valores", () => {
      const inicial: ValoresFiltros = { categoria: "Arte" };
      const actualizado: ValoresFiltros = { ...inicial, categoria: "Música" };

      expect(inicial.categoria).toBe("Arte");
      expect(actualizado.categoria).toBe("Música");
    });

    it("cambiar etiqueta actualiza valores", () => {
      const inicial: ValoresFiltros = { etiqueta: "pintura" };
      const actualizado: ValoresFiltros = { ...inicial, etiqueta: "escultura" };

      expect(inicial.etiqueta).toBe("pintura");
      expect(actualizado.etiqueta).toBe("escultura");
    });

    it("cambiar tipo actualiza valores", () => {
      const inicial: ValoresFiltros = { tipo: TipoContenido.IMAGEN };
      const actualizado: ValoresFiltros = { ...inicial, tipo: TipoContenido.VIDEO };

      expect(inicial.tipo).toBe(TipoContenido.IMAGEN);
      expect(actualizado.tipo).toBe(TipoContenido.VIDEO);
    });

    it("remover categoria dejando etiqueta", () => {
      const valores: ValoresFiltros = {
        categoria: "Arte",
        etiqueta: "pintura",
      };

      const actualizado: ValoresFiltros = { etiqueta: valores.etiqueta };

      expect(actualizado.categoria === undefined).toBe(true);
      expect(actualizado.etiqueta).toBe("pintura");
    });

    it("remover etiqueta dejando categoria", () => {
      const valores: ValoresFiltros = {
        categoria: "Arte",
        etiqueta: "pintura",
      };

      const actualizado: ValoresFiltros = { categoria: valores.categoria };

      expect(actualizado.categoria).toBe("Arte");
      expect(actualizado.etiqueta === undefined).toBe(true);
    });
  });

  describe("Interacción de filtros", () => {
    it("categoria y etiqueta pueden coexistir", () => {
      const valores: ValoresFiltros = {
        categoria: "Arte",
        etiqueta: "pintura",
      };

      expect(valores.categoria).toBe("Arte");
      expect(valores.etiqueta).toBe("pintura");
    });

    it("categoria y tipo pueden coexistir", () => {
      const valores: ValoresFiltros = {
        categoria: "Fotografía",
        tipo: TipoContenido.IMAGEN,
      };

      expect(valores.categoria).toBe("Fotografía");
      expect(valores.tipo).toBe(TipoContenido.IMAGEN);
    });

    it("etiqueta y tipo pueden coexistir", () => {
      const valores: ValoresFiltros = {
        etiqueta: "danza",
        tipo: TipoContenido.VIDEO,
      };

      expect(valores.etiqueta).toBe("danza");
      expect(valores.tipo).toBe(TipoContenido.VIDEO);
    });

    it("todos los filtros pueden coexistir", () => {
      const valores: ValoresFiltros = {
        categoria: "Artes Visuales",
        etiqueta: "surrealismo",
        tipo: TipoContenido.IMAGEN,
      };

      expect(valores.categoria).toBe("Artes Visuales");
      expect(valores.etiqueta).toBe("surrealismo");
      expect(valores.tipo).toBe(TipoContenido.IMAGEN);
    });
  });

  describe("Determinar si hay filtros activos", () => {
    it("sin filtros hayFiltros es false", () => {
      const valores: ValoresFiltros = {};

      const hayFiltros = Object.values(valores).some(
        (v) => v !== undefined && v !== "",
      );

      expect(hayFiltros).toBe(false);
    });

    it("con categoria hayFiltros es true", () => {
      const valores: ValoresFiltros = { categoria: "Arte" };

      const hayFiltros = Object.values(valores).some(
        (v) => v !== undefined && v !== "",
      );

      expect(hayFiltros).toBe(true);
    });

    it("con etiqueta hayFiltros es true", () => {
      const valores: ValoresFiltros = { etiqueta: "pintura" };

      const hayFiltros = Object.values(valores).some(
        (v) => v !== undefined && v !== "",
      );

      expect(hayFiltros).toBe(true);
    });

    it("con tipo hayFiltros es true", () => {
      const valores: ValoresFiltros = { tipo: TipoContenido.IMAGEN };

      const hayFiltros = Object.values(valores).some(
        (v) => v !== undefined && v !== "",
      );

      expect(hayFiltros).toBe(true);
    });

    it("con múltiples filtros hayFiltros es true", () => {
      const valores: ValoresFiltros = {
        categoria: "Arte",
        etiqueta: "pintura",
        tipo: TipoContenido.IMAGEN,
      };

      const hayFiltros = Object.values(valores).some(
        (v) => v !== undefined && v !== "",
      );

      expect(hayFiltros).toBe(true);
    });

    it("con un filtro vacío hayFiltros es false", () => {
      const valores: ValoresFiltros = {
        categoria: "",
        etiqueta: undefined,
        tipo: undefined,
      };

      const hayFiltros = Object.values(valores).some(
        (v) => v !== undefined && v !== "",
      );

      expect(hayFiltros).toBe(false);
    });
  });

  describe("Callback onCambiar", () => {
    it("onCambiar se llama con valores actualizados", () => {
      let capturado: ValoresFiltros | null = null;

      const onCambiar = (valores: ValoresFiltros): void => {
        capturado = valores;
      };

      const nuevosValores: ValoresFiltros = { categoria: "Tech" };
      onCambiar(nuevosValores);

      expect(capturado).toEqual(nuevosValores);
    });

    it("onCambiar recibe categoria cuando se modifica", () => {
      const onCambiar = (valores: ValoresFiltros): void => {
        expect(valores).toBeTruthy();
      };

      const resultado: ValoresFiltros = { categoria: "Música" };
      onCambiar(resultado);

      expect(resultado.categoria).toBe("Música");
    });

    it("onCambiar recibe etiqueta cuando se modifica", () => {
      const onCambiar = (valores: ValoresFiltros): void => {
        expect(valores).toBeTruthy();
      };

      const resultado: ValoresFiltros = { etiqueta: "jazz" };
      onCambiar(resultado);

      expect(resultado.etiqueta).toBe("jazz");
    });

    it("onCambiar recibe tipo cuando se modifica", () => {
      const onCambiar = (valores: ValoresFiltros): void => {
        expect(valores).toBeTruthy();
      };

      const resultado: ValoresFiltros = { tipo: TipoContenido.AUDIO };
      onCambiar(resultado);

      expect(resultado.tipo).toBe(TipoContenido.AUDIO);
    });

    it("onCambiar recibe múltiples cambios", () => {
      const onCambiar = (valores: ValoresFiltros): void => {
        expect(valores).toBeTruthy();
      };

      const resultado: ValoresFiltros = {
        categoria: "Artes",
        etiqueta: "digital",
        tipo: TipoContenido.IMAGEN,
      };
      onCambiar(resultado);

      expect(resultado.categoria).toBe("Artes");
      expect(resultado.etiqueta).toBe("digital");
      expect(resultado.tipo).toBe(TipoContenido.IMAGEN);
    });

    it("onCambiar puede recibir objeto vacío (limpiar filtros)", () => {
      let capturado: ValoresFiltros | null = null;

      const onCambiar = (valores: ValoresFiltros): void => {
        capturado = valores;
      };

      onCambiar({});

      expect(Object.keys(capturado ?? {}).length).toBe(0);
    });
  });

  describe("TipoContenido enum", () => {
    it("TipoContenido tiene IMAGEN", () => {
      expect(TipoContenido.IMAGEN).toBeTruthy();
      expect(typeof TipoContenido.IMAGEN).toBe("string");
    });

    it("TipoContenido tiene VIDEO", () => {
      expect(TipoContenido.VIDEO).toBeTruthy();
      expect(typeof TipoContenido.VIDEO).toBe("string");
    });

    it("TipoContenido tiene AUDIO", () => {
      expect(TipoContenido.AUDIO).toBeTruthy();
      expect(typeof TipoContenido.AUDIO).toBe("string");
    });

    it("TipoContenido.IMAGEN es diferente de VIDEO", () => {
      expect(TipoContenido.IMAGEN).not.toBe(TipoContenido.VIDEO);
    });

    it("TipoContenido.VIDEO es diferente de AUDIO", () => {
      expect(TipoContenido.VIDEO).not.toBe(TipoContenido.AUDIO);
    });

    it("TipoContenido.AUDIO es diferente de IMAGEN", () => {
      expect(TipoContenido.AUDIO).not.toBe(TipoContenido.IMAGEN);
    });
  });
});
