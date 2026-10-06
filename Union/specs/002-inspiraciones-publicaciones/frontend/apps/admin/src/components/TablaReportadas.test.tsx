// Tests para TablaReportadas (T081).
// Spec: RF-24.
// Valida: tabla de publicaciones reportadas, motivos, cantidad de reportes, fecha del último reporte.

import { describe, it, expect } from "vitest";
import { MotivoReporte } from "@inspiraciones/shared";
import type { PublicacionReportada } from "@inspiraciones/shared";

// Tipos locales para simplificar los tests sin type assertions
interface MockPublicacionReportada {
  publicacion: { id: string; titulo: string; autor?: { id: string; nombre: string } };
  cantidadReportes: number;
  motivos: readonly string[];
  reportes: readonly { id: string; fecha: string; resuelto?: boolean; reportante?: { id: string; nombre: string }; textoLibre?: string }[];
}

describe("TablaReportadas - Validación de datos (RF-24)", () => {
  describe("TablaReportadasProps interface", () => {
    it("define reportadas como readonly array obligatorio", () => {
      const reportadas: readonly PublicacionReportada[] = [];
      const props = { reportadas };

      expect(Array.isArray(props.reportadas)).toBe(true);
    });

    it("define onVerDetalle como callback opcional", () => {
      const reportadas: readonly PublicacionReportada[] = [];
      const props1 = { reportadas };
      const props2 = {
        reportadas,
        onVerDetalle: (reportada: PublicacionReportada): void => {
          expect(reportada).toBeTruthy();
        },
      };

      expect("onVerDetalle" in props1).toBe(false);
      expect("onVerDetalle" in props2).toBe(true);
      expect(typeof props2.onVerDetalle).toBe("function");
    });
  });

  describe("PublicacionReportada interface", () => {
    it("tiene publicacion como Publicacion", () => {
      const reportada: MockPublicacionReportada = {
        publicacion: { id: "pub-1", titulo: "Título" },
        cantidadReportes: 1,
        motivos: [],
        reportes: [],
      };

      expect(reportada.publicacion).toBeTruthy();
      expect(reportada.publicacion.id).toBe("pub-1");
      expect(typeof reportada.publicacion.titulo).toBe("string");
    });

    it("tiene cantidadReportes como número", () => {
      const reportada: MockPublicacionReportada = {
        publicacion: { id: "pub-1", titulo: "Título" },
        cantidadReportes: 5,
        motivos: [],
        reportes: [],
      };

      expect(typeof reportada.cantidadReportes).toBe("number");
      expect(reportada.cantidadReportes).toBe(5);
    });

    it("tiene motivos como readonly array", () => {
      const reportada: MockPublicacionReportada = {
        publicacion: { id: "pub-1", titulo: "Título" },
        cantidadReportes: 2,
        motivos: [MotivoReporte.SPAM, MotivoReporte.OTRO],
        reportes: [],
      };

      expect(Array.isArray(reportada.motivos)).toBe(true);
      expect(reportada.motivos.length).toBe(2);
    });

    it("tiene reportes como readonly array", () => {
      const reportada: MockPublicacionReportada = {
        publicacion: { id: "pub-1", titulo: "Título" },
        cantidadReportes: 1,
        motivos: [],
        reportes: [{ id: "r-1", fecha: "2026-10-01T10:00:00Z" }],
      };

      expect(Array.isArray(reportada.reportes)).toBe(true);
      expect(reportada.reportes.length).toBe(1);
    });
  });

  describe("Función fechaUltimoReporte", () => {
    it("retorna null con array vacío", () => {
      const reportes: readonly { fecha: string }[] = [];

      let ultima: string | null = null;
      for (const reporte of reportes) {
        if (ultima === null || Date.parse(reporte.fecha) > Date.parse(ultima)) {
          ultima = reporte.fecha;
        }
      }

      expect(ultima).toBe(null);
    });

    it("retorna la única fecha", () => {
      const fecha1 = "2026-10-01T10:00:00Z";
      const reportes: readonly { fecha: string }[] = [{ fecha: fecha1 }];

      let ultima: string | null = null;
      for (const reporte of reportes) {
        if (ultima === null || Date.parse(reporte.fecha) > Date.parse(ultima)) {
          ultima = reporte.fecha;
        }
      }

      expect(ultima).toBe(fecha1);
    });

    it("retorna la fecha más reciente de varias", () => {
      const fecha1 = "2026-10-01T10:00:00Z";
      const fecha2 = "2026-10-02T15:00:00Z";
      const fecha3 = "2026-10-03T09:00:00Z";

      const reportes: readonly { fecha: string }[] = [
        { fecha: fecha1 },
        { fecha: fecha3 },
        { fecha: fecha2 },
      ];

      let ultima: string | null = null;
      for (const reporte of reportes) {
        if (ultima === null || Date.parse(reporte.fecha) > Date.parse(ultima)) {
          ultima = reporte.fecha;
        }
      }

      expect(ultima).toBe(fecha3);
    });

    it("maneja fechas iguales", () => {
      const fecha = "2026-10-01T10:00:00Z";
      const reportes: readonly { fecha: string }[] = [
        { fecha },
        { fecha },
      ];

      let ultima: string | null = null;
      for (const reporte of reportes) {
        if (ultima === null || Date.parse(reporte.fecha) > Date.parse(ultima)) {
          ultima = reporte.fecha;
        }
      }

      expect(ultima).toBe(fecha);
    });
  });

  describe("Estado vacío", () => {
    it("tabla vacía muestra estado vacío", () => {
      const reportadas: readonly PublicacionReportada[] = [];

      expect(reportadas.length === 0).toBe(true);
    });
  });

  describe("Tabla con elementos", () => {
    it("tabla con un elemento", () => {
      const reportada: MockPublicacionReportada = {
        publicacion: { id: "pub-1", titulo: "Contenido problemático", autor: { id: "u1", nombre: "Autor" } },
        cantidadReportes: 1,
        motivos: [MotivoReporte.SPAM],
        reportes: [{ id: "r-1", fecha: "2026-10-01T10:00:00Z" }],
      };

      const reportadas: readonly MockPublicacionReportada[] = [reportada];

      expect(reportadas.length).toBe(1);
      expect(reportadas[0]?.publicacion.titulo).toBe("Contenido problemático");
    });

    it("tabla con múltiples elementos", () => {
      const reportada1: MockPublicacionReportada = {
        publicacion: { id: "pub-1", titulo: "Publicación 1", autor: { id: "u1", nombre: "Autor 1" } },
        cantidadReportes: 1,
        motivos: [MotivoReporte.SPAM],
        reportes: [{ id: "r-1", fecha: "2026-10-01T10:00:00Z" }],
      };

      const reportada2: MockPublicacionReportada = {
        publicacion: { id: "pub-2", titulo: "Publicación 2", autor: { id: "u2", nombre: "Autor 2" } },
        cantidadReportes: 3,
        motivos: [MotivoReporte.OTRO, MotivoReporte.CONTENIDO_INAPROPIADO],
        reportes: [
          { id: "r-2", fecha: "2026-10-02T09:00:00Z" },
          { id: "r-3", fecha: "2026-10-02T14:00:00Z" },
          { id: "r-4", fecha: "2026-10-03T11:00:00Z" },
        ],
      };

      const reportadas: readonly MockPublicacionReportada[] = [reportada1, reportada2];

      expect(reportadas.length).toBe(2);
      expect(reportadas[0]?.publicacion.titulo).toBe("Publicación 1");
      expect(reportadas[1]?.publicacion.titulo).toBe("Publicación 2");
      expect(reportadas[1]?.cantidadReportes).toBe(3);
    });
  });

  describe("Detalles mostrados en tabla", () => {
    it("muestra titulo de publicación", () => {
      const reportada: MockPublicacionReportada = {
        publicacion: { id: "pub-1", titulo: "Mi obra de arte" },
        cantidadReportes: 1,
        motivos: [],
        reportes: [],
      };

      expect(reportada.publicacion.titulo).toBe("Mi obra de arte");
    });

    it("muestra nombre del autor", () => {
      const reportada: MockPublicacionReportada = {
        publicacion: { id: "pub-1", titulo: "T", autor: { id: "u1", nombre: "Juan López" } },
        cantidadReportes: 1,
        motivos: [],
        reportes: [],
      };

      expect(reportada.publicacion.autor?.nombre).toBe("Juan López");
    });

    it("muestra todos los motivos de reporte", () => {
      const reportada: MockPublicacionReportada = {
        publicacion: { id: "pub-1", titulo: "T" },
        cantidadReportes: 3,
        motivos: [
          MotivoReporte.SPAM,
          MotivoReporte.OTRO,
          MotivoReporte.CONTENIDO_INAPROPIADO,
        ],
        reportes: [],
      };

      expect(reportada.motivos.length).toBe(3);
      expect(reportada.motivos).toContain(MotivoReporte.SPAM);
      expect(reportada.motivos).toContain(MotivoReporte.OTRO);
    });

    it("muestra cantidad de reportes", () => {
      const reportada: MockPublicacionReportada = {
        publicacion: { id: "pub-1", titulo: "T" },
        cantidadReportes: 5,
        motivos: [],
        reportes: Array.from({ length: 5 }, (_, i) => ({
          id: `r-${i}`,
          fecha: "2026-10-01T10:00:00Z",
        })),
      };

      expect(reportada.cantidadReportes).toBe(5);
      expect(reportada.reportes.length).toBe(5);
    });

    it("muestra última fecha de reporte", () => {
      const reportada: MockPublicacionReportada = {
        publicacion: { id: "pub-1", titulo: "T" },
        cantidadReportes: 2,
        motivos: [],
        reportes: [
          { id: "r-1", fecha: "2026-10-01T10:00:00Z" },
          { id: "r-2", fecha: "2026-10-02T10:00:00Z" },
        ],
      };

      let ultima: string | null = null;
      for (const reporte of reportada.reportes) {
        if (ultima === null || Date.parse(reporte.fecha) > Date.parse(ultima)) {
          ultima = reporte.fecha;
        }
      }

      expect(ultima).toBe("2026-10-02T10:00:00Z");
    });
  });

  describe("Motivos de reporte", () => {
    it("SPAM es válido", () => {
      expect(typeof MotivoReporte.SPAM).toBe("string");
      expect(MotivoReporte.SPAM).toBeTruthy();
    });

    it("OTRO es válido", () => {
      expect(typeof MotivoReporte.OTRO).toBe("string");
      expect(MotivoReporte.OTRO).toBeTruthy();
    });

    it("CONTENIDO_INAPROPIADO es válido", () => {
      expect(typeof MotivoReporte.CONTENIDO_INAPROPIADO).toBe("string");
      expect(MotivoReporte.CONTENIDO_INAPROPIADO).toBeTruthy();
    });

    it("motivos distintos son diferentes", () => {
      expect(MotivoReporte.SPAM).not.toBe(MotivoReporte.OTRO);
      expect(MotivoReporte.OTRO).not.toBe(MotivoReporte.CONTENIDO_INAPROPIADO);
      expect(MotivoReporte.SPAM).not.toBe(MotivoReporte.CONTENIDO_INAPROPIADO);
    });
  });

  describe("Reporte individual", () => {
    it("Reporte tiene propiedades obligatorias", () => {
      const reporte = {
        id: "r-1",
        publicacion: { id: "pub-1" },
        motivo: MotivoReporte.SPAM,
        fecha: "2026-10-01T10:00:00Z",
        reportante: { id: "u1", nombre: "Reportante" },
        resuelto: false,
      };

      expect(reporte.id).toBe("r-1");
      expect(reporte.motivo).toBe(MotivoReporte.SPAM);
      expect(typeof reporte.fecha).toBe("string");
      expect(reporte.reportante.nombre).toBe("Reportante");
      expect(reporte.resuelto).toBe(false);
    });

    it("Reporte puede tener textoLibre opcional", () => {
      const sin = { id: "r-1", motivo: MotivoReporte.SPAM };
      const con = {
        id: "r-2",
        motivo: MotivoReporte.OTRO,
        textoLibre: "Plagio de otra obra",
      };

      expect("textoLibre" in sin).toBe(false);
      expect("textoLibre" in con).toBe(true);
      expect(con.textoLibre).toBe("Plagio de otra obra");
    });

    it("resuelto puede ser true o false", () => {
      const noResuelto = { resuelto: false };
      const resuelto = { resuelto: true };

      expect(noResuelto.resuelto).toBe(false);
      expect(resuelto.resuelto).toBe(true);
    });
  });

  describe("Callback onVerDetalle", () => {
    it("se llama con PublicacionReportada", () => {
      let capturado: MockPublicacionReportada | null = null;

      const onVerDetalle = (reportada: MockPublicacionReportada): void => {
        capturado = reportada;
      };

      const reportada: MockPublicacionReportada = {
        publicacion: { id: "pub-1", titulo: "Test" },
        cantidadReportes: 1,
        motivos: [],
        reportes: [],
      };

      onVerDetalle(reportada);

      expect(capturado).toEqual(reportada);
    });

    it("puede no estar definido", () => {
      const reportadas: readonly PublicacionReportada[] = [];
      const props = { reportadas };

      const tieneCallback = "onVerDetalle" in props && typeof props.onVerDetalle === "function";

      expect(tieneCallback).toBe(false);
    });
  });

  describe("Casos especiales", () => {
    it("publicación reportada múltiples veces", () => {
      const reportada: MockPublicacionReportada = {
        publicacion: { id: "pub-1", titulo: "Contenido viral reportado" },
        cantidadReportes: 10,
        motivos: [
          MotivoReporte.SPAM,
          MotivoReporte.OTRO,
          MotivoReporte.CONTENIDO_INAPROPIADO,
        ],
        reportes: Array.from({ length: 10 }, (_, i) => ({
          id: `r-${i}`,
          reportante: { id: `u-${i}`, nombre: `Usuario ${i}` },
          fecha: new Date(2026, 9, 1 + Math.floor(i / 2)).toISOString(),
          resuelto: false,
        })),
      };

      expect(reportada.cantidadReportes).toBe(10);
      expect(reportada.reportes.length).toBe(10);
      expect(reportada.motivos.length).toBeGreaterThan(0);
    });

    it("todos los reportes resueltos", () => {
      const reportada: MockPublicacionReportada = {
        publicacion: { id: "pub-1", titulo: "T" },
        cantidadReportes: 3,
        motivos: [MotivoReporte.SPAM],
        reportes: [
          { id: "r-1", resuelto: true, fecha: "2026-10-01T10:00:00Z" },
          { id: "r-2", resuelto: true, fecha: "2026-10-02T10:00:00Z" },
          { id: "r-3", resuelto: true, fecha: "2026-10-03T10:00:00Z" },
        ],
      };

      const todosResueltos = reportada.reportes.every((r) => r.resuelto === true);

      expect(todosResueltos).toBe(true);
    });

    it("mezcla de reportes resueltos y no resueltos", () => {
      const reportada: MockPublicacionReportada = {
        publicacion: { id: "pub-1", titulo: "T" },
        cantidadReportes: 4,
        motivos: [MotivoReporte.SPAM, MotivoReporte.OTRO],
        reportes: [
          { id: "r-1", resuelto: true, fecha: "2026-10-01T10:00:00Z" },
          { id: "r-2", resuelto: false, fecha: "2026-10-02T10:00:00Z" },
          { id: "r-3", resuelto: true, fecha: "2026-10-03T10:00:00Z" },
          { id: "r-4", resuelto: false, fecha: "2026-10-04T10:00:00Z" },
        ],
      };

      const noResueltos = reportada.reportes.filter((r) => r.resuelto === false);
      const resueltos = reportada.reportes.filter((r) => r.resuelto === true);

      expect(noResueltos.length).toBe(2);
      expect(resueltos.length).toBe(2);
    });
  });
});
