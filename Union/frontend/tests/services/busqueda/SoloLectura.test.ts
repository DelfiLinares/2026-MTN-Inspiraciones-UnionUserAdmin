import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import type { BusquedaRepository } from '../../../src/application/busqueda/BusquedaRepository'
import {
  BusquedaHttpRepository,
  RUTA_BUSQUEDA,
  RUTA_CATALOGO,
  RUTA_FYP,
} from '../../../src/infrastructure/busqueda/BusquedaHttpRepository'
import { BusquedaEnMemoriaRepository } from '../../../src/infrastructure/busqueda/BusquedaEnMemoriaRepository'
import { CriteriosBusqueda } from '../../../src/domain/busqueda/CriteriosBusqueda'
import { FiltroActivo } from '../../../src/domain/busqueda/FiltroActivo'
import { TipoFiltro } from '../../../src/domain/enums/TipoFiltro'

const LECTURAS = ['buscar', 'obtenerCatalogoFiltros', 'obtenerFyp'] as const

/** Verbos de escritura (RF-19): ninguno puede aparecer como operación pública. */
const VERBOS_ESCRITURA =
  /^(crear|editar|actualizar|borrar|eliminar|guardar|reportar|comentar|dar|quitar|like|post|put|patch|delete|set|add|remove|save|update|create)/i

const paginaDto = {
  items: [],
  cursorSiguiente: null,
}

const catalogoDto = {
  estilos: [],
  tecnicas: [],
  tiposArte: [],
}

const RUTAS_DE_LECTURA = [RUTA_FYP, RUTA_BUSQUEDA, RUTA_CATALOGO]

function respuestaJson(cuerpo: unknown): Response {
  return new Response(JSON.stringify(cuerpo), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function metodosPublicos(prototipo: object): string[] {
  return Object.getOwnPropertyNames(prototipo).filter((nombre) => nombre !== 'constructor')
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('RF-19 — puerto BusquedaRepository solo con lecturas', () => {
  it('el tipo del puerto expone exactamente las tres operaciones de lectura', () => {
    expectTypeOf<keyof BusquedaRepository>().toEqualTypeOf<(typeof LECTURAS)[number]>()
  })

  it('ninguna implementación expone operaciones con verbos de escritura', () => {
    for (const clase of [BusquedaHttpRepository, BusquedaEnMemoriaRepository]) {
      const escritura = metodosPublicos(clase.prototype).filter((nombre) =>
        VERBOS_ESCRITURA.test(nombre),
      )
      expect(escritura).toEqual([])
    }
  })

  it('las implementaciones exponen las operaciones de lectura del puerto', () => {
    for (const clase of [BusquedaHttpRepository, BusquedaEnMemoriaRepository]) {
      expect(metodosPublicos(clase.prototype)).toEqual(expect.arrayContaining([...LECTURAS]))
    }
  })
})

describe('RF-19 — BusquedaHttpRepository solo emite GET', () => {
  it('todas las operaciones salen como GET a rutas de lectura del contrato', async () => {
    const fetchEspiado = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (entrada) => {
        const url = String(entrada)
        return respuestaJson(url.includes('/filtros/catalogo') ? catalogoDto : paginaDto)
      })

    const repositorio = new BusquedaHttpRepository()
    const criterios = CriteriosBusqueda.vacio()
      .conTexto('obra')
      .conFiltro(new FiltroActivo(TipoFiltro.ESTILO, 'abstracto'))

    await repositorio.obtenerFyp()
    await repositorio.buscar(criterios)
    await repositorio.obtenerCatalogoFiltros()

    expect(fetchEspiado).toHaveBeenCalledTimes(3)
    for (const [entrada, init] of fetchEspiado.mock.calls) {
      expect(init?.method).toBe('GET')
      expect(init?.body).toBeUndefined()
      expect(RUTAS_DE_LECTURA.some((ruta) => String(entrada).includes(ruta))).toBe(true)
    }
  })
})
