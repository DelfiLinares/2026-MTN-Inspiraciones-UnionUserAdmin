// Datos de prueba compartidos por los handlers MSW y los tests (T021).
// Spec: CB-01 a CB-05 (publicación eliminada, carpeta vacía, reporte duplicado, etc.).
// Solo datos tipados: sin lógica de servidor ni de negocio.

import {
  EstadoPublicacion,
  FormatoArchivo,
  MotivoReporte,
  RolUsuario,
  TipoContenido,
  VisibilidadCarpeta,
} from "../../packages/shared/src/domain/enums";
import type {
  Carpeta,
  ItemCarpeta,
  Publicacion,
  PublicacionReportada,
  Reporte,
  UsuarioActual,
} from "../../packages/shared/src/domain/tipos";

// Usuarios

export const usuario: UsuarioActual = { id: "u-ana", nombre: "Ana", rol: RolUsuario.USER };
export const otroUsuario: UsuarioActual = { id: "u-beto", nombre: "Beto", rol: RolUsuario.USER };
export const administrador: UsuarioActual = {
  id: "u-admin",
  nombre: "Admin",
  rol: RolUsuario.ADMIN,
};

// Publicaciones

const FECHA = "2026-10-01T12:00:00Z";

const base: Publicacion = {
  id: "p-base",
  titulo: "Base",
  descripcion: "Descripción base",
  contenido: "https://ejemplo.test/media/base.png",
  formato: FormatoArchivo.PNG,
  tipoContenido: TipoContenido.IMAGEN,
  categoria: "Dibujo",
  etiquetas: ["acuarela"],
  autor: { id: otroUsuario.id, nombre: otroUsuario.nombre },
  fechaCreacion: FECHA,
  fechaUltimaEdicion: FECHA,
  cantidadLikes: 0,
  estado: EstadoPublicacion.ACTIVA,
  likeadaPorMi: false,
  guardadaPorMi: false,
  reportadaPorMi: false,
};

/** Publicación propia del usuario (`usuario`): puede editarla y borrarla; no puede likearla. */
export const publicacionPropia: Publicacion = {
  ...base,
  id: "p-propia",
  titulo: "Acuarela de otoño",
  descripcion: "Una acuarela con hojas secas",
  autor: { id: usuario.id, nombre: usuario.nombre },
  etiquetas: ["acuarela", "otoño"],
  cantidadLikes: 3,
};

/** Publicación ajena sin interacciones: se puede likear, guardar y reportar. */
export const publicacionAjena: Publicacion = {
  ...base,
  id: "p-ajena",
  titulo: "Escultura en arcilla",
  descripcion: "Un busto modelado a mano",
  tipoContenido: TipoContenido.IMAGEN,
  categoria: "Escultura",
  etiquetas: ["arcilla"],
  cantidadLikes: 12,
};

/** Publicación ajena ya likeada y guardada por el usuario. */
export const publicacionLikeadaYGuardada: Publicacion = {
  ...base,
  id: "p-interactuada",
  titulo: "Retrato a carbonilla",
  descripcion: "Un retrato en blanco y negro",
  categoria: "Dibujo",
  etiquetas: ["carbonilla", "retrato"],
  cantidadLikes: 8,
  likeadaPorMi: true,
  guardadaPorMi: true,
};

/** Publicación ajena que el usuario ya reportó (reporte duplicado: 409). */
export const publicacionYaReportada: Publicacion = {
  ...base,
  id: "p-ya-reportada",
  titulo: "Collage dudoso",
  descripcion: "Un collage con material de otra persona",
  categoria: "Collage",
  etiquetas: ["collage"],
  cantidadLikes: 1,
  reportadaPorMi: true,
};

/** Publicación eliminada (borrado lógico): el detalle responde 404; en carpetas aparece como no disponible. */
export const publicacionEliminada: Publicacion = {
  ...base,
  id: "p-eliminada",
  titulo: "Obra eliminada",
  descripcion: "Esta publicación ya no está",
  estado: EstadoPublicacion.ELIMINADA,
};

