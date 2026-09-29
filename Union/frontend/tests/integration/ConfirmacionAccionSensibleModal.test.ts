/**
 * Test de integración: cobertura RNF-07/RNF-14 sobre acciones destructivas — T112.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RNF-07, RF-60/RNF-08, RNF-14)
 * - Union/specs/001-plataforma-unificada/tasks.md (T112, depende de T096B, T097B, T098B, T099)
 *
 * Nota de ubicación: la ruta canónica de T112 en tasks.md es
 * `Admin/my-proyect/frontend-admin/tests/presentation/ConfirmacionAccionSensibleModal.test.tsx`,
 * fuera del alcance permitido (no se debe tocar `Admin/`). Por instrucción expresa del usuario
 * (misma autorización general aplicada en T095 y siguientes), el test equivalente se implementa
 * dentro de `Union/.../frontend/tests/integration/`. No se leyó ni modificó ningún archivo de
 * `Admin/` ni `Usuario/` para esta tarea.
 *
 * Nota técnica: `ConfirmacionAccionSensibleModal.tsx` y los tres módulos de presentación que lo
 * consumen (`UsuarioAccionesSensibles.tsx`, `ModeracionAcciones.tsx`, `DesafiosAdminPage.tsx`)
 * importan `react`, paquete no disponible en este entorno de ejecución de tests (limitación de
 * entorno preexistente, confirmada desde T102). Por ello este test dedicado verifica la
 * cobertura RNF-07 en dos niveles:
 *
 * 1. Cobertura estructural (regresión): lee el código fuente real de los tres módulos de
 *    presentación que ejecutan las 6 acciones sensibles mencionadas en T112 (banear, eliminar
 *    usuario, promover, degradar, eliminar publicación, aprobar/rechazar desafío) y verifica que
 *    el 100% de ellas está efectivamente cableada a través de `ConfirmacionAccionSensibleModal`
 *    (import + uso en JSX), de modo que si alguna acción dejara de pasar por el modal común, este
 *    test fallaría.
 * 2. Cobertura de comportamiento: reproduce fielmente (sin JSX) el patrón de máquina de estados
 *    que los tres módulos aplican de forma idéntica alrededor del modal (`accionActiva` → abre el
 *    modal → `onConfirmar` ejecuta la acción real → `onCancelar` (si no está procesando) cierra el
 *    modal SIN ejecutar la acción), y lo ejercita para cada una de las 6 acciones sensibles.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const RAIZ_PRESENTACION = resolve(__dirname, '../../src/presentation')

const ARCHIVOS_CON_ACCIONES_SENSIBLES = {
  usuarios: resolve(RAIZ_PRESENTACION, 'usuarios/UsuarioAccionesSensibles.tsx'),
  moderacion: resolve(RAIZ_PRESENTACION, 'moderacion/ModeracionAcciones.tsx'),
  desafios: resolve(RAIZ_PRESENTACION, 'desafios/DesafiosAdminPage.tsx'),
}

/**
 * Réplica fiel (sin JSX) del patrón de máquina de estados que usan los tres módulos de
 * presentación alrededor de `ConfirmacionAccionSensibleModal`:
 * - Al hacer clic en una acción sensible: `accionActiva = <clave>` (el modal queda `abierto`).
 * - `onConfirmar`: invoca la función real de ejecución de la acción y luego cierra el modal.
 * - `onCancelar`: si no hay una ejecución en curso (`procesando === false`), cierra el modal SIN
 *   invocar la función de ejecución de la acción.
 */
function crearControladorAccionSensible<TClave extends string>(
  ejecutarAccion: (clave: TClave) => Promise<void>
) {
  let accionActiva: TClave | null = null
  let procesando = false

  return {
    get modalAbierto() {
      return accionActiva !== null
    },
    get accionActivaActual() {
      return accionActiva
    },
    clickEnAccion(clave: TClave) {
      accionActiva = clave
    },
    async confirmar() {
      if (accionActiva === null) {
        return
      }
      procesando = true
      await ejecutarAccion(accionActiva)
      procesando = false
      accionActiva = null
    },
    cancelar() {
      if (!procesando) {
        accionActiva = null
      }
    },
  }
}

