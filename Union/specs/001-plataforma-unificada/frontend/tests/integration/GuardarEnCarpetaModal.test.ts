/**
 * Test de integración: guardar en carpeta mientras carga la lista (CB-03) — T109.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-48, RF-49, RF-52, CB-03)
 * - Union/specs/001-plataforma-unificada/tasks.md (T109, depende de T061, T082)
 *
 * Nota de ubicación: la ruta canónica de T109 en tasks.md es
 * `Usuario/my-project/backend_usuario/frontend/tests/components/GuardarEnCarpetaModal.test.tsx`,
 * fuera del alcance permitido (no se debe tocar `Usuario/`). Por instrucción expresa del usuario
 * (misma autorización general aplicada en T102, T107, T108), el test equivalente se implementa
 * dentro de `Union/.../frontend/tests/integration/`. No se leyó ni modificó ningún archivo de
 * `Usuario/` ni `Admin/` para esta tarea.
 *
 * Nota técnica: el componente `GuardarEnCarpetaModal.tsx` (T082) importa `react`, paquete no
 * disponible en este entorno de ejecución de tests (limitación de entorno preexistente,
 * confirmada en T102: cualquier import que atraviese un módulo `react` falla en runtime con
 * "Cannot find package 'react'", incluso para tests ya existentes del repositorio). Por ello,
 * en vez de renderizar el componente con una librería de testing de React (no instalada), este
 * test reproduce fielmente su contrato de estado —tal como está codificado en el propio
 * `GuardarEnCarpetaModal.tsx`— e invoca directamente las funciones reales y no acopladas a React
 * que gobiernan el gating de CB-03 (`puedeGuardarEnCarpeta` y `puedeCrearNuevaCarpeta` de
 * `carpetaService`, ya cubierto por T073/T061), simulando el ciclo de vida completo:
 * `cargandoCarpetas: true` (carga en curso, acción deshabilitada) → `carpetaService` resuelve →
 * `cargandoCarpetas: false` con carpetas disponibles (acción habilitada tras seleccionar una).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { puedeGuardarEnCarpeta, puedeCrearNuevaCarpeta } from '../../src/services/carpetaService'
import { Carpeta } from '../../src/domain/Carpeta'

/**
 * Réplica fiel (sin JSX) del cálculo de estado que realiza `GuardarEnCarpetaModal.tsx`:
 * - `botonGuardarHabilitado = puedeGuardarEnCarpeta(cargandoCarpetas, carpetaSeleccionadaId) && !guardando`
 * - Mientras `cargandoCarpetas === true`, el modal muestra el estado de carga ("Cargando tus
 *   carpetas...") y no renderiza el listado ni permite seleccionar carpeta alguna.
 */
function calcularEstadoModal(params: {
  cargandoCarpetas: boolean
  carpetaSeleccionadaId: string | null
  guardando: boolean
}): { muestraIndicadorCarga: boolean; botonGuardarHabilitado: boolean } {
  const { cargandoCarpetas, carpetaSeleccionadaId, guardando } = params
  return {
    muestraIndicadorCarga: cargandoCarpetas,
    botonGuardarHabilitado: puedeGuardarEnCarpeta(cargandoCarpetas, carpetaSeleccionadaId) && !guardando,
  }
}

describe('Integración: GuardarEnCarpetaModal — guardar en carpeta mientras carga la lista (CB-03) — T109', () => {
  const usuarioId = 'usr-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it(
    'la acción de guardar está deshabilitada y se muestra el estado de carga mientras ' +
      'carpetaService aún no resolvió la lista de carpetas del usuario',
    async () => {
      // 1. Estado inicial del modal: se abre antes de que la promesa de `carpetaService` resuelva.
      let resolverCarpetas: (carpetas: Carpeta[]) => void = () => {}
      const promesaCarpetas = new Promise<Carpeta[]>((resolve) => {
        resolverCarpetas = resolve
      })

      const cargarCarpetas = vi.fn().mockReturnValue(promesaCarpetas)

      // Simula el efecto de montaje del modal: dispara la carga y arranca con cargandoCarpetas=true.
      const cargaEnCurso = cargarCarpetas(usuarioId)
      let estadoModal = calcularEstadoModal({
        cargandoCarpetas: true,
        carpetaSeleccionadaId: null,
        guardando: false,
      })

      // Mientras la lista no resolvió: se muestra el indicador de carga y el botón está deshabilitado,
      // incluso si por alguna razón ya hubiera una carpeta "preseleccionada" (no debería poder ocurrir,
      // pero se verifica que el gating por `cargandoCarpetas` tiene prioridad, CB-03).
      expect(estadoModal.muestraIndicadorCarga).toBe(true)
      expect(estadoModal.botonGuardarHabilitado).toBe(false)

      estadoModal = calcularEstadoModal({
        cargandoCarpetas: true,
        carpetaSeleccionadaId: 'carp-1',
        guardando: false,
      })
      expect(estadoModal.botonGuardarHabilitado).toBe(false)

      // 2. `carpetaService` resuelve la lista de carpetas del usuario.
      const carpetasResueltas = [
        new Carpeta({ id: 'carp-1', propietarioId: usuarioId, nombre: 'Favoritos', cantidadPosts: 3 }),
        new Carpeta({ id: 'carp-2', propietarioId: usuarioId, nombre: 'Inspiración', cantidadPosts: 12 }),
      ]
      resolverCarpetas(carpetasResueltas)
      const carpetas = await cargaEnCurso

      expect(cargarCarpetas).toHaveBeenCalledTimes(1)
      expect(carpetas).toHaveLength(2)

      // 3. Tras la resolución: cargandoCarpetas=false; sin carpeta seleccionada aún deshabilitado.
      estadoModal = calcularEstadoModal({
        cargandoCarpetas: false,
        carpetaSeleccionadaId: null,
        guardando: false,
      })
      expect(estadoModal.muestraIndicadorCarga).toBe(false)
      expect(estadoModal.botonGuardarHabilitado).toBe(false)

      // 4. Al seleccionar una carpeta, la acción de guardar queda habilitada.
      estadoModal = calcularEstadoModal({
        cargandoCarpetas: false,
        carpetaSeleccionadaId: carpetas[0].id,
        guardando: false,
      })
      expect(estadoModal.botonGuardarHabilitado).toBe(true)

      // 5. Mientras se ejecuta el guardado (`guardando: true`), la acción vuelve a deshabilitarse
      // para evitar doble envío.
      estadoModal = calcularEstadoModal({
        cargandoCarpetas: false,
        carpetaSeleccionadaId: carpetas[0].id,
        guardando: true,
      })
      expect(estadoModal.botonGuardarHabilitado).toBe(false)

      // 6. El límite de creación de nuevas carpetas (RF-52) permanece consistente: con solo 2
      // carpetas, todavía se puede crear una nueva.
      expect(puedeCrearNuevaCarpeta(carpetas.length)).toBe(true)
    }
  )
})
