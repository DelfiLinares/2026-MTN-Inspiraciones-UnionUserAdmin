/**
 * `PublicacionesPage`: Página contenedora de la pantalla de gestión de publicaciones.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T030; T046, depende de T044, T045, T027)
 * - Union/specs/002-frontend-admin/plan.md §Project Structure
 *   (`src/presentation/publicaciones/` → "Pantalla: gestión de publicaciones (editar, eliminar)")
 * - Union/specs/002-frontend-admin/spec.md AC-05.5
 *
 * Responsabilidades:
 * - Cablea `PublicacionesTable` (T043) con `EditarPublicacionForm` (T044) y
 *   `EliminarPublicacionAction` (T045) mediante la prop `renderAcciones` (mismo patrón que
 *   `UsuariosPage`, T038).
 * - Un botón "Editar" por fila alterna la visibilidad de `EditarPublicacionForm` (edición inline),
 *   evitando mostrar los formularios de las 10 filas simultáneamente.
 * - Maneja el error no bloqueante de ambas acciones vía `MensajeError` (T027), conforme a AC-05.5.
 *
 * Nota sobre el `HttpClient`: al igual que `UsuariosPage` (T038), recibe `httpClient` como prop
 * (inyección de dependencias), ya que este módulo aún no cuenta con una implementación concreta del
 * puerto `HttpClient` (T031 solo define la interfaz).
 */

import React, { useState } from 'react'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import { PublicacionesTable } from './PublicacionesTable'
import { EditarPublicacionForm } from './EditarPublicacionForm'
import { EliminarPublicacionAction } from './EliminarPublicacionAction'
import { MensajeError } from '../shared/MensajeError'

export interface PublicacionesPageProps {
  readonly httpClient: HttpClient
}

export const PublicacionesPage: React.FC<PublicacionesPageProps> = ({ httpClient }) => {
  const [mensajeError, setMensajeError] = useState<string | null>(null)
  const [idEnEdicion, setIdEnEdicion] = useState<string | null>(null)

  return (
    <section>
      <h1>Publicaciones</h1>

      {mensajeError !== null && <MensajeError mensaje={mensajeError} />}

      <PublicacionesTable
        httpClient={httpClient}
        renderAcciones={(publicacion, recargar) => (
          <>
            <button type="button" onClick={() => setIdEnEdicion(publicacion.id)}>
              Editar
            </button>
            <EliminarPublicacionAction
              publicacion={publicacion}
              httpClient={httpClient}
              onEliminada={recargar}
              onError={setMensajeError}
            />
            {idEnEdicion === publicacion.id && (
              <EditarPublicacionForm
                publicacion={publicacion}
                httpClient={httpClient}
                onGuardado={() => {
                  setIdEnEdicion(null)
                  recargar()
                }}
                onError={setMensajeError}
              />
            )}
          </>
        )}
      />
    </section>
  )
}
