# Research — 006 Cuestionario de Intereses (Frontend)

**Estado**: Completado | **Fecha**: 2026-10-19

---

## 1. Investigación de contexto

### 1.1 Módulo relacionado: 002 (Publicaciones)

**Hallazgo**: El módulo 002 define categorías de filtros de publicaciones. Estas mismas categorías DEBEN usarse en el cuestionario (ver spec.md § 9, RNF-23, A-2).

**Referencia en 002-inspiraciones-publicaciones/spec.md**:
- Tipos de contenido: imagen (png, jpeg), video (mp4, avi), audio (mp3).
- Categorías/etiquetas: no explícitamente enumeradas en spec 002, pero mencionadas en filtros y búsqueda (RF-06 HU-06).
- Nota: En futuras iteraciones, estas categorías se sincronizarán vía API o enum compartido.

**Decisión de diseño**: Crear enums locales en dominio del cuestionario alineados con lo que se esperaría de publicaciones:
- `CategoriaInteres` (intereses artísticos).
- `GeneroMusical` (géneros musicales).
- `EstiloPintura` (estilos/técnicas de pintura).

**Riesgo identificado**: Si 002 define categorías distintas en futuro, habrá desincronización. Mitigation: documentar sincronía como requisito en plan.md.

---

### 1.2 Stack tecnológico y arquitectura

**Frontend**: React + TypeScript (alineado con otros módulos).

**Validaciones**:
- Client-side: inmediatas (UI feedback).
- Server-side (futuro): backend validará permisos y datos.

**Estado**: En-memoria durante sesión del cuestionario. Sin persistencia en localStorage/sessionStorage en MVP (A-1).

**Integración futura**:
- Handoff de preferencias al módulo de feed vía objeto `Preferencias`.
- Contrato pendiente: DTO, formato, mecanismo (memory object, query params, route state).

---

### 1.3 Componentes similares en el repositorio

**Módulo 004 (Perfil)**:
- Usa React + TypeScript.
- Patrón: Dominio → Aplicación (Servicios) → Presentación (React).
- Testing: Vitest.
- Referencia: `/Union/frontend/src/domain/`, `/src/application/`, `/src/presentation/`.

**Módulo 002 (Publicaciones)**:
- Definición de filtros, búsqueda.
- Patrón de categorías: enums en dominio.

**Conclusión**: Replicar arquitectura de 004 para 006.

---

### 1.4 Patrón de selección multi-opción

**Investigación**: ¿Cómo manejar selección de múltiples opciones de forma segura y testeable?

**Patrón identificado (basado en 004)**:
- Dominio: `Pregunta` con atributo `permiteMultipleSelecciones: boolean`.
- Aplicación: `RespuestaCuestionario` valida selecciones contra catálogo de opciones.
- Presentación: Checkboxes (multi) o radio buttons (única).

**Validaciones en dominio**:
- Opción está en catálogo.
- Si `permiteMultipleSelecciones === false` y ya hay selección, rechazar nueva (o reemplazar).
- Si `obligatoria === true`, validar al menos una selección al finalizar.

---

### 1.5 Flujo de conservación de respuestas

**Investigación**: ¿Cómo conservar estado sin perder datos si el usuario cambia preguntas?

**Patrón identificado**:
- `RespuestaCuestionario` es un value object que almacena map de respuestas: `Map<idPregunta, Set<opcionesSeleccionadas>>`.
- Cada selección/deselección actualiza la map sin afectar otras.
- Al finalizar, se transforma en `Preferencias` (value object más específico para feed).

**Testing**: Validar que cambios en una pregunta no afectan otras.

---

### 1.6 Eslogan y bienvenida

**Investigación**: ¿Dónde vive el eslogan? ¿Es configurable?

**Decisión de diseño**:
- MVP: Texto hardcoded en componente React (o constante en util/constants).
- Futuro: Backend proporciona vía API.
- Ejemplo de eslogan: "Descubre inspiraciones artísticas acordes a tus gustos" o "Tu feed personalizado te espera".

**Alternativa**: Archivo i18n (si se requiere multiidioma futuro).

---

### 1.7 Validación de categorías sincronizadas

