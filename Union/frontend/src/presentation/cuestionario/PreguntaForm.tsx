import React, { useCallback, useState } from 'react';
import { Pregunta } from '../../domain/entities/Pregunta';
import { CuestionarioService } from '../../application/CuestionarioService';
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

  /**
   * Callback opcional cuando hay error de validación
   */
  onValidationError?: (error: string) => void;
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
 * - Valida selecciones usando CuestionarioService.validarSeleccion()
 * - Si opción inválida: bloquea cambio y muestra error
 * - Diferencia visualmente opciones seleccionadas
 * - Soporta selección única y múltiple
 * - Accesible: labels vinculados, semantica correcta
 *
 * Requisitos:
 * - HU-02: Preguntas sobre intereses artísticos
 * - HU-03: Preguntas sobre géneros musicales
 * - HU-04: Preguntas sobre estilos de pintura
 * - HU-05: Seleccionar/deseleccionar/modificar respuestas
 * - RF-08: Almacenamiento de respuestas por pregunta
 * - RF-09: Selección/deselección de opciones
 * - RF-10: Renderizado de opciones
 * - RF-16: Validación de selecciones
 * - RF-19: No permitir selecciones inválidas
 * - RNF-03: Interacción intuitiva
 * - RNF-04: Feedback visual claro
 * - RNF-05: Accesibilidad
 * - RNF-20: Validación separada de presentación
 *
 * Referencia: spec.md § 5.2, plan.md § 4, tasks.md § T028
 */
export const PreguntaForm: React.FC<PreguntaFormProps> = ({
  pregunta,
  respuestasSeleccionadas,
  onSeleccionar,
  onDeseleccionar,
  onValidationError,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Maneja el cambio de estado de un checkbox
   * Valida la selección antes de actualizar el estado
   */
  const handleCheckboxChange = useCallback(
    (idOpcion: string, checked: boolean) => {
      // Validar la selección usando CuestionarioService
      const resultado = CuestionarioService.validarSeleccion(pregunta, idOpcion);

      if (!resultado.valida) {
        // Opción inválida: no cambiar estado, mostrar error
        const errorMsg = resultado.error || 'Opción inválida';
        setErrorMessage(errorMsg);
        onValidationError?.(errorMsg);
        return;
      }

      // Validación pasada: proceder con la selección/deselección
      setErrorMessage(null);

      if (checked) {
        onSeleccionar(idOpcion);
      } else {
        onDeseleccionar(idOpcion);
      }
    },
    [pregunta, onSeleccionar, onDeseleccionar, onValidationError]
  );

  return (
    <fieldset className="pregunta-form">
      <legend className="pregunta-form__titulo">{pregunta.texto}</legend>

      {/* Mostrar mensaje de error si hay validación fallida */}
      {errorMessage && (
        <div className="pregunta-form__error" role="alert">
          {errorMessage}
        </div>
      )}

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
