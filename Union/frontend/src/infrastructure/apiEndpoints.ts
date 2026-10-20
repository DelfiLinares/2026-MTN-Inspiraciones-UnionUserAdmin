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
  registro: () => '/auth/register',
  me: () => '/usuarios/me',

  // Módulo 004-inspiraciones-perfil — Perfiles (HU-01, HU-02, HU-03)
  perfilActual: () => '/usuarios/me',
  obtenerPerfil: (usuarioId: string) => `/usuarios/${usuarioId}`,
  actualizarPerfil: () => '/usuarios/me',
  cambiarFotoPerfil: () => '/usuarios/me/avatar',

  // Módulo 004-inspiraciones-perfil — Seguimiento (HU-04)
  seguirUsuario: (usuarioId: string) => `/usuarios/${usuarioId}/seguimiento`,
  dejarDeSeguirUsuario: (usuarioId: string) => `/usuarios/${usuarioId}/seguimiento`,

  // Módulo 004-inspiraciones-perfil — Carpetas (HU-05, HU-06, HU-07, HU-08)
  listarCarpetasDePerfil: (usuarioId: string) => `/usuarios/${usuarioId}/carpetas`,
  crearCarpeta: () => '/carpetas',
  renombrarCarpeta: (carpetaId: string) => `/carpetas/${carpetaId}`,
  eliminarCarpeta: (carpetaId: string) => `/carpetas/${carpetaId}`,

  // Módulo 004-inspiraciones-perfil — Publicaciones en Carpetas (HU-09, HU-10)
  listarPostsDeCarpeta: (carpetaId: string) => `/carpetas/${carpetaId}/posts`,
  guardarPostEnCarpeta: (carpetaId: string) => `/carpetas/${carpetaId}/posts`,
  quitarPostDeCarpeta: (carpetaId: string, publicacionId: string) =>
    `/carpetas/${carpetaId}/posts/${publicacionId}`,

  // Módulo 004-inspiraciones-perfil — Publicaciones Propias (HU-11, HU-12, HU-13)
  listarPublicacionesDePerfil: (usuarioId: string) => `/usuarios/${usuarioId}/publicaciones`,
  editarPublicacion: (publicacionId: string) => `/publicaciones/${publicacionId}`,
  eliminarPublicacion: (publicacionId: string) => `/publicaciones/${publicacionId}`,

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

  // Publicaciones, interacciones, coautoría y feed (rutas relativas a /api)
  publicaciones: () => '/publicaciones',
  categoriasPublicaciones: () => '/publicaciones/categorias',
  interesesOnboarding: () => '/usuarios/me/intereses/onboarding',
  publicacionUsuario: (publicacionId: string) => `/publicaciones/${encodeURIComponent(publicacionId)}`,
  comentariosPublicacion: (publicacionId: string) =>
    `/publicaciones/${encodeURIComponent(publicacionId)}/comentarios`,
  comentarioPublicacion: (publicacionId: string, commentId: string) =>
    `/publicaciones/${encodeURIComponent(publicacionId)}/comentarios/${encodeURIComponent(commentId)}`,
  reaccionesPublicacion: (publicacionId: string) =>
    `/publicaciones/${encodeURIComponent(publicacionId)}/reacciones`,
  coautoresPublicacion: (publicacionId: string) =>
    `/publicaciones/${encodeURIComponent(publicacionId)}/coautores`,
  invitacionesCoautoria: () => '/usuarios/me/invitaciones-coautoria',
  invitacionCoautoria: (invitacionId: string) =>
    `/usuarios/me/invitaciones-coautoria/${encodeURIComponent(invitacionId)}`,
  feedRecomendaciones: () => '/feed/recomendaciones',
  consentimientoFeedPiloto: () => '/feed/piloto/consentimiento',
  preferenciasFeed: () => '/usuarios/me/preferencias',
  seguimientoUsuario: (usuarioId: string) =>
    `/usuarios/${encodeURIComponent(usuarioId)}/seguimiento`,

  // Moderación de publicaciones y reportes (RF-61 a RF-65)
  publicacionesReportadas: () => '/admin/reportes',
  eliminarPublicacionModeracion: (publicacionId: string) => `/admin/publicaciones/${publicacionId}/eliminar`,
  publicacion: (publicacionId: string) => `/admin/publicaciones/${publicacionId}`,
  reporte: (reporteId: string) => `/admin/reportes/${reporteId}`,
  resolverReporteSinEliminar: (reporteId: string) => `/admin/reportes/${reporteId}/aceptar`,

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
  iniciarExportacionReporteAnalitica: () => '/admin/reportes/exportar',
  descargarExportacionReporteAnalitica: (exportacionId: string) =>
    `/admin/reportes-analiticas/exportaciones/${exportacionId}/descarga`,
} as const
