import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { notificacionesService, type PreferenciaNotificacion } from '../../services/notificacionesService'
import { activarPush, pushConfigurado } from '../../services/activarPush'
import './notificaciones.css'

// El servicio de Push actualmente entrega LIKE y COMMENT; los otros tipos aún no generan envíos.
const opciones = [
  { tipoEvento: 'LIKE' as const, titulo: 'Me gusta en tus publicaciones', descripcion: 'Cuando a alguien le gusta lo que compartiste.' },
  { tipoEvento: 'COMMENT' as const, titulo: 'Comentarios', descripcion: 'Cuando alguien comenta tus publicaciones.' },
]
export function ConfiguracionNotificacionesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const destinoSolicitado = (location.state as { destino?: string } | null)?.destino
  const destino = destinoSolicitado?.startsWith('/') && !destinoSolicitado.startsWith('//') && destinoSolicitado !== '/notificaciones/configuracion' ? destinoSolicitado : '/notificaciones'
  const [preferencias, setPreferencias] = useState<PreferenciaNotificacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [cargaOk, setCargaOk] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [activando, setActivando] = useState(false)
  const [avisoPush, setAvisoPush] = useState('')
  async function habilitarNavegador() {
    setActivando(true); setAvisoPush('')
    try { await activarPush(); setAvisoPush('Este navegador quedó registrado para recibir notificaciones.') }
    catch (e) { setAvisoPush(e instanceof Error ? e.message : 'No pudimos activar los avisos. Intentá nuevamente.') }
    finally { setActivando(false) }
  }
  useEffect(() => {
    const controller = new AbortController()
    let montada = true
    const limite = setTimeout(() => controller.abort(), 10000)
    setCargando(true); setCargaOk(false); setError('')
    notificacionesService.obtener(controller.signal).then(r => {
      if (montada) { setPreferencias(r.preferencias); setCargaOk(true) }
    }).catch(() => {
      if (montada) setError('No pudimos cargar tus preferencias. Reintentá o continuá para configurarlas más tarde.')
    }).finally(() => { clearTimeout(limite); if (montada) setCargando(false) })
    return () => { montada = false; clearTimeout(limite); controller.abort() }
  }, [intento])
  async function guardar() {
    setGuardando(true); setError('')
    try {
      await notificacionesService.guardar(preferencias)
      navigate(destino, { replace: true })
    } catch { setError('No pudimos guardar los cambios. Tus preferencias todavía no se actualizaron. Intentá nuevamente.') }
    finally { setGuardando(false) }
  }
  return <main className="preferencias-notificaciones">
    <Link className="preferencias-notificaciones__marca" to="/feed">trama</Link>
    <section aria-labelledby="notificaciones-titulo">
      <h1 id="notificaciones-titulo">Elegí qué querés recibir</h1>
      <p>Seguí las conversaciones que nacen de tus ideas. Podés cambiar estas preferencias cuando quieras.</p>
      {cargando ? <p role="status">Cargando tus preferencias…</p> : <>
        {error && <div role="alert"><p>{error}</p><button type="button" onClick={() => setIntento(n => n + 1)} disabled={guardando}>Volver a cargar</button></div>}
        <fieldset disabled={guardando || !cargaOk}>
          <legend>Notificaciones de tu comunidad</legend>
          {opciones.map(o => <label className="preferencias-notificaciones__opcion" key={o.tipoEvento}>
            <span><strong>{o.titulo}</strong><span>{o.descripcion}</span></span>
            <input type="checkbox" checked={preferencias.find(p => p.tipoEvento === o.tipoEvento)?.activo ?? true}
              onChange={e => setPreferencias(prev => [...prev.filter(p => p.tipoEvento !== o.tipoEvento), { tipoEvento: o.tipoEvento, activo: e.target.checked }])} />
          </label>)}
        </fieldset>
        <p className="preferencias-notificaciones__ayuda">Estas opciones se guardan en tu cuenta. Recibir avisos fuera de la app requiere activar también las notificaciones del navegador.</p>
        <button type="button" disabled={activando || !pushConfigurado()} onClick={habilitarNavegador}>{activando ? 'Activando avisos…' : 'Activar en este navegador'}</button>
        {!pushConfigurado() && <p className="preferencias-notificaciones__ayuda">Los avisos del navegador todavía no están disponibles. Podés guardar tus preferencias igualmente.</p>}
        {avisoPush && <p role="status">{avisoPush}</p>}
        <div className="preferencias-notificaciones__acciones">
          <button type="button" onClick={guardar} disabled={guardando || !cargaOk}>{guardando ? 'Guardando…' : 'Guardar y continuar'}</button>
          <Link to={destino} aria-disabled={guardando} onClick={e => { if (guardando) e.preventDefault() }}>Ahora no</Link>
        </div>
      </>}
    </section>
  </main>
}
