import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { escucharPush, type AvisoPush } from '../../services/activarPush'
export function AvisosComunidad() {
  const { usuario } = useAuth()
  const [aviso, setAviso] = useState<AvisoPush | null>(null)
  const [registro, setRegistro] = useState(0)
  useEffect(() => {
    const actualizar = () => setRegistro(n => n + 1)
    window.addEventListener('inspiraciones:push-activado', actualizar)
    return () => window.removeEventListener('inspiraciones:push-activado', actualizar)
  }, [])
  useEffect(() => {
    setAviso(null)
    if (!usuario) return
    let activo = true
    let cancelar = () => {}
    escucharPush(nuevo => { if (activo) setAviso(nuevo) }).then(baja => {
      if (activo) cancelar = baja; else baja()
    }).catch(() => {})
    return () => { activo = false; cancelar() }
  }, [usuario?.id, registro])
  if (!aviso) return null
  return <aside role="status" aria-label="Aviso de la comunidad" style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 900, padding: 20, boxSizing: 'border-box', width: 'min(360px, calc(100vw - 40px))', background: '#fff', color: '#252525', border: '1px solid #d1d1d1', borderRadius: 12, boxShadow: '0 8px 32px #0002' }}>
    <strong>{aviso.titulo}</strong><p>{aviso.mensaje}</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: 12 }}>
      {aviso.publicacionId && <Link to={'/publicaciones/' + encodeURIComponent(aviso.publicacionId)} onClick={() => setAviso(null)}>Ver publicación</Link>}
      <button type="button" aria-label="Cerrar aviso" onClick={() => setAviso(null)} style={{ padding: '8px 14px', background: '#fff', color: '#252525', border: '1px solid #777', borderRadius: 20, cursor: 'pointer' }}>Cerrar</button>
    </div>
  </aside>
}
