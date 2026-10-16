import type { RolUsuario } from "../../domain/enums";

export class SesionActual {
  readonly usuarioId: string;
  readonly rol: RolUsuario;

  constructor(usuarioId: string, rol: RolUsuario) {
    this.usuarioId = usuarioId;
    this.rol = rol;
  }
}
