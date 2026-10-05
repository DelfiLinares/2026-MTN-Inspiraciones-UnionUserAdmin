// Tests del cliente HTTP (T019). Se escriben antes de la implementación (T020).
// Spec: RF-09, CB-09. Decisiones: research.md D-04 (fetch encapsulado) y D-11 (reintentos).
//
// Contrato que debe cumplir T020 (diseño de este test):
// - `crearHttpClient({ baseUrl, fetchImpl?, retrasoReintentoMs? })` devuelve
//   `{ get, post, put, patch, delete }`; cada método devuelve una promesa con el cuerpo JSON
//   (o `undefined` si la respuesta es 204).
// - Ante un error rechaza con `ErrorHttp` (módulo `errores.ts`), que implementa `ErrorApi`:
//   `{ codigo, mensaje, detalles? }`.
// - Códigos: 400, 401, 403, 404, 409, 413, 415, 422 y 500 (cualquier 5xx) según el estado HTTP;
//   "red" cuando `fetch` falla sin respuesta.
// - Mensaje: el `mensaje` del cuerpo de error si viene; si no, el de `MENSAJES_ERROR`.
// - Reintentos: solo GET, 2 reintentos (3 intentos en total) ante "red" o 5xx; nunca ante 4xx.
//   Las mutaciones (POST, PUT, PATCH, DELETE) no se reintentan.
// - Es el único módulo que usa `fetch` (la inyección de `fetchImpl` permite probarlo sin red).

import { describe, expect, it, vi } from "vitest";
import { MENSAJES_ERROR } from "../utils/mensajes";
import { ErrorHttp } from "./errores";
import { crearHttpClient } from "./httpClient";

const BASE = "http://api.test/api/v1";

function respuestaJson(status: number, cuerpo?: unknown): Response {
  return new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function crearCliente(fetchImpl: typeof fetch) {
  return crearHttpClient({ baseUrl: BASE, fetchImpl, retrasoReintentoMs: 0 });
}

describe("respuestas exitosas", () => {
  it("GET devuelve el cuerpo JSON y llama a la URL base + ruta", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => respuestaJson(200, { id: "p1" }));
    const cliente = crearCliente(fetchMock);

    await expect(cliente.get("/publicaciones/p1")).resolves.toEqual({ id: "p1" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(`${BASE}/publicaciones/p1`);
  });

  it("GET agrega los parámetros a la URL y omite los indefinidos", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => respuestaJson(200, { items: [] }));
    const cliente = crearCliente(fetchMock);

    await cliente.get("/publicaciones", { params: { q: "mar", cursor: undefined, limite: 20 } });

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(url.searchParams.get("q")).toBe("mar");
    expect(url.searchParams.get("limite")).toBe("20");
    expect(url.searchParams.has("cursor")).toBe(false);
  });

  it("envía las credenciales de sesión (cookie) en cada pedido", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => respuestaJson(200, {}));
    await crearCliente(fetchMock).get("/sesion");

    expect(fetchMock.mock.calls[0]?.[1]?.credentials).toBe("include");
  });

  it("POST envía el cuerpo como JSON con su Content-Type", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => respuestaJson(201, { id: "c1" }));
    const cliente = crearCliente(fetchMock);

    await expect(cliente.post("/carpetas", { nombre: "Ideas" })).resolves.toEqual({ id: "c1" });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(JSON.stringify({ nombre: "Ideas" }));
    expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
  });

  it("POST con FormData lo envía tal cual y sin fijar el Content-Type", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => respuestaJson(201, { id: "p1" }));
    const formulario = new FormData();
    formulario.append("titulo", "Mi obra");

    await crearCliente(fetchMock).post("/publicaciones", formulario);

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.body).toBe(formulario);
    expect(new Headers(init?.headers).has("Content-Type")).toBe(false);
  });

  it("usa el método HTTP correcto en put, patch y delete", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => respuestaJson(200, {}));
    const cliente = crearCliente(fetchMock);

    await cliente.put("/publicaciones/p1/like");
    await cliente.patch("/carpetas/c1", { nombre: "Nuevo" });
    await cliente.delete("/publicaciones/p1");

    expect(fetchMock.mock.calls.map((llamada) => llamada[1]?.method)).toEqual([
      "PUT",
      "PATCH",
      "DELETE",
    ]);
  });

  it("devuelve undefined ante una respuesta 204 sin cuerpo", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(null, { status: 204 }));

    await expect(crearCliente(fetchMock).delete("/publicaciones/p1")).resolves.toBeUndefined();
  });
});

