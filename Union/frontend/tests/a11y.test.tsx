// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import axe from "axe-core";

import { PublicacionCard } from "../src/components/publicacion/PublicacionCard";
import { EmptyState } from "../src/components/comunes/EmptyState";
import { GuardarEnCarpetaModal } from "../src/components/carpetas/GuardarEnCarpetaModal";
import { Publicacion } from "../src/domain/Publicacion";
import { TipoContenido } from "../src/domain/enums/TipoContenido";
import { EstadoPublicacion } from "../src/domain/enums/EstadoPublicacion";

async function violaciones(contenedor: HTMLElement): Promise<string[]> {
  // jsdom no calcula estilos: la regla de contraste no es verificable aquí.
  const resultado = await axe.run(contenedor, { rules: { "color-contrast": { enabled: false } } });
  return resultado.violations.map((v) => `${v.id}: ${v.help}`);
}

const publicacion = new Publicacion({
  id: "pub-1",
  autorId: "autor-1",
  tipoContenido: TipoContenido.IMAGEN,
  estado: EstadoPublicacion.ACTIVA,
  tags: ["arte", "diseño"],
  cantidadLikes: 3,
  likeDelUsuarioActual: false,
  reportadaPorUsuarioActual: false,
});

/**
 * T094: chequeo automático de accesibilidad (axe-core)
 * Spec: RNF-01
 */
describe("Accesibilidad - modales y componentes clave (RNF-01)", () => {
  afterEach(() => {
    cleanup();
  });

  it("PublicacionCard no tiene violaciones", async () => {
    const { container } = render(<PublicacionCard publicacion={publicacion} nombreAutor="Ana" />);

    expect(await violaciones(container)).toEqual([]);
  });

  it("EmptyState no tiene violaciones", async () => {
    const { container } = render(
      <EmptyState titulo="Sin resultados" mensaje="Probá otros filtros" onAccion={() => undefined} textoAccion="Limpiar" />,
    );

    expect(await violaciones(container)).toEqual([]);
  });

  it("GuardarEnCarpetaModal abierto no tiene violaciones", async () => {
    const { container } = render(
      <GuardarEnCarpetaModal
        abierto={true}
        publicacionId="pub-1"
        carpetas={[]}
        cargandoCarpetas={false}
        onCerrar={() => undefined}
        onGuardar={async () => undefined}
        onCrearCarpeta={async () => {
          throw new Error("no usado");
        }}
      />,
    );

    expect(await violaciones(container)).toEqual([]);
  });
});
