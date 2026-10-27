import React from 'react'
import { EmptyState, MensajeErrorDesafio, Spinner } from '../../components/comunes'

export type VarianteEstadoVacioDesafios = 'listado-sin-filtros' | 'listado-con-filtros' | 'respuestas'

export interface EstadoVacioDesafiosProps {
  variante: VarianteEstadoVacioDesafios
  onLimpiarFiltros?: () => void
  className?: string
}

export interface EstadoCargandoDesafiosProps {
  mensaje?: string
  className?: string
}

export interface EstadoErrorRedDesafiosProps {
  mensaje?: string
  onReintentar?: () => void
  className?: string
}

const configEstadoVacio: Record<
  VarianteEstadoVacioDesafios,
  { titulo: string; mensaje: string; textoAccion?: string }
> = {
  'listado-sin-filtros': {
    titulo: 'No hay desafíos disponibles',
    mensaje: 'Cuando se publiquen desafíos, aparecerán acá.',
  },
  'listado-con-filtros': {
    titulo: 'No encontramos desafíos con esos filtros',
    mensaje: 'Podés limpiar los filtros para ver más resultados.',
    textoAccion: 'Limpiar filtros',
  },
  respuestas: {
    titulo: 'No hay respuestas aún',
    mensaje: 'Este desafío todavía no recibió respuestas.',
  },
}

/**
 * T072 - Estado vacío de desafíos.
 *
 * Unifica los mensajes de vacío para el listado (HU-10)
 * y para respuestas sin contenido (CB-09).
 */
export const EstadoVacioDesafios: React.FC<EstadoVacioDesafiosProps> = ({
  variante,
  onLimpiarFiltros,
  className,
}) => {
  const config = configEstadoVacio[variante]
  const mostrarAccionLimpiar = variante === 'listado-con-filtros' && onLimpiarFiltros

  return (
    <section className={className} aria-live="polite">
      <EmptyState
        titulo={config.titulo}
        mensaje={config.mensaje}
        onAccion={mostrarAccionLimpiar ? onLimpiarFiltros : undefined}
        textoAccion={mostrarAccionLimpiar ? config.textoAccion : undefined}
      />
    </section>
  )
}

/**
 * T072 - Estado de cargando reutilizable.
 */
export const EstadoCargandoDesafios: React.FC<EstadoCargandoDesafiosProps> = ({
  mensaje = 'Cargando desafíos...',
  className,
}) => {
  return (
    <section className={className} aria-live="polite" aria-busy="true">
      <Spinner tamano="md" texto={mensaje} />
    </section>
  )
}

/**
 * T072 - Estado de error de red reutilizable.
 */
export const EstadoErrorRedDesafios: React.FC<EstadoErrorRedDesafiosProps> = ({
  mensaje = 'No se pudieron cargar los datos. Intentá nuevamente.',
  onReintentar,
  className,
}) => {
  return (
    <section className={className} aria-live="polite">
      <MensajeErrorDesafio codigo={undefined} mensaje={mensaje} />
      {onReintentar && <button type="button" onClick={onReintentar}>Reintentar</button>}
    </section>
  )
}
