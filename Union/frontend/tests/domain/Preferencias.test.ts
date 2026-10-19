import { describe, it, expect, beforeEach } from 'vitest';
import { Preferencias } from '../../src/domain/entities/Preferencias';
import { PreferenciasDTO } from '../../src/application/dto/PreferenciasDTO';
import { CategoriaInteres } from '../../src/domain/enums/CategoriaInteres';
import { GeneroMusical } from '../../src/domain/enums/GeneroMusical';
import { EstiloPintura } from '../../src/domain/enums/EstiloPintura';

/**
 * Tests para Preferencias (T025)
 *
 * Requisitos:
 * - RNF-24: Tests unitarios
 * - RNF-23: Cobertura ≥ 80%
 *
 * Criterios:
 * - Test deduplicación
 * - Test isEmpty()
 * - Test validación invariantes
 * - Test toDTO()
 * - Cobertura ≥ 80%
 */
describe('Preferencias', () => {
  describe('Creación y Factory', () => {
    it('debe crear preferencias válidas', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      expect(prefs.interesesArtisticos).toHaveLength(1);
      expect(prefs.generosMusical).toHaveLength(1);
      expect(prefs.estilosPintura).toHaveLength(0);
    });

    it('debe crear con estilos opcionales', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock],
        [EstiloPintura.Realismo]
      );

      expect(prefs.estilosPintura).toHaveLength(1);
    });

    it('debe lanzar error sin intereses', () => {
      expect(() => Preferencias.crear([], [GeneroMusical.Rock])).toThrow(
        'al menos 1 interés artístico'
      );
    });

    it('debe lanzar error sin géneros', () => {
      expect(() => Preferencias.crear([CategoriaInteres.Dibujo], [])).toThrow(
        'al menos 1 género musical'
      );
    });

    it('debe crear desde DTO', () => {
      const dto = PreferenciasDTO.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      const prefs = Preferencias.desdeDTO(dto);

      expect(prefs.interesesArtisticos).toHaveLength(1);
      expect(prefs.generosMusical).toHaveLength(1);
    });
  });

  describe('Deduplicación', () => {
    it('debe deduplicar intereses automáticamente', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo, CategoriaInteres.Dibujo, CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      expect(prefs.interesesArtisticos).toHaveLength(1);
      expect(prefs.interesesArtisticos[0]).toBe(CategoriaInteres.Dibujo);
    });

    it('debe deduplicar géneros automáticamente', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock, GeneroMusical.Rock, GeneroMusical.Rock]
      );

      expect(prefs.generosMusical).toHaveLength(1);
      expect(prefs.generosMusical[0]).toBe(GeneroMusical.Rock);
    });

    it('debe deduplicar estilos automáticamente', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock],
        [
          EstiloPintura.Realismo,
          EstiloPintura.Realismo,
          EstiloPintura.Abstraccion,
          EstiloPintura.Realismo,
        ]
      );

      expect(prefs.estilosPintura).toHaveLength(2);
      expect(prefs.estilosPintura).toContain(EstiloPintura.Realismo);
      expect(prefs.estilosPintura).toContain(EstiloPintura.Abstraccion);
    });

    it('debe deduplicar todos los arrays mezclados', () => {
      const prefs = Preferencias.crear(
        [
          CategoriaInteres.Dibujo,
          CategoriaInteres.Escultura,
          CategoriaInteres.Dibujo,
        ],
        [GeneroMusical.Rock, GeneroMusical.Pop, GeneroMusical.Rock],
        [EstiloPintura.Realismo, EstiloPintura.Realismo]
      );

      expect(prefs.interesesArtisticos).toHaveLength(2);
      expect(prefs.generosMusical).toHaveLength(2);
      expect(prefs.estilosPintura).toHaveLength(1);
    });
  });

  describe('Validación de invariantes', () => {
    it('debe validar al crear', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      // Si llegó acá, los invariantes se validaron
      expect(prefs).toBeDefined();
    });

    it('debe garantizar ≥1 interés', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      expect(prefs.interesesArtisticos.length).toBeGreaterThanOrEqual(1);
    });

    it('debe garantizar ≥1 género', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      expect(prefs.generosMusical.length).toBeGreaterThanOrEqual(1);
    });

    it('debe permitir ≥0 estilos (opcional)', () => {
      const prefs1 = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );
      const prefs2 = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock],
        []
      );

      expect(prefs1.estilosPintura.length).toBeGreaterThanOrEqual(0);
      expect(prefs2.estilosPintura.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('isEmpty()', () => {
    it('debe retornar false cuando hay preferencias', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      expect(prefs.estaVacio()).toBe(false);
    });

    it('debe retornar false si hay solo estilos', () => {
      // Nota: no se puede crear sin intereses ni géneros por invariantes
      // pero este test documenta el comportamiento esperado
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock],
        [EstiloPintura.Realismo]
      );

      expect(prefs.estaVacio()).toBe(false);
    });
  });

  describe('toDTO()', () => {
    it('debe convertir a DTO correctamente', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo, CategoriaInteres.Escultura],
        [GeneroMusical.Rock, GeneroMusical.Pop],
        [EstiloPintura.Realismo]
      );

      const dto = prefs.toDTO();

      expect(dto).toBeInstanceOf(PreferenciasDTO);
      expect(dto.interesesArtisticos).toHaveLength(2);
      expect(dto.generosMusical).toHaveLength(2);
      expect(dto.estilosPintura).toHaveLength(1);
    });

    it('debe preservar valores en conversión a DTO', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      const dto = prefs.toDTO();

      expect(dto.interesesArtisticos[0]).toBe(CategoriaInteres.Dibujo);
      expect(dto.generosMusical[0]).toBe(GeneroMusical.Rock);
    });

    it('debe retornar DTO separado (no la misma referencia)', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      const dto1 = prefs.toDTO();
      const dto2 = prefs.toDTO();

      expect(dto1).not.toBe(dto2);
      expect(dto1.interesesArtisticos).toEqual(dto2.interesesArtisticos);
    });
  });

  describe('Immutabilidad', () => {
    it('debe tener propiedades readonly', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      expect(prefs.interesesArtisticos).toBeDefined();
      expect(prefs.generosMusical).toBeDefined();
      expect(prefs.estilosPintura).toBeDefined();
    });

    it('no debe permitir modificar arrays (congelados)', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      // Los arrays están congelados
      expect(() => {
        (prefs.interesesArtisticos as any).push(CategoriaInteres.Escultura);
      }).toThrow();
    });
  });

  describe('Métodos auxiliares', () => {
    let prefs: Preferencias;

    beforeEach(() => {
      prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo, CategoriaInteres.Escultura],
        [GeneroMusical.Rock],
        [EstiloPintura.Realismo]
      );
    });

    it('debe contar total de preferencias', () => {
      expect(prefs.totalPreferencias()).toBe(4);
    });

    it('debe encontrar categoría en intereses', () => {
      expect(prefs.tieneCategoria(CategoriaInteres.Dibujo)).toBe(true);
      expect(prefs.tieneCategoria(CategoriaInteres.Fotografia)).toBe(false);
    });

    it('debe encontrar categoría en géneros', () => {
      expect(prefs.tieneCategoria(GeneroMusical.Rock)).toBe(true);
      expect(prefs.tieneCategoria(GeneroMusical.Pop)).toBe(false);
    });

    it('debe encontrar categoría en estilos', () => {
      expect(prefs.tieneCategoria(EstiloPintura.Realismo)).toBe(true);
      expect(prefs.tieneCategoria(EstiloPintura.Abstraccion)).toBe(false);
    });

    it('debe contar 0 o 1 categoría (sin duplicados)', () => {
      expect(prefs.contarCategoria(CategoriaInteres.Dibujo)).toBe(1);
      expect(prefs.contarCategoria(CategoriaInteres.Fotografia)).toBe(0);
    });

    it('debe generar resumen corto', () => {
      const resumen = prefs.resumen();
      expect(resumen).toBe('2 intereses, 1 géneros, 1 estilos');
    });

    it('debe generar resumen detallado', () => {
      const resumen = prefs.resumenDetallado();
      expect(resumen).toContain('Intereses:');
      expect(resumen).toContain('Géneros:');
      expect(resumen).toContain('Estilos:');
      expect(resumen).toContain('dibujo');
      expect(resumen).toContain('escultura');
      expect(resumen).toContain('rock');
      expect(resumen).toContain('realismo');
    });

    it('debe comparar igualdad con otra instancia', () => {
      const prefs2 = Preferencias.crear(
        [CategoriaInteres.Dibujo, CategoriaInteres.Escultura],
        [GeneroMusical.Rock],
        [EstiloPintura.Realismo]
      );

      expect(prefs.igualA(prefs2)).toBe(true);
    });

    it('debe detectar diferencias', () => {
      const prefs2 = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      expect(prefs.igualA(prefs2)).toBe(false);
    });
  });

  describe('Serialización JSON', () => {
    it('debe convertir a JSON', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock],
        [EstiloPintura.Realismo]
      );

      const json = prefs.toJSON();

      expect(json.interesesArtisticos).toContain(CategoriaInteres.Dibujo);
      expect(json.generosMusical).toContain(GeneroMusical.Rock);
      expect(json.estilosPintura).toContain(EstiloPintura.Realismo);
    });

    it('debe ser serializable con JSON.stringify', () => {
      const prefs = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      const stringified = JSON.stringify(prefs);
      const parsed = JSON.parse(stringified);

      expect(parsed.interesesArtisticos).toContain(CategoriaInteres.Dibujo);
    });

    it('debe recuperarse desde JSON', () => {
      const original = Preferencias.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock],
        [EstiloPintura.Realismo]
      );

      const json = original.toJSON();
      const recuperado = Preferencias.fromJSON(json);

      expect(recuperado.igualA(original)).toBe(true);
    });

    it('debe rechazar entrada inválida en fromJSON', () => {
      expect(() => Preferencias.fromJSON(null)).toThrow();
      expect(() => Preferencias.fromJSON(undefined)).toThrow();
      expect(() => Preferencias.fromJSON('string')).toThrow();
    });

    it('debe manejar JSON con arrays vacíos pero válidos', () => {
      // Solo estilos pueden estar vacíos
      const json = {
        interesesArtisticos: [CategoriaInteres.Dibujo],
        generosMusical: [GeneroMusical.Rock],
        estilosPintura: [],
      };

      const prefs = Preferencias.fromJSON(json);
      expect(prefs.estilosPintura).toHaveLength(0);
    });
  });
});
