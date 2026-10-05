import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const contenedor = document.getElementById("root");
if (contenedor === null) {
  throw new Error("No se encontró el elemento #root");
}

// Pantalla en blanco: las rutas y páginas se agregan en tareas posteriores (T058 en adelante).
createRoot(contenedor).render(<StrictMode />);
