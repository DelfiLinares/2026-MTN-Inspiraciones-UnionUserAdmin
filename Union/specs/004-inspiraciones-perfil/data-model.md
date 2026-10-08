# Data Model: Frontend de Perfil — Domain Entities & Value Objects

**Feature**: 004-inspiraciones-perfil | **Date**: 2026-10-06

Este documento define el modelo de dominio de UI (entidades, enums, value objects) que encapsulan
las reglas de negocio del módulo de perfil, alineadas con la especificación `spec.md`, las
clarificaciones `clarifications.md`, y las decisiones de diseño de `research.md`.

---

## Enums (Shared with Module 002)

### RolUsuario

```typescript
export enum RolUsuario {
  USER = "USER",
  ADMIN = "ADMIN"
}
```

**Propósito**: Identificar el rol de un usuario.

**Uso en este módulo**: Solo para completitud; las capacidades del módulo de perfil son
idénticas para ambos roles (Principio VI, §1.3 de spec).

**Notas**:
- En el módulo 002-frontend-admin, `RolUsuario` condiciona permisos (solo ADMIN puede banear).
- En este módulo 004, no hay restricciones basadas en rol; solo en contexto (perfil propio vs. ajeno).

---

### EstadoCuentaUsuario

```typescript
export enum EstadoCuentaUsuario {
  ACTIVO = "ACTIVO",
  BANEADO = "BANEADO",
  ELIMINADO = "ELIMINADO"
}
```

**Propósito**: Estados de ciclo de vida de una cuenta de usuario.

**Valores**:
- `ACTIVO`: Cuenta normal, totalmente funcional.
- `BANEADO`: Cuenta suspendida (por admin del módulo 002); perfil no visible a terceros (A10).
- `ELIMINADO`: Cuenta eliminada (por admin); perfil no visible a terceros (A10).

**Impacto en este módulo**:
- Solo cuentas `ACTIVO` pueden tener perfil visible.
- Intentar acceder a perfil baneado/eliminado retorna 404/403 (A10).
- Frontend muestra `ProfileNotFoundView` en ese caso.

---

## Domain Entities

### Usuario

Entidad que encapsula un usuario de la red social dentro del módulo de perfil.

```typescript
export class Usuario {
  constructor(
    public id: string,
    public username: string,          // A1: unique globally
    public foto?: string,             // A2: URL to uploaded image
    public sobreMi: string = "",      // max 80 chars
    public descripcion: string = "",  // max 200 chars
    public estado: EstadoCuentaUsuario = EstadoCuentaUsuario.ACTIVO,
    public rol: RolUsuario = RolUsuario.USER,
    public fechaCreacion: Date = new Date()
  ) {}

  /**
   * Rule 1 (Spec §6): Cualquier usuario puede visualizar su propio perfil.
   * Siempre true para el usuario autenticado.
   */
  public puedeVerPerfil(): boolean {
    return true; // Own profile always visible to self
  }

  /**
   * Rule 3 (Spec §6): Un usuario solo puede editar los datos de su propio perfil.
   * Check is contextual: performed by caller (presentation layer) comparing
   * usuarioAutenticado.id === usuarioAEditar.id
   */
  public puedeEditarPerfil(usuarioActual: Usuario): boolean {
    return this.id === usuarioActual.id;
  }

  /**
   * Rule 11 (Spec §6): El nombre de usuario debe permitir números, mayúsculas,
   * minúsculas, guiones bajos y puntos; no debe superar los 10 caracteres y no
   * debe permitir espacios.
   * Returns true if username is valid (client-side check).
   * Backend is authoritative for uniqueness (A1).
   */
  public esNombreUsuarioValido(): boolean {
    if (this.username.length === 0 || this.username.length > 10) {
      return false;
    }
    // Allow: a-z, A-Z, 0-9, _, .
    return /^[a-zA-Z0-9_.]+$/.test(this.username);
  }

  /**
   * Rule 12 (Spec §6): El "sobre mí" no debe superar los 80 caracteres.
   */
  public esSobreMiValido(): boolean {
    return this.sobreMi.length <= 80;
  }

  /**
   * Rule 13 (Spec §6): La descripción no debe superar los 200 caracteres.
   */
  public esDescripcionValida(): boolean {
    return this.descripcion.length <= 200;
  }

  /**
   * Visibility rule (A10): Cuenta está disponible si está ACTIVA.
   */
  public estaDisponible(): boolean {
    return this.estado === EstadoCuentaUsuario.ACTIVO;
  }
}
```

