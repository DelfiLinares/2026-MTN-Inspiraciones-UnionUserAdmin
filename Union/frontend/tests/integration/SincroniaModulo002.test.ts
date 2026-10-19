import { describe, it, expect } from 'vitest';
import { CategoriaInteres, getCategoriaInteresDescription, isValidCategoriaInteres } from '../../src/domain/enums/CategoriaInteres';
import { GeneroMusical, getGeneroMusicalDescription, isValidGeneroMusical } from '../../src/domain/enums/GeneroMusical';
import { EstiloPintura, getEstiloPinturaDescription, isValidEstiloPintura } from '../../src/domain/enums/EstiloPintura';

/**
 * T011: Tests de sincronía con módulo 002 (Publicaciones)
 *
 * Objetivo: Verificar que las categorías de intereses (CategoriaInteres, GeneroMusical, EstiloPintura)
 * sincronicen exactamente con las especificadas en spec.md § 10.
 *
 * NOTA CRÍTICA (A-2, RNF-23): Si alguno de estos tests falla, NO proceder a T012+.
 * Comunicar al team: desincronía entre módulo 006 (cuestionario) y módulo 002 (publicaciones).
 *
 * Referencia:
 * - spec.md § 10 (Consistencia con módulo 002)
 * - A-2: Estructura de categorías idénticas a módulo 002
 * - RNF-23: Sincronía de enums y categorías
 */
