import React, { useCallback, useState } from 'react';
import { Pregunta } from '../../domain/entities/Pregunta';
import { RespuestaCuestionario } from '../../domain/entities/RespuestaCuestionario';
import { CuestionarioService } from '../../application/CuestionarioService';

/**
 * Props del componente BotonContinuar
 *
 * @property enabled - Determina si el botón está habilitado o deshabilitado
 * @property onClick - Callback ejecutado al hacer clic en el botón (solo si validación pasa)
 * @property loading - Indica si el botón está en estado de carga (opcional)
 * @property respuestas - Respuestas del cuestionario a validar (opcional)
 * @property preguntas - Array de preguntas del cuestionario (opcional)
 * @property onValidationError - Callback cuando hay error de validación (opcional)
 */
interface Props {
  enabled: boolean;
  onClick: () => void;
  loading?: boolean;
  respuestas?: RespuestaCuestionario;
  preguntas?: Pregunta[];
  onValidationError?: (errores: Map<string, string>) => void;
}

/**
 * BotonContinuar Component
 *
 * Componente para botón "Continuar" con estados (enabled/disabled, loading).
 * Proporciona feedback visual claro al usuario.
 *
 * Características:
 * - Valida respuestas antes de permitir continuar
 * - Si validación falla: bloquea click y muestra errores
 * - Si validación pasa: ejecuta onClick
 * - Estados: enabled/disabled, loading
 * - Feedback visual claro (spinner en loading)
 *
 * Requisitos:
 * - HU-06: Recibir mensajes de error claros si falta responder obligatorias
 * - RF-16: Validar que preguntas obligatorias tengan respuesta
 * - RF-17: Mostrar mensaje de error claro
 * - RF-19: No permitir continuar si hay validaciones incompletas
 * - RF-20: El cuestionario incluye un botón para continuar
 * - RNF-06: El botón de continuar es fácil de identificar
 * - RNF-07: Feedback visual claro
 * - RNF-20: Validación separada de presentación
 *
 * Referencia: spec.md § 5.3, plan.md § 4, tasks.md § T029
 *
 * @param props - Props del componente
 * @returns JSX.Element con botón estilizado
 */
export const BotonContinuar: React.FC<Props> = ({
  enabled,
  onClick,
  loading = false,
  respuestas,
  preguntas,
  onValidationError,
}) => {
  const [validationErrors, setValidationErrors] = useState<Map<string, string> | null>(null);

  const handleClick = useCallback(() => {
    if (!enabled || loading) {
      return;
    }

    // Si hay respuestas y preguntas, validar completitud antes de continuar
    if (respuestas && preguntas && preguntas.length > 0) {
      const resultado = CuestionarioService.validarCompletitud(respuestas, preguntas);

      if (!resultado.valida && resultado.errores) {
        // Validación falló: mostrar errores y llamar callback
        setValidationErrors(resultado.errores);
        onValidationError?.(resultado.errores);
        return;
      }

      // Validación pasó: limpiar errores previos
      setValidationErrors(null);
    }

    // Ejecutar onClick si validación pasó (o no hay validación requerida)
    onClick();
  }, [enabled, loading, onClick, respuestas, preguntas, onValidationError]);

  return (
    <>
      {validationErrors && validationErrors.size > 0 && (
        <div className="boton-continuar__error-container" role="alert">
          <div className="boton-continuar__error-title">
            Por favor, complete las siguientes preguntas:
          </div>
          <ul className="boton-continuar__error-list">
            {Array.from(validationErrors.values()).map((error, index) => (
              <li key={index} className="boton-continuar__error-item">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

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
    </>
  );
};

export default BotonContinuar;
