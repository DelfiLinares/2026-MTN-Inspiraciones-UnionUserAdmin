# Data Model (UI Domain): Plataforma Unificada — Frontend Usuario + Frontend Admin

**Input**: `spec.md`, `plan.md` (Union/specs/001-plataforma-unificada)

Este documento define formalmente las entidades de dominio de UI, sus propiedades, métodos
encapsulados y enums, para ambos frontends. Ninguna de estas entidades representa persistencia
real: son modelos livianos del lado cliente que encapsulan reglas de visualización, permisos de UI
y validaciones de estado (Principio II de la constitución), construidos a partir de los datos que
devuelve la API.

---

## Enums Compartidos / Frontend de Usuario

### `TipoContenido`
```ts
enum TipoContenido {
  IMAGEN = "IMAGEN",
  VIDEO = "VIDEO",
  MUSICA = "MUSICA",
  TUTORIAL = "TUTORIAL",
  ESCULTURA = "ESCULTURA",
  DIGITAL = "DIGITAL",
}
```
Trazabilidad: RF-21 (tipos IMAGEN, VIDEO, MUSICA, TUTORIAL definidos en `spec.md`); `ESCULTURA` y
`DIGITAL` se incorporan por indicación explícita del contexto técnico de esta planificación como
extensión del enum sin contradecir la spec (la spec no cierra la lista a exactamente 4 valores en
su texto narrativo de "tipos de contenido artístico").

### `EstadoPublicacion`
```ts
enum EstadoPublicacion {
  ACTIVA = "ACTIVA",
  REPORTADA = "REPORTADA",
  ELIMINADA = "ELIMINADA",
}
```
Trazabilidad: RF-29, sección 6 de `spec.md`.

### `TipoFiltro`
```ts
enum TipoFiltro {
  ESTILO = "estilo",
  TECNICA = "tecnica",
  TIPO_ARTE = "tipo_arte",
  DISTANCIA = "distancia",
}
```
Trazabilidad: RF-40.

### `RolUsuario` (vista del frontend de usuario)
```ts
enum RolUsuario {
  USER = "USER",
}
```
Trazabilidad: RF-15 (el frontend de usuario nunca opera con rol ADMIN). El valor `ADMIN` existe a
nivel de plataforma pero no se modela como variante operable dentro de `frontend/` — ver **A14**
en `spec.md` (ambigüedad sobre si un ADMIN conserva capacidades de USER).

### `MotivoReporte`
```ts
interface MotivoReporte {
  codigo: string;   // valor cerrado provisto por el backend (vocabulario controlado)
  etiqueta: string; // texto a mostrar en el selector de motivo
}
```
Trazabilidad: RF-34. El conjunto exacto de códigos lo provee el backend (ver `contracts/`); en
`frontend-admin/` el mismo concepto se modela como enum cerrado (`MotivoReporte`, ver más abajo) por
ser consumido allí como dato ya cerrado en el detalle del reporte.

---

## Enums de Moderación/Administración

### `RolUsuario` (vista del frontend de administración)
```ts
enum RolUsuario {
  USER = "USER",
  ADMIN = "ADMIN",
}
```
Trazabilidad: RF-12, RF-59 (distinción de rol necesaria para gestión de usuarios y promoción).

### `EstadoCuentaUsuario`
```ts
enum EstadoCuentaUsuario {
  ACTIVO = "ACTIVO",
  BANEADO = "BANEADO",
  ELIMINADO = "ELIMINADO",
}
```
Trazabilidad: RF-54 (indicador "usuarios activos" = `estadoCuenta = ACTIVO`), RF-57/RF-58
(banear/eliminar). Comportamiento detallado de cuentas BANEADO/ELIMINADO marcado como **A10** en
`spec.md` (no definido en los documentos originales).

### `EstadoModeracion`
```ts
enum EstadoModeracion {
  PENDIENTE = "PENDIENTE",
  EN_REVISION = "EN_REVISION",
  RESUELTO = "RESUELTO",
  DESESTIMADO = "DESESTIMADO",
}
```
Trazabilidad: representa el **estado del reporte** (no de la publicación), cubriendo RF-64
("resuelto sin eliminar publicación" → mapea a `RESUELTO`; un reporte descartado por no ameritar
acción → `DESESTIMADO`). El nombre exacto de este enum no estaba cerrado en ningún specify
original (ver **A2** en `spec.md`); se fija aquí como decisión de diseño técnico a validar con
backend.

### `MotivoReporte` (enum cerrado, vista administración)
```ts
enum MotivoReporte {
  SPAM = "SPAM",
  CONTENIDO_INAPROPIADO = "CONTENIDO_INAPROPIADO",
  PLAGIO_DERECHOS_AUTOR = "PLAGIO_DERECHOS_AUTOR",
  VIOLENCIA = "VIOLENCIA",
  OTRO = "OTRO",
}
```
Trazabilidad: RF-34, RF-62 (detalle del reporte muestra motivo).

