import { MENSAJES_ERROR } from './mensajes'
import { TipoErrorBusqueda } from '../../domain/enums/TipoErrorBusqueda'
import './busqueda.css'

export function AvisoSinPermiso() {
  return (
    <div className="estado-busqueda estado-busqueda--sin-permiso" role="alert">
      <p>{MENSAJES_ERROR[TipoErrorBusqueda.SIN_PERMISO]}</p>
    </div>
  )
}
