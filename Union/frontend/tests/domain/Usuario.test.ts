import { describe, expect, it } from 'vitest'
import { Usuario } from '../../src/domain/Usuario'
import { RolUsuario } from '../../src/domain/enums/RolUsuario'

/**
 * Tests unitarios de dominio para Usuario (vista frontend de usuario).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/tasks.md (T027)
 * - Union/specs/001-plataforma-unificada/data-model.md (Entidad Usuario)
 * - Union/specs/001-plataforma-unificada/spec.md (RF-37, RF-39)
 *
 * Casos requeridos por T027:
 * - Botón "Seguir" ausente en perfil propio (puedeMostrarBotonSeguir retorna false)
 * - toggleSeguir() actualiza contador de forma optimista en ambos sentidos
 */

function crearUsuario(
  overrides: Partial<ConstructorParameters<typeof Usuario>[0]> = {},
): Usuario {
  return new Usuario({
    id: 'user-1',
    nombre: 'Valeria',
    apellido: 'Gómez',
    bio: 'Artista visual',
    fotoUrl: 'https://example.com/avatar.jpg',
    rol: RolUsuario.USER,
    siguiendoAlUsuarioActual: false,
    cantidadSeguidores: 10,
    ...overrides,
  })
}

describe('Usuario — tests de dominio (T027)', () => {
  describe('puedeMostrarBotonSeguir (RF-37)', () => {
    it('retorna false si es el perfil propio del usuario actual', () => {
      const usuario = crearUsuario({ id: 'user-1' })

      expect(usuario.puedeMostrarBotonSeguir('user-1')).toBe(false)
    })

    it('retorna true si es el perfil de otro usuario', () => {
      const usuario = crearUsuario({ id: 'user-1' })

      expect(usuario.puedeMostrarBotonSeguir('user-2')).toBe(true)
    })

    it('retorna true si usuarioActualId no está definido o vacío', () => {
      const usuario = crearUsuario({ id: 'user-1' })

      expect(usuario.puedeMostrarBotonSeguir('')).toBe(true)
    })
  })

  describe('toggleSeguir (RF-39)', () => {
    it('cuando no se sigue, cambia siguiendoAlUsuarioActual a true e incrementa seguidores', () => {
      const usuario = crearUsuario({
        siguiendoAlUsuarioActual: false,
        cantidadSeguidores: 5,
      })

      const resultado = usuario.toggleSeguir()

      expect(resultado.siguiendoAlUsuarioActual).toBe(true)
      expect(resultado.cantidadSeguidores).toBe(6)
    })

    it('cuando ya se sigue, cambia siguiendoAlUsuarioActual a false y decrementa seguidores', () => {
      const usuario = crearUsuario({
        siguiendoAlUsuarioActual: true,
        cantidadSeguidores: 6,
      })

      const resultado = usuario.toggleSeguir()

      expect(resultado.siguiendoAlUsuarioActual).toBe(false)
      expect(resultado.cantidadSeguidores).toBe(5)
    })

    it('no muta la instancia original al invocar toggleSeguir', () => {
      const usuario = crearUsuario({
        siguiendoAlUsuarioActual: false,
        cantidadSeguidores: 5,
      })

      usuario.toggleSeguir()

      expect(usuario.siguiendoAlUsuarioActual).toBe(false)
      expect(usuario.cantidadSeguidores).toBe(5)
    })
  })
})
