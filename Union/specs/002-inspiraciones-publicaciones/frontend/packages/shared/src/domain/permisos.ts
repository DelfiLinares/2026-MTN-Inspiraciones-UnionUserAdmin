// Funciones puras de permisos (T013). Fuente única de las reglas de la interfaz.
// Son una ayuda de UX: la autoridad real de los permisos es el backend (principio 9).
// Reglas: data-model.md §4. Spec: RF-06 a RF-10b, RF-14, RF-22, RF-23.

import { EstadoPublicacion, RolUsuario } from "./enums";
import type { Publicacion, UsuarioActual } from "./tipos";

function esAutor(usuario: UsuarioActual, publicacion: Publicacion): boolean {
  return publicacion.autor.id === usuario.id;
}

function estaEliminada(publicacion: Publicacion): boolean {
  return publicacion.estado === EstadoPublicacion.ELIMINADA;
}

/** Solo el autor edita; el administrador no edita publicaciones ajenas (RF-04, RF-06, RF-08). */
export function puedeEditar(usuario: UsuarioActual, publicacion: Publicacion): boolean {
  return !estaEliminada(publicacion) && esAutor(usuario, publicacion);
}

/** El autor borra la suya; el administrador borra cualquiera (RF-05, RF-06, RF-07). */
export function puedeBorrar(usuario: UsuarioActual, publicacion: Publicacion): boolean {
  if (estaEliminada(publicacion)) {
    return false;
  }
  return esAutor(usuario, publicacion) || usuario.rol === RolUsuario.ADMIN;
}

/** Like solo sobre publicaciones ajenas y no eliminadas (RF-11, RF-14). */
export function puedeDarLike(usuario: UsuarioActual, publicacion: Publicacion): boolean {
  return !estaEliminada(publicacion) && !esAutor(usuario, publicacion);
}

/** Guardar en carpetas solo publicaciones ajenas y no eliminadas (RF-17, A-9). */
export function puedeGuardar(usuario: UsuarioActual, publicacion: Publicacion): boolean {
  return !estaEliminada(publicacion) && !esAutor(usuario, publicacion);
}

/** Reportar solo publicaciones ajenas, no eliminadas y no reportadas antes por mí (RF-21 a RF-23). */
export function puedeReportar(usuario: UsuarioActual, publicacion: Publicacion): boolean {
  return (
    !estaEliminada(publicacion) &&
    !esAutor(usuario, publicacion) &&
    !publicacion.reportadaPorMi
  );
}

/** Solo el rol ADMIN accede a la moderación (RF-10b, RF-24). */
export function puedeModerar(usuario: UsuarioActual): boolean {
  return usuario.rol === RolUsuario.ADMIN;
}
