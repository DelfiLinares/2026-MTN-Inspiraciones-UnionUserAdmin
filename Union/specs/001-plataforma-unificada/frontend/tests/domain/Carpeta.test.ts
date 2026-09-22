import { describe, it, expect } from 'vitest'
import { Carpeta } from '../../src/domain/Carpeta'

describe('Carpeta (Entidad de dominio UI)', () => {
  describe('puedeEliminarse() / puedeEliminar()', () => {
    it('debe permitir eliminar la carpeta si el usuario actual es el dueño', () => {
      const carpeta = new Carpeta({
        id: 'carp-1',
        nombre: 'Mis Referencias',
        cantidadPosts: 5,
        propietarioId: 'user-123',
      })

      expect(carpeta.puedeEliminarse('user-123')).toBe(true)
      expect(carpeta.puedeEliminar('user-123')).toBe(true)
    })

    it('no debe permitir eliminar la carpeta si el usuario no es el dueño', () => {
      const carpeta = new Carpeta({
        id: 'carp-1',
        nombre: 'Mis Referencias',
        cantidadPosts: 5,
        propietarioId: 'user-123',
      })

      expect(carpeta.puedeEliminarse('user-otro')).toBe(false)
      expect(carpeta.puedeEliminar('user-otro')).toBe(false)
    })

    it('no debe permitir eliminar si el usuario actual no está autenticado o es string vacío', () => {
      const carpeta = new Carpeta({
        id: 'carp-1',
        nombre: 'Mis Referencias',
        cantidadPosts: 5,
        propietarioId: 'user-123',
      })

      expect(carpeta.puedeEliminarse('')).toBe(false)
      expect(carpeta.puedeEliminar('')).toBe(false)
    })

    it('soporta verificación explícita pasando propietarioId como parámetro', () => {
      const carpeta = new Carpeta({
        id: 'carp-2',
        nombre: 'Inspiraciones',
        cantidadPosts: 0,
      })

      expect(carpeta.puedeEliminarse('user-456', 'user-456')).toBe(true)
      expect(carpeta.puedeEliminarse('user-789', 'user-456')).toBe(false)
    })

    it('utiliza la bandera deLaCarpetaDelUsuarioActual como fallback si no hay propietarioId explícito', () => {
      const carpetaPropia = new Carpeta({
        id: 'carp-3',
        nombre: 'Favoritos',
        cantidadPosts: 2,
        deLaCarpetaDelUsuarioActual: true,
      })

      const carpetaAjena = new Carpeta({
        id: 'carp-4',
        nombre: 'Favoritos Ajenos',
        cantidadPosts: 2,
        deLaCarpetaDelUsuarioActual: false,
      })

      expect(carpetaPropia.puedeEliminarse('user-1')).toBe(true)
      expect(carpetaAjena.puedeEliminarse('user-1')).toBe(false)
    })
  })

  describe('puedeRenombrarse() / puedeRenombrar()', () => {
    it('debe permitir renombrar la carpeta si el usuario actual es el dueño', () => {
      const carpeta = new Carpeta({
        id: 'carp-1',
        nombre: 'Bocetos',
        cantidadPosts: 3,
        propietarioId: 'user-123',
      })

      expect(carpeta.puedeRenombrarse('user-123')).toBe(true)
      expect(carpeta.puedeRenombrar('user-123')).toBe(true)
    })

    it('no debe permitir renombrar la carpeta si el usuario no es el dueño', () => {
      const carpeta = new Carpeta({
        id: 'carp-1',
        nombre: 'Bocetos',
        cantidadPosts: 3,
        propietarioId: 'user-123',
      })

      expect(carpeta.puedeRenombrarse('user-otro')).toBe(false)
      expect(carpeta.puedeRenombrar('user-otro')).toBe(false)
    })

    it('no debe permitir renombrar si no se proporciona usuario actual válido', () => {
      const carpeta = new Carpeta({
        id: 'carp-1',
        nombre: 'Bocetos',
        cantidadPosts: 3,
        propietarioId: 'user-123',
      })

      expect(carpeta.puedeRenombrarse('')).toBe(false)
      expect(carpeta.puedeRenombrar('')).toBe(false)
    })

    it('soporta verificación explícita pasando propietarioId como parámetro', () => {
      const carpeta = new Carpeta({
        id: 'carp-5',
        nombre: 'Proyectos 2026',
        cantidadPosts: 10,
      })

      expect(carpeta.puedeRenombrarse('user-abc', 'user-abc')).toBe(true)
      expect(carpeta.puedeRenombrarse('user-xyz', 'user-abc')).toBe(false)
    })
  })
})
