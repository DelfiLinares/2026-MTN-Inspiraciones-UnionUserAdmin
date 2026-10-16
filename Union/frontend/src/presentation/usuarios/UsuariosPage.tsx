/**
 * `UsuariosPage`: Página contenedora de la pantalla de gestión de usuarios.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T030; T038, depende de T036, T037, T027)
 * - Union/specs/002-frontend-admin/plan.md §Project Structure
 *   (`src/presentation/usuarios/` → "Pantalla: gestión de usuarios (banear, eliminar)")
 * - Union/specs/002-frontend-admin/spec.md AC-01.7, AC-02.6
 *
 * Responsabilidades:
 * - Cablea `UsuariosTable` (T035) con `BanearUsuarioAction` (T036) y `EliminarUsuarioAction` (T037)
 *   mediante la prop `renderAcciones`, inyectando ambas acciones por fila.
 * - Maneja el error no bloqueante de las acciones vía `MensajeError` (T027), conforme a AC-01.7 y
 *   AC-02.6: un fallo al banear/eliminar se informa sin bloquear ni reiniciar toda la pantalla.
 *
 * Nota sobre el `HttpClient`: este módulo aún no cuenta con una implementación real del puerto
 * `HttpClient` (T031 solo define la interfaz; su implementación concreta, equivalente a
 * `httpClientAdmin.ts` de `001-plataforma-unificada`, no está contemplada en una tarea explícita
 * de `tasks.md` hasta el momento). Por eso `UsuariosPage` recibe el `httpClient` como prop
 * (inyección de dependencias), permitiendo tanto un mock en tests como una futura instancia real
 * sin acoplar esta página a una implementación concreta de infraestructura.
 */

import React, { useState } from 'react'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import { UsuariosTable } from './UsuariosTable'
import { BanearUsuarioAction } from './BanearUsuarioAction'
import { EliminarUsuarioAction } from './EliminarUsuarioAction'
import { MensajeError } from '../shared/MensajeError'

export interface UsuariosPageProps {
  readonly httpClient: HttpClient
  readonly obtenerAdminActualId?: () => string | undefined
}

export const UsuariosPage: React.FC<UsuariosPageProps> = ({ httpClient, obtenerAdminActualId }) => {
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  return (
    <section>
      <h1>Usuarios</h1>

      {mensajeError !== null && <MensajeError mensaje={mensajeError} />}

      <UsuariosTable
        httpClient={httpClient}
        obtenerAdminActualId={obtenerAdminActualId}
        renderAcciones={(usuario, recargar) => (
          <>
            <BanearUsuarioAction
              usuario={usuario}
              httpClient={httpClient}
              obtenerAdminActualId={obtenerAdminActualId}
              onBaneado={recargar}
              onError={setMensajeError}
            />
            <EliminarUsuarioAction
              usuario={usuario}
              httpClient={httpClient}
              obtenerAdminActualId={obtenerAdminActualId}
              onEliminado={recargar}
              onError={setMensajeError}
            />
          </>
        )}
      />
    </section>
  )
}

