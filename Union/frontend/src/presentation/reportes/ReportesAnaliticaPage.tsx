import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  obtenerAnaliticas,
  exportarReporteAnalitica,
  MENSAJE_ERROR_REPORTE_NO_GENERADO,
} from '../../services/ReportesAnaliticaService'
import type { ExportacionReporte } from '../../domain/ExportacionReporte'
import './reportes-analitica.css'

type Datos = Record<string, unknown>
type Grupo = { clave: string; etiqueta: string; valor: number | null }
type IconoNombre = 'descargar' | 'actualizar' | 'flecha' | 'archivo' | 'alerta' | 'check'

const numero = new Intl.NumberFormat('es-AR')
const ESQUEMAS = {
  reportesPorEstado: {
    PENDIENTE: 'Pendientes', EN_REVISION: 'En revisión', RESUELTO: 'Resueltos', DESESTIMADO: 'Desestimados',
  },
  reportesPorMotivo: {
    SPAM: 'Spam', CONTENIDO_INAPROPIADO: 'Contenido inapropiado',
    PLAGIO_DERECHOS_AUTOR: 'Plagio y derechos de autor', VIOLENCIA: 'Violencia', OTRO: 'Otros motivos',
  },
  reportesPorPrioridad: { ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja' },
  publicacionesPorEstado: { ACTIVA: 'Activas', ELIMINADA: 'Eliminadas', BORRADOR: 'Borradores' },
  usuariosPorEstado: { ACTIVO: 'Activos', BANEADO: 'Baneados', ELIMINADO: 'Eliminados' },
} as const

function registro(valor: unknown): Datos {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor) ? valor as Datos : {}
}

function cantidad(valor: unknown): number | null {
  return typeof valor === 'number' && Number.isFinite(valor) && valor >= 0 ? valor : null
}

