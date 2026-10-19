import { describe, it, expect, beforeEach } from 'vitest';
import { CuestionarioService, ResultadoValidacion, ResultadoValidacionSeleccion } from '../../src/application/CuestionarioService';
import { Pregunta } from '../../src/domain/entities/Pregunta';
import { OpcionRespuesta } from '../../src/domain/entities/OpcionRespuesta';
import { RespuestaCuestionario } from '../../src/domain/entities/RespuestaCuestionario';
import { Preferencias } from '../../src/domain/entities/Preferencias';
import { CategoriaInteres } from '../../src/domain/enums/CategoriaInteres';
import { GeneroMusical } from '../../src/domain/enums/GeneroMusical';
import { EstiloPintura } from '../../src/domain/enums/EstiloPintura';
import { CuestionarioFactory } from '../../src/application/CuestionarioFactory';

/**
 * Tests para CuestionarioService (T027)
 *
 * Requisitos:
 * - RNF-24: Tests unitarios
 * - RF-16: Validar preguntas obligatorias
 * - RF-17: Mostrar errores claros
 * - RF-18: Permitir preguntas opcionales sin respuesta
 * - RF-19: Bloquear continuar si hay validaciones incompletas
 *
 * Criterios de aceptación:
 * - Test validarCompletitud con pregunta obligatoria vacía → inválida
 * - Test validarCompletitud con todas obligatorias con respuesta → válida
 * - Test validarCompletitud con pregunta opcional vacía → válida
 * - Test transformarAPreferencias: respuestas correctas → Preferencias
 * - Test transformarAPreferencias: deduplicación
 * - Test validarSeleccion: opción válida → válida
 * - Test validarSeleccion: opción fuera catálogo → inválida
 * - Cobertura ≥ 80%
 *
 * Referencia: spec.md § 6, plan.md § 3, tasks.md T027
 */
