import { describe, it, expect } from 'vitest';
import { SolicitudRecuperacion } from '../../../src/domain/recuperacion/entities/SolicitudRecuperacion';

describe('SolicitudRecuperacion', () => {
  describe('Constructor e inicialización', () => {
    it('debería crear una solicitud vacía sin argumentos', () => {
      const solicitud = new SolicitudRecuperacion();

      expect(solicitud.obtenerCorreo()).toBe('');
      expect(solicitud.estaTocado()).toBe(false);
      expect(solicitud.tieneErrores()).toBe(false);
    });

    it('debería crear una solicitud con correo inicial', () => {
      const solicitud = new SolicitudRecuperacion('test@example.com');

      expect(solicitud.obtenerCorreo()).toBe('test@example.com');
      expect(solicitud.estaTocado()).toBe(false);
    });

    it('debería crear una solicitud con correo y tocado', () => {
      const solicitud = new SolicitudRecuperacion('test@example.com', true);

      expect(solicitud.obtenerCorreo()).toBe('test@example.com');
      expect(solicitud.estaTocado()).toBe(true);
    });
  });

  describe('Factory method crear()', () => {
    it('debería crear una solicitud vacía usando factory method', () => {
      const solicitud = SolicitudRecuperacion.crear();

      expect(solicitud.obtenerCorreo()).toBe('');
      expect(solicitud.estaTocado()).toBe(false);
      expect(solicitud.tieneErrores()).toBe(false);
    });
  });

  describe('Getters de correo', () => {
    it('obtenerCorreo() debería retornar el correo exacto', () => {
      const solicitud = new SolicitudRecuperacion('usuario@example.com');

      expect(solicitud.obtenerCorreo()).toBe('usuario@example.com');
    });

    it('obtenerCorreoTrimado() debería retornar el correo sin espacios', () => {
      const solicitud = new SolicitudRecuperacion('  usuario@example.com  ');

      expect(solicitud.obtenerCorreoTrimado()).toBe('usuario@example.com');
    });

    it('obtenerCorreoTrimado() debería manejar solo espacios al inicio', () => {
      const solicitud = new SolicitudRecuperacion('  usuario@example.com');

      expect(solicitud.obtenerCorreoTrimado()).toBe('usuario@example.com');
    });
  });

  describe('Setters de correo (inmutabilidad)', () => {
    it('establecerCorreo() debería retornar una nueva instancia', () => {
      const solicitud1 = new SolicitudRecuperacion('test1@example.com');
      const solicitud2 = solicitud1.establecerCorreo('test2@example.com');

      expect(solicitud1).not.toBe(solicitud2);
      expect(solicitud1.obtenerCorreo()).toBe('test1@example.com');
      expect(solicitud2.obtenerCorreo()).toBe('test2@example.com');
    });

    it('establecerCorreo() debería preservar el estado tocado', () => {
      const solicitud1 = new SolicitudRecuperacion('test1@example.com', true);
      const solicitud2 = solicitud1.establecerCorreo('test2@example.com');

      expect(solicitud2.estaTocado()).toBe(true);
    });

    it('establecerCorreo() debería preservar errores existentes', () => {
      const solicitud1 = new SolicitudRecuperacion('test1@example.com').agregarError('correo', 'Inválido');
      const solicitud2 = solicitud1.establecerCorreo('test2@example.com');

      expect(solicitud2.obtenerError('correo')).toBe('Inválido');
    });
  });

  describe('Setters de tocado (inmutabilidad)', () => {
    it('establecerTocado() debería retornar una nueva instancia', () => {
      const solicitud1 = new SolicitudRecuperacion('test@example.com', false);
      const solicitud2 = solicitud1.establecerTocado(true);

      expect(solicitud1).not.toBe(solicitud2);
      expect(solicitud1.estaTocado()).toBe(false);
      expect(solicitud2.estaTocado()).toBe(true);
    });

    it('establecerTocado() debería preservar el correo', () => {
      const solicitud1 = new SolicitudRecuperacion('test@example.com');
      const solicitud2 = solicitud1.establecerTocado(true);

      expect(solicitud2.obtenerCorreo()).toBe('test@example.com');
    });

    it('establecerTocado() debería preservar errores', () => {
      const solicitud1 = new SolicitudRecuperacion().agregarError('correo', 'Inválido');
      const solicitud2 = solicitud1.establecerTocado(true);

      expect(solicitud2.obtenerError('correo')).toBe('Inválido');
    });
  });

  describe('Manejo de errores', () => {
    it('agregarError() debería retornar una nueva instancia', () => {
      const solicitud1 = new SolicitudRecuperacion('test@example.com');
      const solicitud2 = solicitud1.agregarError('correo', 'Correo inválido');

      expect(solicitud1).not.toBe(solicitud2);
      expect(solicitud1.obtenerError('correo')).toBeUndefined();
      expect(solicitud2.obtenerError('correo')).toBe('Correo inválido');
    });

    it('agregarError() debería permitir múltiples errores', () => {
      const solicitud = new SolicitudRecuperacion()
        .agregarError('correo', 'Inválido')
        .agregarError('otro', 'Error');

      expect(solicitud.obtenerError('correo')).toBe('Inválido');
      expect(solicitud.obtenerError('otro')).toBe('Error');
      expect(solicitud.tieneErrores()).toBe(true);
    });

    it('tieneErrores() debería retornar false sin errores', () => {
      const solicitud = new SolicitudRecuperacion('test@example.com');

      expect(solicitud.tieneErrores()).toBe(false);
    });

    it('tieneErrores() debería retornar true con errores', () => {
      const solicitud = new SolicitudRecuperacion().agregarError('correo', 'Inválido');

      expect(solicitud.tieneErrores()).toBe(true);
    });

    it('limpiarErrores() debería retornar una nueva instancia sin errores', () => {
      const solicitud1 = new SolicitudRecuperacion('test@example.com').agregarError('correo', 'Inválido');
      const solicitud2 = solicitud1.limpiarErrores();

      expect(solicitud1).not.toBe(solicitud2);
      expect(solicitud1.tieneErrores()).toBe(true);
      expect(solicitud2.tieneErrores()).toBe(false);
    });

    it('limpiarErrores() debería preservar correo y tocado', () => {
      const solicitud1 = new SolicitudRecuperacion('test@example.com', true).agregarError('correo', 'Inválido');
      const solicitud2 = solicitud1.limpiarErrores();

      expect(solicitud2.obtenerCorreo()).toBe('test@example.com');
      expect(solicitud2.estaTocado()).toBe(true);
    });
  });

  describe('Reinicio', () => {
    it('reiniciar() debería retornar una nueva instancia limpia', () => {
      const solicitud1 = new SolicitudRecuperacion('test@example.com', true)
        .agregarError('correo', 'Inválido');
      const solicitud2 = solicitud1.reiniciar();

      expect(solicitud1).not.toBe(solicitud2);
      expect(solicitud2.obtenerCorreo()).toBe('');
      expect(solicitud2.estaTocado()).toBe(false);
      expect(solicitud2.tieneErrores()).toBe(false);
    });
  });

  describe('Encadenamiento de métodos', () => {
    it('debería permitir encadenar múltiples operaciones', () => {
      const solicitud = new SolicitudRecuperacion()
        .establecerCorreo('test@example.com')
        .establecerTocado(true)
        .agregarError('correo', 'Inválido');

      expect(solicitud.obtenerCorreo()).toBe('test@example.com');
      expect(solicitud.estaTocado()).toBe(true);
      expect(solicitud.obtenerError('correo')).toBe('Inválido');
    });

    it('debería permitir encadenar establecerCorreo múltiples veces', () => {
      const solicitud = new SolicitudRecuperacion()
        .establecerCorreo('test1@example.com')
        .establecerCorreo('test2@example.com')
        .establecerCorreo('test3@example.com');

      expect(solicitud.obtenerCorreo()).toBe('test3@example.com');
    });

    it('debería permitir agregar error, limpiar y agregar otro', () => {
      const solicitud = new SolicitudRecuperacion('test@example.com')
        .agregarError('correo', 'Error 1')
        .limpiarErrores()
        .agregarError('otro', 'Error 2');

      expect(solicitud.obtenerError('correo')).toBeUndefined();
      expect(solicitud.obtenerError('otro')).toBe('Error 2');
    });
  });
});