**Investigación**: ¿Cómo verificar que categorías del cuestionario coinciden con filtros de publicaciones?

**Patrón de test**:
- Test de dominio: compara enums del cuestionario con enum compartido / o con lista hardcoded de categorías esperadas.
- Test de integración: verifica que UI permite seleccionar solo opciones en catálogo.

**Documentación**: En `data-model.md` listar categorías esperadas con referencias a 002.

---

### 1.8 Caso borde: Recarga de página

**Investigación**: ¿Qué sucede si usuario recarga durante cuestionario?

**Decisión (spec.md A-10)**: Respuestas se pierden en MVP. Usuario recomienza.

**Alternativa futuro**: localStorage para persistence ephemeral.

**Implicación para testing**: No testear recuperación en este sprint; documentar como limitación.

---

### 1.9 Transición al feed personalizado

**Investigación**: ¿Cómo se comunica con el módulo de feed?

**Opciones identificadas**:
1. **Memory object**: Componente padre (App.tsx) mantiene `Preferencias` en estado; pasa al componente Feed cuando renderiza.
2. **Query params**: URL como `/feed?interesArtistico=dibujo&generoMusical=rock,pop&...` (frágil, poco escalable).
3. **URL state (React Router)**: `navigate('/feed', { state: { preferencias } })`.
4. **Redux/Context API**: Store compartido.

**Recomendación**: Opción 1 (memory) para MVP. Opción 3 (URL state) si se requiere separación de SPA.

**Documentación**: Definir en `contracts/` el DTO `Preferencias` que se pasa.

---

### 1.10 Testing: Estrategia de cobertura

**Investigación**: ¿Qué reglas son "importantes" (RNF-24)?

**Reglas críticas identificadas** (de spec.md):
- RF-07: Opciones provienen del catálogo (invariante de dominio).
- RF-08/09/10: Selección/deselección funciona según tipo pregunta.
- RF-16/17/18: Validación obligatoria bloquea si incompleta.
- RF-22/23: Preferencias transformadas correctamente.

**Estrategia**:
- **Domain tests** (Vitest): Pregunta, OpcionRespuesta, RespuestaCuestionario, Preferencias.
- **Service tests** (Vitest): Validación, transformación de respuestas → preferencias.
- **Integration/UI tests** (React Testing Library): Flujo completo usuario, selección visual, botón continuar.

**Cobertura esperada**: >80% (al menos en dominio y servicios críticos).

---

## 2. Decisiones de diseño documentadas

| Decisión | Justificación | Alternativa considerada |
|---|---|---|
| Enums locales para categorías | MVP rápido; sincronía futura vía API. | Hardcoded en constantes; pero enums son más type-safe. |
| Estado en-memoria sin persistence | Spec.md A-1: recarga pierde datos. Simplifica MVP. | localStorage, pero agrega complexity. |
| Memory object para handoff | Simple, no requiere routing. | URL state si se necesita SPA separada. |
| Texto eslogan hardcoded | MVP. | Backend config (futuro). |
| Tests en Vitest | Alineado con módulo 004. | Jest; pero Vitest es más rápido. |

---

## 3. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Categorías desincronizadas con 002 en futuro | Media | Alto | Documentar sincronía como requisito; test de consistencia. |
| Complejidad de validación multi-pregunta | Baja | Medio | Usar value object `RespuestaCuestionario` con lógica clara. |
| UX pobre en mobile | Media | Medio | Responsive design en CSS; test en dispositivos. |
| Pérdida de datos en recarga | Alta | Bajo | Esperado en MVP (A-1); usuario recomienza. |
| Desalineación con especificación | Media | Alto | Reviews frecuentes de trazabilidad spec → plan → tarea. |

---

## 4. Referencias técnicas

- **Módulo 004 (Perfil)**: Patrón dominio/aplicación/presentación.
- **Módulo 002 (Publicaciones)**: Definición de categorías (futuro sincronizado).
- **React Testing Library**: Para tests UI.
- **Vitest**: Para tests unitarios/integración.
- **TypeScript**: Tipado fuerte en dominio.

---

**Versión**: 1.0 | **Completado**: 2026-10-19
