/**
 * Barrel: Hooks para desafíos
 *
 * Exporta proveedores de contexto, hooks para acceder a la infraestructura, claves de consulta, configuración y consultas.
 */

export { DesafiosProvider } from "./DesafiosProvider";
export { useDesafiosPort } from "./DesafiosProvider";
export { clavesDesafios } from "./clavesDesafios";
export {
  configuracionQueries,
  configuracionMutations,
  configuracionPorDefectoDesafios,
  staleTimesPorTipo,
  puedeReintentarse,
} from "./configuracionConsultas";

// ============ Hooks de consultas (T039) ============
export { useListarDesafios } from "./useListarDesafios";
export { useObtenerDesafio } from "./useObtenerDesafio";
export { useListarAmbitos } from "./useListarAmbitos";

// ============ Hooks de consultas (T040) ============
export { useListarSolicitudes } from "./useListarSolicitudes";
export { useListarRespuestas } from "./useListarRespuestas";

// ============ Hooks de mutaciones (T041) ============
export { useMutacionesDesafio } from "./useMutacionesDesafio";

// ============ Hooks de mutaciones (T042) ============
export { useMutacionesSolicitud } from "./useMutacionesSolicitud";

// ============ Hooks de mutaciones (T043) ============
export { useMutacionesRespuesta } from "./useMutacionesRespuesta";