**Campos**:
- `id`: ID único del usuario (proporcionado por backend)
- `username`: Nombre de usuario único (A1), 10 chars max, sin espacios, solo alfanuméricos + `_` y `.`
- `foto`: URL de foto de perfil (A2)
- `sobreMi`: Biografía corta, max 80 chars
- `descripcion`: Descripción más larga, max 200 chars
- `estado`: `ACTIVO`, `BANEADO`, o `ELIMINADO` (A10)
- `rol`: `USER` o `ADMIN` (no condiciona permisos dentro de este módulo)
- `fechaCreacion`: Metadata timestamp

**Métodos de negocio**:
- `puedeVerPerfil()`: Siempre true para perfil propio dentro de este módulo
- `puedeEditarPerfil()`: Requiere que `this.id === usuarioActual.id` (contextual)
- `esNombreUsuarioValido()`: Regex para validación client-side (backend enforce uniqueness)
- `esSobreMiValido()`: Longitud ≤ 80
- `esDescripcionValida()`: Longitud ≤ 200
- `estaDisponible()`: true si estado es `ACTIVO`

**Traceability**:
- HU-01: Visualizar perfil propio → `puedeVerPerfil()`
- HU-02: Editar perfil propio → `puedeEditarPerfil()`
- HU-03: Visualizar perfil ajeno → `estaDisponible()` (A10)
- AC-02.2, AC-02.3: Validación de username → `esNombreUsuarioValido()`
- AC-02.4: Validación sobre mí → `esSobreMiValido()`
- AC-02.5: Validación descripción → `esDescripcionValida()`
- RF-01 to RF-08: Gestión de perfil
- RF-09: Visibilidad de perfiles (A10)

---

### CarpetaPost

Entidad que encapsula una carpeta de posts guardados de un usuario.

```typescript
export class CarpetaPost {
  constructor(
    public id: string,
    public usuarioId: string,
    public nombre: string,           // max 15 chars, spaces allowed
    public descripcion: string = "", // optional
    public fechaCreacion: Date = new Date(),
    public postCount: number = 0     // derived from backend
  ) {}

  /**
   * Rule 4 (Spec §6): El sistema DEBE permitir crear, renombrar y eliminar
   * carpetas... que no supere los 15 caracteres.
   * Returns true if folder name is valid (client-side check).
   */
  public esNombreValido(): boolean {
    if (this.nombre.length === 0 || this.nombre.length > 15) {
      return false;
    }
    // Spaces are allowed (unlike username)
    return true;
  }

  /**
   * Rule 8 (Spec §6): La lista de carpetas del usuario DEBE soportar hasta
   * un máximo de 50 carpetas sin degradar la interfaz.
   * This check is performed at service level with server-side validation.
   */
  public esCarpetaValida(): boolean {
    return this.esNombreValido();
  }

  /**
   * Helper to check if folder can be deleted.
   * A7: Can delete with or without posts inside.
   */
  public puedeSer Eliminada(): boolean {
    return true; // Always deletable (A7)
  }

  /**
   * Helper to check if folder can be renamed.
   * A3: Backend validates uniqueness per user.
   */
  public puedeSerRenombrada(): boolean {
    return true; // Renaming allowed anytime; backend validates uniqueness
  }
}
```

**Campos**:
- `id`: ID único de la carpeta (proporcionado por backend)
- `usuarioId`: ID del usuario propietario
- `nombre`: Nombre de carpeta, max 15 chars, espacios permitidos (A3 uniqueness per user)
- `descripcion`: Descripción opcional (futuro)
- `fechaCreacion`: Timestamp de creación
- `postCount`: Cantidad de posts en carpeta (derivado del backend)

