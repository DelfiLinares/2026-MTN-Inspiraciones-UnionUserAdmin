/**
 * Test de componente: deshabilitación de "Banear"/"Eliminar" sobre un usuario con rol `ADMIN`.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T039, depende de T038)
 * - Union/specs/002-frontend-admin/spec.md AC-01.5, AC-02.4, CB-01
 *
 * Cobertura:
 * - Al listar un usuario con rol ADMIN, los botones "Banear" y "Eliminar" de su fila están
 *   deshabilitados (AC-01.5, AC-02.4, CB-01).
 * - Al listar un usuario con rol USER, ambos botones están habilitados.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { UsuariosPage } from '../../src/presentation/usuarios/UsuariosPage'
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

describe('UsuariosPage — deshabilitación de acciones sobre rol ADMIN (T039)', () => {
  it('deshabilita "Banear" y "Eliminar" para un usuario con rol ADMIN', async () => {
    const httpClient = crearHttpClientMockConUsuarios([
      {
        id: 'admin-1',
        nombre: 'Laura Admin',
        mail: 'laura@admin.com',
        rol: 'ADMIN',
        estadoCuenta: 'ACTIVO',
      },
    ])

    render(<UsuariosPage httpClient={httpClient} />)

    await waitFor(() => expect(screen.getByText('Laura Admin')).toBeInTheDocument())

    const botonBanear = screen.getByRole('button', { name: 'Banear' })
    const botonEliminar = screen.getByRole('button', { name: 'Eliminar' })

    expect(botonBanear).toBeDisabled()
    expect(botonEliminar).toBeDisabled()
  })

  it('habilita "Banear" y "Eliminar" para un usuario con rol USER', async () => {
    const httpClient = crearHttpClientMockConUsuarios([
      {
        id: 'usr-1',
        nombre: 'Juan Común',
        mail: 'juan@user.com',
        rol: 'USER',
        estadoCuenta: 'ACTIVO',
      },
    ])

    render(<UsuariosPage httpClient={httpClient} />)

    await waitFor(() => expect(screen.getByText('Juan Común')).toBeInTheDocument())

    const botonBanear = screen.getByRole('button', { name: 'Banear' })
    const botonEliminar = screen.getByRole('button', { name: 'Eliminar' })

    expect(botonBanear).not.toBeDisabled()
    expect(botonEliminar).not.toBeDisabled()
  })
})
