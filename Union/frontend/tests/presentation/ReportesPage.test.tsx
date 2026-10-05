/**
 * Test de componente: reportes en estado `RESUELTO`/`DESESTIMADO` muestran "Aceptar"/"Rechazar"
 * deshabilitados de forma permanente.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T062, depende de T059)
 * - Union/specs/002-frontend-admin/spec.md AC-07.4, AC-08.4, CB-03
 *
 * Cobertura:
 * - AC-07.4/AC-08.4: un reporte en estado `RESUELTO` o `DESESTIMADO` no puede volver a aceptarse ni
 *   rechazarse; las acciones quedan deshabilitadas de forma permanente para ese reporte.
 * - CB-03: intento de aceptar/rechazar un reporte ya en estado final; se verifica que los botones
 *   estén deshabilitados en la UI, cubriendo el gating visual descripto en `spec.md`.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ReportesPage } from '../../src/presentation/reportes/ReportesPage'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'

function crearHttpClientMockConReportes(items: unknown[]): HttpClient {
  return {
    get: vi.fn().mockResolvedValue({ items, total: items.length }),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}

describe('ReportesPage — gating permanente de Aceptar/Rechazar en estados finales (T062)', () => {
  it('muestra "Aceptar" y "Rechazar" deshabilitados para reportes RESUELTO y DESESTIMADO', async () => {
    const httpClient = crearHttpClientMockConReportes([
      {
        id: 'rep-resuelto',
        publicacionId: 'pub-1',
        motivo: 'SPAM',
        reportanteId: 'usr-reportante-1',
        fecha: '2026-09-20T10:00:00.000Z',
        estado: 'RESUELTO',
        prioridad: 'MEDIA',
      },
      {
        id: 'rep-desestimado',
        publicacionId: 'pub-2',
        motivo: 'VIOLENCIA',
        reportanteId: 'usr-reportante-2',
        fecha: '2026-09-21T10:00:00.000Z',
        estado: 'DESESTIMADO',
        prioridad: 'ALTA',
      },
    ])

    render(<ReportesPage httpClient={httpClient} />)

    await waitFor(() => {
      expect(screen.getByText('rep-resuelto')).toBeInTheDocument()
      expect(screen.getByText('rep-desestimado')).toBeInTheDocument()
    })

    const botonesAceptar = screen.getAllByRole('button', { name: 'Aceptar' })
    const botonesRechazar = screen.getAllByRole('button', { name: 'Rechazar' })

    expect(botonesAceptar).toHaveLength(2)
    expect(botonesRechazar).toHaveLength(2)

    for (const boton of botonesAceptar) {
      expect(boton).toBeDisabled()
    }
    for (const boton of botonesRechazar) {
      expect(boton).toBeDisabled()
    }
  })

  it('muestra "Aceptar" y "Rechazar" habilitados para reportes PENDIENTE y EN_REVISION', async () => {
    const httpClient = crearHttpClientMockConReportes([
      {
        id: 'rep-pendiente',
        publicacionId: 'pub-3',
        motivo: 'SPAM',
        reportanteId: 'usr-reportante-3',
        fecha: '2026-09-22T10:00:00.000Z',
        estado: 'PENDIENTE',
        prioridad: 'BAJA',
      },
      {
        id: 'rep-en-revision',
        publicacionId: 'pub-4',
        motivo: 'OTRO',
        reportanteId: 'usr-reportante-4',
        fecha: '2026-09-23T10:00:00.000Z',
        estado: 'EN_REVISION',
        prioridad: 'MEDIA',
      },
    ])

    render(<ReportesPage httpClient={httpClient} />)

    await waitFor(() => {
      expect(screen.getByText('rep-pendiente')).toBeInTheDocument()
      expect(screen.getByText('rep-en-revision')).toBeInTheDocument()
    })

    const botonesAceptar = screen.getAllByRole('button', { name: 'Aceptar' })
    const botonesRechazar = screen.getAllByRole('button', { name: 'Rechazar' })

    expect(botonesAceptar).toHaveLength(2)
    expect(botonesRechazar).toHaveLength(2)

    for (const boton of botonesAceptar) {
      expect(boton).toBeEnabled()
    }
    for (const boton of botonesRechazar) {
      expect(boton).toBeEnabled()
    }
  })
})
