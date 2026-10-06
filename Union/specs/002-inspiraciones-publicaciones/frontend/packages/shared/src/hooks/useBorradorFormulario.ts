// Conserva el borrador de un formulario ante sesión expirada o recarga (T071).
// Guarda en sessionStorage solo valores serializables (los archivos no se pueden conservar).
// Spec: CB-09.

import { useCallback, useRef } from "react";

const PREFIJO = "borrador:";

function almacenamiento(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export interface UseBorradorFormularioResultado<T> {
  /** Borrador previo para esta clave, o null si no hay. Se lee una sola vez al montar. */
  readonly borradorInicial: T | null;
  /** Guarda el borrador actual (se invoca ante cada cambio). */
  readonly guardar: (valores: T) => void;
  /** Elimina el borrador (tras un envío exitoso). */
  readonly limpiar: () => void;
}

export function useBorradorFormulario<T>(clave: string): UseBorradorFormularioResultado<T> {
  const claveCompleta = `${PREFIJO}${clave}`;
  const inicial = useRef<{ clave: string; valor: T | null } | null>(null);

  if (inicial.current === null || inicial.current.clave !== claveCompleta) {
    let valor: T | null = null;
    try {
      const crudo = almacenamiento()?.getItem(claveCompleta);
      valor = crudo ? (JSON.parse(crudo) as T) : null;
    } catch {
      valor = null;
    }
    inicial.current = { clave: claveCompleta, valor };
  }

  const guardar = useCallback(
    (valores: T) => {
      try {
        almacenamiento()?.setItem(claveCompleta, JSON.stringify(valores));
      } catch {
        // Sin espacio o almacenamiento bloqueado: se ignora, el borrador es opcional.
      }
    },
    [claveCompleta],
  );

  const limpiar = useCallback(() => {
    try {
      almacenamiento()?.removeItem(claveCompleta);
    } catch {
      // Se ignora.
    }
  }, [claveCompleta]);

  return { borradorInicial: inicial.current.valor, guardar, limpiar };
}
