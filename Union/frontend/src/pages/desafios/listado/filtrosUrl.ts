export type EstadoFiltroDesafio = 'PROGRAMADO' | 'ACTIVO' | 'FINALIZADO'

export interface FiltrosListadoDesafios {
  ambitos: string[]
  estado?: EstadoFiltroDesafio
}

export function parsearFiltrosDesdeSearch(search: string): FiltrosListadoDesafios {
  const params = new URLSearchParams(search)
  const estado = params.get('estado')
  const ambito = params.get('ambito')

  const ambitos = (ambito ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)

  const estadoNormalizado =
    estado === 'PROGRAMADO' || estado === 'ACTIVO' || estado === 'FINALIZADO'
      ? estado
      : undefined

  return {
    ambitos,
    estado: estadoNormalizado,
  }
}

export function construirSearchDesdeFiltros(filtros: FiltrosListadoDesafios): string {
  const params = new URLSearchParams()

  if (filtros.ambitos.length > 0) {
    params.set('ambito', filtros.ambitos.join(','))
  }

  if (filtros.estado) {
    params.set('estado', filtros.estado)
  }

  const search = params.toString()
  return search ? `?${search}` : ''
}

export function hayFiltrosActivos(filtros: FiltrosListadoDesafios): boolean {
  return filtros.ambitos.length > 0 || Boolean(filtros.estado)
}
