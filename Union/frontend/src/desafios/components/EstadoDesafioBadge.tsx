import React from 'react'

/**
 * T046 - EstadoDesafioBadge: Componente para mostrar el estado de un desafío.
 *
 * Requisito RNF-01: mostrar estado con texto y clase visual, no solo color.
 * Soporta estados: ACTIVO, PROGRAMADO, FINALIZADO, ELIMINADO, DESCONOCIDO
 *
 * Fuente: Union/specs/003-desafios/tasks.md (T046)
 */

export interface EstadoDesafioBadgeProps {
  estado?: string
  className?: string
}

/**
 * Componente que renderiza el badge del estado de un desafío.
 * Usa clase CSS para styling y texto para accesibilidad.
 */
export const EstadoDesafioBadge: React.FC<EstadoDesafioBadgeProps> = ({
  estado,
  className = '',
}) => {
  const estadoNormalizado = estado?.toLowerCase() ?? 'desconocido'
  const estadoMostrado = estado?.trim() ? estado : 'Desconocido'

  return (
    <span
      className={`estado-badge estado-${estadoNormalizado} ${className}`.trim()}
      role="status"
    >
      {estadoMostrado}
    </span>
  )
}

export default EstadoDesafioBadge
