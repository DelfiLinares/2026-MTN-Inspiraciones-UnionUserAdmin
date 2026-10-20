import { useState, useCallback } from 'react';
import { SolicitudRecuperacion } from '../../domain/recuperacion/entities/SolicitudRecuperacion';
import { EstadoFormularioRecuperacion } from '../../domain/recuperacion/valueObjects/EstadoFormularioRecuperacion';
import { ServicioFormularioRecuperacion } from '../../application/recuperacion/services/ServicioFormularioRecuperacion';
import { FabricaSolicitudRecuperacion } from '../../application/recuperacion/factories/FabricaSolicitudRecuperacion';

/**
 * useFormularioRecuperacion
 *
 * Custom React Hook que gestiona el estado del formulario de recuperación de contraseña.
 * Proporciona estado y handlers para manejar la validación y el flujo del formulario.
 *
 * Retorna:
 * - correo: string - Email actual del formulario
 * - errorCorreo: string | undefined - Mensaje de error si existe
 * - tocado: boolean - Si el usuario ha interactuado con el campo
 * - estaCargando: boolean - Si la solicitud está en proceso
 * - esExito: boolean - Si la operación fue exitosa
 * - manejarCambioCorreo: (correo: string) => void - Handler para cambios
 * - manejarBlurCorreo: () => void - Handler para pérdida de foco
 * - manejarEnvio: () => Promise<void> - Handler para envío del formulario
 * - manejarReinicio: () => void - Handler para reiniciar el formulario
 */
export const useFormularioRecuperacion = () => {
  // Estado del formulario (entity del dominio)
  const [solicitud, setSolicitud] = useState<SolicitudRecuperacion>(
    FabricaSolicitudRecuperacion.crear()
  );

  // Estado del proceso (value object)
  const [estado, setEstado] = useState<EstadoFormularioRecuperacion>(
    EstadoFormularioRecuperacion.reposo()
  );

  // Servicio de aplicación
  const servicio = ServicioFormularioRecuperacion.crear();

  /**
   * manejarCambioCorreo
   *
   * Responde a eventos onChange del campo de email.
   * Usa el servicio para aplicar la lógica de cambio.
   *
   * @param correo - Valor del email ingresado
   */
  const manejarCambioCorreo = useCallback(
    (correo: string) => {
      setSolicitud((prev: SolicitudRecuperacion) => servicio.manejarCambioCorreo(prev, correo));
    },
    [servicio]
  );

  /**
   * manejarBlurCorreo
   *
   * Responde a eventos onBlur del campo de email.
   * Dispara la validación cuando el usuario deja el campo.
   */
  const manejarBlurCorreo = useCallback(() => {
    setSolicitud((prev: SolicitudRecuperacion) => servicio.manejarBlurCorreo(prev));
  }, [servicio]);

  /**
   * manejarEnvio
   *
   * Maneja el envío del formulario.
   * Valida completamente y simula un envío con estado de cargando.
   *
   * Proceso:
   * 1. Valida usando prepararParaEnvio
   * 2. Si hay errores, actualiza solicitud y retorna
   * 3. Si es válido, simula cargando durante 750ms
   * 4. Marca como éxito
   */
  const manejarEnvio = useCallback(async () => {
    const { esValido, solicitud: validada } = servicio.prepararParaEnvio(solicitud);

    if (!esValido) {
      setSolicitud(validada);
      return;
    }

    setEstado(EstadoFormularioRecuperacion.cargando());
    
    // Simula procesamiento del servidor
    await new Promise(resolve => setTimeout(resolve, 750));
    
    setEstado(EstadoFormularioRecuperacion.exito());
  }, [solicitud, servicio]);

  /**
   * manejarReinicio
   *
   * Reinicia el formulario a su estado inicial.
   * Limpia todos los errores y el estado de la solicitud.
   */
  const manejarReinicio = useCallback(() => {
    setSolicitud(FabricaSolicitudRecuperacion.crear());
    setEstado(EstadoFormularioRecuperacion.reposo());
  }, []);

  // Retorna el estado y handlers para la UI
  return {
    correo: solicitud.obtenerCorreo(),
    errorCorreo: solicitud.obtenerError('correo'),
    tocado: solicitud.estaTocado(),
    estaCargando: estado.esCargando(),
    esExito: estado.esExito(),
    manejarCambioCorreo,
    manejarBlurCorreo,
    manejarEnvio,
    manejarReinicio
  };
};
