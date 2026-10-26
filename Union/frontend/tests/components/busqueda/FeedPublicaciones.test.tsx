import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FeedPublicaciones } from '../../../src/components/busqueda/FeedPublicaciones'
import { PublicacionResumen } from '../../../src/domain/busqueda/PublicacionResumen'
import { EstadoPublicacion } from '../../../src/domain/enums/EstadoPublicacion'
import { TipoContenido } from '../../../src/domain/enums/TipoContenido'

/**
 * T066 — FeedPublicaciones: scroll infinito (HU-01; RF-06–08; CA-01.2–CA-01.5).
 * Fuente: Union/specs/007-inspiraciones-busqueda/{spec,plan,tasks}.md
 *
 * `IntersectionObserver` se simula (jsdom no lo implementa), como indica plan.md §.
 *
 * Contrato asumido para T045 (no definido en las specs):
 * - `<FeedPublicaciones items hayMas cargando onCargarMas />`, dentro de un Router.
 *   `items: readonly PublicacionResumen[]`, `hayMas: boolean`, `cargando: boolean`
 *   (hay una carga en curso), `onCargarMas: () => void`.
 * - Renderiza una `TarjetaPublicacion` por item, en el orden recibido, sin reordenar,
 *   filtrar ni deduplicar (esas reglas son de la API/sesión).
 * - Centinela `data-testid="feed-centinela"` al final de la lista, presente solo si
 *   `hayMas`. Se observa con `useInfiniteScrollSentinel`, habilitado solo si
 *   `hayMas && !cargando`; al intersectar llama a `onCargarMas`.
 * - Con `cargando` muestra un indicador `role="status"` (esqueletos, CA-05.1) y mantiene los
 *   items ya visibles.
 * - Cada tarjeta es un `article` dentro de una lista (`role="list"`, nombre «Publicaciones»).
 */
type Entrada = { isIntersecting: boolean }

class IntersectionObserverFalso {
  static instancias: IntersectionObserverFalso[] = []
  observados: Element[] = []
  desconectado = false

  constructor(private readonly callback: (entradas: Entrada[]) => void) {
    IntersectionObserverFalso.instancias.push(this)
  }

  observe(elemento: Element) {
    this.observados.push(elemento)
  }
  unobserve() {}
  disconnect() {
    this.desconectado = true
  }
  takeRecords() {
    return []
  }

  disparar(isIntersecting: boolean) {
    this.callback([{ isIntersecting }])
  }

  static activos() {
    return IntersectionObserverFalso.instancias.filter((i) => !i.desconectado)
  }
}

const publicacion = (id: string, titulo = `Obra ${id}`) =>
  new PublicacionResumen({
    id,
    titulo,
    autor: { id: 'a1', nombre: 'Autora' },
    miniaturaUrl: `https://cdn.example.com/${id}.jpg`,
    tipoContenido: TipoContenido.IMAGEN,
    estado: EstadoPublicacion.ACTIVA,
  })

function renderizar(props: Partial<Parameters<typeof FeedPublicaciones>[0]> = {}) {
  const onCargarMas = vi.fn()
  const completo = {
    items: [publicacion('1'), publicacion('2'), publicacion('3')],
    hayMas: true,
    cargando: false,
    onCargarMas,
    ...props,
  }
  const vista = render(
    <MemoryRouter>
      <FeedPublicaciones {...completo} />
    </MemoryRouter>,
  )
  return { onCargarMas: completo.onCargarMas, rerenderizar: vista.rerender, ...vista }
}

const envolver = (props: Parameters<typeof FeedPublicaciones>[0]) => (
  <MemoryRouter>
    <FeedPublicaciones {...props} />
  </MemoryRouter>
)

