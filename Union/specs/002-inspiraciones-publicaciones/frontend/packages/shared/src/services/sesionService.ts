// Servicio de sesión y configuración (T028).
// Consume la API usando el HttpClient inyectado (RF-10, RF-10b, A-15, S-2).
// Sin React ni estado global mutable.

import type { FormatoArchivo } from "../domain/enums";
import type { UsuarioActual } from "../domain/tipos";
import type { HttpClient } from "./httpClient";

export interface ConfiguracionArchivos {
  readonly formatosPermitidos: readonly FormatoArchivo[];
  readonly tamanoMaxBytes: number;
}

export interface SesionService {
  obtenerSesion(): Promise<UsuarioActual>;
  obtenerConfiguracion(): Promise<ConfiguracionArchivos>;
}

export function crearSesionService(cliente: HttpClient): SesionService {
  return {
    async obtenerSesion(): Promise<UsuarioActual> {
      return cliente.get<UsuarioActual>("/sesion");
    },

    async obtenerConfiguracion(): Promise<ConfiguracionArchivos> {
      return cliente.get<ConfiguracionArchivos>("/configuracion");
    },
  };
}
