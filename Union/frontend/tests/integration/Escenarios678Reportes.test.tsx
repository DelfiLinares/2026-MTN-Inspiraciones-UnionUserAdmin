/**
 * Validación de los Escenarios 6, 7 y 8 de `quickstart.md` (HU-06/HU-07/HU-08 — ver, aceptar y
 * rechazar reportes) — T079.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T079, depende de T059, T073)
 * - Union/specs/002-frontend-admin/quickstart.md → Escenarios 6, 7 y 8
 * - Union/specs/002-frontend-admin/spec.md AC-06.1 a AC-06.4, AC-07.2 a AC-07.4, AC-08.2 a AC-08.6
 *
 * Nota: ver cabecera de `Escenario1BanearUsuario.test.tsx` (T074) para la justificación de
 * ejecutar mecánicamente los escenarios MANUALES de `quickstart.md` como tests repetibles,
 * usando los fixtures de T073 (`tests/fixtures/reportes.fixtures.ts`).
 *
 * Observaciones de validación (documentadas también en `docs/validacion-manual.md`):
 * - Escenario 6, paso 4 (AC-06.3): `ReportesTable` muestra el estado de moderación como texto
 *   plano en la columna "Estado de moderación" (sin `EstadoModeracionBadge`); el resaltado visual
 *   de `PENDIENTE` mediante `EstadoModeracionBadge` solo está integrado en `ReporteDetalle` (T056),
 *   no en el listado (`ReportesTable`, T053). Se deja constancia de esta observación sin modificar
 *   código de producción, por ser este un documento/test de validación (T079), no de
 *   implementación.
 * - Escenario 7, paso 5 (eliminar la publicación asociada en el mismo flujo): esa acción es
 *   independiente (`EliminarPublicacionAction`) y ya fue validada exhaustivamente en el
 *   Escenario 5 (T078, `Escenario5EliminarPublicacion.test.tsx`); no se duplica aquí.
 * - Escenario 8, paso 4 (reflejo de la reactivación de la publicación en la pantalla de Gestión de
 *   Publicaciones): `ReportesPage.tsx` no pasa la prop `publicacionAsociada` a
 *   `RechazarReporteAction`, por lo que `PublicacionModeracion.reactivarSiNoQuedanReportesPendientes()`
 *   no se invoca mecánicamente desde esta pantalla ni se refleja en `PublicacionesPage` (páginas
 *   independientes, sin estado compartido). La regla de negocio en sí (AC-08.6) ya está cubierta a
 *   nivel de servicio por `ReportesService.test.ts` (T050d) y `PublicacionModeracion.test.ts`
 *   (T062b); se deja constancia de esta observación sin modificar código de producción.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'

import { ReportesPage } from '../../src/presentation/reportes/ReportesPage'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'
import { EstadoModeracion } from '../../src/domain/enums/EstadoModeracion'
import { PrioridadReporte } from '../../src/domain/enums/PrioridadReporte'
import {
  REPORTE_PENDIENTE_FIXTURE,
  REPORTE_EN_REVISION_FIXTURE,
  REPORTE_FINAL_RESUELTO_FIXTURE,
} from '../fixtures/reportes.fixtures'

function crearHttpClientMockDeReportes(listaInicial: unknown[]): HttpClient {
  const get = vi.fn().mockImplementation((path: string) => {
    if (path === '/reportes') {
      return Promise.resolve({ items: listaInicial, total: listaInicial.length })
    }
    // GET /reportes/{reporteId}: detalle de un reporte específico.
    const reporteId = path.split('/').pop()
    const encontrado = listaInicial.find((r) => (r as { id: string }).id === reporteId)
    return Promise.resolve(encontrado)
  })

  return {
    get,
    post: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  }
}

describe('Escenario 6 de quickstart.md — Ver reportes pendientes de revisión (T079)', () => {
  it('pasos 1-3: el listado muestra motivo/prioridad/estado y permite filtrar por estado y prioridad (AC-06.1, AC-06.2)', async () => {
    const httpClient = crearHttpClientMockDeReportes([
      REPORTE_PENDIENTE_FIXTURE,
      REPORTE_EN_REVISION_FIXTURE,
      REPORTE_FINAL_RESUELTO_FIXTURE,
    ])

    // Paso 1: ir a la pantalla de Revisión de Reportes.
    render(<ReportesPage httpClient={httpClient} />)

    // Paso 2 (AC-06.1): el listado muestra motivo, prioridad y estado de cada reporte.
    await waitFor(() => expect(screen.getByText(REPORTE_PENDIENTE_FIXTURE.id)).toBeInTheDocument())
    const filaPendiente = screen.getByText(REPORTE_PENDIENTE_FIXTURE.id).closest('tr') as HTMLElement
    expect(within(filaPendiente).getByText(REPORTE_PENDIENTE_FIXTURE.motivo)).toBeInTheDocument()
    expect(
      within(filaPendiente).getByText(REPORTE_PENDIENTE_FIXTURE.prioridad as string)
    ).toBeInTheDocument()
    expect(within(filaPendiente).getByText(EstadoModeracion.PENDIENTE)).toBeInTheDocument()

    // Paso 3 (AC-06.2): aplicar un filtro por estado PENDIENTE.
    fireEvent.change(screen.getByLabelText('Filtrar por estado de moderación'), {
      target: { value: EstadoModeracion.PENDIENTE },
    })
    await waitFor(() => {
      const ultimaLlamada = vi.mocked(httpClient.get).mock.calls.at(-1)
      expect(ultimaLlamada?.[1]).toMatchObject({
        params: expect.objectContaining({ estadoModeracion: EstadoModeracion.PENDIENTE }),
      })
    })

    // Aplicar, por separado, un filtro por prioridad ALTA (AC-06.2).
    fireEvent.change(screen.getByLabelText('Filtrar por estado de moderación'), {
      target: { value: '' },
    })
    fireEvent.change(screen.getByLabelText('Filtrar por prioridad'), {
      target: { value: PrioridadReporte.ALTA },
    })
    await waitFor(() => {
      const ultimaLlamada = vi.mocked(httpClient.get).mock.calls.at(-1)
      expect(ultimaLlamada?.[1]).toMatchObject({
        params: expect.objectContaining({ prioridad: PrioridadReporte.ALTA }),
      })
    })
  })

  it('pasos 5-6: el detalle de un reporte muestra motivo, prioridad, estado y la publicación/usuario asociado (AC-06.4)', async () => {
    const httpClient = crearHttpClientMockDeReportes([REPORTE_PENDIENTE_FIXTURE])

    render(<ReportesPage httpClient={httpClient} />)

    await waitFor(() => expect(screen.getByText(REPORTE_PENDIENTE_FIXTURE.id)).toBeInTheDocument())

    // Paso 5: abrir el detalle del reporte.
    fireEvent.click(screen.getByRole('button', { name: 'Ver detalle' }))

    // Paso 6 (resultado esperado, AC-06.4).
    const detalle = await screen.findByLabelText('Detalle del reporte')
    expect(within(detalle).getByText(REPORTE_PENDIENTE_FIXTURE.motivo)).toBeInTheDocument()
    expect(within(detalle).getByText(REPORTE_PENDIENTE_FIXTURE.prioridad as string)).toBeInTheDocument()
    expect(within(detalle).getByText(EstadoModeracion.PENDIENTE)).toBeInTheDocument()
    expect(within(detalle).getByText(REPORTE_PENDIENTE_FIXTURE.publicacionId)).toBeInTheDocument()
    expect(within(detalle).getByText(REPORTE_PENDIENTE_FIXTURE.reportanteId)).toBeInTheDocument()
  })
})

describe('Escenario 7 de quickstart.md — Aceptar un reporte (T079)', () => {
  it('pasos 1-4: aceptar un reporte PENDIENTE se ejecuta sin diálogo de confirmación y deja Aceptar/Rechazar deshabilitados (AC-07.2, AC-07.3, AC-07.4, CB-03)', async () => {
    const httpClient = crearHttpClientMockDeReportes([REPORTE_PENDIENTE_FIXTURE])
    // Tras aceptar, la siguiente recarga del listado refleja el nuevo estado RESUELTO.
    vi.mocked(httpClient.get).mockImplementationOnce(() =>
      Promise.resolve({ items: [REPORTE_PENDIENTE_FIXTURE], total: 1 })
    )

    render(<ReportesPage httpClient={httpClient} />)

    // Paso 1: seleccionar un reporte en estado PENDIENTE o EN_REVISION.
    await waitFor(() => expect(screen.getByText(REPORTE_PENDIENTE_FIXTURE.id)).toBeInTheDocument())

    const filaReporte = screen.getByText(REPORTE_PENDIENTE_FIXTURE.id).closest('tr') as HTMLElement
    const botonAceptar = within(filaReporte).getByRole('button', { name: 'Aceptar' })

    // Preparar la recarga posterior a "Aceptar" para reflejar el nuevo estado RESUELTO.
    vi.mocked(httpClient.get).mockResolvedValueOnce({
      items: [{ ...REPORTE_PENDIENTE_FIXTURE, estado: EstadoModeracion.RESUELTO }],
      total: 1,
    })

    // Paso 2 (resultado esperado, AC-07.3): se ejecuta directamente, sin diálogo de confirmación.
    fireEvent.click(botonAceptar)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Paso 3 (resultado esperado, AC-07.2): se invoca la aceptación del reporte. El
    // `EstadoPublicacion` de la publicación asociada no cambia: `AceptarReporteAction` no recibe
    // ni manipula ninguna `PublicacionModeracion` (estructuralmente no puede modificarla).
    await waitFor(() => expect(httpClient.post).toHaveBeenCalled())

    // Paso 4 (resultado esperado, AC-07.4, CB-03): tras refrescar, Aceptar/Rechazar quedan
    // deshabilitados de forma permanente para este reporte.
    await waitFor(() => {
      const filaActualizada = screen.getByText(REPORTE_PENDIENTE_FIXTURE.id).closest('tr') as HTMLElement
      expect(within(filaActualizada).getByRole('button', { name: 'Aceptar' })).toBeDisabled()
      expect(within(filaActualizada).getByRole('button', { name: 'Rechazar' })).toBeDisabled()
    })
  })
})

describe('Escenario 8 de quickstart.md — Rechazar un reporte (T079)', () => {
  it('pasos 1-3 y 5: rechazar un reporte EN_REVISION requiere confirmación explícita y deja Aceptar/Rechazar deshabilitados (AC-08.2, AC-08.3, AC-08.4)', async () => {
    const httpClient = crearHttpClientMockDeReportes([REPORTE_EN_REVISION_FIXTURE])

    render(<ReportesPage httpClient={httpClient} />)

    // Paso 1: seleccionar un reporte en estado PENDIENTE o EN_REVISION.
    await waitFor(() =>
      expect(screen.getByText(REPORTE_EN_REVISION_FIXTURE.id)).toBeInTheDocument()
    )

    const filaReporte = screen.getByText(REPORTE_EN_REVISION_FIXTURE.id).closest('tr') as HTMLElement
    const botonRechazar = within(filaReporte).getByRole('button', { name: 'Rechazar' })

    // Preparar la recarga posterior a "Rechazar" para reflejar el nuevo estado DESESTIMADO.
    vi.mocked(httpClient.get).mockResolvedValueOnce({
      items: [{ ...REPORTE_EN_REVISION_FIXTURE, estado: EstadoModeracion.DESESTIMADO }],
      total: 1,
    })

    // Paso 2: iniciar la acción "Rechazar" y confirmar explícitamente (AC-08.3).
    fireEvent.click(botonRechazar)
    const botonConfirmar = await screen.findByRole('button', { name: 'Confirmar' })
    fireEvent.click(botonConfirmar)

    // Paso 3 (resultado esperado, AC-08.2): se invoca el rechazo del reporte.
    await waitFor(() => expect(httpClient.post).toHaveBeenCalled())

    // Paso 5 (resultado esperado, AC-08.4): tras refrescar, Aceptar/Rechazar quedan
    // deshabilitados para este reporte.
    await waitFor(() => {
      const filaActualizada = screen
        .getByText(REPORTE_EN_REVISION_FIXTURE.id)
        .closest('tr') as HTMLElement
      expect(within(filaActualizada).getByRole('button', { name: 'Aceptar' })).toBeDisabled()
      expect(within(filaActualizada).getByRole('button', { name: 'Rechazar' })).toBeDisabled()
    })
  })
})
