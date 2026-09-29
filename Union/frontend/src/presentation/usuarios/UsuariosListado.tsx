/**
 * `UsuariosListadoPage`: Pantalla de Gestión de Usuarios — listado y búsqueda (HU-12).
 *
 * Nota de ubicación: `Union/specs/001-plataforma-unificada/tasks.md` (T097A) define esta pantalla
 * dentro de `Admin/my-proyect/frontend-admin/src/presentation/usuarios/UsuariosListado.tsx`. Por
 * instrucción explícita del usuario (misma confirmación que en T095/T096), la implementación se
 * coloca aquí, dentro de
 * `Union/frontend/src/presentation/usuarios/`, sin leer ni
 * modificar ningún archivo del proyecto `Admin/`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-12, RF-56)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T097A, depende de T065)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`GET /admin/usuarios`)
 *
 * Criterios de aceptación cubiertos:
 * - HU-12 / RF-56: Búsqueda paginada de usuarios resuelta contra la API.
 * - Alcance de T097A: SOLO lectura (listado + búsqueda + filtros + paginación). Las acciones
 *   sensibles (banear/eliminar/promover/degradar) quedan fuera de esta tarea y corresponden a
 *   T097B (`UsuarioAccionesSensibles`), pendiente de implementación separada.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { buscarUsuarios } from '../../services/UsuariosService'
import type { PaginaUsuariosAdmin } from '../../services/UsuariosService'
import { RolUsuarioAdmin } from '../../domain/enums/RolUsuarioAdmin'
import { EstadoCuentaUsuario } from '../../domain/enums/EstadoCuentaUsuario'
import { Spinner, EmptyState, Skeleton } from '../../components/comunes'

const TAMANO_PAGINA = 10

export const UsuariosListadoPage: React.FC = () => {
  const [texto, setTexto] = useState('')
  const [rol, setRol] = useState<RolUsuarioAdmin | ''>('')
  const [estadoCuenta, setEstadoCuenta] = useState<EstadoCuentaUsuario | ''>('')
  const [pagina, setPagina] = useState(1)
  const [resultado, setResultado] = useState<PaginaUsuariosAdmin | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  const cargarUsuarios = useCallback(async () => {
    setCargando(true)
    setErrorMensaje(null)
    try {
      const datos = await buscarUsuarios({
        q: texto.trim() || undefined,
        page: pagina,
        pageSize: TAMANO_PAGINA,
        rol: rol || undefined,
        estadoCuenta: estadoCuenta || undefined,
      })
      setResultado(datos)
    } catch {
      setErrorMensaje('No se pudo cargar el listado de usuarios.')
    } finally {
      setCargando(false)
    }
  }, [texto, pagina, rol, estadoCuenta])

  useEffect(() => {
    cargarUsuarios()
  }, [cargarUsuarios])

  const handleBuscarSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPagina(1)
    cargarUsuarios()
  }

  const totalPaginas = resultado ? Math.max(1, Math.ceil(resultado.total / TAMANO_PAGINA)) : 1

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de usuarios</h1>

        <form
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3"
          onSubmit={handleBuscarSubmit}
          aria-label="Formulario de búsqueda de usuarios"
        >
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar por nombre o mail..."
            className="flex-1 px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Texto de búsqueda"
          />

          <select
            value={rol}
            onChange={(e) => setRol(e.target.value as RolUsuarioAdmin | '')}
            className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Filtrar por rol"
          >
            <option value="">Todos los roles</option>
            <option value={RolUsuarioAdmin.USER}>Usuario</option>
            <option value={RolUsuarioAdmin.ADMIN}>Administrador</option>
          </select>

          <select
            value={estadoCuenta}
            onChange={(e) => setEstadoCuenta(e.target.value as EstadoCuentaUsuario | '')}
            className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Filtrar por estado de cuenta"
          >
            <option value="">Todos los estados</option>
            <option value={EstadoCuentaUsuario.ACTIVO}>Activo</option>
            <option value={EstadoCuentaUsuario.BANEADO}>Baneado</option>
            <option value={EstadoCuentaUsuario.ELIMINADO}>Eliminado</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Buscar
          </button>
        </form>

        {cargando && <Skeleton variante="tarjeta" cantidad={3} />}

        {!cargando && errorMensaje && (
          <EmptyState
            titulo="Error al cargar usuarios"
            mensaje={errorMensaje}
            onAccion={cargarUsuarios}
            textoAccion="Reintentar"
          />
        )}

        {!cargando && !errorMensaje && resultado && resultado.items.length === 0 && (
          <EmptyState
            titulo="No se encontraron usuarios"
            mensaje="Probá modificando los filtros de búsqueda."
          />
        )}

        {!cargando && !errorMensaje && resultado && resultado.items.length > 0 && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100" aria-label="Listado de usuarios">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Mail</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resultado.items.map((usuario) => (
                    <tr key={usuario.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{usuario.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{usuario.mail}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{usuario.rol}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{usuario.estadoCuenta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina <= 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-500">
                Página {pagina} de {totalPaginas}
              </span>
              <button
                type="button"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina >= totalPaginas}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </>
        )}

        {cargando && resultado && <Spinner tamano="sm" texto="Actualizando..." />}
      </div>
    </div>
  )
}
