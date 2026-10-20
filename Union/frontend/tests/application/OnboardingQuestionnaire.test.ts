import { describe, expect, it } from 'vitest'
import { CuestionarioFactory } from '../../src/application/CuestionarioFactory'
import { CuestionarioService } from '../../src/application/CuestionarioService'
import { RespuestaCuestionario } from '../../src/domain/entities/RespuestaCuestionario'

const catalogo = {
  generos: [{ codigo: 'GENERO_ARTE', grupo: 'GENERO_ARTISTICO', nombre: 'Arte' }],
  estilos: [{ codigo: 'ARTE_CUBISMO', grupo: 'TIPO_ARTE', nombre: 'Cubismo' }],
  tiposMusica: [{ codigo: 'MUSICA_POP', grupo: 'TIPO_MUSICA', nombre: 'Pop' }],
}

describe('onboarding questionnaire mapping', () => {
  it('uses catalog codes as option IDs and maps answers to the API payload', () => {
    const preguntas = CuestionarioFactory.crearCuestionarioDesdeCatalogo(catalogo)
    const respuestas = RespuestaCuestionario.vacio()
      .seleccionar(preguntas[0].id, 'GENERO_ARTE')
      .seleccionar(preguntas[1].id, 'MUSICA_POP')
      .seleccionar(preguntas[2].id, 'ARTE_CUBISMO')

    expect(preguntas.map((pregunta) => pregunta.opciones[0].id)).toEqual([
      'GENERO_ARTE',
      'MUSICA_POP',
      'ARTE_CUBISMO',
    ])
    expect(CuestionarioService.transformarAOnboardingRequest(respuestas, preguntas)).toEqual({
      generoIds: ['GENERO_ARTE'],
      estiloIds: ['ARTE_CUBISMO'],
      tipoMusicaIds: ['MUSICA_POP'],
    })
  })
})
