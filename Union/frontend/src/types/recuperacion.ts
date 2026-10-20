/**
 * EstadoFormularioRecuperacionUI
 *
 * Type que representa el estado del formulario de recuperación de contraseña en la capa de presentación.
 * Contiene los datos necesarios para renderizar el formulario y mostrar errores.
 *
 * Propiedades:
 * - correo: string - Email del usuario ingresado en el formulario
 * - errorCorreo?: string - Mensaje de error de validación (opcional)
 * - tocado: boolean - Indica si el usuario ha interactuado con el campo de email
 */
export type EstadoFormularioRecuperacionUI = {
  correo: string;
  errorCorreo?: string;
  tocado: boolean;
};

/**
 * EstadoProceso
 *
 * Literal type que representa los posibles estados del proceso de recuperación.
 * Define el ciclo de vida del formulario desde el descanso hasta el resultado final.
 *
 * Estados:
 * - 'reposo': Formulario listo para entrada, sin actividad
 * - 'cargando': Solicitud en proceso al servidor
 * - 'exito': Operación completada satisfactoriamente
 * - 'error': Operación falló, se puede reintentar
 */
export type EstadoProceso = 'reposo' | 'cargando' | 'exito' | 'error';

/**
 * PropsFormularioRecuperacion
 *
 * Type para las props del componente FormularioRecuperacion.
 * Contiene el estado del formulario y los handlers para interacciones del usuario.
 *
 * Propiedades:
 * - correo: string - Email actual
 * - errorCorreo?: string - Error de validación (opcional)
 * - tocado: boolean - Si el campo ha sido tocado
 * - estaCargando: boolean - Si la solicitud está en proceso
 * - alCambiarCorreo: Callback para cambios en el email
 * - alBlurCorreo: Callback para pérdida de foco
 * - alEnviar: Callback para envío del formulario
 * - alRegresar: Callback para volver
 */
export type PropsFormularioRecuperacion = {
  correo: string;
  errorCorreo?: string;
  tocado: boolean;
  estaCargando: boolean;
  alCambiarCorreo: (correo: string) => void;
  alBlurCorreo: () => void;
  alEnviar: () => void;
  alRegresar: () => void;
};
