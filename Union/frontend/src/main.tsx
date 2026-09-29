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
import './global.css'

const contenedorRaiz = document.getElementById('root')

if (!contenedorRaiz) {
  throw new Error('No se encontró el elemento raíz #root para montar la aplicación.')
}

ReactDOM.createRoot(contenedorRaiz).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
