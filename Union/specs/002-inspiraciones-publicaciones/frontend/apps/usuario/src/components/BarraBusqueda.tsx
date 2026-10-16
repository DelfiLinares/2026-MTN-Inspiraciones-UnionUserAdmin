// Barra de búsqueda por texto del feed (T052).
// Región role="search"; emite el texto al enviar y al limpiar. Spec: HU-06, RF-27.

import React, { useEffect, useId, useState } from "react";
import styles from "./BarraBusqueda.module.css";

export interface BarraBusquedaProps {
  /** Texto de búsqueda vigente (controlado por la página). */
  readonly valor?: string;
  readonly onBuscar: (texto: string) => void;
  readonly placeholder?: string;
  readonly className?: string;
}

export const BarraBusqueda: React.FC<BarraBusquedaProps> = ({
  valor = "",
  onBuscar,
  placeholder = "Buscar publicaciones",
  className = "",
}) => {
  const [texto, setTexto] = useState(valor);
  const campoId = useId();

  useEffect(() => {
    setTexto(valor);
  }, [valor]);

  const manejarEnvio = (evento: React.FormEvent) => {
    evento.preventDefault();
    onBuscar(texto.trim());
  };

  const limpiar = () => {
    setTexto("");
    onBuscar("");
  };

  return (
    <form
      role="search"
      className={`${styles.barra} ${className}`.trim()}
      onSubmit={manejarEnvio}
      data-testid="barra-busqueda"
    >
      <label htmlFor={campoId} className={styles.soloLectores}>
        Buscar por texto
      </label>
      <input
        id={campoId}
        type="search"
        className={styles.campo}
        value={texto}
        placeholder={placeholder}
        onChange={(e) => setTexto(e.target.value)}
      />
      {texto.length > 0 && (
        <button type="button" className={`${styles.boton} ${styles.botonLimpiar}`} onClick={limpiar}>
          Limpiar
        </button>
      )}
      <button type="submit" className={`${styles.boton} ${styles.botonBuscar}`}>
        Buscar
      </button>
    </form>
  );
};
