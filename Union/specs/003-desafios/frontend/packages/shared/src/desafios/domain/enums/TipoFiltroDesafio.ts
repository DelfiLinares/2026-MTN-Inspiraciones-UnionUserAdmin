export const TipoFiltroDesafio = {
  AMBITO: "AMBITO",
  ESTADO: "ESTADO",
  FECHA: "FECHA",
} as const;
export type TipoFiltroDesafio = (typeof TipoFiltroDesafio)[keyof typeof TipoFiltroDesafio];
