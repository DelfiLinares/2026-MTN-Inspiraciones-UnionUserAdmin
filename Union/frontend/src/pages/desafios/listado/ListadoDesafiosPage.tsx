import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { httpClient } from '../../../infrastructure/httpClient'
import {
  construirSearchDesdeFiltros,
  EstadoFiltroDesafio,
  FiltrosListadoDesafios,
  hayFiltrosActivos,
  parsearFiltrosDesdeSearch,
} from './filtrosUrl'
import './listado-desafios.css'

interface DesafioListadoDto {
  id: string
  nombre?: string
  titulo?: string
  fotoPrincipalUrl?: string
  ambitos?: string[]
  fechaInicio?: string
  fechaFin?: string
  estado?: string
}

interface PaginaDesafiosDto {
  items?: DesafioListadoDto[]
  siguienteCursor?: string | null
}

interface AmbitoDto {
  id?: string
  valor?: string
  nombre?: string
}

interface DesafioListadoItem {
  id: string
  nombre: string
  fotoPrincipalUrl?: string
  ambitos: string[]
  fechaInicio?: string
  fechaFin?: string
  estado?: string
}

function mapearDesafioListado(dto: DesafioListadoDto): DesafioListadoItem {
  return {
    id: dto.id,
    nombre: dto.nombre ?? dto.titulo ?? 'Desafío sin nombre',
    fotoPrincipalUrl: dto.fotoPrincipalUrl,
    ambitos: Array.isArray(dto.ambitos) ? dto.ambitos : [],
    fechaInicio: dto.fechaInicio,
    fechaFin: dto.fechaFin,
    estado: dto.estado,
  }
}

async function cargarPaginaDesafios(
  filtros: FiltrosListadoDesafios,
  cursor: string | null,
): Promise<PaginaDesafiosDto> {
  const params: Record<string, string | number | undefined> = {
    limite: 12,
    cursor: cursor ?? undefined,
    ambito: filtros.ambitos.length > 0 ? filtros.ambitos.join(',') : undefined,
    estado: filtros.estado,
  }

  const respuesta = await httpClient.get<PaginaDesafiosDto | DesafioListadoDto[]>('/desafios', {
    params,
  })

  if (Array.isArray(respuesta)) {
    return {
      items: respuesta,
      siguienteCursor: null,
    }
  }

  return {
    items: Array.isArray(respuesta?.items) ? respuesta.items : [],
    siguienteCursor: respuesta?.siguienteCursor ?? null,
  }
}

