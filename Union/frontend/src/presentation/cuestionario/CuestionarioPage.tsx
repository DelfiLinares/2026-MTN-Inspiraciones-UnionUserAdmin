import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BienvenidaHeader } from './BienvenidaHeader';
import { PreguntaForm } from './PreguntaForm';
import { BotonContinuar } from './BotonContinuar';
import { MensajeError } from './MensajeError';
import { CuestionarioFactory } from '../../application/CuestionarioFactory';
import { CuestionarioService } from '../../application/CuestionarioService';
import type { GuardarInteresesOnboardingDTO } from '../../application/dto/OnboardingInteresesDTO';
import { RespuestaCuestionario } from '../../domain/entities/RespuestaCuestionario';
import { Pregunta } from '../../domain/entities/Pregunta';
import {
  guardarInteresesOnboarding,
  obtenerCatalogoOnboarding,
  obtenerMisInteresesOnboarding,
} from '../../services/onboardingInteresesService';
import { CerrarSesionButton } from '../shared/CerrarSesionButton';
import './cuestionario.css';

/**
 * Props para CuestionarioPage
 */
interface CuestionarioPageProps {
  /**
   * Callback cuando el cuestionario se completa exitosamente
   * Recibe las preferencias transformadas
   */
  onCuestionarioCompleto?: (intereses: GuardarInteresesOnboardingDTO) => void | Promise<void>;

  /**
   * Callback para navegar después de completar el cuestionario
   */
  onNavigate?: (path: string) => void;
}

/**
 * CuestionarioPage
 *
 * Componente página principal que orquesta el cuestionario de intereses.
 *
 * Responsabilidades:
 * - Renderizar bienvenida, preguntas y botón continuar
 * - Mantener estado de respuestas del usuario
 * - Manejar selección/deselección de opciones
 * - Validar completitud antes de continuar
 * - Transformar respuestas a preferencias
 * - Mostrar errores de validación
 * - Responsive design
 *
 * Flujo:
 * 1. Usuario ve bienvenida + 3 preguntas
 * 2. Usuario selecciona opciones
 * 3. Usuario hace click en "Continuar"
 * 4. Se valida completitud
 * 5. Si válido: transformar a Preferencias → callback
 * 6. Si inválido: mostrar errores
 *
 * Requisitos:
 * - HU-01: Bienvenida con eslogan
 * - HU-02: Preguntas sobre intereses artísticos
 * - HU-03: Preguntas sobre géneros musicales
 * - HU-04: Preguntas sobre estilos de pintura
 * - HU-05: Seleccionar/deseleccionar/modificar respuestas
 * - HU-06: Mensajes de error claros
 * - HU-07: Finalizar y acceder a feed personalizado
 * - HU-08: Interfaz clara, intuitiva y accesible
 * - RF-01 a RF-26: Todos los requisitos funcionales
 * - RNF-01 a RNF-25: Todos los requisitos no funcionales
 *
 * Referencia: spec.md, plan.md § 4, tasks.md § T031
 */
