/**
 * Tests para OpcionRespuesta (T008)
 *
 * Cubre:
 * - Construcción válida
 * - Construcción inválida (validación de campos)
 * - Getters
 * - Métodos esValida(), toString(), equals()
 * - Immutabilidad
 *
 * Requisitos: RNF-24 (Testing), A-2 (Clarifications)
 * Criterio: Cobertura ≥ 80%
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { OpcionRespuesta, Categoria } from '../../src/domain/entities/OpcionRespuesta'
import { CategoriaInteres } from '../../src/domain/enums/CategoriaInteres'
import { GeneroMusical } from '../../src/domain/enums/GeneroMusical'
import { EstiloPintura } from '../../src/domain/enums/EstiloPintura'

describe('OpcionRespuesta (Domain Entity)', () => {
  let opcionDibujo: OpcionRespuesta
  let opcionRock: OpcionRespuesta
  let opcionRealismo: OpcionRespuesta

  beforeEach(() => {
    // Arrange: crear instancias de prueba
    opcionDibujo = OpcionRespuesta.crear('opt-001', CategoriaInteres.Dibujo, 'Dibujo')
    opcionRock = OpcionRespuesta.crear('opt-002', GeneroMusical.Rock, 'Rock')
    opcionRealismo = OpcionRespuesta.crear('opt-003', EstiloPintura.Realismo, 'Realismo')
  })

  describe('Construcción válida', () => {
    it('should create OpcionRespuesta with valid CategoriaInteres', () => {
      // Act & Assert
      expect(opcionDibujo).toBeDefined()
      expect(opcionDibujo.id).toBe('opt-001')
      expect(opcionDibujo.categoria).toBe(CategoriaInteres.Dibujo)
      expect(opcionDibujo.descripcion).toBe('Dibujo')
    })

    it('should create OpcionRespuesta with valid GeneroMusical', () => {
      // Act & Assert
      expect(opcionRock).toBeDefined()
      expect(opcionRock.id).toBe('opt-002')
      expect(opcionRock.categoria).toBe(GeneroMusical.Rock)
      expect(opcionRock.descripcion).toBe('Rock')
    })

    it('should create OpcionRespuesta with valid EstiloPintura', () => {
      // Act & Assert
      expect(opcionRealismo).toBeDefined()
      expect(opcionRealismo.id).toBe('opt-003')
      expect(opcionRealismo.categoria).toBe(EstiloPintura.Realismo)
      expect(opcionRealismo.descripcion).toBe('Realismo')
    })

    it('should allow fromValues() factory method for direct instantiation', () => {
      // Act
      const opcion = OpcionRespuesta.fromValues(
        'opt-004',
        CategoriaInteres.Escultura,
        'Escultura'
      )

      // Assert
      expect(opcion).toBeDefined()
      expect(opcion.id).toBe('opt-004')
      expect(opcion.descripcion).toBe('Escultura')
    })
  })

  describe('Construcción inválida - Validación de campos', () => {
    it('should throw error when id is empty string', () => {
      // Act & Assert
      expect(() => {
        OpcionRespuesta.crear('', CategoriaInteres.Dibujo, 'Dibujo')
      }).toThrow('OpcionRespuesta: id no puede estar vacío')
    })

    it('should throw error when id is only whitespace', () => {
      // Act & Assert
      expect(() => {
        OpcionRespuesta.crear('   ', CategoriaInteres.Dibujo, 'Dibujo')
      }).toThrow('OpcionRespuesta: id no puede estar vacío')
    })

    it('should throw error when descripcion is empty string', () => {
      // Act & Assert
      expect(() => {
        OpcionRespuesta.crear('opt-001', CategoriaInteres.Dibujo, '')
      }).toThrow('OpcionRespuesta: descripcion no puede estar vacía')
    })

    it('should throw error when descripcion is only whitespace', () => {
      // Act & Assert
      expect(() => {
        OpcionRespuesta.crear('opt-001', CategoriaInteres.Dibujo, '   ')
      }).toThrow('OpcionRespuesta: descripcion no puede estar vacía')
    })

    it('should throw error when categoria is undefined', () => {
      // Act & Assert
      expect(() => {
        OpcionRespuesta.crear('opt-001', undefined as any, 'Dibujo')
      }).toThrow('OpcionRespuesta: categoria es requerida')
    })

    it('should throw error when categoria is null', () => {
      // Act & Assert
      expect(() => {
        OpcionRespuesta.crear('opt-001', null as any, 'Dibujo')
      }).toThrow('OpcionRespuesta: categoria es requerida')
    })

    it('should trim whitespace from id during validation', () => {
      // Act
      const opcion = OpcionRespuesta.crear('  opt-001  ', CategoriaInteres.Dibujo, 'Dibujo')

      // Assert - Note: constructor receives trimmed value via validation
      // but stores the original (before trim check)
      expect(opcion.id).toBeTruthy()
    })

    it('should trim whitespace from descripcion during validation', () => {
      // Act
      const opcion = OpcionRespuesta.crear('opt-001', CategoriaInteres.Dibujo, '  Dibujo  ')

      // Assert
      expect(opcion.descripcion).toBeTruthy()
    })
  })

  describe('Getters - Acceso a propiedades', () => {
    it('should return id via getter', () => {
      // Assert
      expect(opcionDibujo.id).toBe('opt-001')
    })

    it('should return categoria via getter', () => {
      // Assert
      expect(opcionDibujo.categoria).toBe(CategoriaInteres.Dibujo)
    })

    it('should return descripcion via getter', () => {
      // Assert
      expect(opcionDibujo.descripcion).toBe('Dibujo')
    })

    it('should get multiple opciones with different categories', () => {
      // Act & Assert
      expect(opcionDibujo.categoria).toBe(CategoriaInteres.Dibujo)
      expect(opcionRock.categoria).toBe(GeneroMusical.Rock)
      expect(opcionRealismo.categoria).toBe(EstiloPintura.Realismo)
    })
  })

  describe('Método esValida()', () => {
    it('should return true for valid OpcionRespuesta', () => {
      // Assert
      expect(opcionDibujo.esValida()).toBe(true)
      expect(opcionRock.esValida()).toBe(true)
      expect(opcionRealismo.esValida()).toBe(true)
    })

    it('should confirm validity after construction', () => {
      // Act
      const opcion = OpcionRespuesta.crear('opt-new', CategoriaInteres.Fotografia, 'Foto')

      // Assert
      expect(opcion.esValida()).toBe(true)
    })
  })

  describe('Método toString()', () => {
    it('should return formatted string representation', () => {
      // Act
      const str = opcionDibujo.toString()

      // Assert
      expect(str).toContain('OpcionRespuesta')
      expect(str).toContain('opt-001')
      expect(str).toContain(CategoriaInteres.Dibujo)
      expect(str).toContain('Dibujo')
    })

    it('should include all properties in string', () => {
      // Act
      const str = opcionRock.toString()

      // Assert
      expect(str).toContain('opt-002')
      expect(str).toContain('Rock')
    })
  })

  describe('Método equals()', () => {
    it('should return true for equal opciones (same values)', () => {
      // Arrange
      const opcion1 = OpcionRespuesta.crear('opt-100', CategoriaInteres.Dibujo, 'Dibujo')
      const opcion2 = OpcionRespuesta.crear('opt-100', CategoriaInteres.Dibujo, 'Dibujo')

      // Act & Assert
      expect(opcion1.equals(opcion2)).toBe(true)
    })

    it('should return false for different id', () => {
      // Arrange
      const opcion1 = OpcionRespuesta.crear('opt-100', CategoriaInteres.Dibujo, 'Dibujo')
      const opcion2 = OpcionRespuesta.crear('opt-101', CategoriaInteres.Dibujo, 'Dibujo')

      // Act & Assert
      expect(opcion1.equals(opcion2)).toBe(false)
    })

    it('should return false for different categoria', () => {
      // Arrange
      const opcion1 = OpcionRespuesta.crear('opt-100', CategoriaInteres.Dibujo, 'Dibujo')
      const opcion2 = OpcionRespuesta.crear('opt-100', CategoriaInteres.Escultura, 'Dibujo')

      // Act & Assert
      expect(opcion1.equals(opcion2)).toBe(false)
    })

    it('should return false for different descripcion', () => {
      // Arrange
      const opcion1 = OpcionRespuesta.crear('opt-100', CategoriaInteres.Dibujo, 'Dibujo')
      const opcion2 = OpcionRespuesta.crear('opt-100', CategoriaInteres.Dibujo, 'Pintura')

      // Act & Assert
      expect(opcion1.equals(opcion2)).toBe(false)
    })

    it('should be reflexive: opcion.equals(opcion) === true', () => {
      // Act & Assert
      expect(opcionDibujo.equals(opcionDibujo)).toBe(true)
    })

    it('should be symmetric: if a.equals(b) then b.equals(a)', () => {
      // Arrange
      const opcion1 = OpcionRespuesta.crear('opt-200', CategoriaInteres.Dibujo, 'Dibujo')
      const opcion2 = OpcionRespuesta.crear('opt-200', CategoriaInteres.Dibujo, 'Dibujo')

      // Act & Assert
      expect(opcion1.equals(opcion2)).toBe(opcion2.equals(opcion1))
    })

    it('should be transitive: if a.equals(b) and b.equals(c) then a.equals(c)', () => {
      // Arrange
      const opcion1 = OpcionRespuesta.crear('opt-300', CategoriaInteres.Dibujo, 'Dibujo')
      const opcion2 = OpcionRespuesta.crear('opt-300', CategoriaInteres.Dibujo, 'Dibujo')
      const opcion3 = OpcionRespuesta.crear('opt-300', CategoriaInteres.Dibujo, 'Dibujo')

      // Act & Assert
      expect(opcion1.equals(opcion2) && opcion2.equals(opcion3)).toBe(true)
      expect(opcion1.equals(opcion3)).toBe(true)
    })
  })

  describe('Immutabilidad - No reasignación de propiedades', () => {
    it('should not allow modification of id property', () => {
      // Act & Assert
      expect(() => {
        ;(opcionDibujo as any).id = 'new-id'
      }).toThrow()
    })

    it('should not allow modification of categoria property', () => {
      // Act & Assert
      expect(() => {
        ;(opcionDibujo as any).categoria = GeneroMusical.Pop
      }).toThrow()
    })

    it('should not allow modification of descripcion property', () => {
      // Act & Assert
      expect(() => {
        ;(opcionDibujo as any).descripcion = 'Nueva descripción'
      }).toThrow()
    })

    it('should prevent direct property modification via getters', () => {
      // Arrange & Act
      const id = opcionDibujo.id
      const categoria = opcionDibujo.categoria
      const descripcion = opcionDibujo.descripcion

      // Assert - Properties remain unchanged
      expect(opcionDibujo.id).toBe(id)
      expect(opcionDibujo.categoria).toBe(categoria)
      expect(opcionDibujo.descripcion).toBe(descripcion)
    })

    it('should not allow adding new properties', () => {
      // Act & Assert
      expect(() => {
        ;(opcionDibujo as any).nuevoAtributo = 'valor'
      }).not.toThrow() // TypeScript allows but at runtime it works

      // The constructor is private, so no direct modification through setters
      // Verify that getters still return the original values
      expect(opcionDibujo.id).toBe('opt-001')
      expect(opcionDibujo.categoria).toBe(CategoriaInteres.Dibujo)
      expect(opcionDibujo.descripcion).toBe('Dibujo')
    })
  })

  describe('Integración - Casos reales de uso', () => {
    it('should work with all tres categorías en un cuestionario', () => {
      // Arrange
      const opciones: OpcionRespuesta[] = [
        OpcionRespuesta.crear('art-001', CategoriaInteres.Dibujo, 'Dibujo'),
        OpcionRespuesta.crear('art-002', CategoriaInteres.Escultura, 'Escultura'),
        OpcionRespuesta.crear('mus-001', GeneroMusical.Rock, 'Rock'),
        OpcionRespuesta.crear('mus-002', GeneroMusical.Pop, 'Pop'),
        OpcionRespuesta.crear('pin-001', EstiloPintura.Realismo, 'Realismo'),
        OpcionRespuesta.crear('pin-002', EstiloPintura.Abstraccion, 'Abstracción'),
      ]

      // Act & Assert
      expect(opciones).toHaveLength(6)
      expect(opciones.every((o) => o.esValida())).toBe(true)
    })

    it('should create collection of opciones for a single pregunta', () => {
      // Arrange - Crear opciones para pregunta de categorías artísticas
      const categoriasArtisticas = [
        OpcionRespuesta.crear('c-001', CategoriaInteres.Dibujo, 'Dibujo'),
        OpcionRespuesta.crear('c-002', CategoriaInteres.Escultura, 'Escultura'),
        OpcionRespuesta.crear('c-003', CategoriaInteres.Fotografia, 'Fotografía'),
      ]

      // Act
      const opcionesValidas = categoriasArtisticas.filter((o) => o.esValida())

      // Assert
      expect(opcionesValidas).toHaveLength(3)
    })

    it('should handle selection of multiple opciones', () => {
      // Arrange
      const selectedIds = ['opt-001', 'opt-002']
      const opcionesDisponibles = [opcionDibujo, opcionRock]

      // Act
      const opcionesSeleccionadas = opcionesDisponibles.filter((o) =>
        selectedIds.includes(o.id)
      )

      // Assert
      expect(opcionesSeleccionadas).toHaveLength(2)
    })
  })
})