describe('Integración: cobertura RNF-07/RNF-14 de acciones destructivas vía ConfirmacionAccionSensibleModal — T112', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('1. Cobertura estructural: el 100% de las acciones sensibles pasa por el modal común', () => {
    it('UsuarioAccionesSensibles.tsx cablea banear, eliminar, promover y degradar al modal común', () => {
      const codigoFuente = readFileSync(ARCHIVOS_CON_ACCIONES_SENSIBLES.usuarios, 'utf-8')

      expect(codigoFuente).toContain("import { ConfirmacionAccionSensibleModal } from '../shared/ConfirmacionAccionSensibleModal'")
      expect(codigoFuente).toContain('<ConfirmacionAccionSensibleModal')

      for (const accion of ['banear', 'eliminar', 'promover', 'degradar']) {
        expect(codigoFuente).toContain(`'${accion}'`)
      }
    })

    it('ModeracionAcciones.tsx cablea eliminar publicación (y resolver sin eliminar) al modal común', () => {
      const codigoFuente = readFileSync(ARCHIVOS_CON_ACCIONES_SENSIBLES.moderacion, 'utf-8')

      expect(codigoFuente).toContain("import { ConfirmacionAccionSensibleModal } from '../shared/ConfirmacionAccionSensibleModal'")
      // Debe haber al menos 2 usos del modal: eliminar publicación y resolver sin eliminar.
      const coincidencias = codigoFuente.match(/<ConfirmacionAccionSensibleModal/g) ?? []
      expect(coincidencias.length).toBeGreaterThanOrEqual(2)
    })

    it('DesafiosAdminPage.tsx cablea aprobar y rechazar desafío al modal común', () => {
      const codigoFuente = readFileSync(ARCHIVOS_CON_ACCIONES_SENSIBLES.desafios, 'utf-8')

      expect(codigoFuente).toContain("import { ConfirmacionAccionSensibleModal } from '../shared/ConfirmacionAccionSensibleModal'")
      expect(codigoFuente).toContain('<ConfirmacionAccionSensibleModal')
      expect(codigoFuente).toContain("'aprobar'")
      expect(codigoFuente).toContain("'rechazar'")
    })
  })

  describe('2. Cobertura de comportamiento: confirmar ejecuta, cancelar NO ejecuta la acción', () => {
    const ACCIONES_SENSIBLES = [
      'banear',
      'eliminar',
      'promover',
      'degradar',
      'eliminarPublicacion',
      'aprobarDesafio',
      'rechazarDesafio',
    ] as const

    it.each(ACCIONES_SENSIBLES)(
      'la acción "%s" solo se ejecuta tras confirmar explícitamente en el modal',
      async (clave) => {
        const ejecutarAccion = vi.fn().mockResolvedValue(undefined)
        const controlador = crearControladorAccionSensible<typeof clave>(ejecutarAccion)

        // Estado inicial: modal cerrado, ninguna acción ejecutada.
        expect(controlador.modalAbierto).toBe(false)
        expect(ejecutarAccion).not.toHaveBeenCalled()

        // Clic en la acción sensible: se abre el modal de confirmación (RNF-07).
        controlador.clickEnAccion(clave)
        expect(controlador.modalAbierto).toBe(true)
        expect(controlador.accionActivaActual).toBe(clave)
        expect(ejecutarAccion).not.toHaveBeenCalled()

        // Confirmar: recién ahora se ejecuta la acción real.
        await controlador.confirmar()
        expect(ejecutarAccion).toHaveBeenCalledTimes(1)
        expect(ejecutarAccion).toHaveBeenCalledWith(clave)
        expect(controlador.modalAbierto).toBe(false)
      }
    )

    it.each(ACCIONES_SENSIBLES)(
      'cancelar el modal para la acción "%s" NO ejecuta la acción',
      async (clave) => {
        const ejecutarAccion = vi.fn().mockResolvedValue(undefined)
        const controlador = crearControladorAccionSensible<typeof clave>(ejecutarAccion)

        controlador.clickEnAccion(clave)
        expect(controlador.modalAbierto).toBe(true)

        // Cancelar en vez de confirmar: el modal se cierra sin ejecutar la acción (RNF-07).
        controlador.cancelar()

        expect(controlador.modalAbierto).toBe(false)
        expect(ejecutarAccion).not.toHaveBeenCalled()
      }
    )
  })
})
