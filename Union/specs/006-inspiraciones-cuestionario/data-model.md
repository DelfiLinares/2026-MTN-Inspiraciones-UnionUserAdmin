# Data Model — 006 Cuestionario de Intereses (Frontend)

**Estado**: Borrador | **Fecha**: 2026-10-19

---

## 1. Modelo de dominio

### 1.1 Enums de categorías

Estas categorías **DEBEN sincronizarse con módulo 002 (publicaciones)** (ver spec.md § 9, RNF-23).

```typescript
// CategoriaInteres — Intereses artísticos generales
enum CategoriaInteres {
  DIBUJO = "dibujo",
  ESCULTURA = "escultura",
  FOTOGRAFIA = "fotografia",
  LITERATURA = "literatura",
  ESCULTURA_DIGITAL = "escultura_digital",
  PINTURA_DIGITAL = "pintura_digital",
  INSTALACION = "instalacion",
  PERFORMANCE = "performance",
  VIDEO_ARTE = "video_arte",
  // ... completar según catálogo de 002
}

// GeneroMusical — Géneros musicales
enum GeneroMusical {
  ROCK = "rock",
  POP = "pop",
  ELECTRONICA = "electronica",
  METAL = "metal",
  K_POP = "k_pop",
  COUNTRY = "country",
  NACIONAL = "nacional",
  REGGAETON = "reggaeton",
  HIP_HOP = "hip_hop",
  CLASICA = "clasica",
  R_AND_B = "r_and_b",
  BLUES = "blues",
  // ... expandir según necesario
}

// EstiloPintura — Estilos, técnicas o categorías de pintura
enum EstiloPintura {
  REALISMO = "realismo",
  ABSTRACCION = "abstraccion",
  IMPRESIONISMO = "impresionismo",
  SURREALISMO = "surrealismo",
  EXPRESIONISMO = "expresionismo",
  CUBISMO = "cubismo",
  // ... expandir según necesario
}
```

---

### 1.2 Entidades y value objects

#### OpcionRespuesta
Representa una opción seleccionable dentro de una pregunta.

```typescript
/**
 * OpcionRespuesta
 * 
 * Invariantes:
 * - id es único dentro del catálogo de opciones.
 * - categoria pertenece a CategoriaInteres, GeneroMusical o EstiloPintura.
 * - descripcion es texto legible para el usuario.
 */
class OpcionRespuesta {
  constructor(
    readonly id: string,
    readonly categoria: CategoriaInteres | GeneroMusical | EstiloPintura,
    readonly descripcion: string
  ) {}

  // Verificar que la opción es válida
  esValida(): boolean {
    return this.id && this.categoria && this.descripcion;
  }
}
```

---

#### Pregunta
Representa una pregunta del cuestionario.

```typescript
/**
 * Pregunta
 * 
 * Invariantes:
 * - id es único dentro del cuestionario.
 * - texto es la pregunta a mostrar.
 * - opciones contiene al menos una OpcionRespuesta.
 * - permiteMultipleSelecciones indica si pueden seleccionarse varias opciones.
 * - obligatoria indica si debe responderse (RF-05).
 */
class Pregunta {
  constructor(
    readonly id: string,
    readonly texto: string,
    readonly opciones: OpcionRespuesta[],
    readonly permiteMultipleSelecciones: boolean,
    readonly obligatoria: boolean = true
  ) {
    this.validarInvariantes();
  }

  private validarInvariantes(): void {
    if (!this.id || !this.texto) {
      throw new Error("Pregunta: id y texto son requeridos");
    }
    if (this.opciones.length === 0) {
      throw new Error("Pregunta: debe tener al menos una opción");
    }
    if (!this.opciones.every(op => op.esValida())) {
      throw new Error("Pregunta: todas las opciones deben ser válidas");
    }
  }

  // Validar que las opciones seleccionadas pertenecen al catálogo
  validarSeleccion(idsSeleccionados: string[]): boolean {
    const idsValidos = new Set(this.opciones.map(op => op.id));
    return idsSeleccionados.every(id => idsValidos.has(id));
  }

  // Si no permite múltiples, máximo 1 opción
  validarMultiplicidad(idsSeleccionados: string[]): boolean {
    if (!this.permiteMultipleSelecciones && idsSeleccionados.length > 1) {
      return false;
    }
    return true;
  }

  // Si es obligatoria, debe tener al menos una selección
  validarObligatoriedad(idsSeleccionados: string[]): boolean {
    if (this.obligatoria && idsSeleccionados.length === 0) {
      return false;
    }
    return true;
  }

  // Validación completa
  validarRespuesta(idsSeleccionados: string[]): { valida: boolean; error?: string } {
    if (!this.validarSeleccion(idsSeleccionados)) {
      return { valida: false, error: "Opciones seleccionadas no válidas" };
    }
    if (!this.validarMultiplicidad(idsSeleccionados)) {
      return { valida: false, error: "Solo se permite una opción" };
    }
    if (!this.validarObligatoriedad(idsSeleccionados)) {
      return { valida: false, error: "Esta pregunta es obligatoria" };
    }
    return { valida: true };
  }
}
```

