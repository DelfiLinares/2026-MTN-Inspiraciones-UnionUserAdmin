import { describe, expect, it } from 'vitest'
import { PublicacionPerfil } from '../../src/domain/PublicacionPerfil'

/**
 * Tests unitarios de dominio para PublicacionPerfil — módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T078)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Domain Entities: PublicacionPerfil)
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-11, HU-12, HU-13, A5)
 *
 * Reglas cubiertas por T078:
 * - Edición: Solo texto es editable, imagen es inmutable (A5)
 * - Validación de texto: 1-2000 caracteres
 * - Identificación de propiedad de post
 */

function crearPublicacion(
  overrides: Partial<{
    id: string
    autorId: string
    autorNombreUsuario: string
    imagenUrl: string
    texto: string
    fechaCreacion: Date
    fechaActualizacion?: Date
    autorFotoUrl?: string
  }> = {},
): PublicacionPerfil {
  return new PublicacionPerfil(
    overrides.id ?? 'post-1',
    overrides.autorId ?? 'user-1',
    overrides.autorNombreUsuario ?? 'artista',
    overrides.imagenUrl ?? 'https://example.com/image.jpg',
    overrides.texto ?? 'Excelente inspiración',
    overrides.fechaCreacion ?? new Date(),
    overrides.fechaActualizacion,
    'autorFotoUrl' in overrides ? overrides.autorFotoUrl : 'https://example.com/avatar.jpg',
  )
}

