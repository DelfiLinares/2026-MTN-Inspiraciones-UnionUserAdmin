# Quickstart — 006 Cuestionario de Intereses (Frontend)

**Estado**: Borrador | **Fecha**: 2026-10-19

---

## Guía rápida de inicio

### Objetivos del módulo

Implementar un cuestionario frontend React que capture intereses artísticos, musicales y de pintura de usuarios nuevos (sin login requerido), valide respuestas y prepare preferencias para feed personalizado.

### Contexto técnico

- **Stack**: React + TypeScript + Vitest + React Testing Library.
- **Arquitectura**: Domain-Driven Design (Dominio → Aplicación → Presentación).
- **Alcance MVP**: Frontend 100%. Sin backend. Estado en memoria.
- **Sincronización crítica**: Categorías del cuestionario = categorías de filtros (módulo 002).

---

## Instrucciones de setup

### 1. Crear estructura de directorios

```bash
cd Union/frontend/src

# Dominio
mkdir -p domain/enums
touch domain/enums/CategoriaInteres.ts
touch domain/enums/GeneroMusical.ts
touch domain/enums/EstiloPintura.ts
touch domain/Pregunta.ts
touch domain/OpcionRespuesta.ts
touch domain/RespuestaCuestionario.ts
touch domain/Preferencias.ts

# Aplicación
mkdir -p application/dto
touch application/CuestionarioService.ts
touch application/CuestionarioFactory.ts
touch application/dto/PreferenciasDTO.ts

# Presentación
mkdir -p presentation/cuestionario
mkdir -p presentation/feed
touch presentation/cuestionario/CuestionarioPage.tsx
touch presentation/cuestionario/BienvenidaHeader.tsx
touch presentation/cuestionario/PreguntaForm.tsx
touch presentation/cuestionario/OpcionSelector.tsx
touch presentation/cuestionario/BotonContinuar.tsx
touch presentation/cuestionario/cuestionario.css
touch presentation/feed/FeedPage.tsx

# Tests
cd ../../tests
mkdir -p domain application integration
touch domain/Pregunta.test.ts
touch domain/RespuestaCuestionario.test.ts
touch domain/Preferencias.test.ts
touch application/CuestionarioService.test.ts
touch application/CuestionarioFactory.test.ts
touch integration/CuestionarioFlow.test.tsx
```

### 2. Iniciar desarrollo

```bash
# En Union/frontend/
npm install          # si no ya está hecho
npm run dev         # Vite dev server
npm run test        # Vitest
npm run test:ui     # Vitest UI (opcional)
```

### 3. Flujo de implementación

1. **Dominio primero**: Implementar enums y value objects. Testear inmediatamente.
2. **Aplicación**: Servicios de validación y transformación.
3. **Presentación**: Componentes React, integrando dominio/aplicación.
4. **E2E**: Prueba flujo completo inicio → fin.

---

## Hitos de verificación (Definition of Done)

### ✅ Fase 1: Dominio (Tests >80%)
- [ ] Enums compilables.
- [ ] `OpcionRespuesta` inmutable.
- [ ] `Pregunta.validarRespuesta()` funciona.
- [ ] `RespuestaCuestionario` (seleccionar, deseleccionar, conservar).
- [ ] Tests unitarios > 80%.
- [ ] PR aprobado.

### ✅ Fase 2: Aplicación (Tests >80%)
- [ ] `CuestionarioService` transforma respuestas.
- [ ] `CuestionarioFactory` retorna 3 preguntas.
- [ ] Tests unitarios > 80%.
- [ ] Integración con dominio probada.
- [ ] PR aprobado.

### ✅ Fase 3: Presentación (Tests flujo crítico)
- [ ] Componentes renderuzan sin error.
- [ ] Eslogan visible en bienvenida.
- [ ] Preguntas cargan correctamente.
- [ ] Seleccionar/deseleccionar funciona.
- [ ] Botón continuar bloqueado si falta obligatoria.
- [ ] Responsive en mobile + desktop.
- [ ] Tests de UI flujo crítico >60%.
- [ ] PR aprobado.

### ✅ Fase 4: Integración (E2E)
- [ ] Flujo completo: inicio → respuestas → validación → preferencias → feed.
- [ ] Mensajes de error claros.
- [ ] UX sin lag o parpadeos.
- [ ] README actualizado.
- [ ] PR aprobado.

---

## Decisiones de diseño clave

### 1. Estructura de datos: RespuestaCuestionario

**Patrón**: Map inmutable de `idPregunta -> Set<idOpcion>`.

**Ventaja**: Cambiar una pregunta no afecta otras. Fácil de testear.

