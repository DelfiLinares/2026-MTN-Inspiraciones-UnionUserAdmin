/**
 * Enum para estados de ciclo de vida de una cuenta de usuario.
 * 
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Enums: EstadoCuentaUsuario)
 * - Union/specs/004-inspiraciones-perfil/spec.md (A10: Clarificación sobre visibilidad)
 * 
 * Valores:
 * - `ACTIVO`: Cuenta normal, totalmente funcional. Perfil visible a terceros.
 * - `BANEADO`: Cuenta suspendida (por admin del módulo 002). Perfil NO visible a terceros (A10).
 * - `ELIMINADO`: Cuenta eliminada (por admin). Perfil NO visible a terceros (A10).
 * 
 * Impacto en módulo 004-inspiraciones-perfil:
 * - Solo cuentas ACTIVO pueden tener perfil visible.
 * - Intentar acceder a perfil baneado/eliminado retorna 404/403 (A10).
 * - Frontend muestra `ProfileNotFoundView` en ese caso.
 * - Método `Usuario.estaDisponible()` encapsula esta lógica.
 * 
 * Trazabilidad:
 * - spec.md: A10 (línea 509)
 * - Tasks: T008, T009
 */

export enum EstadoCuentaUsuario {
  ACTIVO = "ACTIVO",
  BANEADO = "BANEADO",
  ELIMINADO = "ELIMINADO",
}
