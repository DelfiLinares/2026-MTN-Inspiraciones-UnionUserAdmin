import React, { useState } from 'react'

/**
 * T074 - TarjetaDesafio: Componente memoizado para tarjeta individual de desafío.
 *
 * Optimizaciones de rendimiento:
 * - React.memo para evitar re-renders innecesarios
 * - Lazy loading de imágenes (loading="lazy")
 * - Evento onClick para navegación
 *
 * Fuente: Union/specs/003-desafios/tasks.md (T074)
 * Dependencias: T038 (listado), T047 (tarjetas)
 */

export interface DesafioCardItem {
  id: string
  nombre: string
  fotoPrincipalUrl?: string
  ambitos: string[]
  fechaInicio?: string
  fechaFin?: string
  estado?: string
}

export interface TarjetaDesafioProps {
  desafio: DesafioCardItem
  onClick: (desafioId: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void
}

/**
 * Formatea una fecha ISO a formato local corto
 */
const formatearFecha = (valor?: string): string => {
  if (!valor) return '-'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return valor
  return fecha.toLocaleDateString('es-AR')
}

/**
 * Componente interno para la tarjeta
 */
const TarjetaDesafioInterno: React.FC<TarjetaDesafioProps> = ({
  desafio,
  onClick,
  onKeyDown,
}) => {
  const [imagenCargada, setImagenCargada] = useState(false)

  const handleClick = () => {
    onClick(desafio.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick(desafio.id)
    }
    onKeyDown?.(e)
  }

  return (
    <article
      className="desafio-card"
      tabIndex={0}
      role="link"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Ver desafío: ${desafio.nombre}`}
    >
      <div className="desafio-card-media">
        {desafio.fotoPrincipalUrl ? (
          <>
            {!imagenCargada && <div className="desafio-card-placeholder" aria-hidden="true" />}
            <img
              src={desafio.fotoPrincipalUrl}
              alt={desafio.nombre}
              loading="lazy"
              onLoad={() => setImagenCargada(true)}
              style={{ display: imagenCargada ? 'block' : 'none' }}
            />
          </>
        ) : (
          <div className="desafio-card-placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="desafio-card-contenido">
        <h2>{desafio.nombre}</h2>
        <p aria-live="polite">
          <strong>Estado:</strong>{' '}
          <span
            className={`estado-badge estado-${desafio.estado?.toLowerCase() ?? 'desconocido'}`}
            role="status"
          >
            {desafio.estado ?? 'Desconocido'}
          </span>
        </p>
        <p>
          <strong>Inicio:</strong> <span>{formatearFecha(desafio.fechaInicio)}</span>
        </p>
        <p>
          <strong>Fin:</strong> <span>{formatearFecha(desafio.fechaFin)}</span>
        </p>
        <p className="desafio-card-ambitos">
          {(desafio.ambitos ?? []).length > 0 ? (
            <>
              <span className="sr-only">Ámbitos: </span>
              {(desafio.ambitos ?? []).map((ambito) => (
                <span key={ambito}>#{ambito}</span>
              ))}
            </>
          ) : (
            <span className="sr-only">Sin ámbitos especificados</span>
          )}
        </p>
      </div>
    </article>
  )
}

/**
 * T074 - Componente memoizado para evitar re-renders innecesarios
 *
 * React.memo compara props con shallow equality:
 * - Cambios en propiedades del objeto desafio triggean re-render
 * - La función onClick se compara por referencia (optimizar con useCallback en padre)
 */
export const TarjetaDesafio = React.memo(TarjetaDesafioInterno, (prevProps, nextProps) => {
  // Retorna true si props son iguales (NO renderizar), false si diferente (SÍ renderizar)
  return (
    prevProps.desafio.id === nextProps.desafio.id &&
    prevProps.desafio.nombre === nextProps.desafio.nombre &&
    prevProps.desafio.fotoPrincipalUrl === nextProps.desafio.fotoPrincipalUrl &&
    prevProps.desafio.estado === nextProps.desafio.estado &&
    prevProps.desafio.ambitos.join(',') === nextProps.desafio.ambitos.join(',') &&
    prevProps.desafio.fechaInicio === nextProps.desafio.fechaInicio &&
    prevProps.desafio.fechaFin === nextProps.desafio.fechaFin
  )
})

TarjetaDesafio.displayName = 'TarjetaDesafio'

export default TarjetaDesafio
