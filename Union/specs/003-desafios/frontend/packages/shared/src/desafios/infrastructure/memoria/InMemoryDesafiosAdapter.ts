/**
 * InMemoryDesafiosAdapter: Implementación del puerto en memoria
 *
 * Almacena todos los datos en memoria sin persistencia real.
 * Implementa el contrato completo de DesafiosPort.
 *
 * Fuentes de verdad:
 * - spec.md: Criterios de aceptación
 * - data-model.md: Entidades y reglas de dominio
 * - research.md: Decisión de usar adaptador en memoria (sección 3)
 * - tasks.md: T027
 */

import { Desafio, type DatosDesafio } from "../../domain/entidades/Desafio";
import { SolicitudDesafio } from "../../domain/entidades/SolicitudDesafio";
import { RespuestaDesafio } from "../../domain/entidades/RespuestaDesafio";
import { AmbitoDesafio } from "../../domain/AmbitoDesafio";
import { EstadoSolicitudDesafio } from "../../domain/enums/EstadoSolicitudDesafio";
import { RangoFechas } from "../../domain/RangoFechas";
import type { DesafiosPort, FiltrosDesafios } from "../../application/ports/DesafiosPort";
import type { DesafioResumen, Pagina, ParametrosPagina } from "../../application/ports/tiposDesafios";

/**
 * Almacén en memoria de desafíos.
 *
 * Estructura: Map de id -> Desafio
 * Se usa Map para acceso rápido por id e iteración.
 */
class AlmacenDesafios {
  private desafios = new Map<string, Desafio>();
  private nextId = 1;

  crear(datos: DatosDesafio, tieneRespuestas: boolean = false): Desafio {
    const id = `desafio-${this.nextId++}`;
    const desafio = new Desafio({
      id,
      nombre: datos.nombre,
      descripcionLarga: datos.descripcionLarga,
      fotos: datos.fotos,
      rango: new RangoFechas(datos.fechaInicio, datos.fechaFin),
      ambitos: datos.ambitos,
      tieneRespuestas,
      version: 1,
      eliminado: false,
    });
    this.desafios.set(id, desafio);
    return desafio;
  }

  obtener(id: string): Desafio | undefined {
    return this.desafios.get(id);
  }

  actualizar(id: string, datos: DatosDesafio, version: number): Desafio {
    const desafio = this.desafios.get(id);
    if (!desafio) {
      throw new Error(`Desafío ${id} no encontrado`);
    }
    if (desafio.version !== version) {
      throw new Error(`Conflicto de versión: esperaba ${desafio.version}, recibí ${version}`);
    }
    const actualizado = new Desafio({
      id,
      nombre: datos.nombre,
      descripcionLarga: datos.descripcionLarga,
      fotos: datos.fotos,
      rango: new RangoFechas(datos.fechaInicio, datos.fechaFin),
      ambitos: datos.ambitos,
      tieneRespuestas: desafio.tieneRespuestas,
      version: version + 1,
      eliminado: false,
    });
    this.desafios.set(id, actualizado);
    return actualizado;
  }

  marcarEliminado(id: string): void {
    const desafio = this.desafios.get(id);
    if (!desafio) {
      throw new Error(`Desafío ${id} no encontrado`);
    }
    const eliminado = new Desafio({
      id: desafio.id,
      nombre: desafio.nombre,
      descripcionLarga: desafio.descripcionLarga,
      fotos: desafio.fotos,
      rango: desafio.rango,
      ambitos: desafio.ambitos,
      tieneRespuestas: desafio.tieneRespuestas,
      version: desafio.version + 1,
      eliminado: true,
    });
    this.desafios.set(id, eliminado);
  }

  listar(filtros?: FiltrosDesafios): Desafio[] {
    let resultado = Array.from(this.desafios.values());

    // Filtrar eliminados (CB-01)
    resultado = resultado.filter((d) => !d.eliminado);

    // Filtrar por estados
    if (filtros?.estados && filtros.estados.length > 0) {
      resultado = resultado.filter((d) =>
        filtros.estados!.includes(d.estado(new Date(), { finInclusivo: false }))
      );
    }

    // Filtrar por ámbitos
    if (filtros?.ambitos && filtros.ambitos.length > 0) {
      resultado = resultado.filter((d) =>
        d.ambitos.some((a) => filtros.ambitos!.includes(a.valor))
      );
    }

    return resultado;
  }
}

/**
 * Almacén en memoria de solicitudes.
 */