**Métodos de negocio**:
- `esNombreValido()`: Longitud 1–15 chars (espacios permitidos)
- `esCarpetaValida()`: Validación general de carpeta
- `puedeSerEliminada()`: Siempre true (A7; posts no se eliminan)
- `puedeSerRenombrada()`: Siempre true (backend valida uniqueness A3)

**Validaciones client-side vs. backend**:
- Client: nombre 1–15 chars
- Backend: nombre único per usuario (A3)
- Backend: máximo 50 carpetas por usuario (RNF-07)

**Traceability**:
- HU-05: Crear carpeta → `esNombreValido()`
- HU-06: Renombrar carpeta → `puedeSerRenombrada()`, `esNombreValido()`
- HU-07: Eliminar carpeta → `puedeSerEliminada()`
- HU-08: Visualizar carpetas
- AC-05.2, AC-06.2: Validación de nombre
- RF-17 to RF-27: Gestión de carpetas
- CB-06, CB-07: Edge cases de nombres
- CB-08 to CB-10: Límite de 50 carpetas

---

### Publicacion

Entidad que encapsula una publicación propia (dentro del módulo de perfil, solo editar/eliminar).

```typescript
export class Publicacion {
  constructor(
    public id: string,
    public autorId: string,
    public imagenUrl: string,        // URL de imagen (A5: immutable)
    public texto: string,            // A5: mutable
    public fechaCreacion: Date = new Date(),
    public fechaActualizacion?: Date
  ) {}

  /**
   * Rule (A5): Solo el texto es editable; la imagen es inmutable.
   * Returns true if post can be edited.
   */
  public puedeSerEditada(): boolean {
    return true; // Editable anytime; backend validates authorization
  }

  /**
   * Rule (A5): La imagen no puede cambiar después de publicación.
   * This is enforced by domain and application layer:
   * only `texto` field is sent to backend on edit.
   */
  public esImagenImmutable(): boolean {
    return true; // Image never changes
  }

  /**
   * Helper: Post can be deleted anytime by owner.
   * Backend validates authorization (es autorId).
   */
  public puedeSerEliminada(): boolean {
    return true; // Deletable anytime
  }
}
```

**Campos**:
- `id`: ID único de la publicación
- `autorId`: ID del usuario propietario (autorización en backend)
- `imagenUrl`: URL de imagen (A5: nunca cambia)
- `texto`: Contenido de texto (A5: editable)
- `fechaCreacion`: Timestamp de creación
- `fechaActualizacion`: Timestamp de última edición

**Métodos de negocio**:
- `puedeSerEditada()`: true (solo texto; backend autoriza)
- `esImagenImmutable()`: true (imagen nunca cambia)
- `puedeSerEliminada()`: true (backend autoriza)

**Validaciones**:
- Texto: No validado en dominio (backend es authoritative)
- Imagen: No editable (aplicación layer ignora intentos)

**Traceability**:
- HU-11: Editar publicación propia → `puedeSerEditada()`
- HU-12: Eliminar publicación propia → `puedeSerEliminada()`
- HU-13: Visualizar posts del perfil
- AC-11.2: Solo texto editable
- RF-32: Editar texto de publicación
- RF-33: Imagen no editable
- CB-17, CB-18: Edge cases de edición

---

## Value Objects

### SeguimientoRelacion

Value object que encapsula la relación de seguimiento entre dos usuarios (A4).

```typescript
export class SeguimientoRelacion {
  constructor(
    public usuarioId: string,          // Usuario que sigue
    public usuarioASeguidoId: string,  // Usuario siendo seguido
    public siguiendo: boolean = false  // Estado: siguiendo o no
  ) {}

  /**
   * Toggle follow state (A4).
   * Returns new instance (immutable value object).
   */
  public toggle(): SeguimientoRelacion {
    return new SeguimientoRelacion(
      this.usuarioId,
      this.usuarioASeguidoId,
      !this.siguiendo
    );
  }

  /**
   * Indicates if user is currently following the target user.
   */
  public esSiguiendo(): boolean {
    return this.siguiendo;
  }

  /**
   * Indicates if user is not following the target user.
   */
  public noEsSiguiendo(): boolean {
    return !this.siguiendo;
  }
}
```

