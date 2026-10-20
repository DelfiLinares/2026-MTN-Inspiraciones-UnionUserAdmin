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
    <div className="formulario-recuperacion" role="region" aria-label="Formulario de recuperación de contraseña">
      <h2>Recuperación de Contraseña</h2>
      
      <p className="formulario-recuperacion__description">
        Ingresa tu correo electrónico para recibir instrucciones de recuperación.
      </p>

      <form className="form-group" onSubmit={(e) => { e.preventDefault(); alEnviar(); }}>
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
          aria-describedby={hasError ? 'correo-error' : 'correo-help'}
          aria-required="true"
          aria-label="Ingresa tu correo electrónico"
        />
        
        <div id="correo-help" className="sr-only">
          Ingresa una dirección de correo electrónico válida
        </div>

        {hasError && (
          <div id="correo-error" className="error-message" role="alert" aria-live="polite">
            {errorCorreo}
          </div>
        )}
      </form>

      <div className="form-actions">
        <button
          type="button"
          className="button button--primary"
          onClick={alEnviar}
          disabled={estaCargando}
          aria-busy={estaCargando}
          aria-label={estaCargando ? 'Enviando solicitud de recuperación' : 'Enviar solicitud de recuperación'}
        >
          {estaCargando ? 'Enviando...' : 'Continuar'}
        </button>
        
        <button
          type="button"
          className="button button--secondary"
          onClick={alRegresar}
          disabled={estaCargando}
          aria-label="Regresar a la pantalla anterior"
        >
          Regresar
        </button>
      </div>
    </div>
  );
};
