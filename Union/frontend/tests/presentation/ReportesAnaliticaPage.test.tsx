import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ReportesAnaliticaPage } from '../../src/presentation/reportes/ReportesAnaliticaPage'
import { ExportacionReporte } from '../../src/domain/ExportacionReporte'
import { obtenerAnaliticas, exportarReporteAnalitica } from '../../src/services/ReportesAnaliticaService'

vi.mock('../../src/services/ReportesAnaliticaService', () => ({
  obtenerAnaliticas: vi.fn(),
  exportarReporteAnalitica: vi.fn(),
  MENSAJE_ERROR_REPORTE_NO_GENERADO: 'Error: Reporte no generado.',
}))

const datos = {
  totalReportes: 12,
  reportesPorEstado: { PENDIENTE: 3, EN_REVISION: 2, RESUELTO: 6, DESESTIMADO: 1 },
  reportesPorMotivo: { SPAM: 8, VIOLENCIA: 4 },
  reportesPorPrioridad: { ALTA: 4, MEDIA: 6, BAJA: 2 },
  publicacionesPorEstado: { ACTIVA: 29, ELIMINADA: 0, BORRADOR: 2 },
  usuariosPorEstado: { ACTIVO: 8, BANEADO: 1, ELIMINADO: 0 },
}

function montar() { return render(<MemoryRouter><ReportesAnaliticaPage /></MemoryRouter>) }

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(obtenerAnaliticas).mockResolvedValue(datos)
})

describe('Reportes y analíticas — lectura de datos y exportación', () => {
  it('presenta las distribuciones de la API con etiquetas legibles y conserva categorías nuevas', async () => {
    vi.mocked(obtenerAnaliticas).mockResolvedValue({ ...datos, reportesPorMotivo: { ...datos.reportesPorMotivo, SUPLANTACION_IDENTIDAD: 2 }, nuevasMetricas: { visitasUnicas: 47 } })
    const { container } = montar()
    const estados = await screen.findByRole('region', { name: 'Estado de los reportes' })
    expect(within(estados).getByText('En revisión')).toBeInTheDocument()
    expect(within(estados).getByText('6')).toBeInTheDocument()
    expect(screen.getByText('Suplantacion identidad')).toBeInTheDocument()
    expect(screen.getByText('Visitas unicas')).toBeInTheDocument()
    expect(screen.getByText('47')).toBeInTheDocument()
    expect(container.querySelector('pre')).toBeNull()
  })

  it('distingue datos faltantes de ceros y no inventa cantidades', async () => {
    vi.mocked(obtenerAnaliticas).mockResolvedValue({ totalReportes: 0, publicacionesPorEstado: { ACTIVA: 0 }, usuariosPorEstado: { ACTIVO: -1 } })
    montar()
    const resumen = await screen.findByLabelText('Resumen de la comunidad')
    expect(within(resumen).getAllByText('0')).toHaveLength(2)
    expect(within(resumen).getAllByText('Sin datos')).toHaveLength(2)
    expect(screen.getByText(/No hay reportes registrados por ahora/)).toBeInTheDocument()
  })

  it('permite recuperar un error de carga mediante Reintentar', async () => {
    vi.mocked(obtenerAnaliticas).mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce(datos)
    montar()
    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('region', { name: 'Estado de la comunidad' })).toBeInTheDocument()
    expect(obtenerAnaliticas).toHaveBeenCalledTimes(2)
  })

  it('mantiene la consulta durante la exportación y ofrece el enlace recibido del servidor', async () => {
    let terminar!: (valor: ExportacionReporte) => void
    vi.mocked(exportarReporteAnalitica).mockImplementation(() => new Promise((resolve) => { terminar = resolve }))
    montar()
    await screen.findByRole('region', { name: 'Estado de la comunidad' })
    fireEvent.click(screen.getByRole('button', { name: 'Exportar reporte' }))
    expect(screen.getByRole('button', { name: 'Generando reporte...' })).toBeDisabled()
    expect(screen.getByRole('region', { name: 'Estado de la comunidad' })).toBeInTheDocument()
    terminar(new ExportacionReporte({ disponible: true, urlDescarga: '/archivo.csv' }))
    const descarga = await screen.findByRole('link', { name: 'Descargar archivo' })
    expect(descarga).toHaveAttribute('href', '/archivo.csv')
    expect(descarga).toHaveAttribute('download')
    expect(exportarReporteAnalitica).toHaveBeenCalledWith({})
    expect(screen.getByRole('button', { name: 'Exportar reporte' })).toBeEnabled()
  })

  it('muestra un error recuperable si falla la exportación', async () => {
    vi.mocked(exportarReporteAnalitica).mockRejectedValue(new Error('Fallo inesperado'))
    montar()
    fireEvent.click(screen.getByRole('button', { name: 'Exportar reporte' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Error: Reporte no generado.'))
    expect(screen.getByRole('button', { name: 'Exportar reporte' })).toBeEnabled()
    expect(screen.queryByRole('link', { name: 'Descargar archivo' })).not.toBeInTheDocument()
  })
})