**Propósito**: Encapsular el estado binario de seguimiento y métodos relacionados.

**Métodos**:
- `toggle()`: Retorna nueva instancia con estado opuesto (value object immutable)
- `esSiguiendo()`: Alias para `siguiendo`
- `noEsSiguiendo()`: Negación de `siguiendo`

**Traceability**:
- HU-04: Seguir usuario → `toggle()`, `esSiguiendo()`
- A4: Bidirectional follow/unfollow behavior

---

### DTOs (Application Layer)

Los siguientes son objetos de transporte (no entidades de dominio):

#### FiltroUsuarios

```typescript
export interface FiltroUsuarios {
  limit?: number;      // Paginación (A6)
  offset?: number;     // Paginación (A6)
  busqueda?: string;   // Búsqueda opcional
}
```

**Propósito**: Parámetros de consulta para listar carpetas.

#### ResultadoCarpetas

```typescript
export interface ResultadoCarpetas {
  carpetas: CarpetaPost[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
```

**Propósito**: Respuesta paginada de listado de carpetas (A6).

#### ResultadoValidacion

```typescript
export interface ResultadoValidacion {
  esValido: boolean;
  error?: string;  // Error message if validation failed
  campo?: string;  // Which field failed (username, sobreMi, etc.)
}
```

**Propósito**: Encapsular resultado de validaciones (A1, A2, A3).

---

## Validation Rules Summary

| Regla | Entidad | Validación Client-Side | Validación Backend |
|---|---|---|---|
| **Username (A1)** | `Usuario` | Regex: `[a-zA-Z0-9_.]{1,10}` | UNIQUE constraint |
| **Username (A1)** | `Usuario` | No espacios | Ya enforced by regex |
| **Foto (A2)** | `Usuario` | Tipos: JPG/PNG/WebP | MIME type, size, dimensions |
| **Foto (A2)** | `Usuario` | Tamaño: ≤5 MB | File size, re-encoding |
| **Sobre Mí** | `Usuario` | Longitud ≤80 chars | Truncate if needed |
| **Descripción** | `Usuario` | Longitud ≤200 chars | Truncate if needed |
| **Nombre Carpeta (A3)** | `CarpetaPost` | Longitud 1–15 chars | UNIQUE per usuario |
| **Límite Carpetas (RNF-07)** | `CarpetaPost` | N/A | Max 50 per usuario |
| **Post Texto (A5)** | `Publicacion` | N/A | Accepts any text |
| **Post Imagen (A5)** | `Publicacion` | N/A | Immutable (app layer ignores edits) |

---

## Error Handling (from research.md & clarifications.md)

### Backend Error Codes & Frontend Handling

| Scenario | HTTP Code | Frontend Handling | Component |
|---|---|---|---|
| **A1: Username taken** | 409 / 400 | Show error inline, persist form | `EditarPerfilForm` |
| **A2: Photo invalid format** | 400 | Show error "Invalid format" | `PhotoUploadField` |
| **A2: Photo too large** | 413 | Show error "File too large" | `PhotoUploadField` |
| **A2: Photo dimensions invalid** | 400 | Show error from backend | `PhotoUploadField` |
| **A3: Folder name duplicate** | 409 | Show error, keep dialog open | `CreateCarpetaDialog` / `RenameCarpetaDialog` |
| **A4: Follow failed** | 500 / 400 | Rollback optimistic update, show toast | `FollowButton` |
| **A7: Delete folder failed** | 400 / 403 | Show error, dialog remains open | `ConfirmDeleteCarpetaDialog` |
| **A10: Profile not found** | 404 | Show `ProfileNotFoundView` | `PerfilPage` |
| **A10: Profile banned/deleted** | 403 | Show `ProfileNotFoundView` | `PerfilPage` |

---

## Testing Implications

### Domain Layer Tests

