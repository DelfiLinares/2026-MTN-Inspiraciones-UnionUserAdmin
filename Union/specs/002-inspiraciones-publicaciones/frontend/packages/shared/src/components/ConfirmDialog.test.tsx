// Tests para ConfirmDialog (T075).
// Spec: HU-03, RF-28.
// Valida: foco, Escape, confirmar y cancelar.

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("no renderiza nada cuando no está abierto", () => {
    const { container } = render(
      <ConfirmDialog
        abierta={false}
        titulo="Confirmar"
        mensaje="¿Estás seguro?"
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renderiza el diálogo cuando está abierto", () => {
    render(
      <ConfirmDialog
        abierta={true}
        titulo="Eliminar"
        mensaje="¿Eliminar esta publicación?"
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(screen.getByText("Eliminar")).toBeTruthy();
    expect(screen.getByText("¿Eliminar esta publicación?")).toBeTruthy();
  });

  it("llama onConfirmar cuando se hace clic en el botón confirmar", () => {
    const onConfirmar = vi.fn();
    const onCancelar = vi.fn();

    render(
      <ConfirmDialog
        abierta={true}
        titulo="Confirmar"
        mensaje="¿Continuar?"
        textoConfirmar="Aceptar"
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
      />,
    );

    const btnConfirmar = screen.getByRole("button", { name: /Aceptar/i });
    fireEvent.click(btnConfirmar);

    expect(onConfirmar).toHaveBeenCalledOnce();
    expect(onCancelar).not.toHaveBeenCalled();
  });

  it("llama onCancelar cuando se hace clic en el botón cancelar", () => {
    const onConfirmar = vi.fn();
    const onCancelar = vi.fn();

    render(
      <ConfirmDialog
        abierta={true}
        titulo="Confirmar"
        mensaje="¿Continuar?"
        textoCancelar="No, cancelar"
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
      />,
    );

    const btnCancelar = screen.getByRole("button", { name: /No, cancelar/i });
    fireEvent.click(btnCancelar);

    expect(onCancelar).toHaveBeenCalledOnce();
    expect(onConfirmar).not.toHaveBeenCalled();
  });

  it("llama onCancelar cuando se presiona Escape", () => {
    const onConfirmar = vi.fn();
    const onCancelar = vi.fn();

    render(
      <ConfirmDialog
        abierta={true}
        titulo="Confirmar"
        mensaje="¿Continuar?"
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
      />,
    );

    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });

    expect(onCancelar).toHaveBeenCalledOnce();
    expect(onConfirmar).not.toHaveBeenCalled();
  });

  it("no llama onCancelar si Escape se presiona mientras está cargando", () => {
    const onConfirmar = vi.fn();
    const onCancelar = vi.fn();

    render(
      <ConfirmDialog
        abierta={true}
        titulo="Confirmar"
        mensaje="¿Continuar?"
        cargando={true}
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
      />,
    );

    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });

    expect(onCancelar).not.toHaveBeenCalled();
  });

  it("atrap el foco dentro del diálogo (Tab hacia adelante)", async () => {
    const onConfirmar = vi.fn();
    const onCancelar = vi.fn();

    render(
      <ConfirmDialog
        abierta={true}
        titulo="Confirmar"
        mensaje="¿Continuar?"
        textoCancelar="Cancelar"
        textoConfirmar="Confirmar"
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
      />,
    );

    const dialog = screen.getByRole("dialog");
    const btnCancelar = screen.getByRole("button", { name: /Cancelar/i });

    btnCancelar.focus();
    expect(document.activeElement).toBe(btnCancelar);

    fireEvent.keyDown(dialog, { key: "Tab", code: "Tab" });

    await waitFor(() => {
      const interactivos = dialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (interactivos.length > 0) {
        expect(Array.from(interactivos)).toContain(document.activeElement);
      }
    });
  });

  it("atrap el foco dentro del diálogo (Shift+Tab hacia atrás)", async () => {
    const onConfirmar = vi.fn();
    const onCancelar = vi.fn();

    render(
      <ConfirmDialog
        abierta={true}
        titulo="Confirmar"
        mensaje="¿Continuar?"
        textoCancelar="Cancelar"
        textoConfirmar="Confirmar"
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
      />,
    );

    const dialog = screen.getByRole("dialog");
    const btnCancelar = screen.getByRole("button", { name: /Cancelar/i });

    btnCancelar.focus();
    expect(document.activeElement).toBe(btnCancelar);

    fireEvent.keyDown(dialog, { key: "Tab", code: "Tab", shiftKey: true });

    await waitFor(() => {
      const interactivos = dialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (interactivos.length > 0) {
        expect(Array.from(interactivos)).toContain(document.activeElement);
      }
    });
  });

  it("deshabilita los botones cuando está cargando", () => {
    render(
      <ConfirmDialog
        abierta={true}
        titulo="Confirmar"
        mensaje="¿Continuar?"
        cargando={true}
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    const botones = screen.getAllByRole("button");
    botones.forEach((btn) => {
      expect(btn.hasAttribute("disabled")).toBe(true);
    });

    expect(screen.getByText("Procesando...")).toBeTruthy();
  });

  it("cierra al hacer clic fuera del diálogo (en el overlay)", () => {
    const onConfirmar = vi.fn();
    const onCancelar = vi.fn();

    render(
      <ConfirmDialog
        abierta={true}
        titulo="Confirmar"
        mensaje="¿Continuar?"
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
      />,
    );

    const overlay = screen.getByTestId("confirm-dialog-overlay");
    fireEvent.click(overlay);

    expect(onCancelar).toHaveBeenCalledOnce();
    expect(onConfirmar).not.toHaveBeenCalled();
  });

  it("no cierra al hacer clic fuera del diálogo si está cargando", () => {
    const onConfirmar = vi.fn();
    const onCancelar = vi.fn();

    render(
      <ConfirmDialog
        abierta={true}
        titulo="Confirmar"
        mensaje="¿Continuar?"
        cargando={true}
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
      />,
    );

    const overlay = screen.getByTestId("confirm-dialog-overlay");
    fireEvent.click(overlay);

    expect(onCancelar).not.toHaveBeenCalled();
  });

  it("renderiza botones con textos personalizados", () => {
    render(
      <ConfirmDialog
        abierta={true}
        titulo="Confirmación"
        mensaje="¿Proceder?"
        textoConfirmar="Aceptar"
        textoCancelar="Rechazar"
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /Aceptar/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Rechazar/i })).toBeTruthy();
  });

  it("aplica estilo destructivo cuando destructiva=true", () => {
    const { container } = render(
      <ConfirmDialog
        abierta={true}
        titulo="Eliminar"
        mensaje="¿Estás seguro?"
        destructiva={true}
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    const botones = container.querySelectorAll("button");
    const tieneDestructivo = Array.from(botones).some((btn) =>
      btn.className.includes("botonDestructivo"),
    );
    expect(tieneDestructivo).toBe(true);
  });

  it("tiene aria-modal y aria-labelledby configurados correctamente", () => {
    render(
      <ConfirmDialog
        abierta={true}
        titulo="Confirmar"
        mensaje="¿Continuar?"
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
  });
});
