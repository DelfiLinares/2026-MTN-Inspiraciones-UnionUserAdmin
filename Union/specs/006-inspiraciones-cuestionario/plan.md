# Plan — 006 Cuestionario de Intereses (Frontend)

**Estado**: Borrador | **Fecha**: 2026-10-19

---

## 1. Visión del plan

Implementar un cuestionario frontend (React) que capture intereses artísticos, musicales y de pintura de usuarios no autenticados, valide respuestas, conserve estado, y prepare preferencias para transición a feed personalizado.

**Stack**: React + TypeScript + Vitest + React Testing Library.  
**Arquitectura**: Dominio → Aplicación → Presentación.  
**Alcance**: Frontend-only, sin backend en MVP.

---

## 2. Fases de implementación

### Fase 1: Configuración y dominio (2-3 días)
- [ ] Crear estructura de directorios.
- [ ] Implementar enums y value objects (OpcionRespuesta, Pregunta, RespuestaCuestionario, Preferencias).
- [ ] Implementar CuestionarioFactory.
- [ ] Tests unitarios de dominio (opciones válidas, selección/deselección, validación obligatoria).

### Fase 2: Aplicación y servicios (1-2 días)
- [ ] Implementar CuestionarioService (validación, transformación → preferencias).
- [ ] Crear DTO PreferenciasDTO.
- [ ] Tests unitarios de servicios.

### Fase 3: Presentación frontend (3-4 días)
- [ ] Crear componentes React:
  - CuestionarioPage (contenedor principal).
  - BienvenidaHeader (eslogan + título).
  - PreguntaForm (formulario de pregunta).
  - OpcionSelector (checkbox/radio para opción).
  - BotonContinuar (validación y navegación).
- [ ] Implementar manejo de estado (useState, hooks).
- [ ] Integrar estilos CSS responsivos.
- [ ] Tests de UI/integración (React Testing Library).

### Fase 4: Integración y ajustes (1 día)
- [ ] Flujo completo: cuestionario → validación → preferencias → transición a feed.
- [ ] Ajustes de UX/responsive design.
- [ ] Tests E2E.
- [ ] Documentación de código.

---

## 3. Estructura de directorios esperada

```
Union/frontend/
├── src/
│   ├── domain/
│   │   ├── enums/
│   │   │   ├── CategoriaInteres.ts
│   │   │   ├── GeneroMusical.ts
│   │   │   └── EstiloPintura.ts
│   │   ├── Pregunta.ts
│   │   ├── OpcionRespuesta.ts
│   │   ├── RespuestaCuestionario.ts
│   │   └── Preferencias.ts
│   ├── application/
│   │   ├── CuestionarioService.ts
│   │   ├── CuestionarioFactory.ts
│   │   └── dto/
│   │       └── PreferenciasDTO.ts
│   ├── presentation/
│   │   ├── cuestionario/
│   │   │   ├── CuestionarioPage.tsx
│   │   │   ├── BienvenidaHeader.tsx
│   │   │   ├── PreguntaForm.tsx
│   │   │   ├── OpcionSelector.tsx
│   │   │   ├── BotonContinuar.tsx
│   │   │   └── cuestionario.css
│   │   └── feed/
│   │       └── FeedPage.tsx (stub)
│   └── App.tsx (actualizar con rutas)
├── tests/
│   ├── domain/
│   │   ├── Pregunta.test.ts
│   │   ├── RespuestaCuestionario.test.ts
│   │   └── Preferencias.test.ts
│   ├── application/
│   │   ├── CuestionarioService.test.ts
│   │   └── CuestionarioFactory.test.ts
│   └── integration/
│       └── CuestionarioFlow.test.tsx
└── vitest.config.ts (actual, sin cambios)
```

---

## 4. Trazabilidad spec → plan → tareas

