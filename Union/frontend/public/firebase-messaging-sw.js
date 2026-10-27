/* Configuración pública de Firebase; el JWT de sesión nunca se transmite al worker. */
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');
const config = Object.fromEntries(new URL(self.location.href).searchParams);
firebase.initializeApp(config);
firebase.messaging().onBackgroundMessage(payload => {
  if (payload.notification) return; // FCM ya muestra los mensajes con notification.
  const tipo = payload.data?.tipo;
  const titulo = tipo === 'COMMENT' ? 'Nuevo comentario' : 'A alguien le gustó tu publicación';
  return self.registration.showNotification(titulo, {
    body: 'Entrá a InspiraBoard para ver tu publicación.',
    data: { resourceId: payload.data?.resourceId },
  });
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const id = event.notification.data?.resourceId;
  event.waitUntil(clients.openWindow(id ? `/publicaciones/${encodeURIComponent(id)}` : '/feed'));
});
