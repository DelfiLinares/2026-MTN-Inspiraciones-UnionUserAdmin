import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { httpClient } from '../../../infrastructure/httpClient'
import { ListaRespuestas } from '../../../desafios/components'
import { RespuestaDesafio } from '../../../domain/RespuestaDesafio'
import './detalle-desafios.css'

interface DesafioDetalleDto {
  id: string
  nombre?: string
  titulo?: string
  descripcionLarga?: string
  descripcion?: string
  fotos?: Array<{
    id: string
    url: string
    formato?: string
    principal?: boolean
  }>
  ambitos?: string[]
  tags?: string[]
  fechaInicio?: string
  fechaFin?: string
  estado?: string
}

interface PaginaRespuestasDto {
  items?: Array<{
    id: string
    autorId: string
    contenido?: {
      tipo: 'imagen' | 'video' | 'audio'
      url: string
      formato: string
    }
  }>
  siguienteCursor?: string | null
}

function mapearRespuestaDto(dto: any, desafioId: string): RespuestaDesafio {
  return new RespuestaDesafio({
    id: dto.id,
    desafioId,
    autorId: dto.autorId,
    contenido: dto.contenido,
  })
}

function formatearFecha(valor?: string): string {
  if (!valor) return '-'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return valor
  return fecha.toLocaleDateString('es-AR')
}

