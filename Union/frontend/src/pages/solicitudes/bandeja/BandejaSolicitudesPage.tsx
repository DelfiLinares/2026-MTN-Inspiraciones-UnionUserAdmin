import React, { useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { httpClientAdmin as httpClient } from '../../../infrastructure/httpClientAdmin'
import './bandeja-solicitudes.css'

interface SolicitudDto {
  id: string
  autorId?: string
  autorNombre?: string
  estado?: string
  createdAt?: string
  descripcion?: string
  contenido?: Record<string, unknown>
}

interface PaginaSolicitudesDto {
  items?: SolicitudDto[]
  siguienteCursor?: string | null
}

interface SolicitudItem {
  id: string
  autorId?: string
  autorNombre: string
  estado?: string
  createdAt?: string
  descripcion?: string
}

/**
 * BandejaSolicitudesPage (T065)
 * 
 * Página ADMIN para gestionar solicitudes de desafíos.
 * 
 * Funcionalidad:
 * - Solo accesible para administradores
 * - Lista todas las solicitudes en estado `PENDIENTE` paginadas
 * - Muestra: autor, descripción, fecha de creación, estado
 * - Acciones: Aprobar, Rechazar (cambian estado de la solicitud)
 * - Maneja casos borde:
 *   - CB-03: Si solicitud es eliminada mientras admin la está aprobando
 *   - CB-06: Una solicitud ya resuelta no vuelve a PENDIENTE
 * - Nota: Aprobar solo cambia estado a APROBADA; publicar es paso aparte (A-03)
 * 
 * Requisitos cumplidos:
 * - HU-06: Como administrador, quiero ver solicitudes pendientes y aprobarlas/rechazarlas
 * - CB-03: Manejo de solicitud eliminada durante aprobación
 * - CB-06: Solicitud ya resuelta no vuelve a PENDIENTE
 * - RF-16: Aprobar solicitud (solo cambia estado)
 * - RF-17: Rechazar solicitud
 * 
 * Dependencias:
 * - T040 (useListarSolicitudes)
 * - T042 (useMutacionesSolicitud - AprobarSolicitud, RechazarSolicitud)
 * 
 * Fuente: specs/003-desafios/spec.md (HU-06, CB-03, CB-06), tasks.md (T065)
 */
export const BandejaSolicitudesPage: React.FC = () => {
  const navigate = useNavigate()

  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([])
  const [cursorActual, setCursorActual] = useState<string | null>(null)
  const [hayMas, setHayMas] = useState<boolean>(true)
  const [cargando, setCargando] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [procesandoId, setProcesandoId] = useState<string | null>(null)

  // Cargar solicitudes inicialmente
  useEffect(() => {
    cargarSolicitudes(null, false)
  }, [])

  const cargarSolicitudes = useCallback(
    async (cursor: string | null, append: boolean) => {
      if (cargando) return

      setCargando(true)
      setError(null)

      try {
        const params: Record<string, string | number | undefined> = {
          limite: 20,
          cursor: cursor ?? undefined,
          estado: 'PENDIENTE', // Solo PENDIENTE
        }

        const respuesta = await httpClient.get<PaginaSolicitudesDto | SolicitudDto[]>(
          '/solicitudes',
          { params }
        )

        let items: SolicitudDto[] = []
        let proximoCursor: string | null = null

        if (Array.isArray(respuesta)) {
          items = respuesta
        } else {
          items = respuesta?.items ?? []
          proximoCursor = respuesta?.siguienteCursor ?? null
        }

        const itemsMapeados: SolicitudItem[] = items.map((dto) => ({
          id: dto.id,
          autorId: dto.autorId,
          autorNombre: dto.autorNombre || 'Usuario desconocido',
          estado: dto.estado,
          createdAt: dto.createdAt,
          descripcion: dto.descripcion,
        }))

        setSolicitudes((prev) => {
          if (!append) {
            return itemsMapeados
          }

          const combinados = [...prev, ...itemsMapeados]
          const vistos = new Set<string>()
          return combinados.filter((item) => {
            if (vistos.has(item.id)) {
              return false
            }
            vistos.add(item.id)
            return true
          })
        })

        setCursorActual(proximoCursor)
        setHayMas(Boolean(proximoCursor) && itemsMapeados.length > 0)
      } catch (err) {
        setError('Error al cargar solicitudes.')
      } finally {
        setCargando(false)
      }
    },
    [cargando]
  )

  const handleAprobar = async (solicitud: SolicitudItem) => {
    setProcesandoId(solicitud.id)
    setError(null)

    try {
      await httpClient.put(`/solicitudes/${solicitud.id}/aprobar`, {})

      // Eliminar de la lista (se aprobó)
      setSolicitudes((prev) => prev.filter((s) => s.id !== solicitud.id))
    } catch (err: any) {
      if (err?.status === 401) {
        setError('Debes iniciar sesión para aprobar solicitudes.')
        navigate('/login-admin')
      } else if (err?.status === 403) {
        setError('No tienes permiso para aprobar solicitudes.')
      } else if (err?.status === 404) {
        setError(`La solicitud ya no existe (fue eliminada por el usuario - CB-03).`)
        setSolicitudes((prev) => prev.filter((s) => s.id !== solicitud.id))
      } else if (err?.status === 409) {
        setError(
          `La solicitud ya ha sido resuelta o está en conflicto (CB-06). Recargá la página.`
        )
        setSolicitudes((prev) => prev.filter((s) => s.id !== solicitud.id))
      } else {
        setError(`Error al aprobar la solicitud. Intentá nuevamente.`)
      }
    } finally {
      setProcesandoId(null)
    }
  }

  const handleRechazar = async (solicitud: SolicitudItem) => {
    setProcesandoId(solicitud.id)
    setError(null)

    try {
      await httpClient.put(`/solicitudes/${solicitud.id}/rechazar`, {})

      // Eliminar de la lista (se rechazó)
      setSolicitudes((prev) => prev.filter((s) => s.id !== solicitud.id))
    } catch (err: any) {
      if (err?.status === 401) {
        setError('Debes iniciar sesión para rechazar solicitudes.')
        navigate('/login-admin')
      } else if (err?.status === 403) {
        setError('No tienes permiso para rechazar solicitudes.')
      } else if (err?.status === 404) {
        setError(`La solicitud ya no existe (fue eliminada por el usuario - CB-03).`)
        setSolicitudes((prev) => prev.filter((s) => s.id !== solicitud.id))
      } else if (err?.status === 409) {
        setError(
          `La solicitud ya ha sido resuelta o está en conflicto (CB-06). Recargá la página.`
        )
        setSolicitudes((prev) => prev.filter((s) => s.id !== solicitud.id))
      } else {
        setError(`Error al rechazar la solicitud. Intentá nuevamente.`)
      }
    } finally {
      setProcesandoId(null)
    }
  }

  const handleCargarMas = () => {
    if (hayMas && !cargando) {
      cargarSolicitudes(cursorActual, true)
    }
  }

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return '-'
    const d = new Date(fecha)
    if (Number.isNaN(d.getTime())) return fecha
    return d.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bandeja-solicitudes-page">
      <header className="bandeja-solicitudes-header">
        <h1>Bandeja de Solicitudes</h1>
        <p className="bandeja-solicitudes-subtitulo">
          Revisa y actúa sobre las solicitudes pendientes de desafíos
        </p>
      </header>

      {error && (
        <div className="bandeja-solicitudes-error" role="alert">
          {error}
          <button type="button" onClick={() => cargarSolicitudes(null, false)}>Reintentar</button>
        </div>
      )}

      <div className="bandeja-solicitudes-contenedor">
        {solicitudes.length === 0 && !cargando && !error && (
          <div className="bandeja-solicitudes-vacio">
            <p>No hay solicitudes pendientes para revisar.</p>
            <p className="bandeja-solicitudes-subtexto">
              Cuando los usuarios propongan nuevos desafíos, aparecerán aquí.
            </p>
          </div>
        )}

        <div className="bandeja-solicitudes-lista">
          {solicitudes.map((solicitud) => (
            <div key={solicitud.id} className="bandeja-solicitudes-item">
              <div className="bandeja-solicitudes-info">
                <h3 className="bandeja-solicitudes-autor">{solicitud.autorNombre}</h3>
                {solicitud.descripcion && (
                  <p className="bandeja-solicitudes-descripcion">{solicitud.descripcion}</p>
                )}
                <p className="bandeja-solicitudes-fecha">
                  Enviado: {formatearFecha(solicitud.createdAt)}
                </p>
              </div>

              <div className="bandeja-solicitudes-acciones"><button type="button" onClick={() => navigate(`/admin/solicitudes/${solicitud.id}`)}>Ver y editar solicitud</button>
                <button
                  className="bandeja-solicitudes-btn-aprobar"
                  onClick={() => handleAprobar(solicitud)}
                  disabled={procesandoId === solicitud.id}
                  title="Aprobar solicitud (solo cambia estado a APROBADA)"
                >
                  {procesandoId === solicitud.id ? 'Procesando...' : 'Aprobar'}
                </button>
                <button
                  className="bandeja-solicitudes-btn-rechazar"
                  onClick={() => handleRechazar(solicitud)}
                  disabled={procesandoId === solicitud.id}
                  title="Rechazar solicitud (cambia estado a RECHAZADA)"
                >
                  {procesandoId === solicitud.id ? 'Procesando...' : 'Rechazar'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {cargando && (
          <div className="bandeja-solicitudes-cargando">
            <p>Cargando solicitudes...</p>
          </div>
        )}

        {hayMas && !cargando && (
          <div className="bandeja-solicitudes-cargar-mas">
            <button
              className="bandeja-solicitudes-btn-cargar"
              onClick={handleCargarMas}
              disabled={cargando}
            >
              Cargar más solicitudes
            </button>
          </div>
        )}
      </div>

<aside className="bandeja-solicitudes-nota"><h3>Después de aprobar</h3><p>La aprobación cambia el estado de la solicitud. Para que la comunidad pueda participar, publicá el desafío desde la sección Desafíos.</p></aside>
    </div>
  )
}
