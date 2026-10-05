import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const contenedor = document.getElementById("root");
if (contenedor === null) {
  throw new Error("No se encontró el elemento #root");
}

// Pantalla en blanco: las rutas y páginas de moderación se agregan en tareas posteriores (T066 en adelante).
createRoot(contenedor).render(<StrictMode />);