| Requisito spec.md | Artefacto en plan | Responsable (Fase) |
|---|---|---|
| HU-01 (Bienvenida) | BienvenidaHeader.tsx | Fase 3 |
| HU-02 (Intereses artísticos) | PreguntaForm + OpcionSelector | Fase 3 |
| HU-03 (Géneros musicales) | PreguntaForm + OpcionSelector | Fase 3 |
| HU-04 (Estilos de pintura) | PreguntaForm + OpcionSelector | Fase 3 |
| HU-05 (Seleccionar/deseleccionar) | OpcionSelector.tsx, RespuestaCuestionario | Fase 1, 3 |
| HU-06 (Validación obligatoria) | CuestionarioService, BotonContinuar | Fase 2, 3 |
| HU-07 (Finalización + feed) | CuestionarioPage → FeedPage (handoff) | Fase 3 |
| HU-08 (Usabilidad mobile) | CSS responsive | Fase 3, 4 |
| RF-01 (Eslogan) | BienvenidaHeader.tsx | Fase 3 |
| RF-03–RF-06 (Preguntas y opciones) | Pregunta, OpcionRespuesta, CuestionarioFactory | Fase 1 |
| RF-07 (Consistencia 002) | enums CategoriaInteres, GeneroMusical, EstiloPintura | Fase 1 |
| RF-08–RF-12 (Selección) | OpcionSelector, RespuestaCuestionario | Fase 1, 3 |
| RF-13–RF-15 (Conservación) | RespuestaCuestionario (immutable pattern) | Fase 1 |
| RF-16–RF-19 (Validación) | Pregunta.validarRespuesta, CuestionarioService | Fase 1, 2 |
| RF-20–RF-23 (Finalización) | BotonContinuar, CuestionarioService.transformarAPreferencias | Fase 2, 3 |
| RNF-20–RNF-24 (Testing) | Tests en todas las fases | Todas |

---

## 5. Criterios de aceptación por fase

### Fase 1: Dominio

- [ ] Enums `CategoriaInteres`, `GeneroMusical`, `EstiloPintura` compilables y tipados.
- [ ] `OpcionRespuesta` inmutable, con validación.
- [ ] `Pregunta` valida:
  - Solo opciones del catálogo.
  - Multiplicidad (única vs múltiple).
  - Obligatoriedad.
- [ ] `RespuestaCuestionario` (value object):
  - Seleccionar/deseleccionar sin mutar.
  - Validar completitud.
- [ ] `Preferencias` value object bien formado.
- [ ] `CuestionarioFactory.crearCuestionarioDefault()` retorna 3 preguntas.
- [ ] Tests > 80% de cobertura en domain.

### Fase 2: Aplicación

- [ ] `CuestionarioService.transformarAPreferencias()` transforma correctamente.
- [ ] `CuestionarioService.validar()` detecta campos obligatorios incompletos.
- [ ] `PreferenciasDTO` serializable (si se requiere).
- [ ] Tests > 80% de cobertura en application.

### Fase 3: Presentación

- [ ] `CuestionarioPage` renderiza correctamente.
- [ ] `BienvenidaHeader` muestra eslogan.
- [ ] `PreguntaForm` muestra 3 preguntas.
- [ ] `OpcionSelector` permite seleccionar/deseleccionar (visual feedback).
- [ ] `BotonContinuar` bloqueado si obligatoria vacía, habilitado si válida.
- [ ] Cambiar pregunta A no afecta pregunta B (estado conservado).
- [ ] Diseño responsive (mobile + desktop).
- [ ] Tests de UI > 60% de flujo crítico.

### Fase 4: Integración

- [ ] Flujo completo E2E: inicio → responder todas → validación → finalización → feed.
- [ ] Mensajes de error claros y visibles.
- [ ] UX sin lag o parpadeos.
- [ ] Documentación README con steps para correr y testear.

---

## 6. Decisiones arquitectónicas documentadas

| Decisión | Justificación | Alternativa rechazada |
|---|---|---|
| Dominio immutable | Value objects; facilita testing y evita mutaciones accidentales. | Clases mutables; menos predecible. |
| State en React hooks | Simple, sin Redux en MVP. | Redux; overkill para MVP. |
| Handoff memory object | Rápido, sin serialización. | URL params; frágil. |
| CSS inline/módulos | Simple, responsive. | Tailwind; puede agregarse futuro. |
| Vitest | Alineado con módulo 004. | Jest; pero Vitest es más rápido. |