export const DetalleDesafioPage: React.FC = () => {
  const { desafioId } = useParams<{ desafioId: string }>()

  const [desafio, setDesafio] = useState<DesafioDetalleDto | null>(null)
  const [respuestas, setRespuestas] = useState<RespuestaDesafio[]>([])
  const [cursorRespuestas, setCursorRespuestas] = useState<string | null>(null)
  const [hayMasRespuestas, setHayMasRespuestas] = useState<boolean>(true)
  const [cargandoDesafio, setCargandoDesafio] = useState<boolean>(true)
  const [cargandoRespuestas, setCargandoRespuestas] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [noDisponible, setNoDisponible] = useState<boolean>(false)

  // Cargar desafío
  useEffect(() => {
    if (!desafioId) return

    const cargar = async () => {
      setCargandoDesafio(true)
      setError(null)
      setNoDisponible(false)

      try {
        const data = await httpClient.get<DesafioDetalleDto>(`/desafios/${desafioId}`)
        setDesafio(data)
      } catch (err: any) {
        if (err?.status === 404) {
          setNoDisponible(true)
        } else {
          setError('No se pudo cargar el desafío. Intentá nuevamente.')
        }
      } finally {
        setCargandoDesafio(false)
      }
    }

    void cargar()
  }, [desafioId])

  // Cargar respuestas
  useEffect(() => {
    if (!desafio?.id) return

    const cargar = async () => {
      setCargandoRespuestas(true)
      setError(null)

      try {
        const data = await httpClient.get<PaginaRespuestasDto>(
          `/desafios/${desafio.id}/respuestas`,
          { params: { limite: 10, cursor: cursorRespuestas ?? undefined } },
        )

        const nuevasRespuestas = (data?.items ?? []).map((dto) => {
          return mapearRespuestaDto(dto, desafio.id)
        })

        setRespuestas((prev) => {
          if (cursorRespuestas === null) {
            return nuevasRespuestas
          }
          const combinadas = [...prev, ...nuevasRespuestas]
          const vistos = new Set<string>()
          return combinadas.filter((item) => {
            if (!item.id || vistos.has(item.id)) {
              return false
            }
            vistos.add(item.id)
            return true
          })
        })

        const proximoCursor = data?.siguienteCursor ?? null
        setCursorRespuestas(proximoCursor)
        setHayMasRespuestas(Boolean(proximoCursor) && nuevasRespuestas.length > 0)
      } catch {
        setError('No se pudieron cargar las respuestas.')
      } finally {
        setCargandoRespuestas(false)
      }
    }

    void cargar()
  }, [desafio?.id])

  const cargarMasRespuestas = useCallback(async () => {
    if (!desafio?.id || !hayMasRespuestas || cargandoRespuestas) return

    setCargandoRespuestas(true)
    try {
      const data = await httpClient.get<PaginaRespuestasDto>(
        `/desafios/${desafio.id}/respuestas`,
        { params: { limite: 10, cursor: cursorRespuestas ?? undefined } },
      )

      const nuevasRespuestas = (data?.items ?? []).map((dto) => {
        return mapearRespuestaDto(dto, desafio.id)
      })

      setRespuestas((prev) => {
        const combinadas = [...prev, ...nuevasRespuestas]
        const vistos = new Set<string>()
        return combinadas.filter((item) => {
          if (!item.id || vistos.has(item.id)) {
            return false
          }
          vistos.add(item.id)
          return true
        })
      })

      const proximoCursor = data?.siguienteCursor ?? null
      setCursorRespuestas(proximoCursor)
      setHayMasRespuestas(Boolean(proximoCursor) && nuevasRespuestas.length > 0)
    } finally {
      setCargandoRespuestas(false)
    }
  }, [desafio?.id, hayMasRespuestas, cargandoRespuestas, cursorRespuestas])

  if (cargandoDesafio) {
    return (
      <main className="detalle-desafios-page">
        <p className="detalle-loading">Cargando desafío...</p>
      </main>
    )
  }

  if (noDisponible) {
    return (
      <main className="detalle-desafios-page">
        <div className="detalle-no-disponible">
          <h1>Desafío no disponible</h1>
          <p>El desafío que buscás no existe o fue eliminado.</p>
        </div>
      </main>
    )
  }

  if (error && !desafio) {
    return (
      <main className="detalle-desafios-page">
        <div className="detalle-error" role="alert">
          <h1>Error</h1>
          <p>{error}</p>
        </div>
      </main>
    )
  }

  if (!desafio) {
    return null
  }

  const fotosArray = Array.isArray(desafio.fotos) ? desafio.fotos : []
  const ambitosArray = Array.isArray(desafio.ambitos) ? desafio.ambitos : Array.isArray(desafio.tags) ? desafio.tags : []

  return (
    <main className="detalle-desafios-page" aria-labelledby="detalle-titulo">
      {/* Galerías de fotos */}
      {fotosArray.length > 0 && (
        <section className="detalle-fotos" aria-label="Fotos del desafío">
          {fotosArray.map((foto, idx) => (
            <figure key={foto.id} className="detalle-foto-container">
              <img src={foto.url} alt={`Foto ${idx + 1}`} loading={idx === 0 ? 'eager' : 'lazy'} />
              {foto.principal && <figcaption className="detalle-foto-principal">Foto principal</figcaption>}
            </figure>
          ))}
        </section>
      )}

      {/* Encabezado */}
      <section className="detalle-encabezado">
        <h1 id="detalle-titulo">{desafio.nombre ?? desafio.titulo ?? 'Desafío sin nombre'}</h1>
        <p className="detalle-estado" role="status">
          <strong>Estado:</strong> {desafio.estado ?? '-'}
        </p>
      </section>

      {/* Descripción */}
      {(desafio.descripcionLarga || desafio.descripcion) && (
        <section className="detalle-descripcion">
          <p>{desafio.descripcionLarga ?? desafio.descripcion}</p>
        </section>
      )}

      {/* Ámbitos y Fechas */}
      <section className="detalle-info">
        {ambitosArray.length > 0 && (
          <div className="detalle-ambitos">
            <strong>Ámbitos:</strong>
            <p className="detalle-ambitos-lista">
              {ambitosArray.map((ambito) => (
                <span key={ambito}>#{ambito}</span>
              ))}
            </p>
          </div>
        )}

        <div className="detalle-fechas">
          <strong>Fecha de inicio:</strong>
          <p>{formatearFecha(desafio.fechaInicio)}</p>
        </div>

        <div className="detalle-fechas">
          <strong>Fecha de fin:</strong>
          <p>{formatearFecha(desafio.fechaFin)}</p>
        </div>
      </section>

      {/* Respuestas */}
      <section className="detalle-respuestas" aria-labelledby="respuestas-titulo">
        <h2 id="respuestas-titulo">Respuestas</h2>

        {error && (
          <div role="alert" className="detalle-respuestas-error">
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </div>
        )}

        {respuestas.length === 0 && !cargandoRespuestas && (
          <div className="detalle-respuestas-vacio" role="status">
            <p>No hay respuestas aún para este desafío.</p>
          </div>
        )}

        {respuestas.length > 0 && <ListaRespuestas respuestas={respuestas} />}

        {cargandoRespuestas && (
          <p className="detalle-respuestas-loading" role="status">
            {respuestas.length === 0 ? 'Cargando respuestas...' : 'Cargando más respuestas...'}
          </p>
        )}

        {!cargandoRespuestas && respuestas.length > 0 && hayMasRespuestas && (
          <div className="detalle-respuestas-mas">
            <button type="button" onClick={cargarMasRespuestas}>
              Cargar más respuestas
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
