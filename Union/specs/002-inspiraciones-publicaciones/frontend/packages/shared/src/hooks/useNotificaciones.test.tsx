import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import {
  ProveedorNotificaciones,
  useNotificaciones,
} from "./useNotificaciones";

describe("useNotificaciones (T043)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("lanza un error si se invoca fuera del ProveedorNotificaciones", () => {
    // Suppress console.error during expected throw
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useNotificaciones())).toThrow(
      "useNotificaciones debe usarse dentro de un ProveedorNotificaciones",
    );
    spy.mockRestore();
  });

  it("permite agregar notificaciones de éxito, error, info y advertencia", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ProveedorNotificaciones, null, children);

    const { result } = renderHook(() => useNotificaciones(), { wrapper });

    expect(result.current.notificaciones).toEqual([]);

    let idExito = "";
    let idError = "";
    let idInfo = "";
    let idAdv = "";

    act(() => {
      idExito = result.current.notificarExito("Publicación guardada");
      idError = result.current.notificarError("Error de conexión");
      idInfo = result.current.notificarInfo("Nueva actualización");
      idAdv = result.current.notificarAdvertencia("Atención requerida");
    });

    expect(result.current.notificaciones).toHaveLength(4);
    expect(result.current.notificaciones[0]).toMatchObject({
      id: idExito,
      tipo: "exito",
      mensaje: "Publicación guardada",
    });
    expect(result.current.notificaciones[1]).toMatchObject({
      id: idError,
      tipo: "error",
      mensaje: "Error de conexión",
    });
    expect(result.current.notificaciones[2]).toMatchObject({
      id: idInfo,
      tipo: "info",
      mensaje: "Nueva actualización",
    });
    expect(result.current.notificaciones[3]).toMatchObject({
      id: idAdv,
      tipo: "advertencia",
      mensaje: "Atención requerida",
    });
  });

  it("descarta automáticamente las notificaciones tras el tiempo de expiración", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        ProveedorNotificaciones,
        { duracionDefectoMs: 3000 },
        children,
      );

    const { result } = renderHook(() => useNotificaciones(), { wrapper });

    act(() => {
      result.current.notificarExito("Toast temporal");
    });

    expect(result.current.notificaciones).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(result.current.notificaciones).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.notificaciones).toHaveLength(0);
  });

  it("permite descartar manualmente una notificación", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ProveedorNotificaciones, null, children);

    const { result } = renderHook(() => useNotificaciones(), { wrapper });

    let id1 = "";
    let id2 = "";
    act(() => {
      id1 = result.current.notificarExito("Toast 1");
      id2 = result.current.notificarError("Toast 2");
    });

    expect(result.current.notificaciones).toHaveLength(2);

    act(() => {
      result.current.descartar(id1);
    });

    expect(result.current.notificaciones).toHaveLength(1);
    expect(result.current.notificaciones[0]?.id).toBe(id2);
  });

  it("permite limpiar todas las notificaciones activas", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ProveedorNotificaciones, null, children);

    const { result } = renderHook(() => useNotificaciones(), { wrapper });

    act(() => {
      result.current.notificarExito("Toast 1");
      result.current.notificarError("Toast 2");
      result.current.notificarInfo("Toast 3");
    });

    expect(result.current.notificaciones).toHaveLength(3);

    act(() => {
      result.current.limpiarTodas();
    });

    expect(result.current.notificaciones).toHaveLength(0);
  });
});
