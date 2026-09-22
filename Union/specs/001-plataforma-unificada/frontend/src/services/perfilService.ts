/**
 * Servicio de perfil de usuario (HU-06, RF-16 a RF-20).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-16 a RF-20, CB-08)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`PATCH /perfil`, `GET /usuarios/{id}`)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T057)
 *
 * Responsabilidades:
 * - `obtenerUsuario(id)`: Consulta los datos públicos de un usuario vía `GET /usuarios/{id}`.
 * - `actualizarPerfil(datos)`: Actualiza el perfil vía `PATCH /perfil`.
 *   Si incluye `foto`, envía `multipart/form-data`; de lo contrario, envía JSON.
 *   NO incluye contraseña (RF-16).
 * - Mapeo consistente a la entidad de dominio `Usuario`.
 */

import { httpClient, HttpRequestOptions } from '../infrastructure/httpClient'
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

export const perfilService = {
  obtenerUsuario,
  actualizarPerfil,
}
