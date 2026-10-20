import { describe, it, expect } from 'vitest';
import { ErrorCorreoInvalido } from '../../../src/domain/recuperacion/errors/ErrorCorreoInvalido';

describe('ErrorCorreoInvalido', () => {
  describe('Instanciación', () => {
    it('debería crear una instancia de ErrorCorreoInvalido', () => {
      const error = new ErrorCorreoInvalido('Correo inválido');

      expect(error).toBeInstanceOf(ErrorCorreoInvalido);
    });

    it('debería crear una instancia que hereda de Error', () => {
      const error = new ErrorCorreoInvalido('Correo inválido');

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('Propiedades', () => {
    it('debería tener una propiedad name con valor ErrorCorreoInvalido', () => {
      const error = new ErrorCorreoInvalido('Correo inválido');

      expect(error.name).toBe('ErrorCorreoInvalido');
    });

    it('debería tener una propiedad message con el mensaje proporcionado', () => {
      const mensaje = 'Correo electrónico no es válido';
      const error = new ErrorCorreoInvalido(mensaje);

      expect(error.message).toBe(mensaje);
    });

    it('debería preservar el mensaje exacto sin modificaciones', () => {
      const mensaje = 'Error específico: formato inválido, contiene caracteres no permitidos';
      const error = new ErrorCorreoInvalido(mensaje);

      expect(error.message).toBe(mensaje);
    });
  });

  describe('Herencia y compatibilidad', () => {
    it('debería poder ser capturado como Error en un catch', () => {
      const error = new ErrorCorreoInvalido('Correo inválido');
      let capturado = false;

      try {
        throw error;
      } catch (e) {
        if (e instanceof Error) {
          capturado = true;
        }
      }

      expect(capturado).toBe(true);
    });

    it('debería poder ser capturado específicamente como ErrorCorreoInvalido', () => {
      const error = new ErrorCorreoInvalido('Correo inválido');
      let capturado = false;

      try {
        throw error;
      } catch (e) {
        if (e instanceof ErrorCorreoInvalido) {
          capturado = true;
        }
      }

      expect(capturado).toBe(true);
    });

    it('debería mantener la cadena de prototipo correcta', () => {
      const error = new ErrorCorreoInvalido('Correo inválido');

      expect(Object.getPrototypeOf(error)).toHaveProperty('constructor');
      expect(error.constructor.name).toBe('ErrorCorreoInvalido');
    });
  });

  describe('Funcionalidad de logging', () => {
    it('debería poder ser convertido a string con toString()', () => {
      const error = new ErrorCorreoInvalido('Correo inválido');
      const stringificado = error.toString();

      expect(stringificado).toContain('ErrorCorreoInvalido');
      expect(stringificado).toContain('Correo inválido');
    });

    it('debería ser serializable en JSON.stringify()', () => {
      const error = new ErrorCorreoInvalido('Correo inválido');
      const stringificado = JSON.stringify(error);

      // Aunque Error objects no se serializan perfectamente, debería ser string
      expect(typeof stringificado).toBe('string');
    });
  });
});