```typescript
// Usuario validation rules
test("Usuario.esNombreUsuarioValido() rejects spaces", () => {
  const user = new Usuario("123", "user name");
  expect(user.esNombreUsuarioValido()).toBe(false);
});

test("Usuario.esNombreUsuarioValido() accepts underscore and dot", () => {
  const user = new Usuario("123", "user_name.1");
  expect(user.esNombreUsuarioValido()).toBe(true);
});

test("Usuario.esNombreUsuarioValido() rejects > 10 chars", () => {
  const user = new Usuario("123", "thisistoolong");
  expect(user.esNombreUsuarioValido()).toBe(false);
});

test("Usuario.esSobreMiValido() accepts ≤80 chars", () => {
  const user = new Usuario("123", "user", "foto.jpg", "a".repeat(80));
  expect(user.esSobreMiValido()).toBe(true);
});

test("Usuario.esSobreMiValido() rejects >80 chars", () => {
  const user = new Usuario("123", "user", "foto.jpg", "a".repeat(81));
  expect(user.esSobreMiValido()).toBe(false);
});

// CarpetaPost validation
test("CarpetaPost.esNombreValido() accepts spaces", () => {
  const folder = new CarpetaPost("1", "userId", "My Folder");
  expect(folder.esNombreValido()).toBe(true);
});

test("CarpetaPost.esNombreValido() rejects >15 chars", () => {
  const folder = new CarpetaPost("1", "userId", "a".repeat(16));
  expect(folder.esNombreValido()).toBe(false);
});

// A4: SeguimientoRelacion toggle
test("SeguimientoRelacion.toggle() changes state", () => {
  const rel = new SeguimientoRelacion("u1", "u2", false);
  const toggled = rel.toggle();
  expect(rel.siguiendo).toBe(false);
  expect(toggled.siguiendo).toBe(true);
  expect(rel).not.toBe(toggled); // Immutable
});

// A5: Publicacion image immutability
test("Publicacion.esImagenImmutable() returns true", () => {
  const post = new Publicacion("1", "u1", "img.jpg", "text");
  expect(post.esImagenImmutable()).toBe(true);
});

// A10: Usuario availability
test("Usuario.estaDisponible() checks estado", () => {
  const active = new Usuario("1", "user", undefined, "", "", EstadoCuentaUsuario.ACTIVO);
  const banned = new Usuario("2", "user2", undefined, "", "", EstadoCuentaUsuario.BANEADO);
  expect(active.estaDisponible()).toBe(true);
  expect(banned.estaDisponible()).toBe(false);
});
```

### Application Service Tests

Tests for error handling (A1, A2, A3, A4, A7, A10) are implemented in `tests/application/`.

### Presentation Component Tests

Tests for error display, confirmations, and UI state are implemented in `tests/presentation/`.

---

## Traceability: Spec → Data Model

| Spec Section | Regla | Entidad | Método |
|---|---|---|---|
| §6, Rule 1 | Seguir usuario | `SeguimientoRelacion` | `toggle()` |
| §6, Rule 2 | Crear carpetas | `CarpetaPost` | `esNombreValido()` |
| §6, Rule 3 | Editar perfil propio | `Usuario` | `puedeEditarPerfil()` |
| §6, Rule 4 | CRUD carpetas | `CarpetaPost` | `esNombreValido()`, `puedeSerEliminada()` |
| §6, Rule 5 | Guardar post | `CarpetaPost` + `Publicacion` | (service layer) |
| §6, Rule 6 | Advertencia eliminar | `CarpetaPost` | `puedeSerEliminada()` + (A7 handling) |
| §6, Rule 7 | Quitar post de carpeta | `Publicacion` | (service layer) |
| §6, Rule 8 | Límite 50 carpetas | `CarpetaPost` | (service layer, backend validates) |
| §6, Rule 9 | Carpetas públicas | `CarpetaPost` | (always public; no privacy field) |
| §6, Rule 10 | Posts del usuario visibles | `Publicacion` | (service layer) |
| §6, Rule 11 | Validación username | `Usuario` | `esNombreUsuarioValido()` |
| §6, Rule 12 | Validación sobre mí | `Usuario` | `esSobreMiValido()` |
| §6, Rule 13 | Validación descripción | `Usuario` | `esDescripcionValida()` |

---

**Status**: ✅ DATA MODEL COMPLETE
**Ready for Phase 1 (contracts/openapi.yaml generation)**: YES

