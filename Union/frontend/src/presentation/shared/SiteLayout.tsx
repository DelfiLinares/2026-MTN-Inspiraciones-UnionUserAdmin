import React, { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { CrearPublicacionDialog } from '../publicaciones/CrearPublicacionDialog'
import { Brand } from './Brand'
import { CerrarSesionButton } from './CerrarSesionButton'
import { NavigationIcon, type NavigationIconName } from './NavigationIcon'
import './site-layout.css'

const destinos: { to: string; label: string; icon: NavigationIconName }[] = [
  { to: '/feed', label: 'Inicio', icon: 'inicio' },
  { to: '/buscar', label: 'Descubrir', icon: 'descubrir' },
  { to: '/desafios', label: 'Desafíos', icon: 'desafios' },
  { to: '/perfil', label: 'Perfil', icon: 'perfil' },
]

const rutasDeAcceso = new Set(['/login', '/registro', '/recuperar-contrasena', '/apelar-suspension'])

export const SiteLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation()
  const { estaAutenticado } = useAuth()
  const navigate = useNavigate()
  const [publicando, setPublicando] = useState(false)

  if (rutasDeAcceso.has(pathname) || !estaAutenticado) return <>{children}</>

  return (
    <div className="trama-site">
      <a className="trama-skip" href="#trama-contenido">Ir al contenido</a>
      <header className="trama-header">
        <Link className="trama-brand-link" to="/feed"><Brand /></Link>
        <nav className="trama-navigation" aria-label="Navegación principal">
          {destinos.map(({ to, label, icon }) => (
            <NavLink key={to} to={to}>
              <NavigationIcon name={icon} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="trama-header-actions">
          <Link className="trama-icon-button" to="/notificaciones" aria-label="Notificaciones">
            <NavigationIcon name="notificaciones" />
          </Link>
          <button className="trama-primary trama-publish" type="button" aria-label="Publicar" onClick={() => setPublicando(true)}>
            <NavigationIcon name="publicar" /><span>Publicar</span>
          </button>
          <CerrarSesionButton />
        </div>
      </header>
      <div id="trama-contenido" className="trama-content" tabIndex={-1} key={pathname}>
        {children}
      </div>
      <footer className="trama-footer"><span>trama · Comunidad para artistas</span><span>Encontrá ideas. Compartí lo que creás.</span></footer>
      {publicando && (
        <CrearPublicacionDialog
          onCancel={() => setPublicando(false)}
          onSuccess={() => { setPublicando(false); navigate('/perfil') }}
        />
      )}
    </div>
  )
}
