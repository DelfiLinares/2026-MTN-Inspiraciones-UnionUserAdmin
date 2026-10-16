import type {
  PublicacionRepository,
  ResultadoGuardadoPublicacion,
  ResultadoPublicacionesPaginado,
} from '../application/ports/PublicacionRepository'
import { PublicacionService } from '../application/PublicacionService'
import { PublicacionPerfil } from '../domain/PublicacionPerfil'
import { apiEndpoints } from '../infrastructure/apiEndpoints'
import { lanzarErrorAdaptado } from '../infrastructure/apiErrorAdapter'
import type {
  PaginaDto,
  PublicacionPerfilDto,
  ResultadoGuardadoDto,
} from '../infrastructure/dto/perfilDtos'
import { httpClient } from '../infrastructure/httpClient'
import { mapearPublicacionPerfil } from '../infrastructure/mappers/perfilMappers'

class HttpPublicacionRepository implements PublicacionRepository {
  async listarPublicaciones(
    usuarioId: string,
    limit: number,
    offset: number,
  ): Promise<ResultadoPublicacionesPaginado> {
    try {
      const pagina = await httpClient.get<PaginaDto<PublicacionPerfilDto>>(
        apiEndpoints.listarPublicacionesDePerfil(usuarioId),
        { params: { limit, offset } },
      )
      return {
        items: pagina.items.map(mapearPublicacionPerfil),
        total: pagina.total,
        limit: pagina.limit,
        offset: pagina.offset,
        hasMore: pagina.hasMore,
      }
    } catch (error) {
      lanzarErrorAdaptado(error)
    }
  }

  async editarPublicacion(
    publicacionId: string,
    texto: string,
  ): Promise<PublicacionPerfil> {
    try {
      const dto = await httpClient.put<PublicacionPerfilDto>(
        apiEndpoints.editarPublicacion(publicacionId),
        { contenido: texto },
      )
      return mapearPublicacionPerfil(dto)
    } catch (error) {
      lanzarErrorAdaptado(error)
    }
  }

  async eliminarPublicacion(publicacionId: string): Promise<void> {
    try {
      await httpClient.delete(apiEndpoints.eliminarPublicacion(publicacionId))
    } catch (error) {
      lanzarErrorAdaptado(error)
    }
  }

  async guardarPublicacionEnCarpeta(
    carpetaId: string,
    publicacionId: string,
  ): Promise<ResultadoGuardadoPublicacion> {
    try {
      const resultado = await httpClient.post<ResultadoGuardadoDto>(
        apiEndpoints.guardarPostEnCarpeta(carpetaId),
        { publicacionId },
      )
      return {
        esNueva:
          resultado.creada ??
          (resultado.yaEstabaGuardado !== undefined
            ? !resultado.yaEstabaGuardado
            : true),
        carpetaId: resultado.carpetaId,
        publicacionId: resultado.publicacionId,
        mensaje: resultado.mensaje,
      }
    } catch (error) {
      lanzarErrorAdaptado(error)
    }
  }

  async quitarPublicacionDeCarpeta(
    carpetaId: string,
    publicacionId: string,
  ): Promise<void> {
    try {
      await httpClient.delete(
        apiEndpoints.quitarPostDeCarpeta(carpetaId, publicacionId),
      )
    } catch (error) {
      lanzarErrorAdaptado(error)
    }
  }
}

export const publicacionRepository: PublicacionRepository =
  new HttpPublicacionRepository()
export const publicacionService = new PublicacionService(publicacionRepository)