---

#### RespuestaCuestionario
Value object que almacena las respuestas del usuario a todas las preguntas.

```typescript
/**
 * RespuestaCuestionario
 * 
 * Almacena: mapa de (id pregunta) -> (conjunto de ids opciones seleccionadas).
 * 
 * Invariantes:
 * - respuestas es un Map<string, Set<string>>.
 * - Las opciones seleccionadas son validadas contra las preguntas.
 */
class RespuestaCuestionario {
  private respuestas: Map<string, Set<string>>;

  constructor(respuestas?: Map<string, Set<string>>) {
    this.respuestas = respuestas ?? new Map();
  }

  // Obtener opciones seleccionadas para una pregunta
  obtenerRespuesta(idPregunta: string): Set<string> {
    return this.respuestas.get(idPregunta) ?? new Set();
  }

  // Seleccionar una opción para una pregunta
  seleccionar(idPregunta: string, idOpcion: string): RespuestaCuestionario {
    const nuevaRespuesta = new Map(this.respuestas);
    const opciones = nuevaRespuesta.get(idPregunta) ?? new Set();
    opciones.add(idOpcion);
    nuevaRespuesta.set(idPregunta, opciones);
    return new RespuestaCuestionario(nuevaRespuesta);
  }

  // Deseleccionar una opción
  deseleccionar(idPregunta: string, idOpcion: string): RespuestaCuestionario {
    const nuevaRespuesta = new Map(this.respuestas);
    const opciones = nuevaRespuesta.get(idPregunta);
    if (opciones) {
      opciones.delete(idOpcion);
      if (opciones.size === 0) {
        nuevaRespuesta.delete(idPregunta);
      } else {
        nuevaRespuesta.set(idPregunta, opciones);
      }
    }
    return new RespuestaCuestionario(nuevaRespuesta);
  }

  // Obtener todas las respuestas
  obtenerTodas(): Map<string, Set<string>> {
    return new Map(this.respuestas);
  }

  // Validar completitud (preguntas obligatorias respondidas)
  validarCompletitud(preguntas: Pregunta[]): { valida: boolean; errores?: Map<string, string> } {
    const errores = new Map<string, string>();

    for (const pregunta of preguntas) {
      const idsSeleccionados = Array.from(this.obtenerRespuesta(pregunta.id));
      const validacion = pregunta.validarRespuesta(idsSeleccionados);
      if (!validacion.valida) {
        errores.set(pregunta.id, validacion.error ?? "Respuesta inválida");
      }
    }

    return {
      valida: errores.size === 0,
      errores: errores.size > 0 ? errores : undefined,
    };
  }
}
```

---

#### Preferencias
Value object que representa las preferencias finales transformadas de RespuestaCuestionario.

```typescript
/**
 * Preferencias
 * 
 * Agrupa las categorías seleccionadas por tipo de interés.
 * Se utiliza para personalizar el feed (handoff a módulo feed).
 * 
 * Invariantes:
 * - interesesArtisticos es un array de CategoriaInteres.
 * - generosMusical es un array de GeneroMusical.
 * - estilosPintura es un array de EstiloPintura.
 * - Al menos un array debe tener al menos un elemento (futuro: depende de spec de feed).
 */
class Preferencias {
  constructor(
    readonly interesesArtisticos: CategoriaInteres[],
    readonly generosMusical: GeneroMusical[],
    readonly estilosPintura: EstiloPintura[]
  ) {
    this.validarInvariantes();
  }

  private validarInvariantes(): void {
    // Futuro: validar que al menos un array no está vacío si se requiere.
  }

  // Verificar si está completamente vacía
  estaVacia(): boolean {
    return (
      this.interesesArtisticos.length === 0 &&
      this.generosMusical.length === 0 &&
      this.estilosPintura.length === 0
    );
  }
}
```

