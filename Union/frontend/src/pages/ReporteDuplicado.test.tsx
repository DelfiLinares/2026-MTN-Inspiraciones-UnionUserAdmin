// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

vi.mock("../infrastructure/httpClient", () => {
  class ApiError extends Error {
    readonly status: number;
    readonly body: unknown;
    constructor(message: string, status: number, body: unknown) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.body = body;
    }
  }
  return {
    ApiError,
    httpClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  };
});

import { httpClient, ApiError } from "../infrastructure/httpClient";
import { reportarPublicacion } from "../services/publicacionService";
import { Publicacion } from "../domain/Publicacion";
import { TipoContenido } from "../domain/enums/TipoContenido";
import { EstadoPublicacion } from "../domain/enums/EstadoPublicacion";
import { ReportButton } from "../components/publicacion/ReportButton";

function crearPublicacion(reportada: boolean): Publicacion {
  return new Publicacion({
    id: "pub-1",
    autorId: "autor-1",
    tipoContenido: TipoContenido.IMAGEN,
    estado: EstadoPublicacion.ACTIVA,
    tags: [],
    cantidadLikes: 0,
    likeDelUsuarioActual: false,
    reportadaPorUsuarioActual: reportada,
  });
}

/**
 * T091: ReporteDuplicado Tests
 * Spec: RF-23
 *
 * Valida:
 * - El backend responde 409 ante un reporte duplicado y el error se propaga con su status.
 * - Una publicación ya reportada no permite reportar de nuevo.
 * - La UI muestra el estado "Reportada" y deshabilita la acción.
 */
describe("ReporteDuplicado - 409 y estado 'Ya reportada' (RF-23)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("propaga el 409 cuando el backend indica reporte duplicado", async () => {
    vi.mocked(httpClient.post).mockRejectedValueOnce(
      new ApiError("Conflicto", 409, { codigo: "REPORTE_DUPLICADO" }),
    );

    const error = await reportarPublicacion(crearPublicacion(false), "usuario-2", "SPAM").catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(409);
    expect(httpClient.post).toHaveBeenCalledWith("/publicaciones/pub-1/reportes", {
      motivoCodigo: "SPAM",
    });
  });

  it("no envía la petición si la publicación ya fue reportada por el usuario", async () => {
    await expect(
      reportarPublicacion(crearPublicacion(true), "usuario-2", "SPAM"),
    ).rejects.toThrow();

    expect(httpClient.post).not.toHaveBeenCalled();
  });

  it("el dominio no permite reportar una publicación ya reportada", () => {
    expect(crearPublicacion(true).puedeReportar("usuario-2", true)).toBe(false);
    expect(crearPublicacion(false).puedeReportar("usuario-2", true)).toBe(true);
  });

  it("muestra el estado 'Reportada' y deshabilita el botón", () => {
    const onReportar = vi.fn();
    render(<ReportButton reportadaPorUsuarioActual={true} onReportar={onReportar} />);

    const boton = screen.getByRole("button", { name: "Publicación reportada" }) as HTMLButtonElement;

    expect(screen.getByText("Reportada")).toBeTruthy();
    expect(boton.disabled).toBe(true);

    fireEvent.click(boton);
    expect(onReportar).not.toHaveBeenCalled();
  });

  it("muestra el botón habilitado cuando aún no fue reportada", () => {
    render(<ReportButton reportadaPorUsuarioActual={false} onReportar={() => undefined} />);

    const boton = screen.getByRole("button", { name: "Reportar publicación" }) as HTMLButtonElement;

    expect(boton.disabled).toBe(false);
  });
});
