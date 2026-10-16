// Layout de la app de usuario (T058): cabecera con navegación, contenido y notificaciones (RF-28).
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Notificaciones, useSesion } from "@inspiraciones/shared";

const ENLACES_PUBLICOS = [{ a: "/", texto: "Explorar" }] as const;
const ENLACES_SESION = [
  { a: "/publicaciones/nueva", texto: "Publicar" },
  { a: "/mis-publicaciones", texto: "Mis publicaciones" },
  { a: "/carpetas", texto: "Mis carpetas" },
] as const;

export function Layout(): React.JSX.Element {
  const { estaAutenticado, usuario } = useSesion();
  const enlaces = estaAutenticado ? [...ENLACES_PUBLICOS, ...ENLACES_SESION] : ENLACES_PUBLICOS;

  return (
    <>
      <a href="#contenido-principal" className="saltar-contenido">
        Saltar al contenido
      </a>
      <header role="banner">
        <nav aria-label="Principal">
          <ul style={{ display: "flex", gap: "1rem", listStyle: "none", margin: 0, padding: "1rem" }}>
            {enlaces.map((enlace) => (
              <li key={enlace.a}>
                <NavLink to={enlace.a} end={enlace.a === "/"}>
                  {enlace.texto}
                </NavLink>
              </li>
            ))}
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
