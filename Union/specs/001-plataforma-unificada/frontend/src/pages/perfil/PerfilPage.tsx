/**
 * Pantalla de Perfil de Usuario — `PerfilPage.tsx`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-08, HU-09, RF-37 a RF-39, RF-53, CB-07)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T091)
 *
 * Descripción:
 * - Obtiene los datos públicos del usuario visitado con `perfilService.obtenerUsuario` (T057).
 * - Muestra el botón "Seguir"/"Siguiendo" de forma condicional (AC-08.5: no se muestra en el
 *   perfil propio), delegando el estado optimista y su reversión ante error a
 *   `perfilService.useSeguirUsuario` (T062, CB-07, AC-08.3, AC-08.4).
 * - AC-08.2: solicita confirmación antes de ejecutar "dejar de seguir".
 * - Lista las carpetas públicas del usuario visitado con `carpetaService.obtenerCarpetas` (T082,
 *   RF-53), renderizadas mediante `CarpetaCard`.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { perfilService } from '../../services/perfilService'
import { carpetaService } from '../../services/carpetaService'
import { CarpetaCard } from '../../components/carpetas'
import { Spinner, Skeleton, EmptyState } from '../../components/comunes'
import type { Usuario } from '../../domain/Usuario'
import type { Carpeta } from '../../domain/Carpeta'

export const PerfilPage: React.FC = () => {
  const { id: idParametro } = useParams<{ id: string }>()
  const { usuario: usuarioActual } = useAuth()

  const perfilVisitadoId = idParametro ?? usuarioActual?.id ?? ''

  const [usuarioPerfil, setUsuarioPerfil] = useState<Usuario | null>(null)
  const [cargandoPerfil, setCargandoPerfil] = useState<boolean>(true)
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null)

  const [carpetas, setCarpetas] = useState<Carpeta[]>([])
  const [cargandoCarpetas, setCargandoCarpetas] = useState<boolean>(true)

  useEffect(() => {
    if (!perfilVisitadoId) {
      return
    }

    let activo = true
    setCargandoPerfil(true)
    setErrorPerfil(null)

    perfilService
      .obtenerUsuario(perfilVisitadoId)
      .then((datos) => {
        if (activo) {
          setUsuarioPerfil(datos)
        }
      })
      .catch(() => {
        if (activo) {
          setErrorPerfil('No se pudo cargar el perfil solicitado.')
        }
      })
      .finally(() => {
        if (activo) {
          setCargandoPerfil(false)
        }
      })

    setCargandoCarpetas(true)
    carpetaService
      .obtenerCarpetas(perfilVisitadoId)
      .then((items) => {
        if (activo) {
          setCarpetas(items)
        }
      })
      .catch(() => {
        // Se conserva el listado vacío si falla la carga de carpetas
      })
      .finally(() => {
        if (activo) {
          setCargandoCarpetas(false)
        }
      })

    return () => {
      activo = false
    }
  }, [perfilVisitadoId])

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {cargandoPerfil ? (
          <Skeleton variante="rectangular" cantidad={1} />
        ) : errorPerfil || !usuarioPerfil ? (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
            {errorPerfil ?? 'Perfil no encontrado.'}
          </div>
        ) : (
          <PerfilEncabezado usuarioPerfil={usuarioPerfil} usuarioActualId={usuarioActual?.id ?? ''} />
        )}

        {/* Carpetas públicas del usuario visitado (HU-09, RF-53) */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Carpetas
          </h2>

          {cargandoCarpetas ? (
            <Skeleton variante="tarjeta" cantidad={3} />
          ) : carpetas.length === 0 ? (
            <EmptyState titulo="Sin carpetas" mensaje="Este usuario todavía no tiene carpetas públicas." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {carpetas.map((carpeta) => (
                <CarpetaCard key={carpeta.id} carpeta={carpeta} usuarioActualId={usuarioActual?.id} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

interface PerfilEncabezadoProps {
  usuarioPerfil: Usuario
  usuarioActualId: string
}

const PerfilEncabezado: React.FC<PerfilEncabezadoProps> = ({ usuarioPerfil, usuarioActualId }) => {
  const { usuario, enviando, error, alternarSeguir } = perfilService.useSeguirUsuario(usuarioPerfil)

  const mostrarBotonSeguir = usuario.puedeMostrarBotonSeguir(usuarioActualId)

  const handleClickSeguir = () => {
    // AC-08.2: Solicitar confirmación antes de dejar de seguir
    if (usuario.siguiendoAlUsuarioActual) {
      const confirmado = window.confirm(`¿Dejar de seguir a ${usuario.nombre} ${usuario.apellido}?`)
      if (!confirmado) {
        return
      }
    }
    void alternarSeguir()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-5">
      <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-semibold overflow-hidden flex-shrink-0">
        {usuario.fotoUrl ? (
          <img src={usuario.fotoUrl} alt={usuario.nombre} className="w-full h-full object-cover" />
        ) : (
          <span>{usuario.nombre.charAt(0).toUpperCase()}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-gray-900 truncate">
          {usuario.nombre} {usuario.apellido}
        </h1>
        {usuario.bio && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{usuario.bio}</p>}
        <p className="text-xs text-gray-500 mt-2">
          {usuario.cantidadSeguidores} {usuario.cantidadSeguidores === 1 ? 'seguidor' : 'seguidores'}
        </p>

        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>

      {/* AC-08.5: El botón Seguir no se muestra en el perfil propio */}
      {mostrarBotonSeguir && (
        <button
          type="button"
          onClick={handleClickSeguir}
          disabled={enviando}
          aria-pressed={usuario.siguiendoAlUsuarioActual}
          className={`flex-shrink-0 px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-2 ${
            usuario.siguiendoAlUsuarioActual
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          } ${enviando ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {enviando && <Spinner tamano="sm" />}
          <span>{usuario.siguiendoAlUsuarioActual ? 'Siguiendo' : 'Seguir'}</span>
        </button>
      )}
    </div>
  )
}
