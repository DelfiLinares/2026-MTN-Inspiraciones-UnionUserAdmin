/**
 * Pantalla de Edición de Perfil — `EditarPerfilPage.tsx` (HU-06).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-06, RF-16 a RF-20, AC-06.1 a AC-06.6)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T092)
 *
 * Descripción:
 * - Usa `usePerfilEdicion` (T058) para orquestar la edición del perfil del usuario autenticado.
 * - NO incluye campo de contraseña (RF-16, AC-06.2); en su lugar ofrece un enlace "Cambiar
 *   contraseña" hacia un flujo separado (RF-16), cuyo mecanismo detallado está diferido (A3).
 * - Advierte cambios sin guardar (AC-06.5) mediante `beforeunload` (interno al hook) y al intentar
 *   navegar hacia atrás desde esta pantalla (`confirmarSalidaSiHayCambios`).
 * - Previsualiza la nueva foto de perfil antes de confirmar el guardado (AC-06.6).
 * - Bloquea el envío si `nombre`/`apellido` están vacíos (RF-17, AC-06.3) o mientras se está
 *   enviando la actualización.
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { usePerfilEdicion } from '../../services/usePerfilEdicion'
import { Spinner } from '../../components/comunes'
import type { Usuario } from '../../domain/Usuario'

export const EditarPerfilPage: React.FC = () => {
  const navigate = useNavigate()
  const { usuario, iniciarSesion } = useAuth()

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-sm text-gray-600">Necesitás iniciar sesión para editar tu perfil.</p>
      </div>
    )
  }

  return <EditarPerfilFormulario usuario={usuario} onGuardado={iniciarSesion} onVolver={() => navigate(-1)} />
}

interface EditarPerfilFormularioProps {
  usuario: Usuario
  onGuardado: (usuario: Usuario) => void
  onVolver: () => void
}

const EditarPerfilFormulario: React.FC<EditarPerfilFormularioProps> = ({ usuario, onGuardado, onVolver }) => {
  const {
    estado,
    puedeEnviar,
    hayCambiosSinGuardar,
    establecerNombre,
    establecerApellido,
    establecerBio,
    establecerFoto,
    confirmarSalidaSiHayCambios,
    enviar,
  } = usePerfilEdicion(usuario)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const actualizado = await enviar()
    if (actualizado) {
      onGuardado(actualizado)
    }
  }

  const handleVolver = () => {
    if (confirmarSalidaSiHayCambios()) {
      onVolver()
    }
  }

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0] ?? null
    establecerFoto(archivo)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Editar perfil</h1>
          <button
            type="button"
            onClick={handleVolver}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 underline cursor-pointer"
          >
            Volver
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {estado.error && (
            <div
              role="alert"
              className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100"
            >
              {estado.error}
            </div>
          )}

          {estado.guardadoConExito && (
            <div
              role="status"
              className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100"
            >
              Perfil actualizado con éxito.
            </div>
          )}

          {hayCambiosSinGuardar && !estado.guardadoConExito && (
            <div className="mb-4 p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-100">
              Tenés cambios sin guardar.
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Previsualización y selección de foto (AC-06.6, RF-20) */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-semibold overflow-hidden flex-shrink-0">
                {estado.fotoPreviewUrl ? (
                  <img src={estado.fotoPreviewUrl} alt="Previsualización" className="w-full h-full object-cover" />
                ) : usuario.fotoUrl ? (
                  <img src={usuario.fotoUrl} alt={usuario.nombre} className="w-full h-full object-cover" />
                ) : (
                  <span>{usuario.nombre.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <label
                  htmlFor="input-foto-perfil"
                  className="inline-block text-xs font-medium text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                >
                  Cambiar foto
                </label>
                <input
                  id="input-foto-perfil"
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  disabled={estado.enviando}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label htmlFor="input-editar-nombre" className="block text-xs font-medium text-gray-600 mb-1">
                Nombre
              </label>
              <input
                id="input-editar-nombre"
                type="text"
                value={estado.nombre}
                onChange={(e) => establecerNombre(e.target.value)}
                disabled={estado.enviando}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="input-editar-apellido" className="block text-xs font-medium text-gray-600 mb-1">
                Apellido
              </label>
              <input
                id="input-editar-apellido"
                type="text"
                value={estado.apellido}
                onChange={(e) => establecerApellido(e.target.value)}
                disabled={estado.enviando}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="input-editar-bio" className="block text-xs font-medium text-gray-600 mb-1">
                Bio
              </label>
              <textarea
                id="input-editar-bio"
                value={estado.bio}
                onChange={(e) => establecerBio(e.target.value)}
                disabled={estado.enviando}
                rows={3}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 resize-none"
              />
            </div>

            {/* RF-16, AC-06.2: sin campo de contraseña; enlace a flujo separado */}
            <div className="pt-1">
              <a
                href="/cambiar-password"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 underline"
              >
                Cambiar contraseña
              </a>
            </div>

            <button
              type="submit"
              disabled={!puedeEnviar || estado.enviando}
              className="w-full mt-2 py-2.5 px-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {estado.enviando && <Spinner tamano="sm" />}
              <span>{estado.enviando ? 'Guardando...' : 'Guardar cambios'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
