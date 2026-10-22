// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import {
  MENSAJE_RESTABLECIMIENTO_OK,
  MENSAJE_SOLICITUD_NEUTRO,
  RecuperarContrasenaPage,
} from '../../src/pages/recuperar/RecuperarContrasenaPage'
import type { RecoveryService } from '../../src/application/recoveryService'

afterEach(cleanup)

const LoginStub = () => {
  const { state } = useLocation()
  return <p>LOGIN {(state as { mensajeExito?: string } | null)?.mensajeExito}</p>
}

function montar(service: Partial<RecoveryService>) {
  const completo: RecoveryService = {
    solicitarCodigo: vi.fn().mockResolvedValue(undefined),
    confirmar: vi.fn().mockResolvedValue(undefined),
    apelar: vi.fn().mockResolvedValue(undefined),
    ...service,
  }
  render(
    <MemoryRouter initialEntries={['/recuperar-contrasena']}>
      <Routes>
        <Route path="/recuperar-contrasena" element={<RecuperarContrasenaPage service={completo} />} />
        <Route path="/login" element={<LoginStub />} />
      </Routes>
    </MemoryRouter>,
  )
  return completo
}

const escribir = (etiqueta: string | RegExp, valor: string) =>
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })

async function irAlPasoDelCodigo(service: RecoveryService) {
  escribir('Correo', 'ana@mail.com')
  fireEvent.click(screen.getByRole('button', { name: 'Enviar código' }))
  await screen.findByLabelText('Código')
  expect(service.solicitarCodigo).toHaveBeenCalledWith('ana@mail.com')
}

function completarPaso2(codigo = '123456', clave = 'Abcdef1!') {
  escribir('Código', codigo)
  escribir('Nueva contraseña', clave)
  escribir('Repetí la contraseña', clave)
}

describe('RecuperarContrasenaPage', () => {
  it('flujo feliz: solicita código, confirma y redirige a login con mensaje', async () => {
    const service = montar({})
    await irAlPasoDelCodigo(service)
    expect(screen.getByText(MENSAJE_SOLICITUD_NEUTRO)).toBeTruthy()

    completarPaso2('123456')
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    await screen.findByText(new RegExp(`LOGIN ${MENSAJE_RESTABLECIMIENTO_OK}`))
    expect(service.confirmar).toHaveBeenCalledWith({
      email: 'ana@mail.com',
      codigo: '123456',
      nuevaContrasena: 'Abcdef1!',
      confirmacion: 'Abcdef1!',
    })
  })

  it('muestra el mismo mensaje neutro aunque el backend rechace la cuenta', async () => {
    // el servicio ya convierte 400/404 en éxito; aquí se verifica que la UI avanza igual
    const service = montar({ solicitarCodigo: vi.fn().mockResolvedValue(undefined) })
    await irAlPasoDelCodigo(service)
    expect(screen.getByText(MENSAJE_SOLICITUD_NEUTRO)).toBeTruthy()
  })

  it('valida el formato del email sin llamar a la API', () => {
    const service = montar({})
    escribir('Correo', 'no-es-email')
    fireEvent.click(screen.getByRole('button', { name: 'Enviar código' }))
    expect(screen.getByRole('alert').textContent).toContain('correo electrónico válido')
    expect(service.solicitarCodigo).not.toHaveBeenCalled()
  })

  it('bloquea el doble envío mientras la solicitud está en curso', async () => {
    let resolver: () => void = () => {}
    const solicitarCodigo = vi.fn().mockReturnValue(new Promise<void>((r) => { resolver = r }))
    montar({ solicitarCodigo })
    escribir('Correo', 'ana@mail.com')
    const boton = screen.getByRole('button', { name: 'Enviar código' })
    fireEvent.click(boton)
    fireEvent.click(boton)
    expect(solicitarCodigo).toHaveBeenCalledTimes(1)
    resolver()
    await screen.findByLabelText('Código')
  })

  it('en 429 permanece en el primer paso y avisa', async () => {
    montar({ solicitarCodigo: vi.fn().mockRejectedValue({ status: 429, body: {} }) })
    escribir('Correo', 'ana@mail.com')
    fireEvent.click(screen.getByRole('button', { name: 'Enviar código' }))
    const alerta = await screen.findByRole('alert')
    expect(alerta.textContent).toContain('demasiadas solicitudes')
    expect(screen.queryByLabelText('Código')).toBeNull()
  })

  it('deshabilita el envío y lista requisitos con una contraseña débil', async () => {
    const service = montar({})
    await irAlPasoDelCodigo(service)
    completarPaso2('123456', 'abc')
    expect(screen.getByText('Al menos un número')).toBeTruthy()
    expect(screen.getByText('Al menos un carácter especial')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Cambiar contraseña' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('normaliza el código pegado a solo dígitos', async () => {
    const service = montar({})
    await irAlPasoDelCodigo(service)
    escribir('Código', '12 34-56 78')
    expect((screen.getByLabelText('Código') as HTMLInputElement).value).toBe('123456')
  })

  it('muestra intentos restantes ante un código incorrecto', async () => {
    const confirmar = vi.fn().mockRejectedValue({ status: 400, body: { code: 'OTP_INVALIDO', intentosRestantes: 2 } })
    const service = montar({ confirmar })
    await irAlPasoDelCodigo(service)
    completarPaso2()
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    const alerta = await screen.findByRole('alert')
    expect(alerta.textContent).toContain('Código incorrecto')
    expect(alerta.textContent).toContain('2 intentos')
    expect(screen.queryByText(/LOGIN/)).toBeNull()
  })

  it('ofrece pedir un código nuevo cuando venció y mantiene el cooldown visible', async () => {
    const confirmar = vi.fn().mockRejectedValue({ status: 400, body: { code: 'OTP_EXPIRADO' } })
    const service = montar({ confirmar })
    await irAlPasoDelCodigo(service)
    completarPaso2()
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    await screen.findByText(/venció/)
    // el cooldown de 60 s arrancó al pedir el código: el botón de reenvío sigue bloqueado
    const reenviar = screen.getByRole('button', { name: /Reenviar código en \d+ s/ }) as HTMLButtonElement
    expect(reenviar.disabled).toBe(true)
  })

  it('no guarda código ni contraseña en storage', async () => {
    const service = montar({})
    await irAlPasoDelCodigo(service)
    completarPaso2()
    await waitFor(() => {
      expect(JSON.stringify({ ...localStorage })).not.toContain('Abcdef1!')
      expect(JSON.stringify({ ...sessionStorage })).not.toContain('Abcdef1!')
    })
  })
})
