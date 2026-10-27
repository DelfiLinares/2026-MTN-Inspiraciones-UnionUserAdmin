/**
 * `LoginAdminPage`: Pantalla de Login del módulo administrativo (HU-10).
 *
 * Nota de ubicación: `Union/specs/001-plataforma-unificada/tasks.md` (T095) define esta pantalla
 * dentro de `Admin/my-proyect/frontend-admin/src/presentation/login/`. Por instrucción explícita
 * del usuario para esta tarea puntual, la implementación se coloca aquí, dentro de
 * `Union/frontend/src/presentation/login/`, sin leer ni modificar
 * ningún archivo del proyecto `Admin/`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-10, RF-11, RF-12, RF-77, AC-04.9)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T095)
 *
 * Criterios de aceptación cubiertos:
 * - HU-10 / RF-11: Formulario de login de administrador (mail/contraseña).
 * - RF-12: El acceso al módulo administrativo se permite únicamente a cuentas con rol ADMIN;
 *   cualquier otro rol se rechaza con un mensaje claro (inverso a la validación de T084, donde se
 *   rechazaba el rol ADMIN en el frontend de usuario).
 * - RF-77 / AC-04.9 (aplicado también al login admin): muestra un mensaje específico si la cuenta
 *   está BANEADO o ELIMINADO, capturando `CuentaBloqueadaError`.
 * - Bloquea el envío del formulario mientras `enviando === true`.
 */

import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authAdminService, CuentaBloqueadaError } from '../../services/AuthAdminService'
import { RolNoAutorizadoError } from '../../infrastructure/sessionGuard'
import { MENSAJE_CREDENCIALES_INVALIDAS } from '../../services/authService'
import { Marca } from '../shared/Marca'
import '../admin/admin.css'

export const LoginAdminPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const mensajeInicial = (location.state as { mensaje?: string } | null)?.mensaje ?? null
  const [mail, setMail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(mensajeInicial)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const mailLimpio = mail.trim()
    if (!mailLimpio || !password) {
      setErrorMensaje('Por favor, ingresá tu mail y contraseña.')
      return
    }

    setEnviando(true)
    setErrorMensaje(null)

    try {
      // RF-12: solo rol ADMIN; el servicio valida el rol y persiste la sesión administrativa
      await authAdminService.login({ mail: mailLimpio, password })
      navigate('/admin/reportes', { replace: true })
    } catch (err: unknown) {
      if (err instanceof CuentaBloqueadaError) {
        // RF-77 / AC-04.9: Mensaje específico para cuenta BANEADA o ELIMINADA
        setErrorMensaje(err.message)
      } else if (err instanceof RolNoAutorizadoError) {
        setErrorMensaje('Acceso restringido: esta cuenta no posee permisos de administrador.')
      } else {
        setErrorMensaje(MENSAJE_CREDENCIALES_INVALIDAS)
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="admin-console">
      <main className="admin-login">
        <section className="admin-login-form" aria-labelledby="login-title">
          <span className="admin-brand"><Marca /></span>
          <h1 id="login-title">Ingreso al módulo administrativo</h1>
          <p>Iniciá sesión para gestionar el contenido y cuidar la comunidad.</p>
          <form onSubmit={handleSubmit} aria-label="Formulario de login de administrador">
            {errorMensaje && <div role="alert">{errorMensaje}</div>}
            <label htmlFor="input-admin-mail">Correo
              <input id="input-admin-mail" type="email" autoComplete="email" required value={mail} onChange={e => setMail(e.target.value)} disabled={enviando} />
            </label>
            <label htmlFor="input-admin-password">Contraseña
              <input id="input-admin-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={enviando} />
            </label>
            <button type="submit" disabled={enviando || !mail.trim() || !password}>{enviando ? 'Ingresando...' : 'Ingresar'}</button>
          </form>
        </section>
        <aside className="admin-login-aside" aria-labelledby="login-promo-title">
          <h2 id="login-promo-title">Panel de administración</h2>
          <p>Usuarios, publicaciones y desafíos: las herramientas de gestión en un mismo lugar.</p>
        </aside>
      </main>
    </div>
  )
}
