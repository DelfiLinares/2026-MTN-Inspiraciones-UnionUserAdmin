/**
 * Barrel: Infraestructura completa de desafíos
 *
 * Re-exporta adaptadores (en memoria, HTTP) y selector de adaptador.
 */

export { InMemoryDesafiosAdapter, SESION_USUARIO, SESION_ADMIN } from "./memoria";
export { HttpDesafiosAdapter, mapearErrorDesafios } from "./http";
export { crearAdaptadorDesafios, obtenerTipoAdaptadorConfigurable } from "./crearAdaptadorDesafios";
