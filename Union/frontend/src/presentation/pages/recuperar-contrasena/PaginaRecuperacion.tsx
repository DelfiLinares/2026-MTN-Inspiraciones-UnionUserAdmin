import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormularioRecuperacion } from '../../hooks/useFormularioRecuperacion';
import { FormularioRecuperacion } from '../../components/recuperacion/FormularioRecuperacion';
import { ConfirmacionRecuperacion } from '../../components/recuperacion/ConfirmacionRecuperacion';

/**
 * PaginaRecuperacion
 *
 * Página principal del flujo de recuperación de contraseña.
 * Integra:
 * - Hook useFormularioRecuperacion para gestión de estado
 * - Componente FormularioRecuperacion para el formulario
 * - Componente ConfirmacionRecuperacion para la confirmación
 * - Navegación mediante React Router
 *
 * Renderiza el componente apropiado según el estado de éxito (esExito):
 * - Si esExito es true: muestra ConfirmacionRecuperacion
 * - Si esExito es false: muestra FormularioRecuperacion
 *
 * @returns JSX.Element con la página de recuperación
 */
export const PaginaRecuperacion: React.FC = () => {
  const navigate = useNavigate();

  // Obtiene el estado y handlers del hook
  const {
    correo,
    errorCorreo,
    tocado,
    estaCargando,
    esExito,
    manejarCambioCorreo,
    manejarBlurCorreo,
    manejarEnvio,
    manejarReinicio
  } = useFormularioRecuperacion();

  /**
   * manejarRegresar
   *
   * Handler que ejecuta cuando el usuario regresa desde la confirmación.
   * Reinicia el formulario y navega al login.
   */
  const manejarRegresar = () => {
    manejarReinicio();
    navigate('/login');
  };

  // Si la solicitud fue exitosa, muestra la confirmación
  if (esExito) {
    return <ConfirmacionRecuperacion alRegresar={manejarRegresar} />;
  }

  // De lo contrario, muestra el formulario
  return (
    <FormularioRecuperacion
      correo={correo}
      errorCorreo={errorCorreo}
      tocado={tocado}
      estaCargando={estaCargando}
      alCambiarCorreo={manejarCambioCorreo}
      alBlurCorreo={manejarBlurCorreo}
      alEnviar={manejarEnvio}
      alRegresar={manejarRegresar}
    />
  );
};
