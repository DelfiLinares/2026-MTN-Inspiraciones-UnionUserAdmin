import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import './cerrarSesionButton.css'

export const CerrarSesionButton: React.FC = () => {
  const navigate = useNavigate()
  const { cerrarSesion } = useAuth()

  const handleCerrarSesion = async () => {
    await cerrarSesion()
    navigate('/login', { replace: true })
  }

  return (
    <button
      type="button"
      className="cerrar-sesion-button"
      onClick={() => void handleCerrarSesion()}
    >
      Cerrar sesión
    </button>
  )
}