describe("mapeo de errores HTTP (RF-09, CB-09)", () => {
  it.each([400, 401, 403, 404, 409, 413, 415, 422] as const)(
    "el estado %i rechaza con ErrorHttp y su código y mensaje por defecto",
    async (estado) => {
      const fetchMock = vi.fn<typeof fetch>(async () => respuestaJson(estado));
      const resultado = crearCliente(fetchMock).get("/publicaciones/p1");

      await expect(resultado).rejects.toBeInstanceOf(ErrorHttp);
      await expect(resultado).rejects.toMatchObject({
        codigo: estado,
        mensaje: MENSAJES_ERROR[estado],
      });
    },
  );

  it("un 5xx se informa con el código 500", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => respuestaJson(503));

    await expect(crearCliente(fetchMock).post("/carpetas", {})).rejects.toMatchObject({
      codigo: 500,
      mensaje: MENSAJES_ERROR[500],
    });
  });

  it("usa el mensaje del cuerpo de error cuando la API lo envía", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      respuestaJson(409, { codigo: 409, mensaje: "Ya reportaste esta publicación" }),
    );

    await expect(crearCliente(fetchMock).post("/x", {})).rejects.toMatchObject({
      codigo: 409,
      mensaje: "Ya reportaste esta publicación",
    });
  });

  it("conserva los detalles por campo de un error 422", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      respuestaJson(422, { codigo: 422, mensaje: "Datos inválidos", detalles: { titulo: "Obligatorio" } }),
    );

    await expect(crearCliente(fetchMock).post("/publicaciones", {})).rejects.toMatchObject({
      codigo: 422,
      detalles: { titulo: "Obligatorio" },
    });
  });

  it("tolera un cuerpo de error que no es JSON", async () => {
    const fetchMock = vi.fn<typeof fetch>(
      async () => new Response("<html>error</html>", { status: 404 }),
    );

    await expect(crearCliente(fetchMock).get("/x")).rejects.toMatchObject({
      codigo: 404,
      mensaje: MENSAJES_ERROR[404],
    });
  });

  it("un fallo de red (sin respuesta) se informa con el código 'red'", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => {
      throw new TypeError("Failed to fetch");
    });
    const resultado = crearCliente(fetchMock).post("/carpetas", {});

    await expect(resultado).rejects.toBeInstanceOf(ErrorHttp);
    await expect(resultado).rejects.toMatchObject({ codigo: "red", mensaje: MENSAJES_ERROR.red });
  });
});

describe("reintentos (D-11)", () => {
  it("GET reintenta ante un fallo de red y termina bien si se recupera", async () => {
    let llamadas = 0;
    const fetchMock = vi.fn<typeof fetch>(async () => {
      llamadas += 1;
      if (llamadas < 3) {
        throw new TypeError("Failed to fetch");
      }
      return respuestaJson(200, { ok: true });
    });

    await expect(crearCliente(fetchMock).get("/publicaciones")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("GET se rinde tras 2 reintentos (3 intentos en total) ante un fallo de red persistente", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => {
      throw new TypeError("Failed to fetch");
    });

    await expect(crearCliente(fetchMock).get("/publicaciones")).rejects.toMatchObject({
      codigo: "red",
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("GET reintenta ante un 5xx", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => respuestaJson(500));

    await expect(crearCliente(fetchMock).get("/publicaciones")).rejects.toMatchObject({
      codigo: 500,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it.each([400, 401, 403, 404, 409, 413, 415, 422] as const)(
    "GET no reintenta ante un %i",
    async (estado) => {
      const fetchMock = vi.fn<typeof fetch>(async () => respuestaJson(estado));

      await expect(crearCliente(fetchMock).get("/publicaciones")).rejects.toMatchObject({
        codigo: estado,
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each(["post", "put", "patch", "delete"] as const)(
    "%s no se reintenta ante un fallo de red",
    async (metodo) => {
      const fetchMock = vi.fn<typeof fetch>(async () => {
        throw new TypeError("Failed to fetch");
      });

      await expect(crearCliente(fetchMock)[metodo]("/x")).rejects.toMatchObject({ codigo: "red" });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each(["post", "put", "patch", "delete"] as const)(
    "%s no se reintenta ante un 5xx",
    async (metodo) => {
      const fetchMock = vi.fn<typeof fetch>(async () => respuestaJson(500));

      await expect(crearCliente(fetchMock)[metodo]("/x")).rejects.toMatchObject({ codigo: 500 });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );
});
