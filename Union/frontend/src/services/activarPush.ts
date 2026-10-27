import { notificacionesService } from './notificacionesService'

export function pushConfigurado(): boolean {
  return ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_APP_ID', 'VITE_FIREBASE_VAPID_KEY'].every(k => Boolean(import.meta.env[k]))
}
export interface AvisoPush { titulo: string; mensaje: string; publicacionId?: string }
function configuracionFirebase() {
  return { apiKey: import.meta.env.VITE_FIREBASE_API_KEY, projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, appId: import.meta.env.VITE_FIREBASE_APP_ID }
}
/** Escucha entregas reales de FCM con la app abierta; no pide permisos automáticamente. */
export async function escucharPush(recibir: (aviso: AvisoPush) => void): Promise<() => void> {
  if (!pushConfigurado() || !('Notification' in window) || Notification.permission !== 'granted') return () => {}
  const [{ initializeApp, getApps }, { getMessaging, onMessage, isSupported }] = await Promise.all([import('firebase/app'), import('firebase/messaging')])
  if (!(await isSupported())) return () => {}
  const app = getApps().find(a => a.name === 'inspiraboard-push') ?? initializeApp(configuracionFirebase(), 'inspiraboard-push')
  return onMessage(getMessaging(app), payload => {
    const comentario = payload.data?.tipo === 'COMMENT'
    const aviso = { titulo: comentario ? 'Nuevo comentario' : 'Nuevo Me gusta',
      mensaje: comentario ? 'Alguien comentó tu publicación.' : 'A alguien le gustó tu publicación.', publicacionId: payload.data?.resourceId }
    recibir(aviso)
    window.dispatchEvent(new Event('inspiraciones:push-recibido'))
    void navigator.serviceWorker.getRegistration('/push/').then(registro => registro?.showNotification(aviso.titulo,
      { body: aviso.mensaje, data: { resourceId: aviso.publicacionId } })).catch(() => {})
  })
}
/** Se invoca exclusivamente al pulsar el control de permiso; nunca durante el login. */
export async function activarPush(): Promise<void> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) throw new Error('Este navegador no admite notificaciones push.')
  if (!pushConfigurado()) throw new Error('Las notificaciones del navegador todavía no están configuradas. Podés guardar tus preferencias igualmente.')
  const permiso = await Notification.requestPermission()
  if (permiso !== 'granted') throw new Error('No se habilitaron los avisos. Podés cambiar el permiso desde la configuración de tu navegador.')
  const [{ initializeApp, getApps }, { getMessaging, getToken, isSupported }] = await Promise.all([import('firebase/app'), import('firebase/messaging')])
  if (!(await isSupported())) throw new Error('Este navegador no admite Firebase Messaging.')
  const configuracion = configuracionFirebase()
  const app = getApps().find(a => a.name === 'inspiraboard-push') ?? initializeApp(configuracion, 'inspiraboard-push')
  const query = new URLSearchParams(configuracion as Record<string, string>)
  const registro = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${query}`, { scope: '/push/' })
  if (!registro.active) {
    const worker = registro.installing ?? registro.waiting
    if (worker) await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => { worker.removeEventListener('statechange', cambio); reject(new Error('El navegador no terminó de activar los avisos. Reintentá.')) }, 15000)
      function cambio() {
        if (worker?.state === 'activated') { clearTimeout(timeout); worker.removeEventListener('statechange', cambio); resolve() }
        else if (worker?.state === 'redundant') { clearTimeout(timeout); worker.removeEventListener('statechange', cambio); reject(new Error('No se pudo activar el servicio de notificaciones.')) }
      }
      worker.addEventListener('statechange', cambio)
      cambio()
    })
  }
  const token = await getToken(getMessaging(app), { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, serviceWorkerRegistration: registro })
  if (!token) throw new Error('No se pudo registrar este navegador. Intentá nuevamente.')
  await notificacionesService.registrarDispositivo(token)
  localStorage.setItem('inspiraciones.push.device', token)
  window.dispatchEvent(new Event('inspiraciones:push-activado'))
}
