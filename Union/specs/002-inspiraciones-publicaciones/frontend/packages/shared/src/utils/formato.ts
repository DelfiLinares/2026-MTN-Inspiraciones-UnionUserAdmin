// Utilidades puras de formato (T017). Sin React ni red.
// Spec: RNF-01 (interfaz amigable y en español), RF-02 (texto alternativo de imágenes).

import type { TipoContenido } from "../domain/enums";
import type { Publicacion } from "../domain/tipos";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

const UNIDADES = ["B", "KB", "MB", "GB"] as const;

const NOMBRE_TIPO: Readonly<Record<TipoContenido, string>> = {
  IMAGEN: "Imagen",
  VIDEO: "Video",
  AUDIO: "Audio",
};

/**
 * Fecha larga en español ("1 de octubre de 2026"), calculada en UTC para no depender
 * de la zona horaria. Devuelve "" si la fecha no es válida.
 */
export function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return "";
  }
  const mes = MESES[fecha.getUTCMonth()] ?? "";
  return `${fecha.getUTCDate()} de ${mes} de ${fecha.getUTCFullYear()}`;
}

/**
 * Tamaño legible con coma decimal y un decimal como máximo ("1,5 KB").
 * Un valor negativo o no finito se muestra como "0 B".
 */
export function formatearTamano(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  if (bytes < 1024) {
    return `${Math.round(bytes)} B`;
  }

  let valor = bytes;
  let indice = 0;
  while (valor >= 1024 && indice < UNIDADES.length - 1) {
    valor /= 1024;
    indice += 1;
  }
  const redondeado = Math.round(valor * 10) / 10;
  return `${String(redondeado).replace(".", ",")} ${UNIDADES[indice] ?? "B"}`;
}

/**
 * Texto alternativo del medio de una publicación: tipo, título y autor.
 * Nunca devuelve un texto vacío.
 */
export function textoAlternativo(publicacion: Publicacion): string {
  const titulo = publicacion.titulo.trim();
  const tipo = NOMBRE_TIPO[publicacion.tipoContenido];
  const nombreTitulo = titulo.length > 0 ? titulo : "Publicación sin título";
  return `${tipo}: ${nombreTitulo}, de ${publicacion.autor.nombre}`;
}
