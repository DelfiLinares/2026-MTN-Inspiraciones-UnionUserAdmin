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
    <div className="confirmacion-recuperacion">
      <div className="icono-exito">✓</div>

      <h2>Solicitud Procesada</h2>

      <p className="mensaje-confirmacion">
        Si el correo electrónico corresponde a una cuenta registrada,
        recibirás instrucciones para recuperar tu contraseña.
      </p>

      <button
        type="button"
        className="button button--primary"
        onClick={alRegresar}
      >
        Regresar al Login
      </button>
    </div>
  );
};
