// `ELIMINADO` es borrado lógico persistido y no se expone en la API (A-01).
export const EstadoDesafio = {
  PROGRAMADO: "PROGRAMADO",
  ACTIVO: "ACTIVO",
  FINALIZADO: "FINALIZADO",
  ELIMINADO: "ELIMINADO",
} as const;
export type EstadoDesafio = (typeof EstadoDesafio)[keyof typeof EstadoDesafio];
