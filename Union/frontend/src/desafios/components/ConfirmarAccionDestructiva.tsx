/**
 * `ConfirmarAccionDestructiva`: Envoltorio de `ConfirmDialog` especializado para acciones destructivas
 * en el módulo de Desafíos.
 *
 * Fuente de verdad:
 * - Union/specs/003-desafios/spec.md (RF-22, CB-02, RNF-01)
 * - Union/specs/003-desafios/tasks.md (T052)
 * - Union/specs/003-desafios/plan.md (sección 3, principio 13)
 *
 * Responsabilidades:
 * - Centralizar confirmaciones explícitas para acciones destructivas/sensibles.
 * - Proporcionar variantes de peligro para diferenciación visual (RNF-01).
 * - Ofrecer textos y mensajes predefinidos por caso de uso.
 */

import React from 'react'
import { ConfirmDialog, ConfirmDialogProps } from '../../components/ConfirmDialog'

export type CasoAccionDestructiva =
  | 'eliminar-desafio'
  | 'editar-desafio-activo'
  | 'eliminar-solicitud'
  | 'editar-solicitud'
  | 'eliminar-respuesta'

interface TextosPorCaso {
  titulo: string
  mensaje: string
  textoConfirmar: string
}

const TEXTOS_POR_CASO: Record<CasoAccionDestructiva, TextosPorCaso> = {
  'eliminar-desafio': {
    titulo: '¿Eliminar desafío?',
    mensaje: 'Esta acción no se puede deshacer. El desafío será eliminado y las respuestas se ocultarán.',
    textoConfirmar: 'Eliminar desafío',
  },
  'editar-desafio-activo': {
    titulo: '¿Editar desafío activo?',
    mensaje:
      'Este desafío está activo o tiene respuestas. Confirma que deseas realizar cambios, ya que afectará a los usuarios que han respondido.',
    textoConfirmar: 'Confirmar cambios',
  },
  'eliminar-solicitud': {
    titulo: '¿Eliminar solicitud?',
    mensaje: 'Esta acción no se puede deshacer. La solicitud será eliminada permanentemente.',
    textoConfirmar: 'Eliminar solicitud',
  },
  'editar-solicitud': {
    titulo: '¿Editar solicitud?',
    mensaje: 'Los cambios se guardarán. Esta solicitud está en revisión.',
    textoConfirmar: 'Guardar cambios',
  },
  'eliminar-respuesta': {
    titulo: '¿Eliminar respuesta?',
    mensaje: 'Esta acción no se puede deshacer. La respuesta será eliminada permanentemente.',
    textoConfirmar: 'Eliminar respuesta',
  },
}

export interface ConfirmarAccionDestructivaProps
  extends Omit<ConfirmDialogProps, 'titulo' | 'mensaje' | 'textoConfirmar' | 'textoCancelar' | 'variante'> {
  /**
   * Caso de uso que define el título, mensaje y textos del botón.
   */
  caso: CasoAccionDestructiva
  /**
   * Opción de sobrescribir el título por defecto del caso.
   */
  tituloCustom?: string
  /**
   * Opción de sobrescribir el mensaje por defecto del caso.
   */
  mensajeCustom?: string
}

/**
 * Diálogo de confirmación para acciones destructivas en Desafíos.
 *
 * Proporciona variantes predefinidas con textos contextuales para:
 * - Eliminar desafíos, solicitudes y respuestas.
 * - Editar desafíos activos o con respuestas.
 *
 * @param caso - Tipo de acción destructiva (define textos y contexto).
 * @param tituloCustom - Sobrescribe el título del caso (opcional).
 * @param mensajeCustom - Sobrescribe el mensaje del caso (opcional).
 * @param abierto - Si el diálogo está visible.
 * @param confirmando - Si la acción está en progreso.
 * @param onConfirmar - Callback al confirmar.
 * @param onCancelar - Callback al cancelar.
 */
export const ConfirmarAccionDestructiva: React.FC<ConfirmarAccionDestructivaProps> = ({
  caso,
  tituloCustom,
  mensajeCustom,
  abierto,
  confirmando,
  onConfirmar,
  onCancelar,
}) => {
  const textos = TEXTOS_POR_CASO[caso]

  return (
    <ConfirmDialog
      abierto={abierto}
      titulo={tituloCustom || textos.titulo}
      mensaje={mensajeCustom || textos.mensaje}
      textoConfirmar={textos.textoConfirmar}
      textoCancelar="Cancelar"
      variante="peligro"
      confirmando={confirmando}
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
    />
  )
}
