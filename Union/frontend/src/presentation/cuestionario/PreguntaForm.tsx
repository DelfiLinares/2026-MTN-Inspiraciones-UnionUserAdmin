import React, { useCallback } from 'react';
import { Pregunta } from '../../domain/entities/Pregunta';
import './cuestionario.css';

/**
 * Props para el componente PreguntaForm
 */
interface PreguntaFormProps {
  /**
   * La pregunta a renderizar
   */
  pregunta: Pregunta;

  /**
   * Set de IDs de opciones seleccionadas actualmente
   */
  respuestasSeleccionadas: Set<string>;

  /**
   * Callback cuando se selecciona una opción
   */
  onSeleccionar: (idOpcion: string) => void;

  /**
   * Callback cuando se deselecciona una opción
   */
  onDeseleccionar: (idOpcion: string) => void;
}

/**
 * PreguntaForm
 *
 * Componente React que renderiza una pregunta del cuestionario con sus opciones.
 *
 * Características:
 * - Muestra título (texto de la pregunta)
 * - Renderiza cada opción como checkbox con label
 * - Maneja selección/deselección de opciones
 * - Diferencia visualmente opciones seleccionadas
 * - Soporta selección única y múltiple
 * - Accesible: labels vinculados, semantica correcta
 *
 * Requisitos:
 * - HU-02: Preguntas sobre intereses artísticos
 * - HU-03: Preguntas sobre géneros musicales
 * - HU-04: Preguntas sobre estilos de pintura
 * - RF-08: Almacenamiento de respuestas por pregunta
 * - RF-09: Selección/deselección de opciones
 * - RF-10: Renderizado de opciones
 * - RNF-03: Interacción intuitiva
 * - RNF-04: Feedback visual claro
 * - RNF-05: Accesibilidad
 *
 * Referencia: spec.md § 5.2, tasks.md § T014
 */
export const PreguntaForm: React.FC<PreguntaFormProps> = ({
  pregunta,
  respuestasSeleccionadas,
  onSeleccionar,
  onDeseleccionar,
}) => {
  /**
   * Maneja el cambio de estado de un checkbox
   */
  const handleCheckboxChange = useCallback(
    (idOpcion: string, checked: boolean) => {
      if (checked) {
        onSeleccionar(idOpcion);
      } else {
        onDeseleccionar(idOpcion);
      }
    },
    [onSeleccionar, onDeseleccionar]
  );

  return (
    <fieldset className="pregunta-form">
      <legend className="pregunta-form__titulo">{pregunta.texto}</legend>

      <div className="pregunta-form__opciones">
        {pregunta.opciones.map((opcion) => {
          const isChecked = respuestasSeleccionadas.has(opcion.id);

          return (
            <div key={opcion.id} className="pregunta-form__opcion">
              <input
                type="checkbox"
                id={`opcion-${pregunta.id}-${opcion.id}`}
                className="pregunta-form__checkbox"
                checked={isChecked}
                onChange={(e) => handleCheckboxChange(opcion.id, e.target.checked)}
                aria-label={opcion.descripcion}
              />
              <label
                htmlFor={`opcion-${pregunta.id}-${opcion.id}`}
                className="pregunta-form__label"
              >
                {opcion.descripcion}
              </label>
            </div>
          );
        })}
      </div>

      {pregunta.obligatoria && (
        <span className="pregunta-form__requerida" aria-label="Campo requerido">
          *
        </span>
      )}
    </fieldset>
  );
};

export default PreguntaForm;
