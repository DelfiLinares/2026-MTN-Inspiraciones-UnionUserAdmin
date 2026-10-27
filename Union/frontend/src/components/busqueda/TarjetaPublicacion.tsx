import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AbrirPublicacion } from '../../application/busqueda/AbrirPublicacion'
import type { PublicacionResumen } from '../../domain/busqueda/PublicacionResumen'
import { TipoContenido } from '../../domain/enums/TipoContenido'
import './busqueda.css'

const ETIQUETA_TIPO: Readonly<Record<TipoContenido, string>> = {
  [TipoContenido.TEXTO]: 'Texto',
  [TipoContenido.MIXTO]: 'Imagen y texto',
  [TipoContenido.IMAGEN]: 'Imagen',
  [TipoContenido.VIDEO]: 'Video',
  [TipoContenido.MUSICA]: 'Música',
  [TipoContenido.TUTORIAL]: 'Tutorial',
  [TipoContenido.ESCULTURA]: 'Escultura',
  [TipoContenido.DIGITAL]: 'Digital',
}

const abrirPublicacion = new AbrirPublicacion()

export interface TarjetaPublicacionProps {
  readonly publicacion: PublicacionResumen
}

/**
 * Tarjeta de una publicación (T041; HU-06, RF-15, RF-26; CA-06.1, CA-06.2, CA-06.4).
 * Solo lectura: miniatura, título, autor y tipo de contenido, sin acciones rápidas.
 * Toda la tarjeta es un único enlace al detalle (la ruta la resuelve `AbrirPublicacion`).
 * La miniatura es diferida y su contenedor reserva el espacio con `aspect-ratio` (CSS); si la
 * imagen falla se muestra un placeholder sin cambiar el tamaño del contenedor.
 */
export function TarjetaPublicacion({ publicacion }: TarjetaPublicacionProps) {
  const [imagenFallida, setImagenFallida] = useState(false)

  return (
    <article className="tarjeta-publicacion">
      <Link to={abrirPublicacion.ejecutar(publicacion)} className="tarjeta-publicacion__enlace">
        <div className="tarjeta-publicacion__miniatura" data-testid="tarjeta-miniatura">
          {imagenFallida || !publicacion.miniaturaUrl ? (
            <div
              role="img"
              aria-label="Imagen no disponible"
              className="tarjeta-publicacion__placeholder"
            />
          ) : (
            <img
              src={publicacion.miniaturaUrl}
              alt={publicacion.titulo}
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={() => setImagenFallida(true)}
            />
          )}
        </div>
        <div className="tarjeta-publicacion__cuerpo">
          <h3 className="tarjeta-publicacion__titulo">{publicacion.titulo}</h3>
          <p className="tarjeta-publicacion__autor">{publicacion.autor.nombre}</p>
          <p className="tarjeta-publicacion__tipo">{ETIQUETA_TIPO[publicacion.tipoContenido]}</p>
        </div>
      </Link>
    </article>
  )
}