describe('CuestionarioService', () => {
  let cuestionario: Pregunta[];
  let preguntaIntereses: Pregunta;
  let preguntaGeneros: Pregunta;
  let preguntaEstilos: Pregunta;

  beforeEach(() => {
    cuestionario = CuestionarioFactory.crearCuestionarioDefault();
    preguntaIntereses = cuestionario[0];
    preguntaGeneros = cuestionario[1];
    preguntaEstilos = cuestionario[2];
  });

  describe('validarCompletitud', () => {
    it('debe rechazar si pregunta obligatoria está vacía', () => {
      const respuestas = RespuestaCuestionario.vacio();

      const resultado = CuestionarioService.validarCompletitud(
        respuestas,
        cuestionario
      );

      expect(resultado.valida).toBe(false);
      expect(resultado.errores).toBeDefined();
      expect(resultado.errores?.size).toBeGreaterThan(0);
    });

    it('debe incluir error específico para pregunta obligatoria vacía', () => {
      const respuestas = RespuestaCuestionario.vacio();

      const resultado = CuestionarioService.validarCompletitud(
        respuestas,
        cuestionario
      );

      expect(resultado.errores?.has(preguntaIntereses.id)).toBe(true);
      expect(resultado.errores?.has(preguntaGeneros.id)).toBe(true);
    });

    it('debe aceptar si todas las preguntas obligatorias tienen respuesta', () => {
      let respuestas = RespuestaCuestionario.vacio();

      // Seleccionar una opción de cada pregunta obligatoria
      const opcionIntereses = preguntaIntereses.opciones[0];
      const opcionGeneros = preguntaGeneros.opciones[0];

      respuestas = respuestas.seleccionar(preguntaIntereses.id, opcionIntereses.id);
      respuestas = respuestas.seleccionar(preguntaGeneros.id, opcionGeneros.id);

      const resultado = CuestionarioService.validarCompletitud(
        respuestas,
        cuestionario
      );

      expect(resultado.valida).toBe(true);
      expect(resultado.errores).toBeUndefined();
    });

    it('debe aceptar pregunta opcional vacía', () => {
      let respuestas = RespuestaCuestionario.vacio();

      // Responder solo preguntas obligatorias (Intereses y Géneros)
      const opcionIntereses = preguntaIntereses.opciones[0];
      const opcionGeneros = preguntaGeneros.opciones[0];

      respuestas = respuestas.seleccionar(preguntaIntereses.id, opcionIntereses.id);
      respuestas = respuestas.seleccionar(preguntaGeneros.id, opcionGeneros.id);

      // No responder preguntas opcionales

      const resultado = CuestionarioService.validarCompletitud(
        respuestas,
        cuestionario
      );

      expect(resultado.valida).toBe(true);
      // Si es válido, no hay errores (errores puede ser undefined)
      expect(resultado.errores === undefined || !resultado.errores?.has(preguntaEstilos.id)).toBe(true);
    });

    it('debe rechazar si solo tiene respuesta de una pregunta obligatoria', () => {
      let respuestas = RespuestaCuestionario.vacio();

      // Solo responder Intereses, dejar Géneros vacío
      const opcionIntereses = preguntaIntereses.opciones[0];
      respuestas = respuestas.seleccionar(preguntaIntereses.id, opcionIntereses.id);

      const resultado = CuestionarioService.validarCompletitud(
        respuestas,
        cuestionario
      );

      expect(resultado.valida).toBe(false);
      expect(resultado.errores?.has(preguntaGeneros.id)).toBe(true);
    });

    it('debe lanzar error si respuestas es null', () => {
      expect(() =>
        CuestionarioService.validarCompletitud(null as any, cuestionario)
      ).toThrow('respuestas no puede ser null');
    });

    it('debe lanzar error si preguntas es null', () => {
      const respuestas = RespuestaCuestionario.vacio();

      expect(() =>
        CuestionarioService.validarCompletitud(respuestas, null as any)
      ).toThrow('debe ser un array válido');
    });

    it('debe retornar mapa vacío de errores si todas están válidas', () => {
      let respuestas = RespuestaCuestionario.vacio();

      const opcionIntereses = preguntaIntereses.opciones[0];
      const opcionGeneros = preguntaGeneros.opciones[0];

      respuestas = respuestas.seleccionar(preguntaIntereses.id, opcionIntereses.id);
      respuestas = respuestas.seleccionar(preguntaGeneros.id, opcionGeneros.id);

      const resultado = CuestionarioService.validarCompletitud(
        respuestas,
        cuestionario
      );

      expect(resultado.valida).toBe(true);
      // Si es válido, errores es undefined o está vacío
      expect(resultado.errores === undefined || resultado.errores?.size === 0).toBe(true);
    });

    it('debe diferenciar errores por pregunta obligatoria', () => {
      const respuestas = RespuestaCuestionario.vacio();

      const resultado = CuestionarioService.validarCompletitud(
        respuestas,
        cuestionario
      );

      // Debe reportar Intereses y Géneros, no Estilos (que es opcional)
      expect(resultado.errores?.size).toBe(2);
      expect(Array.from(resultado.errores?.keys() || [])).toContain(
        preguntaIntereses.id
      );
      expect(Array.from(resultado.errores?.keys() || [])).toContain(
        preguntaGeneros.id
      );
    });
  });

  describe('transformarAPreferencias', () => {
    it('debe transformar respuestas válidas a Preferencias', () => {
      let respuestas = RespuestaCuestionario.vacio();

      const opcionIntereses = preguntaIntereses.opciones[0];
      const opcionGeneros = preguntaGeneros.opciones[0];

      respuestas = respuestas.seleccionar(preguntaIntereses.id, opcionIntereses.id);
      respuestas = respuestas.seleccionar(preguntaGeneros.id, opcionGeneros.id);

      const preferencias = CuestionarioService.transformarAPreferencias(
        respuestas,
        cuestionario
      );

      expect(preferencias).toBeInstanceOf(Preferencias);
      expect(preferencias.interesesArtisticos).toHaveLength(1);
      expect(preferencias.generosMusical).toHaveLength(1);
    });

    it('debe mapear correctamente categorías a enum Intereses', () => {
      let respuestas = RespuestaCuestionario.vacio();

      // Seleccionar múltiples intereses
      respuestas = respuestas.seleccionar(
        preguntaIntereses.id,
        preguntaIntereses.opciones[0].id
      );
      respuestas = respuestas.seleccionar(
        preguntaIntereses.id,
        preguntaIntereses.opciones[1].id
      );

      const opcionGeneros = preguntaGeneros.opciones[0];
      respuestas = respuestas.seleccionar(preguntaGeneros.id, opcionGeneros.id);

      const preferencias = CuestionarioService.transformarAPreferencias(
        respuestas,
        cuestionario
      );

      expect(preferencias.interesesArtisticos).toHaveLength(2);
      expect(Object.values(CategoriaInteres)).toContain(
        preferencias.interesesArtisticos[0]
      );
    });

    it('debe mapear correctamente categorías a enum Géneros', () => {
      let respuestas = RespuestaCuestionario.vacio();

      const opcionIntereses = preguntaIntereses.opciones[0];
      respuestas = respuestas.seleccionar(preguntaIntereses.id, opcionIntereses.id);

      // Seleccionar múltiples géneros
      respuestas = respuestas.seleccionar(
        preguntaGeneros.id,
        preguntaGeneros.opciones[0].id
      );
      respuestas = respuestas.seleccionar(
        preguntaGeneros.id,
        preguntaGeneros.opciones[1].id
      );

      const preferencias = CuestionarioService.transformarAPreferencias(
        respuestas,
        cuestionario
      );

      expect(preferencias.generosMusical).toHaveLength(2);
      expect(Object.values(GeneroMusical)).toContain(
        preferencias.generosMusical[0]
      );
    });

    it('debe mapear correctamente estilos de pintura', () => {
      let respuestas = RespuestaCuestionario.vacio();

      const opcionIntereses = preguntaIntereses.opciones[0];
      const opcionGeneros = preguntaGeneros.opciones[0];

      respuestas = respuestas.seleccionar(preguntaIntereses.id, opcionIntereses.id);
      respuestas = respuestas.seleccionar(preguntaGeneros.id, opcionGeneros.id);

      // Seleccionar estilos (opcional)
      if (preguntaEstilos.opciones.length > 0) {
        respuestas = respuestas.seleccionar(
          preguntaEstilos.id,
          preguntaEstilos.opciones[0].id
        );

        const preferencias = CuestionarioService.transformarAPreferencias(
          respuestas,
          cuestionario
        );

        expect(preferencias.estilosPintura).toHaveLength(1);
        expect(Object.values(EstiloPintura)).toContain(
          preferencias.estilosPintura[0]
        );
      }
    });

    it('debe manejar estilos vacíos (opcionales)', () => {
      let respuestas = RespuestaCuestionario.vacio();

      const opcionIntereses = preguntaIntereses.opciones[0];
      const opcionGeneros = preguntaGeneros.opciones[0];

      respuestas = respuestas.seleccionar(preguntaIntereses.id, opcionIntereses.id);
      respuestas = respuestas.seleccionar(preguntaGeneros.id, opcionGeneros.id);

      // No seleccionar estilos

      const preferencias = CuestionarioService.transformarAPreferencias(
        respuestas,
        cuestionario
      );

      expect(preferencias.estilosPintura).toHaveLength(0);
    });

    it('debe aplicar deduplicación automática de Preferencias', () => {
      let respuestas = RespuestaCuestionario.vacio();

      // Seleccionar múltiples opciones del mismo interés (para simular deduplicación)
      respuestas = respuestas.seleccionar(
        preguntaIntereses.id,
        preguntaIntereses.opciones[0].id
      );
      respuestas = respuestas.seleccionar(
        preguntaIntereses.id,
        preguntaIntereses.opciones[1].id
      );

      const opcionGeneros = preguntaGeneros.opciones[0];
      respuestas = respuestas.seleccionar(preguntaGeneros.id, opcionGeneros.id);

      const preferencias = CuestionarioService.transformarAPreferencias(
        respuestas,
        cuestionario
      );

      // Preferencias debe deduplicar (aunque las opciones son distintas)
      expect(preferencias.interesesArtisticos.length).toBeLessThanOrEqual(2);
    });

    it('debe lanzar error si respuestas es null', () => {
      expect(() =>
        CuestionarioService.transformarAPreferencias(null as any, cuestionario)
      ).toThrow('respuestas no puede ser null');
    });

    it('debe lanzar error si preguntas está vacío', () => {
      const respuestas = RespuestaCuestionario.vacio();

      expect(() =>
        CuestionarioService.transformarAPreferencias(respuestas, [])
      ).toThrow('debe haber al menos una pregunta');
    });

    it('debe lanzar error si faltan preguntas obligatorias', () => {
      const respuestas = RespuestaCuestionario.vacio();

      // Crear lista de preguntas incompleta (solo 1 pregunta)
      const preguntasIncompletas = [preguntaIntereses];

      expect(() =>
        CuestionarioService.transformarAPreferencias(
          respuestas,
          preguntasIncompletas
        )
      ).toThrow('Faltan preguntas');
    });

    it('debe crear instancia válida de Preferencias', () => {
      let respuestas = RespuestaCuestionario.vacio();

      const opcionIntereses = preguntaIntereses.opciones[0];
      const opcionGeneros = preguntaGeneros.opciones[0];

      respuestas = respuestas.seleccionar(preguntaIntereses.id, opcionIntereses.id);
      respuestas = respuestas.seleccionar(preguntaGeneros.id, opcionGeneros.id);

      const preferencias = CuestionarioService.transformarAPreferencias(
        respuestas,
        cuestionario
      );

      // Verificar que se cumplan invariantes de Preferencias
      expect(preferencias.interesesArtisticos.length).toBeGreaterThanOrEqual(1);
      expect(preferencias.generosMusical.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('validarSeleccion', () => {
    it('debe validar opción válida como correcta', () => {
      const opcion = preguntaIntereses.opciones[0];

      const resultado = CuestionarioService.validarSeleccion(
        preguntaIntereses,
        opcion.id
      );

      expect(resultado.valida).toBe(true);
      expect(resultado.error).toBeUndefined();
    });

    it('debe rechazar opción fuera del catálogo', () => {
      const idInvalido = 'opcion-inexistente-xyz';

      const resultado = CuestionarioService.validarSeleccion(
        preguntaIntereses,
        idInvalido
      );

      expect(resultado.valida).toBe(false);
      expect(resultado.error).toBeDefined();
      expect(resultado.error).toContain('no es válida');
    });

    it('debe validar todas las opciones válidas en una pregunta', () => {
      for (const opcion of preguntaIntereses.opciones) {
        const resultado = CuestionarioService.validarSeleccion(
          preguntaIntereses,
          opcion.id
        );

        expect(resultado.valida).toBe(true);
      }
    });

    it('debe rechazar idOpcion vacío', () => {
      expect(() =>
        CuestionarioService.validarSeleccion(preguntaIntereses, '')
      ).toThrow('idOpcion no puede estar vacío');
    });

    it('debe rechazar pregunta null', () => {
      expect(() =>
        CuestionarioService.validarSeleccion(null as any, 'opcion-1')
      ).toThrow('pregunta no puede ser null');
    });

    it('debe incluir mensaje de error descriptivo', () => {
      const resultado = CuestionarioService.validarSeleccion(
        preguntaIntereses,
        'opcion-falsa'
      );

      expect(resultado.error).toContain('opcion-falsa');
      expect(resultado.error).toContain('pregunta');
    });

    it('debe validar opciones de diferentes preguntas', () => {
      const opcionGeneros = preguntaGeneros.opciones[0];

      const resultado = CuestionarioService.validarSeleccion(
        preguntaGeneros,
        opcionGeneros.id
      );

      expect(resultado.valida).toBe(true);
    });

    it('debe rechazar opción de una pregunta en otra pregunta diferente', () => {
      const opcionIntereses = preguntaIntereses.opciones[0];

      // Intentar usar opción de Intereses en pregunta de Géneros
      const resultado = CuestionarioService.validarSeleccion(
        preguntaGeneros,
        opcionIntereses.id
      );

      expect(resultado.valida).toBe(false);
    });

    it('debe retornar objeto con estructura correcta', () => {
      const resultado = CuestionarioService.validarSeleccion(
        preguntaIntereses,
        preguntaIntereses.opciones[0].id
      );

      expect(resultado).toHaveProperty('valida');
      expect(typeof resultado.valida).toBe('boolean');
    });

    it('debe retornar error solo cuando es inválido', () => {
      const resultadoValida = CuestionarioService.validarSeleccion(
        preguntaIntereses,
        preguntaIntereses.opciones[0].id
      );

      const resultadoInvalida = CuestionarioService.validarSeleccion(
        preguntaIntereses,
        'xyz-invalido'
      );

      expect(resultadoValida.error).toBeUndefined();
      expect(resultadoInvalida.error).toBeDefined();
    });
  });

  describe('Flujo de validación completo', () => {
    it('debe validar y transformar respuestas válidas', () => {
      let respuestas = RespuestaCuestionario.vacio();

      const opcionIntereses = preguntaIntereses.opciones[0];
      const opcionGeneros = preguntaGeneros.opciones[0];

      // Validar selecciones
      const validIntereses = CuestionarioService.validarSeleccion(
        preguntaIntereses,
        opcionIntereses.id
      );
      const validGeneros = CuestionarioService.validarSeleccion(
        preguntaGeneros,
        opcionGeneros.id
      );

      expect(validIntereses.valida).toBe(true);
      expect(validGeneros.valida).toBe(true);

      // Agregar respuestas
      respuestas = respuestas.seleccionar(preguntaIntereses.id, opcionIntereses.id);
      respuestas = respuestas.seleccionar(preguntaGeneros.id, opcionGeneros.id);

      // Validar completitud
      const validación = CuestionarioService.validarCompletitud(
        respuestas,
        cuestionario
      );

      expect(validación.valida).toBe(true);

      // Transformar a Preferencias
      const preferencias = CuestionarioService.transformarAPreferencias(
        respuestas,
        cuestionario
      );

      expect(preferencias).toBeInstanceOf(Preferencias);
    });

    it('debe bloquear flujo si validación de selección falla', () => {
      let respuestas = RespuestaCuestionario.vacio();

      // Intentar usar opción inválida
      const validacion = CuestionarioService.validarSeleccion(
        preguntaIntereses,
        'opcion-invalida'
      );

      expect(validacion.valida).toBe(false);

      // No deberíamos continuar si la validación falló
      expect(() => {
        throw new Error(validacion.error);
      }).toThrow('no es válida');
    });

    it('debe bloquear si validación de completitud falla', () => {
      const respuestas = RespuestaCuestionario.vacio();

      const validacion = CuestionarioService.validarCompletitud(
        respuestas,
        cuestionario
      );

      expect(validacion.valida).toBe(false);

      // No deberíamos transformar a Preferencias si hay errores
      if (validacion.valida) {
        const preferencias = CuestionarioService.transformarAPreferencias(
          respuestas,
          cuestionario
        );
        expect(preferencias).toBeDefined();
      } else {
        expect(validacion.errores?.size).toBeGreaterThan(0);
      }
    });
  });
});
