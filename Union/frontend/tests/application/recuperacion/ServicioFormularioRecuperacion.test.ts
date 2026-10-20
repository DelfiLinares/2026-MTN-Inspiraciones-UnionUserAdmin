import { describe, it, expect, beforeEach } from 'vitest';
import { ServicioFormularioRecuperacion } from '../../../src/application/recuperacion/services/ServicioFormularioRecuperacion';
import { ValidadorCorreoElectronico } from '../../../src/domain/recuperacion/services/ValidadorCorreoElectronico';
import { SolicitudRecuperacion } from '../../../src/domain/recuperacion/entities/SolicitudRecuperacion';

describe('ServicioFormularioRecuperacion', () => {
  let servicio: ServicioFormularioRecuperacion;
  let validador: ValidadorCorreoElectronico;

  beforeEach(() => {
    validador = ValidadorCorreoElectronico.crear();
    servicio = new ServicioFormularioRecuperacion(validador);
  });

  describe('Constructor e inyección de dependencias', () => {
    it('debería crear una instancia con validador inyectado', () => {
      const nuevoValidador = ValidadorCorreoElectronico.crear();
      const nuevoServicio = new ServicioFormularioRecuperacion(nuevoValidador);

      expect(nuevoServicio).toBeInstanceOf(ServicioFormularioRecuperacion);
    });

    it('debería usar el validador inyectado', () => {
      const solicitud = new SolicitudRecuperacion();
      const resultado = servicio.validarCorreo(solicitud);

      expect(resultado.obtenerError('correo')).toBe('El correo electrónico es requerido');
    });
  });

  describe('Factory method crear()', () => {
    it('debería crear una instancia con validador por defecto', () => {
      const servicioCreado = ServicioFormularioRecuperacion.crear();

      expect(servicioCreado).toBeInstanceOf(ServicioFormularioRecuperacion);
    });
  });

  describe('validarCorreo()', () => {
    it('debería retornar solicitud con error para correo vacío', () => {
      const solicitud = new SolicitudRecuperacion();
      const resultado = servicio.validarCorreo(solicitud);

      expect(resultado.obtenerError('correo')).toBe('El correo electrónico es requerido');
      expect(resultado.estaTocado()).toBe(true);
      expect(resultado.tieneErrores()).toBe(true);
    });

    it('debería retornar solicitud con error para formato inválido', () => {
      const solicitud = new SolicitudRecuperacion('usuario@invalido');
      const resultado = servicio.validarCorreo(solicitud);

      expect(resultado.obtenerError('correo')).toBe('Ingresa un correo electrónico válido');
      expect(resultado.estaTocado()).toBe(true);
    });

    it('debería retornar solicitud sin errores para correo válido', () => {
      const solicitud = new SolicitudRecuperacion('usuario@example.com');
      const resultado = servicio.validarCorreo(solicitud);

      expect(resultado.obtenerError('correo')).toBeUndefined();
      expect(resultado.estaTocado()).toBe(true);
      expect(resultado.tieneErrores()).toBe(false);
    });

    it('debería establecer tocado=true al validar', () => {
      const solicitud = new SolicitudRecuperacion('usuario@example.com', false);
      const resultado = servicio.validarCorreo(solicitud);

      expect(resultado.estaTocado()).toBe(true);
    });

    it('debería limpiar errores previos si correo es válido', () => {
      const solicitud = new SolicitudRecuperacion('usuario@example.com').agregarError('correo', 'Viejo error');
      const resultado = servicio.validarCorreo(solicitud);

      expect(resultado.obtenerError('correo')).toBeUndefined();
    });
  });

  describe('manejarCambioCorreo()', () => {
    it('debería actualizar el correo', () => {
      const solicitud = new SolicitudRecuperacion('viejo@example.com');
      const resultado = servicio.manejarCambioCorreo(solicitud, 'nuevo@example.com');

      expect(resultado.obtenerCorreo()).toBe('nuevo@example.com');
    });

    it('debería retornar nueva instancia', () => {
      const solicitud = new SolicitudRecuperacion('usuario@example.com');
      const resultado = servicio.manejarCambioCorreo(solicitud, 'otro@example.com');

      expect(resultado).not.toBe(solicitud);
      expect(solicitud.obtenerCorreo()).toBe('usuario@example.com');
    });

    it('debería limpiar errores si está tocado y correo no es vacío', () => {
      const solicitud = new SolicitudRecuperacion('usuario@invalido', true)
        .agregarError('correo', 'Inválido');
      const resultado = servicio.manejarCambioCorreo(solicitud, 'nuevo@example.com');

      expect(resultado.obtenerError('correo')).toBeUndefined();
    });

    it('debería no limpiar errores si no está tocado', () => {
      const solicitud = new SolicitudRecuperacion('usuario@invalido', false)
        .agregarError('correo', 'Inválido');
      const resultado = servicio.manejarCambioCorreo(solicitud, 'nuevo@example.com');

      expect(resultado.obtenerError('correo')).toBe('Inválido');
    });

    it('debería no limpiar errores si correo es vacío', () => {
      const solicitud = new SolicitudRecuperacion('usuario@invalido', true)
        .agregarError('correo', 'Inválido');
      const resultado = servicio.manejarCambioCorreo(solicitud, '');

      expect(resultado.obtenerError('correo')).toBe('Inválido');
    });
  });

  describe('manejarBlurCorreo()', () => {
    it('debería validar el correo cuando se pierde el foco', () => {
      const solicitud = new SolicitudRecuperacion('usuario@invalido');
      const resultado = servicio.manejarBlurCorreo(solicitud);

      expect(resultado.obtenerError('correo')).toBe('Ingresa un correo electrónico válido');
    });

    it('debería establecer tocado=true', () => {
      const solicitud = new SolicitudRecuperacion('usuario@example.com', false);
      const resultado = servicio.manejarBlurCorreo(solicitud);

      expect(resultado.estaTocado()).toBe(true);
    });

    it('debería limpiar errores si correo es válido', () => {
      const solicitud = new SolicitudRecuperacion('usuario@example.com')
        .agregarError('correo', 'Error previo');
      const resultado = servicio.manejarBlurCorreo(solicitud);

      expect(resultado.obtenerError('correo')).toBeUndefined();
    });
  });

  describe('prepararParaEnvio()', () => {
    it('debería retornar esValido=true para correo válido', () => {
      const solicitud = new SolicitudRecuperacion('usuario@example.com');
      const resultado = servicio.prepararParaEnvio(solicitud);

      expect(resultado.esValido).toBe(true);
      expect(resultado.solicitud.tieneErrores()).toBe(false);
    });

    it('debería retornar esValido=false para correo inválido', () => {
      const solicitud = new SolicitudRecuperacion('usuario@invalido');
      const resultado = servicio.prepararParaEnvio(solicitud);

      expect(resultado.esValido).toBe(false);
      expect(resultado.solicitud.tieneErrores()).toBe(true);
    });

    it('debería retornar esValido=false para correo vacío', () => {
      const solicitud = new SolicitudRecuperacion();
      const resultado = servicio.prepararParaEnvio(solicitud);

      expect(resultado.esValido).toBe(false);
      expect(resultado.solicitud.obtenerError('correo')).toBe('El correo electrónico es requerido');
    });

    it('debería retornar solicitud validada y tocada', () => {
      const solicitud = new SolicitudRecuperacion('usuario@example.com');
      const resultado = servicio.prepararParaEnvio(solicitud);

      expect(resultado.solicitud.estaTocado()).toBe(true);
      expect(resultado.solicitud.obtenerCorreo()).toBe('usuario@example.com');
    });

    it('debería retornar esValido=false si hay múltiples errores', () => {
      const solicitud = new SolicitudRecuperacion('usuario@invalido')
        .agregarError('otro', 'Otro error');
      const resultado = servicio.prepararParaEnvio(solicitud);

      expect(resultado.esValido).toBe(false);
    });
  });
});
