/**
 * `PromocionPage`: Página contenedora (placeholder) para la pantalla de promoción de usuarios a
 * rol ADMIN.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T030, depende de T022, T023)
 * - Union/specs/002-frontend-admin/plan.md §Project Structure
 *   (`src/presentation/promocion/` → "Pantalla: promoción de usuarios a ADMIN")
 *
 * Placeholder vacío: el cableado real (Fase 5, pendiente) consumirá `UsuariosService` para la
 * acción de promoción (HU-03).
 */

import React from 'react'

export const PromocionPage: React.FC = () => {
  return (
    <section>
      <h1>Promoción</h1>
    </section>
  )
}
