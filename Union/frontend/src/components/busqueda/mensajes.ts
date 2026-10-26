import { TipoErrorBusqueda } from '../../domain/enums/TipoErrorBusqueda'

export const MENSAJES_CARGA = {
  cargandoPublicaciones: 'Cargando publicaciones',
  cargarMas: 'Cargar más',
} as const

export const MENSAJES_VACIO = {
  titulo: 'No se encontraron publicaciones.',
  sugerencia: 'Probá limpiar los filtros para ver más resultados.',
  limpiarFiltros: 'Limpiar filtros',
} as const

export const MENSAJE_REINTENTAR = 'Reintentar'

export const MENSAJES_ERROR: Record<TipoErrorBusqueda, string> = {
  [TipoErrorBusqueda.RED]: 'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.',
  [TipoErrorBusqueda.NO_AUTENTICADO]: 'Tu sesión no está autenticada.',
  [TipoErrorBusqueda.SIN_PERMISO]: 'No tenés permiso para ver estas publicaciones.',
  [TipoErrorBusqueda.SOLICITUD_INVALIDA]: 'No pudimos procesar la solicitud. Revisá la búsqueda e intentá de nuevo.',
  [TipoErrorBusqueda.LIMITE]: 'Hay demasiadas solicitudes. Esperá un momento e intentá de nuevo.',
  [TipoErrorBusqueda.SERVIDOR]: 'Ocurrió un problema en el servidor. Intentá de nuevo.',
}
