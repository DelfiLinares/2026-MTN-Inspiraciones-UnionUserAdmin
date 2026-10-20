import { CatalogoFiltros, type OpcionFiltro } from '../../domain/busqueda/CatalogoFiltros'
import { ErrorBusqueda } from '../../domain/busqueda/ErrorBusqueda'
import { PaginaResultados } from '../../domain/busqueda/PaginaResultados'
import { PublicacionResumen } from '../../domain/busqueda/PublicacionResumen'
import { EstadoPublicacion } from '../../domain/enums/EstadoPublicacion'
import { TipoContenido } from '../../domain/enums/TipoContenido'
import { TipoErrorBusqueda } from '../../domain/enums/TipoErrorBusqueda'

/** DTOs según Union/specs/007-inspiraciones-busqueda/contracts/openapi.yaml */
export interface PublicacionResumenDto {
  id: string
  titulo: string
  autor: { id: string; nombre: string }
  miniaturaUrl: string
  tipoContenido: string
  estado: string
  ancho?: number
  alto?: number
}

export interface PaginaPublicacionesDto {
  items: PublicacionResumenDto[]
  cursorSiguiente: string | null
}

export interface OpcionFiltroDto {
  valor: string
  etiqueta: string
}

export interface CatalogoFiltrosDto {
  estilos: OpcionFiltroDto[]
  tecnicas: OpcionFiltroDto[]
  tiposArte: OpcionFiltroDto[]
}

export interface ErrorDto {
  codigo: string
  mensaje: string
  detalles?: string[]
}

function respuestaInvalida(detalle: string): ErrorBusqueda {
  return new ErrorBusqueda(
    TipoErrorBusqueda.SERVIDOR,
    `Respuesta de la API fuera de contrato: ${detalle}`,
    { codigo: 'RESPUESTA_INVALIDA' },
  )
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

function texto(valor: unknown, campo: string): string {
  if (typeof valor !== 'string') throw respuestaInvalida(`"${campo}" debe ser texto`)
  return valor
}

function enumDe<T extends string>(
  enumeracion: Record<string, T>,
  valor: unknown,
  campo: string,
): T {
  if (typeof valor !== 'string' || !(Object.values(enumeracion) as string[]).includes(valor)) {
    throw respuestaInvalida(`"${campo}" con valor desconocido`)
  }
  return valor as T
}

/** No filtra por estado: ELIMINADA lo excluye la API (RF-16); aquí solo se mapea lo recibido. */
export function mapearPublicacionResumen(dto: unknown): PublicacionResumen {
  if (!esObjeto(dto)) throw respuestaInvalida('publicación inválida')
  const autor = dto.autor
  if (!esObjeto(autor)) throw respuestaInvalida('"autor" ausente')
  return new PublicacionResumen({
    id: texto(dto.id, 'id'),
    titulo: texto(dto.titulo, 'titulo'),
    autor: { id: texto(autor.id, 'autor.id'), nombre: texto(autor.nombre, 'autor.nombre') },
    miniaturaUrl: texto(dto.miniaturaUrl, 'miniaturaUrl'),
    tipoContenido: enumDe(TipoContenido, dto.tipoContenido, 'tipoContenido'),
    estado: enumDe(EstadoPublicacion, dto.estado, 'estado'),
  })
}

export function mapearPagina(dto: unknown): PaginaResultados {
  if (!esObjeto(dto) || !Array.isArray(dto.items)) throw respuestaInvalida('"items" ausente')
  const cursor = dto.cursorSiguiente
  if (cursor !== null && cursor !== undefined && typeof cursor !== 'string') {
    throw respuestaInvalida('"cursorSiguiente" inválido')
  }
  return new PaginaResultados(dto.items.map(mapearPublicacionResumen), cursor ?? null)
}

function mapearOpciones(lista: unknown, campo: string): OpcionFiltro[] {
  if (!Array.isArray(lista)) throw respuestaInvalida(`"${campo}" debe ser lista`)
  return lista.map((o) => {
    if (!esObjeto(o)) throw respuestaInvalida(`"${campo}" con opción inválida`)
    return { valor: texto(o.valor, `${campo}.valor`), etiqueta: texto(o.etiqueta, `${campo}.etiqueta`) }
  })
}

export function mapearCatalogo(dto: unknown): CatalogoFiltros {
  if (!esObjeto(dto)) throw respuestaInvalida('catálogo inválido')
  return new CatalogoFiltros({
    estilos: mapearOpciones(dto.estilos, 'estilos'),
    tecnicas: mapearOpciones(dto.tecnicas, 'tecnicas'),
    tiposArte: mapearOpciones(dto.tiposArte, 'tiposArte'),
  })
}

/** Traduce el estado HTTP (y opcionalmente el `ErrorDto`) a `ErrorBusqueda`. */
export function mapearError(estadoHttp: number | null, dto?: Partial<ErrorDto> | null): ErrorBusqueda {
  let tipo: TipoErrorBusqueda
  if (estadoHttp === null) tipo = TipoErrorBusqueda.RED
  else if (estadoHttp === 400) tipo = TipoErrorBusqueda.SOLICITUD_INVALIDA
  else if (estadoHttp === 401) tipo = TipoErrorBusqueda.NO_AUTENTICADO
  else if (estadoHttp === 403) tipo = TipoErrorBusqueda.SIN_PERMISO
  else if (estadoHttp === 429) tipo = TipoErrorBusqueda.LIMITE
  else tipo = TipoErrorBusqueda.SERVIDOR

  const mensaje =
    typeof dto?.mensaje === 'string' && dto.mensaje ? dto.mensaje : mensajePorDefecto(tipo)
  return new ErrorBusqueda(tipo, mensaje, {
    codigo: typeof dto?.codigo === 'string' ? dto.codigo : undefined,
    detalles: dto?.detalles,
  })
}

function mensajePorDefecto(tipo: TipoErrorBusqueda): string {
  switch (tipo) {
    case TipoErrorBusqueda.RED:
      return 'No se pudo conectar con el servidor.'
    case TipoErrorBusqueda.NO_AUTENTICADO:
      return 'Sesión no iniciada o vencida.'
    case TipoErrorBusqueda.SIN_PERMISO:
      return 'No tenés permiso para realizar esta acción.'
    case TipoErrorBusqueda.SOLICITUD_INVALIDA:
      return 'La solicitud no es válida.'
    case TipoErrorBusqueda.LIMITE:
      return 'Demasiadas solicitudes. Intentá de nuevo en unos instantes.'
    default:
      return 'Ocurrió un error en el servidor.'
  }
}