---

### 1.3 Factory / Builder para el cuestionario

#### CuestionarioFactory
Factory que crea el cuestionario con preguntas y opciones predefinidas.

```typescript
/**
 * CuestionarioFactory
 * 
 * Responsabilidad: crear instancia del cuestionario con preguntas y opciones
 * alineadas con las categorías de publicaciones (módulo 002).
 * 
 * Nota: En futuras iteraciones, el catálogo podría venir de la API.
 */
class CuestionarioFactory {
  static crearCuestionarioDefault(): Pregunta[] {
    return [
      // Pregunta 1: Intereses artísticos
      new Pregunta(
        "artistica",
        "¿Cuáles son tus intereses artísticos?",
        [
          new OpcionRespuesta(CategoriaInteres.DIBUJO, CategoriaInteres.DIBUJO, "Dibujo"),
          new OpcionRespuesta(CategoriaInteres.ESCULTURA, CategoriaInteres.ESCULTURA, "Escultura"),
          new OpcionRespuesta(CategoriaInteres.FOTOGRAFIA, CategoriaInteres.FOTOGRAFIA, "Fotografía"),
          new OpcionRespuesta(CategoriaInteres.LITERATURA, CategoriaInteres.LITERATURA, "Literatura"),
          new OpcionRespuesta(CategoriaInteres.PINTURA_DIGITAL, CategoriaInteres.PINTURA_DIGITAL, "Pintura Digital"),
          new OpcionRespuesta(CategoriaInteres.VIDEO_ARTE, CategoriaInteres.VIDEO_ARTE, "Video Arte"),
          // ... más opciones
        ],
        true, // múltiple
        true  // obligatoria
      ),

      // Pregunta 2: Géneros musicales
      new Pregunta(
        "musical",
        "¿Cuáles son tus géneros musicales favoritos?",
        [
          new OpcionRespuesta(GeneroMusical.ROCK, GeneroMusical.ROCK, "Rock"),
          new OpcionRespuesta(GeneroMusical.POP, GeneroMusical.POP, "Pop"),
          new OpcionRespuesta(GeneroMusical.ELECTRONICA, GeneroMusical.ELECTRONICA, "Electrónica"),
          new OpcionRespuesta(GeneroMusical.METAL, GeneroMusical.METAL, "Metal"),
          new OpcionRespuesta(GeneroMusical.K_POP, GeneroMusical.K_POP, "K-pop"),
          new OpcionRespuesta(GeneroMusical.CLASICA, GeneroMusical.CLASICA, "Clásica"),
          // ... más opciones
        ],
        true, // múltiple
        false // opcional
      ),

      // Pregunta 3: Estilos de pintura
      new Pregunta(
        "pintura",
        "¿Qué estilos de pintura te interesan?",
        [
          new OpcionRespuesta(EstiloPintura.REALISMO, EstiloPintura.REALISMO, "Realismo"),
          new OpcionRespuesta(EstiloPintura.ABSTRACCION, EstiloPintura.ABSTRACCION, "Abstracción"),
          new OpcionRespuesta(EstiloPintura.IMPRESIONISMO, EstiloPintura.IMPRESIONISMO, "Impresionismo"),
          new OpcionRespuesta(EstiloPintura.SURREALISMO, EstiloPintura.SURREALISMO, "Surrealismo"),
          new OpcionRespuesta(EstiloPintura.CUBISMO, EstiloPintura.CUBISMO, "Cubismo"),
          // ... más opciones
        ],
        true, // múltiple
        false // opcional
      ),
    ];
  }
}
```

---

## 2. Transformación: RespuestaCuestionario → Preferencias

Servicio en la capa de aplicación que convierte respuestas en preferencias.

