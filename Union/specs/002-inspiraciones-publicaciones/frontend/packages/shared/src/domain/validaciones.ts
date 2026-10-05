// Validaciones de interfaz (T015). Funciones puras, sin React ni red.
// Reglas: data-model.md §5. Spec: RF-02, RF-16, RF-21, CB-10, CB-11, HU-01.
// Cada función devuelve una lista de errores; lista vacía = válido.

import type { FormatoArchivo, MotivoReporte } from "./enums";

export interface ErrorValidacion {
  readonly campo: string;
  readonly mensaje: string;
}

/** Configuración informada por la API (S-2): formatos y tamaño máximo. */
export interface ConfiguracionArchivos {
  readonly formatosPermitidos: readonly FormatoArchivo[];
  readonly tamanoMaxBytes: number;
}

export interface ArchivoSeleccionado {
  readonly nombre: string;
  /** Extensión o formato del archivo (por ejemplo "png"). */
  readonly formato: string;
  readonly tamanoBytes: number;
}

export interface DatosPublicacion {
  readonly titulo: string;
  readonly descripcion: string;
  readonly archivo: ArchivoSeleccionado | null;
  readonly categoria: string;
  readonly etiquetas: readonly string[];
}

export interface OpcionesValidacionPublicacion {
  /** En la edición no se exige subir un archivo nuevo. */
  readonly archivoOpcional?: boolean;
}

export interface DatosReporte {
  readonly motivo: MotivoReporte | null;
  readonly textoLibre: string;
}

export const MAX_TEXTO_REPORTE = 500;
export const MAX_NOMBRE_CARPETA = 50;

function estaVacio(texto: string): boolean {
  return texto.trim().length === 0;
}

/** Formato y tamaño del archivo según la configuración de la API (RF-02, CB-11, A-11). */
export function validarArchivo(
  archivo: ArchivoSeleccionado,
  configuracion: ConfiguracionArchivos,
): ErrorValidacion[] {
  const errores: ErrorValidacion[] = [];
  const formato = archivo.formato.toLowerCase();

  if (!configuracion.formatosPermitidos.some((permitido) => permitido === formato)) {
    errores.push({
      campo: "archivo",
      mensaje: `El formato del archivo no está admitido. Formatos permitidos: ${configuracion.formatosPermitidos.join(", ")}.`,
    });
  }
  if (archivo.tamanoBytes <= 0) {
    errores.push({ campo: "archivo", mensaje: "El archivo está vacío." });
  } else if (archivo.tamanoBytes > configuracion.tamanoMaxBytes) {
    errores.push({ campo: "archivo", mensaje: "El archivo es demasiado grande." });
  }
  return errores;
}

/** Campos obligatorios de una publicación (RF-02, HU-01). */
export function validarPublicacion(
  datos: DatosPublicacion,
  configuracion: ConfiguracionArchivos,
  opciones: OpcionesValidacionPublicacion = {},
): ErrorValidacion[] {
  const errores: ErrorValidacion[] = [];

  if (estaVacio(datos.titulo)) {
    errores.push({ campo: "titulo", mensaje: "El título es obligatorio." });
  }
  if (estaVacio(datos.descripcion)) {
    errores.push({ campo: "descripcion", mensaje: "La descripción es obligatoria." });
  }

  if (datos.archivo === null) {
    if (opciones.archivoOpcional !== true) {
      errores.push({ campo: "archivo", mensaje: "El contenido principal es obligatorio." });
    }
  } else {
    errores.push(...validarArchivo(datos.archivo, configuracion));
  }

  const hayEtiquetas = datos.etiquetas.some((etiqueta) => !estaVacio(etiqueta));
  if (estaVacio(datos.categoria) && !hayEtiquetas) {
    errores.push({
      campo: "etiquetas",
      mensaje: "Indicá al menos una categoría o una etiqueta.",
    });
  }

  return errores;
}

/** Motivo obligatorio; "OTRO" exige texto; texto de hasta 500 caracteres (RF-21, A-13). */
export function validarReporte(datos: DatosReporte): ErrorValidacion[] {
  const errores: ErrorValidacion[] = [];

  if (datos.motivo === null) {
    errores.push({ campo: "motivo", mensaje: "Elegí un motivo para el reporte." });
  } else if (datos.motivo === "OTRO" && estaVacio(datos.textoLibre)) {
    errores.push({ campo: "textoLibre", mensaje: "Contanos el motivo del reporte." });
  }

  if (datos.textoLibre.length > MAX_TEXTO_REPORTE) {
    errores.push({
      campo: "textoLibre",
      mensaje: `El texto puede tener hasta ${MAX_TEXTO_REPORTE} caracteres.`,
    });
  }

  return errores;
}

/** Nombre de carpeta de 1 a 50 caracteres y sin repetir entre las existentes (RF-16, CB-10, A-7). */
export function validarNombreCarpeta(
  nombre: string,
  nombresExistentes: readonly string[] = [],
): ErrorValidacion[] {
  const errores: ErrorValidacion[] = [];
  const limpio = nombre.trim();

  if (limpio.length === 0) {
    errores.push({ campo: "nombre", mensaje: "El nombre de la carpeta es obligatorio." });
  } else if (limpio.length > MAX_NOMBRE_CARPETA) {
    errores.push({
      campo: "nombre",
      mensaje: `El nombre puede tener hasta ${MAX_NOMBRE_CARPETA} caracteres.`,
    });
  } else if (
    nombresExistentes.some((existente) => existente.trim().toLowerCase() === limpio.toLowerCase())
  ) {
    errores.push({ campo: "nombre", mensaje: "Ya tenés una carpeta con ese nombre." });
  }

  return errores;
}
