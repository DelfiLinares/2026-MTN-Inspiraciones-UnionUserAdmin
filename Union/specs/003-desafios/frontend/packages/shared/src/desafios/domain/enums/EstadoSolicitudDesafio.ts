export const EstadoSolicitudDesafio = {
  PENDIENTE: "PENDIENTE",
  APROBADA: "APROBADA",
  RECHAZADA: "RECHAZADA",
} as const;
export type EstadoSolicitudDesafio = (typeof EstadoSolicitudDesafio)[keyof typeof EstadoSolicitudDesafio];
