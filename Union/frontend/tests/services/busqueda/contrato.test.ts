/// <reference types="vite/client" />
import { describe, expect, it, vi } from 'vitest'
// Lectura del contrato como texto (solo lectura; sin @types/node ni parser YAML).
import yaml from '../../../../specs/007-inspiraciones-busqueda/contracts/openapi.yaml?raw'
import {
  BusquedaHttpRepository,
  RUTA_BUSQUEDA,
  RUTA_CATALOGO,
  RUTA_FYP,
  type HttpClientBusqueda,
} from '../../../src/infrastructure/busqueda/BusquedaHttpRepository'
import { CriteriosBusqueda } from '../../../src/domain/busqueda/CriteriosBusqueda'
import { FiltroActivo } from '../../../src/domain/busqueda/FiltroActivo'
import {
  MAX_CARACTERES,
  MIN_CARACTERES,
  TAMANO_PAGINA,
} from '../../../src/domain/busqueda/constantes'
import { EstadoPublicacion } from '../../../src/domain/enums/EstadoPublicacion'
import { TipoContenido } from '../../../src/domain/enums/TipoContenido'
import { TipoFiltro } from '../../../src/domain/enums/TipoFiltro'

/**
 * T024 (opcional): el cliente HTTP coincide con contracts/openapi.yaml.
 * Solo lee el YAML (no lo modifica) con expresiones regulares: no hay parser YAML
 * en el proyecto y no se añade ninguna dependencia.
 */
function seccion(texto: string, inicio: RegExp, fin: RegExp): string {
  const desde = texto.search(inicio)
  expect(desde, `no se encontró ${inicio}`).toBeGreaterThanOrEqual(0)
  const resto = texto.slice(desde + 1)
  const hasta = resto.search(fin)
  return hasta === -1 ? resto : resto.slice(0, hasta)
}

/** nombre de parámetro por clave de `components.parameters`. */
function parametrosDeComponentes(): Record<string, string> {
  const bloque = seccion(yaml, /\n {2}parameters:\n/, /\n {2}responses:\n/)
  const resultado: Record<string, string> = {}
  const partes = bloque.split(/\n {4}(?=\w+:\n)/).slice(1)
  for (const parte of partes) {
    const clave = parte.match(/^(\w+):/)?.[1]
    const nombre = parte.match(/\n {6}name: (\w+)/)?.[1]
    if (clave && nombre) resultado[clave] = nombre
  }
  return resultado
}

/** parámetros (por nombre) que declara cada ruta del contrato. */
function parametrosPorRuta(): Record<string, string[]> {
  const comp = parametrosDeComponentes()
  const bloque = seccion(yaml, /\npaths:\n/, /\ncomponents:\n/)
  const resultado: Record<string, string[]> = {}
  for (const parte of bloque.split(/\n {2}(?=\/\S+:\n)/).slice(1)) {
    const ruta = parte.match(/^(\/\S+):/)?.[1] as string
    const nombres: string[] = []
    for (const m of parte.matchAll(/\$ref: '#\/components\/parameters\/(\w+)'/g)) {
      nombres.push(comp[m[1]])
    }
    for (const m of parte.matchAll(/- name: (\w+)/g)) nombres.push(m[1])
    resultado[ruta] = nombres
  }
  return resultado
}

function repoConCaptura() {
  const get = vi.fn(async (_ruta: string, _o?: { signal?: AbortSignal }) => ({
    items: [],
    cursorSiguiente: null,
    estilos: [],
    tecnicas: [],
    tiposArte: [],
  }))
  const repo = new BusquedaHttpRepository({ get } as unknown as HttpClientBusqueda)
  const ultima = () => {
    const [ruta, qs = ''] = (get.mock.calls.at(-1)?.[0] as string).split('?')
    return { ruta, params: new URLSearchParams(qs) }
  }
  return { repo, ultima }
}

