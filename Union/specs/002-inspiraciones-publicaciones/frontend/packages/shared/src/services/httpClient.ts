// Cliente HTTP (T020). Es el único módulo del frontend que usa `fetch` (RF-09, D-04).
// Centraliza el mapeo de errores y los reintentos (D-11). Sin React.
//
// - Errores: rechaza siempre con `ErrorHttp` (códigos 400, 401, 403, 404, 409, 413, 415, 422, 500 o "red").
// - Reintentos: solo GET, hasta 2 reintentos ante "red" o 5xx; nunca ante 4xx ni en mutaciones.

import { ErrorHttp, codigoDesdeEstado } from "./errores";

export type ParametrosConsulta = Readonly<Record<string, string | number | boolean | undefined>>;

export interface OpcionesGet {
  readonly params?: ParametrosConsulta;
}

export interface OpcionesHttpClient {
  readonly baseUrl: string;
  /** Permite inyectar `fetch` (tests). Por defecto usa el `fetch` global. */
  readonly fetchImpl?: typeof fetch;
  /** Espera base entre reintentos de un GET. Por defecto 300 ms; 0 desactiva la espera. */
  readonly retrasoReintentoMs?: number;
}

export interface HttpClient {
  get<T = unknown>(ruta: string, opciones?: OpcionesGet): Promise<T>;
  post<T = unknown>(ruta: string, cuerpo?: unknown): Promise<T>;
  put<T = unknown>(ruta: string, cuerpo?: unknown): Promise<T>;
  patch<T = unknown>(ruta: string, cuerpo?: unknown): Promise<T>;
  delete<T = unknown>(ruta: string): Promise<T>;
}

type MetodoHttp = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const REINTENTOS_GET = 2;
const RETRASO_POR_DEFECTO_MS = 300;

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function leerDetalles(valor: unknown): Readonly<Record<string, string>> | undefined {
  if (!esRegistro(valor)) {
    return undefined;
  }
  const detalles: Record<string, string> = {};
  for (const [campo, mensaje] of Object.entries(valor)) {
    if (typeof mensaje === "string") {
      detalles[campo] = mensaje;
    }
  }
  return Object.keys(detalles).length > 0 ? detalles : undefined;
}

/** Arma el ErrorHttp de una respuesta no exitosa; tolera cuerpos vacíos o que no son JSON. */
async function errorDesdeRespuesta(respuesta: Response): Promise<ErrorHttp> {
  const codigo = codigoDesdeEstado(respuesta.status);
  let mensaje: string | undefined;
  let detalles: Readonly<Record<string, string>> | undefined;

  try {
    const texto = await respuesta.text();
    if (texto !== "") {
      const cuerpo: unknown = JSON.parse(texto);
      if (esRegistro(cuerpo)) {
        if (typeof cuerpo.mensaje === "string" && cuerpo.mensaje.trim() !== "") {
          mensaje = cuerpo.mensaje;
        }
        detalles = leerDetalles(cuerpo.detalles);
      }
    }
  } catch {
    // Cuerpo ilegible: se usa el mensaje por defecto del código.
  }

  return new ErrorHttp(codigo, mensaje, detalles);
}

function esReintentable(error: ErrorHttp): boolean {
  return error.codigo === "red" || error.codigo === 500;
}

function esperar(ms: number): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolver) => {
    setTimeout(resolver, ms);
  });
}

function construirUrl(baseUrl: string, ruta: string, params?: ParametrosConsulta): string {
  const consulta = new URLSearchParams();
  if (params !== undefined) {
    for (const [clave, valor] of Object.entries(params)) {
      if (valor !== undefined) {
        consulta.set(clave, String(valor));
      }
    }
  }
  const texto = consulta.toString();
  return `${baseUrl}${ruta}${texto === "" ? "" : `?${texto}`}`;
}

export function crearHttpClient(opciones: OpcionesHttpClient): HttpClient {
  const retraso = opciones.retrasoReintentoMs ?? RETRASO_POR_DEFECTO_MS;
  const ejecutarFetch: typeof fetch =
    opciones.fetchImpl ?? ((entrada, init) => fetch(entrada, init));

  async function intentar<T>(
    metodo: MetodoHttp,
    url: string,
    cuerpo: BodyInit | undefined,
    esJson: boolean,
  ): Promise<T> {
    const encabezados = new Headers({ Accept: "application/json" });
    if (esJson) {
      encabezados.set("Content-Type", "application/json");
    }

    let respuesta: Response;
    try {
      respuesta = await ejecutarFetch(url, {
        method: metodo,
        headers: encabezados,
        body: cuerpo,
        credentials: "include",
      });
    } catch {
      throw new ErrorHttp("red");
    }

    if (!respuesta.ok) {
      throw await errorDesdeRespuesta(respuesta);
    }

    // 204 o cuerpo vacío: no hay nada que leer. La forma del cuerpo se confía al contrato de la API.
    const texto = await respuesta.text();
    const resultado = texto === "" ? undefined : JSON.parse(texto);
    return resultado;
  }

  async function ejecutar<T>(
    metodo: MetodoHttp,
    ruta: string,
    cuerpo?: unknown,
    params?: ParametrosConsulta,
  ): Promise<T> {
    const url = construirUrl(opciones.baseUrl, ruta, params);
    const esFormulario = cuerpo instanceof FormData;
    const esJson = cuerpo !== undefined && !esFormulario;
    const contenido: BodyInit | undefined = esFormulario
      ? cuerpo
      : esJson
        ? JSON.stringify(cuerpo)
        : undefined;

    const reintentos = metodo === "GET" ? REINTENTOS_GET : 0;
    for (let reintento = 0; reintento < reintentos; reintento += 1) {
      try {
        return await intentar<T>(metodo, url, contenido, esJson);
      } catch (error) {
        if (!(error instanceof ErrorHttp) || !esReintentable(error)) {
          throw error;
        }
        await esperar(retraso * (reintento + 1));
      }
    }
    return intentar<T>(metodo, url, contenido, esJson);
  }

  return {
    get: (ruta, opcionesGet) => ejecutar("GET", ruta, undefined, opcionesGet?.params),
    post: (ruta, cuerpo) => ejecutar("POST", ruta, cuerpo),
    put: (ruta, cuerpo) => ejecutar("PUT", ruta, cuerpo),
    patch: (ruta, cuerpo) => ejecutar("PATCH", ruta, cuerpo),
    delete: (ruta) => ejecutar("DELETE", ruta),
  };
}
