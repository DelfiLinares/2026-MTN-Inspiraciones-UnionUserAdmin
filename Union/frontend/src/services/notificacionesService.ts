import { httpClient } from '../infrastructure/httpClient'

export type TipoNotificacion = 'LIKE' | 'COMMENT' | 'NEW_POST' | 'REPORT' | 'ADMIN_ASSIGNED'
export interface PreferenciaNotificacion { tipoEvento: TipoNotificacion; activo: boolean }
export interface PreferenciasNotificaciones { userId: string; preferencias: PreferenciaNotificacion[] }
export interface NotificacionBandeja { id: string; tipo: 'LIKE' | 'COMMENT'; titulo: string; mensaje: string; publicacionId: string; createdAt: string }
// La API principal guarda las preferencias en la tabla compartida con Push.
const base = '/usuarios/me/notificaciones'
export const notificacionesService = {
  pendientes: (signal?: AbortSignal) => httpClient.get<NotificacionBandeja[]>(base + '/bandeja', { signal }),
  marcarLeida: (id: string) => httpClient.put<void>(base + '/bandeja/' + encodeURIComponent(id) + '/leida', {}),
  marcarTodasLeidas: () => httpClient.put<void>(base + '/bandeja/leidas', {}),
  obtener: (signal?: AbortSignal) => httpClient.get<PreferenciasNotificaciones>(base, { signal }),
  guardar: (preferencias: PreferenciaNotificacion[]) => httpClient.put<PreferenciasNotificaciones>(base, { preferencias }),
  registrarDispositivo: (token: string) => httpClient.post('/push-notifications/device-tokens', { token, plataforma: 'WEB' }),
}
