/**
 * Validación del Escenario 9 de `quickstart.md` (HU-09 — exportar reportes) — T080.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T080, depende de T059, T073)
 * - Union/specs/002-frontend-admin/quickstart.md → Escenario 9
 * - Union/specs/002-frontend-admin/spec.md AC-09.1, AC-09.2, AC-09.3, AC-09.4, CB-05
 *
 * Nota: ver cabecera de `Escenario1BanearUsuario.test.tsx` (T074) para la justificación de
 * ejecutar mecánicamente los escenarios MANUALES de `quickstart.md` como tests repetibles, usando
 * los fixtures de T073 (`tests/fixtures/reportes.fixtures.ts`).
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { ReportesPage } from '../../src/presentation/reportes/ReportesPage'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'
import { REPORTE_PENDIENTE_FIXTURE } from '../fixtures/reportes.fixtures'

function crearHttpClientMockConExportacion(postImpl: (path: string, body?: unknown) => Promise<unknown>): HttpClient {
  const get = vi.fn().mockImplementation((path: string) => {
    if (path === '/reportes') {
      return Promise.resolve({ items: [REPORTE_PENDIENTE_FIXTURE], total: 1 })
    }
    return Promise.resolve(REPORTE_PENDIENTE_FIXTURE)
  })

  return {
    get,
    post: vi.fn().mockImplementation(postImpl),
    patch: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  }
}

describe('Escenario 9 de quickstart.md — Exportar reportes (T080)', () => {
  it('pasos 1-3: exportar respeta el filtro activo, muestra un estado de carga no bloqueante y ofrece una descarga al finalizar (AC-09.1, AC-09.2, AC-09.3)', async () => {
    let resolverExportacion: (value: unknown) => void = () => {}
    const promesaExportacion = new Promise((resolve) => {
      resolverExportacion = resolve
    })

    const httpClient = crearHttpClientMockConExportacion((path) => {
      if (path === '/reportes/exportar') {
        return promesaExportacion as Promise<unknown>
      }
      return Promise.resolve({})
    })

    render(<ReportesPage httpClient={httpClient} />)

    // Paso 1: aplicar un filtro (prioridad ALTA) en la misma pantalla antes de exportar.
    const selectPrioridad = await screen.findByLabelText('Prioridad')
    fireEvent.change(selectPrioridad, { target: { value: 'ALTA' } })

    // Paso 2: hacer clic en "Exportar" dentro de la misma pantalla, respetando el filtro activo.
    const botonExportar = screen.getByRole('button', { name: 'Exportar' })
    fireEvent.click(botonExportar)

    // Resultado esperado: se invoca el endpoint de exportación con el filtro activo (AC-09.1).
    await waitFor(() => {
      expect(httpClient.post).toHaveBeenCalledWith(
        '/reportes/exportar',
        expect.objectContaining({ prioridad: 'ALTA' })
      )
    })

    // Resultado esperado: se muestra un estado de carga sin bloquear el resto de la interfaz
    // (AC-09.2): el botón pasa a "Exportando…" pero el resto de la pantalla (filtros, tabla) sigue
    // presente e interactuable.
    expect(screen.getByRole('button', { name: 'Exportando…' })).toBeInTheDocument()
    expect(screen.getByLabelText('Prioridad')).toBeInTheDocument()

    // Finaliza la exportación exitosamente.
    resolverExportacion({ urlDescarga: 'https://descargas.ejemplo/reportes-export.csv' })

    // Resultado esperado: al finalizar, se ofrece una acción de descarga (AC-09.3).
    const enlaceDescarga = await screen.findByRole('link', { name: 'Descargar archivo exportado' })
    expect(enlaceDescarga).toHaveAttribute('href', 'https://descargas.ejemplo/reportes-export.csv')

    // El botón vuelve a su estado habilitado "Exportar" (ya no bloquea la interfaz).
    expect(screen.getByRole('button', { name: 'Exportar' })).not.toBeDisabled()
  })

  it('pasos 4-5: si falla la generación del archivo, se muestra un mensaje de error claro (AC-09.4, CB-05)', async () => {
    const httpClient = crearHttpClientMockConExportacion((path) => {
      if (path === '/reportes/exportar') {
        return Promise.reject(new Error('Error: Reporte no generado.'))
      }
      return Promise.resolve({})
    })

    render(<ReportesPage httpClient={httpClient} />)

    const botonExportar = await screen.findByRole('button', { name: 'Exportar' })
    fireEvent.click(botonExportar)

    // Resultado esperado: se muestra un mensaje de error claro, de forma no bloqueante (AC-09.4,
    // CB-05): ReportesPage sigue montado y operable (no se desmonta ni se navega fuera de la
    // pantalla).
    expect(await screen.findByText('Error: Reporte no generado.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Descargar archivo exportado' })).not.toBeInTheDocument()
  })
})
