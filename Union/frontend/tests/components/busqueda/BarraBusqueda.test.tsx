import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { BarraBusqueda } from '../../../src/components/busqueda/BarraBusqueda'

/**
 * T062 — BarraBusqueda (HU-02; RF-01–04, RF-23; CA-02.1, CA-02.3, CA-02.4, CA-02.5).
 * Fuente: Union/specs/007-inspiraciones-busqueda/{spec,plan,tasks}.md
 *
 * Contrato asumido para T040 (no definido en las specs):
 * - `<BarraBusqueda valor={string} onCambiar={(texto: string) => void} />`.
 *   `valor` es el texto vigente de los criterios (para restaurarlo, p. ej. desde la URL).
 * - Contenedor `role="search"`; campo `role="searchbox"` con etiqueta accesible "Buscar".
 * - El campo es controlado localmente: lo escrito se ve al instante; `onCambiar` se emite
 *   400 ms después de la última pulsación (debounce) con el texto ya normalizado
 *   (espacios recortados/colapsados, máximo 100 caracteres).
 * - La barra emite también con 0 o 1 carácter: decidir si es buscable es de
 *   `CriteriosBusqueda`, así la sesión vuelve al FYP al borrar. Con 1 carácter normalizado
 *   muestra un aviso `role="status"` («Escribí al menos 2 caracteres»); no bloquea nada.
 * - Botón «Borrar búsqueda» visible solo si hay texto; un clic vacía el campo y emite
 *   `''` de inmediato (sin esperar el debounce) y devuelve el foco al campo.
 * - Escape con el campo enfocado equivale a borrar.
 * - No emite si el texto normalizado no cambió respecto del último emitido/`valor`.
 */
