/**
 * Factory de adaptadores para DesafiosPort
 *
 * ESTRUCTURA LISTA PARA T091 (Configurar adaptador HTTP)
 *
 * Uso:
 * - Ambiente: dev/test → InMemoryDesafiosAdapter (datos de ejemplo)
 * - Ambiente: staging/prod → HttpDesafiosAdapter (API Java)
 *
 * Configuración mediante variable de entorno:
 * - VITE_DESAFIOS_ADAPTER=memoria (por defecto)
 * - VITE_DESAFIOS_ADAPTER=http (cuando se resuelva T089+T091)
 */

// TODO: Importar cuando existan
// import { InMemoryDesafiosAdapter } from '../../domain/desafios/infrastructure/InMemoryDesafiosAdapter'
// import { HttpDesafiosAdapter } from './HttpDesafiosAdapter'

/**
 * Selector de adaptador según configuración
 *
 * PENDIENTES T089+T091:
 * - Confirmar nombre de variable de entorno
 * - Confirmar valores posibles (memoria/http)
 * - Confirmar ubicación de InMemoryDesafiosAdapter en el monorepo
 */
export function crearAdaptadorDesafios(): any {
  // TODO: T089 + T091
  // const adapter = import.meta.env.VITE_DESAFIOS_ADAPTER || 'memoria'
  //
  // if (adapter === 'http') {
  //   // Cuando el API esté listo (T089 resuelto)
  //   return new HttpDesafiosAdapter()
  // }
  //
  // // Por defecto, usar en memoria
  // return new InMemoryDesafiosAdapter()

  // Placeholder por ahora
  throw new Error('Pendiente T089 + T091: Configurar selector de adaptador')
}

/**
 * Instancia singleton del adaptador
 * Se crea una sola vez y se reutiliza en toda la app
 */
export const desafiosAdapter = crearAdaptadorDesafios()