class AlmacenSolicitudes {
  private solicitudes = new Map<string, SolicitudDesafio>();
  private nextId = 1;

  crear(estado: EstadoSolicitudDesafio, autorId: string): SolicitudDesafio {
    const id = `solicitud-${this.nextId++}`;
    const solicitud = new SolicitudDesafio({
      id,
      autorId,
      estado,
      version: 1,
    });
    this.solicitudes.set(id, solicitud);
    return solicitud;
  }

  obtener(id: string): SolicitudDesafio | undefined {
    return this.solicitudes.get(id);
  }

  actualizar(
    id: string,
    version: number,
    cambios: { estado?: EstadoSolicitudDesafio }
  ): SolicitudDesafio {
    const solicitud = this.solicitudes.get(id);
    if (!solicitud) {
      throw new Error(`Solicitud ${id} no encontrada`);
    }
    if (solicitud.version !== version) {
      throw new Error(`Conflicto de versión: esperaba ${solicitud.version}, recibí ${version}`);
    }
    const actualizado = new SolicitudDesafio({
      id,
      autorId: solicitud.autorId,
      estado: cambios.estado ?? solicitud.estado,
      version: version + 1,
    });
    this.solicitudes.set(id, actualizado);
    return actualizado;
  }

  eliminar(id: string): void {
    this.solicitudes.delete(id);
  }

  listar(filtro?: { estado?: EstadoSolicitudDesafio }): SolicitudDesafio[] {
    let resultado = Array.from(this.solicitudes.values());
    if (filtro?.estado) {
      resultado = resultado.filter((s) => s.estado === filtro.estado);
    }
    return resultado;
  }
}

/**
 * Almacén en memoria de respuestas.
 */
class AlmacenRespuestas {
  private respuestas = new Map<string, RespuestaDesafio>();
  private nextId = 1;

  crear(desafioId: string, autorId: string): RespuestaDesafio {
    const id = `respuesta-${this.nextId++}`;
    const respuesta = new RespuestaDesafio({
      id,
      desafioId,
      autorId,
    });
    this.respuestas.set(id, respuesta);
    return respuesta;
  }

  obtener(id: string): RespuestaDesafio | undefined {
    return this.respuestas.get(id);
  }

  eliminar(id: string): void {
    this.respuestas.delete(id);
  }

  listarPorDesafio(desafioId: string): RespuestaDesafio[] {
    return Array.from(this.respuestas.values()).filter((r) => r.desafioId === desafioId);
  }
}

/**
 * Paginador por cursor.
 *
 * Dado un array, retorna una página con items y siguienteCursor.
 * Para paginación estable con datos dinámicos (research.md, sección 5).
 */
function paginar<T>(
  items: T[],
  parametros: ParametrosPagina,
  clave: (item: T) => string
): Pagina<T> {
  const limite = parametros.limite ?? 10;
  let inicio = 0;

  // Si hay cursor, buscar dónde empezar
  if (parametros.cursor) {
    for (let i = 0; i < items.length; i++) {
      if (clave(items[i]) === parametros.cursor) {
        inicio = i + 1;
        break;
      }
    }
  }

  const pagina = items.slice(inicio, inicio + limite);
  const siguienteCursor = inicio + limite < items.length ? clave(items[inicio + limite]) : null;

  return {
    items: pagina,
    siguienteCursor,
  };
}

/**
 * InMemoryDesafiosAdapter: Adaptador en memoria del puerto DesafiosPort.
 *
 * Responsabilidades:
 * - Mantener tres almacenes en memoria (desafíos, solicitudes, respuestas).
 * - Implementar todas las operaciones del puerto.
 * - Paginación por cursor (research.md, sección 5).
 * - Filtros (research.md, sección 6).
 * - Control de versión (CB-02).
 * - Errores para eliminados (CB-01).
 *
 * No cumple:
 * - Persistencia real (no hay base de datos).
 * - Usuarios y roles reales (los casos de uso verifican sesión).
 * - Contenido de respuestas (pendiente A-22).
 * - Cuerpo de solicitudes (pendiente A-08).
 */
export class InMemoryDesafiosAdapter implements DesafiosPort {
  private almacenDesafios = new AlmacenDesafios();
  private almacenSolicitudes = new AlmacenSolicitudes();
  private almacenRespuestas = new AlmacenRespuestas();
  private ambitos: AmbitoDesafio[] = [];