describe('BarraBusqueda', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const avanzar = (ms: number) => act(() => void vi.advanceTimersByTime(ms))
  const campo = () => screen.getByRole('searchbox', { name: /buscar/i })
  const escribir = (texto: string) => fireEvent.change(campo(), { target: { value: texto } })

  function renderizar(valor = '') {
    const onCambiar = vi.fn()
    const vista = render(<BarraBusqueda valor={valor} onCambiar={onCambiar} />)
    return { onCambiar, ...vista }
  }

  describe('accesibilidad (RF-01, CA-02.1)', () => {
    it('expone un contenedor de búsqueda y un campo con etiqueta accesible', () => {
      renderizar()

      expect(screen.getByRole('search')).toBeInTheDocument()
      expect(campo()).toBeInTheDocument()
    })

    it('muestra el valor inicial recibido', () => {
      renderizar('acuarela')

      expect(campo()).toHaveValue('acuarela')
    })

    it('el campo es alcanzable con el teclado', () => {
      renderizar()

      campo().focus()

      expect(campo()).toHaveFocus()
    })

    it('no emite nada al montar', () => {
      const { onCambiar } = renderizar('acuarela')

      avanzar(1000)

      expect(onCambiar).not.toHaveBeenCalled()
    })
  })

  describe('debounce de 400 ms (RF-03, RF-23, CA-02.4)', () => {
    it('no emite mientras no pasen 400 ms', () => {
      const { onCambiar } = renderizar()

      escribir('paisaje')
      avanzar(399)

      expect(onCambiar).not.toHaveBeenCalled()
    })

    it('emite una vez a los 400 ms', () => {
      const { onCambiar } = renderizar()

      escribir('paisaje')
      avanzar(400)

      expect(onCambiar).toHaveBeenCalledTimes(1)
      expect(onCambiar).toHaveBeenCalledWith('paisaje')
    })

    it('lo escrito se muestra al instante, sin esperar el debounce', () => {
      renderizar()

      escribir('paisaje')

      expect(campo()).toHaveValue('paisaje')
    })

    it('no dispara por tecla: varias pulsaciones seguidas emiten una sola vez', () => {
      const { onCambiar } = renderizar()

      for (const texto of ['o', 'ol', 'ole', 'oleo']) {
        escribir(texto)
        avanzar(100)
      }
      expect(onCambiar).not.toHaveBeenCalled()

      avanzar(400)

      expect(onCambiar).toHaveBeenCalledTimes(1)
      expect(onCambiar).toHaveBeenCalledWith('oleo')
    })

    it('cada pulsación reinicia la espera', () => {
      const { onCambiar } = renderizar()

      escribir('pa')
      avanzar(300)
      escribir('pai')
      avanzar(300)
      expect(onCambiar).not.toHaveBeenCalled()

      avanzar(100)

      expect(onCambiar).toHaveBeenCalledTimes(1)
      expect(onCambiar).toHaveBeenCalledWith('pai')
    })

    it('al desmontar cancela el temporizador pendiente', () => {
      const { onCambiar, unmount } = renderizar()

      escribir('paisaje')
      unmount()
      avanzar(1000)

      expect(onCambiar).not.toHaveBeenCalled()
    })
  })

  describe('normalización antes de emitir (RF-02, CA-02.3)', () => {
    it('recorta y colapsa espacios', () => {
      const { onCambiar } = renderizar()

      escribir('   paisaje    al   óleo  ')
      avanzar(400)

      expect(onCambiar).toHaveBeenCalledWith('paisaje al óleo')
    })

    it('un texto solo con espacios equivale a vacío', () => {
      const { onCambiar } = renderizar('acuarela')

      escribir('     ')
      avanzar(400)

      expect(onCambiar).toHaveBeenCalledWith('')
    })

    it('limita el texto emitido a 100 caracteres', () => {
      const { onCambiar } = renderizar()

      escribir('a'.repeat(150))
      avanzar(400)

      expect(onCambiar).toHaveBeenCalledTimes(1)
      expect((onCambiar.mock.calls[0][0] as string).length).toBe(100)
    })

    it('no emite si el texto normalizado no cambió', () => {
      const { onCambiar } = renderizar('acuarela')

      escribir('  acuarela ')
      avanzar(400)

      expect(onCambiar).not.toHaveBeenCalled()
    })
  })

  describe('mínimo de 2 caracteres (RF-23)', () => {
    it('con 1 carácter muestra un aviso y no impide emitir', () => {
      const { onCambiar } = renderizar()

      escribir('a')

      expect(screen.getByRole('status')).toHaveTextContent(/al menos 2 caracteres/i)
      avanzar(400)
      expect(onCambiar).toHaveBeenCalledWith('a')
    })

    it('con 2 o más caracteres no muestra el aviso', () => {
      renderizar()

      escribir('ab')

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('con el campo vacío no muestra el aviso', () => {
      renderizar()

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('emite el texto vacío al borrar para volver al FYP', () => {
      const { onCambiar } = renderizar('acuarela')

      escribir('')
      avanzar(400)

      expect(onCambiar).toHaveBeenCalledWith('')
    })
  })

  describe('borrar en un solo paso (RF-04, CA-02.5)', () => {
    it('el botón no se muestra con el campo vacío', () => {
      renderizar()

      expect(screen.queryByRole('button', { name: /borrar b[uú]squeda/i })).not.toBeInTheDocument()
    })

    it('un clic vacía el campo y emite vacío de inmediato', () => {
      const { onCambiar } = renderizar('acuarela')

      fireEvent.click(screen.getByRole('button', { name: /borrar b[uú]squeda/i }))

      expect(campo()).toHaveValue('')
      expect(onCambiar).toHaveBeenCalledTimes(1)
      expect(onCambiar).toHaveBeenCalledWith('')
    })

    it('tras borrar, el foco vuelve al campo', () => {
      renderizar('acuarela')

      fireEvent.click(screen.getByRole('button', { name: /borrar b[uú]squeda/i }))

      expect(campo()).toHaveFocus()
    })

    it('borrar descarta una emisión pendiente (no emite dos veces)', () => {
      const { onCambiar } = renderizar()

      escribir('paisaje')
      fireEvent.click(screen.getByRole('button', { name: /borrar b[uú]squeda/i }))
      avanzar(1000)

      expect(onCambiar).toHaveBeenCalledTimes(1)
      expect(onCambiar).toHaveBeenCalledWith('')
    })

    it('el botón es alcanzable con el teclado', () => {
      renderizar('acuarela')
      const boton = screen.getByRole('button', { name: /borrar b[uú]squeda/i })

      boton.focus()

      expect(boton).toHaveFocus()
    })

    it('Escape en el campo equivale a borrar', () => {
      const { onCambiar } = renderizar('acuarela')

      fireEvent.keyDown(campo(), { key: 'Escape' })

      expect(campo()).toHaveValue('')
      expect(onCambiar).toHaveBeenCalledWith('')
    })
  })

  describe('sincronización con el valor externo', () => {
    it('si `valor` cambia desde afuera (p. ej. atrás en el historial) actualiza el campo', () => {
      const onCambiar = vi.fn()
      const { rerender } = render(<BarraBusqueda valor="acuarela" onCambiar={onCambiar} />)

      rerender(<BarraBusqueda valor="oleo" onCambiar={onCambiar} />)

      expect(campo()).toHaveValue('oleo')
      avanzar(1000)
      expect(onCambiar).not.toHaveBeenCalled()
    })
  })
})
