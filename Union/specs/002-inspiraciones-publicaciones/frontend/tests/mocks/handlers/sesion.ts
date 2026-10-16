// Handlers MSW para sesión y configuración (T022).
// Contrato: contracts/api-client.md (Sesión). Spec: RF-10b. Supuestos: S-1, S-2.

import { http, HttpResponse } from "msw";
import type { UsuarioActual } from "../../../packages/shared/src/domain/tipos";
import { configuracionArchivos, usuario } from "../datos";

/** Usuario devuelto por defecto en `GET /api/v1/sesion`. */
let usuarioActualSimulado: UsuarioActual | null = usuario;

/** Permite a los tests o escenarios cambiar el usuario autenticado (o `null` para 401). */
export function fijarUsuarioActualSimulado(nuevoUsuario: UsuarioActual | null): void {
  usuarioActualSimulado = nuevoUsuario;
}

export function reiniciarSesionSimulada(): void {
  usuarioActualSimulado = usuario;
}

export const sesionHandlers = [
  http.get("*/api/v1/sesion", () => {
    if (usuarioActualSimulado === null) {
      return HttpResponse.json(
        { codigo: 401, mensaje: "No hay una sesión activa." },
        { status: 401 },
      );
    }
    return HttpResponse.json(usuarioActualSimulado, { status: 200 });
  }),

  http.get("*/api/v1/configuracion", () => {
    return HttpResponse.json(configuracionArchivos, { status: 200 });
  }),
];
