import type { ErrorBusqueda } from '../../domain/busqueda/ErrorBusqueda'
import { MENSAJE_REINTENTAR, MENSAJES_ERROR } from './mensajes'
import './busqueda.css'

export interface EstadoErrorProps {
  error: ErrorBusqueda
  onReintentar: () => void
}

export function EstadoError({ error, onReintentar }: EstadoErrorProps) {
  return (
    <div className="estado-busqueda estado-busqueda--error" role="alert">
      <p>{MENSAJES_ERROR[error.tipo]}</p>
      {error.esReintentable ? (
        <button type="button" onClick={onReintentar}>
          {MENSAJE_REINTENTAR}
        </button>
      ) : null}
    </div>
  )
}
