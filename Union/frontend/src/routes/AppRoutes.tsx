/** Rutas de la experiencia de usuario. La administración se concentra en AppRouterAdmin. */

import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { RutaProtegida } from './RutaProtegida'

import { LoginPage } from '../pages/login'
import { RegistroPage } from '../pages/registro'
import { HomePage } from '../pages/home'
import { PerfilPage } from '../pages/perfil'
import { EditarPerfilPage } from '../pages/editar-perfil'
import { ListadoDesafiosPage } from '../pages/desafios/listado'
import { DetalleDesafioPage } from '../pages/desafios/detalle'
import { MisSolicitudesPage } from '../pages/desafios/mis-solicitudes'
import { NuevaSolicitudPage } from '../pages/desafios/nueva-solicitud'
import { CarpetaPostsPage } from '../presentation/carpetas/CarpetaPostsPage'
import { CuestionarioPage } from '../presentation/cuestionario/CuestionarioPage'
import { RecuperarContrasenaPage } from '../pages/recuperar'
import { ApelarSuspensionPage } from '../pages/apelacion'
import { PaginaBusqueda } from '../pages/busqueda'
import { NotificacionesPage } from '../pages/notificaciones/NotificacionesPage'
import { ConfiguracionNotificacionesPage } from '../pages/notificaciones/ConfiguracionNotificacionesPage'
import { DetalleInspiracionPage } from '../pages/busqueda/DetalleInspiracionPage'

/**
 * Envuelve las rutas públicas de autenticación (login/registro).
 * RF-05: redirige al home a un usuario ya autenticado que intente acceder a estas rutas.
 */
const RutaPublicaDeAutenticacion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { estaAutenticado, cargando } = useAuth()

  if (cargando) {
    return null
  }

  if (estaAutenticado) {
    return <Navigate to="/feed" replace />
  }

  return <>{children}</>
}

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/publicaciones/:id" element={<RutaProtegida><DetalleInspiracionPage /></RutaProtegida>} />
      <Route path="/notificaciones" element={<RutaProtegida><NotificacionesPage /></RutaProtegida>} />
      <Route path="/notificaciones/configuracion" element={<RutaProtegida><ConfiguracionNotificacionesPage /></RutaProtegida>} />
      {/* Rutas públicas */}
      <Route
        path="/login"
        element={
          <RutaPublicaDeAutenticacion>
            <LoginPage />
          </RutaPublicaDeAutenticacion>
        }
      />
      <Route
        path="/registro"
        element={
          <RutaPublicaDeAutenticacion>
            <RegistroPage />
          </RutaPublicaDeAutenticacion>
        }
      />

      <Route
        path="/recuperar-contrasena"
        element={
          <RutaPublicaDeAutenticacion>
            <RecuperarContrasenaPage />
          </RutaPublicaDeAutenticacion>
        }
      />
      <Route
        path="/apelar-suspension"
        element={
          <RutaPublicaDeAutenticacion>
            <ApelarSuspensionPage />
          </RutaPublicaDeAutenticacion>
        }
      />

      {/* Rutas protegidas (requieren sesión activa; rechazan rol ADMIN — RF-78 / A14) */}
      <Route
        path="/feed"
        element={
          <RutaProtegida>
            <HomePage />
          </RutaProtegida>
        }
      />
      <Route
        path="/cuestionario"
        element={
          <RutaProtegida>
            <CuestionarioPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/perfil"
        element={
          <RutaProtegida>
            <PerfilPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/buscar"
        element={
          <RutaProtegida>
            <PaginaBusqueda />
          </RutaProtegida>
        }
      />
      <Route
        path="/perfil/:id"
        element={
          <RutaProtegida>
            <PerfilPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/carpeta/:id"
        element={
          <RutaProtegida>
            <CarpetaPostsPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/editar-perfil"
        element={
          <RutaProtegida>
            <EditarPerfilPage />
          </RutaProtegida>
        }
      />

      {/* Rutas de desafíos de usuario (T068, HU-09 a HU-15, RF-24) */}
      <Route
        path="/desafios"
        element={
          <RutaProtegida>
            <ListadoDesafiosPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/desafios/:desafioId"
        element={
          <RutaProtegida>
            <DetalleDesafioPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/desafios/mis-solicitudes"
        element={
          <RutaProtegida>
            <MisSolicitudesPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/desafios/solicitar"
        element={
          <RutaProtegida>
            <NuevaSolicitudPage />
          </RutaProtegida>
        }
      />

      {/* El árbol /admin se resuelve en presentation/AppRouterAdmin.tsx. */}

      {/* Redirecciones por defecto */}
      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  )
}
