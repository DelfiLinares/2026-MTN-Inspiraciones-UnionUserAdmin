// Enums del dominio como objetos constantes + uniones de literales (data-model.md §1).
// Sin dependencias de React ni de red.

export const RolUsuario = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type RolUsuario = (typeof RolUsuario)[keyof typeof RolUsuario];

export const EstadoPublicacion = {
  ACTIVA: "ACTIVA",
  REPORTADA: "REPORTADA",
  ELIMINADA: "ELIMINADA",
} as const;
export type EstadoPublicacion = (typeof EstadoPublicacion)[keyof typeof EstadoPublicacion];

// `TUTORIAL` queda pendiente de decisión (spec A-11).
export const TipoContenido = {
  IMAGEN: "IMAGEN",
  VIDEO: "VIDEO",
  AUDIO: "AUDIO",
} as const;
export type TipoContenido = (typeof TipoContenido)[keyof typeof TipoContenido];

export const FormatoArchivo = {
  PNG: "png",
  JPEG: "jpeg",
  MP4: "mp4",
  AVI: "avi",
  MP3: "mp3",
} as const;
export type FormatoArchivo = (typeof FormatoArchivo)[keyof typeof FormatoArchivo];

// Lista provisional de motivos (spec A-13).
export const MotivoReporte = {
  SPAM: "SPAM",
  CONTENIDO_INAPROPIADO: "CONTENIDO_INAPROPIADO",
  PLAGIO: "PLAGIO",
  OTRO: "OTRO",
} as const;
export type MotivoReporte = (typeof MotivoReporte)[keyof typeof MotivoReporte];

export const VisibilidadCarpeta = {
  PRIVADA: "PRIVADA",
  PUBLICA: "PUBLICA",
} as const;
export type VisibilidadCarpeta = (typeof VisibilidadCarpeta)[keyof typeof VisibilidadCarpeta];
