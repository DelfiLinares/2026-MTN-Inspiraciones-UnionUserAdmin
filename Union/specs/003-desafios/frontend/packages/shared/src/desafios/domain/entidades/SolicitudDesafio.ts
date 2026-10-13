import { RolUsuario } from "../../../domain/enums";
import { EstadoSolicitudDesafio } from "../enums/EstadoSolicitudDesafio";
import { TransicionInvalida } from "../errores/ErroresDominio";
import { SesionActual } from "../SesionActual";

// Pendiente de A-04: mientras no se resuelva, las solicitudes resueltas no se editan ni eliminan.
const A04_BLOQUEA_SOLICITUDES_RESUELTAS = true;

export interface PropsSolicitudDesafio {
  readonly id: string;
  readonly autorId: string;
  readonly estado: EstadoSolicitudDesafio;
  readonly version: number;
}

export class SolicitudDesafio {
  readonly id: string;
  readonly autorId: string;
  readonly estado: EstadoSolicitudDesafio;
  readonly version: number;

  constructor(props: PropsSolicitudDesafio) {
    this.id = props.id;
    this.autorId = props.autorId;
    this.estado = props.estado;
    this.version = props.version;
  }

  aprobar(): SolicitudDesafio {
    this.exigirPendiente("aprobar");
    return this.conEstado(EstadoSolicitudDesafio.APROBADA);
  }

  rechazar(): SolicitudDesafio {
    this.exigirPendiente("rechazar");
    return this.conEstado(EstadoSolicitudDesafio.RECHAZADA);
  }

  estaResuelta(): boolean {
    return (
      this.estado === EstadoSolicitudDesafio.APROBADA ||
      this.estado === EstadoSolicitudDesafio.RECHAZADA
    );
  }

  puedeEditarPor(sesion: SesionActual): boolean {
    return this.puedeGestionarPor(sesion);
  }

  puedeEliminarPor(sesion: SesionActual): boolean {
    return this.puedeGestionarPor(sesion);
  }

  private puedeGestionarPor(sesion: SesionActual): boolean {
    if (A04_BLOQUEA_SOLICITUDES_RESUELTAS && this.estaResuelta()) {
      return false;
    }
    return sesion.rol === RolUsuario.ADMIN || sesion.usuarioId === this.autorId;
  }

  private exigirPendiente(accion: string): void {
    if (this.estado !== EstadoSolicitudDesafio.PENDIENTE) {
      throw new TransicionInvalida(
        `No se puede ${accion} una solicitud en estado ${this.estado}.`,
      );
    }
  }

  private conEstado(estado: EstadoSolicitudDesafio): SolicitudDesafio {
    return new SolicitudDesafio({
      id: this.id,
      autorId: this.autorId,
      estado,
      version: this.version,
    });
  }
}