/** Publicación de video y de audio, para probar los demás tipos de contenido. */
export const publicacionVideo: Publicacion = {
  ...base,
  id: "p-video",
  titulo: "Proceso de pintura",
  descripcion: "Video del proceso paso a paso",
  contenido: "https://ejemplo.test/media/proceso.mp4",
  formato: FormatoArchivo.MP4,
  tipoContenido: TipoContenido.VIDEO,
  categoria: "Tutorial",
  etiquetas: ["proceso"],
};

export const publicacionAudio: Publicacion = {
  ...base,
  id: "p-audio",
  titulo: "Melodía de piano",
  descripcion: "Una melodía improvisada",
  contenido: "https://ejemplo.test/media/melodia.mp3",
  formato: FormatoArchivo.MP3,
  tipoContenido: TipoContenido.AUDIO,
  categoria: "Música",
  etiquetas: ["piano"],
};

/** Publicación que el administrador autorizó ver reportada por otros. */
export const publicacionReportadaPorOtros: Publicacion = {
  ...base,
  id: "p-reportada",
  titulo: "Publicación reportada",
  descripcion: "Recibió reportes de otros usuarios",
  estado: EstadoPublicacion.REPORTADA,
  cantidadLikes: 2,
};

export const publicaciones: readonly Publicacion[] = [
  publicacionPropia,
  publicacionAjena,
  publicacionLikeadaYGuardada,
  publicacionYaReportada,
  publicacionVideo,
  publicacionAudio,
  publicacionReportadaPorOtros,
  publicacionEliminada,
];

// Carpetas

export const carpetaConContenido: Carpeta = {
  id: "c-ideas",
  nombre: "Ideas",
  cantidadPublicaciones: 2,
  visibilidad: VisibilidadCarpeta.PRIVADA,
};

/** Carpeta vacía (CB-05). */
export const carpetaVacia: Carpeta = {
  id: "c-vacia",
  nombre: "Vacía",
  cantidadPublicaciones: 0,
  visibilidad: VisibilidadCarpeta.PRIVADA,
};

export const carpetaPublica: Carpeta = {
  id: "c-publica",
  nombre: "Favoritas",
  cantidadPublicaciones: 1,
  visibilidad: VisibilidadCarpeta.PUBLICA,
};

export const carpetas: readonly Carpeta[] = [carpetaConContenido, carpetaVacia, carpetaPublica];

/** Contenido de `carpetaConContenido`: una publicación disponible y otra eliminada (CB-02). */
export const itemsCarpetaConContenido: readonly ItemCarpeta[] = [
  { disponible: true, publicacion: publicacionLikeadaYGuardada },
  { disponible: false, id: publicacionEliminada.id },
];

export const itemsCarpetaPublica: readonly ItemCarpeta[] = [
  { disponible: true, publicacion: publicacionAjena },
];

// Reportes y moderación

export const reporteSpam: Reporte = {
  id: "r-1",
  publicacion: publicacionReportadaPorOtros,
  motivo: MotivoReporte.SPAM,
  fecha: "2026-10-02T09:00:00Z",
  reportante: { id: usuario.id, nombre: usuario.nombre },
  resuelto: false,
};

export const reporteOtro: Reporte = {
  id: "r-2",
  publicacion: publicacionReportadaPorOtros,
  motivo: MotivoReporte.OTRO,
  textoLibre: "Copia de una obra ajena",
  fecha: "2026-10-03T15:30:00Z",
  reportante: { id: otroUsuario.id, nombre: otroUsuario.nombre },
  resuelto: false,
};

export const publicacionReportadaModeracion: PublicacionReportada = {
  publicacion: publicacionReportadaPorOtros,
  cantidadReportes: 2,
  motivos: [MotivoReporte.SPAM, MotivoReporte.OTRO],
  reportes: [reporteSpam, reporteOtro],
};

export const reportadasModeracion: readonly PublicacionReportada[] = [
  publicacionReportadaModeracion,
];

// Configuración informada por la API (S-2)

export const configuracionArchivos = {
  formatosPermitidos: [
    FormatoArchivo.PNG,
    FormatoArchivo.JPEG,
    FormatoArchivo.MP4,
    FormatoArchivo.AVI,
    FormatoArchivo.MP3,
  ],
  tamanoMaxBytes: 10 * 1024 * 1024,
} as const;
