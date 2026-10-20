import React from 'react';

/**
 * PropsConfirmacionRecuperacion
 *
 * Props para el componente de confirmación de recuperación de contraseña.
 *
 * Propiedades:
 * - alRegresar: Callback para regresar al inicio de sesión
 */
export type PropsConfirmacionRecuperacion = {
  alRegresar: () => void;
};

/**
 * ConfirmacionRecuperacion
 *
 * Componente funcional que muestra un mensaje de confirmación después de que
 * el usuario ha enviado la solicitud de recuperación de contraseña.
 *
 * Contiene:
 * - Icono de éxito (✓)
 * - Mensaje de confirmación
 * - Botón para regresar al inicio de sesión
 *
 * @param props - PropsConfirmacionRecuperacion con callback para regresar
 * @returns JSX.Element del componente de confirmación
 */
export const ConfirmacionRecuperacion: React.FC<PropsConfirmacionRecuperacion> = ({
  alRegresar
}) => {
  return (
    <div className="confirmacion-recuperacion" role="region" aria-label="Confirmación de recuperación de contraseña">
      <div className="recuperacion-circles" aria-hidden="true">
        <span className="recuperacion-circle-outline" />
        <span className="recuperacion-circle-fill" />
      </div>

      <div className="confirmacion-recuperacion__contenedor">
        <div className="icono-exito" aria-hidden="false" role="status">✓</div>

        <h2>¡Genial!</h2>

        <p className="mensaje-confirmacion" role="status" aria-live="polite">
          En pocos minutos recibirás un mail para recuperar tu contraseña
        </p>

        <div className="confirmacion-recuperacion__acciones">
          <button
            type="button"
            className="button button--primary"
            onClick={alRegresar}
            aria-label="Aceptar y regresar al formulario de inicio de sesión"
          >
            Aceptar
          </button>
        </div>
      </div>

      <aside className="recuperacion-promo" aria-hidden="true">
        <h2>Ya casi estás</h2>
        <p>Revisá tu bandeja de entrada para continuar.</p>
      </aside>
    </div>
  );
};
