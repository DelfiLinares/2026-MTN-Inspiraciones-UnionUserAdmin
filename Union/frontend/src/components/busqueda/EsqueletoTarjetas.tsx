import { MENSAJES_CARGA } from './mensajes'
import './busqueda.css'

export interface EsqueletoTarjetasProps {
  cantidad?: number
}

export function EsqueletoTarjetas({ cantidad = 6 }: EsqueletoTarjetasProps) {
  return (
    <div
      className="esqueleto-tarjetas"
      role="status"
      aria-label={MENSAJES_CARGA.cargandoPublicaciones}
      aria-busy="true"
    >
      {Array.from({ length: cantidad }, (_, indice) => (
        <div
          key={indice}
          className="esqueleto-tarjetas__tarjeta"
          data-testid="esqueleto-tarjeta"
          aria-hidden="true"
        >
          <div className="esqueleto-tarjetas__miniatura" />
          <div className="esqueleto-tarjetas__linea" />
          <div className="esqueleto-tarjetas__linea esqueleto-tarjetas__linea--corta" />
        </div>
      ))}
    </div>
  )
}
