import { describe, expect, it } from 'vitest'
import { Usuario } from '../../src/domain/Usuario'
import { RolUsuario } from '../../src/domain/enums/RolUsuario'
import { EstadoCuentaUsuario } from '../../src/domain/enums/EstadoCuentaUsuario'

/**
 * Tests unitarios de dominio para Usuario — módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T076)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Domain Entities: Usuario)
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-01, HU-02, HU-03, A1, A10)
 *
 * Reglas cubiertas por T076:
 * - Username: rango 1-10 caracteres, [a-zA-Z0-9_.], sin espacios
 * - Sobre mí: máximo 80 caracteres
 * - Descripción: máximo 200 caracteres
 * - Disponibilidad: ACTIVO/BANEADO/ELIMINADO
 */

function crearUsuario(
  overrides: Partial<{
    id: string
    username: string
    foto?: string
    sobreMi: string
    descripcion: string
    estado: EstadoCuentaUsuario
    rol: RolUsuario
    fechaCreacion: Date
    siguiendoPorUsuarioActual: boolean
    cantidadSeguidores: number
  }> = {},
): Usuario {
  return new Usuario(
    overrides.id ?? 'user-1',
    overrides.username ?? 'user123',
    overrides.foto ?? 'https://example.com/avatar.jpg',
    overrides.sobreMi ?? 'Artista visual',
    overrides.descripcion ?? 'Comparto mis obras de arte',
    overrides.estado ?? EstadoCuentaUsuario.ACTIVO,
    overrides.rol ?? RolUsuario.USER,
    overrides.fechaCreacion ?? new Date(),
    overrides.siguiendoPorUsuarioActual ?? false,
    overrides.cantidadSeguidores ?? 10,
  )
}

