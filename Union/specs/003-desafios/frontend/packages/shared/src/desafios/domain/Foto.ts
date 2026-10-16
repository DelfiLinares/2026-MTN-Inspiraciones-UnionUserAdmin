export const FormatoFoto = {
  JPEG: "JPEG",
  PNG: "PNG",
} as const;

export type FormatoFoto = (typeof FormatoFoto)[keyof typeof FormatoFoto];

export function esFormatoFoto(valor: string): valor is FormatoFoto {
  return (Object.values(FormatoFoto) as string[]).includes(valor);
}

export class Foto {
  readonly id: string;
  readonly url: string;
  readonly formato: FormatoFoto;
  readonly principal: boolean;

  constructor(id: string, url: string, formato: string, principal: boolean) {
    // Pendiente de reemplazar por ErrorValidacion (T012).
    if (!esFormatoFoto(formato)) {
      throw new Error("El formato de la foto debe ser JPEG o PNG.");
    }
    this.id = id;
    this.url = url;
    this.formato = formato;
    this.principal = principal;
  }
}
