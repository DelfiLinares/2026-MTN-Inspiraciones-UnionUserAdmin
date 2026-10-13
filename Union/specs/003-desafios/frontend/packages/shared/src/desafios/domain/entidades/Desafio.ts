import { RolUsuario } from "../../../domain/enums";
import { AmbitoDesafio } from "../AmbitoDesafio";
import { EstadoDesafio } from "../enums/EstadoDesafio";
import { Foto } from "../Foto";
import { RangoFechas, type OpcionesEstadoRango } from "../RangoFechas";
import { SesionActual } from "../SesionActual";

export type ErroresCampos = Readonly<Record<string, string>>;

export interface DatosDesafio {
  readonly nombre: string;
  readonly descripcionLarga: string;
  readonly fotos: readonly Foto[];
  readonly ambitos: readonly AmbitoDesafio[];
  readonly fechaInicio: Date;
  readonly fechaFin: Date;
}

export interface PropsDesafio {
  readonly id: string;
  readonly nombre: string;
  readonly descripcionLarga: string;
  readonly fotos: readonly Foto[];
  readonly rango: RangoFechas;
  readonly ambitos: readonly AmbitoDesafio[];
  readonly tieneRespuestas: boolean;
  readonly version: number;
  readonly eliminado: boolean;
}

export class Desafio {
  readonly id: string;
  readonly nombre: string;
  readonly descripcionLarga: string;
  readonly fotos: readonly Foto[];
  readonly rango: RangoFechas;
  readonly ambitos: readonly AmbitoDesafio[];
  readonly tieneRespuestas: boolean;
  readonly version: number;
  readonly eliminado: boolean;

  constructor(props: PropsDesafio) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.descripcionLarga = props.descripcionLarga;
    this.fotos = [...props.fotos];
    this.rango = props.rango;
    this.ambitos = [...props.ambitos];
    this.tieneRespuestas = props.tieneRespuestas;
    this.version = props.version;
    this.eliminado = props.eliminado;
  }

  static validar(datos: DatosDesafio): ErroresCampos {
    const errores: Record<string, string> = {};

    if (datos.nombre.trim() === "") {
      errores.nombre = "El nombre es obligatorio.";
    }
    if (datos.descripcionLarga.trim() === "") {
      errores.descripcionLarga = "La descripción es obligatoria.";
    }
    if (datos.fotos.length < 1 || datos.fotos.length > 5) {
      errores.fotos = "Debe haber entre 1 y 5 fotos.";
    } else if (datos.fotos.filter((foto) => foto.principal).length !== 1) {
      errores.fotos = "Debe haber exactamente una foto principal.";
    }
    if (datos.ambitos.length === 0) {
      errores.ambitos = "Debe haber al menos un ámbito.";
    }
    if (datos.fechaFin.getTime() <= datos.fechaInicio.getTime()) {
      errores.fechas = "La fecha de fin debe ser posterior a la de inicio.";
    }

    return errores;
  }

  estado(ahora: Date, opciones: OpcionesEstadoRango): EstadoDesafio {
    if (this.eliminado) {
      return EstadoDesafio.ELIMINADO;
    }
    return this.rango.estado(ahora, opciones);
  }

  puedeEditarPor(sesion: SesionActual): boolean {
    return sesion.rol === RolUsuario.ADMIN;
  }

  puedeEliminarPor(sesion: SesionActual): boolean {
    return sesion.rol === RolUsuario.ADMIN;
  }

  requiereConfirmacionEdicion(ahora: Date, opciones: OpcionesEstadoRango): boolean {
    return this.estado(ahora, opciones) === EstadoDesafio.ACTIVO || this.tieneRespuestas;
  }

  aceptaRespuestas(ahora: Date, opciones: OpcionesEstadoRango): boolean {
    return this.estado(ahora, opciones) === EstadoDesafio.ACTIVO;
  }

  marcarEliminado(): Desafio {
    return new Desafio({
      id: this.id,
      nombre: this.nombre,
      descripcionLarga: this.descripcionLarga,
      fotos: this.fotos,
      rango: this.rango,
      ambitos: this.ambitos,
      tieneRespuestas: this.tieneRespuestas,
      version: this.version,
      eliminado: true,
    });
  }
}
