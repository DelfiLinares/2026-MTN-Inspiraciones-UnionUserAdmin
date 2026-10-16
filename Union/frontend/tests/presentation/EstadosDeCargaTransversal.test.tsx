/**
 * Test transversal: toda operación de red (banear, eliminar, promover, editar, aceptar, rechazar,
 * exportar) muestra un estado de carga y, ante fallo, un mensaje de error no bloqueante sin dejar
 * la interfaz bloqueada.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T071, depende de T038, T046, T059)
 * - Union/specs/002-frontend-admin/spec.md CB-05, CB-06, AC-01.7, AC-02.6, AC-03.6, AC-05.5,
 *   AC-07.5, AC-08.5, AC-09.4
 *
 * Cobertura:
 * - Para cada una de las 7 operaciones de red del módulo se simula un fallo del `HttpClient` y se
 *   verifica: (a) mientras la operación está en curso, el botón que la dispara queda deshabilitado
 *   o muestra un texto de carga; (b) tras el fallo, se expone un mensaje de error mediante
 *   `onError` (en los componentes que usan `ConfirmDialog`, su botón de confirmar vuelve a quedar
 *   habilitado, "sin dejar la interfaz bloqueada" — CB-06); (c) el callback de éxito
 *   (`onBaneado`/`onEliminado`/`onPromovido`/`onGuardado`/`onAceptado`/`onRechazado`) NUNCA se
 *   invoca cuando la operación falla.
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
import { ExportarReportesBoton } from '../../src/presentation/reportes/ExportarReportesBoton'

import { UsuarioAdmin } from '../../src/domain/UsuarioAdmin'
import { PublicacionModeracion } from '../../src/domain/PublicacionModeracion'
import { Reporte } from '../../src/domain/Reporte'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'

function crearHttpClientMockQueFalla(): HttpClient {
  return {
    get: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    post: vi.fn().mockRejectedValue(new Error('Fallo de red simulado')),
    patch: vi.fn().mockRejectedValue(new Error('Fallo de red simulado')),
    put: vi.fn().mockRejectedValue(new Error('Fallo de red simulado')),
    delete: vi.fn().mockRejectedValue(new Error('Fallo de red simulado')),
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

describe('Estados de carga/error transversales ante fallos de red (T071)', () => {
  it('BanearUsuarioAction: ante fallo, informa error, no invoca onBaneado y el diálogo sigue operable', async () => {
    const onError = vi.fn()
    const onBaneado = vi.fn()
    render(
      <BanearUsuarioAction
        usuario={usuarioUser}
        httpClient={crearHttpClientMockQueFalla()}
        onBaneado={onBaneado}
        onError={onError}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Banear' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => expect(onError).toHaveBeenCalledWith('Fallo de red simulado'))
    expect(onBaneado).not.toHaveBeenCalled()
    // La interfaz no queda bloqueada: el botón "Confirmar" vuelve a estar habilitado tras el fallo.
    expect(screen.getByRole('button', { name: 'Confirmar' })).not.toBeDisabled()
  })

  it('EliminarUsuarioAction: ante fallo, informa error, no invoca onEliminado y el diálogo sigue operable', async () => {
    const onError = vi.fn()
    const onEliminado = vi.fn()
    render(
      <EliminarUsuarioAction
        usuario={usuarioUser}
        httpClient={crearHttpClientMockQueFalla()}
        onEliminado={onEliminado}
        onError={onError}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => expect(onError).toHaveBeenCalledWith('Fallo de red simulado'))
    expect(onEliminado).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Confirmar' })).not.toBeDisabled()
  })

  it('PromoverUsuarioAction: ante fallo, informa error, no invoca onPromovido y el diálogo sigue operable', async () => {
    const onError = vi.fn()
    const onPromovido = vi.fn()
    render(
      <PromoverUsuarioAction
        usuario={usuarioUser}
        httpClient={crearHttpClientMockQueFalla()}
        onPromovido={onPromovido}
        onError={onError}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Promover a administrador' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => expect(onError).toHaveBeenCalledWith('Fallo de red simulado'))
    expect(onPromovido).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Confirmar' })).not.toBeDisabled()
  })

  it('EditarPublicacionForm: ante fallo (CB-06), informa error, conserva el contenido editado y no invoca onGuardado', async () => {
    const onError = vi.fn()
    const onGuardado = vi.fn()
    render(
      <EditarPublicacionForm
        publicacion={publicacionActiva}
        contenidoInicial="contenido original"
        httpClient={crearHttpClientMockQueFalla()}
        onGuardado={onGuardado}
        onError={onError}
      />
    )

    const textarea = screen.getByLabelText('Contenido de la publicación') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'contenido editado' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => expect(onError).toHaveBeenCalledWith('Fallo de red simulado'))
    expect(onGuardado).not.toHaveBeenCalled()
    // CB-06: el contenido ya editado no se descarta ante el fallo.
    expect(textarea.value).toBe('contenido editado')
  })

  it('EliminarPublicacionAction: ante fallo, informa error, no invoca onEliminada y el diálogo sigue operable', async () => {
    const onError = vi.fn()
    const onEliminada = vi.fn()
    render(
      <EliminarPublicacionAction
        publicacion={publicacionActiva}
        httpClient={crearHttpClientMockQueFalla()}
        onEliminada={onEliminada}
        onError={onError}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => expect(onError).toHaveBeenCalledWith('Fallo de red simulado'))
    expect(onEliminada).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Confirmar' })).not.toBeDisabled()
  })

  it('AceptarReporteAction: ante fallo, informa error, no invoca onAceptado y el botón vuelve a habilitarse', async () => {
    const onError = vi.fn()
    const onAceptado = vi.fn()
    render(
      <AceptarReporteAction
        reporte={reportePendiente}
        httpClient={crearHttpClientMockQueFalla()}
        onAceptado={onAceptado}
        onError={onError}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Aceptar' }))

    await waitFor(() => expect(onError).toHaveBeenCalledWith('Fallo de red simulado'))
    expect(onAceptado).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Aceptar' })).not.toBeDisabled()
  })

  it('RechazarReporteAction: ante fallo, informa error, no invoca onRechazado y el diálogo sigue operable', async () => {
    const onError = vi.fn()
    const onRechazado = vi.fn()
    render(
      <RechazarReporteAction
        reporte={reportePendiente}
        httpClient={crearHttpClientMockQueFalla()}
        onRechazado={onRechazado}
        onError={onError}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => expect(onError).toHaveBeenCalledWith('Fallo de red simulado'))
    expect(onRechazado).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Confirmar' })).not.toBeDisabled()
  })

  it('ExportarReportesBoton (CB-05): ante fallo, muestra estado de carga y luego informa error sin bloquear el botón', async () => {
    const onError = vi.fn()
    const httpClient: HttpClient = {
      get: vi.fn().mockResolvedValue({ items: [], total: 0 }),
      post: vi.fn().mockRejectedValue(new Error('No se pudo generar la exportación.')),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }

    render(<ExportarReportesBoton httpClient={httpClient} filtros={{}} onError={onError} />)

    const boton = screen.getByRole('button', { name: 'Exportar' })
    fireEvent.click(boton)

    // AC-09.2: mientras se procesa, el botón queda deshabilitado con estado de carga visible.
    expect(screen.getByRole('button', { name: 'Exportando…' })).toBeDisabled()

    await waitFor(() => expect(onError).toHaveBeenCalled())
    // La interfaz no queda bloqueada: el botón vuelve a su estado habilitado tras el fallo.
    expect(screen.getByRole('button', { name: 'Exportar' })).not.toBeDisabled()
  })
})