describe('FeedPublicaciones — scroll infinito', () => {
  beforeEach(() => {
    IntersectionObserverFalso.instancias = []
    vi.stubGlobal('IntersectionObserver', IntersectionObserverFalso)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('lista y orden (RF-06, CA-01.2)', () => {
    it('muestra una tarjeta por item', () => {
      renderizar()

      const lista = screen.getByRole('list', { name: /publicaciones/i })
      expect(within(lista).getAllByRole('article')).toHaveLength(3)
    })

    it('preserva el orden entregado por la API', () => {
      renderizar({ items: [publicacion('9', 'Zeta'), publicacion('1', 'Alfa'), publicacion('5', 'Mu')] })

      const titulos = screen.getAllByRole('heading').map((h) => h.textContent)

      expect(titulos).toEqual(['Zeta', 'Alfa', 'Mu'])
    })

    it('no reordena ni descarta items al recibir más: agrega al final', () => {
      const { rerenderizar, onCargarMas } = renderizar({
        items: [publicacion('1', 'Uno'), publicacion('2', 'Dos')],
      })

      rerenderizar(
        envolver({
          items: [publicacion('1', 'Uno'), publicacion('2', 'Dos'), publicacion('3', 'Tres')],
          hayMas: true,
          cargando: false,
          onCargarMas,
        }),
      )

      expect(screen.getAllByRole('heading').map((h) => h.textContent)).toEqual(['Uno', 'Dos', 'Tres'])
    })

    it('con lista vacía no renderiza tarjetas', () => {
      renderizar({ items: [], hayMas: false })

      expect(screen.queryByRole('article')).not.toBeInTheDocument()
    })
  })

  describe('solicitud al llegar cerca del final (RF-07, CA-01.3)', () => {
    it('observa el centinela cuando hay más y no hay carga en curso', () => {
      renderizar()

      const observer = IntersectionObserverFalso.activos()[0]
      expect(observer.observados).toContain(screen.getByTestId('feed-centinela'))
    })

    it('al intersectar el centinela pide la siguiente página', () => {
      const { onCargarMas } = renderizar()

      act(() => IntersectionObserverFalso.activos()[0].disparar(true))

      expect(onCargarMas).toHaveBeenCalledTimes(1)
    })

    it('si el centinela no es visible no pide nada', () => {
      const { onCargarMas } = renderizar()

      act(() => IntersectionObserverFalso.activos()[0].disparar(false))

      expect(onCargarMas).not.toHaveBeenCalled()
    })

    it('no pide nada al montar si el centinela no intersecta', () => {
      const { onCargarMas } = renderizar()

      expect(onCargarMas).not.toHaveBeenCalled()
    })
  })

  describe('no solicita con carga en curso (RF-08, CA-01.4)', () => {
    it('con cargando=true no observa el centinela', () => {
      renderizar({ cargando: true })

      expect(IntersectionObserverFalso.activos()).toHaveLength(0)
    })

    it('si cargando pasa a true deja de observar', () => {
      const { rerenderizar, onCargarMas } = renderizar()
      expect(IntersectionObserverFalso.activos()).toHaveLength(1)

      rerenderizar(
        envolver({ items: [publicacion('1')], hayMas: true, cargando: true, onCargarMas }),
      )

      expect(IntersectionObserverFalso.activos()).toHaveLength(0)
    })

    it('al terminar la carga vuelve a observar', () => {
      const { rerenderizar, onCargarMas } = renderizar({ cargando: true })

      rerenderizar(
        envolver({ items: [publicacion('1')], hayMas: true, cargando: false, onCargarMas }),
      )

      expect(IntersectionObserverFalso.activos()).toHaveLength(1)
    })

    it('muestra un indicador de carga sin quitar los items ya cargados', () => {
      renderizar({ cargando: true })

      expect(screen.getByRole('status', { name: /cargando/i })).toBeInTheDocument()
      expect(screen.getAllByRole('article')).toHaveLength(3)
    })

    it('sin carga en curso no muestra el indicador', () => {
      renderizar()

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('no solicita sin más resultados (RF-08, CA-01.5)', () => {
    it('con hayMas=false no hay centinela', () => {
      renderizar({ hayMas: false })

      expect(screen.queryByTestId('feed-centinela')).not.toBeInTheDocument()
    })

    it('con hayMas=false no observa nada', () => {
      renderizar({ hayMas: false })

      expect(IntersectionObserverFalso.activos()).toHaveLength(0)
    })

    it('si hayMas pasa a false deja de observar y no vuelve a pedir', () => {
      const { rerenderizar, onCargarMas } = renderizar()

      rerenderizar(
        envolver({ items: [publicacion('1')], hayMas: false, cargando: false, onCargarMas }),
      )

      expect(IntersectionObserverFalso.activos()).toHaveLength(0)
      expect(onCargarMas).not.toHaveBeenCalled()
    })
  })

  describe('limpieza', () => {
    it('al desmontar desconecta el observer', () => {
      const { unmount } = renderizar()
      const observer = IntersectionObserverFalso.activos()[0]

      unmount()

      expect(observer.desconectado).toBe(true)
    })

    it('usa siempre el último onCargarMas recibido', () => {
      const { rerenderizar } = renderizar()
      const nuevo = vi.fn()

      rerenderizar(envolver({ items: [publicacion('1')], hayMas: true, cargando: false, onCargarMas: nuevo }))
      act(() => IntersectionObserverFalso.activos()[0].disparar(true))

      expect(nuevo).toHaveBeenCalledTimes(1)
    })
  })
})
