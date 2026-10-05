/**
 * `AppRoutesAdmin`: Enrutador principal del módulo `002-frontend-admin`
 * (moderación: usuarios, promoción, publicaciones, reportes).
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T022, depende de T002, T003)
 * - Union/specs/002-frontend-admin/plan.md §Project Structure (`src/routes/AppRoutes.tsx`)
 * - Union/specs/002-frontend-admin/spec.md HU-10, RF-21, RF-22
 * - Clarifications Session 2026-10-01: la exportación de reportes NO tiene ruta propia;
 *   es un botón dentro de `/reportes` (no existe `ExportacionPage.tsx`/ruta `/exportacion`).
 *
 * Nota sobre el nombre de archivo (colisión de nombres, mismo patrón documentado en T012/T014/T015):
 * `plan.md` indica la ruta `src/routes/AppRoutes.tsx`, pero ese nombre ya está ocupado en
 * `Union/frontend/src/routes/AppRoutes.tsx` por el enrutador del frontend de usuario
 * (`001-plataforma-unificada`, consumido activamente por `App.tsx`). Por lo tanto, este archivo se
 * llama `AppRoutesAdmin.tsx` para no romper esa implementación existente. Tampoco debe confundirse
 * con `Union/frontend/src/presentation/AppRouterAdmin.tsx`, que es un enrutador administrativo
 * distinto (dashboard/moderación/desafíos de `001-plataforma-unificada`, T101) con rutas bajo
 * `/admin/*` y guardia `RequireAdmin`. Este módulo (`002-frontend-admin`) define sus propias 4
 * pantallas de moderación con rutas planas (`/usuarios`, `/promocion`, `/publicaciones`,
 * `/reportes`) y su propia guardia `GuardiaRolAdmin` (T028, aún no implementada).
 *
 * Nota de integración: las páginas reales (`UsuariosPage`, `PromocionPage`, `PublicacionesPage`,
 * `ReportesPage`) se crearon en T030 (placeholders de contenido; el cableado funcional de cada
 * pantalla con sus servicios/tablas/acciones ocurre en las Fases 4–7, aún pendientes).
 */

import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { UsuariosPage } from '../presentation/usuarios/UsuariosPage'
import { PromocionPage } from '../presentation/promocion/PromocionPage'
import { PublicacionesPage } from '../presentation/publicaciones/PublicacionesPage'
import { ReportesPage } from '../presentation/reportes/ReportesPage'

export const AppRoutesAdmin: React.FC = () => {
  return (
    <Routes>
      <Route path="/usuarios" element={<UsuariosPage />} />
      <Route path="/promocion" element={<PromocionPage />} />
      <Route path="/publicaciones" element={<PublicacionesPage />} />
      <Route path="/reportes" element={<ReportesPage />} />
    </Routes>
  )
}
