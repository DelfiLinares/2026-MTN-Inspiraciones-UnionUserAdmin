/**
 * Configuración centralizada de React Query para desafíos
 *
 * Define opciones por defecto para todas las consultas y mutaciones del módulo,
 * incluyendo reintentos, tiempos de caché (staleTime) y comportamientos especiales.
 *
 * Tarea: T038
 * Depende de: T001 (verificación del monorepo)
 *
 * Fuente de verdad:
 * - plan.md: Sección 5 (gestión de estado)
 * - spec.md: Casos de borde (CB-05)
 * - tasks.md: T038 (Configuración de consultas)
 * - research.md: Estrategia de actualización y caché
 * - react-query docs: Default Options (https://tanstack.com/query/latest/docs/react/guides/important-defaults)
 */

import type { DefaultOptions } from "@tanstack/react-query";

/**
 * Opciones por defecto para todas las consultas (queries)
 *
 * Configuración:
 * - 2 reintentos en GETs (para recuperarse de fallos de red transitorios)
 * - staleTime = 60000ms (1 minuto): datos considerados "frescos" durante 1 minuto
 * - gcTime = 600000ms (10 minutos): mantener datos en caché durante 10 minutos
 * - refetchOnWindowFocus = true: actualizar datos al volver a la ventana (CB-05)
 * - refetchOnReconnect = true: actualizar datos al recuperar conectividad
 * - retry = true: reintentos automáticos en fallos de red
 * - retryDelay: 1000ms, 2000ms, 3000ms (exponencial con mínimo)
 *
 * Justificación:
 * - 2 reintentos: balance entre resiliencia y UX (evita esperas muy largas)
 * - 1 minuto staleTime: desafíos no cambian con frecuencia, pero deben reflotarse
 * - 10 minutos gcTime: costo bajo de mantener en memoria, beneficio de navegación rápida
 * - refetchOnWindowFocus: cobertura de CB-05 (usuario regresa a la ventana con estado cambiado)
 * - refetchOnReconnect: importante para PWA o usuarios móviles con conectividad intermitente
 */
export const configuracionQueries: DefaultOptions["queries"] = {
  retry: 2,
  retryDelay: (attemptIndex: number) => {
    const delays = [1000, 2000, 3000];
    return delays[Math.min(attemptIndex, delays.length - 1)];
  },
  staleTime: 60 * 1000, // 1 minuto
  gcTime: 10 * 60 * 1000, // 10 minutos
  refetchOnWindowFocus: true, // CB-05: actualizar al volver a la ventana
  refetchOnReconnect: true,
};

/**
 * Opciones por defecto para todas las mutaciones (mutations)
 *
 * Configuración:
 * - 0 reintentos: las mutaciones NO deben reintentarse automáticamente
 *   (cambios de estado en el servidor requieren confirmación explícita del usuario)
 * - retry = false: no reintentar mutaciones fallidas
 *
 * Justificación:
 * - Sin reintentos automáticos: las mutaciones son operaciones destructivas o
 *   de cambio de estado. Si fallan, el usuario debe decidir si reintentar.
 * - Diferencia clara con queries: las queries leen datos; las mutaciones escriben datos.
 * - Los hooks de mutación (useMutation) permiten manejo explícito de reintentos en UI.
 */
export const configuracionMutations: DefaultOptions["mutations"] = {
  retry: 0,
};

/**
 * Objeto completo de opciones por defecto para QueryClient
 *
 * Se pasa al constructor de QueryClient:
 * ```tsx
 * new QueryClient({ defaultOptions: configuracionPorDefectoDesafios })
 * ```
 *
 * Agrupa configuración de queries y mutations.
 */
export const configuracionPorDefectoDesafios: DefaultOptions = {
  queries: configuracionQueries,
  mutations: configuracionMutations,
};

/**
 * Estrategia de staleTime por tipo de consulta
 *
 * Permite ajustes más granulares si es necesario en hooks específicos.
 * Estos valores son sugerencias; pueden ser sobrescritos en hooks individuales.
 */
export const staleTimesPorTipo = {
  /**
   * Listados: 1 minuto
   * Justificación: datos no cambian con alta frecuencia, pero usuario espera
   * ver cambios recientes si regresa a la ventana (CB-05).
   */
  listados: 60 * 1000,

  /**
   * Detalle: 2 minutos
   * Justificación: usuario suele permanecer más tiempo en detalle;
   * cambios en respuestas/estado pueden ocurrir mientras ve el detalle.
   * Mayor staleTime para evitar refetches frecuentes durante lectura.
   */
  detalle: 2 * 60 * 1000,

  /**
   * Datos estáticos (ámbitos): 30 minutos
   * Justificación: el catálogo de ámbitos casi nunca cambia durante
   * la sesión del usuario. Largo staleTime reduce carga de servidor.
   */
  estático: 30 * 60 * 1000,
};

/**
 * Configuración de reintentos por tipo de error
 *
 * Permite diferenciar entre errores de red (reintentables) y errores
 * de lógica de negocio (no reintentables).
 *
 * @example
 * ```tsx
 * const { data } = useQuery({
 *   queryKey: clavesDesafios.desafio.detalle(id).queryKey,
 *   queryFn: async () => {
 *     try {
 *       return await puerto.obtenerDesafio(id);
 *     } catch (err) {
 *       // Retorno de tipo que permite manejo específico
 *       if (esError404(err)) {
 *         throw err; // No reintentar (no existe)
 *       }
 *       // Otros errores: usar reintentos configurados por defecto
 *       throw err;
 *     }
 *   },
 * });
 * ```
 */
export const puedeReintentarse = (error: unknown): boolean => {
  // Si es un error con status HTTP, revisar código
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;

    // Errores que NO deben reintentarse:
    // - 400: Bad Request (validación)
    // - 401: Unauthorized (sesión)
    // - 403: Forbidden (permiso)
    // - 404: Not Found (recurso no existe)
    const noReintentables = [400, 401, 403, 404];
    if (noReintentables.includes(status)) {
      return false;
    }

    // Errores de servidor que SÍ deben reintentarse:
    // - 5xx: Internal Server Error, Service Unavailable, etc.
    if (status >= 500) {
      return true;
    }
  }

  // Por defecto, asumir que es error de red (reintentable)
  return true;
};
