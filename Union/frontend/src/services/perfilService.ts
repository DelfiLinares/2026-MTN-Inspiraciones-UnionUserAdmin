/**
 * Servicio de perfil de usuario (HU-06, RF-16 a RF-20) y follow/unfollow (HU-08, RF-37 a RF-39).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-16 a RF-20, RF-37 a RF-39, CB-07, CB-08)
 * - Contrato de publicaciones: `PUT/DELETE /usuarios/{usuarioId}/seguimiento`
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T057, T062)
 *
 * Responsabilidades:
 * - `obtenerUsuario(id)`: Consulta los datos públicos de un usuario vía `GET /usuarios/{id}`.
 * - `actualizarPerfil(datos)`: Actualiza el perfil vía `PATCH /perfil`.
 *   Si incluye `foto`, envía `multipart/form-data`; de lo contrario, envía JSON.
 *   NO incluye contraseña (RF-16).
 * - `seguirUsuario(id)`: Llama a `PUT /usuarios/{usuarioId}/seguimiento`.
 * - `dejarDeSeguir(id)`: Llama a `DELETE /usuarios/{usuarioId}/seguimiento`.
 * - `useSeguirUsuario(usuarioInicial)`: Hook para manejo reactivo con actualización optimista
 *   mediante `Usuario.toggleSeguir()` y reversión ante error de la API (CB-07).
 * - Mapeo consistente a la entidad de dominio `Usuario`.
 */

import { useState, useCallback, useRef } from 'react'
import { httpClient, HttpRequestOptions } from '../infrastructure/httpClient'
import { apiEndpoints } from '../infrastructure/apiEndpoints'
import { Usuario } from '../domain/Usuario'
import { RolUsuario } from '../domain/enums/RolUsuario'

export interface UsuarioDto {
  id: string
  nombre: string
  apellido: string
  bio?: string | null
  fotoUrl?: string | null
  rol?: string
  siguiendoAlUsuarioActual?: boolean
  cantidadSeguidores?: number
}

export interface DatosActualizarPerfil {
  nombre?: string
  apellido?: string
  bio?: string
  foto?: File | Blob
}

function mapearUsuario(dto: UsuarioDto): Usuario {
  return new Usuario({
    id: dto.id,
    nombre: dto.nombre,
    apellido: dto.apellido,
    bio: dto.bio ?? undefined,
    fotoUrl: dto.fotoUrl ?? undefined,
    rol: (dto.rol as RolUsuario) || RolUsuario.USER,
    siguiendoAlUsuarioActual: dto.siguiendoAlUsuarioActual ?? false,
    cantidadSeguidores: dto.cantidadSeguidores ?? 0,
  })
}

/**
 * Obtiene los datos públicos de un usuario dado su ID (`GET /usuarios/{id}`).
 */
export async function obtenerUsuario(
  id: string,
  options?: HttpRequestOptions
): Promise<Usuario> {
  const dto = await httpClient.get<UsuarioDto>(`/usuarios/${encodeURIComponent(id)}`, options)
  return mapearUsuario(dto)
}

/**
 * Actualiza los datos de perfil del usuario actual (`PATCH /perfil`).
 *
 * Nota RF-16: La edición de perfil NO incluye cambio ni manejo de contraseña.
 * Si se adjunta un archivo en `foto`, se envía como `multipart/form-data`.
 */
export async function actualizarPerfil(
  datos: DatosActualizarPerfil,
  options?: HttpRequestOptions
): Promise<Usuario> {
  let cuerpo: FormData | Record<string, unknown>

  if (datos.foto) {
    const formData = new FormData()
    if (datos.nombre !== undefined) {
      formData.append('nombre', datos.nombre)
    }
    if (datos.apellido !== undefined) {
      formData.append('apellido', datos.apellido)
    }
    if (datos.bio !== undefined) {
      formData.append('bio', datos.bio)
    }
    formData.append('foto', datos.foto)
    cuerpo = formData
  } else {
    cuerpo = {
      ...(datos.nombre !== undefined ? { nombre: datos.nombre } : {}),
      ...(datos.apellido !== undefined ? { apellido: datos.apellido } : {}),
      ...(datos.bio !== undefined ? { bio: datos.bio } : {}),
    }
  }

  const dto = await httpClient.patch<UsuarioDto>('/perfil', cuerpo, options)
  return mapearUsuario(dto)
}

