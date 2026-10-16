/**
 * `PromocionPage`: Página contenedora de la pantalla de promoción de usuarios a rol ADMIN.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T030; T067, depende de T034a, T066, T027)
 * - Union/specs/002-frontend-admin/plan.md §Project Structure
 *   (`src/presentation/promocion/` → "Pantalla: promoción de usuarios a ADMIN")
 * - Union/specs/002-frontend-admin/spec.md AC-03.6
 *
 * Responsabilidades:
 * - Reutiliza `UsuariosTable` (T035) como selector/búsqueda de usuarios, filtrando server-side
 *   únicamente usuarios con rol `USER` (candidatos a promoción) mediante la prop `rolFiltro`
 *   (T067, extensión agregada a `UsuariosTable`), en lugar de crear una variante de tabla separada.
 * - Cablea `PromoverUsuarioAction` (T066) mediante la prop `renderAcciones` (mismo patrón que
 *   `UsuariosPage`/`PublicacionesPage`/`ReportesPage`, T038/T046/T059).
 * - Maneja el error no bloqueante de la acción vía `MensajeError` (T027), conforme a AC-03.6: un
 *   fallo al promover se informa sin bloquear ni reiniciar toda la pantalla.
 *
 * Nota sobre el `HttpClient`: al igual que las demás páginas del módulo, recibe `httpClient` como
 * prop (inyección de dependencias), ya que este módulo aún no cuenta con una implementación
 * concreta del puerto `HttpClient` (T031 solo define la interfaz).
 */

import React, { useState } from 'react'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import { UsuariosTable } from '../usuarios/UsuariosTable'
import { PromoverUsuarioAction } from './PromoverUsuarioAction'
import { MensajeError } from '../shared/MensajeError'
import { RolUsuarioAdmin as RolUsuario } from '../../domain/enums/RolUsuarioAdmin'

export interface PromocionPageProps {
  readonly httpClient: HttpClient
  readonly obtenerRolActorActual?: () => string | undefined
}

export const PromocionPage: React.FC<PromocionPageProps> = ({ httpClient, obtenerRolActorActual }) => {
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  return (
    <section>
      <h1>Promoción</h1>

      {mensajeError !== null && <MensajeError mensaje={mensajeError} />}

      <UsuariosTable
        httpClient={httpClient}
        rolFiltro={RolUsuario.USER}
        renderAcciones={(usuario, recargar) => (
          <PromoverUsuarioAction
            usuario={usuario}
            httpClient={httpClient}
            obtenerRolActorActual={obtenerRolActorActual}
            onPromovido={recargar}
            onError={setMensajeError}
          />
        )}
      />
    </section>
  )
}

