import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { httpClient } from '../../infrastructure/httpClient'
import '../notificaciones/notificaciones.css'

interface Inspiracion { id: string; usuarioId: string; contenido: string; fotoUrl?: string; hashtags: string[] }
export function DetalleInspiracionPage() {
  const { id } = useParams()
  const [publicacion, setPublicacion] = useState<Inspiracion | null>(null)
  const [error, setError] = useState(false)
  const [intento, setIntento] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setPublicacion(null); setError(false)
    httpClient.get<Inspiracion>(`/publicaciones/${encodeURIComponent(id ?? '')}`, { signal: controller.signal })
      .then(p => { if (!controller.signal.aborted) setPublicacion(p) })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [id, intento])
  return <main className="preferencias-notificaciones">
    <Link to="/buscar">Volver a buscar inspiración</Link>
    <section><h1>Una idea para inspirarte</h1>
      {error ? <div role="alert"><p>No pudimos abrir esta publicación. Puede que ya no esté disponible.</p><button onClick={() => setIntento(n => n + 1)}>Reintentar</button></div> : publicacion ? <article>
        {publicacion.fotoUrl && <img src={publicacion.fotoUrl} alt="" style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 16 }} />}
        <p style={{ whiteSpace: 'pre-wrap' }}>{publicacion.contenido}</p>
        <p>{publicacion.hashtags.map(h => `#${h}`).join(' ')}</p>
        <Link to={`/perfil/${publicacion.usuarioId}`}>Ver perfil del autor</Link>
      </article> : <p role="status">Cargando publicación…</p>}
    </section>
  </main>
}
