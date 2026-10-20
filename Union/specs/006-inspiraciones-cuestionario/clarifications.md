# Clarificaciones — 006 Cuestionario de Intereses

**Estado**: Activo | **Fecha de creación**: 2026-10-19 | **Fase**: Resolución de ambigüedades

Este documento resuelve las 10 ambigüedades (AMB-01 a AMB-10) documentadas en `spec.md § 9`.

---

## Tabla de decisiones

| ID | Ambigüedad | Resolución |
|---|---|---|
| **AMB-01** | ¿Las categorías del cuestionario son editables por un admin? | ✅ **RESUELTO**: Categorías fijas en enums. No hay UI admin en MVP. Futuro: panel admin. |
| **AMB-02** | ¿Cuántas preguntas del cuestionario hay? ¿Cuáles son? | ✅ **RESUELTO**: 3 preguntas (ver § 2). Opciones exactas en enums y plan.md. |
| **AMB-03** | ¿Las preguntas son siempre multi-selección? | ✅ **RESUELTO**: Depende por pregunta. Ver § 3 tabla de configuración. |
| **AMB-04** | ¿Qué sucede si todas las opciones se desmarcan? | ✅ **RESUELTO**: Si obligatoria, se bloquea. Si opcional, se permite. |
| **AMB-05** | ¿El eslogan de bienvenida es configurable? | ✅ **RESUELTO**: Texto fijo en MVP. Ver § 4 eslogan definido. |
| **AMB-06** | ¿Cómo se transmiten las preferencias al módulo de feed? | ✅ **RESUELTO**: Memory object + React Router. Ver § 5 opciones evaluadas. |
| **AMB-07** | ¿Hay un "tiempo máximo" para responder el cuestionario? | ✅ **RESUELTO**: No. No se implementa time limit en MVP. |
| **AMB-08** | ¿El usuario puede pausar y reanudar el cuestionario? | ✅ **RESUELTO**: No. Sin persistencia en MVP. Futuro: localStorage o backend. |
| **AMB-09** | ¿Qué sucede si la API de categorías no responde? | ✅ **RESUELTO**: No hay API. Categorías locales. Futuro: error handling. |
| **AMB-10** | ¿Se envía un evento/telemetría cuando el usuario completa el cuestionario? | ✅ **RESUELTO**: No. Sin telemetría en MVP. Futuro: analytics. |

---

## § 1. Visión rápida

El módulo 006 es **frontend-only, sin backend, sin persistencia** en MVP.

**Lo que SÍ existe:**
- ✅ React component que renderiza 3 preguntas.
- ✅ State React que captura respuestas en memoria.
- ✅ Validación de dominio (TypeScript enums).
- ✅ Transformación de respuestas → Preferencias.
- ✅ Handoff memory object al módulo feed.

**Lo que NO existe aún:**
- ❌ Backend Java.
- ❌ Base de datos.
- ❌ API REST.
- ❌ Admin UI para editar categorías.
- ❌ Persistencia (localStorage, sessionStorage, BD).
- ❌ Telemetría/analytics.
- ❌ Notificaciones.

---

## § 2. AMB-02: Definición de preguntas

**Resolución**: El cuestionario contiene exactamente **3 preguntas**.

### Pregunta 1: Intereses Artísticos (Obligatoria, Multi-selección)

**Texto**: "¿Cuáles son tus principales intereses artísticos?"

**Tipo**: Multi-selección (`permiteMultipleSelecciones = true`)

**Obligatoria**: Sí (`obligatoria = true`)

**Opciones** (exactas, sacadas de módulo 002):
```
- Dibujo
- Escultura
- Fotografía
- Literatura
- Escultura Digital
- Pintura Digital
- Instalación
- Performance
- Video Arte
- Cine y Audiovisual
```

**Validación**: Al menos 1 opción requerida.

**Nota importante**: Estas opciones DEBEN coincidir exactamente con `CategoriaInteres` enum en `domain/enums/CategoriaInteres.ts`. Si módulo 002 tiene una categoría diferente, se sincroniza primero (ver § 7).

---

### Pregunta 2: Géneros Musicales (Obligatoria, Multi-selección)

**Texto**: "¿Qué géneros musicales prefieres?"

**Tipo**: Multi-selección (`permiteMultipleSelecciones = true`)

