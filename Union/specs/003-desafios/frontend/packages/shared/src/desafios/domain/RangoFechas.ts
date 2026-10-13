import { EstadoDesafio } from "./enums/EstadoDesafio";

export interface OpcionesEstadoRango {
  /** Pendiente de A-16. Sin valor por defecto hasta resolverlo. */
  readonly finInclusivo: boolean;
}

export class RangoFechas {
  readonly inicio: Date;
  readonly fin: Date;

  constructor(inicio: Date, fin: Date) {
    // Pendiente de reemplazar por ErrorValidacion (T012).
    if (fin.getTime() <= inicio.getTime()) {
      throw new Error("La fecha de fin debe ser posterior a la de inicio.");
    }
    this.inicio = new Date(inicio.getTime());
    this.fin = new Date(fin.getTime());
  }

  estado(ahora: Date, opciones: OpcionesEstadoRango): EstadoDesafio {
    if (ahora.getTime() < this.inicio.getTime()) {
      return EstadoDesafio.PROGRAMADO;
    }
    return ahora.getTime() >= this.limiteFin(opciones).getTime()
      ? EstadoDesafio.FINALIZADO
      : EstadoDesafio.ACTIVO;
  }

  igual(otro: RangoFechas): boolean {
    return this.inicio.getTime() === otro.inicio.getTime() && this.fin.getTime() === otro.fin.getTime();
  }

  private limiteFin(opciones: OpcionesEstadoRango): Date {
    if (!opciones.finInclusivo) {
      return new Date(this.fin.getTime());
    }
    // Usa la zona horaria local del entorno; la del servidor queda pendiente de A-16.
    const diaSiguiente = new Date(this.fin.getTime());
    diaSiguiente.setDate(diaSiguiente.getDate() + 1);
    diaSiguiente.setHours(0, 0, 0, 0);
    return diaSiguiente;
  }
}
