import React, { useCallback, useEffect, useState } from 'react'
import { httpClient } from '../../../infrastructure/httpClient'
import './mis-solicitudes.css'

interface SolicitudDesafioDto {
  id: string
  autorId?: string
  nombre?: string
  descripcionLarga?: string
  estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
  fotos?: Array<{
    id: string
    url: string
    formato?: string
  }>
  ambitos?: string[]
  fechaInicio?: string
  fechaFin?: string
}

interface SolicitudViewable {
  id: string
  autorId?: string
  nombre?: string
  descripcionLarga?: string
  estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
  fotoUrl?: string
  ambitos?: string[]
}

function mapearSolicitudDto(dto: SolicitudDesafioDto): SolicitudViewable {
  return {
    id: dto.id,
    autorId: dto.autorId,
    nombre: dto.nombre,
    descripcionLarga: dto.descripcionLarga,
    estado: dto.estado,
    fotoUrl: dto.fotos?.[0]?.url,
    ambitos: dto.ambitos,
  }
}

function obtenerTextoEstado(estado?: string): string {
  switch (estado) {
    case 'PENDIENTE':
      return 'Pendiente'
    case 'APROBADA':
      return 'Aprobada'
    case 'RECHAZADA':
      return 'Rechazada'
    default:
      return 'Desconocido'
  }
}

function obtenerClaseEstado(estado?: string): string {
  switch (estado) {
    case 'PENDIENTE':
      return 'estado-pendiente'
    case 'APROBADA':
      return 'estado-aprobada'
    case 'RECHAZADA':
      return 'estado-rechazada'
    default:
      return ''
  }
}

export const MisSolicitudesPage: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudViewable[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      setError(null)

      try {
        const data = await httpClient.get<SolicitudDesafioDto[]>('/solicitudes/mis-solicitudes')
        const solicitudesMapeadas = (data ?? []).map((dto) => mapearSolicitudDto(dto))
        setSolicitudes(solicitudesMapeadas)
      } catch (err: any) {
        if (err?.status === 401) {
          setError('Debes iniciar sesión para ver tus solicitudes.')
        } else {
          setError('No se pudieron cargar las solicitudes. Intentá nuevamente.')
        }
      } finally {
        setCargando(false)
      }
    }

    void cargar()
  }, [])

  if (cargando) {
    return (
      <main className="mis-solicitudes-page">
        <p className="mis-solicitudes-loading">Cargando tus solicitudes...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mis-solicitudes-page">
        <div className="mis-solicitudes-error" role="alert">
          <h1>Error</h1>
          <p>{error}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="mis-solicitudes-page" aria-labelledby="mis-solicitudes-titulo">
      <header className="mis-solicitudes-encabezado">
        <h1 id="mis-solicitudes-titulo">Mis solicitudes</h1>
        <p className="mis-solicitudes-descripcion">Aquí puedes ver el estado de tus solicitudes de desafíos.</p>
      </header>

      {solicitudes.length === 0 && (
        <div className="mis-solicitudes-vacio" role="status">
          <p>No tienes solicitudes aún.</p>
          <p className="mis-solicitudes-vacio-subtexto">
            Crea una nueva solicitud para proponer un desafío.
          </p>
        </div>
      )}

      {solicitudes.length > 0 && (
        <section className="mis-solicitudes-lista" aria-labelledby="mis-solicitudes-titulo">
          {solicitudes.map((solicitud) => (
            <article
              key={solicitud.id}
              className={`mis-solicitudes-tarjeta ${obtenerClaseEstado(solicitud.estado)}`}
            >
              {solicitud.fotoUrl && (
                <div className="mis-solicitudes-imagen">
                  <img
                    src={solicitud.fotoUrl}
                    alt={solicitud.nombre || 'Solicitud'}
                    loading="lazy"
                  />
                </div>
              )}

              <div className="mis-solicitudes-contenido">
                <h2>{solicitud.nombre || 'Solicitud sin nombre'}</h2>

                <div className="mis-solicitudes-meta">
                  <span className={`mis-solicitudes-estado ${obtenerClaseEstado(solicitud.estado)}`}>
                    {obtenerTextoEstado(solicitud.estado)}
                  </span>
                </div>

                {solicitud.descripcionLarga && (
                  <p className="mis-solicitudes-descripcion-breve">{solicitud.descripcionLarga}</p>
                )}

                {solicitud.ambitos && solicitud.ambitos.length > 0 && (
                  <div className="mis-solicitudes-ambitos">
                    {solicitud.ambitos.map((ambito: string) => (
                      <span key={ambito} className="mis-solicitudes-ambito">
                        #{ambito}
                      </span>
                    ))}
                  </div>
                )}

                <footer className="mis-solicitudes-acciones">
                  {solicitud.estado === 'PENDIENTE' && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => console.log('Editar:', solicitud.id)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => console.log('Eliminar:', solicitud.id)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                  {solicitud.estado !== 'PENDIENTE' && (
                    <p className="mis-solicitudes-estado-fijo">
                      No puedes editar o eliminar solicitudes que ya han sido resueltas.
                    </p>
                  )}
                </footer>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
