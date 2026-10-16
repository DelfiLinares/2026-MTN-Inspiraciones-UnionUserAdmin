/**
 * `PublicacionesTable`: Tabla de listado de publicaciones con filtro por estado.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T043, depende de T010, T030, T042a)
 * - Union/specs/002-frontend-admin/spec.md RF-11
 *
 * Responsabilidades:
 * - Consume `PublicacionesServiceAdmin.listar()` (T042a) para obtener una página de publicaciones.
 * - Muestra columnas: id, autor, estado (`EstadoPublicacion`, T010), cantidad de reportes.
 * - Expone un filtro por estado y controles de paginación simples.
 * - Sin lógica de negocio sobre acciones sensibles (editar/eliminar): eso corresponde a
 *   `EditarPublicacionForm`/la acción de eliminar (T044+, pendientes), que se renderizarán como
 *   columna de acciones mediante una prop `renderAcciones` (mismo patrón que `UsuariosTable`, T035/
 *   T038), en una integración posterior.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { PublicacionesServiceAdmin } from '../../application/PublicacionesServiceAdmin'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import type { PublicacionModeracion } from '../../domain/PublicacionModeracion'
import { EstadoPublicacionAdmin as EstadoPublicacion } from '../../domain/enums/EstadoPublicacionAdmin'
import { EstadoVacio } from '../shared/EstadoVacio'
import { MensajeError } from '../shared/MensajeError'

const TAMANO_PAGINA = 10

export interface PublicacionesTableProps {
  readonly httpClient: HttpClient
  readonly renderAcciones?: (publicacion: PublicacionModeracion, recargar: () => void) => React.ReactNode
}

export const PublicacionesTable: React.FC<PublicacionesTableProps> = ({ httpClient, renderAcciones }) => {
  const [estado, setEstado] = useState<EstadoPublicacion | ''>('')
  const [pagina, setPagina] = useState(1)
  const [items, setItems] = useState<PublicacionModeracion[]>([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  const servicio = React.useMemo(() => new PublicacionesServiceAdmin(httpClient), [httpClient])

  const cargarPublicaciones = useCallback(async () => {
    setCargando(true)
    setMensajeError(null)
    try {
      const resultado = await servicio.listar({
        page: pagina,
        pageSize: TAMANO_PAGINA,
        estado: estado || undefined,
      })
      setItems(resultado.items)
      setTotal(resultado.total)
    } catch {
      setMensajeError('No se pudo cargar el listado de publicaciones.')
    } finally {
      setCargando(false)
    }
  }, [servicio, pagina, estado])

  useEffect(() => {
    cargarPublicaciones()
  }, [cargarPublicaciones])

  const handleCambioEstado = (evento: React.ChangeEvent<HTMLSelectElement>) => {
    setEstado(evento.target.value as EstadoPublicacion | '')
    setPagina(1)
  }

  const totalPaginas = Math.max(1, Math.ceil(total / TAMANO_PAGINA))

  return (
    <div className="publicaciones-table">
      <div className="publicaciones-table__filtros">
        <label>
          Estado:
          <select value={estado} onChange={handleCambioEstado} aria-label="Filtrar por estado">
            <option value="">Todos</option>
            {Object.values(EstadoPublicacion).map((valor) => (
              <option key={valor} value={valor}>
                {valor}
              </option>
            ))}
          </select>
        </label>
      </div>

      {mensajeError !== null && <MensajeError mensaje={mensajeError} />}

      {!cargando && items.length === 0 ? (
        <EstadoVacio mensaje="No hay publicaciones para mostrar." />
      ) : (
        <table className="admin-tabla">
          <thead>
            <tr>
              <th>Id</th>
              <th>Autor</th>
              <th>Estado</th>
              <th>Reportes</th>
              {renderAcciones && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((publicacion) => (
              <tr key={publicacion.id}>
                <td>{publicacion.id}</td>
                <td>{publicacion.autorId}</td>
                <td>{publicacion.estado}</td>
                <td>{publicacion.cantidadReportes}</td>
                {renderAcciones && <td>{renderAcciones(publicacion, cargarPublicaciones)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="publicaciones-table__paginacion">
        <button type="button" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
          Anterior
        </button>
        <span>
          Página {pagina} de {totalPaginas}
        </span>
        <button
          type="button"
          disabled={pagina >= totalPaginas}
          onClick={() => setPagina((p) => p + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