```typescript
// Seleccionar
const nuevas = respuestas.seleccionar("artistica", "dibujo");
// Retorna nueva instancia (inmutable)
```

### 2. Validación: Lógica en dominio

**Patrón**: `Pregunta.validarRespuesta(ids)` retorna `{ valida, error }`.

**Ventaja**: No depende de React. Reutilizable. Testeable sin UI.

### 3. Transformación: Respuestas → Preferencias

**Patrón**: `CuestionarioService.transformarAPreferencias()`.

**Ventaja**: Separación clara. Fácil de adaptar si estructura de Preferencias cambia.

### 4. Handoff al feed: Memory object

**Patrón**: Componente padre (App.tsx) mantiene preferencias en estado. Pasa al componente Feed cuando renderiza.

**Alternativas consideradas**:
- URL state (React Router): más separación, pero frágil si URL es larga.
- Query params: muy frágil.
- Redux: overkill para MVP.

**Elección**: Memory object. Futuro: URL state si se requiere SPA separada.

### 5. Eslogan: Hardcoded en MVP

**Patrón**: Constante en archivo utils o directamente en componente.

**Futuro**: Backend proporciona vía API.

---

## Reglas críticas (RNF-20, RNF-24)

Estas reglas **DEBEN** estar cubiertas por tests:

1. ✅ **Solo opciones válidas**: `Pregunta.validarRespuesta()` rechaza IDs fuera del catálogo.
   ```typescript
   const resultado = pregunta.validarRespuesta(['dibujo', 'opcion_inexistente']);
   expect(resultado.valida).toBe(false);
   ```

2. ✅ **Multi-selección**: Pregunta permite >1 opción si `permiteMultipleSelecciones === true`.
   ```typescript
   const resultado = pregunta.validarRespuesta(['rock', 'pop']);
   expect(resultado.valida).toBe(true);
   ```

3. ✅ **Unicidad de categorías**: Preferencias no tienen duplicados.
   ```typescript
   const pref = new Preferencias(['rock', 'rock'], [], []);
   expect(pref.generosMusical).toEqual(['rock']); // Set deduplicado
   ```

4. ✅ **Conservación de estado**: Cambiar pregunta A no afecta pregunta B.
   ```typescript
   let respuestas = new RespuestaCuestionario();
   respuestas = respuestas.seleccionar('artistica', 'dibujo');
   respuestas = respuestas.seleccionar('musical', 'rock');
   expect(respuestas.obtenerRespuesta('artistica')).toContain('dibujo');
   expect(respuestas.obtenerRespuesta('musical')).toContain('rock');
   ```

5. ✅ **Bloqueo de obligatoria incompleta**: `CuestionarioService.validar()` retorna error.
   ```typescript
   const { valida, errores } = respuestas.validarCompletitud(preguntas);
   expect(valida).toBe(false);
   expect(errores.get('artistica')).toBeTruthy(); // Obligatoria vacía
   ```

6. ✅ **Transformación correcta**: `transformarAPreferencias()` agrupa bien.
   ```typescript
   const pref = CuestionarioService.transformarAPreferencias(respuestas, preguntas);
   expect(pref.interesesArtisticos).toContain(CategoriaInteres.DIBUJO);
   ```

---

## Casos borde (spec.md § 8)

| Caso | Esperado | Test |
|---|---|---|
| Usuario recarga página | Respuestas se pierden; recomienza | No testear (esperado en MVP) |
| Todas opciones deseleccionadas | Si obligatoria: error. Si opcional: OK | `validarObligatoriedad()` |
| Selecciona opción 2 veces | Idempotente (no duplica en Set) | `seleccionar('id', 'id')` |
| Pregunta sin respuesta (opcional) | Permite continuar | `validarCompletitud()` |
| Intenta continuar sin llenar obligatoria | Bloquea, muestra error | `BotonContinuar` test |
| Opción no en catálogo | Rechazada | `validarSeleccion()` |

---

## Consistencia con módulo 002

**Regla crítica (A-2, spec.md § 9)**: Las categorías del cuestionario DEBEN ser idénticas a las de publicaciones.

**Verificación**:

1. **Listar enums esperados del módulo 002**:
   - Categorías de arte: Dibujo, Escultura, Fotografía, Literatura, Pintura Digital, etc.
   - Géneros musicales: Rock, Pop, Electrónica, Metal, K-pop, Country, Nacional, Reggaetón, Hip-Hop, Clásica, R&B, Blues.
   - Estilos de pintura: Realismo, Abstracción, Impresionismo, Surrealismo, Expresionismo, Cubismo.

