import { afterEach, beforeEach, expect, vi, type MockInstance } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useNavigationType,
} from 'react-router-dom'
import { PaginaBusqueda } from '../../../src/pages/busqueda/PaginaBusqueda'
import { DEBOUNCE_MS, TAMANO_PAGINA } from '../../../src/domain/busqueda/constantes'
import { BusquedaEnMemoriaRepository } from '../../../src/infrastructure/busqueda/BusquedaEnMemoriaRepository'
import {
  PUBLICACIONES_EJEMPLO,
  type PublicacionEjemplo,
} from '../../../src/infrastructure/busqueda/datosEjemplo'

/**
 * Apoyo común de los tests de integración de `PaginaBusqueda` (T067, HU-01 … HU-07).
 * Integra UI + `SesionBusqueda` + `BusquedaEnMemoriaRepository`; sin MSW ni servidor.
 *
 * Contrato asumido para T047/T049/T050 (no definido en las specs):
 * - `<PaginaBusqueda repositorio? sesionUsuario? />`, dentro de un Router. `repositorio` es el
 *   `BusquedaRepository` a usar (por defecto `obtenerBusquedaRepository()`); `sesionUsuario`
 *   es el `SesionUsuarioPort` (T060) con `alNoAutenticado(): void`, que la página llama ante
 *   un error 401 (cierre de sesión local y redirección a `/login` los hace el adaptador, T061).
 * - Compone `BarraBusqueda`, `ChipsFiltrosActivos`, `PanelFiltros` y `FeedPublicaciones` con los
 *   contratos de T062–T066: searchbox «Buscar», grupos de filtros, lista «Filtros activos»,
 *   lista «Publicaciones», estados de `EstadosFeed`.
 * - Carga el catálogo con `ObtenerCatalogoFiltros` sobre el mismo repositorio; su error es
 *   local al panel (alerta + «Reintentar») y no afecta al feed.
 * - Al montar toma los criterios de la URL (`useCriteriosEnUrl`) y los aplica a la sesión.
 * - Cuando `senalScrollInicio` cambia (cambio efectivo de criterios) llama a
 *   `window.scrollTo({ top: 0 })`; nunca al cargar más páginas.
 * - Al salir de la página guarda `window.scrollY` y al volver (mismos criterios) lo restaura
 *   con `window.scrollTo({ top })`; la estrategia de persistencia (T050) es libre.
 * - Una tarjeta enlaza a `/publicaciones/:id` (T035/T041).
 *
 * Los datos son los 55 de ejemplo (3 páginas: 20, 20 y 15). Los resultados esperados se
 * derivan de esos datos, no se escriben a mano.
 */
type Entrada = { isIntersecting: boolean }

class ObserverFalso {
  static instancias: ObserverFalso[] = []
  desconectado = false

  constructor(private readonly callback: (entradas: Entrada[]) => void) {
    ObserverFalso.instancias.push(this)
  }
  observe() {}
  unobserve() {}
  disconnect() {
    this.desconectado = true
  }
  takeRecords() {
    return []
  }
  disparar() {
    this.callback([{ isIntersecting: true }])
  }
}

export const observer = {
  activos: () => ObserverFalso.instancias.filter((o) => !o.desconectado),
  /** El centinela entra en pantalla: avisa a todos los observers activos. */
  async intersectar() {
    await act(async () => {
      observer.activos().forEach((o) => o.disparar())
    })
  },
}

export const scrollTo = vi.fn()

export function fijarScroll(y: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
  Object.defineProperty(window, 'pageYOffset', { configurable: true, value: y })
}

/** Registra los hooks comunes: observer simulado, temporizadores falsos y scroll espiado. */
export function instalarEntorno() {
  beforeEach(() => {
    ObserverFalso.instancias = []
    vi.stubGlobal('IntersectionObserver', ObserverFalso)
    vi.useFakeTimers({ shouldAdvanceTime: true })
    scrollTo.mockClear()
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo
    fijarScroll(0)
    window.sessionStorage.clear()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })
}

export interface SesionUsuarioFalsa {
  alNoAutenticado: ReturnType<typeof vi.fn>
}

type Repo = BusquedaEnMemoriaRepository

export interface OpcionesPagina {
  ruta?: string
  datos?: readonly PublicacionEjemplo[]
  /** Se ejecuta antes de renderizar, para programar fallos o pausas en los espías. */
  preparar?: (contexto: { espias: Espias; originales: Originales }) => void
}

export interface Espias {
  obtenerFyp: MockInstance<Repo['obtenerFyp']>
  buscar: MockInstance<Repo['buscar']>
  obtenerCatalogoFiltros: MockInstance<Repo['obtenerCatalogoFiltros']>
}

