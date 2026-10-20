import { describe, it, expect } from 'vitest';
import { MapeadorFormularioRecuperacion } from '../../../src/application/recuperacion/mappers/MapeadorFormularioRecuperacion';
import { DTOFormularioRecuperacion } from '../../../src/application/recuperacion/dtos/DTOFormularioRecuperacion';
import { SolicitudRecuperacion } from '../../../src/domain/recuperacion/entities/SolicitudRecuperacion';

describe('MapeadorFormularioRecuperacion', () => {
  describe('aDominio() - DTO a Dominio', () => {
    it('debería mapear DTO vacío a SolicitudRecuperacion vacía', () => {
      const dto: DTOFormularioRecuperacion = {
        correo: '',
        tocado: false,
        errores: {}
      };

      const solicitud = MapeadorFormularioRecuperacion.aDominio(dto);

      expect(solicitud).toBeInstanceOf(SolicitudRecuperacion);
      expect(solicitud.obtenerCorreo()).toBe('');
      expect(solicitud.estaTocado()).toBe(false);
      expect(solicitud.tieneErrores()).toBe(false);
    });

    it('debería mapear DTO con correo y tocado', () => {
      const dto: DTOFormularioRecuperacion = {
        correo: 'usuario@example.com',
        tocado: true,
        errores: {}
      };

      const solicitud = MapeadorFormularioRecuperacion.aDominio(dto);

      expect(solicitud.obtenerCorreo()).toBe('usuario@example.com');
      expect(solicitud.estaTocado()).toBe(true);
      expect(solicitud.tieneErrores()).toBe(false);
    });

    it('debería mapear DTO con errores', () => {
      const dto: DTOFormularioRecuperacion = {
        correo: 'usuario@invalido',
        tocado: true,
        errores: {
          correo: 'Correo inválido',
          otro: 'Otro error'
        }
      };

      const solicitud = MapeadorFormularioRecuperacion.aDominio(dto);

      expect(solicitud.obtenerCorreo()).toBe('usuario@invalido');
      expect(solicitud.estaTocado()).toBe(true);
      expect(solicitud.obtenerError('correo')).toBe('Correo inválido');
      expect(solicitud.obtenerError('otro')).toBe('Otro error');
      expect(solicitud.tieneErrores()).toBe(true);
    });

    it('debería preservar todos los datos del DTO sin modificaciones', () => {
      const dto: DTOFormularioRecuperacion = {
        correo: '  usuario@example.com  ',
        tocado: false,
        errores: { campo1: 'Error 1', campo2: 'Error 2' }
      };

      const solicitud = MapeadorFormularioRecuperacion.aDominio(dto);

      expect(solicitud.obtenerCorreo()).toBe('  usuario@example.com  ');
      expect(solicitud.estaTocado()).toBe(false);
    });
  });

  describe('aDTO() - Dominio a DTO', () => {
    it('debería mapear SolicitudRecuperacion vacía a DTO vacío', () => {
      const solicitud = new SolicitudRecuperacion();

      const dto = MapeadorFormularioRecuperacion.aDTO(solicitud);

      expect(dto.correo).toBe('');
      expect(dto.tocado).toBe(false);
      expect(dto.errores).toEqual({});
    });

    it('debería mapear SolicitudRecuperacion con correo y tocado', () => {
      const solicitud = new SolicitudRecuperacion('usuario@example.com', true);

      const dto = MapeadorFormularioRecuperacion.aDTO(solicitud);

      expect(dto.correo).toBe('usuario@example.com');
      expect(dto.tocado).toBe(true);
      expect(dto.errores).toEqual({});
    });

    it('debería mapear SolicitudRecuperacion con errores', () => {
      const solicitud = new SolicitudRecuperacion('usuario@invalido', true)
        .agregarError('correo', 'Correo inválido');

      const dto = MapeadorFormularioRecuperacion.aDTO(solicitud);

      expect(dto.correo).toBe('usuario@invalido');
      expect(dto.tocado).toBe(true);
      expect(dto.errores).toEqual({ correo: 'Correo inválido' });
    });
  });

  describe('Mapeo bidireccional (DTO ↔ Dominio)', () => {
    it('debería mapear DTO → Dominio → DTO sin pérdida de datos', () => {
      const dtoOriginal: DTOFormularioRecuperacion = {
        correo: 'usuario@example.com',
        tocado: true,
        errores: { correo: 'Error' }
      };

      const solicitud = MapeadorFormularioRecuperacion.aDominio(dtoOriginal);
      const dtoMapeado = MapeadorFormularioRecuperacion.aDTO(solicitud);

      expect(dtoMapeado).toEqual(dtoOriginal);
    });

    it('debería mapear Dominio → DTO → Dominio preservando estado', () => {
      const solicitudOriginal = new SolicitudRecuperacion('usuario@example.com', true)
        .agregarError('correo', 'Inválido');

      const dto = MapeadorFormularioRecuperacion.aDTO(solicitudOriginal);
      const solicitudMapeada = MapeadorFormularioRecuperacion.aDominio(dto);

      expect(solicitudMapeada.obtenerCorreo()).toBe(solicitudOriginal.obtenerCorreo());
      expect(solicitudMapeada.estaTocado()).toBe(solicitudOriginal.estaTocado());
      expect(solicitudMapeada.obtenerError('correo')).toBe(solicitudOriginal.obtenerError('correo'));
    });
  });
});
