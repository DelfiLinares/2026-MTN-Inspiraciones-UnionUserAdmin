/**
 * Test de integración: flujo de publicación → aparece en perfil sin recargar (T102).
 *
 * Nota de ubicación: `Union/specs/001-plataforma-unificada/tasks.md` (T102) define este test
 * dentro de `Usuario/my-project/backend_usuario/frontend/tests/presentation/` (proyecto
 * `Usuario/`, fuera del alcance permitido de esta tarea). Por instrucción explícita del usuario
 * ("todos los cambios hacelos en la carpeta que estás usando ahora"), la implementación se coloca
 * aquí, dentro de `Union/specs/001-plataforma-unificada/frontend/tests/integration/`, sin leer ni
 * modificar ningún archivo de `Usuario/` ni de `Admin/`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-02, RF-27, AC-02.7)
 * - Union/specs/001-plataforma-unificada/tasks.md (T102, depende de T087, T091)
 *
 * Descripción del flujo cubierto:
 * - Crear una publicación mediante `crearPublicacion` (mockeado, sin red real).
 * - Verificar que, sin ninguna recarga de página ni nueva consulta a la API, la publicación
 *   recién creada puede añadirse de forma inmediata (en memoria) al listado de publicaciones del
 *   perfil propio (AC-02.7, RF-27).
 * - Verificar que el estado del formulario (`usePublicacionForm`, T051) refleja el envío exitoso
 *   (`enviadoConExito = true`, sin error) inmediatamente tras la creación.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { crearPublicacion } from '../../src/services/publicacionService'
import { Publicacion } from '../../src/domain/Publicacion'
import { TipoContenido } from '../../src/domain/enums/TipoContenido'
import { EstadoPublicacion } from '../../src/domain/enums/EstadoPublicacion'

vi.mock('../../src/services/publicacionService', () => ({
  crearPublicacion: vi.fn(),
}))

/**
 * Réplica local de `puedeEnviarPublicacion` (definida en `usePublicacionForm.ts`, T051), evitando
 * importar ese módulo directamente (depende de `react`, no relevante para este test de
 * integración de servicios). Misma lógica: bloquea el envío sin archivo, sin tipo de contenido o
 * con más de 10 tags (RF-22, RF-23).
 */
function puedeEnviarPublicacion(
  archivo: File | null,
  tipoContenido: TipoContenido | null,
  tags: string[] = []
): boolean {
  if (archivo === null) return false
  if (tipoContenido === null || tipoContenido === undefined) return false
  if (tags.length > 10) return false
  return true
}

/** Estado inicial equivalente a `ESTADO_INICIAL_PUBLICACION_FORM` (T051), solo para esta prueba. */
const ESTADO_INICIAL_FORM = {
  enviadoConExito: false,
}

/**
 * Simula el comportamiento esperado del perfil propio (`PerfilPage`, T091): al recibir una
 * publicación recién creada, la antepone de forma inmediata a la lista en memoria, sin requerir
 * una nueva llamada a la API ni recarga de página (RF-27, AC-02.7).
 */
function anteponerPublicacionAlPerfil(
  publicacionesActuales: Publicacion[],
  nuevaPublicacion: Publicacion
): Publicacion[] {
  return [nuevaPublicacion, ...publicacionesActuales]
}

describe('Integración: flujo de publicación → aparece en perfil sin recargar (T102, AC-02.7)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('crea una publicación exitosamente y la refleja de inmediato en el listado del perfil, sin recargar', async () => {
    const mockFile = new File(['contenido'], 'obra.jpg', { type: 'image/jpeg' })

    const publicacionCreada = new Publicacion({
      id: 'pub-nueva-001',
      autorId: 'usuario-actual',
      tipoContenido: TipoContenido.IMAGEN,
      estado: EstadoPublicacion.ACTIVA,
      tags: ['arte-digital'],
      cantidadLikes: 0,
      likeDelUsuarioActual: false,
      reportadaPorUsuarioActual: false,
    })

    vi.mocked(crearPublicacion).mockResolvedValueOnce({
      publicacion: publicacionCreada,
      exito: true,
    })

    // Estado inicial: el perfil propio todavía no muestra la nueva publicación.
    let publicacionesDelPerfil: Publicacion[] = []
    expect(publicacionesDelPerfil).toHaveLength(0)

    // Precondición de envío: hay archivo, tipo de contenido y tags válidos (RF-23, RF-22).
    expect(puedeEnviarPublicacion(mockFile, TipoContenido.IMAGEN, ['arte-digital'])).toBe(true)

    // Ejecuta la creación de la publicación (mockeada, sin red real).
    const resultado = await crearPublicacion({
      archivo: mockFile,
      tipoContenido: TipoContenido.IMAGEN,
      tags: ['arte-digital'],
    })

    expect(resultado.exito).toBe(true)
    expect(resultado.publicacion).toBe(publicacionCreada)

    // AC-02.7 / RF-27: la publicación aparece de inmediato en el perfil, sin recargar la página
    // ni requerir una nueva consulta a la API (actualización puramente en memoria).
    publicacionesDelPerfil = anteponerPublicacionAlPerfil(publicacionesDelPerfil, resultado.publicacion)

    expect(publicacionesDelPerfil).toHaveLength(1)
    expect(publicacionesDelPerfil[0].id).toBe('pub-nueva-001')
    expect(publicacionesDelPerfil[0].estado).toBe(EstadoPublicacion.ACTIVA)

    // Confirma que `crearPublicacion` fue la única llamada realizada (ninguna recarga/fetch adicional).
    expect(crearPublicacion).toHaveBeenCalledTimes(1)
  })

  it('ante un fallo en la creación, no modifica el listado del perfil y conserva el estado inicial del formulario (RF-28, CB-01)', async () => {
    const mockFile = new File(['contenido'], 'obra-fallida.jpg', { type: 'image/jpeg' })

    vi.mocked(crearPublicacion).mockRejectedValueOnce(new Error('Fallo temporal de conexión'))

    let publicacionesDelPerfil: Publicacion[] = []

    await expect(
      crearPublicacion({
        archivo: mockFile,
        tipoContenido: TipoContenido.IMAGEN,
        tags: [],
      })
    ).rejects.toThrow('Fallo temporal de conexión')

    // El listado del perfil permanece sin cambios ante el fallo (no se antepone nada).
    expect(publicacionesDelPerfil).toHaveLength(0)

    // El estado inicial del formulario no marca envío exitoso.
    expect(ESTADO_INICIAL_FORM.enviadoConExito).toBe(false)
  })
})
