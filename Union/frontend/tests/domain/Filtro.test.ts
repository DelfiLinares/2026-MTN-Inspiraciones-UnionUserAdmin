import { describe, it, expect } from 'vitest'
import { Filtro } from '../../src/domain/Filtro'
import { TipoFiltro } from '../../src/domain/enums/TipoFiltro'
import { TipoContenido } from '../../src/domain/enums/TipoContenido'

describe('Filtro (Entidad de dominio UI)', () => {
  describe('distanciaHabilitada()', () => {
    it('debe retornar false cuando la geolocalización está desactivada', () => {
      const filtro = new Filtro({
        geolocalizacionActiva: false,
        distanciaKm: 15,
      })

      expect(filtro.distanciaHabilitada()).toBe(false)
    })

    it('debe retornar true cuando la geolocalización está activada', () => {
      const filtro = new Filtro({
        geolocalizacionActiva: true,
        distanciaKm: 15,
      })

      expect(filtro.distanciaHabilitada()).toBe(true)
    })
  })

  describe('activos()', () => {
    it('debe reflejar exactamente los filtros configurados', () => {
      const filtro = new Filtro({
        geolocalizacionActiva: true,
        estilo: 'Surrealismo',
        tecnica: 'Óleo',
        tipoContenido: TipoContenido.IMAGEN,
        distanciaKm: 25,
      })

      const activos = filtro.activos()

      expect(activos).toHaveLength(4)
      expect(activos).toContainEqual({ tipo: TipoFiltro.ESTILO, valor: 'Surrealismo' })
      expect(activos).toContainEqual({ tipo: TipoFiltro.TECNICA, valor: 'Óleo' })
      expect(activos).toContainEqual({ tipo: TipoFiltro.TIPO_ARTE, valor: TipoContenido.IMAGEN })
      expect(activos).toContainEqual({ tipo: TipoFiltro.DISTANCIA, valor: '25 km' })
    })

    it('no debe incluir la distancia en activos() si la geolocalización está inactiva', () => {
      const filtro = new Filtro({
        geolocalizacionActiva: false,
        distanciaKm: 25,
        estilo: 'Barroco',
      })

      const activos = filtro.activos()

      expect(activos).toHaveLength(1)
      expect(activos).toEqual([{ tipo: TipoFiltro.ESTILO, valor: 'Barroco' }])
    })

    it('debe retornar un array vacío si no se configuraron filtros de chip', () => {
      const filtro = new Filtro({
        geolocalizacionActiva: true,
      })

      expect(filtro.activos()).toEqual([])
    })
  })

  describe('quitar()', () => {
    it('no debe mutar la instancia original y debe retornar una nueva instancia sin el filtro removido', () => {
      const original = new Filtro({
        geolocalizacionActiva: true,
        estilo: 'Cubismo',
        tecnica: 'Acuarela',
        tipoContenido: TipoContenido.DIGITAL,
        distanciaKm: 10,
      })

      const modificado = original.quitar(TipoFiltro.ESTILO)

      // Verificamos inmutabilidad del original
      expect(original.estilo).toBe('Cubismo')
      expect(original.activos().some((item) => item.tipo === TipoFiltro.ESTILO)).toBe(true)

      // Verificamos que la nueva instancia no tiene el filtro removido
      expect(modificado).not.toBe(original)
      expect(modificado.estilo).toBeUndefined()
      expect(modificado.tecnica).toBe('Acuarela')
      expect(modificado.tipoContenido).toBe(TipoContenido.DIGITAL)
      expect(modificado.distanciaKm).toBe(10)
      expect(modificado.activos().some((item) => item.tipo === TipoFiltro.ESTILO)).toBe(false)
    })

    it('permite quitar el filtro de distancia sin mutar el original', () => {
      const original = new Filtro({
        geolocalizacionActiva: true,
        distanciaKm: 50,
      })

      const modificado = original.quitar(TipoFiltro.DISTANCIA)

      expect(original.distanciaKm).toBe(50)
      expect(modificado.distanciaKm).toBeUndefined()
      expect(modificado.activos()).toHaveLength(0)
    })
  })

  describe('aQueryParams()', () => {
    it('debe mapear correctamente los campos a los query params correspondientes', () => {
      const filtro = new Filtro({
        geolocalizacionActiva: true,
        texto: 'escultura moderna',
        estilo: 'Minimalista',
        tecnica: 'Modelado',
        tipoContenido: TipoContenido.ESCULTURA,
        distanciaKm: 30,
      })

      const params = filtro.aQueryParams()

      expect(params).toEqual({
        texto: 'escultura moderna',
        estilo: 'Minimalista',
        tecnica: 'Modelado',
        tipo_arte: TipoContenido.ESCULTURA,
        distancia: '30',
      })
    })

    it('no debe incluir el parámetro distancia si la geolocalización está inactiva', () => {
      const filtro = new Filtro({
        geolocalizacionActiva: false,
        texto: 'acuarelas',
        distanciaKm: 30,
      })

      const params = filtro.aQueryParams()

      expect(params).toEqual({
        texto: 'acuarelas',
      })
      expect(params.distancia).toBeUndefined()
    })
  })
})
