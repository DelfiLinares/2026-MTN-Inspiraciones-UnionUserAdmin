import type {
  ResultadoToggleSeguimiento,
  SeguimientoRepository,
} from '../application/ports/SeguimientoRepository'
import { SeguimientoService } from '../application/SeguimientoService'
import { SeguimientoRelacion } from '../domain/SeguimientoRelacion'
import { apiEndpoints } from '../infrastructure/apiEndpoints'
import { lanzarErrorAdaptado } from '../infrastructure/apiErrorAdapter'
import type { PerfilPublicoDto } from '../infrastructure/dto/perfilDtos'
import { httpClient } from '../infrastructure/httpClient'

class HttpSeguimientoRepository implements SeguimientoRepository {
  async obtenerEstadoSeguimiento(
    usuarioId: string,
    usuarioASeguidoId: string,
  ): Promise<SeguimientoRelacion> {
    try {
      const perfil = await httpClient.get<PerfilPublicoDto>(
        apiEndpoints.obtenerPerfil(usuarioASeguidoId),
      )
      return new SeguimientoRelacion(
        usuarioId,
        usuarioASeguidoId,
        perfil.siguiendoPorUsuarioActual,
      )
    } catch (error) {
      lanzarErrorAdaptado(error)
    }
  }

  async toggleSeguimiento(
    usuarioId: string,
    usuarioASeguidoId: string,
    ahoraSiguiendo: boolean,
  ): Promise<ResultadoToggleSeguimiento> {
    try {
      const endpoint = ahoraSiguiendo
        ? apiEndpoints.seguirUsuario(usuarioASeguidoId)
        : apiEndpoints.dejarDeSeguirUsuario(usuarioASeguidoId)
      if (ahoraSiguiendo) {
        await httpClient.put(endpoint)
      } else {
        await httpClient.delete(endpoint)
      }

      return {
        usuarioId,
        usuarioASeguidoId,
        ahora_siguiendo: ahoraSiguiendo,
        timestamp: new Date(),
      }
    } catch (error) {
      lanzarErrorAdaptado(error)
    }
  }
}

export const httpSeguimientoRepository: SeguimientoRepository =
  new HttpSeguimientoRepository()
export const seguimientoService = new SeguimientoService(httpSeguimientoRepository)
