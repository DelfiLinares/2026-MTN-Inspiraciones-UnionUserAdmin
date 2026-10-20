import { describe, it, expect } from 'vitest'
import { CodecCriteriosUrl } from '../../../src/domain/busqueda/CodecCriteriosUrl'
import { CriteriosBusqueda } from '../../../src/domain/busqueda/CriteriosBusqueda'
import { FiltroActivo } from '../../../src/domain/busqueda/FiltroActivo'
import { TipoFiltro } from '../../../src/domain/enums/TipoFiltro'
import { TipoContenido } from '../../../src/domain/enums/TipoContenido'
import { RangoDistancia } from '../../../src/domain/enums/RangoDistancia'

/**
 * T012 — CodecCriteriosUrl: criterios ⇄ query params (HU-07, RF-24).
 * Fuente: Union/specs/007-inspiraciones-busqueda/{spec,research,data-model,tasks}.md
 *
 * Formato (research §5):
 *   ?q=texto&estilo=a,b&tecnica=x&tipoArte=y&tipoContenido=IMAGEN&distancia=25
 *
 * Reglas:
 * - Se serializan solo los criterios presentes (sin `q` vacío, sin tipos sin filtros).
 * - Varios valores del mismo tipo van separados por coma.
 * - `distancia` se serializa en km (KM_25 ⇄ 25).
 * - Al parsear, los valores inválidos se ignoran sin lanzar error.
 * - Al parsear, el texto se normaliza como en CriteriosBusqueda.
 * - DISTANCIA solo se restaura si hay ubicación concedida.
 * - La ubicación del usuario nunca forma parte de la URL.
 */
