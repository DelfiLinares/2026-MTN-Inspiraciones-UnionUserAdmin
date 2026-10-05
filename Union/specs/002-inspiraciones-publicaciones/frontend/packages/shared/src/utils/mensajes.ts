// Mensajes de la interfaz en español, centralizados (RF-28, RNF-01).
// Sin dependencias de React ni de red.

import type { CodigoError } from "../domain/tipos";

/** Mensajes por código de error HTTP (contracts/api-client.md, "Manejo de errores en el cliente"). */
export const MENSAJES_ERROR: Readonly<Record<CodigoError, string>> = {
  400: "La solicitud no es válida. Revisá los datos e intentá de nuevo.",
  401: "Tu sesión expiró. Iniciá sesión de nuevo para continuar.",
  403: "No tenés permiso para realizar esta acción.",
  404: "No encontramos lo que buscabas. Puede que ya no esté disponible.",
  409: "Esta acción ya fue realizada.",
  413: "El archivo es demasiado grande.",
  415: "El formato del archivo no está admitido.",
  422: "Hay datos que no son válidos. Revisá los campos marcados.",
  500: "Ocurrió un error en el servidor. Intentá de nuevo en unos minutos.",
  red: "No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.",
};

export const MENSAJES_ESTADO = {
  cargando: "Cargando…",
  vacioListado: "No hay publicaciones para mostrar.",
  vacioBusqueda: "No encontramos resultados para tu búsqueda.",
  carpetaVacia: "Esta carpeta todavía no tiene publicaciones.",
  sinCarpetas: "Todavía no creaste ninguna carpeta.",
  sinReportadas: "No hay publicaciones reportadas.",
  publicacionNoDisponible: "Publicación no disponible",
  publicacionEliminada: "Esta publicación ya fue eliminada.",
  reintentar: "Reintentar",
} as const;

export const MENSAJES_EXITO = {
  publicacionCreada: "Publicación creada.",
  publicacionEditada: "Cambios guardados.",
  publicacionBorrada: "Publicación borrada.",
  likeAgregado: "Te gustó esta publicación.",
  likeQuitado: "Quitaste tu like.",
  guardada: "Publicación guardada en la carpeta.",
  quitadaDeCarpeta: "Publicación quitada de la carpeta.",
  carpetaCreada: "Carpeta creada.",
  carpetaRenombrada: "Carpeta renombrada.",
  carpetaEliminada: "Carpeta eliminada.",
  carpetaVisibilidad: "Visibilidad de la carpeta actualizada.",
  reporteEnviado: "Reporte enviado. Gracias por avisarnos.",
} as const;

export const MENSAJES_ERROR_ACCION = {
  likeFallo: "No pudimos actualizar tu like. Intentá de nuevo.",
  guardadoFallo: "No pudimos guardar la publicación. Intentá de nuevo.",
  reporteDuplicado: "Ya reportaste esta publicación.",
  borradoFallo: "No pudimos borrar la publicación. Intentá de nuevo.",
} as const;

/** Etiquetas de los motivos de reporte para mostrar en pantalla (A-13, provisional). */
export const ETIQUETAS_MOTIVO = {
  SPAM: "Spam",
  CONTENIDO_INAPROPIADO: "Contenido inapropiado",
  PLAGIO: "Plagio",
  OTRO: "Otro",
} as const;

/** Textos del diálogo de confirmación de borrado (RF-28, principio 13). */
export const MENSAJES_CONFIRMACION = {
  borrarPublicacionTitulo: "¿Borrar esta publicación?",
  borrarPublicacionDetalle: "Esta acción no se puede deshacer.",
  borrarCarpetaTitulo: "¿Eliminar esta carpeta?",
  borrarCarpetaDetalle: "Las publicaciones guardadas no se borran, solo la carpeta.",
  confirmar: "Confirmar",
  cancelar: "Cancelar",
} as const;
