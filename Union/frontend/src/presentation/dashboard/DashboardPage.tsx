import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService, type IndicadoresDashboard } from '../../services/DashboardService'
import { Spinner, EmptyState } from '../../components/comunes'
import { AdminHeading } from '../admin/AdminUI'

export const DashboardPage: React.FC = () => {
  const [indicadores, setIndicadores] = useState<IndicadoresDashboard | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const cargar = useCallback(async () => {
    setCargando(true)
    setError(false)
    try { setIndicadores(await dashboardService.obtenerIndicadores()) }
    catch { setError(true) }
    finally { setCargando(false) }
  }, [])
  useEffect(() => { void cargar() }, [cargar])
  const valor = (n: number | undefined) => n === undefined ? 'Sin datos' : n.toLocaleString('es-AR')
  return <section>
    <AdminHeading titulo="Resumen de la comunidad" descripcion="El estado de Trama y las tareas que necesitan tu atención.">
      <button type="button" onClick={cargar} disabled={cargando}>{cargando ? 'Actualizando…' : 'Actualizar'}</button>
    </AdminHeading>
    {cargando && <Spinner texto="Cargando indicadores..." tamano="lg" />}
    {!cargando && error && <EmptyState titulo="Error al cargar el dashboard" mensaje="No se pudieron cargar los indicadores del dashboard." textoAccion="Reintentar" onAccion={cargar} />}
    {!cargando && !error && indicadores && <>
      <dl className="admin-dashboard-stats" aria-label="Indicadores del dashboard">
        {[['Usuarios activos', indicadores.usuariosActivos], ['Publicaciones activas', indicadores.publicacionesActivas], ['Publicaciones eliminadas', indicadores.publicacionesEliminadas], ['Usuarios baneados', indicadores.usuariosBaneados]].map(([nombre, cantidad]) => <div key={String(nombre)}><dt>{nombre}</dt><dd>{valor(cantidad as number | undefined)}</dd></div>)}
      </dl>
      <div className="admin-dashboard-columns">
        <section className="admin-panel"><h2>Para revisar</h2><p className="admin-dashboard-note">Accedé a las bandejas de trabajo del equipo.</p><div className="admin-work-list">
          <Link to="/admin/moderacion"><div><strong>Reportes pendientes</strong><small>Revisá publicaciones señaladas por la comunidad.</small></div><span className="admin-work-count">{valor(indicadores.reportesPendientes)}</span></Link>
          {indicadores.desafiosPendientes !== undefined && <Link to="/admin/desafios/propuestas"><div><strong>Desafíos pendientes</strong><small>Evaluá las propuestas antes de decidir.</small></div><span className="admin-work-count">{valor(indicadores.desafiosPendientes)}</span></Link>}
          {indicadores.desafiosAprobadosRechazados !== undefined && <Link to="/admin/desafios/propuestas"><div><strong>Desafíos decididos</strong><small>Indicador de propuestas aprobadas o rechazadas.</small></div><span className="admin-work-count">{valor(indicadores.desafiosAprobadosRechazados)}</span></Link>}
        </div></section>
        <section className="admin-panel"><h2>Herramientas de gestión</h2><p className="admin-dashboard-note">Publicá nuevas consignas o consultá los datos agregados de la plataforma.</p><div className="admin-dashboard-actions">
          <Link className="admin-button admin-button-primary" to="/admin/desafios/nuevo">Publicar un desafío</Link>
          <Link className="admin-button" to="/admin/reportes">Ver reportes y analíticas</Link>
          <Link className="admin-button" to="/admin/solicitudes">Revisar solicitudes</Link>
        </div></section>
      </div>
    </>}
  </section>
}
