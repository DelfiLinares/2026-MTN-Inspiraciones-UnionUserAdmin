import React, { useCallback } from 'react';

/**
 * Props del componente BotonContinuar
 *
 * @property enabled - Determina si el botón está habilitado o deshabilitado
 * @property onClick - Callback ejecutado al hacer clic en el botón
 * @property loading - Indica si el botón está en estado de carga (opcional)
 */
interface Props {
  enabled: boolean;
  onClick: () => void;
  loading?: boolean;
}

/**
 * BotonContinuar Component
 *
 * Componente para botón "Continuar" con estados (enabled/disabled, loading).
 * Proporciona feedback visual claro al usuario.
 *
 * Requisitos: HU-06, RF-20, RNF-06
 * - RF-20: El cuestionario incluye un botón para continuar
 * - RNF-06: El botón de continuar es fácil de identificar
 *
 * @param props - Props del componente
 * @returns JSX.Element con botón estilizado
 */
export const BotonContinuar: React.FC<Props> = ({ enabled, onClick, loading = false }) => {
  const handleClick = useCallback(() => {
    if (enabled && !loading) {
      onClick();
    }
  }, [enabled, loading, onClick]);

  return (
    <button
      className="boton-continuar"
      onClick={handleClick}
      disabled={!enabled || loading}
      aria-label={loading ? 'Cargando...' : 'Continuar'}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <span className="boton-continuar__spinner" aria-hidden="true" />
          Cargando...
        </>
      ) : (
        'Continuar'
      )}
    </button>
  );
};

export default BotonContinuar;
