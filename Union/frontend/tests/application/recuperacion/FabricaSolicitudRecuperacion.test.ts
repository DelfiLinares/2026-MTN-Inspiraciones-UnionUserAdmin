import { describe, it, expect } from 'vitest';
import { FabricaSolicitudRecuperacion } from '../../../src/application/recuperacion/factories/FabricaSolicitudRecuperacion';
import { SolicitudRecuperacion } from '../../../src/domain/recuperacion/entities/SolicitudRecuperacion';

describe('FabricaSolicitudRecuperacion', () => {
  describe('crear()', () => {
    it('debería crear una solicitud vacía', () => {
      const solicitud = FabricaSolicitudRecuperacion.crear();

      expect(solicitud).toBeInstanceOf(SolicitudRecuperacion);
      expect(solicitud.obtenerCorreo()).toBe('');
      expect(solicitud.estaTocado()).toBe(false);
      expect(solicitud.tieneErrores()).toBe(false);
    });

    it('debería crear instancias diferentes cada vez', () => {
      const solicitud1 = FabricaSolicitudRecuperacion.crear();
      const solicitud2 = FabricaSolicitudRecuperacion.crear();

      expect(solicitud1).not.toBe(solicitud2);
    });
  });

  describe('desdeCorreo()', () => {
    it('debería crear una solicitud con correo inicial', () => {
      const correo = 'usuario@example.com';
      const solicitud = FabricaSolicitudRecuperacion.desdeCorreo(correo);

      expect(solicitud).toBeInstanceOf(SolicitudRecuperacion);
      expect(solicitud.obtenerCorreo()).toBe(correo);
      expect(solicitud.estaTocado()).toBe(false);
      expect(solicitud.tieneErrores()).toBe(false);
    });

    it('debería preservar el correo exacto proporcionado', () => {
      const correo = '  usuario.nombre@empresa.co.uk  ';
      const solicitud = FabricaSolicitudRecuperacion.desdeCorreo(correo);

      expect(solicitud.obtenerCorreo()).toBe(correo);
    });

    it('debería crear instancias independientes con diferentes correos', () => {
      const solicitud1 = FabricaSolicitudRecuperacion.desdeCorreo('usuario1@example.com');
      const solicitud2 = FabricaSolicitudRecuperacion.desdeCorreo('usuario2@example.com');

      expect(solicitud1.obtenerCorreo()).toBe('usuario1@example.com');
      expect(solicitud2.obtenerCorreo()).toBe('usuario2@example.com');
      expect(solicitud1).not.toBe(solicitud2);
    });
  });

  describe('conError()', () => {
    it('debería crear una solicitud con correo y error', () => {
      const correo = 'usuario@example.com';
      const error = 'Correo inválido';
      const solicitud = FabricaSolicitudRecuperacion.conError(correo, error);

      expect(solicitud).toBeInstanceOf(SolicitudRecuperacion);
      expect(solicitud.obtenerCorreo()).toBe(correo);
      expect(solicitud.estaTocado()).toBe(true);
      expect(solicitud.obtenerError('correo')).toBe(error);
      expect(solicitud.tieneErrores()).toBe(true);
    });

    it('debería establecer tocado=true', () => {
      const solicitud = FabricaSolicitudRecuperacion.conError('usuario@example.com', 'Error');

      expect(solicitud.estaTocado()).toBe(true);
    });

    it('debería preservar el mensaje de error exacto', () => {
      const errorComplejo = 'Error específico: este correo ya está registrado en el sistema';
      const solicitud = FabricaSolicitudRecuperacion.conError('usuario@example.com', errorComplejo);

      expect(solicitud.obtenerError('correo')).toBe(errorComplejo);
    });
  });

  describe('reiniciar()', () => {
    it('debería crear una solicitud limpia', () => {
      const solicitud = FabricaSolicitudRecuperacion.reiniciar();

      expect(solicitud).toBeInstanceOf(SolicitudRecuperacion);
      expect(solicitud.obtenerCorreo()).toBe('');
      expect(solicitud.estaTocado()).toBe(false);
      expect(solicitud.tieneErrores()).toBe(false);
    });

    it('debería ser equivalente a crear()', () => {
      const creada = FabricaSolicitudRecuperacion.crear();
      const reiniciada = FabricaSolicitudRecuperacion.reiniciar();

      expect(creada.obtenerCorreo()).toBe(reiniciada.obtenerCorreo());
      expect(creada.estaTocado()).toBe(reiniciada.estaTocado());
      expect(creada.tieneErrores()).toBe(reiniciada.tieneErrores());
    });
  });
});
