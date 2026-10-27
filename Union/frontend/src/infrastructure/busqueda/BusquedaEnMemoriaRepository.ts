import type { BusquedaRepository } from '../../application/busqueda/BusquedaRepository'
import type { CatalogoFiltros } from '../../domain/busqueda/CatalogoFiltros'
import type { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'
import { PaginaResultados } from '../../domain/busqueda/PaginaResultados'
import { TAMANO_PAGINA } from '../../domain/busqueda/constantes'
import { EstadoPublicacion } from '../../domain/enums/EstadoPublicacion'
import { TipoFiltro } from '../../domain/enums/TipoFiltro'
import { CATALOGO_EJEMPLO, PUBLICACIONES_EJEMPLO, type PublicacionEjemplo } from './datosEjemplo'

export interface OpcionesBusquedaEnMemoria {
  /** Datos a servir; por defecto `PUBLICACIONES_EJEMPLO`. */
  datos?: readonly PublicacionEjemplo[]
  catalogo?: CatalogoFiltros
  /** Gancho previo a cada respuesta (latencia/fallos, ver `simulacionFallos.ts`). */
  antesDeResponder?: (signal?: AbortSignal) => Promise<void>
}

const PREFIJO_CURSOR = 'cur:'

function codificarCursor(offset: number): string {
  return btoa(`${PREFIJO_CURSOR}${offset}`)
}

function decodificarCursor(cursor: string | undefined): number {
  if (cursor === undefined) return 0
  try {
    const plano = atob(cursor)
    if (plano.startsWith(PREFIJO_CURSOR)) {
      const n = Number(plano.slice(PREFIJO_CURSOR.length))
      if (Number.isInteger(n) && n >= 0) return n
    }
  } catch {
    /* cursor inválido: se trata como primera página */
  }
  return 0
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

/**
 * Adaptador en memoria del puerto `BusquedaRepository` (datos de ejemplo).
 * No es un servidor ni usa MSW. Orden = orden de los datos; nunca devuelve ELIMINADA.
 * DISTANCIA no se aplica (diferida al backend, A-02).
 */
export class BusquedaEnMemoriaRepository implements BusquedaRepository {
  private readonly datos: readonly PublicacionEjemplo[]
  private readonly catalogo: CatalogoFiltros
  private readonly antesDeResponder?: (signal?: AbortSignal) => Promise<void>

  constructor(opciones: OpcionesBusquedaEnMemoria = {}) {
    this.datos = (opciones.datos ?? PUBLICACIONES_EJEMPLO).filter(
      (d) => d.resumen.estado !== EstadoPublicacion.ELIMINADA,
    )
    this.catalogo = opciones.catalogo ?? CATALOGO_EJEMPLO
    this.antesDeResponder = opciones.antesDeResponder
  }

  async obtenerFyp(cursor?: string, signal?: AbortSignal, criterios?: CriteriosBusqueda): Promise<PaginaResultados> {
    await this.esperar(signal)
    const datos = criterios ? this.datos.filter(d => this.coincide(d, criterios.limpiarTexto())) : this.datos
    return this.paginar(datos, cursor)
  }

  async buscar(
    criterios: CriteriosBusqueda,
    cursor?: string,
    signal?: AbortSignal,
  ): Promise<PaginaResultados> {
    await this.esperar(signal)
    return this.paginar(this.datos.filter((d) => this.coincide(d, criterios)), cursor)
  }

  async obtenerCatalogoFiltros(signal?: AbortSignal): Promise<CatalogoFiltros> {
    await this.esperar(signal)
    return this.catalogo
  }

  private async esperar(signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    if (this.antesDeResponder) await this.antesDeResponder(signal)
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  }

  private paginar(lista: readonly PublicacionEjemplo[], cursor?: string): PaginaResultados {
    const desde = decodificarCursor(cursor)
    const hasta = desde + TAMANO_PAGINA
    const items = lista.slice(desde, hasta).map((d) => d.resumen)
    return new PaginaResultados(items, hasta < lista.length ? codificarCursor(hasta) : null)
  }

  /** OR dentro de un tipo de filtro, AND entre tipos y con el texto. */
  private coincide(d: PublicacionEjemplo, criterios: CriteriosBusqueda): boolean {
    if (criterios.texto) {
      const q = normalizar(criterios.texto)
      const pajar = normalizar(
        [d.resumen.titulo, d.resumen.autor.nombre, ...d.tags].join(' '),
      )
      if (!pajar.includes(q)) return false
    }
    const cumple = (tipo: TipoFiltro, propios: readonly string[]): boolean => {
      const valores = criterios.valoresDe(tipo)
      return valores.length === 0 || valores.some((v) => propios.includes(v))
    }
    return (
      cumple(TipoFiltro.ESTILO, d.estilos) &&
      cumple(TipoFiltro.TECNICA, d.tecnicas) &&
      cumple(TipoFiltro.TIPO_ARTE, d.tiposArte) &&
      cumple(TipoFiltro.TIPO_CONTENIDO, [d.resumen.tipoContenido])
    )
  }
}
