import React, { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { authAdminService } from '../../services/AuthAdminService'
import { obtenerSesion } from '../../infrastructure/sessionManager'
import '../shared/shared.css'
import './admin.css'

export const ADMIN_ENLACES = [
  { ruta: '/admin/dashboard', nombre: 'Resumen' },
  { ruta: '/admin/usuarios', nombre: 'Usuarios' },
  { ruta: '/admin/publicaciones', nombre: 'Publicaciones' },
  { ruta: '/admin/moderacion', nombre: 'Moderación' },
  { ruta: '/admin/desafios', nombre: 'Desafíos' },
  { ruta: '/admin/solicitudes', nombre: 'Solicitudes' },
  { ruta: '/admin/reportes', nombre: 'Reportes' },
  { ruta: '/admin/promocion', nombre: 'Accesos' },
] as const

export const AdminLayout: React.FC = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const contenido = useRef<HTMLElement>(null)
  const anterior = useRef(pathname)
  const nombre = obtenerSesion()?.usuario.nombre

  useEffect(() => {
    if (anterior.current !== pathname) {
      contenido.current?.focus()
      window.scrollTo(0, 0)
      anterior.current = pathname
    }
  }, [pathname])

  const subrutas = pathname.startsWith('/admin/desafios')
    ? [{ ruta: '/admin/desafios', nombre: 'Publicados' }, { ruta: '/admin/desafios/propuestas', nombre: 'Propuestas de la comunidad' }, { ruta: '/admin/desafios/nuevo', nombre: 'Publicar desafío' }]
    : pathname.startsWith('/admin/reportes')
      ? [{ ruta: '/admin/reportes', nombre: 'Analíticas' }, { ruta: '/admin/reportes/gestion', nombre: 'Gestión de reportes' }]
      : []

  return <div className="admin-console">
    <a className="admin-skip" href="#admin-contenido">Ir al contenido</a>
    <header className="admin-site-header">
      <div className="admin-header-inner">
        <Link className="admin-brand" to="/admin/dashboard">InspiraBoard</Link>
        <span className="admin-label">Administración</span>
        <div className="admin-session"><span>{nombre || 'Administrador'}</span><button type="button" onClick={() => { authAdminService.logout(); navigate('/login-admin', { replace: true }) }}>Cerrar sesión</button></div>
      </div>
      <nav className="admin-nav" aria-label="Navegación administrativa">
        {ADMIN_ENLACES.map(({ ruta, nombre: etiqueta }) => <NavLink key={ruta} to={ruta}>{etiqueta}</NavLink>)}
      </nav>
    </header>
    <main id="admin-contenido" className="admin-content" ref={contenido} tabIndex={-1}>
      {subrutas.length > 0 && <nav className="admin-subnav" aria-label="Secciones de la página">{subrutas.map(({ruta, nombre: etiqueta}) => <NavLink key={ruta} to={ruta} end={ruta === '/admin/desafios' || ruta === '/admin/reportes'}>{etiqueta}</NavLink>)}</nav>}
      <Outlet />
    </main>
    <footer className="admin-site-footer"><span>InspiraBoard · Administración</span><span>Un espacio para cuidar la comunidad creativa.</span></footer>
  </div>
}
