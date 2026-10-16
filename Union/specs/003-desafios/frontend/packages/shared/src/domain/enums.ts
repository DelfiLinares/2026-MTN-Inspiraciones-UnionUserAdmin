/**
 * Enums compartidos del dominio
 *
 * Re-exporta enums del paquete compartido (task T005 completada).
 * Estos enums se reutilizan en el módulo de desafíos sin redefinirlos.
 *
 * Fuente de verdad:
 * - tasks.md: T005 (Confirmar que RolUsuario está exportado)
 */

/**
 * RolUsuario: Tipos de usuario en el sistema.
 * - USER: Usuario regular
 * - ADMIN: Administrador
 *
 * Nota: La definición real vive en el paquete compartido (task T005).
 * Aquí se re-exporta para disponibilidad en la capa de desafíos.
 */
export enum RolUsuario {
  USER = "USER",
  ADMIN = "ADMIN",
}
