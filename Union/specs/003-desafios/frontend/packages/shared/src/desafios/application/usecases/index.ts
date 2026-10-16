/**
 * Barrel de casos de uso
 *
 * Exporta todos los casos de uso agrupados por tipo:
 * - Lectura: ListarDesafios, ObtenerDesafio, ListarAmbitos, ListarSolicitudes, ListarRespuestas (T023)
 * - Desafíos: PublicarDesafio, EditarDesafio, EliminarDesafio (T024)
 * - Solicitudes: ProponerSolicitud, EditarSolicitud, EliminarSolicitud, AprobarSolicitud, RechazarSolicitud (T025)
 * - Respuestas: ResponderDesafio, EditarRespuesta, EliminarRespuesta (T026)
 *
 * Fuente de verdad: tasks.md, Fase 3
 */

export {
  ListarDesafios,
  ObtenerDesafio,
  ListarAmbitos,
  ListarSolicitudes,
  ListarRespuestas,
} from "./lectura";

export { PublicarDesafio, EditarDesafio, EliminarDesafio } from "./desafios";

export {
  ProponerSolicitud,
  EditarSolicitud,
  EliminarSolicitud,
  AprobarSolicitud,
  RechazarSolicitud,
} from "./solicitudes";

export { ResponderDesafio, EditarRespuesta, EliminarRespuesta } from "./respuestas";
