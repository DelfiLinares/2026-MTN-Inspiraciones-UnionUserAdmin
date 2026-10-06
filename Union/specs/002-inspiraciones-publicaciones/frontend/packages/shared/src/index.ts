// Punto de entrada del paquete compartido.
export * from "./domain";
export * from "./components/ConfirmDialog";
export * from "./components/Estados";
export * from "./components/Notificaciones";
export * from "./components/Medio";
export * from "./utils/formato";
export * from "./utils/mensajes";
export { ProveedorSesion, useSesion } from "./hooks/useSesion";
export type { ContextoSesionValor } from "./hooks/useSesion";
export { ProveedorNotificaciones, useNotificaciones } from "./hooks/useNotificaciones";
export { crearQueryClient } from "./hooks/queryClient";
export { crearHttpClient } from "./services/httpClient";
export { crearSesionService } from "./services/sesionService";
export type { SesionService } from "./services/sesionService";






