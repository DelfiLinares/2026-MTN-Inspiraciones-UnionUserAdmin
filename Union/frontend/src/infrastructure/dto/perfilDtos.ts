export interface PerfilPropioDto {
  id: string
  email: string
  username: string
  nombreCompleto?: string | null
  avatarUrl?: string | null
  role: string
  status: string
  createdAt: string
  onboardingCompletado?: boolean
  sobreMi?: string | null
  descripcion?: string | null
  cantidadSeguidores: number
}

export interface PerfilPublicoDto {
  id: string
  username: string
  nombreCompleto?: string | null
  avatarUrl?: string | null
  sobreMi?: string | null
  descripcion?: string | null
  cantidadSeguidores: number
  siguiendoPorUsuarioActual: boolean
}

export interface ActualizarPerfilRequestDto {
  username?: string
  sobreMi?: string | null
  descripcion?: string | null
}

export interface CarpetaDto {
  id: string
  usuarioId: string
  nombre: string
  cantidadPosts: number
  createdAt: string
}

export interface AutorResumenDto {
  id: string
  username: string
  avatarUrl?: string | null
}

export interface PublicacionPerfilDto {
  id: string
  usuarioId: string
  autor: AutorResumenDto
  contenido: string
  fotoUrl?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface PaginaDto<T> {
  items: T[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface ResultadoGuardadoDto {
  carpetaId: string
  publicacionId: string
  yaEstabaGuardado?: boolean
  creada?: boolean
  mensaje?: string
}

export interface ApiErrorDto {
  code?: string
  message?: string
  requestId?: string
}