2. **Test de sincronía**:
   ```typescript
   test('Enums 006 coinciden con filtros 002', () => {
     const categoriasEsperadas = [
       CategoriaInteres.DIBUJO,
       CategoriaInteres.ESCULTURA,
       // ... completar con todas
     ];
     // Verificar que todas están en CuestionarioFactory
     const opciones = CuestionarioFactory.crearCuestionarioDefault()[0].opciones;
     for (const cat of categoriasEsperadas) {
       expect(opciones.some(op => op.categoria === cat)).toBe(true);
     }
   });
   ```

3. **Action items si hay desincronía**:
   - Comunicar al team que módulo 002 tiene categoría nueva.
   - Actualizar enums en 006 y 002 simultáneamente.
   - Verificar tests pasan.

---

## Flujo de user story: Usuario responde cuestionario

```
1. Usuario no autenticado accede a /cuestionario
   ↓
2. CuestionarioPage renderiza
   ├─ BienvenidaHeader: "Descubre inspiraciones artísticas..."
   ├─ PreguntaForm 1: "¿Cuáles son tus intereses artísticos?"
   │  └─ OpcionSelector: [Dibujo] [Escultura] [Fotografía] ...
   ├─ PreguntaForm 2: "¿Géneros musicales?"
   │  └─ OpcionSelector: [Rock] [Pop] [Electrónica] ...
   ├─ PreguntaForm 3: "¿Estilos de pintura?"
   │  └─ OpcionSelector: [Realismo] [Abstracción] ...
   └─ BotonContinuar (inicialmente deshabilitado)
   ↓
3. Usuario selecciona opciones
   └─ RespuestaCuestionario se actualiza en estado React
   ↓
4. Usuario presiona BotonContinuar
   ├─ CuestionarioService.validarCompletitud()
   ├─ Si error: muestra mensaje de error
   └─ Si OK: CuestionarioService.transformarAPreferencias()
   ↓
5. Preferencias se pasan a FeedPage
   └─ (En futuro: se envían a backend para obtener publicaciones)
   ↓
6. Usuario ve feed personalizado
```

---

## Testing: Cómo ejecutar

```bash
# Todos los tests
npm run test

# Tests de dominio solamente
npm run test domain

# Tests de un archivo específico
npm run test Pregunta

# Con cobertura
npm run test:coverage

# UI interactivo (Vitest)
npm run test:ui
```

---

## Debugging

### Problema: Pregunta valida opciones incorrectamente

**Solución**: Revisar `Pregunta.validarSeleccion()`. IDs deben coincidir exactamente con `opciones[].id`.

```typescript
// ❌ INCORRECTO
new OpcionRespuesta("1", CategoriaInteres.DIBUJO, "Dibujo")

// ✅ CORRECTO
new OpcionRespuesta(CategoriaInteres.DIBUJO, CategoriaInteres.DIBUJO, "Dibujo")
```

### Problema: Estado de componente se pierde al cambiar de pregunta

**Solución**: Usar `useState` con RespuestaCuestionario value object.

```typescript
const [respuestas, setRespuestas] = useState(new RespuestaCuestionario());

const manejarSeleccion = (idPregunta: string, idOpcion: string) => {
  setRespuestas(respuestas.seleccionar(idPregunta, idOpcion));
};
```

### Problema: BotonContinuar nunca se habilita

**Solución**: Verificar que pregunta obligatoria tiene al menos una respuesta.

```typescript
const puedeAvanzar = respuestas.validarCompletitud(preguntas).valida;
```

---

## Referencias rápidas

- **spec.md**: Requisitos funcionales y no funcionales.
- **data-model.md**: Estructura de entidades y value objects.
- **plan.md**: Arquitectura y fases de implementación.
- **contracts/openapi.yaml**: DTOs y contratos de futura integración.
- **research.md**: Decisiones de diseño y riesgos.
- **constitution.md**: Principios obligatorios del módulo.

---

## Checklist final (Before submitting PR)

- [ ] Código compilable (`npm run build`).
- [ ] Tests pasan (`npm run test`).
- [ ] Cobertura > 80% (dominio/aplicación), > 60% (UI).
- [ ] Trazabilidad spec.md → código verificada (comentarios en PR).
- [ ] Responsive design testeado en mobile + desktop.
- [ ] README actualizado con instrucciones de setup.
- [ ] Mensajes de error claros en UI.
- [ ] Sin console.error o console.log en código production.
- [ ] Code review completada.
- [ ] Sincronía con módulo 002 verificada.

---

**Versión**: 1.0 | **Completado**: 2026-10-19