### `EstadoDesafioPropuesto`
```ts
enum EstadoDesafioPropuesto {
  PENDIENTE = "PENDIENTE",
  APROBADO = "APROBADO",
  RECHAZADO = "RECHAZADO",
}
```
Trazabilidad: RF-70, sección 6 de `spec.md`. Transición final: `APROBADO`/`RECHAZADO` no puede
revertirse (CB-15).

### `PrioridadReporte`
```ts
enum PrioridadReporte {
  ALTA = "ALTA",
  MEDIA = "MEDIA",
  BAJA = "BAJA",
}
```
Trazabilidad: RF-65. Agregado en sesión de clarificación 2026-09-17 para reemplazar la unión de
strings previa (`"ALTA"|"MEDIA"|"BAJA"`) por un enum cerrado, conforme al Principio VII de la
constitución (enums/value objects para valores cerrados).

---

## Entidades — Frontend de Usuario

### `Publicacion`

**Propiedades**:
- `id: string`
- `autorId: string`
- `tipoContenido: TipoContenido`
- `estado: EstadoPublicacion`
- `tags: string[]` (máx. 10, del vocabulario controlado)
- `cantidadLikes: number`
- `likeDelUsuarioActual: boolean`
- `reportadaPorUsuarioActual: boolean` (estado de reporte **propio**, no global — ver RF-35)

**Métodos** (encapsulan reglas de negocio de cliente, Principio II):
- `esPropia(usuarioActualId: string): boolean`
- `puedeDarLike(usuarioActualId: string, autenticado: boolean): boolean` → `false` si es propia o
  no autenticado (RF-32, RF-13).
- `puedeReportar(usuarioActualId: string, autenticado: boolean): boolean` → `false` si es propia,
  ya reportada por el usuario actual, o no autenticado (RF-33, RF-35).
- `puedeEditar(usuarioActualId: string): boolean` → solo si es propia.
- `puedeEliminar(usuarioActualId: string): boolean` → solo si es propia (la eliminación
  administrativa se modela aparte en `PublicacionModeracion`).
- `toggleLike(): Publicacion` → aplica cambio optimista sobre `cantidadLikes`/`likeDelUsuarioActual`
  (RF-30); el rollback ante error lo ejecuta el servicio que invoca este método.

### `Usuario`

**Propiedades**:
- `id: string`
- `nombre: string`, `apellido: string`, `bio?: string`, `fotoUrl?: string`
- `rol: RolUsuario`
- `siguiendoAlUsuarioActual: boolean` (si el usuario actual sigue a este perfil)
- `cantidadSeguidores: number`

**Métodos**:
- `esUsuarioActual(usuarioActualId: string): boolean`
- `puedeMostrarBotonSeguir(usuarioActualId: string): boolean` → `false` si `esUsuarioActual` (RF-37).
- `toggleSeguir(): Usuario` → actualización optimista de `cantidadSeguidores` (RF-39).

### `Filtro`

**Propiedades**:
- `texto?: string`
- `estilo?: string`
- `tecnica?: string`
- `tipoContenido?: TipoContenido`
- `distanciaKm?: number`
- `geolocalizacionActiva: boolean`

**Métodos**:
- `distanciaHabilitada(): boolean` → depende de `geolocalizacionActiva` (RF-45).
- `activos(): { tipo: TipoFiltro; valor: string }[]` → lista de chips removibles (RF-42).
- `aQueryParams(): Record<string, string>` → serialización para la API (RF-40), única fuente de
  verdad de cómo un `Filtro` se traduce en parámetros de consulta.
- `quitar(tipo: TipoFiltro): Filtro` → retorna una nueva instancia sin ese filtro activo.

### `Carpeta`

**Propiedades**:
- `id: string`
- `nombre: string`
- `cantidadPosts: number`
- `deLaCarpetaDelUsuarioActual: boolean` (si pertenece al usuario que la está viendo)

**Métodos**:
- `puedeEliminarse(usuarioActualId: string, propietarioId: string): boolean` → solo el dueño.
- `puedeRenombrarse(usuarioActualId: string, propietarioId: string): boolean` → solo el dueño.

**Regla de colección** (aplicada en el servicio, no en la entidad individual): el conjunto de
carpetas de un usuario está limitado a 100 (RF-52); la validación de "límite alcanzado" se resuelve
en `services/carpetaService.ts` sobre la colección completa, no en esta entidad individual.

### `Desafio`

**Propiedades**:
- `id: string`
- `titulo: string`
- `descripcion: string`
- `activo: boolean`
- `completadoPorUsuarioActual: boolean`

**Métodos**:
- `puedeParticiparUsuarioActual(autenticado: boolean): boolean` → requiere sesión.

Nota: `Desafio` (participación del usuario) es una entidad distinta de `DesafioPropuesto`
(administración); representan dos vistas del mismo concepto de dominio en dos frontends diferentes,
conforme al Principio IV (separación de aplicaciones) de la constitución.

---

## Entidades — Frontend de Administración

### `UsuarioAdmin`

