/**
 * EstadoDesafioBadge: muestra el estado de un desafío con texto, símbolo y clase visual,
 * sin depender solo del color (RNF-01).
 *
 * Tarea: T046
 * Depende de: T007 (enum EstadoDesafio)
 *
 * El componente no calcula el estado: solo lo presenta (RF-06, la API lo entrega).
 */

import { EstadoDesafio } from "../domain/enums/EstadoDesafio";

export interface EstadoDesafioBadgeProps {
  readonly estado: EstadoDesafio;
  readonly className?: string;
}

const PRESENTACION: Readonly<
  Record<EstadoDesafio, { readonly texto: string; readonly simbolo: string; readonly clase: string }>
> = {
  [EstadoDesafio.PROGRAMADO]: {
    texto: "Programado",
    simbolo: "◷",
    clase: "estado-desafio--programado",
  },
  [EstadoDesafio.ACTIVO]: {
    texto: "Activo",
    simbolo: "●",
    clase: "estado-desafio--activo",
  },
  [EstadoDesafio.FINALIZADO]: {
    texto: "Finalizado",
    simbolo: "✓",
    clase: "estado-desafio--finalizado",
  },
  [EstadoDesafio.ELIMINADO]: {
    texto: "Eliminado",
    simbolo: "✕",
    clase: "estado-desafio--eliminado",
  },
};

export function EstadoDesafioBadge({ estado, className }: EstadoDesafioBadgeProps) {
  const { texto, simbolo, clase } = PRESENTACION[estado];
  const clases = ["estado-desafio", clase, className].filter(Boolean).join(" ");

  return (
    <span className={clases} data-estado={estado}>
      <span aria-hidden="true">{simbolo}</span> {texto}
    </span>
  );
}
