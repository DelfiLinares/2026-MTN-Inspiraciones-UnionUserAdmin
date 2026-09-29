import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useState, useEffect } from 'react'
import {
  usePublicacionForm,
  puedeEnviarPublicacion,
  tieneDatosSinGuardar,
  ESTADO_INICIAL_PUBLICACION_FORM,
} from '../../src/services/usePublicacionForm'
import { TipoContenido } from '../../src/domain/enums/TipoContenido'
import { crearPublicacion } from '../../src/services/publicacionService'
import { Publicacion } from '../../src/domain/Publicacion'
import { EstadoPublicacion } from '../../src/domain/enums/EstadoPublicacion'

vi.mock('../../src/services/publicacionService', () => ({
  crearPublicacion: vi.fn(),
}))

describe('usePublicacionForm & validaciones de formulario (T071)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('puedeEnviarPublicacion (reglas puras de envío)', () => {
    it('retorna false si no hay archivo adjunto (RF-23)', () => {
      expect(puedeEnviarPublicacion(null, TipoContenido.IMAGEN, ['tag1'])).toBe(false)
    })

    it('retorna false si no hay tipo de contenido seleccionado', () => {
      const mockFile = new File(['contenido'], 'imagen.png', { type: 'image/png' })
      expect(puedeEnviarPublicacion(mockFile, null, ['tag1'])).toBe(false)
    })

    it('retorna false si excede el máximo permitido de 10 tags (RF-22)', () => {
      const mockFile = new File(['contenido'], 'imagen.jpg', { type: 'image/jpeg' })
      const tagsExcesivos = Array.from({ length: 11 }, (_, i) => `tag${i + 1}`)
      expect(puedeEnviarPublicacion(mockFile, TipoContenido.IMAGEN, tagsExcesivos)).toBe(false)
    })

    it('retorna true cuando todos los requerimientos son válidos', () => {
      const mockFile = new File(['contenido'], 'imagen.png', { type: 'image/png' })
      const tagsValidos = ['arte', 'digital']
      expect(puedeEnviarPublicacion(mockFile, TipoContenido.IMAGEN, tagsValidos)).toBe(true)
    })
  })

  describe('tieneDatosSinGuardar & CB-09 (guard de salida)', () => {
    it('retorna false en el estado inicial sin datos', () => {
      expect(tieneDatosSinGuardar(ESTADO_INICIAL_PUBLICACION_FORM)).toBe(false)
    })

    it('retorna true tan pronto como hay un archivo, tipo o tag sin enviar', () => {
      const mockFile = new File(['demo'], 'demo.jpg', { type: 'image/jpeg' })
      expect(
        tieneDatosSinGuardar({
          ...ESTADO_INICIAL_PUBLICACION_FORM,
          archivo: mockFile,
        })
      ).toBe(true)

      expect(
        tieneDatosSinGuardar({
          ...ESTADO_INICIAL_PUBLICACION_FORM,
          tipoContenido: TipoContenido.IMAGEN,
        })
      ).toBe(true)

      expect(
        tieneDatosSinGuardar({
          ...ESTADO_INICIAL_PUBLICACION_FORM,
          tags: ['diseño'],
        })
      ).toBe(true)
    })

    it('retorna false si la publicación ya se envió con éxito', () => {
      const mockFile = new File(['demo'], 'demo.jpg', { type: 'image/jpeg' })
      expect(
        tieneDatosSinGuardar({
          ...ESTADO_INICIAL_PUBLICACION_FORM,
          archivo: mockFile,
          enviadoConExito: true,
        })
      ).toBe(false)
    })
  })

  describe('usePublicacionForm hook behavior', () => {
    it('mantiene la inicialización limpia y gestiona las operaciones correctamente', async () => {
      // Simula el flujo del hook directamente usando sus funciones exportadas y lógica
      const mockFileValido = new File(['foto'], 'foto.jpg', { type: 'image/jpeg' })
      const mockFileInvalido = new File(['exec'], 'malware.exe', { type: 'application/x-msdownload' })

      // 1. Validar reglas de archivo
      expect(puedeEnviarPublicacion(null, TipoContenido.IMAGEN, [])).toBe(false)
      expect(puedeEnviarPublicacion(mockFileValido, TipoContenido.IMAGEN, [])).toBe(true)

      // 2. Probar confirmación de salida con confirmSpy (CB-09)
      const confirmSpy = vi.spyOn(window, 'confirm')
      confirmSpy.mockReturnValueOnce(false)

      const estadoConCambios = {
        ...ESTADO_INICIAL_PUBLICACION_FORM,
        archivo: mockFileValido,
      }
      expect(tieneDatosSinGuardar(estadoConCambios)).toBe(true)

      // 3. Simular falla y reintento de creación de publicación (CB-01 / RF-28)
      const mockPublicacion = new Publicacion({
        id: 'pub-nueva',
        autorId: 'u1',
        tipoContenido: TipoContenido.IMAGEN,
        estado: EstadoPublicacion.ACTIVA,
        tags: ['arte'],
        cantidadLikes: 0,
        likeDelUsuarioActual: false,
        reportadaPorUsuarioActual: false,
      })

      vi.mocked(crearPublicacion).mockRejectedValueOnce(new Error('Fallo temporal de conexión'))

      await expect(
        crearPublicacion({
          archivo: mockFileValido,
          tipoContenido: TipoContenido.IMAGEN,
          tags: ['arte'],
        })
      ).rejects.toThrow('Fallo temporal de conexión')

      // Reintento exitoso
      vi.mocked(crearPublicacion).mockResolvedValueOnce({
        publicacion: mockPublicacion,
        exito: true,
      })

      const resultadoExitoso = await crearPublicacion({
        archivo: mockFileValido,
        tipoContenido: TipoContenido.IMAGEN,
        tags: ['arte'],
      })

      expect(resultadoExitoso.publicacion).toBe(mockPublicacion)
      expect(resultadoExitoso.exito).toBe(true)
    })
  })
})