export interface Originales {
  obtenerFyp: Repo['obtenerFyp']
  buscar: Repo['buscar']
  obtenerCatalogoFiltros: Repo['obtenerCatalogoFiltros']
}

function Detalle() {
  return <h1>Detalle de publicación (prueba)</h1>
}

function Sonda() {
  const ubicacion = useLocation()
  const tipo = useNavigationType()
  const navegar = useNavigate()
  return (
    <div>
      <output data-testid="ubicacion">{ubicacion.pathname + ubicacion.search}</output>
      <output data-testid="tipo-navegacion">{tipo}</output>
      <button type="button" onClick={() => navegar(-1)}>
        Atrás (prueba)
      </button>
      <button type="button" onClick={() => navegar(1)}>
        Adelante (prueba)
      </button>
    </div>
  )
}

export function renderizarPagina(opciones: OpcionesPagina = {}) {
  const repositorio = new BusquedaEnMemoriaRepository({ datos: opciones.datos })
  const originales: Originales = {
    obtenerFyp: repositorio.obtenerFyp.bind(repositorio),
    buscar: repositorio.buscar.bind(repositorio),
    obtenerCatalogoFiltros: repositorio.obtenerCatalogoFiltros.bind(repositorio),
  }
  const espias: Espias = {
    obtenerFyp: vi.spyOn(repositorio, 'obtenerFyp'),
    buscar: vi.spyOn(repositorio, 'buscar'),
    obtenerCatalogoFiltros: vi.spyOn(repositorio, 'obtenerCatalogoFiltros'),
  }
  opciones.preparar?.({ espias, originales })

  const sesionUsuario: SesionUsuarioFalsa = { alNoAutenticado: vi.fn() }
  const vista = render(
    <MemoryRouter initialEntries={[opciones.ruta ?? '/buscar']}>
      <Routes>
        <Route path="/publicaciones/:id" element={<Detalle />} />
        <Route
          path="*"
          element={<PaginaBusqueda repositorio={repositorio} sesionUsuario={sesionUsuario} />}
        />
      </Routes>
      <Sonda />
    </MemoryRouter>,
  )
  return { repositorio, espias, originales, sesionUsuario, ...vista }
}

// ── Consultas ──────────────────────────────────────────────────────────────────────────
export const barra = () => screen.getByRole('searchbox', { name: /buscar/i })
export const tarjetas = () => screen.queryAllByRole('article')
export const titulos = () => {
  const lista = screen.queryByRole('list', { name: /publicaciones/i })
  return lista ? within(lista).queryAllByRole('heading').map((h) => h.textContent ?? '') : []
}
export const ubicacion = () => screen.getByTestId('ubicacion').textContent ?? ''
export const parametros = () => new URLSearchParams(ubicacion().split('?')[1] ?? '')
export const tipoNavegacion = () => screen.getByTestId('tipo-navegacion').textContent ?? ''
export const chips = () => {
  const lista = screen.queryByRole('list', { name: /filtros activos/i })
  return lista ? within(lista).queryAllByRole('listitem') : []
}

// ── Acciones ───────────────────────────────────────────────────────────────────────────
export function escribir(texto: string) {
  fireEvent.change(barra(), { target: { value: texto } })
}

export function pasarDebounce() {
  act(() => {
    vi.advanceTimersByTime(DEBOUNCE_MS)
  })
}

export function buscarTexto(texto: string) {
  escribir(texto)
  pasarDebounce()
}

export async function marcar(grupo: RegExp, opcion: string | RegExp) {
  const contenedor = await screen.findByRole('group', { name: grupo })
  fireEvent.click(await within(contenedor).findByRole('checkbox', { name: opcion }))
}

export async function esperarTarjetas(cantidad: number) {
  await waitFor(() => expect(tarjetas()).toHaveLength(cantidad))
}

/** Deja correr promesas y temporizadores pendientes (p. ej. respuestas tardías). */
export async function vaciar() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(50)
  })
}

export function crearPuerta() {
  let abrir!: () => void
  const promesa = new Promise<void>((resolver) => {
    abrir = resolver
  })
  return { promesa, abrir }
}

// ── Resultados esperados (derivados de los datos de ejemplo) ───────────────────────────
export const todos = PUBLICACIONES_EJEMPLO
export const titulosDe = (datos: readonly PublicacionEjemplo[]) =>
  datos.map((d) => d.resumen.titulo)
export const primeraPagina = (datos: readonly PublicacionEjemplo[]) =>
  titulosDe(datos).slice(0, TAMANO_PAGINA)
/** Publicaciones cuyas etiquetas (tema, estilo, técnica) incluyen `etiqueta`. */
export const conEtiqueta = (etiqueta: string) =>
  PUBLICACIONES_EJEMPLO.filter((d) => d.tags.includes(etiqueta))
export { TAMANO_PAGINA }
