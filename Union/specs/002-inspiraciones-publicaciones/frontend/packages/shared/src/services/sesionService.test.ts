// Tests del servicio de sesión y configuración (T028).
// Spec: RF-10, RF-10b. Supuestos: A-15, S-2.

import { beforeEach, describe, expect, it } from "vitest";
import { FormatoArchivo, RolUsuario } from "../domain/enums";
import { usuario, administrador } from "../../../../tests/mocks/datos";
import {
  fijarUsuarioActualSimulado,
  reiniciarSesionSimulada,
} from "../../../../tests/mocks/handlers/sesion";
import { ErrorHttp } from "./errores";
import { crearHttpClient } from "./httpClient";
import { crearSesionService } from "./sesionService";

describe("sesionService", () => {
  const cliente = crearHttpClient({ baseUrl: "http://localhost/api/v1", retrasoReintentoMs: 0 });
  const servicio = crearSesionService(cliente);

  beforeEach(() => {
    reiniciarSesionSimulada();
  });

  describe("obtenerSesion", () => {
    it("obtiene el usuario actual autenticado con rol USER", async () => {
      fijarUsuarioActualSimulado(usuario);

      const sesion = await servicio.obtenerSesion();

      expect(sesion).toEqual({
        id: "u-ana",
        nombre: "Ana",
        rol: RolUsuario.USER,
      });
    });

    it("obtiene el usuario actual autenticado con rol ADMIN", async () => {
      fijarUsuarioActualSimulado(administrador);

      const sesion = await servicio.obtenerSesion();

      expect(sesion).toEqual({
        id: "u-admin",
        nombre: "Admin",
        rol: RolUsuario.ADMIN,
      });
    });

    it("rechaza con ErrorHttp 401 cuando no hay sesión activa", async () => {
      fijarUsuarioActualSimulado(null);

      await expect(servicio.obtenerSesion()).rejects.toThrow(ErrorHttp);
      await expect(servicio.obtenerSesion()).rejects.toMatchObject({
        codigo: 401,
      });
    });
  });

  describe("obtenerConfiguracion", () => {
    it("obtiene la configuración de formatos permitidos y tamaño máximo", async () => {
      const config = await servicio.obtenerConfiguracion();

      expect(config.formatosPermitidos).toEqual([
        FormatoArchivo.PNG,
        FormatoArchivo.JPEG,
        FormatoArchivo.MP4,
        FormatoArchivo.AVI,
        FormatoArchivo.MP3,
      ]);
      expect(config.tamanoMaxBytes).toBe(10 * 1024 * 1024);
    });
  });
});