describe('Usuario — Validaciones de dominio (T076)', () => {
  describe('esNombreUsuarioValido() — Regla 11 (username)', () => {
    it('retorna true para username válido con letras y números', () => {
      const usuario = crearUsuario({ username: 'user123' })
      expect(usuario.esNombreUsuarioValido()).toBe(true)
    })

    it('retorna true para username válido con guiones bajos', () => {
      const usuario = crearUsuario({ username: 'my_user' })
      expect(usuario.esNombreUsuarioValido()).toBe(true)
    })

    it('retorna true para username válido con puntos', () => {
      const usuario = crearUsuario({ username: 'user.name' })
      expect(usuario.esNombreUsuarioValido()).toBe(true)
    })

    it('retorna true para username válido con mayúsculas', () => {
      const usuario = crearUsuario({ username: 'UserName' })
      expect(usuario.esNombreUsuarioValido()).toBe(true)
    })

    it('retorna true para username válido en el límite de 10 caracteres', () => {
      const usuario = crearUsuario({ username: '1234567890' })
      expect(usuario.esNombreUsuarioValido()).toBe(true)
    })

    it('retorna false para username vacío', () => {
      const usuario = crearUsuario({ username: '' })
      expect(usuario.esNombreUsuarioValido()).toBe(false)
    })

    it('retorna false para username que supera 10 caracteres', () => {
      const usuario = crearUsuario({ username: '12345678901' })
      expect(usuario.esNombreUsuarioValido()).toBe(false)
    })

    it('retorna false para username con espacios', () => {
      const usuario = crearUsuario({ username: 'user name' })
      expect(usuario.esNombreUsuarioValido()).toBe(false)
    })

    it('retorna false para username con caracteres especiales no permitidos', () => {
      const usuario = crearUsuario({ username: 'user-name' })
      expect(usuario.esNombreUsuarioValido()).toBe(false)
    })

    it('retorna false para username con ñ', () => {
      const usuario = crearUsuario({ username: 'usüario' })
      expect(usuario.esNombreUsuarioValido()).toBe(false)
    })

    it('retorna false para username con @', () => {
      const usuario = crearUsuario({ username: 'user@name' })
      expect(usuario.esNombreUsuarioValido()).toBe(false)
    })

    it('retorna false para username con #', () => {
      const usuario = crearUsuario({ username: 'user#name' })
      expect(usuario.esNombreUsuarioValido()).toBe(false)
    })
  })

  describe('esSobreMiValido() — Regla 12 (sobre mí)', () => {
    it('retorna true para sobre mí vacío', () => {
      const usuario = crearUsuario({ sobreMi: '' })
      expect(usuario.esSobreMiValido()).toBe(true)
    })

    it('retorna true para sobre mí con espacios', () => {
      const usuario = crearUsuario({ sobreMi: 'Soy un artista visual' })
      expect(usuario.esSobreMiValido()).toBe(true)
    })

    it('retorna true para sobre mí en el límite de 80 caracteres', () => {
      const usuario = crearUsuario({
        sobreMi: 'a'.repeat(80),
      })
      expect(usuario.esSobreMiValido()).toBe(true)
    })

    it('retorna false para sobre mí que supera 80 caracteres', () => {
      const usuario = crearUsuario({
        sobreMi: 'a'.repeat(81),
      })
      expect(usuario.esSobreMiValido()).toBe(false)
    })

    it('retorna true para sobre mí con caracteres especiales permitidos', () => {
      const usuario = crearUsuario({
        sobreMi: 'Artista: ¡Crear es vivir! (2026)',
      })
      expect(usuario.esSobreMiValido()).toBe(true)
    })
  })

  describe('esDescripcionValida() — Regla 13 (descripción)', () => {
    it('retorna true para descripción vacía', () => {
      const usuario = crearUsuario({ descripcion: '' })
      expect(usuario.esDescripcionValida()).toBe(true)
    })

    it('retorna true para descripción con espacios', () => {
      const usuario = crearUsuario({
        descripcion: 'Comparto mis obras de arte digital y analógico',
      })
      expect(usuario.esDescripcionValida()).toBe(true)
    })

    it('retorna true para descripción en el límite de 200 caracteres', () => {
      const usuario = crearUsuario({
        descripcion: 'a'.repeat(200),
      })
      expect(usuario.esDescripcionValida()).toBe(true)
    })

    it('retorna false para descripción que supera 200 caracteres', () => {
      const usuario = crearUsuario({
        descripcion: 'a'.repeat(201),
      })
      expect(usuario.esDescripcionValida()).toBe(false)
    })

    it('retorna true para descripción con caracteres especiales permitidos', () => {
      const usuario = crearUsuario({
        descripcion: 'Mi pasión: crear. Web: https://example.com (Sigueme)',
      })
      expect(usuario.esDescripcionValida()).toBe(true)
    })
  })

  describe('estaDisponible() — Regla A10 (disponibilidad por estado)', () => {
    it('retorna true cuando estado es ACTIVO', () => {
      const usuario = crearUsuario({
        estado: EstadoCuentaUsuario.ACTIVO,
      })
      expect(usuario.estaDisponible()).toBe(true)
    })

    it('retorna false cuando estado es BANEADO', () => {
      const usuario = crearUsuario({
        estado: EstadoCuentaUsuario.BANEADO,
      })
      expect(usuario.estaDisponible()).toBe(false)
    })

    it('retorna false cuando estado es ELIMINADO', () => {
      const usuario = crearUsuario({
        estado: EstadoCuentaUsuario.ELIMINADO,
      })
      expect(usuario.estaDisponible()).toBe(false)
    })
  })

  describe('esPerfilValido() — Validación conjunta', () => {
    it('retorna true cuando todos los campos son válidos', () => {
      const usuario = crearUsuario({
        username: 'user123',
        sobreMi: 'Artista visual',
        descripcion: 'Comparto mis obras de arte',
      })
      expect(usuario.esPerfilValido()).toBe(true)
    })

    it('retorna false cuando username es inválido', () => {
      const usuario = crearUsuario({
        username: '',
        sobreMi: 'Artista visual',
        descripcion: 'Comparto mis obras',
      })
      expect(usuario.esPerfilValido()).toBe(false)
    })

    it('retorna false cuando sobre mí supera 80 caracteres', () => {
      const usuario = crearUsuario({
        username: 'user123',
        sobreMi: 'a'.repeat(81),
        descripcion: 'Comparto mis obras',
      })
      expect(usuario.esPerfilValido()).toBe(false)
    })

    it('retorna false cuando descripción supera 200 caracteres', () => {
      const usuario = crearUsuario({
        username: 'user123',
        sobreMi: 'Artista visual',
        descripcion: 'a'.repeat(201),
      })
      expect(usuario.esPerfilValido()).toBe(false)
    })

    it('retorna false cuando múltiples campos son inválidos', () => {
      const usuario = crearUsuario({
        username: 'username_invalido_muy_largo',
        sobreMi: 'a'.repeat(81),
        descripcion: 'a'.repeat(201),
      })
      expect(usuario.esPerfilValido()).toBe(false)
    })
  })

  describe('esUsuarioActual() — Helper para identificar usuario actual', () => {
    it('retorna true si el ID coincide con el usuario actual', () => {
      const usuario = crearUsuario({ id: 'user-1' })
      expect(usuario.esUsuarioActual('user-1')).toBe(true)
    })

    it('retorna false si el ID no coincide', () => {
      const usuario = crearUsuario({ id: 'user-1' })
      expect(usuario.esUsuarioActual('user-2')).toBe(false)
    })

    it('retorna false si usuarioActualId es vacío', () => {
      const usuario = crearUsuario({ id: 'user-1' })
      expect(usuario.esUsuarioActual('')).toBe(false)
    })

    it('retorna false si usuarioActualId es undefined', () => {
      const usuario = crearUsuario({ id: 'user-1' })
      expect(usuario.esUsuarioActual(undefined as any)).toBe(false)
    })
  })

  describe('debeeMostrarBotonSeguir() — Helper para visibilidad de botón Seguir', () => {
    it('retorna false si es el perfil del usuario actual', () => {
      const usuario = crearUsuario({ id: 'user-1' })
      expect(usuario.debeeMostrarBotonSeguir('user-1')).toBe(false)
    })

    it('retorna true si es el perfil de otro usuario', () => {
      const usuario = crearUsuario({ id: 'user-1' })
      expect(usuario.debeeMostrarBotonSeguir('user-2')).toBe(true)
    })

    it('retorna true si usuarioActualId es vacío', () => {
      const usuario = crearUsuario({ id: 'user-1' })
      expect(usuario.debeeMostrarBotonSeguir('')).toBe(true)
    })
  })
})
