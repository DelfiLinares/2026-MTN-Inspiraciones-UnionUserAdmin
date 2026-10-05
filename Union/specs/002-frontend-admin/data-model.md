# Phase 1 Data Model: Frontend Administrativo (Dominio de UI)

**Feature**: 002-frontend-admin | **Date**: 2026-10-01

Este documento describe el **modelo de dominio de UI** del `frontend-admin`: entidades orientadas a
objetos del lado cliente que encapsulan reglas de permisos y de transición de estado (Principio II
de la constitución), consumidas por la capa de `application/services` y usadas por la capa de
`presentation`. No representa el modelo de persistencia de la API Java (responsabilidad de una
iteración futura, fuera de alcance).

Trazabilidad: cada entidad y regla referencia el/los requisito(s) funcional(es) (`RF-XX`) y/o
historia de usuario (`HU-XX`) de `spec.md` que la originan.

## Enums / Value Objects

### RolUsuario
Valores: `USER`, `ADMIN`.
Uso: determina qué acciones administrativas están disponibles sobre un usuario objetivo y quién
puede ejecutarlas (RF-03, RF-06, RF-07, RF-21; HU-01, HU-02, HU-03, HU-10).

### EstadoCuentaUsuario
Valores: `ACTIVO`, `BANEADO`, `ELIMINADO`.
Uso: representa el estado administrativo de la cuenta de un usuario (RF-01, RF-02, RF-04; HU-01,
HU-02).

### EstadoPublicacion
Valores: `ACTIVA`, `REPORTADA`, `ELIMINADA`.
Uso: representa el estado de una publicación (RF-11, RF-12; HU-05).

### EstadoModeracion
Valores: `PENDIENTE`, `EN_REVISION`, `RESUELTO`, `DESESTIMADO`.
Uso: representa el estado de cierre de un reporte y determina si las acciones aceptar/rechazar
están habilitadas (RF-15, RF-16, RF-17, RF-18; HU-06, HU-07, HU-08).

### MotivoReporte
Valores: `SPAM`, `CONTENIDO_INAPROPIADO`, `PLAGIO_DERECHOS_AUTOR`, `VIOLENCIA`, `OTRO`.
Uso: clasifica el motivo de un reporte, usado en filtros y detalle de la pantalla de reportes
(RF-13, RF-14, RF-18; HU-06).

### PrioridadReporte
Valores: `ALTA`, `MEDIA`, `BAJA`.
Uso: indica la urgencia de revisión de un reporte, visible directamente en el listado para
priorizar el trabajo del administrador (RF-13, RF-14, RF-18, RNF-02; HU-06).

## Entidades de Dominio de UI

### Usuario
Representa a un usuario de la plataforma desde la perspectiva del frontend administrativo.

**Atributos**:
- `id: string`
- `nombre: string`
- `email: string`
- `rol: RolUsuario`
- `estadoCuenta: EstadoCuentaUsuario`
- `fechaRegistro: Date` (para búsqueda/orden, si la API futura lo provee)

**Reglas de negocio encapsuladas** (no anémico, Principio II):
- `puedeSerBaneado(): boolean` → `true` si `rol === USER` y `estadoCuenta === ACTIVO`. Un usuario con
  `rol === ADMIN` nunca puede ser baneado, sin excepción (cubre también al propio administrador
  autenticado; ver `research.md` §3). Referencia: RF-01, RF-03; HU-01.
- `puedeSerEliminado(): boolean` → `true` si `rol === USER` y `estadoCuenta !== ELIMINADO`. Un
  usuario con `rol === ADMIN` nunca puede ser eliminado, sin excepción. Referencia: RF-02, RF-03;
  HU-02.
- `puedeSerPromovidoAAdmin(): boolean` → `true` si `rol === USER`. Si `rol === ADMIN`, la operación
  se considera inválida (no-op) y no debe siquiera invocar la capa de servicios. Referencia: RF-06,
  RF-08; HU-03.
- Regla de **permiso de ejecución** (del actor, no del propio objeto `Usuario`): solo un `Usuario`
  autenticado cuyo `rol === ADMIN` puede invocar cualquiera de las acciones anteriores sobre otro
  `Usuario`. Esta verificación se modela en la capa de servicios (`UsuariosService`), no en la
  entidad, porque depende del **actor autenticado**, no del dato en sí. Referencia: RF-07, RF-21;
  HU-10.

**Relaciones**: Un `Usuario` puede ser autor de múltiples `Publicacion`.

### Publicacion
Representa una creación compartida por un usuario (dibujo, música, escultura, etc.), desde la
perspectiva de gestión administrativa.

**Atributos**:
- `id: string`
- `autorId: string`
- `titulo: string`
- `descripcion: string`
- `estado: EstadoPublicacion`
- `fechaCreacion: Date`

**Reglas de negocio encapsuladas**:
- `puedeSerEditada(): boolean` → `true` siempre que `estado !== ELIMINADA` (una publicación ya
  eliminada no admite edición desde este frontend). Referencia: RF-09; HU-04.
- `puedeSerEliminada(): boolean` → `true` siempre, independientemente del `estado` actual (incluso
  una publicación ya `REPORTADA` puede eliminarse); una publicación ya `ELIMINADA` puede volver a
  invocarse como no-op idempotente del lado del backend futuro, pero el frontend igual deshabilita
  visualmente la acción si `estado === ELIMINADA` para evitar confusión. Referencia: RF-10, RF-12;
  HU-05.
