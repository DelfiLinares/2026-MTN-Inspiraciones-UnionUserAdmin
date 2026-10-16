// Ruta protegida (T058): exige sesión iniciada (RF-10). 401 → invitación a iniciar sesión.
import React from "react";
import { EstadoError, Skeleton, useSesion } from "@inspiraciones/shared";

export interface RutaProtegidaProps {
  readonly children: React.ReactNode;
}

export function RutaProtegida({ children }: RutaProtegidaProps): React.JSX.Element {
  const { estaCargando, estaAutenticado, tieneError, recargarSesion } = useSesion();

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
        mensaje="Iniciá sesión para acceder a esta sección."
      />
    );
  }

  return <>{children}</>;
}
