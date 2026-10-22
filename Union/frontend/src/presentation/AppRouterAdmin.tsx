import React from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { RequireAdmin } from './RequireAdmin'
import { AdminLayout } from './admin/AdminLayout'
import { AdminNoEncontrado } from './admin/AdminUI'
import { httpClientAdmin } from '../infrastructure/httpClientAdmin'
import { obtenerSesion } from '../infrastructure/sessionManager'
import { LoginAdminPage } from './login'
import { DashboardPage } from './dashboard'
import { UsuariosListadoPage } from './usuarios'
import { ModeracionListado } from './moderacion'
import { ModeracionDetalleReporte } from './moderacion/ModeracionDetalleReporte'
import { DesafiosAdminPage } from './desafios'
import { ReportesAnaliticaPage } from './reportes'
import { PublicacionesPage } from './publicaciones/PublicacionesPage'
import { PromocionPage } from './promocion/PromocionPage'
import { ReportesPage } from './reportes/ReportesPage'
import { ListadoDesafiosAdminPage } from '../pages/desafios/listado-admin'
import { PublicarDesafioPage } from '../pages/desafios/publicar'
import { EditarDesafioPage } from '../pages/desafios/editar'
import { BandejaSolicitudesPage } from '../pages/solicitudes/bandeja'
import { DetalleSolicitudAdminPage } from '../pages/solicitudes/detalle-admin'

function DetalleModeracionRuta() {
  const { reporteId } = useParams()
  const navigate = useNavigate()
  return reporteId ? <ModeracionDetalleReporte reporteId={reporteId} onVolver={() => navigate('/admin/moderacion')} /> : <AdminNoEncontrado />
}

export const AppRouterAdmin: React.FC = () => (
  <Routes>
    <Route path="/login-admin" element={<LoginAdminPage />} />
    <Route path="/usuarios" element={<Navigate to="/admin/usuarios" replace />} />
    <Route path="/publicaciones" element={<Navigate to="/admin/publicaciones" replace />} />
    <Route path="/promocion" element={<Navigate to="/admin/promocion" replace />} />
    <Route path="/reportes" element={<Navigate to="/admin/reportes/gestion" replace />} />
    <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="usuarios" element={<UsuariosListadoPage />} />
      <Route path="publicaciones" element={<PublicacionesPage httpClient={httpClientAdmin} />} />
      <Route path="promocion" element={<PromocionPage httpClient={httpClientAdmin} obtenerRolActorActual={() => obtenerSesion()?.usuario.rol} />} />
      <Route path="moderacion" element={<ModeracionListado />} />
      <Route path="moderacion/:reporteId" element={<DetalleModeracionRuta />} />
      <Route path="desafios" element={<ListadoDesafiosAdminPage />} />
      <Route path="desafios/nuevo" element={<PublicarDesafioPage />} />
      <Route path="desafios/:desafioId/editar" element={<EditarDesafioPage />} />
      <Route path="desafios/propuestas" element={<DesafiosAdminPage />} />
      <Route path="desafios/propuestas/:propuestaId" element={<DesafiosAdminPage />} />
      <Route path="solicitudes" element={<BandejaSolicitudesPage />} />
      <Route path="solicitudes/:solicitudId" element={<DetalleSolicitudAdminPage />} />
      <Route path="reportes" element={<ReportesAnaliticaPage />} />
      <Route path="reportes/gestion" element={<ReportesPage httpClient={httpClientAdmin} />} />
      <Route path="*" element={<AdminNoEncontrado />} />
    </Route>
  </Routes>
)
