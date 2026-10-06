// Servicios de la app de usuario: un único cliente HTTP compartido por App y las páginas (T059).
import {
  crearCarpetasService,
  crearHttpClient,
  crearLikesService,
  crearPublicacionesService,
  crearReportesService,
  crearSesionService,
} from "@inspiraciones/shared";

const URL_API = import.meta.env.VITE_API_URL ?? "/api";

export const httpClient = crearHttpClient({ baseUrl: URL_API });
export const sesionService = crearSesionService(httpClient);
export const publicacionesService = crearPublicacionesService(httpClient);
export const likesService = crearLikesService(httpClient);
export const carpetasService = crearCarpetasService(httpClient);
export const reportesService = crearReportesService(httpClient);
