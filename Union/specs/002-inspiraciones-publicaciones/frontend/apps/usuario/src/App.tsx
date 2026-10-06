// Raíz de la app de usuario (T058): proveedores (consultas, notificaciones, sesión) y rutas.
import React, { useMemo, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import {
  ProveedorNotificaciones,
  ProveedorSesion,
  crearHttpClient,
  crearQueryClient,
  crearSesionService,
} from "@inspiraciones/shared";
import { RutasUsuario } from "./routes";

const URL_API = import.meta.env.VITE_API_URL ?? "/api";

export function App(): React.JSX.Element {
  const [queryClient] = useState(() => crearQueryClient());
  const sesionService = useMemo(() => crearSesionService(crearHttpClient({ baseUrl: URL_API })), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ProveedorNotificaciones>
        <ProveedorSesion sesionService={sesionService}>
          <BrowserRouter>
            <RutasUsuario />
          </BrowserRouter>
        </ProveedorSesion>
      </ProveedorNotificaciones>
    </QueryClientProvider>
  );
}

export default App;