  constructor() {
    // Inicializar ámbitos de ejemplo (provisional hasta A-02)
    this.ambitos = [
      new AmbitoDesafio("Pintura"),
      new AmbitoDesafio("Escultura"),
      new AmbitoDesafio("Fotografía"),
      new AmbitoDesafio("Dibujo"),
      new AmbitoDesafio("Diseño Gráfico"),
    ];
  }

  async listarAmbitos(): Promise<AmbitoDesafio[]> {
    return this.ambitos;
  }

  async listarDesafios(
    filtros: FiltrosDesafios,
    pagina: ParametrosPagina
  ): Promise<Pagina<DesafioResumen>> {
    const desafios = this.almacenDesafios.listar(filtros);
    const resumenes = desafios.map((d) => ({
      id: d.id,
      nombre: d.nombre,
      fotoPrincipal: d.fotos.find((f) => f.principal)!,
      ambitos: d.ambitos.map((a) => a.valor),
      fechaInicio: d.rango.inicio,
      fechaFin: d.rango.fin,
      estado: d.estado(new Date(), { finInclusivo: false }),
    }));

    return paginar(resumenes, pagina, (d) => d.id);
  }

  async obtenerDesafio(id: string): Promise<Desafio> {
    const desafio = this.almacenDesafios.obtener(id);
    if (!desafio || desafio.eliminado) {
      throw new Error(`Desafío ${id} no encontrado`);
    }
    return desafio;
  }

  async publicarDesafio(datos: DatosDesafio): Promise<Desafio> {
    return this.almacenDesafios.crear(datos);
  }

  async editarDesafio(id: string, datos: DatosDesafio, version: number): Promise<Desafio> {
    return this.almacenDesafios.actualizar(id, datos, version);
  }

  async eliminarDesafio(id: string): Promise<void> {
    this.almacenDesafios.marcarEliminado(id);
  }

  async listarRespuestas(
    desafioId: string,
    pagina: ParametrosPagina
  ): Promise<Pagina<RespuestaDesafio>> {
    const respuestas = this.almacenRespuestas.listarPorDesafio(desafioId);
    return paginar(respuestas, pagina, (r) => r.id);
  }

  async responderDesafio(desafioId: string): Promise<RespuestaDesafio> {
    // En el adaptador en memoria, usamos un usuario de prueba
    return this.almacenRespuestas.crear(desafioId, "usuario-demo");
  }

  async editarRespuesta(respuestaId: string): Promise<RespuestaDesafio> {
    const respuesta = this.almacenRespuestas.obtener(respuestaId);
    if (!respuesta) {
      throw new Error(`Respuesta ${respuestaId} no encontrada`);
    }
    // En el adaptador en memoria, solo retornamos la respuesta existente
    return respuesta;
  }

  async eliminarRespuesta(respuestaId: string): Promise<void> {
    this.almacenRespuestas.eliminar(respuestaId);
  }

  async listarSolicitudes(
    filtros: { readonly estado?: EstadoSolicitudDesafio },
    pagina: ParametrosPagina
  ): Promise<Pagina<SolicitudDesafio>> {
    const solicitudes = this.almacenSolicitudes.listar(filtros);
    return paginar(solicitudes, pagina, (s) => s.id);
  }

  async proponerSolicitud(): Promise<SolicitudDesafio> {
    return this.almacenSolicitudes.crear(EstadoSolicitudDesafio.PENDIENTE, "usuario-demo");
  }

  async editarSolicitud(id: string, version: number): Promise<SolicitudDesafio> {
    const solicitud = this.almacenSolicitudes.obtener(id);
    if (!solicitud) {
      throw new Error(`Solicitud ${id} no encontrada`);
    }
    return this.almacenSolicitudes.actualizar(id, version, {});
  }

  async eliminarSolicitud(id: string): Promise<void> {
    this.almacenSolicitudes.eliminar(id);
  }

  async aprobarSolicitud(id: string): Promise<SolicitudDesafio> {
    const solicitud = this.almacenSolicitudes.obtener(id);
    if (!solicitud) {
      throw new Error(`Solicitud ${id} no encontrada`);
    }
    return this.almacenSolicitudes.actualizar(id, solicitud.version, {
      estado: EstadoSolicitudDesafio.APROBADA,
    });
  }

  async rechazarSolicitud(id: string): Promise<SolicitudDesafio> {
    const solicitud = this.almacenSolicitudes.obtener(id);
    if (!solicitud) {
      throw new Error(`Solicitud ${id} no encontrada`);
    }
    return this.almacenSolicitudes.actualizar(id, solicitud.version, {
      estado: EstadoSolicitudDesafio.RECHAZADA,
    });
  }
}
