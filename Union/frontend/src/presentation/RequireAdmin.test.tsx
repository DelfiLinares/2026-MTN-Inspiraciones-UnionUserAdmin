// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

vi.mock("../infrastructure/sessionGuard", async (importOriginal) => {
  const original = await importOriginal<typeof import("../infrastructure/sessionGuard")>();
  return { ...original, validarAccesoAdmin: vi.fn() };
});

import {
  validarAccesoAdmin,
  RolNoAutorizadoError,
  MENSAJE_ROL_NO_AUTORIZADO,
} from "../infrastructure/sessionGuard";
import { RequireAdmin } from "./RequireAdmin";

function LoginAdminSpy(): React.ReactElement {
  const location = useLocation();
  const estado = location.state as { mensaje?: string } | null;
  return <div>Login admin: {estado?.mensaje}</div>;
}

function renderizar(): void {
  render(
    <MemoryRouter initialEntries={["/moderacion"]}>
      <Routes>
        <Route path="/login-admin" element={<LoginAdminSpy />} />
        <Route
          path="/moderacion"
          element={
            <RequireAdmin>
              <div>Panel de moderación</div>
            </RequireAdmin>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

/**
 * T093: RequireAdmin Tests
 * Spec: RF-10b
 *
 * Valida que un usuario con rol USER es rechazado y que un ADMIN accede.
 */
describe("RequireAdmin - rechazo de USER (RF-10b)", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("rechaza a un USER y redirige a /login-admin con mensaje explícito", async () => {
    vi.mocked(validarAccesoAdmin).mockRejectedValueOnce(new RolNoAutorizadoError());

    renderizar();

    await waitFor(() => {
      expect(screen.getByText(/Login admin:/)).toBeTruthy();
    });
    expect(screen.getByText(new RegExp(MENSAJE_ROL_NO_AUTORIZADO.slice(0, 20)))).toBeTruthy();
    expect(screen.queryByText("Panel de moderación")).toBeNull();
  });

  it("permite el acceso a un ADMIN", async () => {
    vi.mocked(validarAccesoAdmin).mockResolvedValueOnce({} as never);

    renderizar();

    await waitFor(() => {
      expect(screen.getByText("Panel de moderación")).toBeTruthy();
    });
  });
});
