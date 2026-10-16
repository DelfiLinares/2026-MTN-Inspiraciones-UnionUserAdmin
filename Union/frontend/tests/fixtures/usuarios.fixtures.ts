/**
 * Fixtures de usuarios para validación manual/tests del módulo `002-frontend-admin`.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T073)
 * - Union/specs/002-frontend-admin/quickstart.md → Prerrequisitos
 * - Union/specs/002-frontend-admin/research.md §2 (uso exclusivo en `tests/` y demo visual)
 *
 * Cobertura mínima exigida por quickstart (Prerrequisitos):
 * - Al menos un usuario `USER` con estado `ACTIVO`.
 * - Al menos un usuario con rol `ADMIN` (distinto del actor autenticado).
 */

import type { UsuarioAdminProps } from '../../src/domain/UsuarioAdmin'
import { RolUsuarioAdmin } from '../../src/domain/enums/RolUsuarioAdmin'
import { EstadoCuentaUsuario } from '../../src/domain/enums/EstadoCuentaUsuario'

/**
 * Actor administrativo autenticado para escenarios manuales de quickstart.
 * Se mantiene separado de `USUARIO_ADMIN_EXISTENTE_FIXTURE` para cubrir explícitamente
 * "ADMIN distinto del actor autenticado".
 */
export const ADMIN_ACTOR_FIXTURE: UsuarioAdminProps = {
  id: 'admin-actor-001',
  nombre: 'Admin Actor Principal',
  mail: 'admin.actor@ipm.edu.ar',
  rol: RolUsuarioAdmin.ADMIN,
  estadoCuenta: EstadoCuentaUsuario.ACTIVO,
}

/**
 * Usuario objetivo `USER` + `ACTIVO` (mínimo requerido):
 * - Escenario 1 (banear), 2 (eliminar), 3 (promover).
 */
export const USUARIO_USER_ACTIVO_FIXTURE: UsuarioAdminProps = {
  id: 'user-activo-001',
  nombre: 'Usuario Activo Ejemplo',
  mail: 'usuario.activo@ipm.edu.ar',
  rol: RolUsuarioAdmin.USER,
  estadoCuenta: EstadoCuentaUsuario.ACTIVO,
}

/**
 * Usuario `ADMIN` distinto del actor autenticado (mínimo requerido):
 * - Escenarios 1 y 2: verificar deshabilitación de banear/eliminar sobre ADMIN.
 * - Escenario 3: no-op al intentar promover a quien ya es ADMIN.
 */
export const USUARIO_ADMIN_EXISTENTE_FIXTURE: UsuarioAdminProps = {
  id: 'admin-objetivo-002',
  nombre: 'Admin Objetivo Existente',
  mail: 'admin.objetivo@ipm.edu.ar',
  rol: RolUsuarioAdmin.ADMIN,
  estadoCuenta: EstadoCuentaUsuario.ACTIVO,
}

/**
 * Colección sugerida para poblar listados en demos/tests.
 */
export const USUARIOS_FIXTURES: UsuarioAdminProps[] = [
  ADMIN_ACTOR_FIXTURE,
  USUARIO_USER_ACTIVO_FIXTURE,
  USUARIO_ADMIN_EXISTENTE_FIXTURE,
]
