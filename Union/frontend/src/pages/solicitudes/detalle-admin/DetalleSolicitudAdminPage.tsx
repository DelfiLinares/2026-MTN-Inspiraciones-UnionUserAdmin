import React, { useCallback, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { httpClient } from '../../../infrastructure/httpClient'
import { SolicitudDesafio } from '../../../domain/SolicitudDesafio'
import { Foto } from '../../../domain/Foto'
import { RangoFechas } from '../../../domain/RangoFechas'
import { AmbitoDesafio } from '../../../domain/AmbitoDesafio'
import { FormularioSolicitud, ConfirmarAccionDestructiva } from '../../../desafios/components'
import './detalle-solicitud-admin.css'

interface SolicitudDto {
  id: string
  autorId?: string
  autorNombre?: string
  nombre?: string
  descripcionLarga?: string
  estado?: string
  fotos?: Array<{ id?: string; url: string; formato: string; principal: boolean }>
  rango?: { inicio: string; fin: string }
  ambitos?: Array<{ valor: string }>
  version?: number
  createdAt?: string
}

/**
 * DetalleSolicitudAdminPage (T066)
 *
 * Página ADMIN para editar y eliminar solicitudes de desafíos de cualquier usuario.
 *
 * Funcionalidad:
 * - Cargada desde ruta /solicitudes/:solicitudId
 * - Solo accesible para administradores
 * - Muestra datos de la solicitud y permite:
 *   - Editar: PUT /solicitudes/:id con los campos editables
 *   - Eliminar: DELETE /solicitudes/:id con confirmación explícita
 * - Maneja errores HTTP:
 *   - 401: sesión inválida, redirige a login
 *   - 403: permiso denegado
 *   - 404: solicitud no encontrada
 *   - 409: conflicto de versión
 *
 * Requisitos cumplidos:
 * - HU-07: Como administrador, editar y eliminar solicitudes de cualquier usuario
 * - RF-10: Editar solicitud (solo admin o autor)
 * - RF-11: Eliminar solicitud (solo admin o autor) con confirmación
 *
 * Dependencias:
 * - T014 (SolicitudDesafio)
 * - T042 (useMutacionesSolicitud - EditarSolicitud, EliminarSolicitud) - usamos httpClient directamente
 * - T052 (ConfirmarAccionDestructiva)
 * - T054 (FormularioSolicitud)
 *
 * Fuente: specs/003-desafios/spec.md (HU-07), tasks.md (T066)
 */
export const DetalleSolicitudAdminPage: React.FC = () => {
  const { solicitudId } = useParams<{ solicitudId: string }>()
  const navigate = useNavigate()

  const [solicitud, setSolicitud] = useState<SolicitudDesafio | null>(null)
  const [ambitosDisponibles, setAmbitosDisponibles] = useState<string[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [guardando, setGuardando] = useState<boolean>(false)
  const [eliminando, setEliminando] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState<boolean>(false)

  // Cargar solicitud y ámbitos al montar
  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      setError(null)

      try {
        // Cargar solicitud
        if (!solicitudId) {
          setError('ID de solicitud no proporcionado.')
          navigate('/solicitudes')
          return
        }

        const respuestaSolicitud = await httpClient.get<SolicitudDto>(
          `/solicitudes/${solicitudId}`
        )

        // Mapear DTO a dominio
        const fotos = respuestaSolicitud.fotos?.map(f => 
          new Foto({
            id: f.id ?? `foto-${Date.now()}-${Math.random()}`,
            url: f.url,
            formato: f.formato as 'JPEG' | 'PNG',
            principal: f.principal,
          })
        ) ?? []

        const rango = respuestaSolicitud.rango
          ? new RangoFechas({
              inicio: new Date(respuestaSolicitud.rango.inicio),
              fin: new Date(respuestaSolicitud.rango.fin),
            })
          : undefined

        const ambitos = respuestaSolicitud.ambitos?.map(a =>
          new AmbitoDesafio({ valor: a.valor })
        ) ?? []

        const solicitudDominio = new SolicitudDesafio({
          id: respuestaSolicitud.id,
          autorId: respuestaSolicitud.autorId,
          nombre: respuestaSolicitud.nombre,
          descripcionLarga: respuestaSolicitud.descripcionLarga,
          fotos,
          rango,
          ambitos,
          estado: (respuestaSolicitud.estado as any) ?? 'PENDIENTE',
          version: respuestaSolicitud.version,
        })

        setSolicitud(solicitudDominio)

        // Cargar ámbitos disponibles
        try {
          const respuestaAmbitos = await httpClient.get<Array<{ valor: string }>>('/ambitos')
          const ambitosValues = Array.isArray(respuestaAmbitos)
            ? respuestaAmbitos.map(a => a.valor)
            : []
          setAmbitosDisponibles(ambitosValues)
        } catch {
          // Si no se pueden cargar ámbitos, continuamos sin ellos
          setAmbitosDisponibles([])
        }
      } catch (err: any) {
        if (err?.status === 401) {
          setError('Debes iniciar sesión para acceder a esta solicitud.')
          navigate('/login')
        } else if (err?.status === 403) {
          setError('No tienes permiso para acceder a esta solicitud.')
          navigate('/solicitudes')
        } else if (err?.status === 404) {
          setError('La solicitud no existe o ha sido eliminada.')
          navigate('/solicitudes')
        } else {
          setError('Error al cargar la solicitud. Intentá nuevamente.')
        }
      } finally {
        setCargando(false)
      }
    }

    cargar()
  }, [solicitudId, navigate])

  const handleGuardarCambios = useCallback(
    async (solicitudEditada: SolicitudDesafio) => {
      if (!solicitud?.id) return

      setGuardando(true)
      setError(null)

      try {
        const payload = {
          nombre: solicitudEditada.nombre,
          descripcionLarga: solicitudEditada.descripcionLarga,
          fotos: solicitudEditada.fotos?.map(f => ({
            url: f.url,
            formato: f.formato,
            principal: f.principal,
          })) ?? [],
          rango: solicitudEditada.rango
            ? {
                inicio: solicitudEditada.rango.inicio.toISOString(),
                fin: solicitudEditada.rango.fin.toISOString(),
              }
            : undefined,
          ambitos: solicitudEditada.ambitos?.map(a => ({ valor: a.valor })) ?? [],
          version: solicitud.version,
        }

        const respuesta = await httpClient.put<SolicitudDto>(
          `/solicitudes/${solicitud.id}`,
          payload
        )

        // Actualizar solicitud local
        const fotos = respuesta.fotos?.map(f =>
          new Foto({
            id: f.id ?? `foto-${Date.now()}-${Math.random()}`,
            url: f.url,
            formato: f.formato as 'JPEG' | 'PNG',
            principal: f.principal,
          })
        ) ?? []

        const rango = respuesta.rango
          ? new RangoFechas({
              inicio: new Date(respuesta.rango.inicio),
              fin: new Date(respuesta.rango.fin),
            })
          : undefined

        const ambitos = respuesta.ambitos?.map(a =>
          new AmbitoDesafio({ valor: a.valor })
        ) ?? []

        const solicitudActualizada = new SolicitudDesafio({
          id: respuesta.id,
          autorId: respuesta.autorId,
          nombre: respuesta.nombre,
          descripcionLarga: respuesta.descripcionLarga,
          fotos,
          rango,
          ambitos,
          estado: (respuesta.estado as any) ?? 'PENDIENTE',
          version: respuesta.version,
        })

        setSolicitud(solicitudActualizada)
        setError(null)
      } catch (err: any) {
        if (err?.status === 401) {
          setError('Tu sesión expiró. Iniciá sesión nuevamente.')
          navigate('/login')
        } else if (err?.status === 403) {
          setError('No tienes permiso para editar esta solicitud.')
        } else if (err?.status === 404) {
          setError('La solicitud ya no existe.')
          navigate('/solicitudes')
        } else if (err?.status === 409) {
          setError('La solicitud fue modificada por otro proceso. Recargá la página.')
        } else {
          setError('Error al guardar los cambios. Intentá nuevamente.')
        }
      } finally {
        setGuardando(false)
      }
    },
    [solicitud, navigate]
  )

  const handleEliminar = useCallback(async () => {
    if (!solicitud?.id) return

    setEliminando(true)
    setError(null)

    try {
      await httpClient.delete(`/solicitudes/${solicitud.id}`)
      // Redirigir a la bandeja
      navigate('/solicitudes')
    } catch (err: any) {
      if (err?.status === 401) {
        setError('Tu sesión expiró. Iniciá sesión nuevamente.')
        navigate('/login')
      } else if (err?.status === 403) {
        setError('No tienes permiso para eliminar esta solicitud.')
      } else if (err?.status === 404) {
        setError('La solicitud ya no existe.')
        navigate('/solicitudes')
      } else {
        setError('Error al eliminar la solicitud. Intentá nuevamente.')
      }
    } finally {
      setEliminando(false)
      setMostrarConfirmacionEliminar(false)
    }
  }, [solicitud?.id, navigate])

  if (cargando) {
    return (
      <div className="detalle-solicitud-admin-page">
        <div className="detalle-solicitud-admin-cargando">
          <p>Cargando solicitud...</p>
        </div>
      </div>
    )
  }

  if (!solicitud) {
    return (
      <div className="detalle-solicitud-admin-page">
        <div className="detalle-solicitud-admin-error-principal">
          <p>{error || 'No se pudo cargar la solicitud.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="detalle-solicitud-admin-page">
      <header className="detalle-solicitud-admin-header">
        <button
          className="detalle-solicitud-admin-volver"
          onClick={() => navigate('/solicitudes')}
          aria-label="Volver a la bandeja de solicitudes"
        >
          ← Volver
        </button>
        <h1>Editar Solicitud</h1>
        <p className="detalle-solicitud-admin-subtitulo">
          Autor: <strong>{solicitud.autorId || 'desconocido'}</strong> | Estado:{' '}
          <strong>{solicitud.estado}</strong>
        </p>
      </header>

      {error && (
        <div className="detalle-solicitud-admin-error" role="alert">
          {error}
        </div>
      )}

      <main className="detalle-solicitud-admin-contenedor">
        <section className="detalle-solicitud-admin-formulario-contenedor">
          <FormularioSolicitud
            solicitudInicial={solicitud}
            ambitorDisponibles={ambitosDisponibles}
            cargando={guardando}
            deshabilitado={guardando || eliminando}
            onEnviar={handleGuardarCambios}
          />
        </section>

        <aside className="detalle-solicitud-admin-acciones">
          <div className="detalle-solicitud-admin-acciones-grupo">
            <h2>Acciones</h2>
            <button
              className="detalle-solicitud-admin-btn-eliminar"
              onClick={() => setMostrarConfirmacionEliminar(true)}
              disabled={guardando || eliminando}
              aria-label="Eliminar esta solicitud"
            >
              Eliminar solicitud
            </button>
            <p className="detalle-solicitud-admin-nota">
              Solo los administradores pueden eliminar solicitudes de otros usuarios.
            </p>
          </div>
        </aside>
      </main>

      <ConfirmarAccionDestructiva
        caso="eliminar-solicitud"
        abierto={mostrarConfirmacionEliminar}
        confirmando={eliminando}
        onConfirmar={handleEliminar}
        onCancelar={() => setMostrarConfirmacionEliminar(false)}
      />

      <footer className="detalle-solicitud-admin-footer">
        <p>
          Esta página permite al administrador editar o eliminar solicitudes de desafíos de
          cualquier usuario.
        </p>
      </footer>
    </div>
  )
}
