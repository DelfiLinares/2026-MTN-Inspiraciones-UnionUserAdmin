import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { EditarPerfilForm } from '../../presentation/perfil/EditarPerfilForm'
import { UsuarioPerfil } from '../../domain/UsuarioPerfil'
import { usuarioPerfilService } from '../../services/perfilUsuarioService'

export const EditarPerfilPage: React.FC = () => {
  const navigate = useNavigate()
  const { usuario, cargando: cargandoAuth, revalidarSesion } = useAuth()
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (cargandoAuth || !usuario) {
      return
    }

    let activo = true
    setCargando(true)
    setError(undefined)
    void usuarioPerfilService
      .obtenerPerfilPropio()
      .then((usuarioPerfil) => {
        if (activo) {
          setPerfil(usuarioPerfil)
        }
      })
      .catch((reason: unknown) => {
        if (activo) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'No se pudo cargar el perfil para editar.',
          )
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false)
        }
      })

    return () => {
      activo = false
    }
  }, [cargandoAuth, usuario])

  if (cargandoAuth) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-sm text-gray-600">Cargando sesión...</p>
      </main>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-sm text-gray-600">Cargando perfil...</p>
      </main>
    )
  }

  return (
    <main className="trama-edit-profile">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 text-sm font-medium text-indigo-600 underline"
        >
          Volver
        </button>
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            No se pudo cargar el perfil: {error}
          </p>
        ) : perfil ? (
          <EditarPerfilForm
            usuario={perfil}
            onCancel={() => navigate(-1)}
            onPerfilActualizado={(perfilActualizado) => {
              setPerfil(perfilActualizado)
              void revalidarSesion()
            }}
          />
        ) : (
          <p role="alert" className="text-sm text-red-600">
            No se pudo cargar el perfil para editar.
          </p>
        )}
      </div>
    </main>
  )
}
