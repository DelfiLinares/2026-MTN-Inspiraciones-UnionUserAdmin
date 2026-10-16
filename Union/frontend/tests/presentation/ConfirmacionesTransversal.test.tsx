/**
 * Test transversal: auditoría de uso consistente de `ConfirmDialog` en las 7 acciones sensibles.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T069, depende de T038, T046, T059, T067)
 * - Union/specs/002-frontend-admin/spec.md RF-22, RF-23, RNF-03, RNF-06, reglas de negocio
 *   críticas 6 de §6.
 * - Clarifications Session 2026-10-05 (excepción documentada para "Aceptar reporte" simple,
 *   AC-07.3): `Reporte.requiereConfirmacionParaAceptar()` siempre devuelve `false`.
 *
 * Cobertura:
 * - De las 7 acciones sensibles del módulo (banear, eliminar, promover usuario; editar, eliminar
 *   publicación; aceptar, rechazar reporte), las 6 que SÍ requieren confirmación explícita
 *   (`BanearUsuarioAction`, `EliminarUsuarioAction`, `PromoverUsuarioAction`,
 *   `EditarPublicacionForm`, `EliminarPublicacionAction`, `RechazarReporteAction`) muestran un
 *   `ConfirmDialog` (`role="dialog"`) tras interactuar con el disparador, y la acción de red
 *   subyacente (`httpClient.*`) NO se invoca hasta confirmar el diálogo.
 * - `AceptarReporteAction` es la única excepción documentada (AC-07.3): invoca la acción
 *   directamente al hacer click, sin mostrar ningún `ConfirmDialog`.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { BanearUsuarioAction } from '../../src/presentation/usuarios/BanearUsuarioAction'
import { EliminarUsuarioAction } from '../../src/presentation/usuarios/EliminarUsuarioAction'
import { PromoverUsuarioAction } from '../../src/presentation/promocion/PromoverUsuarioAction'
import { EditarPublicacionForm } from '../../src/presentation/publicaciones/EditarPublicacionForm'
import { EliminarPublicacionAction } from '../../src/presentation/publicaciones/EliminarPublicacionAction'
import { AceptarReporteAction } from '../../src/presentation/reportes/AceptarReporteAction'
import { RechazarReporteAction } from '../../src/presentation/reportes/RechazarReporteAction'

import { UsuarioAdmin } from '../../src/domain/UsuarioAdmin'
import { PublicacionModeracion } from '../../src/domain/PublicacionModeracion'
import { Reporte } from '../../src/domain/Reporte'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'

function crearHttpClientMock(): HttpClient {
  return {
    get: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    post: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  }
}

const usuarioUser = new UsuarioAdmin({
  id: 'usr-1',
  nombre: 'Usuario Común',
  mail: 'usuario@common.com',
  rol: 'USER' as never,
  estadoCuenta: 'ACTIVO' as never,
})

const publicacionActiva = new PublicacionModeracion({
  id: 'pub-1',
  autorId: 'autor-1',
  estado: 'ACTIVA' as never,
  cantidadReportes: 0,
  motivosReporte: [],
})

const reportePendiente = new Reporte({
  id: 'rep-1',
  publicacionId: 'pub-1',
  motivo: 'SPAM' as never,
  reportanteId: 'usr-reportante',
  fecha: '2026-09-20T10:00:00.000Z',
  estado: 'PENDIENTE' as never,
})

describe('Auditoría transversal de confirmación explícita en acciones sensibles (T069)', () => {
  it('BanearUsuarioAction: muestra ConfirmDialog y no banea hasta confirmar', async () => {
    const httpClient = crearHttpClientMock()
    render(<BanearUsuarioAction usuario={usuarioUser} httpClient={httpClient} />)

    fireEvent.click(screen.getByRole('button', { name: 'Banear' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(httpClient.patch).not.toHaveBeenCalled()
    expect(httpClient.post).not.toHaveBeenCalled()
  })

  it('EliminarUsuarioAction: muestra ConfirmDialog y no elimina hasta confirmar', async () => {
    const httpClient = crearHttpClientMock()
    render(<EliminarUsuarioAction usuario={usuarioUser} httpClient={httpClient} />)

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(httpClient.delete).not.toHaveBeenCalled()
  })

  it('PromoverUsuarioAction: muestra ConfirmDialog y no promueve hasta confirmar', async () => {
    const httpClient = crearHttpClientMock()
    render(<PromoverUsuarioAction usuario={usuarioUser} httpClient={httpClient} />)

    fireEvent.click(screen.getByRole('button', { name: 'Promover a administrador' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(httpClient.post).not.toHaveBeenCalled()
    expect(httpClient.patch).not.toHaveBeenCalled()
  })

  it('EditarPublicacionForm: muestra ConfirmDialog al enviar y no guarda hasta confirmar', async () => {
    const httpClient = crearHttpClientMock()
    render(
      <EditarPublicacionForm
        publicacion={publicacionActiva}
        contenidoInicial="contenido original"
        httpClient={httpClient}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(httpClient.patch).not.toHaveBeenCalled()
  })

  it('EliminarPublicacionAction: muestra ConfirmDialog y no elimina hasta confirmar', async () => {
    const httpClient = crearHttpClientMock()
    render(<EliminarPublicacionAction publicacion={publicacionActiva} httpClient={httpClient} />)

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(httpClient.delete).not.toHaveBeenCalled()
  })

  it('RechazarReporteAction: muestra ConfirmDialog y no rechaza hasta confirmar', async () => {
    const httpClient = crearHttpClientMock()
    render(<RechazarReporteAction reporte={reportePendiente} httpClient={httpClient} />)

    fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(httpClient.patch).not.toHaveBeenCalled()
    expect(httpClient.post).not.toHaveBeenCalled()
  })

  it('AceptarReporteAction (excepción AC-07.3): NO muestra ConfirmDialog, invoca la acción directamente', async () => {
    const httpClient = crearHttpClientMock()
    render(<AceptarReporteAction reporte={reportePendiente} httpClient={httpClient} />)

    fireEvent.click(screen.getByRole('button', { name: 'Aceptar' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(httpClient.post).toHaveBeenCalled())
  })
})
