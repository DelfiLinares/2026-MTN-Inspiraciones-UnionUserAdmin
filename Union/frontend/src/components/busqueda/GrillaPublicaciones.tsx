import type { PublicacionResumen } from '../../domain/busqueda/PublicacionResumen'
import { TarjetaPublicacion } from './TarjetaPublicacion'
import './busqueda.css'

export interface GrillaPublicacionesProps {
  readonly items: readonly PublicacionResumen[]
}

export function GrillaPublicaciones({ items }: GrillaPublicacionesProps) {
  return (
    <div
      className="grilla-publicaciones"
      role="list"
      aria-label="Publicaciones"
      aria-live="polite"
    >
      {items.map((publicacion) => (
        <div className="grilla-publicaciones__elemento" role="listitem" key={publicacion.id}>
          <TarjetaPublicacion publicacion={publicacion} />
        </div>
      ))}
    </div>
  )
}
