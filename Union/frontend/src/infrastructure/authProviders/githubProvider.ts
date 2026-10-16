/**
 * Proveedor de autenticación OAuth con GitHub.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección A: `GET /auth/github`, `GET /auth/callback`)
 * - Union/specs/001-plataforma-unificada/tasks.md (T040)
 * - Union/specs/001-plataforma-unificada/spec.md (RF-01, RF-10)
 *
 * Manejo de Ambigüedad B1 (parseo defensivo análogo a googleProvider):
 * - Inicia redirección a `GET /auth/github`.
 * - Procesa `GET /auth/callback` o los query params de callback en URL:
 *   - Si viene `?error=...`: lanza error descriptivo con el motivo retornado.
 *   - Si viene `?token=...`: guarda el token directamente en `tokenStorage` y consulta `/auth/me` para obtener el usuario.
 *   - Si viene `?code=...`: invoca `GET /auth/callback?code=...&provider=github` para intercambiar el código por token y usuario.
 */

import { httpClient } from '../httpClient'
import { config } from '../config'
import { tokenStorage, verificarSesion } from '../tokenStorage'
import { Usuario } from '../../domain/Usuario'
import { mapearUsuarioAutenticado } from '../mappers/perfilMappers'

export interface OAuthLoginResponseDto {
  token?: string
  accessToken?: string
  usuario?: {
    id: string
    username?: string
    nombreCompleto?: string | null
    nombre?: string
    apellido?: string
    rol?: string
    role?: string
    status?: string
    bio?: string | null
    sobreMi?: string | null
    descripcion?: string | null
    fotoUrl?: string | null
    avatarUrl?: string | null
    cantidadSeguidores?: number
  }
  error?: string
}

export interface OAuthResult {
  token: string
  usuario: Usuario
}

function mapearUsuario(dto: NonNullable<OAuthLoginResponseDto['usuario']>): Usuario {
  const username = dto.username ?? dto.nombre ?? ''
  if (!dto.id || !username) {
    throw new Error('La respuesta OAuth no incluye los datos requeridos del usuario.')
  }

  return mapearUsuarioAutenticado(dto)
}

/**
 * Inicia la redirección hacia el endpoint OAuth de GitHub.
 * Permite usar la URL configurada en VITE_AUTH_GITHUB_REDIRECT_URL o el endpoint default `/auth/github`.
 */
export function iniciarRedireccion(): void {
  const endpoint = config.authGithubRedirectUrl || `${config.apiBaseUrl}/auth/github`
  if (typeof window !== 'undefined') {
    window.location.href = endpoint
  }
}

/**
 * Parsea los parámetros de callback de forma defensiva según la especificación de B1.
 */
export function extraerParametrosCallback(urlOConsulta?: string | URLSearchParams): {
  code?: string
  token?: string
  error?: string
} {
  let params: URLSearchParams

  if (urlOConsulta instanceof URLSearchParams) {
    params = urlOConsulta
  } else if (typeof urlOConsulta === 'string') {
    const queryPart = urlOConsulta.includes('?') ? urlOConsulta.split('?')[1] : urlOConsulta
    params = new URLSearchParams(queryPart)
  } else if (typeof window !== 'undefined') {
    params = new URLSearchParams(window.location.search)
  } else {
    params = new URLSearchParams()
  }

  return {
    code: params.get('code') ?? undefined,
    token: params.get('token') ?? undefined,
    error: params.get('error') ?? params.get('error_description') ?? undefined,
  }
}

/**
 * Procesa la respuesta de callback de OAuth GitHub soportando ambos formatos (code / token / error).
 */
export async function procesarCallback(parametros?: string | URLSearchParams): Promise<OAuthResult> {
  const { code, token, error } = extraerParametrosCallback(parametros)

  if (error) {
    throw new Error(`Error en autenticación OAuth de GitHub: ${error}`)
  }

  // Caso 1: El backend o proveedor ya envió el token en el query string (?token=...)
  if (token) {
    tokenStorage.setToken(token)
    const usuarioSesion = await verificarSesion()
    if (!usuarioSesion) {
      throw new Error('No se pudo verificar la sesión con el token provisto.')
    }
    return {
      token,
      usuario: usuarioSesion,
    }
  }

  // Caso 2: El proveedor envió un código de autorización (?code=...) para intercambiar en /auth/callback
  if (code) {
    const respuesta = await httpClient.get<OAuthLoginResponseDto>('/auth/callback', {
      params: {
        code,
        provider: 'github',
      },
    })

    if (respuesta.error) {
      throw new Error(`Error en callback de autenticación: ${respuesta.error}`)
    }

    const tokenRespuesta =
      respuesta.accessToken ?? respuesta.token ?? tokenStorage.getToken() ?? ''
    if (tokenRespuesta) {
      tokenStorage.setToken(tokenRespuesta)
    }

    const usuario = respuesta.usuario
      ? mapearUsuario(respuesta.usuario)
      : (await verificarSesion())

    if (!usuario) {
      throw new Error('No se pudo obtener el usuario autenticado tras procesar el código.')
    }
    tokenStorage.setLoginData('', '', usuario)

    return {
      token: tokenRespuesta,
      usuario,
    }
  }

  throw new Error('Callback de OAuth inválido: no se encontró code ni token en los parámetros.')
}

export const githubProvider = {
  iniciarRedireccion,
  extraerParametrosCallback,
  procesarCallback,
}
