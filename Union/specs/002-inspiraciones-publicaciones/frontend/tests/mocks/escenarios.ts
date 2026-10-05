// Escenarios preconfigurados para MSW en tests unitarios/integración (T027).
// Permite alternar fácilmente entre estados comunes del sistema:
// - Usuario con rol USER
// - Usuario con rol ADMIN
// - Sesión no autenticada (401)
// - Acción no autorizada (403)
// - Recurso no encontrado (404)
// - Red caída / Network error
// - Carpeta vacía / Lista vacía
// Spec: CB-05, CB-09. Res.: D-06.

import { http, HttpResponse } from "msw";
import { administrador, otroUsuario, usuario } from "./datos";
import { server } from "./server";

const API_BASE = "/api/v1";

export const escenarios = {
  /**
   * Configura la sesión simulada como un usuario estándar (USER).
   */
  comoUsuarioRegular() {
    server.use(
      http.get(`${API_BASE}/sesion`, () => {
        return HttpResponse.json({
          usuario,
          expiraEn: "2026-10-06T12:00:00Z",
        });
      }),
    );
  },

  /**
   * Configura la sesión simulada como un usuario administrador (ADMIN).
   */
  comoUsuarioAdmin() {
    server.use(
      http.get(`${API_BASE}/sesion`, () => {
        return HttpResponse.json({
          usuario: administrador,
          expiraEn: "2026-10-06T12:00:00Z",
        });
      }),
    );
  },

  /**
   * Simula que el usuario no tiene sesión activa (HTTP 401).
   */
  noAutenticado() {
    server.use(
      http.get(`${API_BASE}/sesion`, () => {
        return HttpResponse.json(
          {
            codigo: "NO_AUTENTICADO",
            mensaje: "No hay una sesión activa",
          },
          { status: 401 },
        );
      }),
    );
  },

  /**
   * Simula respuesta 403 Forbidden para una ruta específica o por defecto para reportes/moderación.
   */
  accesoDenegado(ruta?: string) {
    const endpoint = ruta ? `${API_BASE}${ruta}` : `${API_BASE}/*`;
    server.use(
      http.all(endpoint, () => {
        return HttpResponse.json(
          {
            codigo: "ACCESO_DENEGADO",
            mensaje: "No tienes permisos para realizar esta acción",
          },
          { status: 403 },
        );
      }),
    );
  },

  /**
   * Simula respuesta 404 No Encontrado para una ruta específica o para recursos inexistentes.
   */
  noEncontrado(ruta?: string) {
    const endpoint = ruta ? `${API_BASE}${ruta}` : `${API_BASE}/*`;
    server.use(
      http.all(endpoint, () => {
        return HttpResponse.json(
          {
            codigo: "RECURSO_NO_ENCONTRADO",
            mensaje: "El recurso solicitado no existe o fue eliminado",
          },
          { status: 404 },
        );
      }),
    );
  },

  /**
   * Simula falla catastrófica de red / servidor caído (Network Error).
   */
  redCaida(ruta?: string) {
    const endpoint = ruta ? `${API_BASE}${ruta}` : `${API_BASE}/*`;
    server.use(
      http.all(endpoint, () => {
        return HttpResponse.error();
      }),
    );
  },

  /**
   * Simula un error interno del servidor (HTTP 500).
   */
  errorServidor(ruta?: string) {
    const endpoint = ruta ? `${API_BASE}${ruta}` : `${API_BASE}/*`;
    server.use(
      http.all(endpoint, () => {
        return HttpResponse.json(
          {
            codigo: "ERROR_INTERNO",
            mensaje: "Ocurrió un error inesperado en el servidor",
          },
          { status: 500 },
        );
      }),
    );
  },

  /**
   * Simula listas vacías (feed sin publicaciones, sin carpetas, sin reportes).
   */
  listasVacias() {
    server.use(
      http.get(`${API_BASE}/publicaciones`, () => {
        return HttpResponse.json({
          elementos: [],
          total: 0,
          pagina: 1,
          tamanoPagina: 10,
          totalPaginas: 0,
        });
      }),
      http.get(`${API_BASE}/carpetas`, () => {
        return HttpResponse.json([]);
      }),
      http.get(`${API_BASE}/moderacion/reportadas`, () => {
        return HttpResponse.json({
          elementos: [],
          total: 0,
          pagina: 1,
          tamanoPagina: 10,
          totalPaginas: 0,
        });
      }),
    );
  },

  /**
   * Simula una carpeta específica vacía (sin publicaciones asociadas).
   */
  carpetaVacia(carpetaId: string) {
    server.use(
      http.get(`${API_BASE}/carpetas/${carpetaId}/publicaciones`, () => {
        return HttpResponse.json({
          elementos: [],
          total: 0,
          pagina: 1,
          tamanoPagina: 10,
          totalPaginas: 0,
        });
      }),
    );
  },
};
