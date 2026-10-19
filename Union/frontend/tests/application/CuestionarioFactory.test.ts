import { describe, it, expect, beforeEach } from 'vitest';
import { CuestionarioFactory } from '../../src/application/CuestionarioFactory';
import { Pregunta } from '../../src/domain/entities/Pregunta';
import { CategoriaInteres } from '../../src/domain/enums/CategoriaInteres';
import { GeneroMusical } from '../../src/domain/enums/GeneroMusical';
import { EstiloPintura } from '../../src/domain/enums/EstiloPintura';

/**
 * Tests para CuestionarioFactory (T019)
 *
 * Requisitos:
 * - RNF-24: Tests unitarios determinísticos
 * - A-2: Sincronía con enums
 * - T018: Dependencia en factory
 *
 * Criterios de aceptación:
 * - [ ] Test retorna array de 3 preguntas.
 * - [ ] Test pregunta 1: 10 opciones, obligatoria, multi-selección.
 * - [ ] Test pregunta 2: 12 opciones, obligatoria, multi-selección.
 * - [ ] Test pregunta 3: 10 opciones, opcional, multi-selección.
 * - [ ] Test todas opciones tienen id único.
 * - [ ] Test opciones coinciden con enums (sincronía).
 * - [ ] Cobertura ≥ 80%.
 * - [ ] Todos pasan.
 */
