// Guardia de rutas de admin (T066): rechaza si el rol no es ADMIN (RF-10b, A-15).
// La autoridad real es el backend; esto es ayuda de UX.
import React from "react";
import { EstadoError, Skeleton, useSesion } from "@inspiraciones/shared";

export interface RequireAdminProps {
  readonly children: React.ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps): React.JSX.Element {
  const { estaCargando, estaAutenticado, esAdmin, tieneError, recargarSesion } = useSesion();

  if (estaCargando) {
    return <Skeleton variante="rectangulo" ariaLabel="Verificando sesión" />;
  }

  if (tieneError) {
    return (
      <EstadoError
        titulo="No pudimos verificar tu sesión"
        mensaje="Revisá tu conexión e intentá de nuevo."
        onReintentar={() => void recargarSesion()}
      />
    );
  }

  if (!estaAutenticado) {
    return (
      <EstadoError
        titulo="Necesitás iniciar sesión"
        mensaje="Iniciá sesión con una cuenta de administrador."
      />
    );
  }

  if (!esAdmin) {
    return (
      <EstadoError
        titulo="Acceso restringido"
        mensaje="Esta sección es solo para administradores."
      />
    );
  }

  return <>{children}</>;
}