async function listarAmbitos(): Promise<string[]> {
  try {
    const respuesta = await httpClient.get<AmbitoDto[] | { items?: AmbitoDto[] }>('/ambitos')
    const items = Array.isArray(respuesta) ? respuesta : respuesta?.items ?? []

    return items
      .map((item) => item.valor ?? item.nombre ?? item.id ?? '')
      .map((v) => v.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

function formatearFecha(valor?: string): string {
  if (!valor) return '-'

  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return valor

  return fecha.toLocaleDateString('es-AR')
}

export const ListadoDesafiosPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const filtros = useMemo(() => parsearFiltrosDesdeSearch(location.search), [location.search])

  const [desafios, setDesafios] = useState<DesafioListadoItem[]>([])
  const [cursorActual, setCursorActual] = useState<string | null>(null)
  const [hayMas, setHayMas] = useState<boolean>(true)
  const [cargando, setCargando] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [ambitosDisponibles, setAmbitosDisponibles] = useState<string[]>([])

  const cargar = useCallback(
    async (cursor: string | null, append: boolean) => {
      if (cargando) return

      setCargando(true)
      setError(null)

      try {
        const pagina = await cargarPaginaDesafios(filtros, cursor)
        const itemsNuevos = (pagina.items ?? []).map(mapearDesafioListado)

        setDesafios((prev) => {
          if (!append) {
            return itemsNuevos
          }

          const combinados = [...prev, ...itemsNuevos]
          const vistos = new Set<string>()
          return combinados.filter((item) => {
            if (vistos.has(item.id)) {
              return false
            }
            vistos.add(item.id)
            return true
          })
        })

        const proximoCursor = pagina.siguienteCursor ?? null
        setCursorActual(proximoCursor)
        setHayMas(Boolean(proximoCursor) && itemsNuevos.length > 0)
      } catch {
        setError('No se pudieron cargar los desafíos. Intentá nuevamente.')
      } finally {
        setCargando(false)
      }
    },
    [cargando, filtros],
  )

  useEffect(() => {
    void cargar(null, false)
  }, [cargar])

  useEffect(() => {
    void (async () => {
      const ambitos = await listarAmbitos()
      setAmbitosDisponibles(ambitos)
    })()
  }, [])

  const actualizarFiltrosEnUrl = useCallback(
    (nuevosFiltros: FiltrosListadoDesafios) => {
      const search = construirSearchDesdeFiltros(nuevosFiltros)
      navigate({ pathname: location.pathname, search }, { replace: true })
    },
    [location.pathname, navigate],
  )

  const onCambiarEstado = (estado: string) => {
    actualizarFiltrosEnUrl({
      ...filtros,
      estado: estado ? (estado as EstadoFiltroDesafio) : undefined,
    })
  }

  const onAlternarAmbito = (ambito: string) => {
    const yaExiste = filtros.ambitos.includes(ambito)
    const ambitos = yaExiste
      ? filtros.ambitos.filter((a) => a !== ambito)
      : [...filtros.ambitos, ambito]

    actualizarFiltrosEnUrl({
      ...filtros,
      ambitos,
    })
  }

  const onLimpiarFiltros = () => {
    actualizarFiltrosEnUrl({ ambitos: [], estado: undefined })
  }

  const vacioConFiltros = desafios.length === 0 && !cargando && hayFiltrosActivos(filtros)
  const vacioSinFiltros = desafios.length === 0 && !cargando && !hayFiltrosActivos(filtros)

  return (
    <main className="desafios-listado-page" aria-labelledby="desafios-listado-titulo">
      <header className="desafios-listado-header">
        <h1 id="desafios-listado-titulo">Desafíos</h1>
        <p>Explorá desafíos por ámbito y estado.</p>
      </header>

      <section className="desafios-listado-filtros" aria-label="Filtros de desafíos">
        <div className="filtro-grupo">
          <label htmlFor="filtro-estado">Estado</label>
          <select
            id="filtro-estado"
            value={filtros.estado ?? ''}
            onChange={(e) => onCambiarEstado(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="PROGRAMADO">Programado</option>
            <option value="ACTIVO">Activo</option>
            <option value="FINALIZADO">Finalizado</option>
          </select>
        </div>

        <fieldset className="filtro-grupo filtro-ambitos">
          <legend>Ámbitos</legend>
          {ambitosDisponibles.length === 0 && <span className="filtro-ayuda">Sin ámbitos cargados.</span>}
          <div className="filtro-ambitos-opciones">
            {ambitosDisponibles.map((ambito) => (
              <label key={ambito}>
                <input
                  type="checkbox"
                  checked={filtros.ambitos.includes(ambito)}
                  onChange={() => onAlternarAmbito(ambito)}
                />
                {ambito}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {error && (
        <div role="alert" className="desafios-listado-error">
          <p>{error}</p>
          <button type="button" onClick={() => void cargar(null, false)}>Reintentar</button>
        </div>
      )}

      {vacioConFiltros && (
        <section className="desafios-listado-vacio" aria-live="polite">
          <h2>No encontramos desafíos con esos filtros</h2>
          <p>Podés limpiar los filtros para ver más resultados.</p>
          <button type="button" onClick={onLimpiarFiltros}>Limpiar filtros</button>
        </section>
      )}

      {vacioSinFiltros && (
        <section className="desafios-listado-vacio" aria-live="polite">
          <h2>No hay desafíos disponibles</h2>
          <p>Cuando se publiquen desafíos, aparecerán acá.</p>
        </section>
      )}

      {desafios.length > 0 && (
        <section className="desafios-listado-grid" aria-label="Listado de desafíos">
          {desafios.map((desafio) => (
            <article key={desafio.id} className="desafio-card">
              <div className="desafio-card-media">
                {desafio.fotoPrincipalUrl ? (
                  <img src={desafio.fotoPrincipalUrl} alt={desafio.nombre} loading="lazy" />
                ) : (
                  <div className="desafio-card-placeholder" aria-hidden="true" />
                )}
              </div>
              <div className="desafio-card-contenido">
                <h2>{desafio.nombre}</h2>
                <p>
                  <strong>Estado:</strong> {desafio.estado ?? '-'}
                </p>
                <p>
                  <strong>Inicio:</strong> {formatearFecha(desafio.fechaInicio)}
                </p>
                <p>
                  <strong>Fin:</strong> {formatearFecha(desafio.fechaFin)}
                </p>
                <p className="desafio-card-ambitos">
                  {(desafio.ambitos ?? []).map((ambito) => (
                    <span key={ambito}>#{ambito}</span>
                  ))}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}

      {cargando && (
        <p className="desafios-listado-loading" role="status">
          {desafios.length === 0 ? 'Cargando desafíos...' : 'Cargando más desafíos...'}
        </p>
      )}

      {!cargando && desafios.length > 0 && hayMas && (
        <div className="desafios-listado-mas">
          <button type="button" onClick={() => void cargar(cursorActual, true)}>
            Cargar más
          </button>
        </div>
      )}
    </main>
  )
}
