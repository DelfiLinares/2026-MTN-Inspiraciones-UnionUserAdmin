import { describe, it, expect } from 'vitest'
import { UsuarioAdmin } from '../../src/domain/UsuarioAdmin'
import { RolUsuarioAdmin as RolUsuario } from '../../src/domain/enums/RolUsuarioAdmin'
import { EstadoCuentaUsuario } from '../../src/domain/enums/EstadoCuentaUsuario'

describe('UsuarioAdmin (Entidad de dominio UI)', () => {
  const adminActualId = 'admin-actual-1'

  describe('puedeSerBaneado()', () => {
    it('no se puede banear a un ADMIN', () => {
      const otroAdmin = new UsuarioAdmin({
        id: 'admin-2',
        nombre: 'Otro Administrador',
        mail: 'otro@admin.com',
        rol: RolUsuario.ADMIN,
        estadoCuenta: EstadoCuentaUsuario.ACTIVO,
      })

      expect(otroAdmin.puedeSerBaneado(adminActualId)).toBe(false)
    })

    it('no se puede banear a uno mismo', () => {
      const propioUsuario = new UsuarioAdmin({
        id: adminActualId,
        nombre: 'Yo Mismo',
        mail: 'yo@admin.com',
        rol: RolUsuario.USER,
        estadoCuenta: EstadoCuentaUsuario.ACTIVO,
      })

      expect(propioUsuario.puedeSerBaneado(adminActualId)).toBe(false)
    })

    it('se puede banear a un usuario USER activo que no sea uno mismo', () => {
      const usuarioComun = new UsuarioAdmin({
        id: 'user-3',
        nombre: 'Usuario Común',
        mail: 'user@comun.com',
        rol: RolUsuario.USER,
        estadoCuenta: EstadoCuentaUsuario.ACTIVO,
      })

      expect(usuarioComun.puedeSerBaneado(adminActualId)).toBe(true)
    })

    it('no se puede banear a un usuario que ya está BANEADO o ELIMINADO', () => {
      const usuarioBaneado = new UsuarioAdmin({
        id: 'user-4',
        nombre: 'Baneado',
        mail: 'baneado@comun.com',
        rol: RolUsuario.USER,
        estadoCuenta: EstadoCuentaUsuario.BANEADO,
      })

      const usuarioEliminado = new UsuarioAdmin({
        id: 'user-5',
        nombre: 'Eliminado',
        mail: 'eliminado@comun.com',
        rol: RolUsuario.USER,
        estadoCuenta: EstadoCuentaUsuario.ELIMINADO,
      })

      expect(usuarioBaneado.puedeSerBaneado(adminActualId)).toBe(false)
      expect(usuarioEliminado.puedeSerBaneado(adminActualId)).toBe(false)
    })
  })

  describe('puedeSerEliminado()', () => {
    it('no se puede eliminar a un ADMIN', () => {
      const otroAdmin = new UsuarioAdmin({
        id: 'admin-2',
        nombre: 'Otro Administrador',
        mail: 'otro@admin.com',
        rol: RolUsuario.ADMIN,
        estadoCuenta: EstadoCuentaUsuario.ACTIVO,
      })

      expect(otroAdmin.puedeSerEliminado(adminActualId)).toBe(false)
    })

    it('no se puede eliminar a uno mismo', () => {
      const propioUsuario = new UsuarioAdmin({
        id: adminActualId,
        nombre: 'Yo Mismo',
        mail: 'yo@admin.com',
        rol: RolUsuario.USER,
        estadoCuenta: EstadoCuentaUsuario.ACTIVO,
      })

      expect(propioUsuario.puedeSerEliminado(adminActualId)).toBe(false)
    })

    it('se puede eliminar a un usuario USER no eliminado distinto de uno mismo', () => {
      const usuarioComun = new UsuarioAdmin({
        id: 'user-3',
        nombre: 'Usuario Común',
        mail: 'user@comun.com',
        rol: RolUsuario.USER,
        estadoCuenta: EstadoCuentaUsuario.ACTIVO,
      })

      expect(usuarioComun.puedeSerEliminado(adminActualId)).toBe(true)
    })

    it('no se puede eliminar a un usuario que ya está ELIMINADO', () => {
      const usuarioEliminado = new UsuarioAdmin({
        id: 'user-5',
        nombre: 'Eliminado',
        mail: 'eliminado@comun.com',
        rol: RolUsuario.USER,
        estadoCuenta: EstadoCuentaUsuario.ELIMINADO,
      })

      expect(usuarioEliminado.puedeSerEliminado(adminActualId)).toBe(false)
    })
  })

  describe('puedeSerPromovido() / puedeSerPromovidoAAdmin()', () => {
    it('promover a un ADMIN ya existente es no-op (retorna false)', () => {
      const adminExistente = new UsuarioAdmin({
        id: 'admin-2',
        nombre: 'Administrador Existente',
        mail: 'admin2@sistema.com',
        rol: RolUsuario.ADMIN,
        estadoCuenta: EstadoCuentaUsuario.ACTIVO,
      })

      expect(adminExistente.puedeSerPromovido()).toBe(false)
      expect(adminExistente.puedeSerPromovidoAAdmin()).toBe(false)
    })

    it('un usuario con rol USER y estado ACTIVO puede ser promovido', () => {
      const usuario = new UsuarioAdmin({
        id: 'user-10',
        nombre: 'Usuario Activo',
        mail: 'activo@test.com',
        rol: RolUsuario.USER,
        estadoCuenta: EstadoCuentaUsuario.ACTIVO,
      })

      expect(usuario.puedeSerPromovido()).toBe(true)
      expect(usuario.puedeSerPromovidoAAdmin()).toBe(true)
    })

    it('un usuario con rol USER pero no ACTIVO no puede ser promovido', () => {
      const usuarioBaneado = new UsuarioAdmin({
        id: 'user-11',
        nombre: 'Usuario Baneado',
        mail: 'baneado@test.com',
        rol: RolUsuario.USER,
        estadoCuenta: EstadoCuentaUsuario.BANEADO,
      })

      expect(usuarioBaneado.puedeSerPromovido()).toBe(false)
      expect(usuarioBaneado.puedeSerPromovidoAAdmin()).toBe(false)
    })
  })

  describe('puedeSerDegradado()', () => {
    it('retorna true para un ADMIN distinto del administrador actual', () => {
      const otroAdmin = new UsuarioAdmin({
        id: 'admin-otro',
        nombre: 'Otro Administrador',
        mail: 'otro@admin.com',
        rol: RolUsuario.ADMIN,
        estadoCuenta: EstadoCuentaUsuario.ACTIVO,
      })

      expect(otroAdmin.puedeSerDegradado(adminActualId)).toBe(true)
    })

    it('retorna false si es el propio administrador (no puede auto-degradarse)', () => {
      const propioAdmin = new UsuarioAdmin({
        id: adminActualId,
        nombre: 'Yo Administrador',
        mail: 'yo@admin.com',
        rol: RolUsuario.ADMIN,
        estadoCuenta: EstadoCuentaUsuario.ACTIVO,
      })

      expect(propioAdmin.puedeSerDegradado(adminActualId)).toBe(false)
    })

    it('retorna false si el objetivo no es ADMIN', () => {
      const usuarioComun = new UsuarioAdmin({
        id: 'user-comun',
        nombre: 'Usuario Estándar',
        mail: 'user@comun.com',
        rol: RolUsuario.USER,
        estadoCuenta: EstadoCuentaUsuario.ACTIVO,
      })

      expect(usuarioComun.puedeSerDegradado(adminActualId)).toBe(false)
    })

    it('retorna false si no se proporciona el ID del administrador actual', () => {
      const otroAdmin = new UsuarioAdmin({
        id: 'admin-otro',
        nombre: 'Otro Administrador',
        mail: 'otro@admin.com',
        rol: RolUsuario.ADMIN,
        estadoCuenta: EstadoCuentaUsuario.ACTIVO,
      })

      expect(otroAdmin.puedeSerDegradado('')).toBe(false)
    })
  })
})