describe('contrato OpenAPI ⇄ BusquedaHttpRepository', () => {
  const porRuta = parametrosPorRuta()

  it('el contrato declara exactamente las tres rutas que usa el cliente', () => {
    expect(Object.keys(porRuta).sort()).toEqual([RUTA_BUSQUEDA, RUTA_CATALOGO, RUTA_FYP].sort())
  })

  it('el catálogo no declara parámetros', () => {
    expect(porRuta[RUTA_CATALOGO]).toEqual([])
  })

  it('FYP: todo parámetro que envía el cliente existe en el contrato', async () => {
    const { repo, ultima } = repoConCaptura()
    await repo.obtenerFyp('cur')
    const { ruta, params } = ultima()
    expect(ruta).toBe(RUTA_FYP)
    for (const nombre of new Set(params.keys())) {
      expect(porRuta[RUTA_FYP]).toContain(nombre)
    }
  })

  it('búsqueda: envía q, cursor, limite y los cuatro filtros con los nombres del contrato', async () => {
    const { repo, ultima } = repoConCaptura()
    const criterios = CriteriosBusqueda.vacio()
      .conTexto('ab')
      .conFiltro(new FiltroActivo(TipoFiltro.ESTILO, 'x'))
      .conFiltro(new FiltroActivo(TipoFiltro.TECNICA, 'x'))
      .conFiltro(new FiltroActivo(TipoFiltro.TIPO_ARTE, 'x'))
      .conFiltro(new FiltroActivo(TipoFiltro.TIPO_CONTENIDO, 'IMAGEN'))
    await repo.buscar(criterios, 'cur')
    const { ruta, params } = ultima()
    expect(ruta).toBe(RUTA_BUSQUEDA)
    const enviados = [...new Set(params.keys())].sort()
    expect(enviados).toEqual(
      ['cursor', 'estilo', 'limite', 'q', 'tecnica', 'tipoArte', 'tipoContenido'].sort(),
    )
    for (const nombre of enviados) expect(porRuta[RUTA_BUSQUEDA]).toContain(nombre)
  })

  it('el único parámetro del contrato que el cliente no envía es distancia (A-02 diferida)', () => {
    const noEnviados = porRuta[RUTA_BUSQUEDA].filter(
      (n) => !['q', 'cursor', 'limite', 'estilo', 'tecnica', 'tipoArte', 'tipoContenido'].includes(n),
    )
    expect(noEnviados).toEqual(['distancia'])
  })

  it('q requerido con minLength/maxLength iguales a las constantes del dominio', () => {
    const bloque = seccion(yaml, /\n {8}- name: q\n/, /\n {8}- \$ref/)
    expect(bloque).toMatch(/required: true/)
    expect(bloque).toContain(`minLength: ${MIN_CARACTERES}`)
    expect(bloque).toContain(`maxLength: ${MAX_CARACTERES}`)
  })

  it('limite: el tamaño de página pedido respeta default y máximo del contrato', () => {
    const bloque = seccion(yaml, /\n {4}Limite:\n/, /\n {4}Estilo:\n/)
    const max = Number(bloque.match(/maximum: (\d+)/)?.[1])
    const def = Number(bloque.match(/default: (\d+)/)?.[1])
    expect(TAMANO_PAGINA).toBeLessThanOrEqual(max)
    expect(TAMANO_PAGINA).toBe(def)
  })

  it('el enum de estado del contrato coincide con EstadoPublicacion', () => {
    const lista = yaml.match(/EstadoPublicacion:\n\s+type: string\n\s+enum: \[([^\]]+)\]/)?.[1]
    const valores = (lista as string).split(',').map((v) => v.trim())
    expect(valores.sort()).toEqual(Object.values(EstadoPublicacion).sort())
  })

  it('los valores de TipoContenido del contrato existen en el enum del dominio', () => {
    const lista = yaml.match(/\n {4}TipoContenido:\n\s+type: string\n\s+enum: \[([^\]]+)\]/)?.[1]
    const valores = (lista as string).split(',').map((v) => v.trim())
    for (const v of valores) expect(Object.values(TipoContenido)).toContain(v)
  })

  it('el contrato define las respuestas de error 400/401/403/429 en las rutas de listado', () => {
    for (const ruta of [RUTA_FYP, RUTA_BUSQUEDA]) {
      const parte = seccion(yaml, new RegExp(`\\n {2}${ruta.replace('/', '\\/')}:\\n`), /\n {2}\/\S+:\n|\ncomponents:/)
      for (const codigo of ['200', '400', '401', '403', '429']) {
        expect(parte).toContain(`'${codigo}'`)
      }
    }
  })
})
