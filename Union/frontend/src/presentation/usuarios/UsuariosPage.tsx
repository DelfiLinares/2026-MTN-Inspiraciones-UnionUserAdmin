/**
 * `UsuariosPage`: Página contenedora (placeholder) para la pantalla de gestión de usuarios.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T030, depende de T022, T023)
 * - Union/specs/002-frontend-admin/plan.md §Project Structure
 *   (`src/presentation/usuarios/` → "Pantalla: gestión de usuarios (banear, eliminar)")
 *
 * Placeholder vacío: el cableado real con `UsuariosTable`, `BanearUsuarioAction` y
 * `EliminarUsuarioAction` se realiza en la Fase 4 (T035–T038), aún no ejecutada.
 */

import React from 'react'

export const UsuariosPage: React.FC = () => {
  return (
    <section>
      <h1>Usuarios</h1>
    </section>
  )
}
