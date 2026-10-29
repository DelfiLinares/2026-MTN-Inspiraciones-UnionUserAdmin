import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { notificacionesService, type NotificacionBandeja } from '../../services/notificacionesService'
import './notificaciones.css'

export function NotificacionesPage() {
  const [avisos, setAvisos] = useState<NotificacionBandeja[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ocupada, setOcupada] = useState<string | null>(null)
  const peticion = useRef<AbortController | null>(null)
  const navigate = useNavigate()
  const cargar = useCallback(async () => {
    peticion.current?.abort()
    const control = new AbortController(); peticion.current = control
    try {
      const resultado = await notificacionesService.pendientes(control.signal)
      if (!control.signal.aborted) { setAvisos(resultado); setError('') }
    } catch {
      if (!control.signal.aborted) setError('No pudimos cargar tus notificaciones. Probá actualizar la lista.')
    } finally { if (!control.signal.aborted) setCargando(false) }
  }, [])
  useEffect(() => {
    void cargar()
    const actualizar = () => { if (document.visibilityState === 'visible') void cargar() }
    const intervalo = window.setInterval(actualizar, 30000)
    window.addEventListener('inspiraciones:push-recibido', actualizar)
    window.addEventListener('focus', actualizar)
    return () => { peticion.current?.abort(); clearInterval(intervalo); window.removeEventListener('inspiraciones:push-recibido', actualizar); window.removeEventListener('focus', actualizar) }
  }, [cargar])
  async function leer(aviso: NotificacionBandeja, abrir: boolean) {
    setOcupada(aviso.id); setError('')
    try {
      await notificacionesService.marcarLeida(aviso.id)
      setAvisos(lista => lista.filter(n => n.id !== aviso.id))
      if (abrir) navigate('/publicaciones/' + encodeURIComponent(aviso.publicacionId))
    } catch { setError('No pudimos marcar el aviso como leído. Intentá nuevamente.') }
    finally { setOcupada(null) }
  }
  async function leerTodas() {
    setOcupada('todas'); setError('')
    try { await notificacionesService.marcarTodasLeidas(); await cargar() }
    catch { setError('No pudimos marcar los avisos como leídos. Intentá nuevamente.') }
    finally { setOcupada(null) }
  }
  return <main className="bandeja-notificaciones">
    <section className="bandeja-notificaciones__contenido" aria-labelledby="bandeja-titulo">
      <div className="bandeja-notificaciones__titulo"><div><h1 id="bandeja-titulo">Notificaciones</h1><p>Las novedades de tu comunidad que todavía no viste.</p></div>
        <Link className="bandeja-notificaciones__configuracion" to="/notificaciones/configuracion">Configuración</Link>
      </div>
      <div className="bandeja-notificaciones__herramientas"><span>{avisos.length} sin leer</span><div>
        <button type="button" disabled={cargando || ocupada !== null} onClick={() => void cargar()}>Actualizar</button>
        <button type="button" disabled={!avisos.length || ocupada !== null} onClick={() => void leerTodas()}>Marcar todas como leídas</button>
      </div></div>
      {error && <p role="alert">{error}</p>}
      {cargando ? <p role="status">Cargando notificaciones…</p> : !avisos.length && !error ? <div className="bandeja-notificaciones__vacia"><h2>Estás al día</h2><p>Cuando alguien comente o indique que le gusta una publicación tuya, vas a encontrar el aviso acá.</p><Link to="/feed">Explorar la comunidad</Link></div> : <ul className="bandeja-notificaciones__lista">
        {avisos.map(aviso => <li key={aviso.id}>
          <span className="bandeja-notificaciones__punto" aria-label="Sin leer" />
          <div className="bandeja-notificaciones__aviso"><h2>{aviso.titulo}</h2><p>{aviso.mensaje}</p><time dateTime={aviso.createdAt}>{new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(aviso.createdAt))}</time>
            <div className="bandeja-notificaciones__acciones"><button type="button" disabled={ocupada !== null} onClick={() => void leer(aviso, true)}>Ver publicación</button><button type="button" disabled={ocupada !== null} onClick={() => void leer(aviso, false)}>{ocupada === aviso.id ? 'Guardando…' : 'Marcar como leída'}</button></div>
          </div>
        </li>)}
      </ul>}
    </section>
  </main>
}
