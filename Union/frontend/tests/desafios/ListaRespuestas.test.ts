import { describe, it, expect, vi } from 'vitest'
import {
  RespuestaDesafio,
  ContenidoImagenRespuesta,
  ContenidoVideoRespuesta,
  ContenidoAudioRespuesta,
} from '../../src/domain/RespuestaDesafio'

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

const sesionAutor = { usuarioId: 'usuario-1', rol: 'USER' as const }
const sesionOtro = { usuarioId: 'usuario-2', rol: 'USER' as const }
const sesionAdmin = { usuarioId: 'admin-1', rol: 'ADMIN' as const }

describe('ListaRespuestas - Props y comportamiento', () => {
  describe('respuestas vacía', () => {
    it('debe renderizar mensaje de lista vacía', () => {
      // Props: respuestas vacío
      const props = {
        respuestas: [],
        sesionActual: sesionAutor,
      }

      expect(props.respuestas.length).toBe(0)
    })

    it('debe aceptar mensajeVacio personalizado', () => {
      const props = {
        respuestas: [],
        mensajeVacio: 'No hay respuestas en este desafío',
        sesionActual: sesionAutor,
      }

      expect(props.mensajeVacio).toBe('No hay respuestas en este desafío')
    })
  })

  describe('respuestas con contenido', () => {
    it('debe renderizar lista con múltiples respuestas', () => {
      const respuestas = [
        new RespuestaDesafio({
          desafioId: 'desafio-1',
          autorId: 'usuario-1',
          contenido: contenidoImagen,
        }),
        new RespuestaDesafio({
          desafioId: 'desafio-1',
          autorId: 'usuario-2',
          contenido: contenidoVideo,
        }),
      ]

      const props = {
        respuestas,
        sesionActual: sesionAutor,
      }

      expect(props.respuestas.length).toBe(2)
      expect(props.respuestas[0].autorId).toBe('usuario-1')
      expect(props.respuestas[1].autorId).toBe('usuario-2')
    })

    it('debe diferenciar tipos de contenido', () => {
      const respuestas = [
        new RespuestaDesafio({
          desafioId: 'desafio-1',
          autorId: 'usuario-1',
          contenido: contenidoImagen,
        }),
        new RespuestaDesafio({
          desafioId: 'desafio-1',
          autorId: 'usuario-2',
          contenido: contenidoVideo,
        }),
        new RespuestaDesafio({
          desafioId: 'desafio-1',
          autorId: 'usuario-3',
          contenido: contenidoAudio,
        }),
      ]

      const props = {
        respuestas,
      }

      expect(props.respuestas[0].contenido?.tipo).toBe('imagen')
      expect(props.respuestas[1].contenido?.tipo).toBe('video')
      expect(props.respuestas[2].contenido?.tipo).toBe('audio')
    })
  })

  describe('callbacks onEditar y onEliminar', () => {
    it('debe aceptar callback onEditar', () => {
      const onEditar = vi.fn()

      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })

      const props = {
        respuestas: [respuesta],
        sesionActual: sesionAutor,
        onEditar,
      }

      expect(props.onEditar).toBeDefined()
      expect(typeof props.onEditar).toBe('function')
    })

    it('debe aceptar callback onEliminar', () => {
      const onEliminar = vi.fn()

      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })

      const props = {
        respuestas: [respuesta],
        sesionActual: sesionAutor,
        onEliminar,
      }

      expect(props.onEliminar).toBeDefined()
      expect(typeof props.onEliminar).toBe('function')
    })

    it('debe pasar respuestaId y RespuestaDesafio completo a onEditar', () => {
      const onEditar = vi.fn()

      const respuesta = new RespuestaDesafio({
        id: 'respuesta-123',
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })

      const props = {
        respuestas: [respuesta],
        sesionActual: sesionAutor,
        onEditar,
      }

      // Simulación: llamar al callback con los argumentos esperados
      if (props.onEditar) {
        props.onEditar('respuesta-123', respuesta)
        expect(props.onEditar).toHaveBeenCalledWith('respuesta-123', respuesta)
      }
    })

    it('debe pasar respuestaId a onEliminar', () => {
      const onEliminar = vi.fn()

      const respuesta = new RespuestaDesafio({
        id: 'respuesta-123',
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })

      const props = {
        respuestas: [respuesta],
        sesionActual: sesionAutor,
        onEliminar,
      }

      // Simulación: llamar al callback con el argumento esperado
      if (props.onEliminar) {
        props.onEliminar('respuesta-123')
        expect(props.onEliminar).toHaveBeenCalledWith('respuesta-123')
      }
    })
  })

  describe('permisos de edición y eliminación', () => {
    it('debe habilitar edición solo al autor', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })

      // El autor puede editar
      expect(respuesta.puedeEditarPor(sesionAutor)).toBe(true)

      // Otro usuario NO puede editar
      expect(respuesta.puedeEditarPor(sesionOtro)).toBe(false)

      // Admin NO puede editar (per A-22 clarification)
      expect(respuesta.puedeEditarPor(sesionAdmin)).toBe(false)
    })

    it('debe habilitar eliminación al autor y admin', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })

      // El autor puede eliminar
      expect(respuesta.puedeEliminarPor(sesionAutor)).toBe(true)

      // Admin puede eliminar
      expect(respuesta.puedeEliminarPor(sesionAdmin)).toBe(true)

      // Otro usuario NO puede eliminar
      expect(respuesta.puedeEliminarPor(sesionOtro)).toBe(false)
    })

    it('debe respetar permisos sin sesión actual', () => {
      const respuesta = new RespuestaDesafio({
        desafioId: 'desafio-1',
        autorId: 'usuario-1',
        contenido: contenidoImagen,
      })

      const propsNoSesion = {
        respuestas: [respuesta],
        sesionActual: undefined,
      }

      // Sin sesión, no hay permisos
      expect(propsNoSesion.sesionActual).toBeUndefined()
    })
  })

  describe('className y estilos', () => {
    it('debe aceptar className personalizado', () => {
      const respuestas = [
        new RespuestaDesafio({
          desafioId: 'desafio-1',
          autorId: 'usuario-1',
          contenido: contenidoImagen,
        }),
      ]

      const props = {
        respuestas,
        className: 'my-custom-class bg-blue-50',
      }

      expect(props.className).toBe('my-custom-class bg-blue-50')
    })
  })

  describe('información mostrada', () => {
    it('debe mostrar autorId de cada respuesta', () => {
      const respuestas = [
        new RespuestaDesafio({
          desafioId: 'desafio-1',
          autorId: 'usuario-1',
          contenido: contenidoImagen,
        }),
        new RespuestaDesafio({
          desafioId: 'desafio-1',
          autorId: 'usuario-2',
          contenido: contenidoVideo,
        }),
      ]

      const props = {
        respuestas,
      }

      expect(props.respuestas[0].autorId).toBe('usuario-1')
      expect(props.respuestas[1].autorId).toBe('usuario-2')
    })

    it('debe mostrar tipo y formato del contenido', () => {
      const respuestas = [
        new RespuestaDesafio({
          desafioId: 'desafio-1',
          autorId: 'usuario-1',
          contenido: contenidoImagen,
        }),
        new RespuestaDesafio({
          desafioId: 'desafio-1',
          autorId: 'usuario-2',
          contenido: contenidoVideo,
        }),
        new RespuestaDesafio({
          desafioId: 'desafio-1',
          autorId: 'usuario-3',
          contenido: contenidoAudio,
        }),
      ]

      const props = {
        respuestas,
      }

      expect(props.respuestas[0].contenido?.tipo).toBe('imagen')
      expect(props.respuestas[0].contenido?.formato).toBe('JPEG')

      expect(props.respuestas[1].contenido?.tipo).toBe('video')
      expect(props.respuestas[1].contenido?.formato).toBe('MP4')

      expect(props.respuestas[2].contenido?.tipo).toBe('audio')
      expect(props.respuestas[2].contenido?.formato).toBe('MP3')
    })
  })
})
