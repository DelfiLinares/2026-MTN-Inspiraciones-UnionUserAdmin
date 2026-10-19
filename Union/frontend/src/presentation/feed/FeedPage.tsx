import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Props para FeedPage
 */
interface FeedPageProps {
  // Sin props por ahora - todo viene del estado de React Router
}

/**
 * FeedPage
 *
 * Componente página que recibe Preferencias del cuestionario y prepara el feed personalizado.
 *
 * Responsabilidades:
 * - Recibir preferencias vía useLocation() state
 * - Validar que preferencias existen
 * - Si no existen, redirigir a /cuestionario
 * - Si existen, mostrar mensaje de carga
 * - Preparar para obtener publicaciones del backend
 *
 * Flujo:
 * 1. CuestionarioPage navega a /feed con preferencias en state
 * 2. FeedPage recibe preferencias vía useLocation()
 * 3. FeedPage valida que preferencias existen
 * 4. Si válidas: renderiza mensaje "Generando feed personalizado..."
 * 5. Si inválidas: redirige a /cuestionario
 *
 * Requisitos:
 * - HU-07: Finalizar y acceder a feed personalizado
 * - RF-23: Feed personalizado basado en respuestas
 * - A-6: Paso de preferencias entre componentes
 * - A-9: Feed generado después de completar cuestionario
 *
 * Referencia: spec.md, plan.md § 4, tasks.md § T040-T041
 */
export const FeedPage: React.FC<FeedPageProps> = () => {
  // Hooks
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener preferencias del state
  const state = location.state as { preferencias?: Record<string, unknown> } | null;
  const preferencias = state?.preferencias;

  // Validar que preferencias existen; si no, redirigir
  React.useEffect(() => {
    if (!preferencias) {
      // No hay preferencias: redirigir a cuestionario
      navigate('/cuestionario');
    }
  }, [preferencias, navigate]);

  // Si no hay preferencias (durante redirect), no renderizar
  if (!preferencias) {
    return null;
  }

  return (
    <div className="feed-page">
      <div className="feed-page__container">
        <div className="feed-page__header">
          <h1 className="feed-page__title">Generando feed personalizado</h1>
          <p className="feed-page__subtitle">
            Basado en tus intereses artísticos, musicales y estilos de pintura...
          </p>
        </div>

        <div className="feed-page__loader">
          <div className="feed-page__spinner"></div>
          <p className="feed-page__message">
            Generando feed personalizado basado en tus intereses...
          </p>
        </div>

        {/* Debug info (remover en producción) */}
        <div className="feed-page__debug" style={{ display: 'none' }}>
          <details>
            <summary>Preferencias recibidas</summary>
            <pre>{JSON.stringify(preferencias, null, 2)}</pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