---

## 7. Dependencias y riesgos

### Dependencias
- **Módulo 002**: Categorías de publicaciones deben estar definidas (A-2).
  - Mitigación: MVP usa enums hardcoded; sincronía manual documentada.

### Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Desincronización categorías con 002 | Media | Alto | Test de consistencia; revisar en integración. |
| Recarga pierde datos (A-10) | Cierto en MVP | Bajo | Documentado; localStorage es opción futura. |
| UX mobile pobre | Media | Medio | Responsive CSS + test en dispositivos reales. |
| Overengineering dominio | Baja | Bajo | Revisión de código en PR; patrón YAGNI. |

---

## 8. Testing strategy

### Tests unitarios (Domain)

Cobertura > 80%:
- `Pregunta.test.ts`: validación de selección, multiplicidad, obligatoriedad.
- `RespuestaCuestionario.test.ts`: seleccionar, deseleccionar, validar completitud.
- `Preferencias.test.ts`: transformación correcta, arrays sin duplicados.

### Tests de servicio (Application)

Cobertura > 80%:
- `CuestionarioService.test.ts`: transformación RespuestaCuestionario → Preferencias.
- `CuestionarioFactory.test.ts`: factory retorna preguntas válidas.

### Tests de UI/Integración (Presentation)

Cobertura > 60% (flujo crítico):
- `CuestionarioPage.test.tsx`: renderliza, interacción completa.
- `OpcionSelector.test.tsx`: selecciona/deselecciona, feedback visual.
- `BotonContinuar.test.tsx`: bloqueado si incompleta, habilitado si válida.
- `CuestionarioFlow.test.tsx`: E2E cuestionario → preferencias → feed.

### Tests de validación

Casos específicos:
- Solo opciones del catálogo permitidas.
- Pregunta múltiple: más de una opción.
- Pregunta única: máximo una opción.
- Obligatoria vacía: bloquea continuar.
- Opcional vacía: permite continuar.
- Cambio de respuesta no afecta otras.

---

## 9. Criterios de Definition of Done

- [ ] Código compilable y sin errores de TypeScript.
- [ ] Tests unitarios pasan (>80% cobertura dominio/aplicación).
- [ ] Tests de UI pasan (flujo crítico).
- [ ] Documentación en código (comentarios JSDoc en interfaces públicas).
- [ ] README.md actualizado con instrucciones de setup, desarrollo y testing.
- [ ] Trazabilidad spec.md → plan.md → tarea → código verificada.
- [ ] Revisión de código completada (pull request).
- [ ] Responsive design verificado en mobile + desktop.

---

## 10. Notas de integración futura

### Fase 5 (Futuro): Integración con backend

1. Reemplazar `CuestionarioFactory` para obtener cuestionarios de API:
   ```typescript
   const cuestionario = await fetch('/api/v1/cuestionarios/default');
   ```

2. Agregar guardar respuestas en backend:
   ```typescript
   const preferencias = await fetch('/api/v1/respuestas-cuestionario', {
     method: 'POST',
     body: JSON.stringify({ respuestas })
   });
   ```

3. Obtener publicaciones personalizadas en módulo feed:
   ```typescript
   const feed = await fetch('/api/v1/feed/personalizado', {
     method: 'POST',
     body: JSON.stringify({ preferencias })
   });
   ```

### Fase 6 (Futuro): Persistencia

- Agregar localStorage para guardar estado temporal:
  ```typescript
  localStorage.setItem('cuestionario_estado', JSON.stringify(estado));
  ```

---

## 11. Checklist de planificación

- [x] Constitution definida.
- [x] Spec.md completo.
- [x] Research.md completado.
- [x] Data-model.md definido.
- [x] Contracts (OpenAPI) listos.
- [ ] Plan.md (este documento) completado.
- [ ] Próximo: `/speckit.tasks` para generar tareas concretas.

---

**Versión**: 1.0 | **Completado**: 2026-10-19