export const CuestionarioPage: React.FC<CuestionarioPageProps> = ({
  onCuestionarioCompleto,
  onNavigate,
}) => {
  // Hook para navegación React Router (con fallback graceful si no está disponible)
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    navigate = useNavigate();
  } catch (e) {
    // Si no estamos en un Router context, navigate será null
    // y usaremos el fallback onNavigate callback
    navigate = null;
  }

  // Estado de respuestas
  const [respuestas, setRespuestas] = useState<RespuestaCuestionario>(
    RespuestaCuestionario.vacio()
  );

  // Estado de errores de validación
  const [validationErrors, setValidationErrors] = useState<Map<string, string> | null>(null);

  // Estado de carga (para el botón)
  const [isLoading, setIsLoading] = useState(false);
  const [catalogoCargando, setCatalogoCargando] = useState(true);
  const [catalogoError, setCatalogoError] = useState<string | null>(null);
  const [intentoCarga, setIntentoCarga] = useState(0);

  // Estado del cuestionario (3 preguntas)
  const [cuestionario, setCuestionario] = useState<Pregunta[]>([]);

  // El backend provee los códigos de opción que luego se envían al guardar.
  useEffect(() => {
    const controller = new AbortController();
    let cancelado = false;
    setCatalogoCargando(true);
    setCatalogoError(null);

    obtenerCatalogoOnboarding({ signal: controller.signal })
      .then((catalogo) => {
        if (cancelado) {
          return;
        }

        const preguntas = CuestionarioFactory.crearCuestionarioDesdeCatalogo(catalogo);
        setCuestionario(preguntas);

        return obtenerMisInteresesOnboarding({ signal: controller.signal }).then((intereses) => {
          if (cancelado) {
            return;
          }

          const codigosPorPregunta: Record<string, string[]> = {
            'pregunta-1-intereses': intereses.generoIds,
            'pregunta-2-generos': intereses.tipoMusicaIds,
            'pregunta-3-estilos': intereses.estiloIds,
          };
          let respuestasIniciales = RespuestaCuestionario.vacio();

          for (const pregunta of preguntas) {
            const opcionesDisponibles = new Set(pregunta.opciones.map((opcion) => opcion.id));
            for (const codigo of codigosPorPregunta[pregunta.id] ?? []) {
              if (opcionesDisponibles.has(codigo)) {
                respuestasIniciales = respuestasIniciales.seleccionar(pregunta.id, codigo);
              }
            }
          }

          setRespuestas(respuestasIniciales);
        }).catch(() => {
          if (!cancelado) {
            setRespuestas(RespuestaCuestionario.vacio());
          }
        });
      })
      .catch(() => {
        if (!cancelado) {
          setCatalogoError('No pudimos cargar las opciones. Verificá tu conexión e intentá nuevamente.');
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCatalogoCargando(false);
        }
      });

    return () => {
      cancelado = true;
      controller.abort();
    };
  }, [intentoCarga]);

  /**
   * Maneja selección de una opción
   */
  const handleSeleccionar = useCallback(
    (idPregunta: string, idOpcion: string) => {
      setRespuestas((prevRespuestas) => prevRespuestas.seleccionar(idPregunta, idOpcion));
      // Limpiar errores de esta pregunta si existía error previo
      if (validationErrors?.has(idPregunta)) {
        const newErrors = new Map(validationErrors);
        newErrors.delete(idPregunta);
        setValidationErrors(newErrors.size > 0 ? newErrors : null);
      }
    },
    [validationErrors]
  );

  /**
   * Maneja deselección de una opción
   */
  const handleDeseleccionar = useCallback(
    (idPregunta: string, idOpcion: string) => {
      setRespuestas((prevRespuestas) => prevRespuestas.deseleccionar(idPregunta, idOpcion));
    },
    []
  );

  /**
   * Maneja el click en "Continuar"
   * Valida completitud y persiste los intereses en la API
   */
  const handleContinuar = useCallback(async () => {
    if (catalogoCargando || catalogoError || cuestionario.length === 0) {
      return;
    }

    try {
      setIsLoading(true);

      // Validar completitud
      const resultado = CuestionarioService.validarCompletitud(respuestas, cuestionario);

      if (!resultado.valida && resultado.errores) {
        // Validación falló: mostrar errores
        setValidationErrors(resultado.errores);
        return;
      }

      const intereses = CuestionarioService.transformarAOnboardingRequest(
        respuestas,
        cuestionario
      );
      const resultadoOnboarding = await guardarInteresesOnboarding(intereses);
      if (!resultadoOnboarding.onboardingCompletado) {
        throw new Error('La API no confirmó la finalización del onboarding.');
      }

      // Limpiar errores
      setValidationErrors(null);

      // Llamar callback de completitud
      await onCuestionarioCompleto?.(intereses);

      // Navegar solo después de confirmar el guardado.
      if (navigate) {
        navigate('/feed', { replace: true, state: { preferencias: intereses } });
      }

      // Fallback: si no hay React Router, usar callback onNavigate
      if (onNavigate) {
        onNavigate('/feed');
      }
    } catch (error) {
      // Error handling: mostrar mensaje genérico sin loguear en consola
      setValidationErrors(
        new Map([
          [
            'global',
            'No pudimos guardar tus intereses. Verificá tu conexión e intentá nuevamente.',
          ],
        ])
      );
    } finally {
      setIsLoading(false);
    }
  }, [respuestas, cuestionario, catalogoCargando, catalogoError, onCuestionarioCompleto, onNavigate, navigate]);

  /**
   * Obtener respuesta seleccionada para una pregunta
   */
  const getOpcionesSeleccionadas = (idPregunta: string): Set<string> => {
    return respuestas.obtenerRespuesta(idPregunta);
  };

  // Mostrar error global si existe
  const globalError = validationErrors?.get('global') ?? catalogoError;

  return (
    <div className="cuestionario-page">
      <div className="cuestionario-page__container">
        <div className="cuestionario-page__toolbar">
          <CerrarSesionButton />
        </div>
        {/* Bienvenida */}
        <BienvenidaHeader />

        {/* Mensaje de error global (si existe) */}
        {globalError && <MensajeError mensaje={globalError} visible={true} />}

        {catalogoCargando && (
          <p className="cuestionario-page__status" role="status">
            Cargando opciones...
          </p>
        )}

        {/* Formulario con preguntas */}
        <div className="cuestionario-page__form">
          {!catalogoCargando && !catalogoError && cuestionario.map((pregunta) => (
            <PreguntaForm
              key={pregunta.id}
              pregunta={pregunta}
              respuestasSeleccionadas={getOpcionesSeleccionadas(pregunta.id)}
              onSeleccionar={(idOpcion) => handleSeleccionar(pregunta.id, idOpcion)}
              onDeseleccionar={(idOpcion) => handleDeseleccionar(pregunta.id, idOpcion)}
            />
          ))}
        </div>

        {/* Botón continuar con validación */}
        <div className="cuestionario-page__actions">
          <BotonContinuar
            enabled={!catalogoCargando && !catalogoError && cuestionario.length === 3}
            onClick={handleContinuar}
            loading={isLoading || catalogoCargando}
            respuestas={respuestas}
            preguntas={cuestionario}
            onValidationError={(errores) => setValidationErrors(errores)}
          />
          {catalogoError && (
            <button
              type="button"
              className="boton-continuar"
              onClick={() => setIntentoCarga((intento) => intento + 1)}
            >
              Reintentar carga
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CuestionarioPage;
