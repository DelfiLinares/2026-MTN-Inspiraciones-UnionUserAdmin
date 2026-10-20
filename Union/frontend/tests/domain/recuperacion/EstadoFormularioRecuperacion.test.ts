import { describe, it, expect } from 'vitest';
import { EstadoFormularioRecuperacion } from '../../../src/domain/recuperacion/valueObjects/EstadoFormularioRecuperacion';

describe('EstadoFormularioRecuperacion', () => {
  describe('Factory methods', () => {
    it('debería crear un estado de reposo sin mensaje', () => {
      const estado = EstadoFormularioRecuperacion.reposo();

      expect(estado).toBeDefined();
      expect(estado.esReposo()).toBe(true);
      expect(estado.obtenerMensaje()).toBeUndefined();
    });

    it('debería crear un estado de cargando sin mensaje', () => {
      const estado = EstadoFormularioRecuperacion.cargando();

      expect(estado).toBeDefined();
      expect(estado.esCargando()).toBe(true);
      expect(estado.obtenerMensaje()).toBeUndefined();
    });

    it('debería crear un estado de éxito sin mensaje', () => {
      const estado = EstadoFormularioRecuperacion.exito();

      expect(estado).toBeDefined();
      expect(estado.esExito()).toBe(true);
      expect(estado.obtenerMensaje()).toBeUndefined();
    });

    it('debería crear un estado de error con mensaje', () => {
      const mensaje = 'Ocurrió un error';
      const estado = EstadoFormularioRecuperacion.error(mensaje);

      expect(estado).toBeDefined();
      expect(estado.esError()).toBe(true);
      expect(estado.obtenerMensaje()).toBe(mensaje);
    });
  });

  describe('Predicados de estado', () => {
    it('esReposo() debería retornar true solo para estado reposo', () => {
      const reposo = EstadoFormularioRecuperacion.reposo();
      const cargando = EstadoFormularioRecuperacion.cargando();
      const exito = EstadoFormularioRecuperacion.exito();
      const error = EstadoFormularioRecuperacion.error('error');

      expect(reposo.esReposo()).toBe(true);
      expect(cargando.esReposo()).toBe(false);
      expect(exito.esReposo()).toBe(false);
      expect(error.esReposo()).toBe(false);
    });

    it('esCargando() debería retornar true solo para estado cargando', () => {
      const reposo = EstadoFormularioRecuperacion.reposo();
      const cargando = EstadoFormularioRecuperacion.cargando();
      const exito = EstadoFormularioRecuperacion.exito();
      const error = EstadoFormularioRecuperacion.error('error');

      expect(reposo.esCargando()).toBe(false);
      expect(cargando.esCargando()).toBe(true);
      expect(exito.esCargando()).toBe(false);
      expect(error.esCargando()).toBe(false);
    });

    it('esExito() debería retornar true solo para estado éxito', () => {
      const reposo = EstadoFormularioRecuperacion.reposo();
      const cargando = EstadoFormularioRecuperacion.cargando();
      const exito = EstadoFormularioRecuperacion.exito();
      const error = EstadoFormularioRecuperacion.error('error');

      expect(reposo.esExito()).toBe(false);
      expect(cargando.esExito()).toBe(false);
      expect(exito.esExito()).toBe(true);
      expect(error.esExito()).toBe(false);
    });

    it('esError() debería retornar true solo para estado error', () => {
      const reposo = EstadoFormularioRecuperacion.reposo();
      const cargando = EstadoFormularioRecuperacion.cargando();
      const exito = EstadoFormularioRecuperacion.exito();
      const error = EstadoFormularioRecuperacion.error('error');

      expect(reposo.esError()).toBe(false);
      expect(cargando.esError()).toBe(false);
      expect(exito.esError()).toBe(false);
      expect(error.esError()).toBe(true);
    });
  });

  describe('Manejo de mensajes', () => {
    it('debería retornar undefined para obtenerMensaje() en estado sin error', () => {
      const reposo = EstadoFormularioRecuperacion.reposo();
      const cargando = EstadoFormularioRecuperacion.cargando();
      const exito = EstadoFormularioRecuperacion.exito();

      expect(reposo.obtenerMensaje()).toBeUndefined();
      expect(cargando.obtenerMensaje()).toBeUndefined();
      expect(exito.obtenerMensaje()).toBeUndefined();
    });

    it('debería retornar el mensaje para obtenerMensaje() en estado error', () => {
      const mensaje = 'El correo no es válido';
      const error = EstadoFormularioRecuperacion.error(mensaje);

      expect(error.obtenerMensaje()).toBe(mensaje);
    });

    it('debería preservar el mensaje de error exactamente como fue proporcionado', () => {
      const mensajeComplejo = 'Error: Correo inválido. Por favor, verifica el formato.';
      const error = EstadoFormularioRecuperacion.error(mensajeComplejo);

      expect(error.obtenerMensaje()).toBe(mensajeComplejo);
    });
  });

  describe('Transiciones de estado', () => {
    it('debería permitir transición de reposo a cargando', () => {
      const reposo = EstadoFormularioRecuperacion.reposo();
      const cargando = EstadoFormularioRecuperacion.cargando();

      expect(reposo.esReposo()).toBe(true);
      expect(cargando.esCargando()).toBe(true);
    });

    it('debería permitir transición de cargando a exito', () => {
      const cargando = EstadoFormularioRecuperacion.cargando();
      const exito = EstadoFormularioRecuperacion.exito();

      expect(cargando.esCargando()).toBe(true);
      expect(exito.esExito()).toBe(true);
    });

    it('debería permitir transición de cargando a error', () => {
      const cargando = EstadoFormularioRecuperacion.cargando();
      const error = EstadoFormularioRecuperacion.error('Fallo en la solicitud');

      expect(cargando.esCargando()).toBe(true);
      expect(error.esError()).toBe(true);
    });
  });
});
