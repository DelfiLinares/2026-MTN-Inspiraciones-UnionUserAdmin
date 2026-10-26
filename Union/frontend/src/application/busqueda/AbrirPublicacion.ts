import type { PublicacionResumen } from '../../domain/busqueda/PublicacionResumen'

/**
 * Plantilla de la ruta de detalle de publicación (T035).
 *
 * El detalle pertenece a otro módulo y hoy `routes/AppRoutes.tsx` no define una ruta para él.
 * Se centraliza aquí para que, cuando ese módulo la registre, solo haya que cambiar esta
 * constante. SUPUESTO: `/publicaciones/:id`.
 */
export const RUTA_DETALLE_PUBLICACION = '/publicaciones/:id'

/**
 * Resuelve el destino de navegación al detalle de una publicación (HU-06, RF-15).
 * No navega ni consulta nada: solo devuelve la ruta; la UI decide cómo navegar.
 * Acepta una publicación o su identificador.
 */
export class AbrirPublicacion {
  ejecutar(publicacion: Pick<PublicacionResumen, 'id'> | string): string {
    const id = typeof publicacion === 'string' ? publicacion : publicacion.id
    if (id.trim() === '') {
      throw new Error('AbrirPublicacion: el identificador de la publicación es obligatorio.')
    }
    return RUTA_DETALLE_PUBLICACION.replace(':id', encodeURIComponent(id))
  }
}
