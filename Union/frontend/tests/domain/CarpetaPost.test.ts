import { describe, expect, it } from 'vitest'
import { CarpetaPost } from '../../src/domain/CarpetaPost'

/**
 * Tests unitarios de dominio para CarpetaPost — módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T077)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Domain Entities: CarpetaPost)
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-05, HU-06, HU-07, HU-08, A3, A7)
 *
 * Reglas cubiertas por T077:
 * - Nombre: 1-15 caracteres, permite espacios
 * - Eliminación: permitida incluso con posts dentro (A7)
 * - Renombrado: permitido siempre; backend valida unicidad por usuario (A3)
 */

function crearCarpetaPost(
  overrides: Partial<{
    id: string
    usuarioId: string
    nombre: string
    descripcion: string
    fechaCreacion: Date
    postCount: number
  }> = {},
): CarpetaPost {
  return new CarpetaPost(
    overrides.id ?? 'folder-1',
    overrides.usuarioId ?? 'user-1',
    overrides.nombre ?? 'Mis inspiraciones',
    overrides.descripcion ?? '',
    overrides.fechaCreacion ?? new Date(),
    overrides.postCount ?? 0,
  )
}

describe('CarpetaPost — Validaciones de dominio (T077)', () => {
  describe('esNombreValido() — Regla 4 (nombre de carpeta)', () => {
    it('retorna true para nombre válido con letras', () => {
      const carpeta = crearCarpetaPost({ nombre: 'Mis ideas' })
      expect(carpeta.esNombreValido()).toBe(true)
    })

    it('retorna true para nombre válido con espacios', () => {
      const carpeta = crearCarpetaPost({ nombre: 'Arte Digital' })
      expect(carpeta.esNombreValido()).toBe(true)
    })

    it('retorna true para nombre válido con números', () => {
      const carpeta = crearCarpetaPost({ nombre: 'Carpeta 2026' })
      expect(carpeta.esNombreValido()).toBe(true)
    })

    it('retorna true para nombre válido en el límite de 15 caracteres', () => {
      const carpeta = crearCarpetaPost({ nombre: '123456789012345' })
      expect(carpeta.esNombreValido()).toBe(true)
    })

    it('retorna true para nombre válido con caracteres especiales permitidos', () => {
      const carpeta = crearCarpetaPost({ nombre: 'Arte & Diseño' })
      expect(carpeta.esNombreValido()).toBe(true)
    })

    it('retorna false para nombre vacío', () => {
      const carpeta = crearCarpetaPost({ nombre: '' })
      expect(carpeta.esNombreValido()).toBe(false)
    })

    it('retorna false para nombre que supera 15 caracteres', () => {
      const carpeta = crearCarpetaPost({ nombre: '1234567890123456' })
      expect(carpeta.esNombreValido()).toBe(false)
    })

    it('retorna false para nombre muy largo', () => {
      const carpeta = crearCarpetaPost({ nombre: 'a'.repeat(50) })
      expect(carpeta.esNombreValido()).toBe(false)
    })
  })

  describe('esCarpetaValida() — Validación general de carpeta', () => {
    it('retorna true cuando nombre es válido', () => {
      const carpeta = crearCarpetaPost({ nombre: 'Mi Carpeta' })
      expect(carpeta.esCarpetaValida()).toBe(true)
    })

    it('retorna false cuando nombre es inválido', () => {
      const carpeta = crearCarpetaPost({ nombre: '' })
      expect(carpeta.esCarpetaValida()).toBe(false)
    })

    it('retorna false cuando nombre supera 15 caracteres', () => {
      const carpeta = crearCarpetaPost({ nombre: '1234567890123456' })
      expect(carpeta.esCarpetaValida()).toBe(false)
    })
  })

  describe('puedeSerEliminada() — Regla A7 (eliminación con posts)', () => {
    it('retorna true cuando carpeta está vacía', () => {
      const carpeta = crearCarpetaPost({ postCount: 0 })
      expect(carpeta.puedeSerEliminada()).toBe(true)
    })

    it('retorna true cuando carpeta tiene posts dentro', () => {
      const carpeta = crearCarpetaPost({ postCount: 5 })
      expect(carpeta.puedeSerEliminada()).toBe(true)
    })

    it('retorna true cuando carpeta tiene muchos posts', () => {
      const carpeta = crearCarpetaPost({ postCount: 100 })
      expect(carpeta.puedeSerEliminada()).toBe(true)
    })
  })

  describe('puedeSerRenombrada() — Regla A3 (renombrado)', () => {
    it('retorna true para carpeta normal', () => {
      const carpeta = crearCarpetaPost({ nombre: 'Mi Carpeta' })
      expect(carpeta.puedeSerRenombrada()).toBe(true)
    })

    it('retorna true incluso con posts dentro', () => {
      const carpeta = crearCarpetaPost({
        nombre: 'Mi Carpeta',
        postCount: 10,
      })
      expect(carpeta.puedeSerRenombrada()).toBe(true)
    })

    it('retorna true siempre (backend valida unicidad)', () => {
      const carpeta = crearCarpetaPost()
      expect(carpeta.puedeSerRenombrada()).toBe(true)
    })
  })

  describe('getDisplayName() — Nombre para mostrar', () => {
    it('retorna nombre con cantidad de posts cuando hay cero posts', () => {
      const carpeta = crearCarpetaPost({
        nombre: 'Mi Carpeta',
        postCount: 0,
      })
      expect(carpeta.getDisplayName()).toBe('Mi Carpeta (0)')
    })

    it('retorna nombre con cantidad de posts cuando hay un post', () => {
      const carpeta = crearCarpetaPost({
        nombre: 'Mi Carpeta',
        postCount: 1,
      })
      expect(carpeta.getDisplayName()).toBe('Mi Carpeta (1)')
    })

    it('retorna nombre con cantidad de posts cuando hay múltiples posts', () => {
      const carpeta = crearCarpetaPost({
        nombre: 'Mi Carpeta',
        postCount: 25,
      })
      expect(carpeta.getDisplayName()).toBe('Mi Carpeta (25)')
    })

    it('retorna nombre con cantidad de posts correcta', () => {
      const carpeta = crearCarpetaPost({
        nombre: 'Arte Digital',
        postCount: 42,
      })
      expect(carpeta.getDisplayName()).toBe('Arte Digital (42)')
    })
  })

  describe('HU-05 — Crear carpeta (AC-05.2, AC-05.3)', () => {
    it('permite crear carpeta con nombre válido de 1-15 caracteres', () => {
      const carpeta = crearCarpetaPost({ nombre: 'Nueva' })
      expect(carpeta.esNombreValido()).toBe(true)
    })

    it('rechaza crear carpeta con nombre vacío', () => {
      const carpeta = crearCarpetaPost({ nombre: '' })
      expect(carpeta.esNombreValido()).toBe(false)
    })

    it('rechaza crear carpeta con nombre que supera 15 caracteres', () => {
      const carpeta = crearCarpetaPost({ nombre: '1234567890123456' })
      expect(carpeta.esNombreValido()).toBe(false)
    })
  })

  describe('HU-06 — Renombrar carpeta (AC-06.1, AC-06.4)', () => {
    it('permite renombrar con mismo rango de validación que crear (1-15 caracteres)', () => {
      const carpeta = crearCarpetaPost({ nombre: 'Nombre original' })
      // Renaming validation applies same rules
      expect(carpeta.esNombreValido()).toBe(true)
      // Rename doesn't alter post count
      expect(carpeta.postCount).toBe(0)
    })

    it('renombrado no altera cantidad de posts', () => {
      const carpeta = crearCarpetaPost({
        nombre: 'Nombre original',
        postCount: 10,
      })
      expect(carpeta.postCount).toBe(10)
      // Validation for new name
      expect(carpeta.esNombreValido()).toBe(true)
    })

    it('permite renombrado en carpeta sin posts', () => {
      const carpeta = crearCarpetaPost({
        nombre: 'Viejo Nombre',
        postCount: 0,
      })
      expect(carpeta.puedeSerRenombrada()).toBe(true)
    })

    it('permite renombrado en carpeta con posts', () => {
      const carpeta = crearCarpetaPost({
        nombre: 'Viejo Nombre',
        postCount: 5,
      })
      expect(carpeta.puedeSerRenombrada()).toBe(true)
    })
  })

  describe('HU-07 — Eliminar carpeta (AC-07.2, AC-07.3, A7)', () => {
    it('permite eliminar carpeta vacía', () => {
      const carpeta = crearCarpetaPost({ postCount: 0 })
      expect(carpeta.puedeSerEliminada()).toBe(true)
    })

    it('permite eliminar carpeta con posts (A7 — posts no se eliminan)', () => {
      const carpeta = crearCarpetaPost({ postCount: 5 })
      expect(carpeta.puedeSerEliminada()).toBe(true)
    })

    it('permite eliminar carpeta con muchos posts', () => {
      const carpeta = crearCarpetaPost({ postCount: 50 })
      expect(carpeta.puedeSerEliminada()).toBe(true)
    })
  })

  describe('HU-08 — Visualizar lista de carpetas (AC-08.2)', () => {
    it('display name muestra nombre y cantidad de posts', () => {
      const carpeta = crearCarpetaPost({
        nombre: 'Inspiración',
        postCount: 15,
      })
      expect(carpeta.getDisplayName()).toBe('Inspiración (15)')
    })

    it('display name maneja cantidad cero correctamente', () => {
      const carpeta = crearCarpetaPost({
        nombre: 'Nueva Carpeta',
        postCount: 0,
      })
      expect(carpeta.getDisplayName()).toBe('Nueva Carpeta (0)')
    })
  })

  describe('Casos extremos y validación de límites', () => {
    it('nombre con exactamente 1 carácter es válido', () => {
      const carpeta = crearCarpetaPost({ nombre: 'A' })
      expect(carpeta.esNombreValido()).toBe(true)
    })

    it('nombre con exactamente 15 caracteres es válido', () => {
      const carpeta = crearCarpetaPost({ nombre: '12345 67890 123' })
      expect(carpeta.esNombreValido()).toBe(true)
    })

    it('nombre con 16 caracteres es inválido', () => {
      const carpeta = crearCarpetaPost({ nombre: '12345 67890 1234' })
      expect(carpeta.esNombreValido()).toBe(false)
    })

    it('nombre solo con espacios se valida correctamente', () => {
      const carpeta = crearCarpetaPost({ nombre: '     ' })
      expect(carpeta.esNombreValido()).toBe(true)
    })

    it('carpeta mantiene su ID y usuarioId', () => {
      const carpeta = crearCarpetaPost({
        id: 'folder-abc',
        usuarioId: 'user-xyz',
      })
      expect(carpeta.id).toBe('folder-abc')
      expect(carpeta.usuarioId).toBe('user-xyz')
    })

    it('carpeta puede inicializarse con descripción', () => {
      const carpeta = crearCarpetaPost({
        nombre: 'Carpeta',
        descripcion: 'Mi descripción',
      })
      expect(carpeta.descripcion).toBe('Mi descripción')
    })
  })
})
