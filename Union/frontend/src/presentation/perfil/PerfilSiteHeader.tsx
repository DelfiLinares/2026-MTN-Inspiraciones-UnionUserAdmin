import React from 'react'
import { Link } from 'react-router-dom'
import '../../pages/home/home.css'
import { UsuarioPerfil as Usuario } from '../../domain/UsuarioPerfil'

/**
 * `PerfilSiteHeader`: Barra de navegación del sitio para las vistas de perfil.
 * Replica el encabezado de la home (`home-site-header`) para mantener la misma navegación.
 */
export interface PerfilSiteHeaderProps {
  usuario: Usuario
}

export const PerfilSiteHeader: React.FC<PerfilSiteHeaderProps> = ({ usuario }) => {
  const inicial = usuario.username.charAt(0).toUpperCase()

  // .home-page scopes the home nav styles (fonts, link colors); min-height keeps the header from filling the viewport.
  return (
    <div className="home-page" style={{ minHeight: 'auto' }}>
      <header className="home-site-header">
        <Link className="home-brand" to="/feed">
          InspiraBoard
        </Link>
        <nav className="home-site-nav" aria-label="Navegación principal">
          <Link to="/feed#comunidad">Descubre</Link>
          <Link to="/feed#challenge">Challenge</Link>
          <Link className="home-profile" to="/perfil" aria-label="Mi perfil">
            <span aria-hidden="true">{inicial}</span>
          </Link>
        </nav>
      </header>
    </div>
  )
}
