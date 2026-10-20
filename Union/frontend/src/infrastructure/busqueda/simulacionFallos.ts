import { ErrorBusqueda } from '../../domain/busqueda/ErrorBusqueda'
import { mapearError } from './busquedaMappers'

export type FalloSimulado = 401 | 403 | 429 | 'red'

/**
 * Simulación configurable de latencia y fallos para tests (T020b).
 * Separada de los datos; se conecta con `antesDeResponder` del adaptador en memoria.
 * Los fallos se encolan y se consumen uno por llamada (FIFO).
 */
export class SimulacionFallos {
  private latenciaMs = 0
  private readonly cola: FalloSimulado[] = []
  private llamadas = 0

  /** Latencia fija (ms) antes de cada respuesta. Respeta `AbortSignal`. */
  conLatencia(ms: number): this {
    this.latenciaMs = Math.max(0, ms)
    return this
  }

  /** Encola un fallo para la próxima llamada (o `veces` llamadas consecutivas). */
  fallarProxima(fallo: FalloSimulado, veces = 1): this {
    for (let i = 0; i < veces; i++) this.cola.push(fallo)
    return this
  }

  reiniciar(): this {
    this.latenciaMs = 0
    this.cola.length = 0
    this.llamadas = 0
    return this
  }

  get cantidadLlamadas(): number {
    return this.llamadas
  }

  /** Úsese como `antesDeResponder`. */
  readonly aplicar = async (signal?: AbortSignal): Promise<void> => {
    this.llamadas++
    if (this.latenciaMs > 0) await esperar(this.latenciaMs, signal)
    const fallo = this.cola.shift()
    if (fallo !== undefined) throw this.errorPara(fallo)
  }

  private errorPara(fallo: FalloSimulado): ErrorBusqueda {
    return mapearError(fallo === 'red' ? null : fallo)
  }
}

function esperar(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolver, rechazar) => {
    if (signal?.aborted) {
      rechazar(new DOMException('Aborted', 'AbortError'))
      return
    }
    const id = setTimeout(() => {
      signal?.removeEventListener('abort', alAbortar)
      resolver()
    }, ms)
    const alAbortar = () => {
      clearTimeout(id)
      rechazar(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', alAbortar, { once: true })
  })
}
