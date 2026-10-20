import { describe, it, expect } from 'vitest';
import { PreferenciasDTO } from '../../src/application/dto/PreferenciasDTO';
import { CategoriaInteres } from '../../src/domain/enums/CategoriaInteres';
import { GeneroMusical } from '../../src/domain/enums/GeneroMusical';
import { EstiloPintura } from '../../src/domain/enums/EstiloPintura';

/**
 * Tests para PreferenciasDTO (T025)
 *
 * Requisitos:
 * - RNF-24: Tests unitarios
 * - RNF-23: Cobertura ≥ 80%
 *
 * Criterios:
 * - Test serialización JSON
 * - Test factory methods
 * - Test validación
 * - Cobertura ≥ 80%
 */
describe('PreferenciasDTO', () => {
  describe('Factory methods', () => {
    it('debe crear desde arrays', () => {
      const dto = PreferenciasDTO.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock],
        [EstiloPintura.Realismo]
      );

      expect(dto.interesesArtisticos).toHaveLength(1);
      expect(dto.generosMusical).toHaveLength(1);
      expect(dto.estilosPintura).toHaveLength(1);
    });

    it('debe crear vacío', () => {
      const dto = PreferenciasDTO.vacio();

      expect(dto.interesesArtisticos).toHaveLength(0);
      expect(dto.generosMusical).toHaveLength(0);
      expect(dto.estilosPintura).toHaveLength(0);
    });

    it('debe crear con estilos opcionales', () => {
      const dto = PreferenciasDTO.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      expect(dto.estilosPintura).toHaveLength(0);
    });
  });

  describe('Validación', () => {
    it('debe validar cuando tiene intereses y géneros', () => {
      const dto = PreferenciasDTO.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      expect(dto.esValido()).toBe(true);
    });

    it('debe ser inválido sin intereses', () => {
      const dto = PreferenciasDTO.crear([], [GeneroMusical.Rock]);

      expect(dto.esValido()).toBe(false);
    });

    it('debe ser inválido sin géneros', () => {
      const dto = PreferenciasDTO.crear([CategoriaInteres.Dibujo], []);

      expect(dto.esValido()).toBe(false);
    });

    it('debe ser inválido si ambos están vacíos', () => {
      const dto = PreferenciasDTO.vacio();

      expect(dto.esValido()).toBe(false);
    });

    it('debe no estar vacío con cualquier preferencia', () => {
      const dto1 = PreferenciasDTO.crear([CategoriaInteres.Dibujo], []);
      const dto2 = PreferenciasDTO.crear([], [GeneroMusical.Rock]);
      const dto3 = PreferenciasDTO.crear([], [], [EstiloPintura.Realismo]);

      expect(dto1.noEstaVacio()).toBe(true);
      expect(dto2.noEstaVacio()).toBe(true);
      expect(dto3.noEstaVacio()).toBe(true);
    });

    it('debe estar vacío si todo está vacío', () => {
      const dto = PreferenciasDTO.vacio();

      expect(dto.noEstaVacio()).toBe(false);
    });
  });

  describe('Serialización JSON', () => {
    it('debe convertir a JSON', () => {
      const dto = PreferenciasDTO.crear(
        [CategoriaInteres.Dibujo, CategoriaInteres.Escultura],
        [GeneroMusical.Rock, GeneroMusical.Pop],
        [EstiloPintura.Realismo]
      );

      const json = dto.toJSON();

      expect(json.interesesArtisticos).toHaveLength(2);
      expect(json.generosMusical).toHaveLength(2);
      expect(json.estilosPintura).toHaveLength(1);
    });

    it('debe ser compatible con JSON.stringify', () => {
      const dto = PreferenciasDTO.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      const stringified = JSON.stringify(dto);
      const parsed = JSON.parse(stringified);

      expect(parsed.interesesArtisticos).toContain(CategoriaInteres.Dibujo);
      expect(parsed.generosMusical).toContain(GeneroMusical.Rock);
    });

    it('debe recuperarse desde JSON', () => {
      const original = PreferenciasDTO.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock],
        [EstiloPintura.Realismo]
      );

      const json = original.toJSON();
      const recuperado = PreferenciasDTO.fromJSON(json);

      expect(recuperado.interesesArtisticos).toEqual(original.interesesArtisticos);
      expect(recuperado.generosMusical).toEqual(original.generosMusical);
      expect(recuperado.estilosPintura).toEqual(original.estilosPintura);
    });

    it('debe manejar JSON incompleto', () => {
      const json = { interesesArtisticos: [CategoriaInteres.Dibujo] };
      const dto = PreferenciasDTO.fromJSON(json);

      expect(dto.interesesArtisticos).toHaveLength(1);
      expect(dto.generosMusical).toHaveLength(0);
      expect(dto.estilosPintura).toHaveLength(0);
    });

    it('debe rechazar entrada inválida en fromJSON', () => {
      expect(() => PreferenciasDTO.fromJSON(null)).toThrow();
      expect(() => PreferenciasDTO.fromJSON(undefined)).toThrow();
      expect(() => PreferenciasDTO.fromJSON('string')).toThrow();
    });
  });

  describe('Métodos auxiliares', () => {
    it('debe contar total de preferencias', () => {
      const dto = PreferenciasDTO.crear(
        [CategoriaInteres.Dibujo, CategoriaInteres.Escultura],
        [GeneroMusical.Rock],
        [EstiloPintura.Realismo, EstiloPintura.Abstraccion]
      );

      expect(dto.totalPreferencias()).toBe(5);
    });

    it('debe encontrar categoría en intereses', () => {
      const dto = PreferenciasDTO.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      expect(dto.tieneCategoria(CategoriaInteres.Dibujo)).toBe(true);
      expect(dto.tieneCategoria(CategoriaInteres.Escultura)).toBe(false);
    });

    it('debe encontrar categoría en géneros', () => {
      const dto = PreferenciasDTO.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      expect(dto.tieneCategoria(GeneroMusical.Rock)).toBe(true);
      expect(dto.tieneCategoria(GeneroMusical.Pop)).toBe(false);
    });

    it('debe encontrar categoría en estilos', () => {
      const dto = PreferenciasDTO.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock],
        [EstiloPintura.Realismo]
      );

      expect(dto.tieneCategoria(EstiloPintura.Realismo)).toBe(true);
      expect(dto.tieneCategoria(EstiloPintura.Abstraccion)).toBe(false);
    });

    it('debe generar resumen texto', () => {
      const dto = PreferenciasDTO.crear(
        [CategoriaInteres.Dibujo, CategoriaInteres.Escultura],
        [GeneroMusical.Rock],
        [EstiloPintura.Realismo]
      );

      const resumen = dto.resumen();
      expect(resumen).toContain('2');
      expect(resumen).toContain('1');
      expect(resumen).toContain('intereses');
      expect(resumen).toContain('géneros');
      expect(resumen).toContain('estilos');
    });
  });

  describe('Propiedades readonly', () => {
    it('debe tener propiedades readonly', () => {
      const dto = PreferenciasDTO.crear(
        [CategoriaInteres.Dibujo],
        [GeneroMusical.Rock]
      );

      // Intentar modificar debe fallar en TypeScript, pero en runtime no
      // por lo que verificamos que existen
      expect(dto.interesesArtisticos).toBeDefined();
      expect(dto.generosMusical).toBeDefined();
      expect(dto.estilosPintura).toBeDefined();
    });
  });
});
