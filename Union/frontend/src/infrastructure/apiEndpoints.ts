/**
 * Catálogo centralizado de rutas relativas de la API para el módulo administrativo.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección C)
 * - Union/specs/001-plataforma-unificada/tasks.md (T043)
 * - Union/specs/001-plataforma-unificada/spec.md (RF-54 a RF-76)
 *
 * Centraliza las rutas de:
 * - Autenticación y sesión (`/auth/login`, `/auth/me`)
 * - Dashboard (`/admin/dashboard` y `/dashboard`)
 * - Gestión de usuarios (`/admin/usuarios`, banear, eliminar, promover, degradar)
 * - Moderación de publicaciones y reportes (`/admin/publicaciones/...`, `/admin/reportes/...`)
 * - Gestión de desafíos propuestos (`/admin/desafios-propuestos/...`)
 * - Analíticas y exportaciones (`/admin/analiticas`, `/admin/reportes-analiticas/...`)
 */

export const apiEndpoints = {
  // Autenticación & Sesión (compartido)
  login: () => '/auth/login',
  me: () => '/auth/me',
  logout: () => '/auth/logout',

  // Dashboard administrativo (RF-54, RF-55)
  dashboard: () => '/admin/dashboard',
  dashboardLegacy: () => '/dashboard',

  // Gestión de usuarios (RF-56 a RF-59, RF-76)
  usuarios: () => '/admin/usuarios',
  usuariosLegacy: () => '/usuarios',
  banearUsuario: (usuarioId: string) => `/admin/usuarios/${usuarioId}/banear`,
  eliminarUsuario: (usuarioId: string) => `/admin/usuarios/${usuarioId}`,
  promoverUsuario: (usuarioId: string) => `/admin/usuarios/${usuarioId}/promover`,
  degradarUsuario: (usuarioId: string) => `/admin/usuarios/${usuarioId}/degradar`,

  // Moderación de publicaciones y reportes (RF-61 a RF-65)
  publicacionesReportadas: () => '/admin/publicaciones/reportadas',
  eliminarPublicacionModeracion: (publicacionId: string) => `/admin/publicaciones/${publicacionId}`,
  publicacion: (publicacionId: string) => `/admin/publicaciones/${publicacionId}`,
  reporte: (reporteId: string) => `/admin/reportes/${reporteId}`,
  resolverReporteSinEliminar: (reporteId: string) => `/admin/reportes/${reporteId}/resolver-sin-eliminar`,

  // Gestión de desafíos propuestos (RF-66 a RF-70)
  desafiosPropuestos: () => '/admin/desafios-propuestos',
  desafioPropuesto: (desafioId: string) => `/admin/desafios-propuestos/${desafioId}`,
  aprobarDesafio: (desafioId: string) => `/admin/desafios-propuestos/${desafioId}/aprobar`,
  rechazarDesafio: (desafioId: string) => `/admin/desafios-propuestos/${desafioId}/rechazar`,
  desafios: () => '/admin/desafios-propuestos',
  desafio: (desafioId: string) => `/admin/desafios-propuestos/${desafioId}`,

  // Reportes y Analíticas (RF-71 a RF-74)
  analiticas: () => '/admin/analiticas',
  reportesAnaliticas: () => '/admin/reportes-analiticas',
  iniciarExportacionReporteAnalitica: () => '/admin/reportes-analiticas/exportaciones',
  descargarExportacionReporteAnalitica: (exportacionId: string) =>
    `/admin/reportes-analiticas/exportaciones/${exportacionId}/descarga`,
} as const
