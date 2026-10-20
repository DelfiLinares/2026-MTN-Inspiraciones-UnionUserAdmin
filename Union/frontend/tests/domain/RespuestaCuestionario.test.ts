import { describe, it, expect, beforeEach } from 'vitest';
import { RespuestaCuestionario } from '../../src/domain/entities/RespuestaCuestionario';
import { Pregunta } from '../../src/domain/entities/Pregunta';
import { OpcionRespuesta } from '../../src/domain/entities/OpcionRespuesta';
import { CategoriaInteres } from '../../src/domain/enums/CategoriaInteres';
import { GeneroMusical } from '../../src/domain/enums/GeneroMusical';
import { EstiloPintura } from '../../src/domain/enums/EstiloPintura';

/**
 * Tests de conservación de estado para RespuestaCuestionario (T034)
 *
 * Requisitos:
 * - RNF-24: Tests unitarios
 * - RF-13, RF-14, RF-15: Conservación y validación de estado
 * - RNF-20, RNF-21: Inmutabilidad
 *
 * Criterios de aceptación:
 * - Test seleccionar retorna nueva instancia
 * - Test deseleccionar retorna nueva instancia
 * - Test cambiar pregunta A no afecta pregunta B
 * - Test obtenerRespuesta retorna Set correcto
 * - Test validarCompletitud valida todas preguntas
 * - Cobertura ≥ 80%
 * - Todos pasan
 *
 * Referencia: spec.md § 4, plan.md § 4, data-model.md § 1.3, tasks.md § T034
 */
