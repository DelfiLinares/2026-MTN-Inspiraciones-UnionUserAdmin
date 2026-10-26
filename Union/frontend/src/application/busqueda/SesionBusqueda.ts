import type { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'
import { CriteriosBusqueda as Criterios } from '../../domain/busqueda/CriteriosBusqueda'
import type { ErrorBusqueda } from '../../domain/busqueda/ErrorBusqueda'
import type { FiltroActivo } from '../../domain/busqueda/FiltroActivo'
import type { PaginaResultados } from '../../domain/busqueda/PaginaResultados'
import type { PublicacionResumen } from '../../domain/busqueda/PublicacionResumen'
import { EstadoCarga } from '../../domain/enums/EstadoCarga'
import { OrigenFeed } from '../../domain/enums/OrigenFeed'
import { AplicarFiltro } from './AplicarFiltro'
import { BuscarPublicaciones } from './BuscarPublicaciones'
import type { BusquedaRepository } from './BusquedaRepository'
import { CargarFeedFyp } from './CargarFeedFyp'
import { CargarMasResultados } from './CargarMasResultados'
import { ControlPeticiones } from './ControlPeticiones'
import { LimpiarFiltros } from './LimpiarFiltros'
import { QuitarFiltro } from './QuitarFiltro'
import { ReintentarCarga, aErrorBusqueda } from './ReintentarCarga'

export interface OpcionesSesionBusqueda {
  repositorio: BusquedaRepository
}

/**
 * Coordinador de estado de la búsqueda y el feed "Para ti" (T034a, plan.md §2).
 *
 * Mantiene criterios, items acumulados (vía `PaginaResultados.agregar`, sin deduplicar por su
 * cuenta), cursor, estado de carga y error. Decide FYP vs búsqueda con
 * `CriteriosBusqueda.origen()`, reinicia al cambiar los criterios (RF-09) y no carga más
 * mientras hay una carga en curso ni sin más resultados (RF-08). La cancelación y el descarte
 * de respuestas obsoletas los resuelve `ControlPeticiones` (T034b).
 *
 * Alcance actual:
 * - DISTANCIA queda fuera: la sesión nace sin ubicación concedida (A-02 diferida al backend),
 *   por lo que aplicar DISTANCIA es un no-op.
 * - `reintentar()` y el mapeo de errores completo pertenecen a T034c. Aquí solo se deja el
 *   error tipado en `error` y el estado en `ERROR`.
 *
 * Los métodos devuelven una promesa que se resuelve al terminar la operación y nunca lanzan.
 * Su parte inicial (cambio de estado y llamada al repositorio) es síncrona.
 */
export class SesionBusqueda {
  private readonly ubicacionConcedida = false

  private readonly control = new ControlPeticiones()
  private readonly cargarFypUC: CargarFeedFyp
  private readonly buscarUC: BuscarPublicaciones
  private readonly cargarMasUC: CargarMasResultados
  private readonly aplicarFiltroUC = new AplicarFiltro()
  private readonly quitarFiltroUC = new QuitarFiltro()
  private readonly limpiarFiltrosUC = new LimpiarFiltros()
  private readonly reintentarCargaUC = new ReintentarCarga()
  private readonly oyentes = new Set<() => void>()

  private _criterios: CriteriosBusqueda = Criterios.vacio()
  private _pagina: PaginaResultados | null = null
  private _estadoCarga: EstadoCarga = EstadoCarga.INICIAL
  private _error: ErrorBusqueda | null = null
  private _senalScrollInicio = 0

  constructor(opciones: OpcionesSesionBusqueda) {
    this.cargarFypUC = new CargarFeedFyp(opciones.repositorio)
    this.buscarUC = new BuscarPublicaciones(opciones.repositorio)
    this.cargarMasUC = new CargarMasResultados(opciones.repositorio)
  }

  // ── Estado observable ────────────────────────────────────────────────────────────────

  get criterios(): CriteriosBusqueda {
    return this._criterios
  }

  get origen(): OrigenFeed {
    return this._criterios.origen()
  }

  get items(): readonly PublicacionResumen[] {
    return this._pagina?.items ?? []
  }

  /** Cursor de la última página cargada; `null` si no hay página o no hay más resultados. */
  get cursor(): string | null {
    return this._pagina?.cursorSiguiente ?? null
  }

  get hayMas(): boolean {
    return this._pagina?.hayMas ?? false
  }

  get estadoCarga(): EstadoCarga {
    return this._estadoCarga
  }

  get error(): ErrorBusqueda | null {
    return this._error
  }

  /** Contador que se incrementa en cada reinicio; la UI lo observa para volver al inicio. */
  get senalScrollInicio(): number {
    return this._senalScrollInicio
  }

  /** Suscripción a cambios de estado (para el hook de UI). Devuelve la baja. */
  suscribir(oyente: () => void): () => void {
    this.oyentes.add(oyente)
    return () => {
      this.oyentes.delete(oyente)
    }
  }

  // ── Operaciones ──────────────────────────────────────────────────────────────────────

  /** Carga la primera página según los criterios vigentes. */
  async iniciar(): Promise<void> {
    await this.cargarPrimeraPagina()
  }

  /** Cancela la petición en curso (si la hay), invalida su respuesta y suelta los oyentes. */
  destruir(): void {
    this.control.cancelar()
    this.oyentes.clear()
  }

  async cambiarTexto(texto: string): Promise<void> {
    await this.cambiarCriterios(this._criterios.conTexto(texto))
  }

  async aplicarFiltro(filtro: FiltroActivo): Promise<void> {
    await this.cambiarCriterios(
      this.aplicarFiltroUC.ejecutar(this._criterios, filtro, {
        ubicacionConcedida: this.ubicacionConcedida,
      }),
    )
  }

  async quitarFiltro(filtro: FiltroActivo): Promise<void> {
    await this.cambiarCriterios(this.quitarFiltroUC.ejecutar(this._criterios, filtro))
  }

  async limpiarFiltros(): Promise<void> {
    await this.cambiarCriterios(this.limpiarFiltrosUC.ejecutar(this._criterios))
  }

  /** Siguiente página. No hace nada si hay una carga en curso o no hay más resultados. */
  async cargarMas(): Promise<void> {
    const pagina = this._pagina
    if (pagina === null || !pagina.hayMas || this.estaCargando()) return

    this._estadoCarga = EstadoCarga.CARGANDO_MAS
    this._error = null
    this.emitir()

    const { token, signal } = this.control.nueva()
    try {
      const siguiente = await this.cargarMasUC.ejecutar({
        criterios: this._criterios,
        pagina,
        cargando: false,
        signal,
      })
      if (!this.control.esVigente(token)) return
      if (siguiente !== null) this._pagina = pagina.agregar(siguiente)
      this._estadoCarga = EstadoCarga.LISTO
    } catch (error) {
      if (!this.control.esVigente(token)) return
      this._estadoCarga = EstadoCarga.ERROR
      this._error = aErrorBusqueda(error)
    }
    this.emitir()
  }

  /** Repite la operación fallida (T034c). Sin error pendiente no consulta de nuevo. */
  async reintentar(): Promise<void> {
    const accion = this.reintentarCargaUC.decidir({
      error: this._error,
      tienePagina: this._pagina !== null,
    })
    if (accion === 'PRIMERA_PAGINA') await this.cargarPrimeraPagina()
    else if (accion === 'PAGINA_ADICIONAL') await this.cargarMas()
  }

  // ── Internos ─────────────────────────────────────────────────────────────────────────

  private estaCargando(): boolean {
    return (
      this._estadoCarga === EstadoCarga.CARGANDO || this._estadoCarga === EstadoCarga.CARGANDO_MAS
    )
  }

  /** Reinicia solo si los criterios cambian de verdad (RF-09, CA-04.1). */
  private async cambiarCriterios(nuevos: CriteriosBusqueda): Promise<void> {
    if (nuevos.equivale(this._criterios)) return
    this._criterios = nuevos
    this._senalScrollInicio++
    await this.cargarPrimeraPagina()
  }

  /** Descarta items y cursor, cancela lo anterior y pide la primera página. */
  private async cargarPrimeraPagina(): Promise<void> {
    this._pagina = null
    this._error = null
    this._estadoCarga = EstadoCarga.CARGANDO
    this.emitir()

    const { token, signal } = this.control.nueva()
    const criterios = this._criterios
    try {
      const pagina =
        criterios.origen() === OrigenFeed.BUSQUEDA
          ? await this.buscarUC.ejecutar(criterios, signal)
          : await this.cargarFypUC.ejecutar(criterios, signal)
      if (!this.control.esVigente(token)) return
      this._pagina = pagina
      this._estadoCarga = pagina.estaVacia() ? EstadoCarga.VACIO : EstadoCarga.LISTO
    } catch (error) {
      if (!this.control.esVigente(token)) return
      this._estadoCarga = EstadoCarga.ERROR
      this._error = aErrorBusqueda(error)
    }
    this.emitir()
  }

  private emitir(): void {
    this.oyentes.forEach((oyente) => oyente())
  }
}
