/**
 * Enum para roles de usuario en la plataforma Inspiraciones Union.
 * 
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Enums: RolUsuario)
 * - Union/specs/004-inspiraciones-perfil/spec.md (Sección 1.3: "Nota sobre el rol")
 * 
 * Nota sobre el uso en módulo 004-inspiraciones-perfil:
 * - El rol NO condiciona las capacidades de este módulo (Principio VI).
 * - USER y ADMIN tienen exactamente las mismas capacidades sobre su perfil, carpetas y publicaciones.
 * - Solo en módulo 002-frontend-admin el rol condiciona permisos.
 * 
 * Trazabilidad:
 * - spec.md: Nota sobre el rol (línea 40-43)
 * - Tasks: T007, T009
 */

export enum RolUsuario {
  USER = "USER",
  ADMIN = "ADMIN",
}
