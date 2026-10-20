import { Pregunta } from '../domain/entities/Pregunta';
import { OpcionRespuesta } from '../domain/entities/OpcionRespuesta';
import { CategoriaInteres } from '../domain/enums/CategoriaInteres';
import { GeneroMusical } from '../domain/enums/GeneroMusical';
import { EstiloPintura } from '../domain/enums/EstiloPintura';
import type { CatalogoOnboardingDTO, CategoriaOnboardingDTO } from './dto/OnboardingInteresesDTO';

/**
 * CuestionarioFactory
 *
 * Factory que crea el cuestionario default del módulo 006 (Cuestionario de Intereses).
 *
 * Responsabilidades:
 * - Crear un array de 3 preguntas predefinidas
 * - Cada pregunta contiene sus opciones de respuesta
 * - Garantizar consistencia entre opciones y enums
 * - Mantener el orden: Intereses → Géneros → Estilos
 *
 * Requisitos:
 * - RF-03: Cuestionario con 3 preguntas
 * - RF-04: Intereses artísticos
 * - RF-05: Géneros musicales
 * - RF-06: Estilos de pintura
 * - A-2: Sincronía con enums
 *
 * Referencia: spec.md § 6, data-model.md § 2
 */
export class CuestionarioFactory {
  /**
   * Crea el cuestionario default con 3 preguntas.
   *
   * Orden:
   * 1. Intereses artísticos (obligatoria, multi-selección) → 10 opciones
   * 2. Géneros musicales (obligatoria, multi-selección) → 12 opciones
   * 3. Estilos de pintura (opcional, multi-selección) → 10 opciones
   *
   * @returns Array con 3 Preguntas configuradas
   */
  static crearCuestionarioDefault(): Pregunta[] {
    return [
      this.crearPregunta1Intereses(),
      this.crearPregunta2Generos(),
      this.crearPregunta3Estilos(),
    ];
  }

  static crearCuestionarioDesdeCatalogo(catalogo: CatalogoOnboardingDTO): Pregunta[] {
    return [
      Pregunta.crear(
        'pregunta-1-intereses',
        '¿Cuáles son tus intereses artísticos?',
        this.crearOpcionesCatalogo(catalogo.generos),
        true,
        true
      ),
      Pregunta.crear(
        'pregunta-2-generos',
        '¿Cuáles son tus géneros musicales favoritos?',
        this.crearOpcionesCatalogo(catalogo.tiposMusica),
        true,
        true
      ),
      Pregunta.crear(
        'pregunta-3-estilos',
        '¿Cuáles son tus estilos de pintura favoritos?',
        this.crearOpcionesCatalogo(catalogo.estilos),
        true,
        false
      ),
    ];
  }

  private static crearOpcionesCatalogo(categorias: CategoriaOnboardingDTO[]): OpcionRespuesta[] {
    return categorias.map((categoria) =>
      OpcionRespuesta.crear(categoria.codigo, categoria.codigo, categoria.nombre)
    );
  }

  /**
   * Crea Pregunta 1: Intereses Artísticos
   *
   * Obligatoria con 10 opciones basadas en CategoriaInteres enum.
   *
   * @returns Pregunta sobre intereses artísticos
   */
  private static crearPregunta1Intereses(): Pregunta {
    const opciones: OpcionRespuesta[] = [
      OpcionRespuesta.crear(
        'interes-dibujo',
        CategoriaInteres.Dibujo,
        'Dibujo'
      ),
      OpcionRespuesta.crear(
        'interes-escultura',
        CategoriaInteres.Escultura,
        'Escultura'
      ),
      OpcionRespuesta.crear(
        'interes-fotografia',
        CategoriaInteres.Fotografia,
        'Fotografía'
      ),
      OpcionRespuesta.crear(
        'interes-literatura',
        CategoriaInteres.Literatura,
        'Literatura'
      ),
      OpcionRespuesta.crear(
        'interes-escultura-digital',
        CategoriaInteres.EsculuraDigital,
        'Escultura Digital'
      ),
      OpcionRespuesta.crear(
        'interes-pintura-digital',
        CategoriaInteres.PinturaDigital,
        'Pintura Digital'
      ),
      OpcionRespuesta.crear(
        'interes-instalacion',
        CategoriaInteres.Instalacion,
        'Instalación'
      ),
      OpcionRespuesta.crear(
        'interes-performance',
        CategoriaInteres.Performance,
        'Performance'
      ),
      OpcionRespuesta.crear(
        'interes-video-arte',
        CategoriaInteres.VideoArte,
        'Video Arte'
      ),
      OpcionRespuesta.crear(
        'interes-cine-audiovisual',
        CategoriaInteres.CineAudiovisual,
        'Cine Audiovisual'
      ),
    ];

    return Pregunta.crear(
      'pregunta-1-intereses',
      '¿Cuáles son tus intereses artísticos?',
      opciones,
      true, // permiteMultipleSelecciones
      true  // obligatoria
    );
  }

