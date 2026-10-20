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
      <div className="recuperacion-circles" aria-hidden="true">
        <span className="recuperacion-circle-outline" />
        <span className="recuperacion-circle-fill" />
      </div>

      <div className="formulario-recuperacion__contenedor">
        <button
          type="button"
          className="button-link formulario-recuperacion__volver"
          onClick={alRegresar}
          disabled={estaCargando}
          aria-label="Regresar a la pantalla anterior"
        >
          ← Volver
        </button>

        <h2>Recuperá tu cuenta</h2>
        
        <form className="form-group" onSubmit={(e) => { e.preventDefault(); alEnviar(); }}>
          <label htmlFor="correo">Correo</label>
          
          <input
            id="correo"
            type="email"
            className={`input ${hasError ? 'input--error' : ''}`}
            placeholder=""
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

          <p className="formulario-recuperacion__description">
            Si tu mail se encuentra en nuestra base de datos, te enviaremos un correo para cambiar tu contraseña
          </p>
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
            {estaCargando ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>

      <aside className="recuperacion-promo" aria-hidden="true">
        <h2>¿Recordaste tu contraseña?</h2>
        <p>Volvé a intentar iniciar sesión con tus credenciales.</p>
      </aside>
    </div>
  );
};
