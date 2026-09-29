/**
 * Test de integración: revocación de geolocalización en sesión (CB-10) — T111.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-45, CB-10)
 * - Union/specs/001-plataforma-unificada/tasks.md (T111, depende de T041, T055; complementa T072)
 *
 * Nota de ubicación: la ruta canónica de T111 en tasks.md es
 * `Usuario/my-project/backend_usuario/frontend/tests/services/useDescubrirFiltros.test.ts`,
 * fuera del alcance permitido (no se debe tocar `Usuario/`). El archivo homónimo ya existente en
 * `Union/.../frontend/tests/services/useDescubrirFiltros.test.ts` (T072) cubre CB-10 únicamente
 * a nivel de hook con `geolocationClient` completamente mockeado (vía `renderHook` de
 * `@testing-library/react`). Por instrucción expresa del usuario (misma autorización general
 * aplicada en T102, T107–T110), este test complementario de integración se agrega en
 * `Union/.../frontend/tests/integration/`, ejercitando el `geolocationClient` REAL (T041, sin
 * mockear) contra una Permissions API simulada, para verificar la integración de punta a punta
 * de la detección y notificación de revocación (no solo el hook mockeado). No se leyó ni
 * modificó ningún archivo de `Usuario/` ni `Admin/` para esta tarea.
 *
 * Nota técnica: `useDescubrirFiltros.ts` importa `react` (no disponible en este entorno de
 * ejecución de tests, limitación preexistente ya documentada en T102/T109/T110). Por ello este
 * test usa directamente `geolocationClient` (módulo sin dependencia de React) y replica
 * fielmente, sin hooks, la misma reacción que `useDescubrirFiltros.ts` aplica en su callback de
 * `onRevocacionPermiso`: deshabilitar el filtro de distancia (`distanciaKm: undefined`,
 * `geolocalizacionActiva: false`) y notificar al usuario con un mensaje explícito.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { geolocationClient } from '../../src/infrastructure/geolocationClient'
import { Filtro } from '../../src/domain/Filtro'

interface PermissionStatusSimulado {
  state: 'granted' | 'denied' | 'prompt'
  onchange: (() => void) | null
}

describe('Integración: geolocationClient + reacción de filtros ante revocación de permiso (CB-10) — T111', () => {
  let permissionStatusSimulado: PermissionStatusSimulado
  let navigatorOriginal: unknown

  beforeEach(() => {
    permissionStatusSimulado = { state: 'granted', onchange: null }

    navigatorOriginal = (globalThis as unknown as { navigator?: unknown }).navigator

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        geolocation: {
          getCurrentPosition: vi.fn(),
        },
        permissions: {
          query: vi.fn().mockResolvedValue(permissionStatusSimulado),
        },
      },
    })
  })

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: navigatorOriginal,
    })
    vi.restoreAllMocks()
  })

  it(
    'al revocar el permiso de geolocalización durante la sesión (granted → denied), ' +
      'el filtro de distancia se deshabilita automáticamente y se notifica al usuario',
    async () => {
      // 1. Réplica del estado de filtro que mantiene useDescubrirFiltros.ts
      let filtroActual = new Filtro({
        texto: undefined,
        estilo: undefined,
        tecnica: undefined,
        tipoContenido: undefined,
        distanciaKm: 10,
        geolocalizacionActiva: true,
      })
      let mensajeGeolocalizacion: string | null = null

      // 2. Inicializar el observador de permisos del geolocationClient REAL (T041)
      await geolocationClient.inicializarObservadorPermisos()

      // 3. Suscribirse a la revocación, replicando exactamente la reacción de useDescubrirFiltros.ts
      const desuscribir = geolocationClient.onRevocacionPermiso(() => {
        mensajeGeolocalizacion =
          'El permiso de ubicación fue revocado. El filtro de distancia se deshabilitó automáticamente.'
        filtroActual = new Filtro({
          texto: filtroActual.texto,
          estilo: filtroActual.estilo,
          tecnica: filtroActual.tecnica,
          tipoContenido: filtroActual.tipoContenido,
          distanciaKm: undefined,
          geolocalizacionActiva: false,
        })
      })

      // Estado previo a la revocación: geolocalización activa y filtro de distancia configurado.
      expect(filtroActual.geolocalizacionActiva).toBe(true)
      expect(filtroActual.distanciaKm).toBe(10)
      expect(mensajeGeolocalizacion).toBeNull()

      // 4. Simular revocación del permiso durante la sesión: el navegador dispara `onchange`
      // con el nuevo estado 'denied' (CB-10).
      permissionStatusSimulado.state = 'denied'
      permissionStatusSimulado.onchange?.()

      // 5. Verificar reacción automática: filtro de distancia deshabilitado y mensaje al usuario.
      expect(filtroActual.geolocalizacionActiva).toBe(false)
      expect(filtroActual.distanciaKm).toBeUndefined()
      expect(mensajeGeolocalizacion).toMatch(/permiso de ubicación fue revocado/i)
      expect(geolocationClient.estaActiva()).toBe(false)

      desuscribir()
    }
  )

  it(
    'una transición de estado que NO es revocación (granted → granted) no dispara ' +
      'la notificación ni deshabilita el filtro',
    async () => {
      await geolocationClient.inicializarObservadorPermisos()

      const callbackRevocacion = vi.fn()
      const desuscribir = geolocationClient.onRevocacionPermiso(callbackRevocacion)

      // Se dispara onchange pero el estado permanece 'granted' (sin cambio real a denied/prompt)
      permissionStatusSimulado.onchange?.()

      expect(callbackRevocacion).not.toHaveBeenCalled()

      desuscribir()
    }
  )
})
