import React from 'react';
import { PropsFormularioRecuperacion } from '../../../types/recuperacion';

/**
 * FormularioRecuperacion
 *
 * Componente funcional que renderiza el formulario de recuperación de contraseña.
 * Contiene:
 * - Input email con validación visual
 * - Mensaje de error si existe
 * - Botón "Continuar" para enviar
 * - Botón "Regresar" para volver
 *
 * @param props - PropsFormularioRecuperacion con estado y handlers
 * @returns JSX.Element del formulario
 */
export const FormularioRecuperacion: React.FC<PropsFormularioRecuperacion> = ({
  correo,
  errorCorreo,
  tocado,
  estaCargando,
  alCambiarCorreo,
  alBlurCorreo,
  alEnviar,
  alRegresar
}) => {
  // Calcula si debe mostrar error (solo si fue tocado y hay error)
  const hasError = tocado && !!errorCorreo;

  return (
    <div className="formulario-recuperacion">
      <h2>Recuperación de Contraseña</h2>
      
      <p className="formulario-recuperacion__description">
        Ingresa tu correo electrónico para recibir instrucciones de recuperación.
      </p>

      <div className="form-group">
        <label htmlFor="correo">Correo Electrónico</label>
        
        <input
          id="correo"
          type="email"
          className={`input ${hasError ? 'input--error' : ''}`}
          placeholder="usuario@ejemplo.com"
          value={correo}
          onChange={(e) => alCambiarCorreo(e.target.value)}
          onBlur={alBlurCorreo}
          disabled={estaCargando}
          aria-invalid={hasError}
          aria-describedby={hasError ? 'correo-error' : undefined}
        />
        
        {hasError && (
          <div id="correo-error" className="error-message">
            {errorCorreo}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="button button--primary"
          onClick={alEnviar}
          disabled={estaCargando}
          aria-busy={estaCargando}
        >
          {estaCargando ? 'Enviando...' : 'Continuar'}
        </button>
        
        <button
          type="button"
          className="button button--secondary"
          onClick={alRegresar}
          disabled={estaCargando}
        >
          Regresar
        </button>
      </div>
    </div>
  );
};