- `estaActiva(): boolean` → `estado === ACTIVA`.
- `estaReportada(): boolean` → `estado === REPORTADA`.
- `reactivarSiNoQuedanReportesPendientes(hayOtrosReportesPendientesOEnRevision: boolean): void` →
  si `estado === REPORTADA` y `hayOtrosReportesPendientesOEnRevision === false`, cambia `estado` a
  `ACTIVA`; si `hayOtrosReportesPendientesOEnRevision === true`, no modifica el estado. Invocado por
  `ReportesService` al rechazar un reporte (resuelto, Clarifications Session 2026-10-01). Referencia:
  AC-08.6; HU-08.

**Relaciones**: Una `Publicacion` puede tener uno o más `Reporte` asociados; pertenece a un
`Usuario` autor (no necesariamente gestionable desde esta misma pantalla).

### Reporte
Representa la denuncia de una publicación o usuario, pendiente de revisión administrativa.

**Atributos**:
- `id: string`
- `publicacionId: string`
- `reportanteId: string`
- `motivo: MotivoReporte`
- `prioridad: PrioridadReporte`
- `estadoModeracion: EstadoModeracion`
- `fechaCreacion: Date`

**Reglas de negocio encapsuladas**:
- `estaPendiente(): boolean` → `estadoModeracion === PENDIENTE`. Referencia: HU-06.
- `puedeAceptarse(): boolean` → `estadoModeracion === PENDIENTE || estadoModeracion === EN_REVISION`.
  Referencia: RF-15, RF-17; HU-07.
- `puedeRechazarse(): boolean` → `estadoModeracion === PENDIENTE || estadoModeracion === EN_REVISION`.
  Referencia: RF-16, RF-17; HU-08.
- `esEstadoFinal(): boolean` → `estadoModeracion === RESUELTO || estadoModeracion === DESESTIMADO`.
  Cuando es `true`, `puedeAceptarse()` y `puedeRechazarse()` devuelven `false` de forma permanente
  (sin mecanismo de reversión). Referencia: RF-17; CB-03.
- `requiereConfirmacionParaAceptar(): boolean` → siempre `false`. Aceptar un reporte (cambiar su
  estado a `RESUELTO`) nunca requiere confirmación explícita por sí solo; si el administrador
  encadena una eliminación de publicación en el mismo flujo, esa acción adicional usa su propia
  regla de confirmación (`Publicacion` no expone excepción: toda eliminación de publicación requiere
  confirmación). Resuelto, Clarifications Session 2026-10-05 (A2). Referencia: RF-23; AC-07.3.
- `requiereConfirmacionParaRechazar(): boolean` → siempre `true`. Rechazar un reporte sí requiere
  confirmación explícita, ya que puede reactivar automáticamente la publicación asociada
  (`Publicacion.reactivarSiNoQuedanReportesPendientes`). Referencia: RF-23; AC-08.3.

**Relaciones**: Pertenece a una `Publicacion`; referencia a un `Usuario` reportante (no gestionable
desde esta pantalla).

## Objetos de Aplicación (capa `application/dto/`, no-dominio, soporte de casos de uso)

> **Ubicación confirmada** (Clarifications Session 2026-10-01): estos objetos viven en
> `src/application/dto/`, no en `src/domain/`, para mantener la separación entre entidades de
> dominio persistente y estructuras de transporte/resultado de casos de uso (ver `research.md` §10).

### ResultadoExportacion
Representa el resultado de una solicitud de exportación de reportes (HU-09, RF-19, RF-20). No es una
entidad de dominio persistente; es un objeto de resultado de un caso de uso.

**Atributos**:
- `exitoso: boolean`
- `urlDescarga?: string` (presente solo si `exitoso === true`; tratada como opaca, ver `research.md`
  §5)
- `nombreArchivoSugerido?: string` (opcional)
- `mensajeError?: string` (presente solo si `exitoso === false`)

### FiltroReportes
Value object para encapsular los criterios de filtrado del listado de reportes (RF-14).

**Atributos**:
- `estadoModeracion?: EstadoModeracion`
- `prioridad?: PrioridadReporte`
- `motivo?: MotivoReporte`

## Resumen de Trazabilidad Entidad → Requisitos

| Entidad / Enum | Requisitos funcionales | Historias de usuario |
|---|---|---|
| `Usuario` + `RolUsuario` + `EstadoCuentaUsuario` | RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-08, RF-21 | HU-01, HU-02, HU-03, HU-10 |
| `Publicacion` + `EstadoPublicacion` | RF-09, RF-10, RF-11, RF-12 | HU-04, HU-05, HU-08 (reactivación) |
| `Reporte` + `EstadoModeracion` + `MotivoReporte` + `PrioridadReporte` | RF-13, RF-14, RF-15, RF-16, RF-17, RF-18, RF-19, RF-20, RF-23 | HU-06, HU-07, HU-08, HU-09 |
| `ResultadoExportacion` | RF-19, RF-20 | HU-09 |
| `FiltroReportes` | RF-14 | HU-06 |

**No se implementó código como parte de este documento de modelado.**
