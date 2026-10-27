import React, { useEffect, useRef, useState } from 'react'
import { Bell, Home, Plus, Search, Trophy, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { CrearPublicacionDialog } from '../publicaciones/CrearPublicacionDialog'
import { CerrarSesionButton } from './CerrarSesionButton'
import { Marca } from './Marca'

const DESTINOS = [
  { ruta: '/feed', nombre: 'Inicio', icono: Home },
  { ruta: '/buscar', nombre: 'Descubrir', icono: Search },
  { ruta: '/desafios', nombre: 'Desafíos', icono: Trophy },
  { ruta: '/perfil', nombre: 'Perfil', icono: UserRound },
] as const

export const UserLayout: React.FC = () => {
  const { estaAutenticado } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [publicando, setPublicando] = useState(false)
  const [revision, setRevision] = useState(0)
  const [aviso, setAviso] = useState('')
  const contenido = useRef<HTMLDivElement>(null)
  const rutaAnterior = useRef(pathname)
  const acceso = ['/login', '/registro', '/recuperar-contrasena', '/apelar-suspension', '/cuestionario'].includes(pathname)

  useEffect(() => {
    if (rutaAnterior.current !== pathname) {
      contenido.current?.focus()
      window.scrollTo(0, 0)
      rutaAnterior.current = pathname
    }
  }, [pathname])

  if (!estaAutenticado || acceso) return <Outlet />

  return (
    <div className="trama-layout">
      <a className="trama-skip" href="#trama-contenido">Ir al contenido</a>
      <aside className="trama-sidebar">
        <Link className="trama-brand-link" to="/feed" aria-label="Trama, inicio"><Marca /></Link>
        <nav className="trama-navigation" aria-label="Navegación principal">
          {DESTINOS.map(({ ruta, nombre, icono: Icono }) => (
            <NavLink key={ruta} to={ruta} end={ruta === '/feed'}>
              <Icono size={22} strokeWidth={1.75} aria-hidden="true" />
              <span>{nombre}</span>
            </NavLink>
          ))}
        </nav>
        <div className="trama-sidebar-footer"><CerrarSesionButton /></div>
      </aside>
      <div className="trama-workspace">
        <header className="trama-toolbar">
          <Link className="trama-mobile-brand" to="/feed" aria-label="Trama, inicio"><Marca /></Link>
          <div className="trama-toolbar-actions">
            <details className="trama-account">
              <summary aria-label="Cuenta" title="Cuenta"><UserRound size={22} strokeWidth={1.75} aria-hidden="true" /></summary>
              <div><Link to="/perfil">Mi perfil</Link><CerrarSesionButton /></div>
            </details>
            <NavLink className="trama-icon-button" to="/notificaciones" aria-label="Notificaciones" title="Notificaciones"><Bell size={22} strokeWidth={1.75} aria-hidden="true" /></NavLink>
            <button type="button" className="trama-primary" onClick={() => { setAviso(''); setPublicando(true) }}><Plus size={20} aria-hidden="true" /><span>Publicar</span></button>
          </div>
        </header>
        <div id="trama-contenido" className="trama-content" tabIndex={-1} ref={contenido}>
          {aviso && <p className="trama-success" role="status">{aviso}</p>}
          <div key={revision}><Outlet /></div>
        </div>
      </div>
      {publicando && <CrearPublicacionDialog onCancel={() => setPublicando(false)} onSuccess={() => {
        setPublicando(false)
        setAviso('Tu publicación se compartió.')
        setRevision(actual => actual + 1)
        navigate('/perfil')
      }} />}
    </div>
  )
}