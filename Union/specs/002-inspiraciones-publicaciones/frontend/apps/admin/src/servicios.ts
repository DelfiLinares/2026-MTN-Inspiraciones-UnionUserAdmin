// Servicios de la app admin: un único cliente HTTP compartido por App y las páginas (T066).
import {
  crearHttpClient,
  crearModeracionService,
  crearSesionService,
} from "@inspiraciones/shared";

const URL_API = import.meta.env.VITE_API_URL ?? "/api";

export const httpClient = crearHttpClient({ baseUrl: URL_API });
export const sesionService = crearSesionService(httpClient);
export const moderacionService = crearModeracionService(httpClient);
