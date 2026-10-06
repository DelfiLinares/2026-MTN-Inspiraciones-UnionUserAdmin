// Servicios de la app de usuario: un único cliente HTTP compartido por App y las páginas (T059).
import {
  crearHttpClient,
  crearPublicacionesService,
  crearSesionService,
} from "@inspiraciones/shared";

const URL_API = import.meta.env.VITE_API_URL ?? "/api";

export const httpClient = crearHttpClient({ baseUrl: URL_API });
export const sesionService = crearSesionService(httpClient);
export const publicacionesService = crearPublicacionesService(httpClient);