describe('SincroniaModulo002', () => {
  /**
   * Categorías esperadas de Intereses Artísticos según spec.md § 10
   * Extraído de: "Intereses artísticos (HU-02): Dibujo, Escultura, Fotografía, Literatura,
   * Escultura Digital, Pintura Digital, Instalación, Performance, Video Arte, etc."
   */
  const categoriasInteresesEsperadas = [
    'Dibujo',
    'Escultura',
    'Fotografía',
    'Literatura',
    'Escultura Digital',
    'Pintura Digital',
    'Instalación',
    'Performance',
    'Video Arte',
    'Cine Audiovisual',
  ];

  /**
   * Géneros Musicales esperados según spec.md § 10
   * Extraído de: "Géneros musicales (HU-03): Rock, Pop, Electrónica, Metal, K-pop, Country,
   * Nacional, Reggaetón, Hip-Hop, Clásica, R&B, Blues."
   */
  const generosMusicalEsperados = [
    'Rock',
    'Pop',
    'Electrónica',
    'Metal',
    'K-Pop',
    'Country',
    'Nacional',
    'Reggaeton',
    'Hip-Hop',
    'Clásica',
    'R&B',
    'Blues',
  ];

  /**
   * Estilos de Pintura esperados según spec.md § 10
   * Extraído de: "Estilos de pintura (HU-04): Realismo, Abstracción, Impresionismo,
   * Surrealismo, Expresionismo, Cubismo, etc."
   */
  const estilosPinturaEsperados = [
    'Realismo',
    'Abstracción',
    'Impresionismo',
    'Surrealismo',
    'Expresionismo',
    'Cubismo',
    'Fauvismo',
    'Dadaísmo',
    'Constructivismo',
    'Pop Art',
  ];

  describe('CategoriaInteres - Sincronía con spec.md', () => {
    it('debe tener exactamente 10 valores', () => {
      const valores = Object.values(CategoriaInteres);
      expect(valores).toHaveLength(10);
    });

    it('debe contener exactamente los valores especificados en spec.md § 10', () => {
      const valoresActuales = Object.values(CategoriaInteres);
      expect(valoresActuales).toHaveLength(categoriasInteresesEsperadas.length);
    });

    it('enum Dibujo debe existir', () => {
      expect(CategoriaInteres.Dibujo).toBeDefined();
      expect(CategoriaInteres.Dibujo).toBe('dibujo');
    });

    it('enum Escultura debe existir', () => {
      expect(CategoriaInteres.Escultura).toBeDefined();
      expect(CategoriaInteres.Escultura).toBe('escultura');
    });

    it('enum Fotografia debe existir', () => {
      expect(CategoriaInteres.Fotografia).toBeDefined();
      expect(CategoriaInteres.Fotografia).toBe('fotografia');
    });

    it('enum Literatura debe existir', () => {
      expect(CategoriaInteres.Literatura).toBeDefined();
      expect(CategoriaInteres.Literatura).toBe('literatura');
    });

    it('enum EsculuraDigital debe existir', () => {
      expect(CategoriaInteres.EsculuraDigital).toBeDefined();
      expect(CategoriaInteres.EsculuraDigital).toBe('escultura_digital');
    });

    it('enum PinturaDigital debe existir', () => {
      expect(CategoriaInteres.PinturaDigital).toBeDefined();
      expect(CategoriaInteres.PinturaDigital).toBe('pintura_digital');
    });

    it('enum Instalacion debe existir', () => {
      expect(CategoriaInteres.Instalacion).toBeDefined();
      expect(CategoriaInteres.Instalacion).toBe('instalacion');
    });

    it('enum Performance debe existir', () => {
      expect(CategoriaInteres.Performance).toBeDefined();
      expect(CategoriaInteres.Performance).toBe('performance');
    });

    it('enum VideoArte debe existir', () => {
      expect(CategoriaInteres.VideoArte).toBeDefined();
      expect(CategoriaInteres.VideoArte).toBe('video_arte');
    });

    it('enum CineAudiovisual debe existir', () => {
      expect(CategoriaInteres.CineAudiovisual).toBeDefined();
      expect(CategoriaInteres.CineAudiovisual).toBe('cine_audiovisual');
    });

    it('no debe tener valores duplicados', () => {
      const valores = Object.values(CategoriaInteres);
      const valoresUnicos = new Set(valores);
      expect(valoresUnicos.size).toBe(valores.length);
    });

    it('todas las descripciones deben estar presentes', () => {
      // Verificar que getCategoriaInteresDescription existe y funciona para todos
      const descripcionesValidas = Object.values(CategoriaInteres).map(cat => {
        const desc = getCategoriaInteresDescription(cat);
        return desc !== undefined && desc.length > 0;
      });
      expect(descripcionesValidas.every(v => v)).toBe(true);
    });

    it('validador isValidCategoriaInteres debe funcionar para todos los valores', () => {
      const todasValidas = Object.values(CategoriaInteres).every(cat => isValidCategoriaInteres(cat));
      expect(todasValidas).toBe(true);
    });

    it('validador debe rechazar valores inválidos', () => {
      expect(isValidCategoriaInteres('invalido')).toBe(false);
      expect(isValidCategoriaInteres('')).toBe(false);
      expect(isValidCategoriaInteres(null)).toBe(false);
      expect(isValidCategoriaInteres(undefined)).toBe(false);
    });
  });

  describe('GeneroMusical - Sincronía con spec.md', () => {
    it('debe tener exactamente 12 valores', () => {
      const valores = Object.values(GeneroMusical);
      expect(valores).toHaveLength(12);
    });

    it('debe contener exactamente los valores especificados en spec.md § 10', () => {
      const valoresActuales = Object.values(GeneroMusical);
      expect(valoresActuales).toHaveLength(generosMusicalEsperados.length);
    });

    it('enum Rock debe existir', () => {
      expect(GeneroMusical.Rock).toBeDefined();
      expect(GeneroMusical.Rock).toBe('rock');
    });

    it('enum Pop debe existir', () => {
      expect(GeneroMusical.Pop).toBeDefined();
      expect(GeneroMusical.Pop).toBe('pop');
    });

    it('enum Electronica debe existir', () => {
      expect(GeneroMusical.Electronica).toBeDefined();
      expect(GeneroMusical.Electronica).toBe('electronica');
    });

    it('enum Metal debe existir', () => {
      expect(GeneroMusical.Metal).toBeDefined();
      expect(GeneroMusical.Metal).toBe('metal');
    });

    it('enum KPop debe existir', () => {
      expect(GeneroMusical.KPop).toBeDefined();
      expect(GeneroMusical.KPop).toBe('k_pop');
    });

    it('enum Country debe existir', () => {
      expect(GeneroMusical.Country).toBeDefined();
      expect(GeneroMusical.Country).toBe('country');
    });

    it('enum Nacional debe existir', () => {
      expect(GeneroMusical.Nacional).toBeDefined();
      expect(GeneroMusical.Nacional).toBe('nacional');
    });

    it('enum Reggaeton debe existir', () => {
      expect(GeneroMusical.Reggaeton).toBeDefined();
      expect(GeneroMusical.Reggaeton).toBe('reggaeton');
    });

    it('enum HipHop debe existir', () => {
      expect(GeneroMusical.HipHop).toBeDefined();
      expect(GeneroMusical.HipHop).toBe('hip_hop');
    });

    it('enum Clasica debe existir', () => {
      expect(GeneroMusical.Clasica).toBeDefined();
      expect(GeneroMusical.Clasica).toBe('clasica');
    });

    it('enum RB debe existir', () => {
      expect(GeneroMusical.RB).toBeDefined();
      expect(GeneroMusical.RB).toBe('r_and_b');
    });

    it('enum Blues debe existir', () => {
      expect(GeneroMusical.Blues).toBeDefined();
      expect(GeneroMusical.Blues).toBe('blues');
    });

    it('no debe tener valores duplicados', () => {
      const valores = Object.values(GeneroMusical);
      const valoresUnicos = new Set(valores);
      expect(valoresUnicos.size).toBe(valores.length);
    });

    it('todas las descripciones deben estar presentes', () => {
      const descripcionesValidas = Object.values(GeneroMusical).map(gen => {
        const desc = getGeneroMusicalDescription(gen);
        return desc !== undefined && desc.length > 0;
      });
      expect(descripcionesValidas.every(v => v)).toBe(true);
    });

    it('validador isValidGeneroMusical debe funcionar para todos los valores', () => {
      const todasValidas = Object.values(GeneroMusical).every(gen => isValidGeneroMusical(gen));
      expect(todasValidas).toBe(true);
    });

    it('validador debe rechazar valores inválidos', () => {
      expect(isValidGeneroMusical('invalido')).toBe(false);
      expect(isValidGeneroMusical('')).toBe(false);
      expect(isValidGeneroMusical(null)).toBe(false);
      expect(isValidGeneroMusical(undefined)).toBe(false);
    });
  });

  describe('EstiloPintura - Sincronía con spec.md', () => {
    it('debe tener exactamente 10 valores', () => {
      const valores = Object.values(EstiloPintura);
      expect(valores).toHaveLength(10);
    });

    it('debe contener exactamente los valores especificados en spec.md § 10', () => {
      const valoresActuales = Object.values(EstiloPintura);
      expect(valoresActuales).toHaveLength(estilosPinturaEsperados.length);
    });

    it('enum Realismo debe existir', () => {
      expect(EstiloPintura.Realismo).toBeDefined();
      expect(EstiloPintura.Realismo).toBe('realismo');
    });

    it('enum Abstraccion debe existir', () => {
      expect(EstiloPintura.Abstraccion).toBeDefined();
      expect(EstiloPintura.Abstraccion).toBe('abstraccion');
    });

    it('enum Impresionismo debe existir', () => {
      expect(EstiloPintura.Impresionismo).toBeDefined();
      expect(EstiloPintura.Impresionismo).toBe('impresionismo');
    });

    it('enum Surrealismo debe existir', () => {
      expect(EstiloPintura.Surrealismo).toBeDefined();
      expect(EstiloPintura.Surrealismo).toBe('surrealismo');
    });

    it('enum Expresionismo debe existir', () => {
      expect(EstiloPintura.Expresionismo).toBeDefined();
      expect(EstiloPintura.Expresionismo).toBe('expresionismo');
    });

    it('enum Cubismo debe existir', () => {
      expect(EstiloPintura.Cubismo).toBeDefined();
      expect(EstiloPintura.Cubismo).toBe('cubismo');
    });

    it('enum Fauvismo debe existir', () => {
      expect(EstiloPintura.Fauvismo).toBeDefined();
      expect(EstiloPintura.Fauvismo).toBe('fauvismo');
    });

    it('enum Dadaismo debe existir', () => {
      expect(EstiloPintura.Dadaismo).toBeDefined();
      expect(EstiloPintura.Dadaismo).toBe('dadaismo');
    });

    it('enum Constructivismo debe existir', () => {
      expect(EstiloPintura.Constructivismo).toBeDefined();
      expect(EstiloPintura.Constructivismo).toBe('constructivismo');
    });

    it('enum PopArt debe existir', () => {
      expect(EstiloPintura.PopArt).toBeDefined();
      expect(EstiloPintura.PopArt).toBe('pop_art');
    });

    it('no debe tener valores duplicados', () => {
      const valores = Object.values(EstiloPintura);
      const valoresUnicos = new Set(valores);
      expect(valoresUnicos.size).toBe(valores.length);
    });

    it('todas las descripciones deben estar presentes', () => {
      const descripcionesValidas = Object.values(EstiloPintura).map(est => {
        const desc = getEstiloPinturaDescription(est);
        return desc !== undefined && desc.length > 0;
      });
      expect(descripcionesValidas.every(v => v)).toBe(true);
    });

    it('validador isValidEstiloPintura debe funcionar para todos los valores', () => {
      const todasValidas = Object.values(EstiloPintura).every(est => isValidEstiloPintura(est));
      expect(todasValidas).toBe(true);
    });

    it('validador debe rechazar valores inválidos', () => {
      expect(isValidEstiloPintura('invalido')).toBe(false);
      expect(isValidEstiloPintura('')).toBe(false);
      expect(isValidEstiloPintura(null)).toBe(false);
      expect(isValidEstiloPintura(undefined)).toBe(false);
    });
  });

  describe('Sincronía global entre T004, T005, T006', () => {
    it('CategoriaInteres debe ser enum válido y exportado', () => {
      expect(CategoriaInteres).toBeDefined();
      expect(Object.keys(CategoriaInteres).length).toBeGreaterThan(0);
    });

    it('GeneroMusical debe ser enum válido y exportado', () => {
      expect(GeneroMusical).toBeDefined();
      expect(Object.keys(GeneroMusical).length).toBeGreaterThan(0);
    });

    it('EstiloPintura debe ser enum válido y exportado', () => {
      expect(EstiloPintura).toBeDefined();
      expect(Object.keys(EstiloPintura).length).toBeGreaterThan(0);
    });

    it('la suma de valores debe ser 32 (10 + 12 + 10)', () => {
      const totalCategorias = Object.values(CategoriaInteres).length;
      const totalGeneros = Object.values(GeneroMusical).length;
      const totalEstilos = Object.values(EstiloPintura).length;

      expect(totalCategorias + totalGeneros + totalEstilos).toBe(32);
    });

    it('no debe haber valores duplicados entre los tres enums', () => {
      const todosLosValores = [
        ...Object.values(CategoriaInteres),
        ...Object.values(GeneroMusical),
        ...Object.values(EstiloPintura),
      ];

      const valoresUnicos = new Set(todosLosValores);
      expect(valoresUnicos.size).toBe(todosLosValores.length);
    });

    it('cada enum debe poder instanciarse sin errores', () => {
      const categoriaValida = CategoriaInteres.Dibujo;
      const generoValido = GeneroMusical.Rock;
      const estiloValido = EstiloPintura.Realismo;

      expect(categoriaValida).toBeDefined();
      expect(generoValido).toBeDefined();
      expect(estiloValido).toBeDefined();
    });
  });
});
