// Tests para la configuración de TanStack Query y claves de consulta (T034).
// Spec: RNF-02. Res.: D-02, D-11, sección 4 y 6.

import { describe, expect, it } from "vitest";
import { TipoContenido } from "../domain/enums";
import { ErrorHttp } from "../services/errores";
import { clavesConsulta } from "./claves";
import {
  TIEMPO_OBSOLESCENCIA_MS,
  crearConfiguracionQueryClient,
  crearQueryClient,
  debeReintentarConsulta,
} from "./queryClient";

describe("clavesConsulta", () => {
  it("genera claves estables para sesión y configuración", () => {
    expect(clavesConsulta.sesion()).toEqual(["sesion"]);
    expect(clavesConsulta.configuracion()).toEqual(["configuracion"]);
  });

  it("genera claves jerárquicas para publicaciones", () => {
    expect(clavesConsulta.publicaciones.todas()).toEqual(["publicaciones"]);
    expect(clavesConsulta.publicaciones.listado()).toEqual(["publicaciones", "listado", {}]);
    expect(
      clavesConsulta.publicaciones.listado({ q: "arte", tipo: TipoContenido.IMAGEN }),
    ).toEqual(["publicaciones", "listado", { q: "arte", tipo: TipoContenido.IMAGEN }]);
    expect(clavesConsulta.publicaciones.propias({ cursor: "10" })).toEqual([
      "publicaciones",
      "me",
      { cursor: "10" },
    ]);
    expect(clavesConsulta.publicaciones.detalle("p-123")).toEqual([
      "publicaciones",
      "detalle",
      "p-123",
    ]);
    expect(clavesConsulta.publicaciones.carpetas("p-123")).toEqual([
      "publicaciones",
      "p-123",
      "carpetas",
    ]);
  });

  it("genera claves jerárquicas para carpetas", () => {
    expect(clavesConsulta.carpetas.todas()).toEqual(["carpetas"]);
    expect(clavesConsulta.carpetas.listado()).toEqual(["carpetas", "listado"]);
    expect(clavesConsulta.carpetas.contenido("c-1", { limite: 20 })).toEqual([
      "carpetas",
      "c-1",
      "publicaciones",
      { limite: 20 },
    ]);
  });

  it("genera claves jerárquicas para moderación", () => {
    expect(clavesConsulta.moderacion.todas()).toEqual(["moderacion"]);
    expect(clavesConsulta.moderacion.reportadas()).toEqual([
      "moderacion",
      "reportadas",
      {},
    ]);
    expect(clavesConsulta.moderacion.detalle("p-99")).toEqual([
      "moderacion",
      "reportadas",
      "detalle",
      "p-99",
    ]);
  });
});

describe("queryClient", () => {
  it("configura staleTime en 30 segundos (30_000 ms)", () => {
    expect(TIEMPO_OBSOLESCENCIA_MS).toBe(30_000);

    const config = crearConfiguracionQueryClient();
    expect(config.defaultOptions?.queries?.staleTime).toBe(30_000);
  });

  it("configura 0 reintentos para mutaciones (D-11)", () => {
    const config = crearConfiguracionQueryClient();
    expect(config.defaultOptions?.mutations?.retry).toBe(0);
  });

  it("evalúa reintentos para queries respetando D-11", () => {
    // Error 401, 403, 404, 422: nunca reintentar
    expect(debeReintentarConsulta(0, new ErrorHttp(401))).toBe(false);
    expect(debeReintentarConsulta(0, new ErrorHttp(403))).toBe(false);
    expect(debeReintentarConsulta(0, new ErrorHttp(404))).toBe(false);
    expect(debeReintentarConsulta(0, new ErrorHttp(422))).toBe(false);

    // Error de red o 500: reintenta hasta 2 veces (failureCount < 2)
    expect(debeReintentarConsulta(0, new ErrorHttp("red"))).toBe(true);
    expect(debeReintentarConsulta(1, new ErrorHttp("red"))).toBe(true);
    expect(debeReintentarConsulta(2, new ErrorHttp("red"))).toBe(false);

    expect(debeReintentarConsulta(0, new ErrorHttp(500))).toBe(true);
    expect(debeReintentarConsulta(1, new ErrorHttp(500))).toBe(true);
    expect(debeReintentarConsulta(2, new ErrorHttp(500))).toBe(false);
  });

  it("instancia QueryClient correctamente", () => {
    const client = crearQueryClient();
    expect(client).toBeDefined();
    expect(client.getDefaultOptions().queries?.staleTime).toBe(30_000);
  });
});
