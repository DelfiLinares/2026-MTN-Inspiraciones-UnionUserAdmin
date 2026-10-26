import { PublicacionResumen } from '../../domain/busqueda/PublicacionResumen'
import { CatalogoFiltros } from '../../domain/busqueda/CatalogoFiltros'
import { EstadoPublicacion } from '../../domain/enums/EstadoPublicacion'
import { TipoContenido } from '../../domain/enums/TipoContenido'

/**
 * Datos de ejemplo del adaptador en memoria (T020a). No es un servidor ni un mock de red.
 * Nunca incluyen publicaciones ELIMINADA (RF-16).
 */
export interface PublicacionEjemplo {
  readonly resumen: PublicacionResumen
  readonly estilos: readonly string[]
  readonly tecnicas: readonly string[]
  readonly tiposArte: readonly string[]
  /** Etiquetas/descripción para la búsqueda por texto. */
  readonly tags: readonly string[]
}

export const CATALOGO_EJEMPLO = new CatalogoFiltros({
  estilos: [
    { valor: 'abstracto', etiqueta: 'Abstracto' },
    { valor: 'realista', etiqueta: 'Realista' },
    { valor: 'minimalista', etiqueta: 'Minimalista' },
  ],
  tecnicas: [
    { valor: 'acuarela', etiqueta: 'Acuarela' },
    { valor: 'oleo', etiqueta: 'Óleo' },
    { valor: 'digital', etiqueta: 'Digital' },
  ],
  tiposArte: [
    { valor: 'pintura', etiqueta: 'Pintura' },
    { valor: 'ilustracion', etiqueta: 'Ilustración' },
    { valor: 'escultura', etiqueta: 'Escultura' },
  ],
})

const AUTORES = [
  { id: 'a1', nombre: 'Lucía Fernández' },
  { id: 'a2', nombre: 'Martín Gómez' },
  { id: 'a3', nombre: 'Sofía Ramírez' },
  { id: 'a4', nombre: 'Diego Paz' },
]
const TIPOS = [TipoContenido.IMAGEN, TipoContenido.VIDEO, TipoContenido.MUSICA, TipoContenido.TUTORIAL]
const ESTILOS = CATALOGO_EJEMPLO.estilos.map((o) => o.valor)
const TECNICAS = CATALOGO_EJEMPLO.tecnicas.map((o) => o.valor)
const TIPOS_ARTE = CATALOGO_EJEMPLO.tiposArte.map((o) => o.valor)
const TEMAS = ['paisaje', 'retrato', 'ciudad', 'naturaleza', 'mar']

const CANTIDAD = 55

/** 55 publicaciones deterministas (3 páginas de 20 con la última parcial). */
export const PUBLICACIONES_EJEMPLO: readonly PublicacionEjemplo[] = Object.freeze(
  Array.from({ length: CANTIDAD }, (_, i): PublicacionEjemplo => {
    const n = i + 1
    const tema = TEMAS[i % TEMAS.length]
    const estilo = ESTILOS[i % ESTILOS.length]
    const tecnica = TECNICAS[(i + 1) % TECNICAS.length]
    const tipoArte = TIPOS_ARTE[(i + 2) % TIPOS_ARTE.length]
    return {
      resumen: new PublicacionResumen({
        id: `pub-${String(n).padStart(3, '0')}`,
        titulo: `Obra ${n}: ${tema} ${estilo}`,
        autor: AUTORES[i % AUTORES.length],
        miniaturaUrl: `https://example.com/miniaturas/pub-${n}.jpg`,
        tipoContenido: TIPOS[i % TIPOS.length],
        estado: i % 11 === 10 ? EstadoPublicacion.REPORTADA : EstadoPublicacion.ACTIVA,
      }),
      estilos: [estilo],
      tecnicas: [tecnica],
      tiposArte: [tipoArte],
      tags: [tema, estilo, tecnica],
    }
  }),
)