export interface UseSeguirUsuarioResult {
  /** Usuario con el estado de seguimiento más reciente (optimista o confirmado). */
  usuario: Usuario
  /** `true` mientras hay una solicitud de seguir/dejar de seguir en curso. */
  enviando: boolean
  /** Mensaje de error no bloqueante ante una falla de la operación, o `null`. */
  error: string | null
  /** Alterna el estado de seguimiento del usuario actual con actualización optimista. */
  alternarSeguir: () => Promise<void>
}

/**
 * Sigue a un usuario (`PUT /usuarios/{id}/seguimiento`).
 */
export async function seguirUsuario(
  usuarioId: string,
  options?: HttpRequestOptions
): Promise<void> {
  return httpClient.put<void>(
    apiEndpoints.seguimientoUsuario(usuarioId),
    undefined,
    options
  )
}

/**
 * Deja de seguir a un usuario (`DELETE /usuarios/{id}/seguimiento`).
 */
export async function dejarDeSeguir(
  usuarioId: string,
  options?: HttpRequestOptions
): Promise<void> {
  return httpClient.delete<void>(
    apiEndpoints.seguimientoUsuario(usuarioId),
    options
  )
}

/**
 * Hook para manejar la acción de seguir/dejar de seguir a un usuario (HU-08, RF-39).
 * Aplica actualización optimista usando `Usuario.toggleSeguir()`,
 * y revierte el estado si la API devuelve un error (CB-07).
 */
export function useSeguirUsuario(usuarioInicial: Usuario): UseSeguirUsuarioResult {
  const [usuario, setUsuario] = useState<Usuario>(usuarioInicial)
  const [enviando, setEnviando] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const alternarSeguir = useCallback(async () => {
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    const anterior = usuario
    const yaSiguiendo = anterior.siguiendoAlUsuarioActual

    // Actualización optimista usando Usuario.toggleSeguir() (RF-39, T062)
    const optimista = anterior.toggleSeguir()
    setUsuario(optimista)
    setEnviando(true)
    setError(null)

    try {
      if (yaSiguiendo) {
        await dejarDeSeguir(anterior.id, { signal: controller.signal })
      } else {
        await seguirUsuario(anterior.id, { signal: controller.signal })
      }

      // El contrato responde 204; se confirma el estado optimista sin cuerpo de respuesta.
      setUsuario(
        new Usuario({
          id: anterior.id,
          nombre: anterior.nombre,
          apellido: anterior.apellido,
          bio: anterior.bio,
          fotoUrl: anterior.fotoUrl,
          rol: anterior.rol,
          siguiendoAlUsuarioActual: !yaSiguiendo,
          cantidadSeguidores: yaSiguiendo
            ? Math.max(0, anterior.cantidadSeguidores - 1)
            : anterior.cantidadSeguidores + 1,
        })
      )
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        return
      }

      // Reversión ante error (CB-07, AC-08.4)
      setUsuario(anterior)

      const apiMensaje =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : 'No se pudo actualizar el seguimiento. Por favor, intentá nuevamente.'
      setError(apiMensaje)
    } finally {
      if (!controller.signal.aborted) {
        setEnviando(false)
      }
    }
  }, [usuario])

  return {
    usuario,
    enviando,
    error,
    alternarSeguir,
  }
}

export const perfilService = {
  obtenerUsuario,
  actualizarPerfil,
  seguirUsuario,
  dejarDeSeguir,
  useSeguirUsuario,
}