**Obligatoria**: Sí (`obligatoria = true`)

**Opciones** (exactas, sacadas de módulo 002):
```
- Rock
- Pop
- Electrónica
- Metal
- K-pop
- Country
- Nacional
- Reggaetón
- Hip-Hop
- Clásica
- R&B
- Blues
```

**Validación**: Al menos 1 opción requerida.

**Nota importante**: Debe coincidir con `GeneroMusical` enum.

---

### Pregunta 3: Estilos de Pintura (Opcional, Multi-selección)

**Texto**: "¿Qué estilos de pintura te interesan? (Opcional)"

**Tipo**: Multi-selección (`permiteMultipleSelecciones = true`)

**Obligatoria**: No (`obligatoria = false`)

**Opciones** (exactas):
```
- Realismo
- Abstracción
- Impresionismo
- Surrealismo
- Expresionismo
- Cubismo
- Fauvismo
- Dadaísmo
- Constructivismo
- Pop Art
```

**Validación**: 0 o más opciones permitidas. Puede quedar vacía.

**Nota importante**: Debe coincidir con `EstiloPintura` enum.

---

### Configuración resumida

| Pregunta | ID | Obligatoria | Multi-selección | Min opciones | Max opciones | Estado |
|---|---|---|---|---|---|---|
| 1. Intereses Artísticos | `artistica` | Sí | Sí | 1 | N | ✅ |
| 2. Géneros Musicales | `musical` | Sí | Sí | 1 | N | ✅ |
| 3. Estilos de Pintura | `pintura` | No | Sí | 0 | N | ✅ |

---

## § 3. AMB-03: Tipos de selección

**Resolución**: Todas las preguntas del MVP son **multi-selección**.

No hay preguntas de radio button (selección única) en esta fase.

```typescript
// Pseudocódigo
const preguntas = [
  new Pregunta(
    "artistica",
    "¿Cuáles son tus principales intereses artísticos?",
    [OpcionRespuesta(...)],
    permiteMultipleSelecciones: true,  // ✅
    obligatoria: true
  ),
  new Pregunta(
    "musical",
    "¿Qué géneros musicales prefieres?",
    [OpcionRespuesta(...)],
    permiteMultipleSelecciones: true,  // ✅
    obligatoria: true
  ),
  new Pregunta(
    "pintura",
    "¿Qué estilos de pintura te interesan? (Opcional)",
    [OpcionRespuesta(...)],
    permiteMultipleSelecciones: true,  // ✅
    obligatoria: false
  ),
];
```

**Render en UI**: Checkboxes para todas.

---

## § 4. AMB-05: Eslogan de bienvenida

**Resolución**: El eslogan es **texto fijo, hardcoded** en MVP.

### Eslogan oficial

```
"Descubre inspiraciones artísticas acordes a tus gustos"
```

**Ubicación en código**: Crear constante en `src/presentation/cuestionario/constants.ts`:

```typescript
export const ESLOGAN_BIENVENIDA = "Descubre inspiraciones artísticas acordes a tus gustos";
```

**Render**: En componente `BienvenidaHeader.tsx`:

```typescript
export const BienvenidaHeader: React.FC = () => (
  <header className="bienvenida-header">
    <h1>{ESLOGAN_BIENVENIDA}</h1>
    <p>Personaliza tu experiencia respondiendo estas preguntas.</p>
  </header>
);
```

**Futuro**: Si se requiere dinámico, backend proporciona vía API.

**Notas de UX**:
- Máximo 2-3 líneas.
- Texto atractivo, invitando a descubrir.
- Coherente con identidad visual de la red social.
- Responsive: se ajusta a pantalla sin truncarse.

---

## § 5. AMB-06: Transmisión de preferencias al feed

**Resolución**: Usar **memory object** + **React Router**.

### Opción ganadora: Memory object

**Mecanismo**:
1. Usuario completa cuestionario.
2. `CuestionarioService.transformarAPreferencias()` retorna:
   ```typescript
   {
     interesesArtisticos: [CategoriaInteres.DIBUJO, ...],
     generosMusical: [GeneroMusical.ROCK, ...],
     estilosPintura: [EstiloPintura.REALISMO, ...]
   }
   ```
