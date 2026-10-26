import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ObtenerCatalogoFiltros } from '../../application/busqueda/ObtenerCatalogoFiltros'
import type { BusquedaRepository } from '../../application/busqueda/BusquedaRepository'
import { CodecCriteriosUrl } from '../../domain/busqueda/CodecCriteriosUrl'
import type { CatalogoFiltros } from '../../domain/busqueda/CatalogoFiltros'
import type { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'
import type { ErrorBusqueda } from '../../domain/busqueda/ErrorBusqueda'
import type { SesionUsuarioPort } from '../../application/busqueda/SesionUsuarioPort'
import { EstadoCarga } from '../../domain/enums/EstadoCarga'
import { TipoErrorBusqueda } from '../../domain/enums/TipoErrorBusqueda'
import { crearSesionUsuarioAdapter } from '../../infrastructure/busqueda/SesionUsuarioAdapter'
import { obtenerBusquedaRepository } from '../../infrastructure/config'
import {
  BarraBusqueda,
  ChipsFiltrosActivos,
  FeedPublicaciones,
  PanelFiltros,
} from '../../components/busqueda'
import { useBusqueda } from './useBusqueda'
import { useCriteriosEnUrl } from './useCriteriosEnUrl'
import { useRestauracionScroll } from './useRestauracionScroll'
import { useScrollAlInicio } from './useScrollAlInicio'
import './busqueda-page.css'

export interface PaginaBusquedaProps {
  /** Por defecto, el repositorio configurado en `infrastructure/config`. */
  readonly repositorio?: BusquedaRepository
  /** Por defecto, `SesionUsuarioAdapter` (cierre local y redirección a `/login`). */
  readonly sesionUsuario?: SesionUsuarioPort
}

/** A-02 diferida: sin ubicación concedida, DISTANCIA nunca se toma de la URL. */
const CONTEXTO_URL = { ubicacionConcedida: false } as const

/**
 * Página de búsqueda y feed "Para ti" (T047, HU-01 … HU-07). Solo compone componentes y
 * hooks: no contiene reglas de negocio ni llama a `geolocationClient`, `authService` ni
 * `sessionGuard`.
 *
 * - Criterios → sesión: `useBusqueda` (T037). Al montar, y ante atrás/adelante, la sesión se
 *   iguala a los criterios de la URL.
 * - URL ⇄ criterios: `useCriteriosEnUrl` (T039). Hasta que la sesión está sembrada desde la
 *   URL se le pasa la semilla parseada de la URL inicial; así no reescribe (ni vacía) la URL
 *   de un enlace directo antes de aplicarla.
 * - El catálogo de filtros se carga aparte; su error es local al panel.
 * - Al cambiar efectivamente los criterios vuelve al inicio de la página. La siembra inicial
 *   no reinicia el scroll.
 */
export function PaginaBusqueda({
  repositorio: repositorioProp,
  sesionUsuario: sesionUsuarioProp,
}: PaginaBusquedaProps) {
  const repositorio = useMemo(
    () => repositorioProp ?? obtenerBusquedaRepository(),
    [repositorioProp],
  )
  const sesionUsuario = useMemo(
    () => sesionUsuarioProp ?? crearSesionUsuarioAdapter(),
    [sesionUsuarioProp],
  )

  const { search } = useLocation()
  const [semilla] = useState(() =>
    CodecCriteriosUrl.parsear(new URLSearchParams(search), CONTEXTO_URL),
  )
  const [sembrada, setSembrada] = useState(false)

  const busqueda = useBusqueda(repositorio)
  const {
    criterios,
    items,
    hayMas,
    estadoCarga,
    error,
    senalScrollInicio,
    cambiarTexto,
    aplicarFiltro,
    quitarFiltro,
    limpiarFiltros,
    cargarMas,
    reintentar,
  } = busqueda

  const { criteriosEnUrl } = useCriteriosEnUrl(sembrada ? criterios : semilla)

  useRestauracionScroll({ itemsCount: items.length, estadoCarga, hayMas, cargarMas })

  useEffect(() => {
    if (!criterios.equivale(criteriosEnUrl)) {
      if (criterios.texto !== criteriosEnUrl.texto) cambiarTexto(criteriosEnUrl.texto)
      for (const filtro of criterios.filtros) {
        if (!criteriosEnUrl.filtros.some((otro) => otro.equals(filtro))) quitarFiltro(filtro)
      }
      for (const filtro of criteriosEnUrl.filtros) {
        if (!criterios.filtros.some((otro) => otro.equals(filtro))) aplicarFiltro(filtro)
      }
    }
    if (!sembrada) setSembrada(true)
    // Solo reaccionamos a cambios de la URL (carga inicial, atrás y adelante).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteriosEnUrl])

  useScrollAlInicio(senalScrollInicio, sembrada)

  // 401: la sesión ya no es válida. Se notifica una vez por error (T049, A-16).
  useEffect(() => {
    if (error?.tipo === TipoErrorBusqueda.NO_AUTENTICADO) sesionUsuario.alNoAutenticado()
  }, [error, sesionUsuario])

  const [catalogo, setCatalogo] = useState<CatalogoFiltros | null>(null)
  const [errorCatalogo, setErrorCatalogo] = useState<ErrorBusqueda | null>(null)
  const [intentoCatalogo, setIntentoCatalogo] = useState(0)

  useEffect(() => {
    const control = new AbortController()
    new ObtenerCatalogoFiltros(repositorio)
      .ejecutar(control.signal)
      .then((resultado) => {
        if (control.signal.aborted) return
        if (resultado.ok) setCatalogo(resultado.catalogo)
        else setErrorCatalogo(resultado.error)
      })
      .catch(() => {
        // Solo llega aquí una cancelación (desmontaje o reintento): no hay nada que mostrar.
      })
    return () => control.abort()
  }, [repositorio, intentoCatalogo])

  const reintentarCatalogo = () => {
    setErrorCatalogo(null)
    setIntentoCatalogo((n) => n + 1)
  }

  const cargando =
    estadoCarga === EstadoCarga.CARGANDO || estadoCarga === EstadoCarga.CARGANDO_MAS

  return (
    <main className="pagina-busqueda">
      <div className="pagina-busqueda__barra">
        <BarraBusqueda valor={criterios.texto} onCambiar={cambiarTexto} />
        <ChipsFiltrosActivos
          filtros={criterios.filtros}
          onQuitar={quitarFiltro}
          onLimpiarTodos={limpiarFiltros}
        />
      </div>
      <div className="pagina-busqueda__cuerpo">
        <aside className="pagina-busqueda__panel">
          <PanelFiltros
            criterios={criterios}
            catalogo={catalogo}
            errorCatalogo={errorCatalogo}
            onAplicar={aplicarFiltro}
            onQuitar={quitarFiltro}
            onReintentarCatalogo={reintentarCatalogo}
          />
        </aside>
        <section className="pagina-busqueda__feed">
          <FeedPublicaciones
            items={items}
            hayMas={hayMas}
            cargando={cargando}
            onCargarMas={cargarMas}
            error={error}
            hayFiltros={criterios.filtros.length > 0}
            onLimpiarFiltros={limpiarFiltros}
            onReintentar={reintentar}
          />
        </section>
      </div>
    </main>
  )
}
