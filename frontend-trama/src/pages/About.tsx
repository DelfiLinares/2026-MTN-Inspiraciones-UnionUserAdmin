import { useState } from 'react'
import { ArrowRight, ExternalLink, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, ErrorMessage, Modal, PageTitle, SelectField, statusLabels } from '../components/UI'
import { useDemo } from '../context/DemoContext'
import { imageCredits } from '../data/seed'
import { errorMessage } from '../data/store'

const photoLabels: Record<string, string> = {
  corriente: 'Pintura abstracta', equilibrio: 'Cerámica esmaltada', taller: 'Materiales del taller',
  fragmentos: 'Composición floral', color: 'Pliegues de color', proceso: 'Pinceles y proceso',
}

export function AboutPage() {
  const { state, user, login, reset } = useDemo()
  const navigate = useNavigate()
  const [profileId, setProfileId] = useState(user?.id ?? 'mora')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [resetOpen, setResetOpen] = useState(false)
  const profiles = state.users.filter(member => member.status !== 'deleted')
  const selected = profiles.find(member => member.id === profileId) ?? profiles[0]
  const changeProfile = async () => {
    if (!selected) return
    setPending(true)
    setError('')
    try {
      const profile = await login(selected.id)
      navigate(profile.status === 'suspended' ? '/apelacion' : profile.role === 'admin' ? '/admin/resumen' : '/inicio')
    } catch (failure) { console.error('[Trama demo] No se pudo cambiar de perfil.', failure); setError(errorMessage(failure)) }
    finally { setPending(false) }
  }
  const restart = async () => {
    setPending(true)
    setError('')
    try { await reset(); setProfileId('mora'); setResetOpen(false) }
    catch (failure) { console.error('[Trama demo] No se pudo reiniciar.', failure); setError(errorMessage(failure)) }
    finally { setPending(false) }
  }
  return <div className="about-page"><PageTitle title="Acerca de Trama" description="Una comunidad para artistas, en una demostración local." />
    <section className="about-section"><h2>Qué es real y qué es de ejemplo</h2>
      <p>Los perfiles iniciales, sus obras asociadas, los lugares y la actividad son ficticios. Las fotografías tienen sus propias fuentes: los nombres de los perfiles no representan a sus autores reales.</p>
      <p>Las interacciones modifican esta demo, no un servicio en Internet. No hay backend, autenticación de producción, envío de correos ni un motor real de recomendaciones. Las contraseñas de muestra no se verifican ni se guardan.</p>
      <p>El mapa es ilustrativo. Sus lugares no son direcciones ni servicios reales y no sirve para orientarse.</p>
    </section>
    <section className="about-section"><h2>Los datos quedan en este navegador</h2>
      <p>IndexedDB conserva perfiles, imágenes y audios subidos, publicaciones, comentarios, likes, seguimientos, carpetas y decisiones de administración. La sesión de cada pestaña se guarda en sessionStorage.</p>
      <p>Recargar conserva los datos guardados. Borrar los datos del sitio o reiniciar esta demo los elimina. No se sincronizan con Git ni con otra computadora. Usá datos de ejemplo, no información personal ni contraseñas reales.</p>
      <p>Las carpetas son privadas entre los perfiles de la interfaz, pero el almacenamiento local puede inspeccionarse o modificarse desde las herramientas del navegador. Los roles de esta demo no son una barrera de seguridad de producción.</p>
    </section>
    <section className="about-section"><h2>Elegí un perfil local</h2><p>{user ? `Sesión actual: ${user.name}.` : 'Estás explorando sin una sesión de demo.'}</p>
      <div className="demo-profile-switch"><SelectField label="Perfil de demostración" value={selected?.id ?? ''} disabled={pending} onChange={event => setProfileId(event.target.value)} options={profiles.map(member => ({ value: member.id, label: `${member.name} · ${statusLabels[member.role]}${member.status === 'suspended' ? ' · Suspendida' : ''}` }))} />
        <Button onClick={() => void changeProfile()} loading={pending && !resetOpen} disabled={!selected || resetOpen}>Cambiar perfil<ArrowRight size={18} aria-hidden="true" /></Button></div>
      {!resetOpen && <ErrorMessage message={error} />}
    </section>
    <section className="about-section"><h2>Volver a los datos iniciales</h2><p>El reinicio elimina las publicaciones subidas y todos los cambios locales de Trama. Cierra la sesión actual y vuelve a crear los ejemplos. No afecta al frontend anterior ni a otros sitios.</p>
      <Button variant="danger" disabled={pending} onClick={() => { setError(''); setResetOpen(true) }}><RotateCcw size={18} aria-hidden="true" />Reiniciar datos</Button>
    </section>
    <section className="about-section"><h2>Créditos y licencias</h2><dl className="credits-list">
      <div><dt>Identidad Trama</dt><dd>Símbolo 11 · Encuentro e identidad suministrada para este proyecto. La vectorización conserva la forma elegida; no es una marca nueva.</dd></div>
      <div><dt>Inter</dt><dd>Copyright 2020 The Inter Project Authors. Fuente incluida sin modificar, bajo <a className="text-link" href="/fonts/OFL.txt" target="_blank" rel="noopener noreferrer">SIL Open Font License 1.1</a>.</dd></div>
      <div><dt>Lucide</dt><dd>Lucide Icons and Contributors, licencia ISC. Incluye iconos derivados de Feather, de Cole Bemis, bajo MIT. <a className="text-link" href="/licenses/lucide.txt" target="_blank" rel="noopener noreferrer">Avisos y licencias completos</a>.</dd></div>
      <div><dt>Ilustraciones</dt><dd>Seis ilustraciones SVG originales de demostración: línea, objetos, botánica, herbario y las dos portadas sonoras. No son obras de los perfiles ficticios.</dd></div>
      <div><dt>Audio</dt><dd>Dos piezas instrumentales sintetizadas para la demo, de 8 y 6 segundos, sin grabaciones ni voces de terceros. Publicadas como recursos de ejemplo bajo <a className="text-link" href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener noreferrer">CC0</a>.</dd></div>
      <div><dt>Fotografías</dt><dd>Seis referencias obtenidas de Unsplash y servidas localmente, bajo la <a className="text-link" href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">licencia Unsplash</a>. Las fuentes utilizadas se enlazan a continuación; no se atribuyen a los perfiles de la demo.</dd></div>
    </dl>
      <ul className="photo-credits">{Object.entries(imageCredits).map(([asset, url]) => <li key={asset}><img src={`/media/${asset}.jpg`} alt="" loading="lazy" width="240" height="160" /><strong>{photoLabels[asset] ?? asset}</strong><a className="text-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Ver referencia de ${photoLabels[asset] ?? asset} en Unsplash`}>Referencia original<ExternalLink size={16} aria-hidden="true" /></a></li>)}</ul>
    </section>
    <Modal open={resetOpen} title="Reiniciar los datos de Trama" description="Se borrarán las obras subidas, perfiles creados, carpetas, interacciones y decisiones locales. Esta acción no se puede deshacer." busy={pending} onClose={() => setResetOpen(false)}>
      <ErrorMessage message={error} /><div className="dialog-actions"><Button variant="secondary" disabled={pending} onClick={() => setResetOpen(false)}>Cancelar</Button><Button variant="danger" loading={pending} onClick={() => void restart()}>Reiniciar demo</Button></div>
    </Modal>
  </div>
}