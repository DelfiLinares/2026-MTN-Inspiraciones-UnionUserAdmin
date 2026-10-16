// Manejo central de errores (T070): clasifica un error en una categoría de pantalla global.
// Sin React ni red. Spec: RF-09, CB-09. Res.: D-11.

import { ErrorHttp } from "../services/errores";

export type CategoriaError = "no-autenticado" | "sin-permiso" | "no-encontrado" | "red" | "otro";

export function clasificarError(error: unknown): CategoriaError {
  if (error instanceof ErrorHttp) {
    switch (error.codigo) {
      case 401:
        return "no-autenticado";
      case 403:
        return "sin-permiso";
      case 404:
        return "no-encontrado";
      case "red":
        return "red";
      default:
        return "otro";
    }
  }
  if (error instanceof TypeError) {
    // fetch rechaza con TypeError cuando no hay respuesta del servidor.
    return "red";
  }
  return "otro";
}
