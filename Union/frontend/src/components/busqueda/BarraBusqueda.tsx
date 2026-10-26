import { useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'
import { DEBOUNCE_MS, MIN_CARACTERES } from '../../domain/busqueda/constantes'
import './busqueda.css'

export interface BarraBusquedaProps {
  /** Texto vigente de los criterios (p. ej. restaurado desde la URL). */
  readonly valor: string
  /** Se llama con el texto normalizado, 400 ms después de la última pulsación. */
  readonly onCambiar: (texto: string) => void
}

/** Normalización del dominio (RF-02): la barra no duplica la regla. */
const normalizar = (texto: string): string => CriteriosBusqueda.vacio().conTexto(texto).texto

/**
 * Barra de búsqueda (T040; HU-02, RF-01–04, RF-23).
 * Solo presentación: el campo es local, emite con debounce y normalizado; decidir si el texto
 * es buscable (≥ 2 caracteres) es de `CriteriosBusqueda`, por eso también emite con 0 o 1
 * carácter. Con 1 carácter solo muestra un aviso.
 */
export function BarraBusqueda({ valor, onCambiar }: BarraBusquedaProps) {
  const idCampo = useId()
  const [texto, setTexto] = useState(valor)
  const campoRef = useRef<HTMLInputElement>(null)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ultimoEmitido = useRef(normalizar(valor))
  const onCambiarRef = useRef(onCambiar)
  onCambiarRef.current = onCambiar

  const cancelarPendiente = () => {
    if (temporizador.current !== null) {
      clearTimeout(temporizador.current)
      temporizador.current = null
    }
  }

  // Cambio externo de `valor` (atrás/adelante): actualiza el campo sin emitir.
  useEffect(() => {
    if (valor !== ultimoEmitido.current) {
      cancelarPendiente()
      ultimoEmitido.current = valor
      setTexto(valor)
    }
  }, [valor])

  useEffect(() => cancelarPendiente, [])

  const alCambiar = (evento: ChangeEvent<HTMLInputElement>) => {
    const nuevo = evento.target.value
    setTexto(nuevo)
    cancelarPendiente()
    temporizador.current = setTimeout(() => {
      temporizador.current = null
      const normalizado = normalizar(nuevo)
      if (normalizado === ultimoEmitido.current) return
      ultimoEmitido.current = normalizado
      onCambiarRef.current(normalizado)
    }, DEBOUNCE_MS)
  }

  const borrar = () => {
    cancelarPendiente()
    setTexto('')
    ultimoEmitido.current = ''
    onCambiarRef.current('')
    campoRef.current?.focus()
  }

  const alPulsarTecla = (evento: KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === 'Escape' && texto !== '') borrar()
  }

  const avisoMinimo = CriteriosBusqueda.vacio().conTexto(texto).esTextoIncompleto()

  return (
    <form role="search" className="barra-busqueda" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor={idCampo} className="barra-busqueda__etiqueta">
        Buscar
      </label>
      <div className="barra-busqueda__campo">
        <input
          ref={campoRef}
          id={idCampo}
          type="search"
          className="barra-busqueda__input"
          placeholder="Buscar publicaciones"
          autoComplete="off"
          value={texto}
          onChange={alCambiar}
          onKeyDown={alPulsarTecla}
        />
        {texto !== '' && (
          <button
            type="button"
            className="barra-busqueda__borrar"
            aria-label="Borrar búsqueda"
            onClick={borrar}
          >
            ×
          </button>
        )}
      </div>
      {avisoMinimo && (
        <p role="status" className="barra-busqueda__aviso">
          Escribí al menos {MIN_CARACTERES} caracteres para buscar.
        </p>
      )}
    </form>
  )
}
