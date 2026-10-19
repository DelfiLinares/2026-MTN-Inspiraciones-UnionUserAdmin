import React from 'react';
import './cuestionario.css';

/**
 * Props para el componente MensajeError
 */
interface MensajeErrorProps {
  /**
   * Mensaje de error a mostrar
   */
  mensaje: string;

  /**
   * Determina si el mensaje debe ser visible
   */
  visible: boolean;
}

/**
 * MensajeError
 *
 * Componente que renderiza un mensaje de error de validación.
 *
 * Características:
 * - Renderiza condicional basado en prop `visible`
 * - Styling: rojo/alert consistente con identidad de Inspiraciones
 * - Icono de advertencia (⚠)
 * - Animación suave de aparición
 * - Accesible: role="alert"
 * - Legible y destacado
 *
 * Requisitos:
 * - HU-06: Recibir mensajes de error claros
 * - RF-17: Si pregunta obligatoria está vacía → mostrar error claro
 * - RNF-07: Feedback visual claro de errores
 *
 * Referencia: spec.md § 5, tasks.md § T030
 */
export const MensajeError: React.FC<MensajeErrorProps> = ({ mensaje, visible }) => {
  // No renderizar nada si no es visible
  if (!visible) {
    return null;
  }

  return (
    <div className="mensaje-error" role="alert">
      <div className="mensaje-error__content">
        <span className="mensaje-error__icon" aria-hidden="true">
          ⚠
        </span>
        <span className="mensaje-error__text">{mensaje}</span>
      </div>
    </div>
  );
};

export default MensajeError;
