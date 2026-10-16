/* eslint-disable @typescript-eslint/consistent-type-assertions -- import.meta.glob devuelve un registro genérico que requiere casting para obtener el tipo específico Cargador. */
// Rutas de la app de usuario con React.lazy por ruta (T058, D-05).
// Las páginas se cargan de forma diferida desde `../pages/*Page.tsx`; si una página aún no existe
// (se agregan en T059–T067) se muestra "no encontrada" en lugar de romper la app.
import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { EstadoError, Skeleton } from "@inspiraciones/shared";
import { Layout } from "../layouts/Layout";
import { RutaProtegida } from "./RutaProtegida";

type Cargador = () => Promise<{ default: React.ComponentType }>;

const modulosPagina = import.meta.glob<{ default: React.ComponentType }>("../pages/*Page.tsx");

function PaginaNoDisponible(): React.JSX.Element {
  return <EstadoError titulo="Página no encontrada" mensaje="La página que buscás no existe." />;
}

/** Crea el componente diferido de una página por nombre de archivo (sin extensión). */
function paginaDiferida(nombre: string): React.LazyExoticComponent<React.ComponentType> {
  const cargador = modulosPagina[`../pages/${nombre}.tsx`] as Cargador | undefined;
  return lazy(cargador ?? (() => Promise.resolve({ default: PaginaNoDisponible })));
}

export interface DefinicionRuta {
  readonly path: string;
  readonly pagina: string;
  /** Requiere sesión iniciada (RF-10). */
  readonly protegida: boolean;
}

/** Mapa de rutas del plan (sección de pantallas). */
export const RUTAS_USUARIO: readonly DefinicionRuta[] = [
  { path: "/", pagina: "ExplorarPage", protegida: false },
  { path: "/publicaciones/nueva", pagina: "CrearPublicacionPage", protegida: true },
  { path: "/publicaciones/:id", pagina: "DetallePublicacionPage", protegida: false },
  { path: "/publicaciones/:id/editar", pagina: "EditarPublicacionPage", protegida: true },
  { path: "/mis-publicaciones", pagina: "MisPublicacionesPage", protegida: true },
  { path: "/carpetas", pagina: "MisCarpetasPage", protegida: true },
  { path: "/carpetas/:id", pagina: "CarpetaPage", protegida: true },
];

const PAGINAS = new Map(RUTAS_USUARIO.map((r) => [r.pagina, paginaDiferida(r.pagina)]));

function Cargando(): React.JSX.Element {
  return <Skeleton variante="rectangulo" ariaLabel="Cargando página" />;
}

export function RutasUsuario(): React.JSX.Element {
  return (
    <Routes>
      <Route element={<Layout />}>
        {RUTAS_USUARIO.map(({ path, pagina, protegida }) => {
          const Pagina = PAGINAS.get(pagina);
          if (!Pagina) return null;
          const contenido = (
            <Suspense fallback={<Cargando />}>
              <Pagina />
            </Suspense>
          );
          return (
            <Route
              key={path}
              path={path}
              element={protegida ? <RutaProtegida>{contenido}</RutaProtegida> : contenido}
            />
          );
        })}
        <Route path="/inicio" element={<Navigate to="/" replace />} />
        <Route path="*" element={<PaginaNoDisponible />} />
      </Route>
    </Routes>
  );
}