describe('CodecCriteriosUrl', () => {
  const sinUbicacion = { ubicacionConcedida: false }
  const conUbicacion = { ubicacionConcedida: true }

  const estilo = (valor: string) => new FiltroActivo(TipoFiltro.ESTILO, valor)
  const tecnica = (valor: string) => new FiltroActivo(TipoFiltro.TECNICA, valor)
  const tipoArte = (valor: string) => new FiltroActivo(TipoFiltro.TIPO_ARTE, valor)
  const contenido = (valor: TipoContenido) => new FiltroActivo(TipoFiltro.TIPO_CONTENIDO, valor)

  describe('serializar', () => {
    it('criterios vacíos no generan parámetros', () => {
      const params = CodecCriteriosUrl.serializar(CriteriosBusqueda.vacio())

      expect(params.toString()).toBe('')
    })

    it('serializa el texto en q', () => {
      const criterios = CriteriosBusqueda.vacio().conTexto('paisaje al óleo')

      const params = CodecCriteriosUrl.serializar(criterios)

      expect(params.get('q')).toBe('paisaje al óleo')
    })

    it('serializa el texto ya normalizado', () => {
      const criterios = CriteriosBusqueda.vacio().conTexto('   acuarela    suave ')

      const params = CodecCriteriosUrl.serializar(criterios)

      expect(params.get('q')).toBe('acuarela suave')
    })

    it('no incluye q cuando el texto está vacío', () => {
      const criterios = CriteriosBusqueda.vacio().conTexto('   ').conFiltro(tecnica('oleo'))

      const params = CodecCriteriosUrl.serializar(criterios)

      expect(params.has('q')).toBe(false)
    })

    it('serializa un filtro de cada tipo con su nombre de parámetro', () => {
      const criterios = CriteriosBusqueda.vacio()
        .conFiltro(estilo('impresionismo'))
        .conFiltro(tecnica('oleo'))
        .conFiltro(tipoArte('pintura'))
        .conFiltro(contenido(TipoContenido.VIDEO))

      const params = CodecCriteriosUrl.serializar(criterios)

      expect(params.get('estilo')).toBe('impresionismo')
      expect(params.get('tecnica')).toBe('oleo')
      expect(params.get('tipoArte')).toBe('pintura')
      expect(params.get('tipoContenido')).toBe(TipoContenido.VIDEO)
    })

    it('une con coma los valores múltiples del mismo tipo, en orden de selección', () => {
      const criterios = CriteriosBusqueda.vacio()
        .conFiltro(estilo('surrealismo'))
        .conFiltro(estilo('impresionismo'))

      const params = CodecCriteriosUrl.serializar(criterios)

      expect(params.get('estilo')).toBe('surrealismo,impresionismo')
    })

    it('no incluye parámetros de tipos sin filtros', () => {
      const criterios = CriteriosBusqueda.vacio().conFiltro(tecnica('oleo'))

      const params = CodecCriteriosUrl.serializar(criterios)

      expect(params.has('estilo')).toBe(false)
      expect(params.has('tipoArte')).toBe(false)
      expect(params.has('tipoContenido')).toBe(false)
      expect(params.has('distancia')).toBe(false)
    })

    it('serializa la distancia en km (KM_25 → 25)', () => {
      const criterios = CriteriosBusqueda.vacio().conFiltro(
        new FiltroActivo(TipoFiltro.DISTANCIA, RangoDistancia.KM_25),
        conUbicacion,
      )

      const params = CodecCriteriosUrl.serializar(criterios)

      expect(params.get('distancia')).toBe('25')
    })

    it.each([
      [RangoDistancia.KM_5, '5'],
      [RangoDistancia.KM_25, '25'],
      [RangoDistancia.KM_100, '100'],
    ])('mapea %s a %s km', (rango, km) => {
      const criterios = CriteriosBusqueda.vacio().conFiltro(
        new FiltroActivo(TipoFiltro.DISTANCIA, rango),
        conUbicacion,
      )

      expect(CodecCriteriosUrl.serializar(criterios).get('distancia')).toBe(km)
    })

    it('la ubicación del usuario nunca aparece en la URL', () => {
      const criterios = CriteriosBusqueda.vacio()
        .conTexto('retrato')
        .conFiltro(new FiltroActivo(TipoFiltro.DISTANCIA, RangoDistancia.KM_5), conUbicacion)

      const params = CodecCriteriosUrl.serializar(criterios)
      const claves = Array.from(params.keys())

      expect(claves.sort()).toEqual(['distancia', 'q'])
      for (const clave of ['lat', 'lng', 'latitud', 'longitud', 'ubicacion', 'coords']) {
        expect(params.has(clave)).toBe(false)
      }
    })
  })

  describe('parsear', () => {
    it('sin parámetros devuelve criterios vacíos', () => {
      const criterios = CodecCriteriosUrl.parsear(new URLSearchParams(''), sinUbicacion)

      expect(criterios.esVacio()).toBe(true)
    })

    it('restaura el texto de q', () => {
      const criterios = CodecCriteriosUrl.parsear(new URLSearchParams('q=acuarela'), sinUbicacion)

      expect(criterios.texto).toBe('acuarela')
    })

    it('normaliza el texto al parsear', () => {
      const params = new URLSearchParams()
      params.set('q', '   paisaje    al   óleo  ')

      const criterios = CodecCriteriosUrl.parsear(params, sinUbicacion)

      expect(criterios.texto).toBe('paisaje al óleo')
    })

    it('trunca el texto al máximo de 100 caracteres', () => {
      const params = new URLSearchParams()
      params.set('q', 'a'.repeat(150))

      const criterios = CodecCriteriosUrl.parsear(params, sinUbicacion)

      expect(criterios.texto).toHaveLength(100)
    })

    it('restaura filtros de cada tipo', () => {
      const params = new URLSearchParams(
        'estilo=impresionismo&tecnica=oleo&tipoArte=pintura&tipoContenido=IMAGEN',
      )

      const criterios = CodecCriteriosUrl.parsear(params, sinUbicacion)

      expect(criterios.valoresDe(TipoFiltro.ESTILO)).toEqual(['impresionismo'])
      expect(criterios.valoresDe(TipoFiltro.TECNICA)).toEqual(['oleo'])
      expect(criterios.valoresDe(TipoFiltro.TIPO_ARTE)).toEqual(['pintura'])
      expect(criterios.valoresDe(TipoFiltro.TIPO_CONTENIDO)).toEqual([TipoContenido.IMAGEN])
    })

    it('separa por coma los valores múltiples conservando el orden', () => {
      const criterios = CodecCriteriosUrl.parsear(
        new URLSearchParams('estilo=surrealismo,impresionismo'),
        sinUbicacion,
      )

      expect(criterios.valoresDe(TipoFiltro.ESTILO)).toEqual(['surrealismo', 'impresionismo'])
    })

    it('descarta valores vacíos y duplicados dentro de una lista', () => {
      const criterios = CodecCriteriosUrl.parsear(
        new URLSearchParams('estilo=a,,b,a, ,b'),
        sinUbicacion,
      )

      expect(criterios.valoresDe(TipoFiltro.ESTILO)).toEqual(['a', 'b'])
    })

    it('ignora parámetros con valor vacío', () => {
      const criterios = CodecCriteriosUrl.parsear(
        new URLSearchParams('q=&estilo=&tecnica='),
        sinUbicacion,
      )

      expect(criterios.esVacio()).toBe(true)
    })
  })

  describe('parsear — valores inválidos se ignoran', () => {
    it('ignora valores de tipoContenido que no pertenecen a TipoContenido', () => {
      const criterios = CodecCriteriosUrl.parsear(
        new URLSearchParams('tipoContenido=PINTURA,IMAGEN,imagen'),
        sinUbicacion,
      )

      expect(criterios.valoresDe(TipoFiltro.TIPO_CONTENIDO)).toEqual([TipoContenido.IMAGEN])
    })

    it.each(['50', '0', '-5', 'cerca', 'cualquiera', '25km', ''])(
      'ignora distancia inválida "%s"',
      (valor) => {
        const params = new URLSearchParams()
        params.set('distancia', valor)

        const criterios = CodecCriteriosUrl.parsear(params, conUbicacion)

        expect(criterios.valoresDe(TipoFiltro.DISTANCIA)).toEqual([])
      },
    )

    it('ignora parámetros desconocidos', () => {
      const criterios = CodecCriteriosUrl.parsear(
        new URLSearchParams('foo=bar&cursor=abc&orden=recientes&tecnica=oleo'),
        sinUbicacion,
      )

      expect(criterios.filtros).toHaveLength(1)
      expect(criterios.valoresDe(TipoFiltro.TECNICA)).toEqual(['oleo'])
    })

    it('no lanza error ante una URL completamente inválida', () => {
      expect(() =>
        CodecCriteriosUrl.parsear(
          new URLSearchParams('q=%E0%A4%A&tipoContenido=%%&distancia=NaN&estilo=,,,'),
          sinUbicacion,
        ),
      ).not.toThrow()
    })

    it('el cursor de paginación nunca se restaura desde la URL', () => {
      const criterios = CodecCriteriosUrl.parsear(
        new URLSearchParams('q=retrato&cursor=xyz'),
        sinUbicacion,
      )

      expect(criterios.texto).toBe('retrato')
      expect(Array.from(CodecCriteriosUrl.serializar(criterios).keys())).toEqual(['q'])
    })
  })

  describe('parsear — distancia y ubicación', () => {
    it('restaura la distancia en km a su rango cuando hay ubicación concedida', () => {
      const criterios = CodecCriteriosUrl.parsear(new URLSearchParams('distancia=25'), conUbicacion)

      expect(criterios.valoresDe(TipoFiltro.DISTANCIA)).toEqual([RangoDistancia.KM_25])
    })

    it.each([
      ['5', RangoDistancia.KM_5],
      ['25', RangoDistancia.KM_25],
      ['100', RangoDistancia.KM_100],
    ])('mapea %s km a %s', (km, rango) => {
      const criterios = CodecCriteriosUrl.parsear(
        new URLSearchParams(`distancia=${km}`),
        conUbicacion,
      )

      expect(criterios.valoresDe(TipoFiltro.DISTANCIA)).toEqual([rango])
    })

    it('ignora la distancia sin ubicación concedida (sin error)', () => {
      const criterios = CodecCriteriosUrl.parsear(
        new URLSearchParams('q=retrato&distancia=25'),
        sinUbicacion,
      )

      expect(criterios.valoresDe(TipoFiltro.DISTANCIA)).toEqual([])
      expect(criterios.texto).toBe('retrato')
    })

    it('ignora parámetros de ubicación presentes en la URL', () => {
      const criterios = CodecCriteriosUrl.parsear(
        new URLSearchParams('lat=-34.6&lng=-58.4&latitud=1&longitud=2'),
        conUbicacion,
      )

      expect(criterios.esVacio()).toBe(true)
    })
  })

  describe('ida y vuelta', () => {
    it('parsear(serializar(c)) es equivalente a c', () => {
      const original = CriteriosBusqueda.vacio()
        .conTexto('  paisaje   al óleo ')
        .conFiltro(estilo('impresionismo'))
        .conFiltro(estilo('surrealismo'))
        .conFiltro(tecnica('oleo'))
        .conFiltro(tipoArte('pintura'))
        .conFiltro(contenido(TipoContenido.IMAGEN))
        .conFiltro(new FiltroActivo(TipoFiltro.DISTANCIA, RangoDistancia.KM_100), conUbicacion)

      const restaurado = CodecCriteriosUrl.parsear(
        CodecCriteriosUrl.serializar(original),
        conUbicacion,
      )

      expect(restaurado.equivale(original)).toBe(true)
    })

    it('criterios vacíos hacen ida y vuelta', () => {
      const restaurado = CodecCriteriosUrl.parsear(
        CodecCriteriosUrl.serializar(CriteriosBusqueda.vacio()),
        sinUbicacion,
      )

      expect(restaurado.esVacio()).toBe(true)
    })

    it('acepta el string de query como entrada (con o sin ? inicial)', () => {
      const con = CodecCriteriosUrl.parsear('?q=retrato&tecnica=oleo', sinUbicacion)
      const sin = CodecCriteriosUrl.parsear('q=retrato&tecnica=oleo', sinUbicacion)

      expect(con.equivale(sin)).toBe(true)
      expect(con.texto).toBe('retrato')
    })
  })
})