  /**
   * Crea Pregunta 2: Géneros Musicales
   *
   * Obligatoria con 12 opciones basadas en GeneroMusical enum.
   *
   * @returns Pregunta sobre géneros musicales preferidos
   */
  private static crearPregunta2Generos(): Pregunta {
    const opciones: OpcionRespuesta[] = [
      OpcionRespuesta.crear(
        'genero-rock',
        GeneroMusical.Rock,
        'Rock'
      ),
      OpcionRespuesta.crear(
        'genero-pop',
        GeneroMusical.Pop,
        'Pop'
      ),
      OpcionRespuesta.crear(
        'genero-electronica',
        GeneroMusical.Electronica,
        'Electrónica'
      ),
      OpcionRespuesta.crear(
        'genero-metal',
        GeneroMusical.Metal,
        'Metal'
      ),
      OpcionRespuesta.crear(
        'genero-k-pop',
        GeneroMusical.KPop,
        'K-Pop'
      ),
      OpcionRespuesta.crear(
        'genero-country',
        GeneroMusical.Country,
        'Country'
      ),
      OpcionRespuesta.crear(
        'genero-nacional',
        GeneroMusical.Nacional,
        'Nacional'
      ),
      OpcionRespuesta.crear(
        'genero-reggaeton',
        GeneroMusical.Reggaeton,
        'Reggaeton'
      ),
      OpcionRespuesta.crear(
        'genero-hip-hop',
        GeneroMusical.HipHop,
        'Hip-Hop'
      ),
      OpcionRespuesta.crear(
        'genero-clasica',
        GeneroMusical.Clasica,
        'Clásica'
      ),
      OpcionRespuesta.crear(
        'genero-r-and-b',
        GeneroMusical.RB,
        'R&B'
      ),
      OpcionRespuesta.crear(
        'genero-blues',
        GeneroMusical.Blues,
        'Blues'
      ),
    ];

    return Pregunta.crear(
      'pregunta-2-generos',
      '¿Cuáles son tus géneros musicales favoritos?',
      opciones,
      true, // permiteMultipleSelecciones
      true  // obligatoria
    );
  }

  /**
   * Crea Pregunta 3: Estilos de Pintura
   *
   * Opcional con 10 opciones basadas en EstiloPintura enum.
   *
   * @returns Pregunta sobre estilos de pintura preferidos
   */
  private static crearPregunta3Estilos(): Pregunta {
    const opciones: OpcionRespuesta[] = [
      OpcionRespuesta.crear(
        'estilo-realismo',
        EstiloPintura.Realismo,
        'Realismo'
      ),
      OpcionRespuesta.crear(
        'estilo-abstraccion',
        EstiloPintura.Abstraccion,
        'Abstracción'
      ),
      OpcionRespuesta.crear(
        'estilo-impresionismo',
        EstiloPintura.Impresionismo,
        'Impresionismo'
      ),
      OpcionRespuesta.crear(
        'estilo-surrealismo',
        EstiloPintura.Surrealismo,
        'Surrealismo'
      ),
      OpcionRespuesta.crear(
        'estilo-expresionismo',
        EstiloPintura.Expresionismo,
        'Expresionismo'
      ),
      OpcionRespuesta.crear(
        'estilo-cubismo',
        EstiloPintura.Cubismo,
        'Cubismo'
      ),
      OpcionRespuesta.crear(
        'estilo-fauvismo',
        EstiloPintura.Fauvismo,
        'Fauvismo'
      ),
      OpcionRespuesta.crear(
        'estilo-dadaismo',
        EstiloPintura.Dadaismo,
        'Dadaísmo'
      ),
      OpcionRespuesta.crear(
        'estilo-constructivismo',
        EstiloPintura.Constructivismo,
        'Constructivismo'
      ),
      OpcionRespuesta.crear(
        'estilo-pop-art',
        EstiloPintura.PopArt,
        'Pop Art'
      ),
    ];

    return Pregunta.crear(
      'pregunta-3-estilos',
      '¿Cuáles son tus estilos de pintura favoritos?',
      opciones,
      true, // permiteMultipleSelecciones
      false // opcional
    );
  }
}

export default CuestionarioFactory;