3. Componente `CuestionarioPage` guarda en state.
4. Navega a `/feed` pasando preferencias vía React Router `useLocation()` state.

**Código**:

```typescript
// CuestionarioPage.tsx
const navigate = useNavigate();

const manejarContinuar = async () => {
  if (!respuestas.validarCompletitud(preguntas).valida) {
    setError("Completa todas las preguntas obligatorias");
    return;
  }

  const preferencias = CuestionarioService.transformarAPreferencias(respuestas, preguntas);

  // Navegar al feed, pasando preferencias en state
  navigate("/feed", {
    state: { preferencias }
  });
};
```

**En FeedPage.tsx**:

```typescript
const location = useLocation();
const preferencias = location.state?.preferencias;

useEffect(() => {
  if (!preferencias) {
    // Redirect a cuestionario si no hay preferencias
    navigate("/cuestionario");
    return;
  }
  // Usar preferencias para renderizar feed personalizado
}, [preferencias, navigate]);
```

### Opciones descartadas

| Opción | Ventaja | Desventaja | Resultado |
|---|---|---|---|
| **URL query params** | Visible en URL | Frágil si muchas categorías | ❌ Descartada |
| **localStorage** | Persiste en recarga | Requiere clean-up | ❌ Descartada (MVP) |
| **Redux** | State global | Overkill para MVP | ❌ Descartada |
| **Memory object** | Simple, React-like | Se pierde en F5 | ✅ **ELEGIDA** |

### Consideración futura

Si en iteración 2 se requiere persistencia (recarga sin perder), cambiar a `sessionStorage`:

```typescript
sessionStorage.setItem("cuestionarioPreferencias", JSON.stringify(preferencias));
// En feed:
const preferencias = JSON.parse(sessionStorage.getItem("cuestionarioPreferencias"));
```

---

## § 6. AMB-04: Deseleccionar todas las opciones

**Resolución**:

| Escenario | Resultado |
|---|---|
| **Pregunta obligatoria, todas deseleccionadas** | ❌ Se bloquea continuar. Mensaje: "Debes seleccionar al menos una opción en [Nombre Pregunta]" |
| **Pregunta opcional, todas deseleccionadas** | ✅ Se permite continuar. Array vacío en preferencias. |

**Validación en dominio**:

```typescript
// Pregunta.ts
validarRespuesta(idsSeleccionados: string[]): { valida: boolean; error?: string } {
  if (this.obligatoria && idsSeleccionados.length === 0) {
    return {
      valida: false,
      error: `${this.texto}: selecciona al menos una opción`
    };
  }
  
  // Validar que todas las IDs existen
  for (const id of idsSeleccionados) {
    if (!this.opciones.some(op => op.id === id)) {
      return {
        valida: false,
        error: `Opción inválida en ${this.texto}`
      };
    }
  }
  
  return { valida: true };
}
```

---

## § 7. Sincronía con módulo 002: Check crítico

**Regla**: Las categorías de enum en módulo 006 DEBEN coincidir exactamente con filtros en módulo 002.

### Verificación antes de implementación

**Action items**:

1. **Acceder a módulo 002**:
   ```bash
   cd Union/specs/002-inspiraciones-publicaciones
   cat spec.md | grep -A 50 "categorías\|filtros"
   ```

2. **Extraer categorías de 002** (aproximadamente):
   - Artísticas: Dibujo, Escultura, Fotografía, Literatura, Escultura Digital, Pintura Digital, Instalación, Performance, Video Arte, Cine
   - Musicales: Rock, Pop, Electrónica, Metal, K-pop, Country, Nacional, Reggaetón, Hip-Hop, Clásica, R&B, Blues
   - Pintura: Realismo, Abstracción, Impresionismo, Surrealismo, Expresionismo, Cubismo

3. **Crear archivo de sincronía**:
   ```
   Union/specs/006-inspiraciones-cuestionario/SINCRONÍA-002.md
   ```
   Con tabla comparativa.

4. **Test de sincronía**:
   ```typescript
   // tests/integration/SincroniaModulo002.test.ts
   test('Categorías 006 coinciden con filtros 002', () => {
     const categoriasEsperadas = [/* del módulo 002 */];
     const categoriasEnEnum = Object.values(CategoriaInteres);
     
     for (const cat of categoriasEsperadas) {
       expect(categoriasEnEnum).toContain(cat);
     }
   });
   ```

