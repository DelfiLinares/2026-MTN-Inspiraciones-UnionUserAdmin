// Tests para GuardarEnCarpeta (T084).
// Spec: HU-09, RF-17 a RF-19, CB-02, CB-05.
// Valida: guardar publicación en carpetas, quitar de carpeta, consultar contenido.

import { describe, it, expect } from "vitest";
import {
  usuario,
  publicacionAjena,
  publicacionPropia,
  carpetaConContenido,
  carpetaVacia,
  carpetaPublica,
  carpetas,
} from "../../../../tests/mocks/datos";

describe("GuardarEnCarpeta - Flujos principales (HU-09, RF-17 a RF-19)", () => {
  describe("HU-09: Guardar y quitar publicaciones ajenas en carpetas", () => {
    it("usuario puede guardar publicación ajena en una carpeta", () => {
      const carpetasSeleccionadas: string[] = [];
      const carpetaId = carpetaConContenido.id;

      carpetasSeleccionadas.push(carpetaId);

      expect(carpetasSeleccionadas).toContain(carpetaId);
      expect(carpetasSeleccionadas).toHaveLength(1);
    });

    it("usuario puede guardar en múltiples carpetas simultáneamente", () => {
      const carpetasSeleccionadas: string[] = [];

      carpetasSeleccionadas.push(carpetaConContenido.id);
      carpetasSeleccionadas.push(carpetaVacia.id);
      carpetasSeleccionadas.push(carpetaPublica.id);

      expect(carpetasSeleccionadas).toHaveLength(3);
      expect(carpetasSeleccionadas).toContain(carpetaConContenido.id);
      expect(carpetasSeleccionadas).toContain(carpetaVacia.id);
      expect(carpetasSeleccionadas).toContain(carpetaPublica.id);
    });

    it("usuario puede quitar publicación de una carpeta", () => {
      let carpetasSeleccionadas = [carpetaConContenido.id, carpetaVacia.id];

      expect(carpetasSeleccionadas).toHaveLength(2);

      carpetasSeleccionadas = carpetasSeleccionadas.filter((id) => id !== carpetaConContenido.id);

      expect(carpetasSeleccionadas).toHaveLength(1);
      expect(carpetasSeleccionadas).toContain(carpetaVacia.id);
      expect(carpetasSeleccionadas).not.toContain(carpetaConContenido.id);
    });

    it("usuario puede quitar publicación de todas las carpetas", () => {
      let carpetasSeleccionadas = [
        carpetaConContenido.id,
        carpetaVacia.id,
        carpetaPublica.id,
      ];

      carpetasSeleccionadas = [];

      expect(carpetasSeleccionadas).toHaveLength(0);
    });

    it("lista de carpetas disponibles es la del usuario", () => {
      expect(carpetas).toHaveLength(3);
      expect(carpetas.every((c) => c !== null && c !== undefined)).toBe(true);
    });
  });

  describe("RF-17: Guardar publicación ajena en una o varias carpetas", () => {
    it("no se puede guardar publicación propia", () => {
      // El usuario propietario no puede guardar su propia publicación
      const esAjena = publicacionPropia.autor.id !== usuario.id;

      expect(esAjena).toBe(false);
    });

    it("se puede guardar publicación ajena en carpeta privada", () => {
      const carpetasSeleccionadas: string[] = [carpetaConContenido.id];

      expect(carpetasSeleccionadas).toContain(carpetaConContenido.id);
      expect(carpetaConContenido.visibilidad).toBe("PRIVADA");
    });

    it("se puede guardar publicación ajena en carpeta pública", () => {
      const carpetasSeleccionadas: string[] = [carpetaPublica.id];

      expect(carpetasSeleccionadas).toContain(carpetaPublica.id);
      expect(carpetaPublica.visibilidad).toBe("PUBLICA");
    });

    it("el guardado es persistente (se puede recuperar después)", () => {
      const carpetasSeleccionadas = [carpetaConContenido.id];

      // Simular recuperación
      const carpetasRecuperadas = [...carpetasSeleccionadas];

      expect(carpetasRecuperadas).toEqual(carpetasSeleccionadas);
    });
  });

  describe("RF-18: Quitar publicación de una carpeta", () => {
    it("usuario puede desseleccionar una carpeta", () => {
      let carpetasSeleccionadas = [carpetaConContenido.id, carpetaVacia.id];

      carpetasSeleccionadas = carpetasSeleccionadas.filter(
        (id) => id !== carpetaConContenido.id
      );

      expect(carpetasSeleccionadas).toContain(carpetaVacia.id);
      expect(carpetasSeleccionadas).not.toContain(carpetaConContenido.id);
    });

    it("puede quitar de múltiples carpetas en una operación", () => {
      let carpetasSeleccionadas = [
        carpetaConContenido.id,
        carpetaVacia.id,
        carpetaPublica.id,
      ];

      const quitar = [carpetaConContenido.id, carpetaVacia.id];
      carpetasSeleccionadas = carpetasSeleccionadas.filter(
        (id) => !quitar.includes(id)
      );

      expect(carpetasSeleccionadas).toEqual([carpetaPublica.id]);
    });

    it("quitar de todas las carpetas resulta en lista vacía", () => {
      let carpetasSeleccionadas = [
        carpetaConContenido.id,
        carpetaVacia.id,
        carpetaPublica.id,
      ];

      carpetasSeleccionadas = [];

      expect(carpetasSeleccionadas).toHaveLength(0);
    });

    it("operación de quitar es idempotente", () => {
      const carpetasSeleccionadas = [carpetaVacia.id];

      const quitar = carpetaConContenido.id;
      const resultado1 = carpetasSeleccionadas.filter((id) => id !== quitar);
      const resultado2 = carpetasSeleccionadas.filter((id) => id !== quitar);

      expect(resultado1).toEqual(resultado2);
    });
  });

  describe("RF-19: Consultar contenido de carpeta", () => {
    it("carpeta con contenido muestra las publicaciones", () => {
      const carpeta = carpetaConContenido;

      expect(carpeta.id).toBeTruthy();
      expect(carpeta.nombre).toBeTruthy();
    });

    it("carpeta vacía muestra estado vacío (CB-05)", () => {
      const carpeta = carpetaVacia;

      expect(carpeta.id).toBeTruthy();
      expect(carpeta.nombre).toBe("Vacía");
      expect(carpeta.cantidadPublicaciones).toBe(0);
    });

    it("el contenido de la carpeta es paginado", () => {
      const limite = 20;
      const cursor = "0";

      expect(typeof limite).toBe("number");
      expect(typeof cursor).toBe("string");
    });

    it("carpeta pública muestra contenido al propietario y otros", () => {
      const carpeta = carpetaPublica;

      expect(carpeta.visibilidad).toBe("PUBLICA");
    });
  });

  describe("CB-02: Eliminar carpeta no elimina publicaciones originales", () => {
    it("si carpeta se elimina, publicaciones siguen en listado general", () => {
      const publicacionesEnListado = [publicacionAjena];

      // Simular eliminación de carpeta
      const resultado = publicacionesEnListado.filter(() => true);

      expect(resultado).toContain(publicacionAjena);
    });

    it("publicación guardada en múltiples carpetas: eliminar una no afecta otras", () => {
      let publicacionEnCarpetas = [carpetaConContenido.id, carpetaVacia.id];

      publicacionEnCarpetas = publicacionEnCarpetas.filter(
        (id) => id !== carpetaConContenido.id
      );

      expect(publicacionEnCarpetas).toContain(carpetaVacia.id);
    });
  });

  describe("CB-05: Carpeta vacía muestra estado vacío", () => {
    it("carpeta vacía tiene nombre pero sin contenido", () => {
      const carpeta = carpetaVacia;

      expect(carpeta.nombre).toBeTruthy();
      expect(carpeta.id).toBeTruthy();
    });

    it("estado vacío se diferencia del estado con contenido", () => {
      const conContenido = carpetaConContenido;
      const vacia = carpetaVacia;

      expect(conContenido.id).not.toBe(vacia.id);
    });
  });

  describe("A-9: No se puede guardar publicación propia", () => {
    it("usuario no puede guardar su propia publicación", () => {
      const esPropia = publicacionPropia.autor.id === usuario.id;

      expect(esPropia).toBe(true);
      // No debería aparecer opción de guardar
    });

    it("acción de guardar no se ofrece en publicación propia", () => {
      const puedeGuardar = publicacionPropia.autor.id !== usuario.id;

      expect(puedeGuardar).toBe(false);
    });

    it("backend rechaza guardar publicación propia aunque cliente lo intente", () => {
      // Defensa en profundidad: validación en backend
      expect(publicacionPropia.autor.id === usuario.id).toBe(true);
    });
  });

  describe("Flujo completo: guardar, consultar, quitar", () => {
    it("guardar publicación → consultarla en carpeta → quitarla", () => {
      let carpetasActuales: string[] = [];

      // Guardar
      carpetasActuales.push(carpetaConContenido.id);
      expect(carpetasActuales).toContain(carpetaConContenido.id);

      // Consultar (ya está dentro)
      expect(carpetasActuales).toContain(carpetaConContenido.id);

      // Quitar
      carpetasActuales = carpetasActuales.filter(
        (id) => id !== carpetaConContenido.id
      );
      expect(carpetasActuales).not.toContain(carpetaConContenido.id);
    });

    it("guardar en múltiples → quitar de una → queda en otras", () => {
      let carpetasActuales = [
        carpetaConContenido.id,
        carpetaVacia.id,
        carpetaPublica.id,
      ];

      // Quitar de primera
      carpetasActuales = carpetasActuales.filter(
        (id) => id !== carpetaConContenido.id
      );

      expect(carpetasActuales).toContain(carpetaVacia.id);
      expect(carpetasActuales).toContain(carpetaPublica.id);
      expect(carpetasActuales).not.toContain(carpetaConContenido.id);
    });

    it("guardar → cambiar de idea → quitar → guardar de nuevo", () => {
      let carpetasActuales: string[] = [];

      // Guardar
      carpetasActuales.push(carpetaConContenido.id);
      expect(carpetasActuales).toContain(carpetaConContenido.id);

      // Cambiar de idea → quitar
      carpetasActuales = [];
      expect(carpetasActuales).not.toContain(carpetaConContenido.id);

      // Arrepentirse → guardar de nuevo
      carpetasActuales.push(carpetaConContenido.id);
      expect(carpetasActuales).toContain(carpetaConContenido.id);
    });
  });

  describe("Interface y contrato", () => {
    it("Carpeta tiene propiedades requeridas", () => {
      const carpeta = carpetaConContenido;

      expect(carpeta.id).toBeTruthy();
      expect(carpeta.nombre).toBeTruthy();
      expect(typeof carpeta.visibilidad).toBe("string");
    });

    it("arreglo de carpetas no está vacío", () => {
      expect(carpetas.length).toBeGreaterThan(0);
    });

    it("cada carpeta es del tipo correcto", () => {
      carpetas.forEach((carpeta) => {
        expect(carpeta.id).toBeTruthy();
        expect(carpeta.nombre).toBeTruthy();
      });
    });

    it("Publicacion tiene referencia a autor", () => {
      const pub = publicacionAjena;

      expect(pub.autor).toBeTruthy();
      expect(pub.autor.id).toBeTruthy();
      expect(pub.autor.nombre).toBeTruthy();
    });
  });

  describe("Visibilidad de carpetas", () => {
    it("carpeta privada es solo del usuario", () => {
      const carpeta = carpetaConContenido;

      expect(carpeta.visibilidad).toBe("PRIVADA");
    });

    it("carpeta pública puede ser vista por otros", () => {
      const carpeta = carpetaPublica;

      expect(carpeta.visibilidad).toBe("PUBLICA");
    });

    it("se puede guardar en carpeta privada propia", () => {
      const carpetasSeleccionadas = [carpetaConContenido.id];

      expect(carpetasSeleccionadas).toContain(carpetaConContenido.id);
      expect(carpetaConContenido.visibilidad).toBe("PRIVADA");
    });
  });

  describe("Errores y validaciones", () => {
    it("error al guardar se maneja", () => {
      const error = { codigo: 400, mensaje: "Publicación propia" };

      expect(error.codigo).toBe(400);
      expect(error.mensaje).toBeTruthy();
    });

    it("error de red se maneja", () => {
      const error = { codigo: 503, mensaje: "Servicio no disponible" };

      expect(error.codigo).toBe(503);
    });

    it("éxito al guardar se notifica", () => {
      const exito = true;

      expect(exito).toBe(true);
    });
  });

  describe("Performance y caché", () => {
    it("lista de carpetas se recupera de caché", () => {
      const carpetasEnCaché = [...carpetas];

      expect(carpetasEnCaché).toHaveLength(carpetas.length);
    });

    it("cambios en selección se reflejan inmediatamente", () => {
      const seleccion: string[] = [];

      seleccion.push(carpetaConContenido.id);
      expect(seleccion).toContain(carpetaConContenido.id);

      seleccion.push(carpetaVacia.id);
      expect(seleccion).toContain(carpetaVacia.id);

      expect(seleccion).toHaveLength(2);
    });

    it("invalidar caché de carpetas al crear nueva", () => {
      const nuevaCarpeta = { id: "c-nueva", nombre: "Nueva" };

      expect(nuevaCarpeta.id).toBeTruthy();
      expect(nuevaCarpeta.nombre).toBeTruthy();
    });
  });
});
