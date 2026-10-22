import { useEffect, useRef } from 'react'

/** Foco inicial, contención de Tab, Escape y retorno al control de origen. */
export function useModalFocus(abierto: boolean, onCancelar: () => void, ocupado: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const opciones = useRef({ onCancelar, ocupado })
  opciones.current = { onCancelar, ocupado }
  useEffect(() => {
    if (!abierto) return
    const modal = ref.current
    if (!modal) return
    const anterior = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const elementos = () => Array.from(modal.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'))
    ;(elementos()[0] ?? modal).focus()
    const teclado = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !opciones.current.ocupado) {
        event.preventDefault()
        opciones.current.onCancelar()
      }
      if (event.key === 'Tab') {
        const controles = elementos()
        const primero = controles[0]
        const ultimo = controles[controles.length - 1]
        if (!primero) { event.preventDefault(); modal.focus() }
        else if (event.shiftKey && (document.activeElement === primero || document.activeElement === modal)) { event.preventDefault(); ultimo.focus() }
        else if (!event.shiftKey && (document.activeElement === ultimo || document.activeElement === modal)) { event.preventDefault(); primero.focus() }
      }
    }
    modal.addEventListener('keydown', teclado)
    return () => {
      modal.removeEventListener('keydown', teclado)
      document.body.style.overflow = overflow
      if (anterior?.isConnected) anterior.focus()
    }
  }, [abierto])
  return ref
}
