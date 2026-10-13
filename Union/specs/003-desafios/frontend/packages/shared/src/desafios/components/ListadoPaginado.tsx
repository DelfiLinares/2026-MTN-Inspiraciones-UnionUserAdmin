/**
 * ListadoPaginado: listado con carga progresiva mediante botón, y estados de
 * cargando, vacío y error (HU-09, HU-12, RF-15).
 *
 * Tarea: T050
 * Depende de: T036 (DesafiosProvider)
 *
 * Componente genérico y controlado: no hace fetch ni filtra en memoria. Recibe los
 * ítems ya cargados y las banderas de un `useInfiniteQuery`.
 */

import type { ReactNode } from "react";

export interface ListadoPaginadoProps<T> {
  readonly items: readonly T[];
  readonly renderItem: (item: T) => ReactNode;
  readonly obtenerClave: (item: T) => string;
  readonly estaCargando: boolean;
  readonly estaCargandoMas?: boolean;
  readonly hayMas: boolean;
  readonly onCargarMas: () => void;
  readonly error?: unknown;
  readonly onReintentar?: () => void;
  readonly mensajeVacio?: string;
  readonly accionVacio?: ReactNode;
  readonly className?: string;
}

export function ListadoPaginado<T>({
  items,
  renderItem,
  obtenerClave,
  estaCargando,
  estaCargandoMas = false,
  hayMas,
  onCargarMas,
  error,
  onReintentar,
  mensajeVacio = "No hay elementos para mostrar.",
  accionVacio,
  className,
}: ListadoPaginadoProps<T>) {
  const clases = ["listado-paginado", className].filter(Boolean).join(" ");

  if (estaCargando) {
    return (
      <p className={clases} role="status" aria-live="polite">
        Cargando...
      </p>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className={clases} role="alert">
        <p>No se pudo cargar el listado.</p>
        {onReintentar && (
          <button type="button" onClick={onReintentar}>
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={clases}>
        <p>{mensajeVacio}</p>
        {accionVacio}
      </div>
    );
  }

  return (
    <div className={clases}>
      <ul className="listado-paginado__lista">
        {items.map((item) => (
          <li key={obtenerClave(item)}>{renderItem(item)}</li>
        ))}
      </ul>

      {error !== undefined && error !== null && (
        <div role="alert">
          <p>No se pudieron cargar más elementos.</p>
          {onReintentar && (
            <button type="button" onClick={onReintentar}>
              Reintentar
            </button>
          )}
        </div>
      )}

      {hayMas && (
        <button type="button" onClick={onCargarMas} disabled={estaCargandoMas}>
          {estaCargandoMas ? "Cargando..." : "Cargar más"}
        </button>
      )}
    </div>
  );
}
