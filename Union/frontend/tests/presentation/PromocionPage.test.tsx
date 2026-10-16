/**
 * Test de componente: intento de promover a un usuario ya `ADMIN` se rechaza como no-op sin
 * llamar al servicio.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T068, depende de T067)
 * - Union/specs/002-frontend-admin/spec.md AC-03.4, CB-02
 *
 * Cobertura:
 * - AC-03.4/CB-02: intentar promover a un usuario que ya tiene rol `ADMIN` se rechaza como
 *   operación no-op; el botón "Promover a administrador" se muestra deshabilitado para esos
 *   usuarios, de forma que no es posible invocar el `HttpClient` (`post`) a través de la UI.
 * - Caso complementario: usuarios con rol `USER` muestran el botón habilitado.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PromocionPage } from '../../src/presentation/promocion/PromocionPage'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'

function crearHttpClientMockConUsuarios(items: unknown[]): HttpClient {
  return {
    get: vi.fn().mockResolvedValue({ items, total: items.length }),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}

describe('PromocionPage — rechazo no-op de promover a un usuario ya ADMIN (T068)', () => {
  it('muestra "Promover a administrador" deshabilitado para un usuario ya ADMIN, sin invocar HttpClient.post', async () => {
    const httpClient = crearHttpClientMockConUsuarios([
      {
        id: 'admin-ya-existente',
        nombre: 'Laura Admin',
        mail: 'laura@admin.com',
        rol: 'ADMIN',
        estadoCuenta: 'ACTIVO',
      },
    ])

    render(<PromocionPage httpClient={httpClient} />)

    await waitFor(() => {
      expect(screen.getByText('Laura Admin')).toBeInTheDocument()
    })

    const boton = screen.getByRole('button', { name: 'Promover a administrador' })
    expect(boton).toBeDisabled()

    expect(httpClient.post).not.toHaveBeenCalled()
  })

  it('muestra "Promover a administrador" habilitado para un usuario con rol USER', async () => {
    const httpClient = crearHttpClientMockConUsuarios([
      {
        id: 'usr-promovible',
        nombre: 'Juan Común',
        mail: 'juan@user.com',
        rol: 'USER',
        estadoCuenta: 'ACTIVO',
      },
    ])

    render(<PromocionPage httpClient={httpClient} />)

    await waitFor(() => {
      expect(screen.getByText('Juan Común')).toBeInTheDocument()
    })

    const boton = screen.getByRole('button', { name: 'Promover a administrador' })
    expect(boton).toBeEnabled()
  })
})