describe('RespuestaCuestionario', () => {
  let pregunta1: Pregunta;
  let pregunta2: Pregunta;
  let pregunta3: Pregunta;

  beforeEach(() => {
    // Crear preguntas para testing
    const opciones1 = [
      OpcionRespuesta.crear('interes-1', CategoriaInteres.Dibujo, 'Dibujo'),
      OpcionRespuesta.crear('interes-2', CategoriaInteres.Escultura, 'Escultura'),
      OpcionRespuesta.crear('interes-3', CategoriaInteres.Fotografia, 'Fotografía'),
    ];

    pregunta1 = Pregunta.crear(
      'pregunta-1',
      '¿Qué intereses artísticos tienes?',
      opciones1,
      true, // permiteMultipleSelecciones
      true // obligatoria
    );

    const opciones2 = [
      OpcionRespuesta.crear('genero-1', GeneroMusical.Rock, 'Rock'),
      OpcionRespuesta.crear('genero-2', GeneroMusical.Pop, 'Pop'),
    ];

    pregunta2 = Pregunta.crear(
      'pregunta-2',
      '¿Qué géneros musicales te gustan?',
      opciones2,
      true,
      true // también obligatoria
    );

    const opciones3 = [
      OpcionRespuesta.crear('estilo-1', EstiloPintura.Realismo, 'Realismo'),
      OpcionRespuesta.crear('estilo-2', EstiloPintura.Abstraccion, 'Abstracción'),
    ];

    pregunta3 = Pregunta.crear(
      'pregunta-3',
      '¿Qué estilos de pintura te interesan?',
      opciones3,
      true,
      false // opcional
    );
  });

  describe('Creación y estado inicial', () => {
    it('debe crear instancia vacía correctamente', () => {
      const respuestas = RespuestaCuestionario.vacio();

      expect(respuestas).toBeInstanceOf(RespuestaCuestionario);
      expect(respuestas.contarRespuestas()).toBe(0);
    });

    it('debe crear instancia con factory método', () => {
      const respuestas = RespuestaCuestionario.crear();

      expect(respuestas).toBeInstanceOf(RespuestaCuestionario);
      expect(respuestas.contarRespuestas()).toBe(0);
    });

    it('debe inicializar con Map vacío si no se pasa parámetro', () => {
      const respuestas = RespuestaCuestionario.vacio();
      const todas = respuestas.obtenerTodas();

      expect(todas.size).toBe(0);
    });
  });

  describe('Inmutabilidad - Seleccionar', () => {
    it('seleccionar debe retornar nueva instancia (no mutar original)', () => {
      const respuestas1 = RespuestaCuestionario.vacio();
      const respuestas2 = respuestas1.seleccionar('pregunta-1', 'interes-1');

      // Deben ser instancias diferentes
      expect(respuestas1).not.toBe(respuestas2);

      // Original debe seguir vacío
      expect(respuestas1.contarRespuestas()).toBe(0);
      expect(respuestas1.tieneRespuesta('pregunta-1')).toBe(false);

      // Nueva debe tener la respuesta
      expect(respuestas2.contarRespuestas()).toBe(1);
      expect(respuestas2.tieneRespuesta('pregunta-1')).toBe(true);
    });

    it('seleccionar opción múltiple retorna nueva instancia', () => {
      const respuestas1 = RespuestaCuestionario.vacio();
      const respuestas2 = respuestas1.seleccionar('pregunta-1', 'interes-1');
      const respuestas3 = respuestas2.seleccionar('pregunta-1', 'interes-2');

      // Todas deben ser instancias diferentes
      expect(respuestas1).not.toBe(respuestas2);
      expect(respuestas2).not.toBe(respuestas3);

      // Verificar estados
      expect(respuestas1.contarRespuestas()).toBe(0);
      expect(respuestas2.contarRespuestas()).toBe(1);
      expect(respuestas3.contarRespuestas()).toBe(1); // Misma pregunta

      // Verificar contenido
      const opciones3 = respuestas3.obtenerRespuesta('pregunta-1');
      expect(opciones3.size).toBe(2);
      expect(opciones3.has('interes-1')).toBe(true);
      expect(opciones3.has('interes-2')).toBe(true);
    });

    it('seleccionar validar que IDs no vacíos', () => {
      const respuestas = RespuestaCuestionario.vacio();

      expect(() => respuestas.seleccionar('', 'opcion-1')).toThrow();
      expect(() => respuestas.seleccionar('pregunta-1', '')).toThrow();
      expect(() => respuestas.seleccionar('   ', 'opcion-1')).toThrow();
    });
  });

  describe('Inmutabilidad - Deseleccionar', () => {
    it('deseleccionar debe retornar nueva instancia (no mutar original)', () => {
      const respuestas1 = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1')
        .seleccionar('pregunta-1', 'interes-2');

      const respuestas2 = respuestas1.deseleccionar('pregunta-1', 'interes-1');

      // Deben ser instancias diferentes
      expect(respuestas1).not.toBe(respuestas2);

      // Original debe mantener ambas opciones
      const opciones1 = respuestas1.obtenerRespuesta('pregunta-1');
      expect(opciones1.size).toBe(2);

      // Nueva debe tener solo una
      const opciones2 = respuestas2.obtenerRespuesta('pregunta-1');
      expect(opciones2.size).toBe(1);
      expect(opciones2.has('interes-2')).toBe(true);
      expect(opciones2.has('interes-1')).toBe(false);
    });

    it('deseleccionar última opción debe limpiar pregunta', () => {
      const respuestas1 = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1');

      const respuestas2 = respuestas1.deseleccionar('pregunta-1', 'interes-1');

      // Respuesta original debe tener la opción
      expect(respuestas1.tieneRespuesta('pregunta-1')).toBe(true);

      // Respuesta nueva debe estar limpia
      expect(respuestas2.tieneRespuesta('pregunta-1')).toBe(false);
      expect(respuestas2.contarRespuestas()).toBe(0);
    });

    it('deseleccionar opción inexistente debe ignorar', () => {
      const respuestas1 = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1');

      const respuestas2 = respuestas1.deseleccionar('pregunta-1', 'interes-2');

      // Debe mantener interes-1
      const opciones = respuestas2.obtenerRespuesta('pregunta-1');
      expect(opciones.size).toBe(1);
      expect(opciones.has('interes-1')).toBe(true);
    });

    it('deseleccionar validar que IDs no vacíos', () => {
      const respuestas = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1');

      expect(() => respuestas.deseleccionar('', 'interes-1')).toThrow();
      expect(() => respuestas.deseleccionar('pregunta-1', '')).toThrow();
    });
  });

  describe('Independencia entre preguntas', () => {
    it('cambiar pregunta A no debe afectar pregunta B', () => {
      const respuestas1 = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1')
        .seleccionar('pregunta-2', 'genero-1');

      // Cambiar pregunta 1
      const respuestas2 = respuestas1.deseleccionar('pregunta-1', 'interes-1');

      // Pregunta 1 debe cambiar
      expect(respuestas2.tieneRespuesta('pregunta-1')).toBe(false);

      // Pregunta 2 debe mantenerse igual
      expect(respuestas2.tieneRespuesta('pregunta-2')).toBe(true);
      const opcionesP2 = respuestas2.obtenerRespuesta('pregunta-2');
      expect(opcionesP2.has('genero-1')).toBe(true);
    });

    it('cada pregunta mantiene su propio Set de opciones', () => {
      const respuestas = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1')
        .seleccionar('pregunta-1', 'interes-2')
        .seleccionar('pregunta-2', 'genero-1')
        .seleccionar('pregunta-3', 'estilo-1');

      const opcionesP1 = respuestas.obtenerRespuesta('pregunta-1');
      const opcionesP2 = respuestas.obtenerRespuesta('pregunta-2');
      const opcionesP3 = respuestas.obtenerRespuesta('pregunta-3');

      expect(opcionesP1.size).toBe(2);
      expect(opcionesP2.size).toBe(1);
      expect(opcionesP3.size).toBe(1);

      expect(opcionesP1.has('interes-1')).toBe(true);
      expect(opcionesP1.has('interes-2')).toBe(true);

      expect(opcionesP2.has('genero-1')).toBe(true);

      expect(opcionesP3.has('estilo-1')).toBe(true);
    });

    it('selecciones paralelas en múltiples preguntas son independientes', () => {
      let respuestas = RespuestaCuestionario.vacio();

      // Agregar opciones en diferentes preguntas
      respuestas = respuestas.seleccionar('pregunta-1', 'interes-1');
      respuestas = respuestas.seleccionar('pregunta-2', 'genero-1');
      respuestas = respuestas.seleccionar('pregunta-3', 'estilo-1');
      respuestas = respuestas.seleccionar('pregunta-1', 'interes-2');

      // Remover de pregunta-1
      respuestas = respuestas.deseleccionar('pregunta-1', 'interes-1');

      // Verificar que pregunta-1 tiene solo interes-2
      const opcionesP1 = respuestas.obtenerRespuesta('pregunta-1');
      expect(opcionesP1.size).toBe(1);
      expect(opcionesP1.has('interes-2')).toBe(true);

      // Pero pregunta-2 y pregunta-3 se mantienen intactas
      const opcionesP2 = respuestas.obtenerRespuesta('pregunta-2');
      const opcionesP3 = respuestas.obtenerRespuesta('pregunta-3');
      expect(opcionesP2.has('genero-1')).toBe(true);
      expect(opcionesP3.has('estilo-1')).toBe(true);
    });
  });

  describe('obtenerRespuesta', () => {
    it('obtenerRespuesta retorna Set correcto', () => {
      const respuestas = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1')
        .seleccionar('pregunta-1', 'interes-2');

      const opciones = respuestas.obtenerRespuesta('pregunta-1');

      expect(opciones).toBeInstanceOf(Set);
      expect(opciones.size).toBe(2);
      expect(opciones.has('interes-1')).toBe(true);
      expect(opciones.has('interes-2')).toBe(true);
    });

    it('obtenerRespuesta retorna Set vacío si pregunta sin respuesta', () => {
      const respuestas = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1');

      const opciones = respuestas.obtenerRespuesta('pregunta-2');

      expect(opciones).toBeInstanceOf(Set);
      expect(opciones.size).toBe(0);
    });

    it('obtenerRespuesta retorna copia defensiva (no permite mutar original)', () => {
      const respuestas = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1');

      const opciones1 = respuestas.obtenerRespuesta('pregunta-1');
      opciones1.add('interes-99'); // Intentar mutar

      const opciones2 = respuestas.obtenerRespuesta('pregunta-1');

      // Mutación no debe afectar respuestas originales
      expect(opciones2.has('interes-99')).toBe(false);
      expect(opciones2.size).toBe(1);
    });
  });

  describe('validarCompletitud', () => {
    it('validarCompletitud retorna valida=true con todas obligatorias respondidas', () => {
      const respuestas = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1')
        .seleccionar('pregunta-2', 'genero-1');

      const resultado = respuestas.validarCompletitud([pregunta1, pregunta2, pregunta3]);

      expect(resultado.valida).toBe(true);
      expect(resultado.errores).toBeUndefined();
    });

    it('validarCompletitud retorna errores si falta obligatoria', () => {
      const respuestas = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1');
      // No respondió pregunta-2 (obligatoria)

      const resultado = respuestas.validarCompletitud([pregunta1, pregunta2, pregunta3]);

      expect(resultado.valida).toBe(false);
      expect(resultado.errores).toBeDefined();
      expect(resultado.errores?.has('pregunta-2')).toBe(true);
    });

    it('validarCompletitud permite opcional sin respuesta', () => {
      const respuestas = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1')
        .seleccionar('pregunta-2', 'genero-1');
      // No respondió pregunta-3 (opcional)

      const resultado = respuestas.validarCompletitud([pregunta1, pregunta2, pregunta3]);

      expect(resultado.valida).toBe(true);
      expect(resultado.errores).toBeUndefined();
    });

    it('validarCompletitud valida todas las preguntas', () => {
      // Respuesta inválida: opción inexistente
      const respuestas = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-invalid') // No existe
        .seleccionar('pregunta-2', 'genero-1');

      const resultado = respuestas.validarCompletitud([pregunta1, pregunta2, pregunta3]);

      expect(resultado.valida).toBe(false);
      expect(resultado.errores).toBeDefined();
      expect(resultado.errores?.has('pregunta-1')).toBe(true);
    });

    it('validarCompletitud valida con múltiples errores', () => {
      const respuestas = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-invalid');
      // No respondió pregunta-2 (obligatoria)

      const resultado = respuestas.validarCompletitud([pregunta1, pregunta2, pregunta3]);

      expect(resultado.valida).toBe(false);
      expect(resultado.errores).toBeDefined();
      expect(resultado.errores?.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Métodos auxiliares', () => {
    it('contarRespuestas retorna número de preguntas respondidas', () => {
      let respuestas = RespuestaCuestionario.vacio();
      expect(respuestas.contarRespuestas()).toBe(0);

      respuestas = respuestas.seleccionar('pregunta-1', 'interes-1');
      expect(respuestas.contarRespuestas()).toBe(1);

      respuestas = respuestas.seleccionar('pregunta-1', 'interes-2');
      expect(respuestas.contarRespuestas()).toBe(1); // Misma pregunta

      respuestas = respuestas.seleccionar('pregunta-2', 'genero-1');
      expect(respuestas.contarRespuestas()).toBe(2);
    });

    it('tieneRespuesta retorna true si pregunta tiene respuestas', () => {
      const respuestas = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1');

      expect(respuestas.tieneRespuesta('pregunta-1')).toBe(true);
      expect(respuestas.tieneRespuesta('pregunta-2')).toBe(false);
    });

    it('limpiarPregunta retorna nueva instancia sin esa pregunta', () => {
      const respuestas1 = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1')
        .seleccionar('pregunta-2', 'genero-1');

      const respuestas2 = respuestas1.limpiarPregunta('pregunta-1');

      // Nuevas instancia
      expect(respuestas1).not.toBe(respuestas2);

      // Original intacta
      expect(respuestas1.tieneRespuesta('pregunta-1')).toBe(true);
      expect(respuestas1.tieneRespuesta('pregunta-2')).toBe(true);

      // Nueva sin pregunta-1
      expect(respuestas2.tieneRespuesta('pregunta-1')).toBe(false);
      expect(respuestas2.tieneRespuesta('pregunta-2')).toBe(true);
    });

    it('limpiar retorna nueva instancia vacía', () => {
      const respuestas1 = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1')
        .seleccionar('pregunta-2', 'genero-1');

      const respuestas2 = respuestas1.limpiar();

      // Nuevas instancia
      expect(respuestas1).not.toBe(respuestas2);

      // Original intacta
      expect(respuestas1.contarRespuestas()).toBe(2);

      // Nueva vacía
      expect(respuestas2.contarRespuestas()).toBe(0);
    });

    it('obtenerTodas retorna copia defensiva de todo', () => {
      const respuestas = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1')
        .seleccionar('pregunta-2', 'genero-1');

      const todas1 = respuestas.obtenerTodas();
      todas1.delete('pregunta-1'); // Intentar mutar

      const todas2 = respuestas.obtenerTodas();

      // Mutación no debe afectar
      expect(todas2.has('pregunta-1')).toBe(true);
      expect(todas2.size).toBe(2);
    });

    it('equals compara dos instancias correctamente', () => {
      const respuestas1 = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1')
        .seleccionar('pregunta-2', 'genero-1');

      const respuestas2 = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1')
        .seleccionar('pregunta-2', 'genero-1');

      const respuestas3 = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1');

      expect(respuestas1.equals(respuestas2)).toBe(true);
      expect(respuestas1.equals(respuestas3)).toBe(false);
      expect(respuestas1.equals(null as any)).toBe(false);
    });

    it('toString retorna representación legible', () => {
      const respuestas = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1')
        .seleccionar('pregunta-2', 'genero-1');

      const str = respuestas.toString();

      expect(str).toContain('RespuestaCuestionario');
      expect(str).toContain('2');
    });
  });

  describe('Cadenas de operaciones', () => {
    it('permite encadenar múltiples operaciones (method chaining)', () => {
      const respuestas = RespuestaCuestionario.vacio()
        .seleccionar('pregunta-1', 'interes-1')
        .seleccionar('pregunta-1', 'interes-2')
        .seleccionar('pregunta-2', 'genero-1')
        .deseleccionar('pregunta-1', 'interes-1')
        .seleccionar('pregunta-3', 'estilo-1');

      expect(respuestas.contarRespuestas()).toBe(3);

      const opcionesP1 = respuestas.obtenerRespuesta('pregunta-1');
      expect(opcionesP1.size).toBe(1);
      expect(opcionesP1.has('interes-2')).toBe(true);
    });

    it('cadena de operaciones mantiene inmutabilidad en cada paso', () => {
      const r1 = RespuestaCuestionario.vacio();
      const r2 = r1.seleccionar('p1', 'o1');
      const r3 = r2.seleccionar('p2', 'o1');
      const r4 = r3.deseleccionar('p1', 'o1');

      // Todas instancias diferentes
      expect(r1).not.toBe(r2);
      expect(r2).not.toBe(r3);
      expect(r3).not.toBe(r4);

      // Estados correctos
      expect(r1.contarRespuestas()).toBe(0);
      expect(r2.contarRespuestas()).toBe(1);
      expect(r3.contarRespuestas()).toBe(2);
      expect(r4.contarRespuestas()).toBe(1);
    });
  });
});
