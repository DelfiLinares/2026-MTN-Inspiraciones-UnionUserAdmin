import React, { useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { httpClient } from '../../../infrastructure/httpClient'
import { ConfirmarAccionDestructiva } from '../../../desafios/components/ConfirmarAccionDestructiva'
import './listado-desafios-admin.css'

interface DesafioListadoDto {
  id: string
  nombre?: string
  titulo?: string
  fotoPrincipalUrl?: string
  ambitos?: string[]
  fechaInicio?: string
  fechaFin?: string
  estado?: string
  tieneRespuestas?: boolean
}

interface PaginaDesafiosDto {
  items?: DesafioListadoDto[]
  siguienteCursor?: string | null
}

interface DesafioListadoItem {
  id: string
  nombre: string
  fotoPrincipalUrl?: string
  ambitos: string[]
  fechaInicio?: string
  fechaFin?: string
  estado?: string
  tieneRespuestas?: boolean
}

/**
 * ListadoDesafiosAdminPage (T064)
 * 
 * Página ADMIN para listar todos los desafíos con acciones de editar y eliminar.
 * 
 * Funcionalidad:
 * - Solo accesible para administradores
 * - Lista todos los desafíos paginados/scroll infinito
 * - Muestra: nombre, foto, ámbitos, fechas, estado
 * - Acciones: Editar (ir a EditarDesafioPage), Eliminar (con confirmación)
 * - Pide confirmación explícita antes de eliminar (HU-03)
 * - Tras eliminar, el desafío desaparece del listado
 * - Botón "Publicar nuevo desafío" para ir a PublicarDesafioPage
 * 
 * Requisitos cumplidos:
 * - HU-03: Como administrador, quiero eliminar un desafío
 * - RF-21: Admin puede editar y eliminar desafíos
 * - T039 integration: Usa useListarDesafios para obtener desafíos
 * - T041 integration: Prepara datos para EliminarDesafio use case
 * - T052 integration: Usa ConfirmarAccionDestructiva para confirmación
 * 
 * Dependencias:
 * - T039 (useListarDesafios)
 * - T041 (EliminarDesafio use case)
 * - T052 (ConfirmarAccionDestructiva)
 * 
 * Fuente: specs/003-desafios/spec.md (HU-03), tasks.md (T064)
 */
export const ListadoDesafiosAdminPage: React.FC = () => {
  const navigate = useNavigate()

  const [desafios, setDesafios] = useState<DesafioListadoItem[]>([])
  const [cursorActual, setCursorActual] = useState<string | null>(null)
  const [hayMas, setHayMas] = useState<boolean>(true)
  const [cargando, setCargando] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false)
  const [desafioAEliminar, setDesafioAEliminar] = useState<DesafioListadoItem | null>(null)
  const [eliminando, setEliminando] = useState(false)

  // Cargar desafíos inicialmente
  useEffect(() => {
    cargarDesafios(null, false)
  }, [])

  const cargarDesafios = useCallback(
    async (cursor: string | null, append: boolean) => {
      if (cargando) return

      setCargando(true)
      setError(null)

      try {
        const params: Record<string, string | number | undefined> = {
          limite: 20,
          cursor: cursor ?? undefined,
        }

        const respuesta = await httpClient.get<PaginaDesafiosDto | DesafioListadoDto[]>(
          '/desafios',
          { params }
        )

        let items: DesafioListadoDto[] = []
        let proximoCursor: string | null = null

        if (Array.isArray(respuesta)) {
          items = respuesta
        } else {
          items = respuesta?.items ?? []
          proximoCursor = respuesta?.siguienteCursor ?? null
        }

        const itemsMapeados: DesafioListadoItem[] = items.map((dto) => ({
          id: dto.id,
          nombre: dto.nombre ?? dto.titulo ?? 'Desafío sin nombre',
          fotoPrincipalUrl: dto.fotoPrincipalUrl,
          ambitos: Array.isArray(dto.ambitos) ? dto.ambitos : [],
          fechaInicio: dto.fechaInicio,
          fechaFin: dto.fechaFin,
          estado: dto.estado,
          tieneRespuestas: dto.tieneRespuestas,
        }))

        setDesafios((prev) => {
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
        setError('Error al cargar desafíos.')
      } finally {
        setCargando(false)
      }
    },
    [cargando]
  )

  const handleEditar = (desafio: DesafioListadoItem) => {
    navigate(`/desafios/${desafio.id}/editar`)
  }

  const handleEliminarClick = (desafio: DesafioListadoItem) => {
    setDesafioAEliminar(desafio)
    setMostrarConfirmacionEliminar(true)
  }

  const handleConfirmarEliminar = async () => {
    if (!desafioAEliminar) return

    setEliminando(true)
    setError(null)

    try {
      await httpClient.delete(`/desafios/${desafioAEliminar.id}`)

      // Eliminar del listado
      setDesafios((prev) => prev.filter((d) => d.id !== desafioAEliminar.id))
      setMostrarConfirmacionEliminar(false)
      setDesafioAEliminar(null)
    } catch (err: any) {
      if (err?.status === 401) {
        setError('Debes iniciar sesión para eliminar desafíos.')
        navigate('/login')
      } else if (err?.status === 403) {
        setError('No tienes permiso para eliminar desafíos.')
      } else if (err?.status === 404) {
        setError('El desafío no existe.')
        setDesafios((prev) => prev.filter((d) => d.id !== desafioAEliminar.id))
        setMostrarConfirmacionEliminar(false)
      } else {
        setError('Error al eliminar el desafío. Intentá nuevamente.')
      }
    } finally {
      setEliminando(false)
    }
  }

  const handleCancelarEliminar = () => {
    setMostrarConfirmacionEliminar(false)
    setDesafioAEliminar(null)
  }

  const handleCargarMas = () => {
    if (hayMas && !cargando) {
      cargarDesafios(cursorActual, true)
    }
  }

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return '-'
    const d = new Date(fecha)
    if (Number.isNaN(d.getTime())) return fecha
    return d.toLocaleDateString('es-AR')
  }

  return (
    <div className="listado-desafios-admin-page">
      <header className="listado-desafios-admin-header">
        <h1>Gestionar Desafíos</h1>
        <button
          className="listado-desafios-admin-btn-nuevo"
          onClick={() => navigate('/desafios/publicar')}
        >
          + Publicar Desafío
        </button>
      </header>

      {error && (
        <div className="listado-desafios-admin-error" role="alert">
          {error}
        </div>
      )}

      <main className="listado-desafios-admin-contenedor">
        {desafios.length === 0 && !cargando && (
          <div className="listado-desafios-admin-vacio">
            <p>No hay desafíos para mostrar.</p>
            <button
              className="listado-desafios-admin-btn-vacio"
              onClick={() => navigate('/desafios/publicar')}
            >
              Crear primer desafío
            </button>
          </div>
        )}

        <table className="listado-desafios-admin-tabla" role="grid">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ámbitos</th>
              <th>Fechas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {desafios.map((desafio) => (
              <tr key={desafio.id} className="listado-desafios-admin-fila">
                <td className="listado-desafios-admin-nombre">
                  <span className="listado-desafios-admin-foto">
                    {desafio.fotoPrincipalUrl && (
                      <img
                        src={desafio.fotoPrincipalUrl}
                        alt={desafio.nombre}
                        className="listado-desafios-admin-img"
                      />
                    )}
                  </span>
                  {desafio.nombre}
                </td>
                <td className="listado-desafios-admin-ambitos">
                  {desafio.ambitos.length > 0 ? desafio.ambitos.join(', ') : '-'}
                </td>
                <td className="listado-desafios-admin-fechas">
                  {formatearFecha(desafio.fechaInicio)} a {formatearFecha(desafio.fechaFin)}
                </td>
                <td className="listado-desafios-admin-estado">
                  <span className={`estado-badge estado-${desafio.estado?.toLowerCase()}`}>
                    {desafio.estado || 'DESCONOCIDO'}
                  </span>
                </td>
                <td className="listado-desafios-admin-acciones">
                  <button
                    className="listado-desafios-admin-btn-editar"
                    onClick={() => handleEditar(desafio)}
                    title="Editar desafío"
                  >
                    Editar
                  </button>
                  <button
                    className="listado-desafios-admin-btn-eliminar"
                    onClick={() => handleEliminarClick(desafio)}
                    title="Eliminar desafío"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cargando && (
          <div className="listado-desafios-admin-cargando">
            <p>Cargando desafíos...</p>
          </div>
        )}

        {hayMas && !cargando && (
          <div className="listado-desafios-admin-cargar-mas">
            <button
              className="listado-desafios-admin-btn-cargar"
              onClick={handleCargarMas}
              disabled={cargando}
            >
              Cargar más desafíos
            </button>
          </div>
        )}
      </main>

      {mostrarConfirmacionEliminar && desafioAEliminar && (
        <ConfirmarAccionDestructiva
          abierto={mostrarConfirmacionEliminar}
          caso="eliminar-desafio"
          confirmando={eliminando}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={handleCancelarEliminar}
        />
      )}
    </div>
  )
}
