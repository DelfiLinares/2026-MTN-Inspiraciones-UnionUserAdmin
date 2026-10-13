/**
 * TarjetaDesafio: tarjeta de un ítem del listado con nombre, foto principal,
 * ámbitos, fechas y estado (HU-09, RF-16).
 *
 * Tarea: T047
 * Depende de: T046 (EstadoDesafioBadge)
 *
 * Solo presenta los datos de `DesafioResumen`; el estado lo entrega la API (RF-06).
 */

import type { DesafioResumen } from "../application/ports/tiposDesafios";
import { EstadoDesafioBadge } from "./EstadoDesafioBadge";

export interface TarjetaDesafioProps {
  readonly desafio: DesafioResumen;
  readonly className?: string;
}

const formatoFecha = new Intl.DateTimeFormat("es", { dateStyle: "medium" });

export function TarjetaDesafio({ desafio, className }: TarjetaDesafioProps) {
  const clases = ["tarjeta-desafio", className].filter(Boolean).join(" ");

  return (
    <article className={clases} data-desafio-id={desafio.id}>
      <img
        className="tarjeta-desafio__foto"
        src={desafio.fotoPrincipal.url}
        alt={`Foto principal de ${desafio.nombre}`}
        loading="lazy"
      />
      <div className="tarjeta-desafio__cuerpo">
        <h3 className="tarjeta-desafio__nombre">{desafio.nombre}</h3>
        <EstadoDesafioBadge estado={desafio.estado} />
        <ul className="tarjeta-desafio__ambitos" aria-label="Ámbitos">
          {desafio.ambitos.map((ambito) => (
            <li key={ambito}>{ambito}</li>
          ))}
        </ul>
        <p className="tarjeta-desafio__fechas">
          <time dateTime={desafio.fechaInicio.toISOString()}>
            {formatoFecha.format(desafio.fechaInicio)}
          </time>
          {" – "}
          <time dateTime={desafio.fechaFin.toISOString()}>
            {formatoFecha.format(desafio.fechaFin)}
          </time>
        </p>
      </div>
    </article>
  );
}
