/* eslint-disable @typescript-eslint/consistent-type-assertions -- import.meta.glob devuelve un registro genérico que requiere casting para obtener el tipo específico Cargador. */
// Rutas de la app admin con React.lazy por ruta (T066, D-05).
// Las páginas se cargan de forma diferida desde `../pages/*Page.tsx`; si una página aún no existe
// (T067, T068) se muestra "no encontrada" en lugar de romper la app.
import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { EstadoError, Skeleton } from "@inspiraciones/shared";
import { Layout } from "../layouts/Layout";
import { RequireAdmin } from "./RequireAdmin";

type Cargador = () => Promise<{ default: React.ComponentType }>;

const modulosPagina = import.meta.glob<{ default: React.ComponentType }>("../pages/*Page.tsx");

function PaginaNoDisponible(): React.JSX.Element {
  return <EstadoError titulo="Página no encontrada" mensaje="La página que buscás no existe." />;
}

function paginaDiferida(nombre: string): React.LazyExoticComponent<React.ComponentType> {
  const cargador = modulosPagina[`../pages/${nombre}.tsx`] as Cargador | undefined;
  return lazy(cargador ?? (() => Promise.resolve({ default: PaginaNoDisponible })));
}

export interface DefinicionRuta {
  readonly path: string;
  readonly pagina: string;
}

/** Rutas del plan para admin; todas exigen rol ADMIN. */
export const RUTAS_ADMIN: readonly DefinicionRuta[] = [
  { path: "/moderacion", pagina: "ModeracionPage" },
  { path: "/moderacion/:id", pagina: "ModeracionDetallePage" },
];

const PAGINAS = new Map(RUTAS_ADMIN.map((r) => [r.pagina, paginaDiferida(r.pagina)]));

export function RutasAdmin(): React.JSX.Element {
  return (
    <Routes>
      <Route
        element={
          <RequireAdmin>
            <Layout />
          </RequireAdmin>
        }
      >
        <Route path="/" element={<Navigate to="/moderacion" replace />} />
        {RUTAS_ADMIN.map(({ path, pagina }) => {
          const Pagina = PAGINAS.get(pagina);
          if (!Pagina) return null;
          return (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<Skeleton variante="rectangulo" ariaLabel="Cargando página" />}>
                  <Pagina />
                </Suspense>
              }
            />
          );
        })}
        <Route path="*" element={<PaginaNoDisponible />} />
      </Route>
    </Routes>
  );
}