describe('CuestionarioFactory', () => {
  describe('crearCuestionarioDefault', () => {
    it('debe retornar un array de 3 preguntas', () => {
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      expect(cuestionario).toHaveLength(3);
    });

    it('debe retornar instancias de Pregunta', () => {
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      cuestionario.forEach((pregunta) => {
        expect(pregunta).toBeInstanceOf(Pregunta);
      });
    });

    it('debe retornar array en orden: Intereses, Géneros, Estilos', () => {
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      expect(cuestionario[0].id).toBe('pregunta-1-intereses');
      expect(cuestionario[1].id).toBe('pregunta-2-generos');
      expect(cuestionario[2].id).toBe('pregunta-3-estilos');
    });

    it('debe ser determinístico (mismo contenido en múltiples llamadas)', () => {
      const cuestionario1 = CuestionarioFactory.crearCuestionarioDefault();
      const cuestionario2 = CuestionarioFactory.crearCuestionarioDefault();

      expect(cuestionario1).toHaveLength(cuestionario2.length);
      expect(cuestionario1[0].id).toBe(cuestionario2[0].id);
      expect(cuestionario1[1].id).toBe(cuestionario2[1].id);
      expect(cuestionario1[2].id).toBe(cuestionario2[2].id);
    });
  });

  describe('Pregunta 1: Intereses Artísticos', () => {
    let pregunta1: Pregunta;

    beforeEach(() => {
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      pregunta1 = cuestionario[0];
    });

    it('debe tener ID correcto', () => {
      expect(pregunta1.id).toBe('pregunta-1-intereses');
    });

    it('debe tener texto descriptivo', () => {
      expect(pregunta1.texto).toBe('¿Cuáles son tus intereses artísticos?');
      expect(pregunta1.texto.length).toBeGreaterThan(0);
    });

    it('debe tener exactamente 10 opciones', () => {
      expect(pregunta1.opciones).toHaveLength(10);
    });

    it('debe ser obligatoria', () => {
      expect(pregunta1.obligatoria).toBe(true);
    });

    it('debe permitir múltiple selección', () => {
      expect(pregunta1.permiteMultipleSelecciones).toBe(true);
    });

    it('debe tener 10 opciones con ids únicos', () => {
      const ids = pregunta1.opciones.map((op) => op.id);
      const idsUnicos = new Set(ids);
      expect(idsUnicos.size).toBe(10);
    });

    it('debe mapear opciones a valores de CategoriaInteres enum', () => {
      const categoriasPresentes = new Set(
        pregunta1.opciones.map((op) => op.categoria)
      );

      // Verificar que todas las categorías son válidas
      categoriasPresentes.forEach((cat) => {
        expect(Object.values(CategoriaInteres)).toContain(cat);
      });

      // Verificar que hay 10 categorías (no duplicadas)
      expect(categoriasPresentes.size).toBe(10);
    });

    it('debe contener todas las categorías de CategoriaInteres', () => {
      const categoriasPresentes = new Set(
        pregunta1.opciones.map((op) => op.categoria)
      );
      const categoriasEnum = Object.values(CategoriaInteres);

      categoriasEnum.forEach((cat) => {
        expect(categoriasPresentes.has(cat)).toBe(true);
      });
    });

    it('debe tener descripciones en todas las opciones', () => {
      pregunta1.opciones.forEach((opcion) => {
        expect(opcion.descripcion).toBeTruthy();
        expect(opcion.descripcion.length).toBeGreaterThan(0);
      });
    });

    it('debe tener descripciones legibles (no vacías, sin caracteres especiales raros)', () => {
      pregunta1.opciones.forEach((opcion) => {
        expect(opcion.descripcion).toMatch(/^[a-záéíóúñ\s]+$/i);
      });
    });
  });

  describe('Pregunta 2: Géneros Musicales', () => {
    let pregunta2: Pregunta;

    beforeEach(() => {
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      pregunta2 = cuestionario[1];
    });

    it('debe tener ID correcto', () => {
      expect(pregunta2.id).toBe('pregunta-2-generos');
    });

    it('debe tener texto descriptivo', () => {
      expect(pregunta2.texto).toBe('¿Cuáles son tus géneros musicales favoritos?');
      expect(pregunta2.texto.length).toBeGreaterThan(0);
    });

    it('debe tener exactamente 12 opciones', () => {
      expect(pregunta2.opciones).toHaveLength(12);
    });

    it('debe ser obligatoria', () => {
      expect(pregunta2.obligatoria).toBe(true);
    });

    it('debe permitir múltiple selección', () => {
      expect(pregunta2.permiteMultipleSelecciones).toBe(true);
    });

    it('debe tener 12 opciones con ids únicos', () => {
      const ids = pregunta2.opciones.map((op) => op.id);
      const idsUnicos = new Set(ids);
      expect(idsUnicos.size).toBe(12);
    });

    it('debe mapear opciones a valores de GeneroMusical enum', () => {
      const generosPresentes = new Set(
        pregunta2.opciones.map((op) => op.categoria)
      );

      // Verificar que todos los géneros son válidos
      generosPresentes.forEach((gen) => {
        expect(Object.values(GeneroMusical)).toContain(gen);
      });

      // Verificar que hay 12 géneros (no duplicados)
      expect(generosPresentes.size).toBe(12);
    });

    it('debe contener todos los géneros de GeneroMusical', () => {
      const generosPresentes = new Set(
        pregunta2.opciones.map((op) => op.categoria)
      );
      const generosEnum = Object.values(GeneroMusical);

      generosEnum.forEach((gen) => {
        expect(generosPresentes.has(gen)).toBe(true);
      });
    });

    it('debe tener descripciones en todas las opciones', () => {
      pregunta2.opciones.forEach((opcion) => {
        expect(opcion.descripcion).toBeTruthy();
        expect(opcion.descripcion.length).toBeGreaterThan(0);
      });
    });

    it('debe tener descripciones legibles', () => {
      pregunta2.opciones.forEach((opcion) => {
        // Permitir caracteres especiales para géneros como "R&B" o "K-Pop"
        expect(opcion.descripcion).toMatch(/^[a-záéíóúñ\s\-&]+$/i);
      });
    });
  });

  describe('Pregunta 3: Estilos de Pintura', () => {
    let pregunta3: Pregunta;

    beforeEach(() => {
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      pregunta3 = cuestionario[2];
    });

    it('debe tener ID correcto', () => {
      expect(pregunta3.id).toBe('pregunta-3-estilos');
    });

    it('debe tener texto descriptivo', () => {
      expect(pregunta3.texto).toBe('¿Cuáles son tus estilos de pintura favoritos?');
      expect(pregunta3.texto.length).toBeGreaterThan(0);
    });

    it('debe tener exactamente 10 opciones', () => {
      expect(pregunta3.opciones).toHaveLength(10);
    });

    it('debe ser opcional', () => {
      expect(pregunta3.obligatoria).toBe(false);
    });

    it('debe permitir múltiple selección', () => {
      expect(pregunta3.permiteMultipleSelecciones).toBe(true);
    });

    it('debe tener 10 opciones con ids únicos', () => {
      const ids = pregunta3.opciones.map((op) => op.id);
      const idsUnicos = new Set(ids);
      expect(idsUnicos.size).toBe(10);
    });

    it('debe mapear opciones a valores de EstiloPintura enum', () => {
      const estilosPresentes = new Set(
        pregunta3.opciones.map((op) => op.categoria)
      );

      // Verificar que todos los estilos son válidos
      estilosPresentes.forEach((est) => {
        expect(Object.values(EstiloPintura)).toContain(est);
      });

      // Verificar que hay 10 estilos (no duplicados)
      expect(estilosPresentes.size).toBe(10);
    });

    it('debe contener todos los estilos de EstiloPintura', () => {
      const estilosPresentes = new Set(
        pregunta3.opciones.map((op) => op.categoria)
      );
      const estilosEnum = Object.values(EstiloPintura);

      estilosEnum.forEach((est) => {
        expect(estilosPresentes.has(est)).toBe(true);
      });
    });

    it('debe tener descripciones en todas las opciones', () => {
      pregunta3.opciones.forEach((opcion) => {
        expect(opcion.descripcion).toBeTruthy();
        expect(opcion.descripcion.length).toBeGreaterThan(0);
      });
    });

    it('debe tener descripciones legibles', () => {
      pregunta3.opciones.forEach((opcion) => {
        expect(opcion.descripcion).toMatch(/^[a-záéíóúñ\s]+$/i);
      });
    });
  });

  describe('Sincronía Global (A-2)', () => {
    it('todas las opciones del cuestionario deben tener id único globalmente', () => {
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      const todasLasOpciones = cuestionario.flatMap((p) => p.opciones);
      const ids = todasLasOpciones.map((op) => op.id);
      const idsUnicos = new Set(ids);

      expect(idsUnicos.size).toBe(32); // 10 + 12 + 10
      expect(ids).toHaveLength(32);
    });

    it('total de opciones debe ser 32 (10 + 12 + 10)', () => {
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      const totalOpciones = cuestionario.reduce((acc, p) => acc + p.opciones.length, 0);

      expect(totalOpciones).toBe(32);
    });

    it('debe sincronizar con cantidad de enums', () => {
      const categoriasInteres = Object.values(CategoriaInteres);
      const generosMusical = Object.values(GeneroMusical);
      const estilosPintura = Object.values(EstiloPintura);

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      expect(cuestionario[0].opciones).toHaveLength(categoriasInteres.length);
      expect(cuestionario[1].opciones).toHaveLength(generosMusical.length);
      expect(cuestionario[2].opciones).toHaveLength(estilosPintura.length);
    });

    it('cada opción debe tener categoría válida en su enum correspondiente', () => {
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Pregunta 1: verificar contra CategoriaInteres
      cuestionario[0].opciones.forEach((opcion) => {
        expect(Object.values(CategoriaInteres)).toContain(opcion.categoria);
      });

      // Pregunta 2: verificar contra GeneroMusical
      cuestionario[1].opciones.forEach((opcion) => {
        expect(Object.values(GeneroMusical)).toContain(opcion.categoria);
      });

      // Pregunta 3: verificar contra EstiloPintura
      cuestionario[2].opciones.forEach((opcion) => {
        expect(Object.values(EstiloPintura)).toContain(opcion.categoria);
      });
    });

    it('no debe haber opciones duplicadas (id único)', () => {
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      const todasLasOpciones = cuestionario.flatMap((p) => p.opciones);

      // Verificar por ID
      const idsUnicos = new Set(todasLasOpciones.map((op) => op.id));
      expect(idsUnicos.size).toBe(todasLasOpciones.length);

      // Verificar por descripción en cada pregunta
      cuestionario.forEach((pregunta) => {
        const descripciones = new Set(pregunta.opciones.map((op) => op.descripcion));
        expect(descripciones.size).toBe(pregunta.opciones.length);
      });
    });
  });

  describe('Comportamiento y Propiedades', () => {
    it('todas las preguntas deben permitir múltiple selección', () => {
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      cuestionario.forEach((pregunta) => {
        expect(pregunta.permiteMultipleSelecciones).toBe(true);
      });
    });

    it('preguntas 1 y 2 deben ser obligatorias, pregunta 3 opcional', () => {
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      expect(cuestionario[0].obligatoria).toBe(true);
      expect(cuestionario[1].obligatoria).toBe(true);
      expect(cuestionario[2].obligatoria).toBe(false);
    });

    it('todas las opciones deben ser válidas (pasar validación)', () => {
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      cuestionario.forEach((pregunta) => {
        pregunta.opciones.forEach((opcion) => {
          expect(opcion.esValida()).toBe(true);
        });
      });
    });

    it('todas las preguntas deben ser válidas', () => {
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      // Si la factory retorna preguntas, es que pasaron validación en constructor
      cuestionario.forEach((pregunta) => {
        expect(pregunta.id).toBeTruthy();
        expect(pregunta.texto).toBeTruthy();
        expect(pregunta.opciones.length).toBeGreaterThan(0);
      });
    });
  });
});
