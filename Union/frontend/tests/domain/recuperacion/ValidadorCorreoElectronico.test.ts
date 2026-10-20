import { describe, it, expect } from 'vitest';
import { ValidadorCorreoElectronico } from '../../../src/domain/recuperacion/services/ValidadorCorreoElectronico';

describe('ValidadorCorreoElectronico', () => {
  describe('Factory method crear()', () => {
    it('debería crear una instancia de ValidadorCorreoElectronico', () => {
      const validador = ValidadorCorreoElectronico.crear();

      expect(validador).toBeInstanceOf(ValidadorCorreoElectronico);
    });
  });

  describe('validar() - Correo vacío', () => {
    it('debería rechazar correo vacío', () => {
      const validador = ValidadorCorreoElectronico.crear();
      const resultado = validador.validar('');

      expect(resultado.esValido).toBe(false);
      expect(resultado.error).toBe('El correo electrónico es requerido');
    });

    it('debería rechazar correo solo con espacios', () => {
      const validador = ValidadorCorreoElectronico.crear();
      const resultado = validador.validar('   ');

      expect(resultado.esValido).toBe(false);
      expect(resultado.error).toBe('El correo electrónico es requerido');
    });

    it('debería rechazar correo solo con tabs y espacios', () => {
      const validador = ValidadorCorreoElectronico.crear();
      const resultado = validador.validar('\t  \t');

      expect(resultado.esValido).toBe(false);
      expect(resultado.error).toBe('El correo electrónico es requerido');
    });
  });

  describe('validar() - Formato inválido', () => {
    it('debería rechazar correo sin @', () => {
      const validador = ValidadorCorreoElectronico.crear();
      const resultado = validador.validar('usuarioexample.com');

      expect(resultado.esValido).toBe(false);
      expect(resultado.error).toBe('Ingresa un correo electrónico válido');
    });

    it('debería rechazar correo sin punto en dominio', () => {
      const validador = ValidadorCorreoElectronico.crear();
      const resultado = validador.validar('usuario@examplecom');

      expect(resultado.esValido).toBe(false);
      expect(resultado.error).toBe('Ingresa un correo electrónico válido');
    });

    it('debería rechazar correo con espacios en medio', () => {
      const validador = ValidadorCorreoElectronico.crear();
      const resultado = validador.validar('usuario @example.com');

      expect(resultado.esValido).toBe(false);
      expect(resultado.error).toBe('Ingresa un correo electrónico válido');
    });

    it('debería rechazar correo con @ doble', () => {
      const validador = ValidadorCorreoElectronico.crear();
      const resultado = validador.validar('usuario@@example.com');

      expect(resultado.esValido).toBe(false);
      expect(resultado.error).toBe('Ingresa un correo electrónico válido');
    });

    it('debería aceptar correo con punto en usuario (según regex)', () => {
      const validador = ValidadorCorreoElectronico.crear();
      const resultado = validador.validar('.usuario@example.com');

      expect(resultado.esValido).toBe(true);
      expect(resultado.error).toBeUndefined();
    });
  });

  describe('validar() - Formato válido', () => {
    it('debería aceptar correo válido simple', () => {
      const validador = ValidadorCorreoElectronico.crear();
      const resultado = validador.validar('usuario@example.com');

      expect(resultado.esValido).toBe(true);
      expect(resultado.error).toBeUndefined();
    });

    it('debería aceptar correo válido con números', () => {
      const validador = ValidadorCorreoElectronico.crear();
      const resultado = validador.validar('usuario123@example456.com');

      expect(resultado.esValido).toBe(true);
      expect(resultado.error).toBeUndefined();
    });

    it('debería aceptar correo válido con punto en usuario', () => {
      const validador = ValidadorCorreoElectronico.crear();
      const resultado = validador.validar('usuario.nombre@example.com');

      expect(resultado.esValido).toBe(true);
      expect(resultado.error).toBeUndefined();
    });

    it('debería aceptar correo válido con dominio de dos niveles', () => {
      const validador = ValidadorCorreoElectronico.crear();
      const resultado = validador.validar('usuario@empresa.co.uk');

      expect(resultado.esValido).toBe(true);
      expect(resultado.error).toBeUndefined();
    });

    it('debería aceptar correo válido con espacios al inicio/final (después de trim)', () => {
      const validador = ValidadorCorreoElectronico.crear();
      const resultado = validador.validar('  usuario@example.com  ');

      expect(resultado.esValido).toBe(true);
      expect(resultado.error).toBeUndefined();
    });
  });

  describe('esFormatoValido()', () => {
    it('debería retornar true para formato válido', () => {
      const validador = ValidadorCorreoElectronico.crear();

      expect(validador.esFormatoValido('usuario@example.com')).toBe(true);
    });

    it('debería retornar false para formato inválido', () => {
      const validador = ValidadorCorreoElectronico.crear();

      expect(validador.esFormatoValido('usuario@examplecom')).toBe(false);
    });
  });

  describe('esValido()', () => {
    it('debería retornar true para correo válido', () => {
      const validador = ValidadorCorreoElectronico.crear();

      expect(validador.esValido('usuario@example.com')).toBe(true);
    });

    it('debería retornar false para correo vacío', () => {
      const validador = ValidadorCorreoElectronico.crear();

      expect(validador.esValido('')).toBe(false);
    });

    it('debería retornar false para correo con solo espacios', () => {
      const validador = ValidadorCorreoElectronico.crear();

      expect(validador.esValido('   ')).toBe(false);
    });

    it('debería retornar false para correo con formato inválido', () => {
      const validador = ValidadorCorreoElectronico.crear();

      expect(validador.esValido('usuario@examplecom')).toBe(false);
    });
  });
});
