import { useEffect, useState } from 'react';
import { Preferencias } from '../../../domain/entities/Preferencias';

/**
 * Hook preparado para futuro consumo de API REST Java.
 *
 * **MVP Status**: Stub sin implementación.
 * **Futuro**: Consumirá endpoint POST /api/v1/feed/personalizado
 *
 * **Responsabilidades** (futuro):
 * - Aceptar objeto Preferencias como parámetro.
 * - Realizar llamada POST al backend Java con preferencias.
 * - Mapear respuesta a array de Publicacion.
 * - Manejar errores y estados de carga.
 * - Integrar con httpClient (axios/fetch wrapper).
 *
 * **Nota**: En MVP, el feed es un componente stub que no obtiene publicaciones.
 * Este hook está preparado estructuralmente para integración futura sin romper interfaces.
 *
 * @param preferencias - Objeto Preferencias con categorías seleccionadas por usuario.
 * @returns {Object} Estado del hook con publicaciones, error, loading.
 *
 * @example
 * // Futuro uso:
 * const { publicaciones, loading, error } = useFetchPublicaciones(preferencias);
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage msg={error} />;
 * return <PublicacionList publicaciones={publicaciones} />;
 */
export function useFetchPublicaciones(preferencias: Preferencias) {
  const [publicaciones, setPublicaciones] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implementar en futuro
    // 1. Validar que preferencias no sea null/undefined
    // 2. Construir request: { preferencias: Preferencias }
    // 3. Llamar POST /api/v1/feed/personalizado
    // 4. Mapear respuesta (esperada: { publicaciones: Publicacion[] })
    // 5. Setear estado con publicaciones obtenidas
    // 6. Manejar errores de red, validación, autenticación
    //
    // Pseudocódigo:
    // const fetchData = async () => {
    //   try {
    //     setLoading(true);
    //     const response = await httpClient.post('/api/v1/feed/personalizado', {
    //       preferencias
    //     });
    //     setPublicaciones(response.data.publicaciones);
    //   } catch (err) {
    //     setError(err.message);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchData();

    // MVP: No hacer nada (hook no implementado)
  }, [preferencias]);

  return { publicaciones, loading, error };
}
