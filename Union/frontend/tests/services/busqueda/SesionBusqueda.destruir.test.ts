import { describe, expect, it, vi } from 'vitest'
import { SesionBusqueda } from '../../../src/application/busqueda/SesionBusqueda'
import type { BusquedaRepository } from '../../../src/application/busqueda/BusquedaRepository'
import { BusquedaEnMemoriaRepository } from '../../../src/infrastructure/busqueda/BusquedaEnMemoriaRepository'
import { EstadoCarga } from '../../../src/domain/enums/EstadoCarga'

/**
 * T055 — `SesionBusqueda.destruir`: al desmontar la página se cancela la petición en curso,
 * su respuesta tardía se ignora y no se notifica a nadie.
 *
 * Doble de repositorio: la primera petición queda retenida hasta que el test la libera.
 */
function crearSesionConPeticionRetenida() {
  const base = new BusquedaEnMemoriaRepository()
  let senal: AbortSignal | undefined
  let liberar: () => void = () => undefined

  const repositorio: BusquedaRepository = {
    obtenerFyp: (cursor, signal) => {
      senal = signal
      return new Promise((resolver) => {
        liberar = () => resolver(base.obtenerFyp(cursor))
      })
    },
    buscar: (criterios, cursor, signal) => base.buscar(criterios, cursor, signal),
    obtenerCatalogoFiltros: (signal) => base.obtenerCatalogoFiltros(signal),
  }

  const sesion = new SesionBusqueda({ repositorio })
  return {
    sesion,
    senal: () => senal,
    liberar: () => liberar(),
  }
}

describe('SesionBusqueda.destruir (T055)', () => {
  it('aborta la petición en curso al destruir la sesión', async () => {
    const { sesion, senal, liberar } = crearSesionConPeticionRetenida()

    const carga = sesion.iniciar()
    expect(sesion.estadoCarga).toBe(EstadoCarga.CARGANDO)
    expect(senal()?.aborted).toBe(false)

    sesion.destruir()

    expect(senal()?.aborted).toBe(true)
    liberar()
    await carga
  })

  it('ignora la respuesta tardía tras destruir: no cambia el estado ni notifica', async () => {
    const { sesion, liberar } = crearSesionConPeticionRetenida()
    const oyente = vi.fn()
    sesion.suscribir(oyente)

    const carga = sesion.iniciar()
    oyente.mockClear()

    sesion.destruir()
    liberar()
    await carga

    expect(sesion.items).toHaveLength(0)
    expect(sesion.estadoCarga).toBe(EstadoCarga.CARGANDO)
    expect(oyente).not.toHaveBeenCalled()
  })

  it('suelta los oyentes: ya no reciben cambios tras destruir', async () => {
    const { sesion, liberar } = crearSesionConPeticionRetenida()
    const oyente = vi.fn()
    sesion.suscribir(oyente)

    const carga = sesion.iniciar()
    oyente.mockClear()

    sesion.destruir()
    liberar()
    await carga

    expect(oyente).not.toHaveBeenCalled()
  })
})
