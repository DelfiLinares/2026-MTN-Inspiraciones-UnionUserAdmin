/**
 * Barrel export para componentes del módulo de Desafíos.
 *
 * Fuente de verdad:
 * - Union/specs/003-desafios/tasks.md (T052, T053, T054, T055, T056, T061)
 * - Union/specs/003-desafios/plan.md (sección 4)
 */

export { ConfirmarAccionDestructiva } from './ConfirmarAccionDestructiva'
export type { ConfirmarAccionDestructivaProps, CasoAccionDestructiva } from './ConfirmarAccionDestructiva'

export { FormularioDesafio } from './FormularioDesafio'
export type { FormularioDesafioProps } from './FormularioDesafio'

export { FormularioSolicitud } from './FormularioSolicitud'
export type { FormularioSolicitudProps } from './FormularioSolicitud'

export { FormularioRespuesta } from './FormularioRespuesta'
export type { FormularioRespuestaProps } from './FormularioRespuesta'

export { ListaRespuestas } from './ListaRespuestas'
export type { ListaRespuestasProps } from './ListaRespuestas'

export { RespuestasDesafioSection } from './RespuestasDesafioSection'
export type { RespuestasDesafioSectionProps } from './RespuestasDesafioSection'

export { ModeracionRespuestasSection } from './ModeracionRespuestasSection'
export type { ModeracionRespuestasSectionProps } from './ModeracionRespuestasSection'

export {
  EstadoVacioDesafios,
  EstadoCargandoDesafios,
  EstadoErrorRedDesafios,
} from './EstadoVacioDesafios'
export type {
  EstadoVacioDesafiosProps,
  VarianteEstadoVacioDesafios,
  EstadoCargandoDesafiosProps,
  EstadoErrorRedDesafiosProps,
} from './EstadoVacioDesafios'

export { EstadoDesafioBadge } from './EstadoDesafioBadge'
export type { EstadoDesafioBadgeProps } from './EstadoDesafioBadge'

export { FiltrosDesafio } from './FiltrosDesafio'
export type { FiltrosDesafioProps } from './FiltrosDesafio'

export { TarjetaDesafio } from './TarjetaDesafio'
export type { TarjetaDesafioProps, DesafioCardItem } from './TarjetaDesafio'