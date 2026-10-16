import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LimiteDeErrores } from "@inspiraciones/shared";
import { App } from "./App";

const contenedor = document.getElementById("root");
if (contenedor === null) {
  throw new Error("No se encontró el elemento #root");
}

createRoot(contenedor).render(
  <StrictMode>
    <LimiteDeErrores accion={<a href="/">Volver al inicio</a>}>
      <App />
    </LimiteDeErrores>
  </StrictMode>,
);
