import React, { useCallback } from 'react';
import { OpcionRespuesta } from '../../domain/entities/OpcionRespuesta';
import './cuestionario.css';

/**
 * Props para el componente OpcionSelector
 */
interface OpcionSelectorProps {
  /**
   * La opción a renderizar
   */
  opcion: OpcionRespuesta;

  /**
   * Si la opción está actualmente seleccionada
   */
  checked: boolean;

  /**
   * Callback cuando cambia el estado de selección
   * @param id ID de la opción
   * @param checked Nuevo estado (true = seleccionada, false = deseleccionada)
   */
  onChange: (id: string, checked: boolean) => void;

  /**
   * ID de la pregunta a la que pertenece la opción (para accesibilidad)
   * Opcional: se genera automáticamente si no se proporciona
   */
  preguntaId?: string;
}

/**
 * OpcionSelector
 *
 * Componente React reutilizable que renderiza una opción individual con checkbox y label.
 *
 * Características:
 * - Renderiza checkbox + label para cada opción
 * - Maneja cambios de estado con callback
 * - Diferenciación visual clara (checked/unchecked)
 * - Estilos coherentes con identidad
 * - Accesible: labels vinculados, semántica correcta
 * - Pequeño y reutilizable (usado por PreguntaForm)
 *
 * Requisitos:
 * - RF-10: Renderizado de opciones
 * - RNF-04: Feedback visual claro
 * - RNF-05: Accesibilidad
 *
 * Referencia: spec.md § 5.2, tasks.md § T015
 */
export const OpcionSelector: React.FC<OpcionSelectorProps> = ({
  opcion,
  checked,
  onChange,
  preguntaId = 'opcion',
}) => {
  /**
   * Genera ID único para el checkbox
   */
  const checkboxId = `${preguntaId}-${opcion.id}`;

  /**
   * Maneja el cambio de estado del checkbox
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(opcion.id, e.target.checked);
    },
    [opcion.id, onChange]
  );

  return (
    <div className="opcion-selector">
      <input
        id={checkboxId}
        type="checkbox"
        className="opcion-selector__checkbox"
        checked={checked}
        onChange={handleChange}
        aria-label={opcion.descripcion}
      />
      <label htmlFor={checkboxId} className="opcion-selector__label">
        {opcion.descripcion}
      </label>
    </div>
  );
};

export default OpcionSelector;
