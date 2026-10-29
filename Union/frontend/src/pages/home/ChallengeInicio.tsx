import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarDesafios } from '../../services/desafioService'
import type { Desafio } from '../../domain/Desafio'
import { NavigationIcon } from '../../presentation/shared/NavigationIcon'
export function ChallengeInicio() {
  const [actual, setActual] = useState<Desafio | null>(null)
  const [error, setError] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [intento, setIntento] = useState(0)
  useEffect(() => {
    const control = new AbortController()
    setCargando(true)
    setError(false)
    listarDesafios({ signal: control.signal }).then(lista => {
      if (!control.signal.aborted) setActual(lista.find(d => d.activo) ?? null)
    }).catch(() => { if (!control.signal.aborted) setError(true) })
      .finally(() => { if (!control.signal.aborted) setCargando(false) })
    return () => control.abort()
  }, [intento])
  return <article className="home-challenge" aria-label="Consigna de la comunidad">
    <div className="home-challenge-label"><NavigationIcon name="desafios" /><span>Una invitación a crear</span></div>
    <div className="home-challenge-copy">
      <h2>{actual?.titulo ?? 'Desafíos de la comunidad'}</h2>
      {cargando ? <p role="status">Buscando una consigna para vos...</p> : error ? (
        <><p role="alert">No pudimos cargar el desafío.</p><button type="button" onClick={() => setIntento(n => n + 1)}>Reintentar</button></>
      ) : <p>{actual?.descripcion ?? 'Explorá las consignas o proponé una idea para el próximo desafío.'}</p>}
      <Link to={actual?.id ? '/desafios/' + encodeURIComponent(actual.id) : '/desafios'}>{actual?.id ? 'Ver consigna →' : 'Ver desafíos →'}</Link>
    </div>
  </article>
}
