import { describe, it, expect } from 'vitest'
import {
  RespuestaDesafio,
  ContenidoImagenRespuesta,
  ContenidoVideoRespuesta,
  ContenidoAudioRespuesta,
} from '../../src/domain/RespuestaDesafio'

const sesionAutor = { usuarioId: 'usuario-1', rol: 'USER' as const }
const sesionOtro = { usuarioId: 'usuario-2', rol: 'USER' as const }
const sesionAdmin = { usuarioId: 'admin-1', rol: 'ADMIN' as const }

const contenidoImagen: ContenidoImagenRespuesta = {
  id: 'contenido-1',
  url: 'https://example.com/image.jpg',
  formato: 'JPEG',
  tipo: 'imagen',
}

const contenidoVideo: ContenidoVideoRespuesta = {
  id: 'contenido-2',
  url: 'https://example.com/video.mp4',
  formato: 'MP4',
  tipo: 'video',
}

const contenidoAudio: ContenidoAudioRespuesta = {
  id: 'contenido-3',
  url: 'https://example.com/audio.mp3',
  formato: 'MP3',
  tipo: 'audio',
}

describe('RespuestaDesafio', () => {
  describe('validar - Content Type', () => {
    it('debe validar respuesta con contenido imagen válido', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })
      const errores = respuesta.validar(['imagen'])
      expect(errores).toEqual({})
    })

    it('debe validar respuesta con contenido video válido', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoVideo,
      })
      const errores = respuesta.validar(['video'])
      expect(errores).toEqual({})
    })

    it('debe validar respuesta con contenido audio válido', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoAudio,
      })
      const errores = respuesta.validar(['audio'])
      expect(errores).toEqual({})
    })
  })

  describe('validar - Format Validation', () => {
    it('debe rechazar imagen con formato inválido', () => {
      const contenidoInvalido: ContenidoImagenRespuesta = {
        ...contenidoImagen,
        formato: 'MP4' as any,
      }
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoInvalido,
      })
      const errores = respuesta.validar(['imagen'])
      expect(errores).toHaveProperty('contenido')
    })

    it('debe rechazar video con formato inválido', () => {
      const contenidoInvalido: ContenidoVideoRespuesta = {
        ...contenidoVideo,
        formato: 'MP3' as any,
      }
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoInvalido,
      })
      const errores = respuesta.validar(['video'])
      expect(errores).toHaveProperty('contenido')
    })

    it('debe rechazar audio con formato inválido', () => {
      const contenidoInvalido: ContenidoAudioRespuesta = {
        ...contenidoAudio,
        formato: 'JPEG' as any,
      }
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoInvalido,
      })
      const errores = respuesta.validar(['audio'])
      expect(errores).toHaveProperty('contenido')
    })
  })

  describe('validar - Content Type Compatibility', () => {
    it('debe rechazar imagen cuando tipo no es aceptado', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })
      const errores = respuesta.validar(['video', 'audio'])
      expect(errores).toHaveProperty('contenido')
    })

    it('debe rechazar video cuando tipo no es aceptado', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoVideo,
      })
      const errores = respuesta.validar(['imagen', 'audio'])
      expect(errores).toHaveProperty('contenido')
    })

    it('debe rechazar audio cuando tipo no es aceptado', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoAudio,
      })
      const errores = respuesta.validar(['imagen', 'video'])
      expect(errores).toHaveProperty('contenido')
    })
  })

  describe('validar - Missing Fields', () => {
    it('debe rechazar contenido sin id', () => {
      const contenidoSinId: ContenidoImagenRespuesta = {
        ...contenidoImagen,
        id: '',
      }
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoSinId,
      })
      const errores = respuesta.validar(['imagen'])
      expect(errores).toHaveProperty('contenido')
    })

    it('debe rechazar contenido sin url', () => {
      const contenidoSinUrl: ContenidoImagenRespuesta = {
        ...contenidoImagen,
        url: '',
      }
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoSinUrl,
      })
      const errores = respuesta.validar(['imagen'])
      expect(errores).toHaveProperty('contenido')
    })

    it('debe rechazar desafio sin id', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: '',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })
      const errores = respuesta.validar(['imagen'])
      expect(errores).toHaveProperty('desafioId')
    })

    it('debe rechazar autor sin id', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: '',
        contenido: contenidoImagen,
      })
      const errores = respuesta.validar(['imagen'])
      expect(errores).toHaveProperty('autorId')
    })
  })

  describe('validar - Sin tipos aceptados', () => {
    it('debe validar respuesta cuando no hay tipos restringidos (array vacío = todos)', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })
      const errores = respuesta.validar([])
      expect(errores).toEqual({})
    })

    it('debe validar respuesta cuando no hay tipos restringidos (undefined)', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })
      const errores = respuesta.validar()
      expect(errores).toEqual({})
    })
  })

  describe('puedeEditarPor', () => {
    it('debe permitir edición al autor', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })
      expect(respuesta.puedeEditarPor(sesionAutor)).toBe(true)
    })

    it('debe rechazar edición a usuario diferente', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })
      expect(respuesta.puedeEditarPor(sesionOtro)).toBe(false)
    })

    it('debe rechazar edición a administrador (per A-22 clarification)', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })
      expect(respuesta.puedeEditarPor(sesionAdmin)).toBe(false)
    })
  })

  describe('puedeEliminarPor', () => {
    it('debe permitir eliminación al autor', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })
      expect(respuesta.puedeEliminarPor(sesionAutor)).toBe(true)
    })

    it('debe permitir eliminación al administrador', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })
      expect(respuesta.puedeEliminarPor(sesionAdmin)).toBe(true)
    })

    it('debe rechazar eliminación a usuario diferente', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })
      expect(respuesta.puedeEliminarPor(sesionOtro)).toBe(false)
    })
  })

  describe('propiedades', () => {
    it('debe almacenar desafioId', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-123',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })
      expect(respuesta.desafioId).toBe('desafio-123')
    })

    it('debe almacenar autorId', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-456',
        contenido: contenidoImagen,
      })
      expect(respuesta.autorId).toBe('usuario-456')
    })

    it('debe almacenar contenido', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })
      expect(respuesta.contenido).toEqual(contenidoImagen)
    })

    it('debe generar id único', () => {
      const respuesta1 = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })
      const respuesta2 = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })
      expect(respuesta1.id).not.toBe(respuesta2.id)
    })
  })
})
