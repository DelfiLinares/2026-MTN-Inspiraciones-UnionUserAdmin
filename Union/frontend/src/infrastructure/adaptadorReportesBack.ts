/**
 * Adaptador entre el contrato real del back de reportes (`/api/admin/reportes`) y los modelos del
 * front: paginación base 0 (`pagina`/`tamanio`/`contenido`/`totalElementos`) y nombres de campos
 * (`fechaCreacion`, `estadoModeracion`). Ver specs/011-reportes-endpoints-frontend.
 */

export interface FiltrosListadoFront {
  page?: number
  pageSize?: number
  estadoModeracion?: string
  prioridad?: string
  motivo?: string
}

export interface PaginaBack<T> {
  contenido?: T[]
  totalElementos?: number
  pagina?: number
  tamanioPagina?: number
}

export interface ReporteBack {
  id: string
  publicacionId: string
  reportanteId?: string
  motivo: string
  prioridad?: string
  estadoModeracion?: string
  estado?: string
  fechaCreacion?: string
  fecha?: string
  publicacion?: unknown
  reportante?: unknown
}

const TAMANIO_POR_DEFECTO = 10
const TAMANIO_MAXIMO = 100

export function paramsListadoBack(filtros: FiltrosListadoFront) {
  const page = Math.max(filtros.page ?? 1, 1)
  const tamanio = Math.min(Math.max(filtros.pageSize ?? TAMANIO_POR_DEFECTO, 1), TAMANIO_MAXIMO)
  return {
    pagina: page - 1,
    tamanio,
    estadoModeracion: filtros.estadoModeracion,
    prioridad: filtros.prioridad,
    motivo: filtros.motivo,
  }
}

export function paginaDesdeBack<TFila, TItem>(
  respuesta: PaginaBack<TFila>,
  mapear: (fila: TFila) => TItem,
): { items: TItem[]; total: number } {
  const items = Array.isArray(respuesta?.contenido) ? respuesta.contenido.map(mapear) : []
  const total = typeof respuesta?.totalElementos === 'number' ? respuesta.totalElementos : items.length
  return { items, total }
}

export function normalizarReporteBack(dto: ReporteBack) {
  const { fechaCreacion, estadoModeracion, fecha, estado, ...resto } = dto
  return {
    ...resto,
    estado: estadoModeracion ?? estado,
    fecha: fechaCreacion ?? fecha,
  }
}
