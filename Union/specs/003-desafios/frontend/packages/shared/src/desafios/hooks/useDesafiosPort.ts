/**
 * Hook useDesafiosPort - Acceso al puerto de desafíos
 *
 * Este hook se exporta conjuntamente desde DesafiosProvider.tsx.
 * Se incluye aquí para documentación y claridad de la interfaz.
 *
 * Nota: La implementación real está en DesafiosProvider.tsx ya que necesita
 * trabajar con el contexto React.
 *
 * Tarea: T036
 * Depende de: T034 (DesafiosPort), DesafiosProvider.tsx
 */

import { useContext } from "react";
import type { DesafiosPort } from "../application/ports/DesafiosPort";

/**
 * Hook para acceder al puerto de desafíos desde cualquier componente
 *
 * Retorna la instancia del adaptador DesafiosPort que fue inyectado
 * por el proveedor más cercano en el árbol.
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
 *
 * Nota: La implementación real se re-exporta desde DesafiosProvider.tsx.
 */
// Nota: Este es un archivo de documentación/tipos. La implementación está en DesafiosProvider.tsx
export { useDesafiosPort } from "./DesafiosProvider";
