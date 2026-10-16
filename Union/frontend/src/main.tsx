/**
 * `main.tsx`: Punto de entrada de la aplicación (frontend de usuario).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4, "Project Structure")
 * - Union/specs/001-plataforma-unificada/tasks.md (T094)
 *
 * Monta el componente raíz `App` en el elemento `#root` del `index.html`.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { config } from './infrastructure/config'
import './global.css'

const contenedorRaiz = document.getElementById('root')

if (!contenedorRaiz) {
  throw new Error('No se encontró el elemento raíz #root para montar la aplicación.')
}

// Ruta en variable para que el build no falle mientras el worker MSW (tests/mocks/browser.ts) no exista.
async function iniciarMocks(): Promise<void> {
  if (!config.useMocks) {
    return
  }
  const rutaWorker = '../tests/mocks/browser'
  const { worker } = await import(/* @vite-ignore */ rutaWorker)
  await worker.start({ onUnhandledRequest: 'bypass' })
}

void iniciarMocks().then(() => {
  ReactDOM.createRoot(contenedorRaiz).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
