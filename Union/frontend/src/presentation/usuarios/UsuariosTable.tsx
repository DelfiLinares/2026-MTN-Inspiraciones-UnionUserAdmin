/**
 * `UsuariosTable`: Tabla de listado de usuarios con búsqueda y paginación.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T035, depende de T008, T009, T030, T034a)
 * - Union/specs/002-frontend-admin/spec.md RF-05, AC-01.1
 *
 * Responsabilidades:
 * - Consume `UsuariosServiceAdmin.listar()` (T034a) para obtener una página de usuarios.
 * - Muestra columnas: nombre, mail, rol (`RolUsuario`, T008) y estado de cuenta
 *   (`EstadoCuentaUsuario`, T009).
 * - Expone un input de búsqueda (`texto`) y controles de paginación simples.
 * - Sin lógica de negocio sobre acciones sensibles (banear/eliminar): eso corresponde a
 *   `BanearUsuarioAction`/`EliminarUsuarioAction` (T036/T037, pendientes), que se renderizarán
 *   como columna de acciones en una integración posterior (T038, `UsuariosPage.tsx`).
 *
 * Nota de colisión de nombres: no debe confundirse con `UsuariosListadoPage.tsx` (preexistente,
 * de `001-plataforma-unificada`, T097A), que es una PÁGINA completa (incluye su propio layout,
 * formulario de filtros con `rol`/`estadoCuenta`, y usa `UsuariosService`/`buscarUsuarios` de ese
 * otro módulo). `UsuariosTable` es solo el componente de TABLA reutilizable de este módulo
 * (`002-frontend-admin`), consumido por `UsuariosPage.tsx` (T030/T038).
 */

import React, { useCallback, useEffect, useState } from 'react'
import { UsuariosServiceAdmin } from '../../application/UsuariosServiceAdmin'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import type { UsuarioAdmin } from '../../domain/UsuarioAdmin'
import { EstadoVacio } from '../shared/EstadoVacio'
import { MensajeError } from '../shared/MensajeError'

const TAMANO_PAGINA = 10

export interface UsuariosTableProps {
  readonly httpClient: HttpClient
  readonly obtenerAdminActualId?: () => string | undefined
}

export const UsuariosTable: React.FC<UsuariosTableProps> = ({ httpClient, obtenerAdminActualId }) => {
  const [texto, setTexto] = useState('')
  const [pagina, setPagina] = useState(1)
  const [items, setItems] = useState<UsuarioAdmin[]>([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  const servicio = React.useMemo(
    () => new UsuariosServiceAdmin(httpClient, obtenerAdminActualId),
    [httpClient, obtenerAdminActualId]
  )

  const cargarUsuarios = useCallback(async () => {
    setCargando(true)
    setMensajeError(null)
    try {
      const resultado = await servicio.listar({
        q: texto.trim() || undefined,
        page: pagina,
        pageSize: TAMANO_PAGINA,
      })
      setItems(resultado.items)
      setTotal(resultado.total)
    } catch {
      setMensajeError('No se pudo cargar el listado de usuarios.')
    } finally {
      setCargando(false)
    }
  }, [servicio, texto, pagina])

  useEffect(() => {
    cargarUsuarios()
  }, [cargarUsuarios])

  const handleBuscarSubmit = (evento: React.FormEvent) => {
    evento.preventDefault()
    setPagina(1)
    cargarUsuarios()
  }

  const totalPaginas = Math.max(1, Math.ceil(total / TAMANO_PAGINA))

  return (
    <div className="usuarios-table">
      <form onSubmit={handleBuscarSubmit} aria-label="Formulario de búsqueda de usuarios">
        <input
          type="text"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder="Buscar por nombre o mail..."
          aria-label="Texto de búsqueda"
        />
        <button type="submit">Buscar</button>
      </form>

      {mensajeError !== null && <MensajeError mensaje={mensajeError} />}

      {!cargando && items.length === 0 ? (
        <EstadoVacio mensaje="No hay usuarios para mostrar." />
      ) : (
        <table className="admin-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Mail</th>
              <th>Rol</th>
              <th>Estado de cuenta</th>
            </tr>
          </thead>
          <tbody>
            {items.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nombre}</td>
                <td>{usuario.mail}</td>
                <td>{usuario.rol}</td>
                <td>{usuario.estadoCuenta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="usuarios-table__paginacion">
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
