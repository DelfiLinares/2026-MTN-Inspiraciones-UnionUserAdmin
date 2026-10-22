import React, { useState } from 'react'
import { expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ConfirmacionAccionSensibleModal } from '../../src/presentation/shared/ConfirmacionAccionSensibleModal'

it('contiene el foco, cancela con Escape y devuelve el foco al botón de origen', () => {
  function Ejemplo() {
    const [abierto, setAbierto] = useState(false)
    return <><button onClick={() => setAbierto(true)}>Abrir confirmación</button><ConfirmacionAccionSensibleModal abierto={abierto} titulo="Confirmar cambio" mensaje="Revisá la acción antes de confirmar." onCancelar={() => setAbierto(false)} onConfirmar={vi.fn()} /></>
  }
  render(<Ejemplo />)
  const origen = screen.getByRole('button', { name: 'Abrir confirmación' })
  origen.focus()
  fireEvent.click(origen)
  const cancelar = screen.getByRole('button', { name: 'Cancelar' })
  const confirmar = screen.getByRole('button', { name: 'Confirmar' })
  expect(cancelar).toHaveFocus()
  fireEvent.keyDown(cancelar, { key: 'Tab', shiftKey: true })
  expect(confirmar).toHaveFocus()
  fireEvent.keyDown(confirmar, { key: 'Tab' })
  expect(cancelar).toHaveFocus()
  fireEvent.keyDown(cancelar, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(origen).toHaveFocus()
})
