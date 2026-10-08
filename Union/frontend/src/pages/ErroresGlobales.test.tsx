// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  httpClient,
  ApiError,
  HttpUnauthorizedError,
  HttpForbiddenError,
  registerTokenProvider,
} from "../infrastructure/httpClient";

function respuestaJson(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const CLAVE_BORRADOR = "publicacion-nueva";

/**
 * T092: ErroresGlobales Tests
 * Spec: RF-09, CB-09
 *
 * Valida el mapeo de errores globales del cliente HTTP:
 * - 401: sesión expirada, el borrador del formulario se conserva.
 * - 403: acción no autorizada.
 * - 404: recurso inexistente.
 * - Error de red: fallo sin respuesta del servidor.
 */
describe("ErroresGlobales - 401, 403, 404 y red (RF-09, CB-09)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    registerTokenProvider(() => null);
    localStorage.clear();
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("401 lanza HttpUnauthorizedError (sesión expirada)", async () => {
    fetchMock.mockResolvedValueOnce(respuestaJson(401, { mensaje: "expirada" }));

    const error = await httpClient.post("/publicaciones", { titulo: "x" }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpUnauthorizedError);
    expect((error as ApiError).status).toBe(401);
  });

  it("401 durante el envío conserva el borrador del formulario", async () => {
    const borrador = { titulo: "Trabajo en progreso", descripcion: "Texto largo" };
    localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(borrador));
    fetchMock.mockResolvedValueOnce(respuestaJson(401, null));

    try {
      await httpClient.post("/publicaciones", borrador);
    } catch (e) {
      if (!(e instanceof HttpUnauthorizedError)) throw e;
    }

    expect(JSON.parse(localStorage.getItem(CLAVE_BORRADOR) ?? "null")).toEqual(borrador);
  });

  it("403 lanza HttpForbiddenError", async () => {
    fetchMock.mockResolvedValueOnce(respuestaJson(403, null));

    const error = await httpClient.delete("/publicaciones/pub-1").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpForbiddenError);
    expect((error as ApiError).status).toBe(403);
  });

  it("404 lanza ApiError con status 404", async () => {
    fetchMock.mockResolvedValueOnce(respuestaJson(404, { mensaje: "no existe" }));

    const error = await httpClient.get("/publicaciones/inexistente").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).not.toBeInstanceOf(HttpUnauthorizedError);
    expect((error as ApiError).status).toBe(404);
  });

  it("error de red se propaga como error sin status HTTP", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const error = await httpClient.get("/publicaciones").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(TypeError);
    expect(error).not.toBeInstanceOf(ApiError);
  });
});
