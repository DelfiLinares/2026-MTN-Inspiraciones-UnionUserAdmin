import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarDesafios } from '../../services/desafioService'
import type { Desafio } from '../../domain/Desafio'
export function ChallengeInicio() {
  const [actual, setActual] = useState<Desafio | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    const control = new AbortController()
    listarDesafios({ signal: control.signal }).then(lista => {
      if (!control.signal.aborted) setActual(lista.find(d => d.activo) ?? null)
    }).catch(() => { if (!control.signal.aborted) setError(true) })
    return () => control.abort()
  }, [])
  return <section className="home-challenge" id="challenge" aria-labelledby="home-challenge-title">
    <div className="home-challenge-art" aria-hidden="true" />
    <div className="home-challenge-copy">
      <h2 id="home-challenge-title">{actual?.titulo ?? 'Desafíos de la comunidad'}</h2>
      <p>{actual?.descripcion ?? (error ? 'No pudimos cargar el desafío. Podés volver a intentarlo desde la lista.' : 'Explorá las consignas o proponé una idea para el próximo desafío.')}</p>
      <Link to={actual ? '/desafios/' + actual.id : '/desafios'}>{actual ? 'Ver desafío' : 'Ver desafíos'}</Link>
      <Link to="/desafios/solicitar">Proponer un desafío</Link>
      <Link to="/desafios/mis-solicitudes">Mis solicitudes</Link>
    </div>
  </section>
}
