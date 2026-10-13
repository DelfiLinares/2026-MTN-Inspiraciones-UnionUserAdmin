import { RolUsuario } from "../../../domain/enums";
import { SesionActual } from "../SesionActual";

// Pendiente de A-22: el atributo contenido no se define hasta resolverlo.
export interface PropsRespuestaDesafio {
  readonly id: string;
  readonly desafioId: string;
  readonly autorId: string;
}

export class RespuestaDesafio {
  readonly id: string;
  readonly desafioId: string;
  readonly autorId: string;

  constructor(props: PropsRespuestaDesafio) {
    this.id = props.id;
    this.desafioId = props.desafioId;
    this.autorId = props.autorId;
  }

  // Solo el autor edita; el admin nunca edita respuestas ajenas (clarificación 2026-10-11).
  puedeEditarPor(sesion: SesionActual): boolean {
    return sesion.usuarioId === this.autorId;
  }

  puedeEliminarPor(sesion: SesionActual): boolean {
    return sesion.rol === RolUsuario.ADMIN || sesion.usuarioId === this.autorId;
  }
}
