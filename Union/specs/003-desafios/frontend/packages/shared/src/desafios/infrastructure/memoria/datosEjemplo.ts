/**
 * Datos de ejemplo para el adaptador en memoria (T028)
 *
 * Proporciona datos iniciales para desarrollar y probar el módulo de desafíos
 * sin requerir una base de datos real.
 *
 * NOTA: Los ámbitos aquí son provisionales hasta resolver A-02 (catálogo de ámbitos).
 * En producción, estos datos provendrían de la API.
 *
 * Fuentes de verdad:
 * - spec.md: Criterios de aceptación y historias de usuario
 * - data-model.md: Estructura de entidades
 * - tasks.md: T028
 */

import { Foto, FormatoFoto } from "../../domain/Foto";
import { AmbitoDesafio } from "../../domain/AmbitoDesafio";
import { RangoFechas } from "../../domain/RangoFechas";
import type { DatosDesafio } from "../../domain/entidades/Desafio";

/**
 * Ámbitos de ejemplo (provisionales A-02).
 * 
 * En producción, se cargan desde la API mediante listarAmbitos().
 * Se marcan aquí solo para desarrollo local.
 */
export const ambitosEjemplo = [
  new AmbitoDesafio("Pintura"),
  new AmbitoDesafio("Escultura"),
  new AmbitoDesafio("Fotografía"),
  new AmbitoDesafio("Dibujo"),
  new AmbitoDesafio("Diseño Gráfico"),
  new AmbitoDesafio("Cine"),
  new AmbitoDesafio("Performance"),
];

/**
 * Fotos de ejemplo.
 * 
 * Usa URLs de ejemplo. En producción, estas serían archivos subidos a un CDN.
 */
const fotosEjemplo = {
  paisaje: [
    new Foto(
      "foto-1",
      "https://via.placeholder.com/800x600?text=Paisaje+Montaña",
      FormatoFoto.JPEG,
      true
    ),
    new Foto(
      "foto-2",
      "https://via.placeholder.com/800x600?text=Atardecer",
      FormatoFoto.PNG,
      false
    ),
    new Foto(
      "foto-3",
      "https://via.placeholder.com/800x600?text=Bosque",
      FormatoFoto.JPEG,
      false
    ),
  ],
  retrato: [
    new Foto(
      "foto-4",
      "https://via.placeholder.com/800x600?text=Retrato+1",
      FormatoFoto.PNG,
      true
    ),
    new Foto(
      "foto-5",
      "https://via.placeholder.com/800x600?text=Retrato+2",
      FormatoFoto.JPEG,
      false
    ),
  ],
  abstracto: [
    new Foto(
      "foto-6",
      "https://via.placeholder.com/800x600?text=Arte+Abstracto",
      FormatoFoto.JPEG,
      true
    ),
  ],
  urbano: [
    new Foto(
      "foto-7",
      "https://via.placeholder.com/800x600?text=Fotografía+Urbana",
      FormatoFoto.PNG,
      true
    ),
    new Foto(
      "foto-8",
      "https://via.placeholder.com/800x600?text=Calle+Noche",
      FormatoFoto.JPEG,
      false
    ),
    new Foto(
      "foto-9",
      "https://via.placeholder.com/800x600?text=Edificios",
      FormatoFoto.PNG,
      false
    ),
  ],
};

/**
 * Desafíos de ejemplo.
 *
 * Cubre diferentes estados:
 * - PROGRAMADO: fechas futuras (aún no comienza)
 * - ACTIVO: en progreso ahora
 * - FINALIZADO: fechas pasadas (ya terminó)
 * - ELIMINADO: marcado como eliminado (solo en base de datos)
 *
 * Referencia: data-model.md, sección 4.1
 */
export const desafiosEjemplo = {
  activo: {
    nombre: "Retrato en Blanco y Negro",
    descripcionLarga:
      "Crea una serie de retratos en blanco y negro que exploren la luz y la sombra. " +
      "Buscamos capturar la esencia de los sujetos a través de juegos de contraste. " +
      "Pueden ser fotografías o dibujos.",
    fotos: fotosEjemplo.retrato,
    ambitos: [new AmbitoDesafio("Fotografía"), new AmbitoDesafio("Dibujo")],
    fechaInicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Hace una semana
    fechaFin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // En dos semanas
  } as DatosDesafio,

  programado: {
    nombre: "Paisajes de Montaña",
    descripcionLarga:
      "Explora la majestuosidad de las montañas a través de la pintura. " +
      "Puedes usar cualquier técnica: óleo, acrílico, acuarela o pastel. " +
      "Enfócate en capturar el movimiento y la profundidad del paisaje.",
    fotos: fotosEjemplo.paisaje,
    ambitos: [new AmbitoDesafio("Pintura")],
    fechaInicio: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // En un mes
    fechaFin: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // En dos meses
  } as DatosDesafio,

  finalizado: {
    nombre: "Escultura Urbana",
    descripcionLarga:
      "Crea esculturas que dialogen con espacios urbanos. " +
      "Pueden ser piezas grandes o pequeñas, temporales o permanentes. " +
      "Este desafío ya finalizó, pero puedes ver las respuestas de otros artistas.",
    fotos: fotosEjemplo.abstracto,
    ambitos: [new AmbitoDesafio("Escultura"), new AmbitoDesafio("Performance")],
    fechaInicio: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // Hace dos meses
    fechaFin: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Hace diez días
  } as DatosDesafio,

  conRespuestas: {
    nombre: "Fotografía de la Calle",
    descripcionLarga:
      "Captura momentos auténticos en espacios urbanos. " +
      "Busca historias visuales, personas, arquitectura o detalles inesperados. " +
      "Este desafío ya tiene varias respuestas interesantes.",
    fotos: fotosEjemplo.urbano,
    ambitos: [new AmbitoDesafio("Fotografía")],
    fechaInicio: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Hace dos semanas
    fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En una semana
  } as DatosDesafio,
};

/**
 * Inyector de datos de ejemplo.
 *
 * Llena el adaptador en memoria con datos iniciales para desarrollo.
 * Se llama una única vez al crear el adaptador.
 *
 * Parámetro: adaptador que implementa DesafiosPort
 * Efecto: crea desafíos, solicitudes y respuestas en el almacén interno
 */
export async function inyectarDatosEjemplo(adaptador: any): Promise<void> {
  // Publicar desafíos
  const desafioActivo = await adaptador.publicarDesafio(desafiosEjemplo.activo);
  const desafioProgramado = await adaptador.publicarDesafio(desafiosEjemplo.programado);
  const desafioFinalizado = await adaptador.publicarDesafio(desafiosEjemplo.finalizado);
  const desafioConRespuestas = await adaptador.publicarDesafio(
    desafiosEjemplo.conRespuestas
  );

  // Crear solicitudes de ejemplo
  // Solicitud pendiente
  const solicitudPendiente = await adaptador.proponerSolicitud();

  // Solicitud aprobada
  const solicitudAprobada = await adaptador.proponerSolicitud();
  await adaptador.aprobarSolicitud(solicitudAprobada.id);

  // Solicitud rechazada
  const solicitudRechazada = await adaptador.proponerSolicitud();
  await adaptador.rechazarSolicitud(solicitudRechazada.id);

  // Crear respuestas de ejemplo para desafío con respuestas
  await adaptador.responderDesafio(desafioConRespuestas.id);
  await adaptador.responderDesafio(desafioConRespuestas.id);
}
