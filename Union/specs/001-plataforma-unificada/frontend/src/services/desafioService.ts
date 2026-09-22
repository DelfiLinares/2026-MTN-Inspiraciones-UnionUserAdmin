/**
 * Servicio de desafíos para el frontend de usuario.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`GET /desafios`, `POST /desafios/propuestas`)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T060)
 *
 * Bloqueo parcial por B2 (diferida explícitamente):
 * - Implementar `contenidoFormulario` como `Record<string, unknown>` genérico,
 *   sin asumir campos específicos hasta que el backend confirme el contrato.
 *
 * Responsabilidades:
 * - `listarDesafios`: Consulta `GET /desafios` y mapea los resultados a entidades `Desafio`.
 * - `proponerDesafio`: Envía una nueva propuesta mediante `POST /desafios/propuestas`.
 */

import { httpClient, HttpRequestOptions } from '../infrastructure/httpClient'
import { Desafio } from '../domain/Desafio'

export interface DesafioDto {
  id: string
  titulo: string
  descripcion: string
  activo?: boolean
  completadoPorUsuarioActual?: boolean
}

export interface ListarDesafiosRespuestaDto {
  items: DesafioDto[]
}

export interface PropuestaDesafioRespuestaDto {
  id: string
  estado: string
}

function mapearDesafio(dto: DesafioDto): Desafio {
  return new Desafio({
    id: dto.id,
    titulo: dto.titulo,
    descripcion: dto.descripcion,
    activo: dto.activo ?? true,
    completadoPorUsuarioActual: dto.completadoPorUsuarioActual ?? false,
  })
}

/**
 * Obtiene la lista de desafíos vigentes/activos para usuarios (`GET /desafios`).
 */
export async function listarDesafios(options?: HttpRequestOptions): Promise<Desafio[]> {
  const respuesta = await httpClient.get<ListarDesafiosRespuestaDto | DesafioDto[]>(
    '/desafios',
    options
  )

  if (Array.isArray(respuesta)) {
    return respuesta.map(mapearDesafio)
  }

  const items = Array.isArray(respuesta?.items) ? respuesta.items : []
  return items.map(mapearDesafio)
}

/**
 * Propone un nuevo desafío (`POST /desafios/propuestas`).
 *
 * Tratamiento de Ambigüedad B2 (diferida):
 * Se recibe `contenidoFormulario` como `Record<string, unknown>` genérico sin prefijar
 * campos fijos obligatorios, permitiendo extensión futura una vez cerrado el contrato backend.
 */
export async function proponerDesafio(
  contenidoFormulario: Record<string, unknown>,
  options?: HttpRequestOptions
): Promise<PropuestaDesafioRespuestaDto> {
  const respuesta = await httpClient.post<PropuestaDesafioRespuestaDto>(
    '/desafios/propuestas',
    contenidoFormulario,
    options
  )

  return respuesta
}

export const desafioService = {
  listarDesafios,
  proponerDesafio,
}
