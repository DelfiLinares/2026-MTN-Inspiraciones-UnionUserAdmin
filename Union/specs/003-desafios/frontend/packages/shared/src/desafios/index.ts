/**
 * Barrel del módulo compartido de desafíos (T034)
 *
 * Exporta la API pública del módulo:
 * - Puerto (DesafiosPort)
 * - Casos de uso (lectura, escritura, solicitudes, respuestas)
 * - Adaptadores (memoria, HTTP)
 * - Selector de adaptador
 * - Entidades de dominio
 * - Enums y errores
 *
 * Fuente de verdad:
 * - tasks.md: T034
 * - spec.md: Contrato del módulo
 */

// ============ Puerto (interfaz de contrato) ============
export type { DesafiosPort, FiltrosDesafios } from "./application/ports/DesafiosPort";
export type { DesafioResumen, Pagina, ParametrosPagina } from "./application/ports/tiposDesafios";

// ============ Casos de uso - Lectura ============
export { ListarDesafios } from "./application/usecases/lectura/ListarDesafios";
export { ObtenerDesafio } from "./application/usecases/lectura/ObtenerDesafio";
export { ListarAmbitos } from "./application/usecases/lectura/ListarAmbitos";
export { ListarSolicitudes } from "./application/usecases/lectura/ListarSolicitudes";
export { ListarRespuestas } from "./application/usecases/lectura/ListarRespuestas";

// ============ Casos de uso - Desafíos ============
export { PublicarDesafio } from "./application/usecases/desafios/PublicarDesafio";
export { EditarDesafio } from "./application/usecases/desafios/EditarDesafio";
export { EliminarDesafio } from "./application/usecases/desafios/EliminarDesafio";

// ============ Casos de uso - Solicitudes ============
export { ProponerSolicitud } from "./application/usecases/solicitudes/ProponerSolicitud";
export { EditarSolicitud } from "./application/usecases/solicitudes/EditarSolicitud";
export { EliminarSolicitud } from "./application/usecases/solicitudes/EliminarSolicitud";
export { AprobarSolicitud } from "./application/usecases/solicitudes/AprobarSolicitud";
export { RechazarSolicitud } from "./application/usecases/solicitudes/RechazarSolicitud";

// ============ Casos de uso - Respuestas ============
export { ResponderDesafio } from "./application/usecases/respuestas/ResponderDesafio";
export { EditarRespuesta } from "./application/usecases/respuestas/EditarRespuesta";
export { EliminarRespuesta } from "./application/usecases/respuestas/EliminarRespuesta";

// ============ Adaptadores ============
export { InMemoryDesafiosAdapter } from "./infrastructure/memoria/InMemoryDesafiosAdapter";
export { HttpDesafiosAdapter } from "./infrastructure/http/HttpDesafiosAdapter";
export { crearAdaptadorDesafios, obtenerTipoAdaptadorConfigurable } from "./infrastructure/crearAdaptadorDesafios";
export { mapearErrorDesafios } from "./infrastructure/http/mapearErrorDesafios";

// ============ Hooks (T036) ============
export { DesafiosProvider } from "./hooks/DesafiosProvider";
export { useDesafiosPort } from "./hooks/DesafiosProvider";

// ============ Claves de React Query (T037) ============
export { clavesDesafios } from "./hooks/clavesDesafios";

// ============ Configuración de React Query (T038) ============
export {
  configuracionQueries,
  configuracionMutations,
  configuracionPorDefectoDesafios,
  staleTimesPorTipo,
  puedeReintentarse,
} from "./hooks/configuracionConsultas";

// ============ Hooks de consultas (T039) ============
export { useListarDesafios } from "./hooks/useListarDesafios";
export { useObtenerDesafio } from "./hooks/useObtenerDesafio";
export { useListarAmbitos } from "./hooks/useListarAmbitos";

// ============ Hooks de consultas (T040) ============
export { useListarSolicitudes } from "./hooks/useListarSolicitudes";
export { useListarRespuestas } from "./hooks/useListarRespuestas";

// ============ Hooks de mutaciones (T041) ============
export { useMutacionesDesafio } from "./hooks/useMutacionesDesafio";

// ============ Hooks de mutaciones (T042) ============
export { useMutacionesSolicitud } from "./hooks/useMutacionesSolicitud";

// ============ Hooks de mutaciones (T043) ============
export { useMutacionesRespuesta } from "./hooks/useMutacionesRespuesta";

// ============ Datos de ejemplo (T028) ============
export { ambitosEjemplo, desafiosEjemplo, inyectarDatosEjemplo } from "./infrastructure/memoria/datosEjemplo";

// ============ Sesiones simuladas (T035) ============
export { SESION_USUARIO, SESION_ADMIN } from "./infrastructure/memoria/sesionesSimuladas";

// ============ Entidades de dominio ============
export { Desafio, type DatosDesafio } from "./domain/entidades/Desafio";
export { SolicitudDesafio } from "./domain/entidades/SolicitudDesafio";
export { RespuestaDesafio } from "./domain/entidades/RespuestaDesafio";
export { AmbitoDesafio } from "./domain/AmbitoDesafio";
export { Foto, FormatoFoto } from "./domain/Foto";
export { RangoFechas, type OpcionesEstadoRango } from "./domain/RangoFechas";
export { SesionActual } from "./domain/SesionActual";

// ============ Enums ============
export { EstadoDesafio } from "./domain/enums/EstadoDesafio";
export { EstadoSolicitudDesafio } from "./domain/enums/EstadoSolicitudDesafio";
export { TipoFiltroDesafio } from "./domain/enums/TipoFiltroDesafio";

// ============ Errores de dominio ============
export {
  ErrorValidacion,
  TransicionInvalida,
  PermisoDenegado,
} from "./domain/errores/ErroresDominio";
