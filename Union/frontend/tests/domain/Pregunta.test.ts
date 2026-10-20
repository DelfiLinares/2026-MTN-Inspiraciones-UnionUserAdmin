import { describe, it, expect, beforeEach } from 'vitest';
import { Pregunta } from '../../src/domain/entities/Pregunta';
import { OpcionRespuesta } from '../../src/domain/entities/OpcionRespuesta';
import { CategoriaInteres } from '../../src/domain/enums/CategoriaInteres';
import { GeneroMusical } from '../../src/domain/enums/GeneroMusical';
import { EstiloPintura } from '../../src/domain/enums/EstiloPintura';

describe('Pregunta', () => {
  let opcion1: OpcionRespuesta;
  let opcion2: OpcionRespuesta;
  let opcion3: OpcionRespuesta;

  beforeEach(() => {
    opcion1 = OpcionRespuesta.crear('op1', CategoriaInteres.Dibujo, 'Dibujo artístico');
    opcion2 = OpcionRespuesta.crear('op2', CategoriaInteres.Escultura, 'Escultura moderna');
    opcion3 = OpcionRespuesta.crear('op3', GeneroMusical.Rock, 'Música rock clásica');
  });

  describe('Construcción válida', () => {
    it('debe crear una pregunta válida con parámetros correctos', () => {
      const pregunta = Pregunta.crear(
        'p1',
        '¿Cuál es tu disciplina favorita?',
        [opcion1, opcion2],
        false,
        true
      );

      expect(pregunta.id).toBe('p1');
      expect(pregunta.texto).toBe('¿Cuál es tu disciplina favorita?');
      expect(pregunta.opciones.length).toBe(2);
      expect(pregunta.permiteMultipleSelecciones).toBe(false);
      expect(pregunta.obligatoria).toBe(true);
    });

    it('debe crear una pregunta con obligatoria = false', () => {
      const pregunta = Pregunta.crear(
        'p2',
        'Pregunta opcional',
        [opcion1],
        false,
        false
      );

      expect(pregunta.obligatoria).toBe(false);
    });

    it('debe crear pregunta con parámetro obligatoria omitido (default true)', () => {
      const pregunta = Pregunta.crear(
        'p2b',
        'Pregunta default',
        [opcion1],
        false
      );

      expect(pregunta.obligatoria).toBe(true);
    });

    it('debe crear una pregunta con permiteMultipleSelecciones = true', () => {
      const pregunta = Pregunta.crear(
        'p3',
        'Selecciona tus disciplinas favoritas',
        [opcion1, opcion2, opcion3],
        true,
        true
      );

      expect(pregunta.permiteMultipleSelecciones).toBe(true);
    });

    it('debe usar obligatoria = true por defecto', () => {
      const pregunta = Pregunta.crear(
        'p4',
        'Pregunta default',
        [opcion1],
        false
      );

      expect(pregunta.obligatoria).toBe(true);
    });
  });

  describe('Construcción inválida - invariantes', () => {
    it('debe lanzar error si id está vacío', () => {
      expect(() => {
        Pregunta.crear('', 'Pregunta sin ID', [opcion1], false);
      }).toThrow('Pregunta: id es requerido y no puede estar vacío');
    });

    it('debe lanzar error si id contiene solo espacios', () => {
      expect(() => {
        Pregunta.crear('   ', 'Pregunta con ID en blanco', [opcion1], false);
      }).toThrow('Pregunta: id es requerido y no puede estar vacío');
    });

    it('debe lanzar error si texto está vacío', () => {
      expect(() => {
        Pregunta.crear('p5', '', [opcion1], false);
      }).toThrow('Pregunta: texto es requerido y no puede estar vacío');
    });

    it('debe lanzar error si texto contiene solo espacios', () => {
      expect(() => {
        Pregunta.crear('p6', '   ', [opcion1], false);
      }).toThrow('Pregunta: texto es requerido y no puede estar vacío');
    });

    it('debe lanzar error si opciones es vacío', () => {
      expect(() => {
        Pregunta.crear('p7', 'Pregunta sin opciones', [], false);
      }).toThrow('Pregunta: debe tener al menos una opción');
    });

    it('debe lanzar error si alguna opción no es válida', () => {
      const opcionInvalida = OpcionRespuesta.fromValues('', CategoriaInteres.Dibujo, '');
      expect(() => {
        Pregunta.crear('p8', 'Pregunta con opción inválida', [opcionInvalida], false, true);
      }).toThrow('Pregunta: todas las opciones deben ser válidas');
    });

    it('debe lanzar error si hay IDs de opciones duplicadas', () => {
      const opcionDuplicada = OpcionRespuesta.crear('op1', CategoriaInteres.Fotografia, 'Foto');
      expect(() => {
        Pregunta.crear('p9', 'Pregunta con opciones duplicadas', [opcion1, opcionDuplicada], false);
      }).toThrow('Pregunta: las opciones deben tener IDs únicos');
    });

    it('debe validar que todas las opciones sean del tipo OpcionRespuesta', () => {
      const opcionInvalida = { id: 'op_bad', categoria: CategoriaInteres.Dibujo };
      expect(() => {
        Pregunta.crear(
          'p10',
          'Pregunta con opción tipo incorrecto',
          [opcionInvalida as any],
          false
        );
      }).toThrow();
    });
  });

  describe('validarRespuesta - Obligatoriedad', () => {
    it('debe rechazar pregunta obligatoria con respuesta vacía', () => {
      const pregunta = Pregunta.crear('p11', 'Pregunta obligatoria', [opcion1, opcion2], false, true);

      const resultado = pregunta.validarRespuesta([]);

      expect(resultado.valida).toBe(false);
      expect(resultado.error).toBe('Esta pregunta es obligatoria');
    });

    it('debe aceptar pregunta obligatoria con al menos 1 selección', () => {
      const pregunta = Pregunta.crear('p12', 'Pregunta obligatoria', [opcion1, opcion2], false, true);

      const resultado = pregunta.validarRespuesta(['op1']);

      expect(resultado.valida).toBe(true);
      expect(resultado.error).toBeUndefined();
    });

    it('debe aceptar pregunta opcional con respuesta vacía', () => {
      const pregunta = Pregunta.crear('p13', 'Pregunta opcional', [opcion1, opcion2], false, false);

      const resultado = pregunta.validarRespuesta([]);

      expect(resultado.valida).toBe(true);
      expect(resultado.error).toBeUndefined();
    });

    it('debe aceptar pregunta opcional con selecciones', () => {
      const pregunta = Pregunta.crear('p14', 'Pregunta opcional', [opcion1, opcion2], false, false);

      const resultado = pregunta.validarRespuesta(['op1']);

      expect(resultado.valida).toBe(true);
      expect(resultado.error).toBeUndefined();
    });
  });

  describe('validarRespuesta - Selección de opciones', () => {
    it('debe rechazar ID de opción fuera del catálogo', () => {
      const pregunta = Pregunta.crear('p15', 'Pregunta', [opcion1, opcion2], false, true);

      const resultado = pregunta.validarRespuesta(['op_inexistente']);

      expect(resultado.valida).toBe(false);
      expect(resultado.error).toBe('Opciones seleccionadas no válidas');
    });

    it('debe rechazar si hay múltiples IDs inválidas', () => {
      const pregunta = Pregunta.crear('p16', 'Pregunta', [opcion1, opcion2], true, true);

      const resultado = pregunta.validarRespuesta(['op1', 'op_inexistente']);

      expect(resultado.valida).toBe(false);
      expect(resultado.error).toBe('Opciones seleccionadas no válidas');
    });

    it('debe aceptar IDs válidas del catálogo', () => {
      const pregunta = Pregunta.crear('p17', 'Pregunta', [opcion1, opcion2, opcion3], true, true);

      const resultado = pregunta.validarRespuesta(['op1', 'op3']);

      expect(resultado.valida).toBe(true);
    });
  });

  describe('validarRespuesta - Multiplicidad', () => {
    it('debe bloquear multi-selección cuando permiteMultipleSelecciones = false y hay > 1 opción', () => {
      const pregunta = Pregunta.crear(
        'p18',
        'Pregunta de selección única',
        [opcion1, opcion2, opcion3],
        false,
        true
      );

      const resultado = pregunta.validarRespuesta(['op1', 'op2']);

      expect(resultado.valida).toBe(false);
      expect(resultado.error).toBe('Solo se permite una opción');
    });

    it('debe bloquear 3+ opciones cuando permiteMultipleSelecciones = false', () => {
      const pregunta = Pregunta.crear('p19', 'Pregunta única', [opcion1, opcion2, opcion3], false, true);

      const resultado = pregunta.validarRespuesta(['op1', 'op2', 'op3']);

      expect(resultado.valida).toBe(false);
      expect(resultado.error).toBe('Solo se permite una opción');
    });

    it('debe permitir 1 opción cuando permiteMultipleSelecciones = false', () => {
      const pregunta = Pregunta.crear('p20', 'Pregunta única', [opcion1, opcion2], false, true);

      const resultado = pregunta.validarRespuesta(['op1']);

      expect(resultado.valida).toBe(true);
    });

    it('debe permitir múltiples opciones cuando permiteMultipleSelecciones = true', () => {
      const pregunta = Pregunta.crear(
        'p21',
        'Pregunta múltiple',
        [opcion1, opcion2, opcion3],
        true,
        true
      );

      const resultado = pregunta.validarRespuesta(['op1', 'op2', 'op3']);

      expect(resultado.valida).toBe(true);
    });

    it('debe permitir 1 opción cuando permiteMultipleSelecciones = true', () => {
      const pregunta = Pregunta.crear('p22', 'Pregunta múltiple', [opcion1, opcion2], true, true);

      const resultado = pregunta.validarRespuesta(['op1']);

      expect(resultado.valida).toBe(true);
    });

    it('debe permitir 0 opciones en pregunta opcional con permiteMultipleSelecciones = true', () => {
      const pregunta = Pregunta.crear('p23', 'Pregunta múltiple opcional', [opcion1, opcion2], true, false);

      const resultado = pregunta.validarRespuesta([]);

      expect(resultado.valida).toBe(true);
    });
  });

  describe('validarRespuesta - Casos borde', () => {
    it('debe rechazar si idsSeleccionados no es array', () => {
      const pregunta = Pregunta.crear('p24', 'Pregunta', [opcion1], false, true);

      const resultado = pregunta.validarRespuesta('op1' as any);

      expect(resultado.valida).toBe(false);
      expect(resultado.error).toBe('idsSeleccionados debe ser un array');
    });

    it('debe rechazar si idsSeleccionados es null', () => {
      const pregunta = Pregunta.crear('p25', 'Pregunta', [opcion1], false, true);

      const resultado = pregunta.validarRespuesta(null as any);

      expect(resultado.valida).toBe(false);
      expect(resultado.error).toBe('idsSeleccionados debe ser un array');
    });

    it('debe rechazar si idsSeleccionados es undefined', () => {
      const pregunta = Pregunta.crear('p26', 'Pregunta', [opcion1], false, true);

      const resultado = pregunta.validarRespuesta(undefined as any);

      expect(resultado.valida).toBe(false);
      expect(resultado.error).toBe('idsSeleccionados debe ser un array');
    });

    it('debe validar prioridad: selección inválida antes que multiplicidad', () => {
      const pregunta = Pregunta.crear('p27', 'Pregunta', [opcion1], false, true);

      const resultado = pregunta.validarRespuesta(['op_inexistente', 'otro_inexistente']);

      expect(resultado.valida).toBe(false);
      expect(resultado.error).toBe('Opciones seleccionadas no válidas');
    });

    it('debe validar prioridad: multiplicidad antes que obligatoriedad', () => {
      const pregunta = Pregunta.crear('p28', 'Pregunta', [opcion1, opcion2], false, true);

      const resultado = pregunta.validarRespuesta(['op1', 'op2']);

      expect(resultado.valida).toBe(false);
      expect(resultado.error).toBe('Solo se permite una opción');
    });
  });

  describe('obtenerOpcion', () => {
    it('debe retornar opción si el ID existe', () => {
      const pregunta = Pregunta.crear('p29', 'Pregunta', [opcion1, opcion2, opcion3], false, true);

      const resultado = pregunta.obtenerOpcion('op2');

      expect(resultado).toBeDefined();
      expect(resultado?.id).toBe('op2');
      expect(resultado?.equals(opcion2)).toBe(true);
    });

    it('debe retornar undefined si el ID no existe', () => {
      const pregunta = Pregunta.crear('p30', 'Pregunta', [opcion1, opcion2], false, true);

      const resultado = pregunta.obtenerOpcion('op_inexistente');

      expect(resultado).toBeUndefined();
    });

    it('debe retornar la primera opción si buscamos op1', () => {
      const pregunta = Pregunta.crear('p31', 'Pregunta', [opcion1, opcion2, opcion3], false, true);

      const resultado = pregunta.obtenerOpcion('op1');

      expect(resultado?.id).toBe('op1');
    });

    it('debe retornar la última opción si buscamos op3', () => {
      const pregunta = Pregunta.crear('p32', 'Pregunta', [opcion1, opcion2, opcion3], false, true);

      const resultado = pregunta.obtenerOpcion('op3');

      expect(resultado?.id).toBe('op3');
    });

    it('debe retornar undefined para ID vacío', () => {
      const pregunta = Pregunta.crear('p33', 'Pregunta', [opcion1, opcion2], false, true);

      const resultado = pregunta.obtenerOpcion('');

      expect(resultado).toBeUndefined();
    });
  });

  describe('Immutabilidad', () => {
    it('propiedades deben ser readonly en TypeScript', () => {
      const pregunta = Pregunta.crear('p34', 'Pregunta', [opcion1], false, true);

      // Verificar que los valores existen (TypeScript marca como readonly)
      expect(pregunta.id).toBeDefined();
      expect(pregunta.texto).toBeDefined();
      expect(pregunta.opciones).toBeDefined();
      expect(pregunta.permiteMultipleSelecciones).toBeDefined();
      expect(pregunta.obligatoria).toBeDefined();
    });

    it('no debe cambiar valores de id', () => {
      const pregunta = Pregunta.crear('p35', 'Pregunta', [opcion1], false, true);
      const idOriginal = pregunta.id;

      // Acceder nuevamente
      const idActual = pregunta.id;

      expect(idActual).toBe(idOriginal);
    });

    it('no debe cambiar valores de texto', () => {
      const pregunta = Pregunta.crear('p36', 'Pregunta', [opcion1], false, true);
      const textoOriginal = pregunta.texto;

      const textoActual = pregunta.texto;

      expect(textoActual).toBe(textoOriginal);
    });

    it('debe congelar el array de opciones', () => {
      const pregunta = Pregunta.crear('p37', 'Pregunta', [opcion1, opcion2], false, true);

      expect(Object.isFrozen(pregunta.opciones)).toBe(true);
    });

    it('no debe permitir modificar opciones congeladas', () => {
      const pregunta = Pregunta.crear('p38', 'Pregunta', [opcion1, opcion2], false, true);

      expect(() => {
        (pregunta.opciones as any)[0] = opcion3;
      }).toThrow();
    });

    it('debe mantener valores originales de permiteMultipleSelecciones', () => {
      const pregunta = Pregunta.crear('p39', 'Pregunta', [opcion1, opcion2], true, false);

      const multiSelectOriginal = pregunta.permiteMultipleSelecciones;
      const multiSelectActual = pregunta.permiteMultipleSelecciones;

      expect(multiSelectActual).toBe(multiSelectOriginal);
    });

    it('debe mantener valores originales de obligatoria', () => {
      const pregunta = Pregunta.crear('p40', 'Pregunta', [opcion1, opcion2], false, true);

      const obligatoriaOriginal = pregunta.obligatoria;
      const obligatoriaActual = pregunta.obligatoria;

      expect(obligatoriaActual).toBe(obligatoriaOriginal);
    });

    it('debe mantener todos los valores en múltiples accesos', () => {
      const pregunta = Pregunta.crear('p41', 'Pregunta', [opcion1, opcion2], true, false);

      const valores1 = {
        id: pregunta.id,
        texto: pregunta.texto,
        opcionesLen: pregunta.opciones.length,
        multiselect: pregunta.permiteMultipleSelecciones,
        obligatoria: pregunta.obligatoria,
      };

      const valores2 = {
        id: pregunta.id,
        texto: pregunta.texto,
        opcionesLen: pregunta.opciones.length,
        multiselect: pregunta.permiteMultipleSelecciones,
        obligatoria: pregunta.obligatoria,
      };

      expect(valores1).toEqual(valores2);
    });
  });

  describe('Métodos toString() y equals()', () => {
    it('debe retornar representación en string válida', () => {
      const pregunta = Pregunta.crear('p40', 'Pregunta', [opcion1, opcion2], false, true);

      const str = pregunta.toString();

      expect(str).toContain('Pregunta');
      expect(str).toContain('p40');
      expect(str).toContain('2 opciones');
    });

    it('debe indicar número correcto de opciones en toString', () => {
      const pregunta = Pregunta.crear('p41', 'Pregunta con 3 opciones', [opcion1, opcion2, opcion3], false, true);

      const str = pregunta.toString();

      expect(str).toContain('3 opciones');
    });

    it('debe retornar true para equals() con misma pregunta', () => {
      const p1 = Pregunta.crear('p42', 'Pregunta', [opcion1, opcion2], false, true);
      const p2 = Pregunta.crear('p42', 'Pregunta', [opcion1, opcion2], false, true);

      expect(p1.equals(p2)).toBe(true);
    });

    it('debe retornar false si ID es diferente en equals()', () => {
      const p1 = Pregunta.crear('p43', 'Pregunta', [opcion1, opcion2], false, true);
      const p2 = Pregunta.crear('p44', 'Pregunta', [opcion1, opcion2], false, true);

      expect(p1.equals(p2)).toBe(false);
    });

    it('debe retornar false si texto es diferente en equals()', () => {
      const p1 = Pregunta.crear('p45', 'Pregunta A', [opcion1, opcion2], false, true);
      const p2 = Pregunta.crear('p45', 'Pregunta B', [opcion1, opcion2], false, true);

      expect(p1.equals(p2)).toBe(false);
    });

    it('debe retornar false si permiteMultipleSelecciones es diferente', () => {
      const p1 = Pregunta.crear('p46', 'Pregunta', [opcion1, opcion2], false, true);
      const p2 = Pregunta.crear('p46', 'Pregunta', [opcion1, opcion2], true, true);

      expect(p1.equals(p2)).toBe(false);
    });

    it('debe retornar false si obligatoria es diferente', () => {
      const p1 = Pregunta.crear('p47', 'Pregunta', [opcion1, opcion2], false, true);
      const p2 = Pregunta.crear('p47', 'Pregunta', [opcion1, opcion2], false, false);

      expect(p1.equals(p2)).toBe(false);
    });

    it('debe retornar false si número de opciones es diferente', () => {
      const p1 = Pregunta.crear('p48', 'Pregunta', [opcion1, opcion2], false, true);
      const p2 = Pregunta.crear('p48', 'Pregunta', [opcion1, opcion2, opcion3], false, true);

      expect(p1.equals(p2)).toBe(false);
    });

    it('debe retornar false si alguna opción es diferente', () => {
      const opcion2Alt = OpcionRespuesta.crear('op2', CategoriaInteres.Dibujo, 'Otra descripción');
      const p1 = Pregunta.crear('p49', 'Pregunta', [opcion1, opcion2], false, true);
      const p2 = Pregunta.crear('p49', 'Pregunta', [opcion1, opcion2Alt], false, true);

      expect(p1.equals(p2)).toBe(false);
    });

    it('debe retornar false si se compara con null', () => {
      const p1 = Pregunta.crear('p50', 'Pregunta', [opcion1], false, true);

      expect(p1.equals(null as any)).toBe(false);
    });

    it('debe retornar false si se compara con undefined', () => {
      const p1 = Pregunta.crear('p51', 'Pregunta', [opcion1], false, true);

      expect(p1.equals(undefined as any)).toBe(false);
    });
  });

  describe('Integración - Casos complejos', () => {
    it('debe permitir múltiples preguntas con diferentes categorías', () => {
      const p1 = Pregunta.crear('p52', 'Disciplinas', [opcion1, opcion2], false, true);
      const p2 = Pregunta.crear('p53', 'Música', [opcion3], false, true);

      expect(p1.id).not.toBe(p2.id);
      expect(p1.obtenerOpcion('op1')).toBeDefined();
      expect(p2.obtenerOpcion('op3')).toBeDefined();
      expect(p2.obtenerOpcion('op1')).toBeUndefined();
    });

    it('debe validar secuencia de respuestas en pregunta múltiple', () => {
      const pregunta = Pregunta.crear(
        'p54',
        'Selecciona múltiples',
        [opcion1, opcion2, opcion3],
        true,
        true
      );

      const r1 = pregunta.validarRespuesta(['op1']);
      const r2 = pregunta.validarRespuesta(['op1', 'op2']);
      const r3 = pregunta.validarRespuesta(['op1', 'op2', 'op3']);

      expect(r1.valida).toBe(true);
      expect(r2.valida).toBe(true);
      expect(r3.valida).toBe(true);
    });

    it('debe rechazar cambios a opciones después de creación', () => {
      const opciones = [opcion1, opcion2];
      const pregunta = Pregunta.crear('p55', 'Pregunta', opciones, false, true);

      // Intentar modificar array original
      opciones.push(opcion3);

      // Pregunta debe mantener solo 2 opciones
      expect(pregunta.opciones.length).toBe(2);
    });

    it('debe manejar preguntas con todas las categorías', () => {
      const op_dibujo = OpcionRespuesta.crear('op_d', CategoriaInteres.Dibujo, 'Dibujo');
      const op_musica = OpcionRespuesta.crear('op_m', GeneroMusical.Rock, 'Rock');
      const op_pintura = OpcionRespuesta.crear('op_p', EstiloPintura.Realismo, 'Realismo');

      const pregunta = Pregunta.crear(
        'p56',
        'Todas las categorías',
        [op_dibujo, op_musica, op_pintura],
        true,
        true
      );

      expect(pregunta.obtenerOpcion('op_d')).toBeDefined();
      expect(pregunta.obtenerOpcion('op_m')).toBeDefined();
      expect(pregunta.obtenerOpcion('op_p')).toBeDefined();

      const resultado = pregunta.validarRespuesta(['op_d', 'op_m', 'op_p']);
      expect(resultado.valida).toBe(true);
    });
  });
});
