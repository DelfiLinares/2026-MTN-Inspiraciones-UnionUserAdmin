/**
 * Proveedor de contexto para inyectar el adaptador DesafiosPort
 *
 * Proporciona una instancia única del puerto de desafíos (adaptador en memoria o HTTP)
 * a todos los componentes de la aplicación mediante React Context. Se configura en tiempo
 * de inicialización mediante variables de entorno (VITE_DESAFIOS_ADAPTER).
 *
 * Tarea: T036
 * Depende de: T034 (DesafiosPort y crearAdaptadorDesafios)
 *
 * Fuente de verdad:
 * - plan.md: Sección 5 (arquitecrura de inyección de dependencias)
 * - spec.md: Contexto de desafíos
 * - tasks.md: T036 (Proveedor y hook)
 */

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import type { DesafiosPort } from "../application/ports/DesafiosPort";
import { crearAdaptadorDesafios } from "../infrastructure/crearAdaptadorDesafios";

/**
 * Contexto React para el puerto de desafíos
 *
 * Contiene la instancia única del adaptador que será inyectado en todos los hooks
 * que consuman desafíos.
 */
const DesafiosContext = createContext<DesafiosPort | undefined>(undefined);

/**
 * Props del proveedor
 */
interface DesafiosProviderProps {
  children: ReactNode;
  /**
   * Cliente HTTP opcional. Si se proporciona, se usará para crear un adaptador HTTP.
   * Si no se proporciona, se creará un adaptador en memoria (por defecto).
   */
  httpClient?: {
    get: (url: string) => Promise<Response>;
    post: (url: string, body?: any) => Promise<Response>;
    put: (url: string, body?: any) => Promise<Response>;
    delete: (url: string) => Promise<Response>;
  };
  /**
   * URL base para el adaptador HTTP (si se proporciona httpClient)
   */
  baseUrl?: string;
}

/**
 * Proveedor de contexto para DesafiosPort
 *
 * Envuelve la aplicación o un subtree de componentes y proporciona acceso
 * al puerto de desafíos mediante el hook `useDesafiosPort`.
 *
 * Uso:
 * ```tsx
 * <DesafiosProvider>
 *   <MisComponentes />
 * </DesafiosProvider>
 * ```
 *
 * @example Con adaptador por defecto (en memoria):
 * ```tsx
 * <DesafiosProvider>
 *   <App />
 * </DesafiosProvider>
 * ```
 *
 * @example Con adaptador HTTP:
 * ```tsx
 * <DesafiosProvider httpClient={miClienteHttp} baseUrl="https://api.example.com">
 *   <App />
 * </DesafiosProvider>
 * ```
 */
export function DesafiosProvider({
  children,
  httpClient,
  baseUrl,
}: DesafiosProviderProps) {
  /**
   * Crea el adaptador una única vez durante el ciclo de vida del proveedor.
   * Se recrea solo si httpClient o baseUrl cambian.
   */
  const adaptador = useMemo(() => {
    return crearAdaptadorDesafios(httpClient, baseUrl);
  }, [httpClient, baseUrl]);

  return (
    <DesafiosContext.Provider value={adaptador}>
      {children}
    </DesafiosContext.Provider>
  );
}

/**
 * Hook para acceder al puerto de desafíos desde cualquier componente
 *
 * Retorna la instancia del adaptador DesafiosPort que fue inyectado
 * por el proveedor más cercano en el árbol.
 *
 * Lanza error si se usa fuera de un `<DesafiosProvider>`.
 *
 * @returns La instancia de DesafiosPort
 * @throws Error si no está envuelto por DesafiosProvider
 *
 * @example
 * ```tsx
 * function MiComponente() {
 *   const puerto = useDesafiosPort();
 *   const desafios = await puerto.listarDesafios({ cursor: undefined, limite: 10 });
 *   return <div>{desafios.items.length} desafíos</div>;
 * }
 * ```
 */
export function useDesafiosPort(): DesafiosPort {
  const adaptador = useContext(DesafiosContext);

  if (!adaptador) {
    throw new Error(
      "useDesafiosPort debe ser usado dentro de un <DesafiosProvider>. " +
        "Asegúrate de envolver tu aplicación con el proveedor en el árbol de componentes."
    );
  }

  return adaptador;
}
