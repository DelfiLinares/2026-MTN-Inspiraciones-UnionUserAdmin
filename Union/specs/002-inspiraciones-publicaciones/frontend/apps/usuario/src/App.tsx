// Raíz de la app de usuario (T058): proveedores (consultas, notificaciones, sesión) y rutas.
import React, { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ProveedorNotificaciones, ProveedorSesion, crearQueryClient } from "@inspiraciones/shared";
import { RutasUsuario } from "./routes";
import { sesionService } from "./servicios";

export function App(): React.JSX.Element {
  const [queryClient] = useState(() => crearQueryClient());

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
