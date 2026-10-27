import React, { useCallback, useEffect, useState } from 'react'
import { httpClientAdmin } from '../../infrastructure/httpClientAdmin'
import { ConfirmacionAccionSensibleModal } from '../shared/ConfirmacionAccionSensibleModal'

interface Detalle {
  id: string; motivo: string; prioridad: string; estadoModeracion: string; fechaCreacion: string
  objetivo: { tipo: 'PUBLICACION' | 'COMENTARIO'; id: string; publicacionId: string }
  contenidoObjetivo: { contenido: string }
}
type Accion = 'iniciar-revision' | 'aceptar' | 'rechazar' | 'retirar'
export interface ModeracionDetalleReporteProps { reporteId: string; onVolver: () => void }
export const ModeracionDetalleReporte: React.FC<ModeracionDetalleReporteProps> = ({ reporteId, onVolver }) => {
  const [detalle, setDetalle] = useState<Detalle | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [motivo, setMotivo] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [accion, setAccion] = useState<Accion | null>(null)
  const [aviso, setAviso] = useState('')
  const cargar = useCallback(async (signal?: AbortSignal) => {
    setCargando(true); setError('')
    try {
      const datos = await httpClientAdmin.get<Detalle>('/admin/reportes/' + encodeURIComponent(reporteId), { signal })
      if (!signal?.aborted) setDetalle(datos)
    } catch { if (!signal?.aborted) setError('No pudimos cargar el reporte. Intentá nuevamente.') }
    finally { if (!signal?.aborted) setCargando(false) }
  }, [reporteId])
  useEffect(() => { const control = new AbortController(); void cargar(control.signal); return () => control.abort() }, [cargar])
  async function ejecutar() {
    if (!detalle || !accion || !motivo.trim()) return
    setProcesando(true); setError(''); setAviso('')
    try {
      const body = { motivoAdmin: motivo.trim() }
      if (accion === 'retirar') {
        const objetivo = detalle.objetivo
        const ruta = objetivo.tipo === 'COMENTARIO'
          ? '/admin/publicaciones/' + encodeURIComponent(objetivo.publicacionId) + '/comentarios/' + encodeURIComponent(objetivo.id) + '/ocultar'
          : '/admin/publicaciones/' + encodeURIComponent(objetivo.id) + '/eliminar'
        await httpClientAdmin.post(ruta, body)
        await httpClientAdmin.post('/admin/reportes/' + encodeURIComponent(detalle.id) + '/aceptar', body)
      } else await httpClientAdmin.post('/admin/reportes/' + encodeURIComponent(detalle.id) + '/' + accion, body)
      setAccion(null); setMotivo(''); setAviso('La decisión quedó guardada.')
      await cargar()
    } catch { setAccion(null); setError('No pudimos completar la acción. Recargá el reporte para comprobar su estado antes de reintentar.') }
    finally { setProcesando(false) }
  }
  const abierto = detalle && ['PENDIENTE', 'EN_REVISION'].includes(detalle.estadoModeracion)
  const deshabilitado = procesando || !motivo.trim() || !abierto
  return <section>
    <button type="button" onClick={onVolver} disabled={procesando}>← Volver al listado</button>
    <h1>Detalle del reporte</h1>
    {cargando && <p role="status">Cargando reporte…</p>}
    {error && <div role="alert"><p>{error}</p><button type="button" disabled={procesando} onClick={() => void cargar()}>Recargar reporte</button></div>}
    {aviso && <p role="status">{aviso}</p>}
    {!cargando && detalle && <>
      <dl>
        <dt>Motivo del reporte</dt><dd>{detalle.motivo}</dd>
        <dt>Estado</dt><dd>{detalle.estadoModeracion}</dd>
        <dt>Prioridad</dt><dd>{detalle.prioridad}</dd>
        <dt>Fecha</dt><dd>{new Date(detalle.fechaCreacion).toLocaleDateString('es-AR')}</dd>
        <dt>Contenido reportado</dt><dd>{detalle.objetivo.tipo === 'COMENTARIO' ? 'Comentario' : 'Publicación'}</dd>
      </dl>
      <blockquote>{detalle.contenidoObjetivo.contenido}</blockquote>
      {abierto ? <>
        <label htmlFor="motivo-moderacion">Motivo de la decisión</label>
        <textarea id="motivo-moderacion" maxLength={500} required value={motivo} disabled={procesando} onChange={e => setMotivo(e.target.value)} />
        <p>Explicá la decisión para dejar constancia en el historial.</p>
        <div role="group" aria-label="Acciones de moderación">
          {detalle.estadoModeracion === 'PENDIENTE' && <button type="button" disabled={deshabilitado} onClick={() => setAccion('iniciar-revision')}>Iniciar revisión</button>}
          <button type="button" disabled={deshabilitado} onClick={() => setAccion('aceptar')}>Resolver sin retirar contenido</button>
          <button type="button" disabled={deshabilitado} onClick={() => setAccion('rechazar')}>Desestimar reporte</button>
          <button type="button" disabled={deshabilitado} onClick={() => setAccion('retirar')}>{detalle.objetivo.tipo === 'COMENTARIO' ? 'Ocultar comentario' : 'Eliminar publicación'}</button>
        </div>
      </> : <p>Este reporte ya fue resuelto.</p>}
      {accion && <ConfirmacionAccionSensibleModal abierto titulo="Confirmar decisión de moderación"
        mensaje={accion === 'retirar' ? 'Se retirará el contenido reportado y se aceptará el reporte. Esta decisión quedará registrada con tu motivo.' : 'Se actualizará el estado del reporte con el motivo que ingresaste.'}
        variante={accion === 'retirar' ? 'peligro' : 'neutra'} confirmando={procesando} onConfirmar={() => void ejecutar()} onCancelar={() => { if (!procesando) setAccion(null) }} />}
    </>}
  </section>
}
