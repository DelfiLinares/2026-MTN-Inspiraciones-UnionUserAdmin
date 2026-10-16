// Explorar (MVP), ruta "/": feed público con búsqueda, filtros y scroll infinito.
// Spec: HU-04, HU-06, RF-25, RF-27. Res.: D-08, A-10, A-12.
import React, { useMemo, useState } from "react";
import { MENSAJES_ERROR, useFeed, useSesion } from "@inspiraciones/shared";
import type { FiltrosFeed } from "@inspiraciones/shared";
import { BarraBusqueda } from "../components/BarraBusqueda";
import { Filtros, type ValoresFiltros } from "../components/Filtros";
import { GrillaPublicaciones } from "../components/GrillaPublicaciones";
import { publicacionesService } from "../servicios";

export default function ExplorarPage(): React.JSX.Element {
  const { usuario } = useSesion();
  const [texto, setTexto] = useState("");
  const [valores, setValores] = useState<ValoresFiltros>({});

  const filtros = useMemo<FiltrosFeed>(() => {
    const q = texto.trim();
    return {
      ...(q ? { q } : {}),
      ...(valores.categoria ? { categoria: valores.categoria } : {}),
      ...(valores.etiqueta ? { etiqueta: valores.etiqueta } : {}),
      ...(valores.tipo ? { tipo: valores.tipo } : {}),
    };
  }, [texto, valores]);

  const feed = useFeed({ filtros, publicacionesService });

  return (
    <section aria-labelledby="titulo-explorar">
      <h1 id="titulo-explorar">Explorar</h1>
      <BarraBusqueda valor={texto} onBuscar={setTexto} />
      <Filtros valores={valores} onCambiar={setValores} />
      <GrillaPublicaciones
        publicaciones={feed.publicaciones}
        usuarioActual={usuario}
        estaCargando={feed.estaCargando}
        estaCargandoSiguientePagina={feed.estaCargandoSiguientePagina}
        tieneSiguientePagina={feed.tieneSiguientePagina}
        tieneError={feed.tieneError}
        mensajeError={MENSAJES_ERROR[500]}
        onCargarMas={() => void feed.cargarMas()}
        onReintentar={() => void feed.recargar()}
      />
    </section>
  );
}
