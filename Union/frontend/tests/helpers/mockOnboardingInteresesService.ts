import { vi } from 'vitest'
import { CuestionarioFactory } from '../../src/application/CuestionarioFactory'
import type { InteresesOnboardingResponseDTO } from '../../src/application/dto/OnboardingInteresesDTO'

const [preguntaIntereses, preguntaGeneros, preguntaEstilos] =
  CuestionarioFactory.crearCuestionarioDefault()

export const catalogoOnboardingTest = {
  generos: preguntaIntereses.opciones.map((opcion) => ({
    codigo: opcion.id,
    grupo: 'GENERO_ARTISTICO',
    nombre: opcion.descripcion,
  })),
  estilos: preguntaEstilos.opciones.map((opcion) => ({
    codigo: opcion.id,
    grupo: 'TIPO_ARTE',
    nombre: opcion.descripcion,
  })),
  tiposMusica: preguntaGeneros.opciones.map((opcion) => ({
    codigo: opcion.id,
    grupo: 'TIPO_MUSICA',
    nombre: opcion.descripcion,
  })),
}

const catalogoResueltoInmediatamente = {
  then(onFulfilled: (catalogo: typeof catalogoOnboardingTest) => void) {
    onFulfilled(catalogoOnboardingTest)
    return this
  },
  catch() {
    return this
  },
  finally(onFinally: () => void) {
    onFinally()
    return this
  },
}

const interesesResueltosInmediatamente = {
  then(onFulfilled: (intereses: InteresesOnboardingResponseDTO) => void) {
    onFulfilled({
      generoIds: [],
      estiloIds: [],
      tipoMusicaIds: [],
      onboardingCompletado: false,
    })
    return this
  },
  catch() {
    return this
  },
  finally(onFinally: () => void) {
    onFinally()
    return this
  },
}

export const onboardingServiceMock = {
  obtenerCatalogoOnboarding: vi.fn(
    () => catalogoResueltoInmediatamente as unknown as Promise<typeof catalogoOnboardingTest>,
  ),
  obtenerMisInteresesOnboarding: vi.fn(
    () => interesesResueltosInmediatamente as unknown as Promise<InteresesOnboardingResponseDTO>,
  ),
  guardarInteresesOnboarding: vi.fn().mockImplementation(async (intereses) => ({
    ...intereses,
    onboardingCompletado: true,
  })),
}