function etiqueta(clave: string): string {
  const texto = clave.replace(/([a-záéíóú])([A-ZÁÉÍÓÚ])/g, '$1 $2').replace(/_/g, ' ').toLowerCase()
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function grupos(datos: Datos, clave: keyof typeof ESQUEMAS): Grupo[] {
  const valores = registro(datos[clave])
  const nombres: Record<string, string> = ESQUEMAS[clave]
  return [...new Set([...Object.keys(nombres), ...Object.keys(valores)])].map((nombre) => ({
    clave: nombre, etiqueta: nombres[nombre] ?? etiqueta(nombre), valor: cantidad(valores[nombre]),
  }))
}

function mostrar(valor: number | null): string {
  return valor === null ? 'Sin datos' : numero.format(valor)
}

function Icono({ nombre }: { nombre: IconoNombre }) {
  const trazos: Record<IconoNombre, React.ReactNode> = {
    descargar: <><path d="M12 3v12m-4-4 4 4 4-4" /><path d="M5 15v5h14v-5" /></>,
    actualizar: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6.1 6.1a8 8 0 0 1 13 2L20 12M4 12l.9 3.9a8 8 0 0 0 13 2" /></>,
    flecha: <path d="M5 12h14m-5-5 5 5-5 5" />,
    archivo: <><path d="M14 3H6v18h12V7zM14 3v5h4M9 12h6m-6 4h6" /></>,
    alerta: <><path d="m12 3 10 18H2zM12 9v5" /><path d="M12 17h.01" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{trazos[nombre]}</svg>
}

function Distribucion({ items, titulo, descripcion }: { items: Grupo[]; titulo: string; descripcion: string }) {
  const total = items.reduce((suma, item) => suma + (item.valor ?? 0), 0)
  const hayDatos = items.some((item) => item.valor !== null)
  return (
    <section className="ra-panel" aria-label={titulo}>
      <h2>{titulo}</h2>
      <p className="ra-panel-description">{descripcion}</p>
      <dl className="ra-distribution">
        {items.map((item) => (
          <div className="ra-distribution-row" key={item.clave}>
            <dt>{item.etiqueta}</dt>
            <dd>{mostrar(item.valor)}</dd>
            <div className="ra-track" aria-hidden="true"><span style={{ width: `${total ? (item.valor ?? 0) / total * 100 : 0}%` }} /></div>
          </div>
        ))}
      </dl>
      <p className="ra-panel-note">{!hayDatos ? 'Todavía no hay datos disponibles para esta distribución.' : total === 0 ? 'Sin reportes registrados en esta distribución.' : `${numero.format(total)} reportes en esta distribución.`}</p>
    </section>
  )
}

function ListaEstados({ items, titulo }: { items: Grupo[]; titulo: string }) {
  return <section className="ra-community-group" aria-label={titulo}>
    <h3>{titulo}</h3>
    <dl>{items.map((item) => <div key={item.clave}><dt>{item.etiqueta}</dt><dd>{mostrar(item.valor)}</dd></div>)}</dl>
  </section>
}

// El contrato admite campos adicionales: se conservan en una vista legible sin exponer JSON.
function DatoAdicional({ valor }: { valor: unknown }) {
  if (valor === null || valor === undefined) return <span>Sin datos</span>
  if (Array.isArray(valor)) return valor.length
    ? <ul>{valor.map((item, indice) => <li key={indice}><DatoAdicional valor={item} /></li>)}</ul>
    : <span>Sin datos</span>
  if (typeof valor === 'object') return <dl>{Object.entries(valor).map(([clave, dato]) => <div key={clave}><dt>{etiqueta(clave)}</dt><dd><DatoAdicional valor={dato} /></dd></div>)}</dl>
  if (typeof valor === 'boolean') return <span>{valor ? 'Sí' : 'No'}</span>
  return <span>{typeof valor === 'number' ? numero.format(valor) : String(valor)}</span>
}

/** HU-15: analíticas agregadas y exportación síncrona con descarga o error recuperable. */
export const ReportesAnaliticaPage: React.FC = () => {
  const [analiticas, setAnaliticas] = useState<Datos | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)
  const [actualizado, setActualizado] = useState<Date | null>(null)
  const [exportando, setExportando] = useState(false)
  const [exportacion, setExportacion] = useState<ExportacionReporte | null>(null)
  const [errorExportacion, setErrorExportacion] = useState<string | null>(null)

  const cargarAnaliticas = useCallback(async () => {
    setCargando(true)
    setErrorMensaje(null)
    try {
      const datos = await obtenerAnaliticas()
      setAnaliticas(registro(datos))
      setActualizado(new Date())
    } catch {
      setErrorMensaje('No se pudieron cargar las analíticas.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { void cargarAnaliticas() }, [cargarAnaliticas])

  const handleExportar = async () => {
    setExportando(true)
    setExportacion(null)
    setErrorExportacion(null)
    try {
      setExportacion(await exportarReporteAnalitica({}))
    } catch {
      setErrorExportacion(MENSAJE_ERROR_REPORTE_NO_GENERADO)
    } finally {
      setExportando(false)
    }
  }

  const datos = analiticas ?? {}
  const adicionales = Object.entries(datos).filter(([clave]) => clave !== 'totalReportes' && !(clave in ESQUEMAS))
  const resumen = [
    { nombre: 'Reportes registrados', valor: cantidad(datos.totalReportes) },
    { nombre: 'Reportes pendientes', valor: cantidad(registro(datos.reportesPorEstado).PENDIENTE) },
    { nombre: 'Publicaciones activas', valor: cantidad(registro(datos.publicacionesPorEstado).ACTIVA) },
    { nombre: 'Usuarios activos', valor: cantidad(registro(datos.usuariosPorEstado).ACTIVO) },
  ]
  const errorArchivo = errorExportacion ?? (exportacion && !exportacion.fueExitosa() ? exportacion.errorMensaje ?? MENSAJE_ERROR_REPORTE_NO_GENERADO : null)

  return (
    <div className="ra-page">
      <div className="ra-main">
        <div className="ra-heading">
          <div><h1>Reportes y analíticas</h1><p>Una mirada a la moderación y al estado de la comunidad.</p></div>
          <div className="ra-actions">
            <button type="button" className="ra-button ra-button-secondary" onClick={cargarAnaliticas} disabled={cargando} aria-label="Actualizar analíticas"><Icono nombre="actualizar" />{cargando ? 'Actualizando…' : 'Actualizar'}</button>
            <button type="button" className="ra-button ra-button-primary" onClick={handleExportar} disabled={exportando} aria-describedby="ra-export-info"><Icono nombre="descargar" />{exportando ? 'Generando reporte...' : 'Exportar reporte'}</button>
          </div>
        </div>

        <div className="ra-export-info" id="ra-export-info"><Icono nombre="archivo" /><span>Exportá los reportes para revisarlos fuera de la plataforma.</span></div>
        {exportando && <p className="ra-feedback" role="status">Estamos preparando el archivo. Podés seguir consultando las analíticas.</p>}
        {exportacion?.fueExitosa() && <div className="ra-feedback ra-feedback-success" role="status"><Icono nombre="check" /><span>Reporte generado correctamente. {exportacion.urlDescarga ? <a href={exportacion.urlDescarga} download target="_blank" rel="noreferrer">Descargar archivo</a> : 'El servidor no proporcionó un enlace de descarga. Intentá exportarlo nuevamente.'}</span></div>}
        {errorArchivo && <div className="ra-feedback ra-feedback-error" role="alert"><Icono nombre="alerta" /><span>{errorArchivo} Intentá exportarlo nuevamente.</span></div>}

        {cargando && <div className="ra-state" role="status"><span className="ra-loader" aria-hidden="true" /><h2>Cargando analíticas...</h2><p>Estamos consultando los datos de la comunidad.</p></div>}
        {!cargando && errorMensaje && <section className="ra-state ra-state-error" role="alert"><Icono nombre="alerta" /><h2>Error al cargar las analíticas</h2><p>{errorMensaje} Podés volver a intentarlo.</p><button type="button" className="ra-button ra-button-primary" onClick={cargarAnaliticas}>Reintentar</button></section>}

        {!cargando && !errorMensaje && analiticas && <>
          <dl className="ra-summary" aria-label="Resumen de la comunidad">{resumen.map((item) => <div key={item.nombre}><dt>{item.nombre}</dt><dd>{mostrar(item.valor)}</dd></div>)}</dl>

          <div className="ra-section-heading"><h2>Moderación de reportes</h2><Link to="/admin/moderacion">Ir a moderación <Icono nombre="flecha" /></Link></div>
          {cantidad(datos.totalReportes) === 0 && <p className="ra-empty-note"><Icono nombre="check" /><span>No hay reportes registrados por ahora. Los nuevos reportes aparecerán en estas estadísticas.</span></p>}
          <div className="ra-analysis-grid">
            <Distribucion titulo="Estado de los reportes" descripcion="Cómo se distribuyen las revisiones." items={grupos(datos, 'reportesPorEstado')} />
            <Distribucion titulo="Motivos de reporte" descripcion="Las razones por las que se reportó contenido." items={grupos(datos, 'reportesPorMotivo')} />
          </div>

          <div className="ra-bottom-grid">
            <section className="ra-panel ra-priority" aria-label="Prioridad de los reportes"><h2>Prioridad</h2><p className="ra-panel-description">Reportes según su nivel de atención.</p><dl>{grupos(datos, 'reportesPorPrioridad').map((item) => <div key={item.clave}><dt><span className={`ra-priority-dot ra-priority-dot-${item.clave.toLowerCase()}`} aria-hidden="true" />{item.etiqueta}</dt><dd>{mostrar(item.valor)}</dd></div>)}</dl></section>
            <section className="ra-panel ra-community" aria-label="Estado de la comunidad"><h2>Estado de la comunidad</h2><p className="ra-panel-description">Publicaciones y usuarios por estado.</p><div className="ra-community-columns"><ListaEstados titulo="Publicaciones" items={grupos(datos, 'publicacionesPorEstado')} /><ListaEstados titulo="Usuarios" items={grupos(datos, 'usuariosPorEstado')} /></div></section>
          </div>

          {adicionales.length > 0 && <details className="ra-additional"><summary>Más datos de la plataforma</summary><dl>{adicionales.map(([clave, valor]) => <div key={clave}><dt>{etiqueta(clave)}</dt><dd><DatoAdicional valor={valor} /></dd></div>)}</dl></details>}
          <footer className="ra-footer"><span>Datos agregados de la plataforma</span>{actualizado && <span>Actualizado a las <time dateTime={actualizado.toISOString()}>{actualizado.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</time></span>}</footer>
        </>}
      </div>
    </div>
  )
}
