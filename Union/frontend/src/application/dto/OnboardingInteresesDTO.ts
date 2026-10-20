export interface CategoriaOnboardingDTO {
  codigo: string
  grupo: string
  nombre: string
}

export interface CatalogoOnboardingDTO {
  generos: CategoriaOnboardingDTO[]
  estilos: CategoriaOnboardingDTO[]
  tiposMusica: CategoriaOnboardingDTO[]
}

export interface GuardarInteresesOnboardingDTO {
  generoIds: string[]
  estiloIds: string[]
  tipoMusicaIds: string[]
}

export interface InteresesOnboardingResponseDTO extends GuardarInteresesOnboardingDTO {
  onboardingCompletado: boolean
}