**Propiedades**:
- `id: string`
- `nombre: string`, `mail: string`
- `rol: RolUsuario`
- `estadoCuenta: EstadoCuentaUsuario`

**Métodos** (encapsulan RF-57, RF-58, RF-59, CB-11, CB-12):
- `esElPropioAdministrador(adminActualId: string): boolean`
- `puedeSerBaneado(adminActualId: string): boolean` → `false` si `rol === ADMIN` o
  `esElPropioAdministrador`.
- `puedeSerEliminado(adminActualId: string): boolean` → misma regla que `puedeSerBaneado`.
- `puedeSerPromovido(): boolean` → `false` si `rol === ADMIN` (operación inválida/no-op, CB-12).
- `puedeSerDegradado(adminActualId: string): boolean` → `true` solo si `rol === ADMIN` y
  `!esElPropioAdministrador(adminActualId)` (RF-76, agregado en sesión de clarificación
  2026-09-17, resuelve **A8**: un ADMIN puede degradar a otro ADMIN a USER, pero no a sí mismo).

### `PublicacionModeracion`

**Propiedades**:
- `id: string`
- `autorId: string`
- `estado: EstadoPublicacion`
- `cantidadReportes: number`
- `motivosReporte: MotivoReporte[]`

**Métodos**:
- `estaReportada(): boolean` → `estado === REPORTADA`.
- `puedeEliminarse(): boolean` → `estado !== ELIMINADA` (evita doble eliminación).

### `Reporte`

**Propiedades**:
- `id: string`
- `publicacionId: string`
- `motivo: MotivoReporte`
- `reportanteId: string`
- `fecha: string` (ISO 8601)
- `prioridad?: PrioridadReporte` (si el backend la provee, RF-65; tipado como enum desde la sesión
  de clarificación 2026-09-17, antes era unión de strings)
- `estado: EstadoModeracion`

**Métodos**:
- `estaPendiente(): boolean` → `estado === PENDIENTE || estado === EN_REVISION`.
- `puedeResolverseSinEliminar(): boolean` → `true` mientras `estaPendiente()` (RF-64).
- `antiguedadEnDias(fechaActual: Date): number` → soporte a indicadores de antigüedad (RF-65).

### `DesafioPropuesto`

**Propiedades**:
- `id: string`
- `autorId: string`
- `contenidoFormulario: Record<string, unknown>`
- `estado: EstadoDesafioPropuesto`

**Métodos**:
- `estaPendiente(): boolean` → `estado === PENDIENTE`.
- `puedeAprobarse(): boolean` → `estaPendiente()` (RF-68, CB-15: decisión final una vez tomada).
- `puedeRechazarse(): boolean` → `estaPendiente()` (RF-69, CB-15).

### `ExportacionReporte`

**Propiedades**:
- `disponible: boolean`
- `urlDescarga?: string`
- `errorMensaje?: string` (por ejemplo, `"Error: Reporte no generado."` — RF-74)

**Métodos**:
- `fueExitosa(): boolean` → `disponible === true && !errorMensaje`.

Trazabilidad: RF-71–RF-74 (visualización, exportación síncrona, descarga y manejo de error).

---

## Trazabilidad Cruzada (resumen)

| Entidad | Frontend | Historias de Usuario relacionadas |
|---|---|---|
| `Publicacion` | Usuario | HU-01, HU-02, HU-07 |
| `Usuario` | Usuario | HU-08 |
| `Filtro` | Usuario | HU-03 |
| `Carpeta` | Usuario | HU-09 |
| `Desafio` | Usuario | (participación, transversal al módulo usuario) |
| `UsuarioAdmin` | Admin | HU-12 |
| `PublicacionModeracion` | Admin | HU-11 |
| `Reporte` | Admin | HU-11 |
| `DesafioPropuesto` | Admin | HU-14 |
| `ExportacionReporte` | Admin | HU-15 |

**Conteo total**: 10 entidades de dominio de UI (5 en `frontend/`: `Publicacion`, `Usuario`,
`Filtro`, `Carpeta`, `Desafio`; 5 en `frontend-admin/`: `UsuarioAdmin`, `PublicacionModeracion`,
`Reporte`, `DesafioPropuesto`, `ExportacionReporte`), más el enum auxiliar `PrioridadReporte`
agregado en la sesión de clarificación 2026-09-17. Este conteo corrige la cifra "9 entidades / 4
administración" que figuraba erróneamente en `plan.md`.

## Notas de la sesión de clarificación (2026-09-17)

- `UsuarioAdmin.puedeSerDegradado()` se agregó para resolver **A8** (RF-76 de `spec.md`).
- `Reporte.prioridad` pasó de unión de strings a enum `PrioridadReporte` para cumplir el Principio
  VII de la constitución (resuelto en el reporte de `/speckit.analyze`).
- El nombre y valores de `EstadoModeracion` (ya definidos aquí) quedaron confirmados como decisión
  final por RF-79 (resuelve **A2**), no solo como propuesta técnica.
