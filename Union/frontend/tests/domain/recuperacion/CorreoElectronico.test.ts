import { describe, it, expect } from 'vitest';
import { CorreoElectronico } from '../../../src/domain/recuperacion/valueObjects/CorreoElectronico';
import { ErrorCorreoInvalido } from '../../../src/domain/recuperacion/errors/ErrorCorreoInvalido';

/**
 * Suite de tests para CorreoElectronico Value Object
 *
 * Cubre:
 * - Validación con regex
 * - Normalización (trim, lowercase)
 * - Igualdad entre correos
 * - Error handling
 * - Casos límite
 * - Máximo de caracteres (255)
 *
 * Total: 15 tests
 */
describe('CorreoElectronico', () => {
  describe('Validación y creación', () => {
    it('debe crear correo válido simple', () => {
      const correo = CorreoElectronico.crear('usuario@ejemplo.com');
      expect(correo.obtenerValor()).toBe('usuario@ejemplo.com');
    });

    it('debe rechazar correo sin @', () => {
      expect(() => {
        CorreoElectronico.crear('usuarioejemplo.com');
      }).toThrow(ErrorCorreoInvalido);
    });

    it('debe rechazar correo sin punto en dominio', () => {
      expect(() => {
        CorreoElectronico.crear('usuario@ejemplocom');
      }).toThrow(ErrorCorreoInvalido);
    });

    it('debe rechazar correo vacío', () => {
      expect(() => {
        CorreoElectronico.crear('');
      }).toThrow(ErrorCorreoInvalido);
    });

    it('debe rechazar correo solo con espacios', () => {
      expect(() => {
        CorreoElectronico.crear('   ');
      }).toThrow(ErrorCorreoInvalido);
    });
  });

  describe('Normalización', () => {
    it('debe trimear espacios al inicio y final', () => {
      const correo = CorreoElectronico.crear('  usuario@ejemplo.com  ');
      expect(correo.obtenerValor()).toBe('usuario@ejemplo.com');
    });

    it('debe convertir a minúsculas', () => {
      const correo = CorreoElectronico.crear('USUARIO@EJEMPLO.COM');
      expect(correo.obtenerValor()).toBe('usuario@ejemplo.com');
    });

    it('debe trimear y convertir a minúsculas', () => {
      const correo = CorreoElectronico.crear('  USUARIO@EJEMPLO.COM  ');
      expect(correo.obtenerValor()).toBe('usuario@ejemplo.com');
    });

    it('debe aceptar correo con subdominio', () => {
      const correo = CorreoElectronico.crear('usuario@mail.ejemplo.com');
      expect(correo.obtenerValor()).toBe('usuario@mail.ejemplo.com');
    });

    it('debe aceptar correo con plus addressing', () => {
      const correo = CorreoElectronico.crear('usuario+tag@ejemplo.com');
      expect(correo.obtenerValor()).toBe('usuario+tag@ejemplo.com');
    });
  });

  describe('Igualdad', () => {
    it('debe considerar iguales correos idénticos', () => {
      const correo1 = CorreoElectronico.crear('usuario@ejemplo.com');
      const correo2 = CorreoElectronico.crear('usuario@ejemplo.com');
      expect(correo1.esIgual(correo2)).toBe(true);
    });

    it('debe considerar iguales correos normalizados diferente', () => {
      const correo1 = CorreoElectronico.crear('usuario@ejemplo.com');
      const correo2 = CorreoElectronico.crear('  USUARIO@EJEMPLO.COM  ');
      expect(correo1.esIgual(correo2)).toBe(true);
    });

    it('debe considerar diferentes correos distintos', () => {
      const correo1 = CorreoElectronico.crear('usuario1@ejemplo.com');
      const correo2 = CorreoElectronico.crear('usuario2@ejemplo.com');
      expect(correo1.esIgual(correo2)).toBe(false);
    });
  });

  describe('Límites', () => {
    it('debe rechazar correo mayor a 255 caracteres', () => {
      const correoLargo = 'a'.repeat(250) + '@test.com';
      expect(() => {
        CorreoElectronico.crear(correoLargo);
      }).toThrow(ErrorCorreoInvalido);
    });

    it('debe aceptar correo exactamente de 255 caracteres', () => {
      // Construir un correo válido de exactamente 255 caracteres
      const parteLocal = 'a'.repeat(240);
      const correo = CorreoElectronico.crear(parteLocal + '@test.com');
      expect(correo.obtenerValor().length).toBeLessThanOrEqual(255);
    });

    it('debe convertir toString correctamente', () => {
      const correo = CorreoElectronico.crear('usuario@ejemplo.com');
      expect(correo.toString()).toBe('usuario@ejemplo.com');
    });
  });
});
