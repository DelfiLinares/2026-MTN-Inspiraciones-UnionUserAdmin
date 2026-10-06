// Layout de la app admin (T066): cabecera con navegación, contenido y notificaciones (RF-28).
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Notificaciones, useSesion } from "@inspiraciones/shared";

export function Layout(): React.JSX.Element {
  const { usuario } = useSesion();

  return (
    <>
      <a href="#contenido-principal" className="saltar-contenido">
        Saltar al contenido
      </a>
      <header role="banner">
        <nav aria-label="Administración">
          <ul style={{ display: "flex", gap: "1rem", listStyle: "none", margin: 0, padding: "1rem" }}>
            <li>
              <NavLink to="/moderacion">Moderación</NavLink>
            </li>
            {usuario && <li style={{ marginLeft: "auto" }}>{usuario.nombre}</li>}
          </ul>
        </nav>
      </header>
      <main id="contenido-principal" tabIndex={-1} style={{ padding: "1rem" }}>
        <Outlet />
      </main>
      <Notificaciones />
    </>
  );
}