5. **Si hay desincronía**:
   - ⚠️ STOP: No implementar hasta sincronizar.
   - Comunicar al team.
   - Actualizar enums en ambos módulos simultáneamente.
   - Correr test.

---

## § 8. Decisiones menores resueltas

### AMB-01: Categorías editables por admin
- **Decisión**: NO en MVP.
- **Futuro**: Fase 2, admin UI para CRUD de categorías.
- **Constraint**: Manteniendo sincronía con módulo 002.

### AMB-07: Tiempo máximo para responder
- **Decisión**: NO timer.
- **Futuro**: Si UX lo requiere, agregar timer visual.

### AMB-08: Pausar y reanudar
- **Decisión**: NO pausas en MVP.
- **Futuro**: Require sesión de usuario o ID de sesión anónimo.

### AMB-09: API de categorías no responde
- **Decisión**: NO HAY API en MVP. Categorías son enums locales.
- **Futuro**: Cuando se agregue API, implementar error handling.

### AMB-10: Telemetría al completar
- **Decisión**: NO telemetría en MVP.
- **Futuro**: Analytics/eventos cuando se requiera.

---

## § 9. Checklist de implementación

Antes de empezar a escribir código, verificar:

- [ ] Sincronía con módulo 002 verificada (§ 7).
- [ ] Enums definidos con 10 artísticas, 12 musicales, 10 pintura.
- [ ] 3 preguntas con configuración exacta (§ 2).
- [ ] Eslogan definido como constante (§ 4).
- [ ] Mecanismo de transmisión: React Router + memory object (§ 5).
- [ ] Validación de obligatorias implementada (§ 6).
- [ ] Test de sincronía escrito y pasando.
- [ ] README actualizado con decisiones.
- [ ] Team alineado en decisiones (especialmente § 2, § 5, § 7).

---

## § 10. FAQ rápido

**P: ¿Puedo cambiar el número de preguntas?**  
A: No sin aprobación de team. Afecta sincronía con 002 y UX.

**P: ¿Puedo agregar un campo de nombre/email?**  
A: No. Spec dice "sin datos personales". Futuro: tras autenticación.

**P: ¿Puedo usar Redux en lugar de memory object?**  
A: No. MVP simple. Futuro: si estado global se complejiza.

**P: ¿Qué pasa si usuario no selecciona ninguna pregunta opcional?**  
A: Se permite. Preferencias.estilosPintura = [] (array vacío).

**P: ¿El backend obtiene automáticamente las preferencias?**  
A: No. El feed debe pedirlas. Handoff es responsabilidad de arquitectura app-level.

**P: ¿Hay API en el frontend para consultar categorías?**  
A: No en MVP. Son enums. Futuro: endpoint GET /api/categorías.

**P: ¿Se guardan respuestas en localStorage?**  
A: No en MVP. Se pierden con F5. Futuro: sessionStorage o BD.

**P: ¿Hay limitación de tiempo para responder?**  
A: No.

**P: ¿Se puede editar preguntas desde una UI admin?**  
A: No en MVP. Futuro: admin panel.

**P: ¿Se envía telemetría cuando completo?**  
A: No en MVP. Futuro: analytics.

---

## Resumen ejecutivo

| Aspecto | Resolución | Estado |
|---|---|---|
| **Número de preguntas** | 3 (artística, musical, pintura) | ✅ Fijo |
| **Tipo de selección** | Multi para todas | ✅ Fijo |
| **Obligatorias** | 2 primeras; 3ª opcional | ✅ Fijo |
| **Eslogan** | Texto hardcoded | ✅ Fijo |
| **Transmisión preferencias** | Memory object + React Router | ✅ Fijo |
| **Persistencia** | Ninguna (MVP) | ✅ Por diseño |
| **Admin editable** | No (MVP) | ✅ Futuro |
| **Telemetría** | No (MVP) | ✅ Futuro |
| **Sincronía 002** | Crítica, verificar antes de implementar | ⚠️ Action item |

---

**Versión**: 1.0 | **Estado**: ✅ Resuelto | **Fecha**: 2026-10-19

> **Siguiente paso**: Ejecutar `/speckit.tasks` para generar tareas concretas.