describe('PublicacionPerfil — Validaciones de dominio (T078)', () => {
  describe('puedeSerEditada() — Regla HU-11 (edición de texto)', () => {
    it('retorna true para publicación que puede ser editada', () => {
      const post = crearPublicacion()
      expect(post.puedeSerEditada()).toBe(true)
    })

    it('retorna true incluso si la publicación tiene fecha de actualización', () => {
      const post = crearPublicacion({
        fechaActualizacion: new Date(),
      })
      expect(post.puedeSerEditada()).toBe(true)
    })

    it('retorna true siempre (backend valida autorización)', () => {
      const post = crearPublicacion()
      expect(post.puedeSerEditada()).toBe(true)
    })
  })

  describe('esImagenImmutable() — Regla A5 (inmutabilidad de imagen)', () => {
    it('retorna true indicando que imagen es inmutable', () => {
      const post = crearPublicacion()
      expect(post.esImagenImmutable()).toBe(true)
    })

    it('retorna true incluso después de editar texto', () => {
      const post = crearPublicacion({
        texto: 'Texto original',
      })
      expect(post.esImagenImmutable()).toBe(true)
      // La imagen URL sigue siendo la misma
      expect(post.imagenUrl).toBe('https://example.com/image.jpg')
    })

    it('retorna true para todas las publicaciones', () => {
      const post1 = crearPublicacion({ id: 'post-1' })
      const post2 = crearPublicacion({ id: 'post-2' })
      expect(post1.esImagenImmutable()).toBe(true)
      expect(post2.esImagenImmutable()).toBe(true)
    })
  })

  describe('puedeSerEliminada() — Regla HU-12 (eliminación)', () => {
    it('retorna true para publicación que puede ser eliminada', () => {
      const post = crearPublicacion()
      expect(post.puedeSerEliminada()).toBe(true)
    })

    it('retorna true incluso si tiene fecha de actualización', () => {
      const post = crearPublicacion({
        fechaActualizacion: new Date(),
      })
      expect(post.puedeSerEliminada()).toBe(true)
    })

    it('retorna true siempre (backend valida autorización)', () => {
      const post = crearPublicacion()
      expect(post.puedeSerEliminada()).toBe(true)
    })
  })

  describe('esPropia() — Identificación de propiedad', () => {
    it('retorna true si usuarioActualId coincide con autorId', () => {
      const post = crearPublicacion({ autorId: 'user-1' })
      expect(post.esPropia('user-1')).toBe(true)
    })

    it('retorna false si usuarioActualId no coincide con autorId', () => {
      const post = crearPublicacion({ autorId: 'user-1' })
      expect(post.esPropia('user-2')).toBe(false)
    })

    it('retorna false si usuarioActualId es vacío', () => {
      const post = crearPublicacion({ autorId: 'user-1' })
      expect(post.esPropia('')).toBe(false)
    })

    it('retorna false si usuarioActualId es undefined', () => {
      const post = crearPublicacion({ autorId: 'user-1' })
      expect(post.esPropia(undefined as any)).toBe(false)
    })

    it('distingue correctamente entre usuarios distintos', () => {
      const post = crearPublicacion({ autorId: 'user-alice' })
      expect(post.esPropia('user-alice')).toBe(true)
      expect(post.esPropia('user-bob')).toBe(false)
    })
  })

  describe('esTextoValido() — Validación de texto (max 2000)', () => {
    it('retorna true para texto válido', () => {
      const post = crearPublicacion({ texto: 'Excelente inspiración' })
      expect(post.esTextoValido()).toBe(true)
    })

    it('retorna true para texto de 1 carácter', () => {
      const post = crearPublicacion({ texto: 'A' })
      expect(post.esTextoValido()).toBe(true)
    })

    it('retorna true para texto en el límite de 2000 caracteres', () => {
      const post = crearPublicacion({ texto: 'a'.repeat(2000) })
      expect(post.esTextoValido()).toBe(true)
    })

    it('retorna false para texto vacío', () => {
      const post = crearPublicacion({ texto: '' })
      expect(post.esTextoValido()).toBe(false)
    })

    it('retorna false para texto que supera 2000 caracteres', () => {
      const post = crearPublicacion({ texto: 'a'.repeat(2001) })
      expect(post.esTextoValido()).toBe(false)
    })

    it('retorna false para texto muy largo', () => {
      const post = crearPublicacion({ texto: 'a'.repeat(5000) })
      expect(post.esTextoValido()).toBe(false)
    })

    it('retorna true para texto con espacios y saltos de línea', () => {
      const post = crearPublicacion({
        texto: `Esto es un texto
con múltiples líneas
y espacios en blanco.
¡Excelente inspiración!`,
      })
      expect(post.esTextoValido()).toBe(true)
    })

    it('retorna true para texto con caracteres especiales', () => {
      const post = crearPublicacion({
        texto: 'Inspiración: ¡Crear es vivir! (2026) — #arte @usuario',
      })
      expect(post.esTextoValido()).toBe(true)
    })
  })

  describe('HU-11 — Editar publicación (A5: solo texto editable)', () => {
    it('permite edición de texto (puedeSerEditada = true)', () => {
      const post = crearPublicacion({
        texto: 'Texto original',
        imagenUrl: 'https://example.com/original.jpg',
      })
      expect(post.puedeSerEditada()).toBe(true)
      // Campo editable: texto
      expect(post.esTextoValido()).toBe(true)
    })

    it('imagen permanece inmutable (esImagenImmutable = true)', () => {
      const imagenOriginal = 'https://example.com/image.jpg'
      const post = crearPublicacion({
        texto: 'Texto original',
        imagenUrl: imagenOriginal,
      })
      expect(post.esImagenImmutable()).toBe(true)
      expect(post.imagenUrl).toBe(imagenOriginal)
    })

    it('solo campo texto es editable, no imagen (A5)', () => {
      const post = crearPublicacion({
        texto: 'Texto que se puede editar',
        imagenUrl: 'https://example.com/inmutable.jpg',
      })
      expect(post.puedeSerEditada()).toBe(true)
      expect(post.esImagenImmutable()).toBe(true)
      // La imagen URL no cambiaría en una edición real
      expect(post.imagenUrl).toBe('https://example.com/inmutable.jpg')
    })
  })

  describe('HU-12 — Eliminar publicación (AC-12.1)', () => {
    it('permite eliminar publicación propia', () => {
      const post = crearPublicacion({ autorId: 'user-1' })
      // Verificar que es propia
      expect(post.esPropia('user-1')).toBe(true)
      // Y que puede ser eliminada
      expect(post.puedeSerEliminada()).toBe(true)
    })

    it('publicación ajena no es propia pero puede ser eliminada por backend', () => {
      const post = crearPublicacion({ autorId: 'user-alice' })
      // No es propia del usuario actual
      expect(post.esPropia('user-bob')).toBe(false)
      // Pero el backend valida autorización
      expect(post.puedeSerEliminada()).toBe(true)
    })
  })

  describe('HU-13 — Visualizar publicaciones (AC-13.1)', () => {
    it('publicación contiene información del autor para navegación', () => {
      const post = crearPublicacion({
        autorId: 'user-1',
        autorNombreUsuario: 'artista_profesional',
        autorFotoUrl: 'https://example.com/avatar.jpg',
      })
      expect(post.autorId).toBe('user-1')
      expect(post.autorNombreUsuario).toBe('artista_profesional')
      expect(post.autorFotoUrl).toBe('https://example.com/avatar.jpg')
    })

    it('publicación contiene texto e imagen para visualización', () => {
      const post = crearPublicacion({
        imagenUrl: 'https://example.com/artwork.jpg',
        texto: 'Obra maestra del arte digital',
      })
      expect(post.imagenUrl).toBe('https://example.com/artwork.jpg')
      expect(post.texto).toBe('Obra maestra del arte digital')
    })
  })

  describe('Casos extremos y propiedades de la entidad', () => {
    it('publicación mantiene su ID y fechas', () => {
      const ahora = new Date()
      const actualizado = new Date(ahora.getTime() + 1000)
      const post = crearPublicacion({
        id: 'post-unique',
        fechaCreacion: ahora,
        fechaActualizacion: actualizado,
      })
      expect(post.id).toBe('post-unique')
      expect(post.fechaCreacion).toBe(ahora)
      expect(post.fechaActualizacion).toBe(actualizado)
    })

    it('texto con exactamente 2000 caracteres es válido', () => {
      const post = crearPublicacion({ texto: 'x'.repeat(2000) })
      expect(post.esTextoValido()).toBe(true)
    })

    it('texto con exactamente 2001 caracteres es inválido', () => {
      const post = crearPublicacion({ texto: 'x'.repeat(2001) })
      expect(post.esTextoValido()).toBe(false)
    })

    it('publicación puede inicializarse sin foto del autor', () => {
      const post = crearPublicacion({ autorFotoUrl: undefined })
      expect(post.autorFotoUrl).toBeUndefined()
    })

    it('publicación puede inicializarse sin fecha de actualización', () => {
      const post = crearPublicacion({ fechaActualizacion: undefined })
      expect(post.fechaActualizacion).toBeUndefined()
    })

    it('distint publicaciones son independientes', () => {
      const post1 = crearPublicacion({
        id: 'post-1',
        autorId: 'user-1',
        texto: 'Texto 1',
      })
      const post2 = crearPublicacion({
        id: 'post-2',
        autorId: 'user-2',
        texto: 'Texto 2',
      })
      expect(post1.id).not.toBe(post2.id)
      expect(post1.autorId).not.toBe(post2.autorId)
      expect(post1.texto).not.toBe(post2.texto)
    })
  })
})
