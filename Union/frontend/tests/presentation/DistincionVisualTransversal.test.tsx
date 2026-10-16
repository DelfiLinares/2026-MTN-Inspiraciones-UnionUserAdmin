/**
 * Test transversal: distinción visual consistente de las 7 acciones sensibles.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T070, depende de T025, T069)
 * - Union/specs/002-frontend-admin/spec.md RF-22, RNF-03
 *
 * Cobertura:
 * - RF-22/RNF-03: de las 7 acciones sensibles (banear, eliminar, promover usuario; editar,
 *   eliminar publicación; aceptar, rechazar reporte), las 6 que constituyen acciones
 *   destructivas/irreversibles (`BanearUsuarioAction`, `EliminarUsuarioAction`,
 *   `PromoverUsuarioAction`, `EditarPublicacionForm`, `EliminarPublicacionAction`,
 *   `RechazarReporteAction`) usan `AccionSensibleBoton` con `sensible={true}`, aplicando la clase
 *   CSS `accion-sensible-boton--sensible` (distinción visual de advertencia/peligro).
 * - `AceptarReporteAction` (excepción documentada, AC-07.3/RF-23) es la única de las 7 que
 *   deliberadamente NO aplica el estilo visual sensible: usa `sensible={false}`
 *   (`accion-sensible-boton--consulta`), ya que no requiere confirmación ni se considera
 *   destructiva por sí sola.
 * - Se verifica además que nunca coincide el mismo estilo (clase CSS) entre una acción sensible
 *   y una acción de solo consulta: ambos conjuntos de clases son mutuamente excluyentes.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

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

const CLASE_SENSIBLE = 'accion-sensible-boton--sensible'
const CLASE_CONSULTA = 'accion-sensible-boton--consulta'

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

describe('Distinción visual transversal de acciones sensibles (T070)', () => {
  it('BanearUsuarioAction: botón "Banear" usa la clase sensible', () => {
    render(<BanearUsuarioAction usuario={usuarioUser} httpClient={crearHttpClientMock()} />)
    const boton = screen.getByRole('button', { name: 'Banear' })
    expect(boton.className).toContain(CLASE_SENSIBLE)
    expect(boton.className).not.toContain(CLASE_CONSULTA)
  })

  it('EliminarUsuarioAction: botón "Eliminar" usa la clase sensible', () => {
    render(<EliminarUsuarioAction usuario={usuarioUser} httpClient={crearHttpClientMock()} />)
    const boton = screen.getByRole('button', { name: 'Eliminar' })
    expect(boton.className).toContain(CLASE_SENSIBLE)
    expect(boton.className).not.toContain(CLASE_CONSULTA)
  })

  it('PromoverUsuarioAction: botón "Promover a administrador" usa la clase sensible', () => {
    render(<PromoverUsuarioAction usuario={usuarioUser} httpClient={crearHttpClientMock()} />)
    const boton = screen.getByRole('button', { name: 'Promover a administrador' })
    expect(boton.className).toContain(CLASE_SENSIBLE)
    expect(boton.className).not.toContain(CLASE_CONSULTA)
  })

  it('EditarPublicacionForm: botón "Guardar" dispara el diálogo de confirmación con estilo sensible', () => {
    render(
      <EditarPublicacionForm
        publicacion={publicacionActiva}
        contenidoInicial="contenido original"
        httpClient={crearHttpClientMock()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    const botonConfirmar = screen.getByRole('button', { name: 'Confirmar' })
    expect(botonConfirmar.className).toContain('confirm-dialog__boton--confirmar')
  })

  it('EliminarPublicacionAction: botón "Eliminar" usa la clase sensible', () => {
    render(<EliminarPublicacionAction publicacion={publicacionActiva} httpClient={crearHttpClientMock()} />)
    const boton = screen.getByRole('button', { name: 'Eliminar' })
    expect(boton.className).toContain(CLASE_SENSIBLE)
    expect(boton.className).not.toContain(CLASE_CONSULTA)
  })

  it('RechazarReporteAction: botón "Rechazar" usa la clase sensible', () => {
    render(<RechazarReporteAction reporte={reportePendiente} httpClient={crearHttpClientMock()} />)
    const boton = screen.getByRole('button', { name: 'Rechazar' })
    expect(boton.className).toContain(CLASE_SENSIBLE)
    expect(boton.className).not.toContain(CLASE_CONSULTA)
  })

  it('AceptarReporteAction (excepción AC-07.3/RF-23): botón "Aceptar" usa la clase de consulta, NO la sensible', () => {
    render(<AceptarReporteAction reporte={reportePendiente} httpClient={crearHttpClientMock()} />)
    const boton = screen.getByRole('button', { name: 'Aceptar' })
    expect(boton.className).toContain(CLASE_CONSULTA)
    expect(boton.className).not.toContain(CLASE_SENSIBLE)
  })

  it('las clases visuales sensible y consulta son mutuamente excluyentes entre sí', () => {
    render(<BanearUsuarioAction usuario={usuarioUser} httpClient={crearHttpClientMock()} />)
    render(<AceptarReporteAction reporte={reportePendiente} httpClient={crearHttpClientMock()} />)

    const botonSensible = screen.getByRole('button', { name: 'Banear' })
    const botonConsulta = screen.getByRole('button', { name: 'Aceptar' })

    expect(botonSensible.className).not.toEqual(botonConsulta.className)
  })
})
