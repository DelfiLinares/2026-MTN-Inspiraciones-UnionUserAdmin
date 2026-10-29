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
  return <aside role="status" aria-label="Aviso de la comunidad" className="trama-community-notice">
    <strong>{aviso.titulo}</strong><p>{aviso.mensaje}</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: 12 }}>
      {aviso.publicacionId && <Link to={'/publicaciones/' + encodeURIComponent(aviso.publicacionId)} onClick={() => setAviso(null)}>Ver publicación</Link>}
      <button type="button" aria-label="Cerrar aviso" onClick={() => setAviso(null)}>Cerrar</button>
    </div>
  </aside>
}
