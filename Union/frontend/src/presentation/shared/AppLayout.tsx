/**
 * `AppLayout`: Layout general y navegación lateral/superior del módulo `002-frontend-admin`.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T023, depende de T022)
 * - Union/specs/002-frontend-admin/plan.md §Project Structure
 *   (`src/presentation/shared/` → "Layout, ConfirmDialog, AccionSensibleBoton, guardia de rol, etc.")
 *
 * Responsabilidades:
 * - Provee una navegación simple (links) a las 4 pantallas del módulo: `/usuarios`, `/promocion`,
 *   `/publicaciones`, `/reportes` (coincide exactamente con las rutas definidas en T022,
 *   `AppRoutesAdmin.tsx`).
 * - Renderiza el contenido de la pantalla activa mediante `<Outlet />` de `react-router-dom`, de modo
 *   que pueda usarse como layout "wrapper" de las rutas (patrón estándar de React Router v6).
 * - Sin lógica de negocio ni llamadas HTTP: solo estructura visual y navegación (Principio V,
 *   separación de capas).
 *
 * Nota: la guardia de rol (`GuardiaRolAdmin`, T028) se integra en el enrutador (`AppRoutesAdmin.tsx`),
 * no en este layout, para mantener responsabilidades separadas.
 */

import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

interface EnlaceNavegacion {
  readonly etiqueta: string
  readonly ruta: string
}

const ENLACES_NAVEGACION: readonly EnlaceNavegacion[] = [
  { etiqueta: 'Usuarios', ruta: '/usuarios' },
  { etiqueta: 'Promoción', ruta: '/promocion' },
  { etiqueta: 'Publicaciones', ruta: '/publicaciones' },
  { etiqueta: 'Reportes', ruta: '/reportes' },
]

export const AppLayout: React.FC = () => {
  return (
    <div className="admin-app-layout">
      <nav className="admin-app-layout__nav" aria-label="Navegación administrativa">
        <ul className="admin-app-layout__nav-list">
          {ENLACES_NAVEGACION.map((enlace) => (
            <li key={enlace.ruta} className="admin-app-layout__nav-item">
              <NavLink
                to={enlace.ruta}
                className={({ isActive }) =>
                  isActive
                    ? 'admin-app-layout__nav-link admin-app-layout__nav-link--activo'
                    : 'admin-app-layout__nav-link'
                }
              >
                {enlace.etiqueta}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="admin-app-layout__contenido">
        <Outlet />
      </main>
    </div>
  )
}