```typescript
/**
 * CuestionarioService
 * 
 * Responsabilidad: transformar RespuestaCuestionario en Preferencias,
 * validar completitud, preparar para integración con feed.
 */
class CuestionarioService {
  static transformarAPreferencias(
    respuestas: RespuestaCuestionario,
    preguntas: Pregunta[]
  ): Preferencias {
    const preguntasPorId = new Map(preguntas.map(p => [p.id, p]));

    const interesesArtisticos: CategoriaInteres[] = [];
    const generosMusical: GeneroMusical[] = [];
    const estilosPintura: EstiloPintura[] = [];

    for (const [idPregunta, idsSeleccionados] of respuestas.obtenerTodas()) {
      const pregunta = preguntasPorId.get(idPregunta);
      if (!pregunta) continue;

      for (const idOpcion of idsSeleccionados) {
        const opcion = pregunta.opciones.find(op => op.id === idOpcion);
        if (!opcion) continue;

        // Clasificar según tipo de categoría
        if (this.esInteres(opcion.categoria)) {
          interesesArtisticos.push(opcion.categoria as CategoriaInteres);
        } else if (this.esGeneroMusical(opcion.categoria)) {
          generosMusical.push(opcion.categoria as GeneroMusical);
        } else if (this.esEstiloPintura(opcion.categoria)) {
          estilosPintura.push(opcion.categoria as EstiloPintura);
        }
      }
    }

    return new Preferencias(
      Array.from(new Set(interesesArtisticos)), // sin duplicados
      Array.from(new Set(generosMusical)),
      Array.from(new Set(estilosPintura))
    );
  }

  private static esInteres(cat: any): boolean {
    return Object.values(CategoriaInteres).includes(cat);
  }

  private static esGeneroMusical(cat: any): boolean {
    return Object.values(GeneroMusical).includes(cat);
  }

  private static esEstiloPintura(cat: any): boolean {
    return Object.values(EstiloPintura).includes(cat);
  }
}
```

---

## 3. Estructura de directorios esperada

```
Union/frontend/src/
├── domain/
│   ├── enums/
│   │   ├── CategoriaInteres.ts
│   │   ├── GeneroMusical.ts
│   │   └── EstiloPintura.ts
│   ├── Pregunta.ts
│   ├── OpcionRespuesta.ts
│   ├── RespuestaCuestionario.ts
│   └── Preferencias.ts
├── application/
│   ├── CuestionarioService.ts
│   ├── CuestionarioFactory.ts
│   └── dto/
│       └── PreferenciasDTO.ts (si se necesita serializar)
├── presentation/
│   ├── cuestionario/
│   │   ├── CuestionarioPage.tsx
│   │   ├── PreguntaForm.tsx
│   │   ├── OpcionSelector.tsx
│   │   └── BienvenidaHeader.tsx
│   └── feed/
│       └── FeedPage.tsx (futuro, solo stub)
└── tests/
    ├── domain/
    │   ├── Pregunta.test.ts
    │   ├── RespuestaCuestionario.test.ts
    │   └── Preferencias.test.ts
    ├── application/
    │   ├── CuestionarioService.test.ts
    │   └── CuestionarioFactory.test.ts
    └── integration/
        └── CuestionarioFlow.test.tsx
```

---

## 4. Sincronización con módulo 002

**Documentación de dependencia**:

| Categoría | Módulo 002 | Módulo 006 | Estado |
|---|---|---|---|
| `CategoriaInteres` | Filtros de publicaciones | Pregunta "Intereses artísticos" | ✅ Alineada |
| `GeneroMusical` | Categoría de música | Pregunta "Géneros musicales" | ✅ Alineada |
| `EstiloPintura` | Categoría de pintura | Pregunta "Estilos de pintura" | ✅ Alineada |

**Acción requerida**: Si módulo 002 actualiza enums, módulo 006 debe actualizarse simultáneamente para evitar desincronización (A-2, spec.md § 9).

---

## 5. Notas sobre persistencia

**MVP (Actual)**: Sin persistencia. Respuestas en memoria.
**Futura iteración**: Si se requiere guardar preferencias:
- Opción 1: localStorage (ephem éral).
- Opción 2: Backend (requiere autenticación o ID de sesión).

**Testing**: En MVP no testear recuperación post-recarga.

---

**Versión**: 1.0 | **Completado**: 2026-10-19
