# Tasks — 006 Cuestionario de Intereses (Frontend)

**Estado**: Activo | **Fecha de creación**: 2026-10-19 | **Fase**: Generación de tareas de implementación

Este documento genera tareas concretas (T001–T048) para implementar el módulo 006 según especificación. Cada tarea mapea a requisitos en `spec.md`, decisiones en `clarifications.md`, y arquitectura en `plan.md`.

---

## Resumen ejecutivo

| Fase | Tareas | Duración estimada | Paralelizable |
|---|---|---|---|
| 1. Setup frontend | T001–T003 | 1 día | ✅ Parcialmente |
| 2. Modelo de datos y categorías | T004–T012 | 2–3 días | ✅ Sí (enums independientes) |
| 3. Componentes base | T013–T017 | 1–2 días | ✅ Sí |
| 4. Preguntas y opciones | T018–T025 | 2 días | ✅ Sí (preguntas paralelas) |
| 5. Selección y validación | T026–T034 | 2–3 días | ✅ Sí |
| 6. Estado y conservación | T035–T039 | 1–2 días | ⚠️ Parcialmente |
| 7. Preferencias para feed | T040–T042 | 1 día | ⚠️ Dependencias |
| 8. Integración API futura | T043–T044 | 0.5 días | ✅ Documentación |
| 9. Validación UI | T045–T047 | 1–2 días | ✅ Sí |
| 10. Revisión final | T048 | 1 día | ❌ No |

**Total estimado**: 11–18 días (asumiendo 1 developer FT).

---

## Leyenda

| Símbolo | Significado |
|---|---|
| **[P]** | Tarea paralelizable (puede ejecutarse simultáneamente con otras) |
| **→** | Tarea dependiente de otra |
| **RF-XX** | Requisito funcional (spec.md § 6) |
| **RNF-XX** | Requisito no funcional (spec.md § 7) |
| **A-X** | Aclaración (clarifications.md) |

---

---

# FASE 1: SETUP DEL FRONTEND

## T001: Crear estructura de directorios base

**Descripción**: Crear estructura de carpetas para módulo 006 según `plan.md § 4`.

**Archivos a crear**:
```
src/domain/enums/
src/domain/entities/
src/application/services/
src/application/dto/
src/presentation/cuestionario/
src/presentation/feed/
tests/domain/
tests/application/
tests/integration/
```

**Entrada**: Nada (inicio).

**Salida**: Estructura de directorios lista.

**Criterios de aceptación**:
- [ ] Directorios creados (no requiere código).
- [ ] Estructura coincide con `plan.md § 4`.
- [ ] Listo para T002–T003.

**Duración**: 0.5 días

**Dependencias**: Ninguna.

**Notas**: Puede paralelizarse con T002.

---

## T002: Configurar vitest y tests setup [P]

**Descripción**: Configurar Vitest para tests de dominio, aplicación e integración.

**Archivos a modificar/crear**:
- `Union/frontend/vitest.config.ts` — agregar paths si es necesario
- `tests/setupTests.ts` — extender setup si es necesario
- `tests/domain/` — crear `example.test.ts` (template)
- `tests/application/` — crear `example.test.ts` (template)
- `tests/integration/` — crear `example.test.ts` (template)

**Entrada**: T001 completado.

**Salida**: Vitest configurado, tests corren sin error.

**Criterios de aceptación**:
- [ ] `npm run test` corre sin error.
- [ ] Templates de tests existen.
- [ ] Coverage reports generados.
- [ ] Documentación en README actualizada.

**Duración**: 0.5 días

**Dependencias**: T001.

**Notas**: [P] Puede correr paralelo con T003.

---

## T003: Crear README del módulo 006 [P]

**Descripción**: Documentar setup, estructura y cómo ejecutar tests.

**Archivos a crear**:
- `Union/specs/006-inspiraciones-cuestionario/IMPLEMENTATION_GUIDE.md` — guía de implementación

**Entrada**: T001 completado.

**Salida**: README con instrucciones claras.

**Criterios de aceptación**:
- [ ] Instrucciones de setup claras.
- [ ] Comandos de test documentados.
- [ ] Estructura de directorios explicada.
- [ ] Referencias a spec.md, plan.md, data-model.md.

**Duración**: 0.5 días

**Dependencias**: T001.

**Notas**: [P] Documentación, no bloquea otras tareas.

---

---

# FASE 2: MODELO DE DATOS Y CATEGORÍAS DE INTERESES

## T004: Implementar enum CategoriaInteres [P]

**Descripción**: Crear enum con 10 categorías de intereses artísticos según `clarifications.md § 2`.

**Archivos a crear**:
- `Union/frontend/src/domain/enums/CategoriaInteres.ts`

**Requisitos**: RF-06, RF-07, A-2

**Entrada**: T001.

**Salida**: Enum compilable, exportable.

**Criterios de aceptación**:
- [ ] 10 valores: Dibujo, Escultura, Fotografía, Literatura, EsculuraDigital, PinturaDigital, Instalacion, Performance, VideoArte, CineAudiovisual.
- [ ] TypeScript tipado.
- [ ] Valores coinciden con módulo 002 (verificado con test en T011).
- [ ] Compilable (`npm run build`).
- [ ] No hay errores de linter.

**Duración**: 0.5 días

**Dependencias**: T001.

**Notas**: [P] Enum independiente. Crear tres enums en paralelo (T004, T005, T006).

---

## T005: Implementar enum GeneroMusical [P]

**Descripción**: Crear enum con 12 géneros musicales según `clarifications.md § 2`.

**Archivos a crear**:
- `Union/frontend/src/domain/enums/GeneroMusical.ts`

**Requisitos**: RF-06, RF-07, A-2

**Entrada**: T001.

**Salida**: Enum compilable, exportable.

**Criterios de aceptación**:
- [ ] 12 valores: Rock, Pop, Electronica, Metal, KPop, Country, Nacional, Reggaeton, HipHop, Clasica, RB, Blues.
- [ ] TypeScript tipado.
- [ ] Valores coinciden con módulo 002 (verificado con test en T011).
- [ ] Compilable.
- [ ] Sin errores de linter.

**Duración**: 0.5 días

**Dependencias**: T001.

**Notas**: [P] Enum independiente.

---

## T006: Implementar enum EstiloPintura [P]

**Descripción**: Crear enum con 10 estilos de pintura según `clarifications.md § 2`.

**Archivos a crear**:
- `Union/frontend/src/domain/enums/EstiloPintura.ts`

**Requisitos**: RF-06, RF-07, A-2

**Entrada**: T001.

**Salida**: Enum compilable, exportable.

**Criterios de aceptación**:
- [ ] 10 valores: Realismo, Abstraccion, Impresionismo, Surrealismo, Expresionismo, Cubismo, Fauvismo, Dadaismo, Constructivismo, PopArt.
- [ ] TypeScript tipado.
- [ ] Valores coinciden con módulo 002 (verificado con test en T011).
- [ ] Compilable.
- [ ] Sin errores de linter.

**Duración**: 0.5 días

**Dependencias**: T001.

**Notas**: [P] Enum independiente.

---

## T007: Crear clase OpcionRespuesta (dominio) [P]

**Descripción**: Implementar value object OpcionRespuesta con id, categoría, descripción.

**Archivos a crear**:
- `Union/frontend/src/domain/entities/OpcionRespuesta.ts`

**Requisitos**: RF-06, RNF-20, RNF-21

**Entrada**: T004, T005, T006.

**Salida**: Clase OpcionRespuesta inmutable, tipada.

**Criterios de aceptación**:
- [ ] Constructor recibe: `(id: string, categoria: CategoriaInteres | GeneroMusical | EstiloPintura, descripcion: string)`.
- [ ] Propiedades: `id`, `categoria`, `descripcion` (readonly).
- [ ] Métodos: getter para cada propiedad.
- [ ] Validación: id y descripción no vacíos.
- [ ] Immutable: no setters.
- [ ] Compilable.
- [ ] Unit tests > 80% (T008).

**Duración**: 0.5 días

**Dependencias**: T004, T005, T006.

**Notas**: [P] Value object, sin lógica de negocio compleja.

---

## T008: Tests para OpcionRespuesta [P]

**Descripción**: Tests unitarios para OpcionRespuesta: construcción, getters, validación.

**Archivos a crear**:
- `Union/frontend/tests/domain/OpcionRespuesta.test.ts`

**Requisitos**: RNF-24, A-2

**Entrada**: T007.

**Salida**: Tests > 80% cobertura.

**Criterios de aceptación**:
- [ ] Test construcción válida.
- [ ] Test construcción inválida (id vacío, descripción vacía).
- [ ] Test getters retornan valores correctos.
- [ ] Test immutabilidad (no se puede reasignar propiedades).
- [ ] Todos los tests pasan.
- [ ] Cobertura ≥ 80%.

**Duración**: 0.5 días

**Dependencias**: T007.

**Notas**: [P] Tests independientes.

---

## T009: Crear clase Pregunta (dominio)

**Descripción**: Implementar entity Pregunta con validación de respuestas según `data-model.md`.

**Archivos a crear**:
- `Union/frontend/src/domain/entities/Pregunta.ts`

**Requisitos**: RF-03, RF-04, RF-05, RF-11, RF-12, RNF-20, RNF-21

**Entrada**: T007.

**Salida**: Clase Pregunta con métodos de validación.

**Criterios de aceptación**:
- [ ] Constructor: `(id: string, texto: string, opciones: OpcionRespuesta[], permiteMultipleSelecciones: boolean, obligatoria: boolean)`.
- [ ] Propiedades: todas readonly.
- [ ] Método `validarRespuesta(idsSeleccionados: string[]): {valida: boolean, error?: string}`.
  - Valida que obligatoria tenga ≥1 respuesta.
  - Valida que todas las IDs existan en opciones.
  - Valida multi-selección si está permitida.
- [ ] Método `obtenerOpcion(id: string): OpcionRespuesta | undefined`.
- [ ] Validación de invariantes: al menos 1 opción, opciones únicas por ID.
- [ ] Compilable.
- [ ] Unit tests > 80% (T010).

**Duración**: 1 día

**Dependencias**: T007.

**Notas**: Core de validación. No paralelizable (complejidad media).

---

## T010: Tests para Pregunta

**Descripción**: Tests unitarios exhaustivos para Pregunta: validación de respuestas, casos borde.

**Archivos a crear**:
- `Union/frontend/tests/domain/Pregunta.test.ts`

**Requisitos**: RNF-24, RF-11, RF-12, A-4

**Entrada**: T009.

**Salida**: Tests > 80% cobertura.

**Criterios de aceptación**:
- [ ] Test obligatoria vacía → error.
- [ ] Test obligatoria con ≥1 selección → válida.
- [ ] Test opcional vacía → válida.
- [ ] Test opción fuera del catálogo → error.
- [ ] Test multi-selección bloqueada cuando `permiteMultipleSelecciones = false` y idsSeleccionados.length > 1 → error.
- [ ] Test obtenerOpcion() retorna correctamente.
- [ ] Test invariantes de construcción (opciones vacías, duplicados).
- [ ] Cobertura ≥ 80%.
- [ ] Todos pasan.

**Duración**: 1 día

**Dependencias**: T009.

**Notas**: Tests críticos. Incluir casos borde.

---

## T011: Tests de sincronía con módulo 002

**Descripción**: Test de integración que verifica que enums 006 coinciden exactamente con categorías 002.

**Archivos a crear**:
- `Union/frontend/tests/integration/SincroniaModulo002.test.ts`

**Requisitos**: A-2, RNF-23

**Entrada**: T004, T005, T006.

**Salida**: Test de sincronía documentado.

**Criterios de aceptación**:
- [ ] Test lee enums 006: CategoriaInteres, GeneroMusical, EstiloPintura.
- [ ] Test verifica contra spec.md del módulo 002 (o archivo de referencia).
- [ ] Test falla si hay desincronía.
- [ ] Documentar en comments: lista exacta de categorías esperadas.
- [ ] Test pasa con enums creados en T004–T006.
- [ ] Si falla: generar reporte de desincronía.

**Duración**: 0.5 días

**Dependencias**: T004, T005, T006.

**Notas**: **Crítico**: si falla, no proceder a T012+. Comunicar al team.

---

## T012: Crear clase RespuestaCuestionario (dominio)

**Descripción**: Implementar entity RespuestaCuestionario que gestiona respuestas por pregunta (Map inmutable).

**Archivos a crear**:
- `Union/frontend/src/domain/entities/RespuestaCuestionario.ts`

**Requisitos**: RF-08, RF-09, RF-13, RF-14, RF-15, RNF-20, RNF-21

**Entrada**: T009.

**Salida**: Clase RespuestaCuestionario con métodos de selección.

**Criterios de aceptación**:
- [ ] Estructura interna: `Map<idPregunta: string, Set<idOpcion: string>>`.
- [ ] Constructor: por defecto vacío o recibe Map inicial.
- [ ] Método `seleccionar(idPregunta: string, idOpcion: string): RespuestaCuestionario` → retorna nueva instancia (immutable).
- [ ] Método `deseleccionar(idPregunta: string, idOpcion: string): RespuestaCuestionario` → retorna nueva instancia.
- [ ] Método `obtenerRespuesta(idPregunta: string): Set<string>` → retorna Set de IDs seleccionados.
- [ ] Método `validarCompletitud(preguntas: Pregunta[]): {valida: boolean, errores?: Map<string, string>}` → valida todas obligatorias.
- [ ] Immutable: no mutación directa.
- [ ] Compilable.
- [ ] Unit tests > 80% (tests en T013 aprox, o integración en T034).

**Duración**: 1 día

**Dependencias**: T009.

**Notas**: Core de estado. Diseño inmutable crítico.

---

---

# FASE 3: COMPONENTES BASE

## T013: Crear componente BienvenidaHeader [P]

**Descripción**: React component que renderiza eslogan de bienvenida.

**Archivos a crear**:
- `Union/frontend/src/presentation/cuestionario/BienvenidaHeader.tsx`
- `Union/frontend/src/presentation/cuestionario/cuestionario.css` (parcial)
- `Union/frontend/src/presentation/cuestionario/constants.ts` — eslogan

**Requisitos**: HU-01, RF-01, RF-02, RNF-01, RNF-02, RNF-10, A-5

**Entrada**: T001.

**Salida**: Component renderizado, styled, responsive.

**Criterios de aceptación**:
- [ ] Renderiza eslogan: "Descubre inspiraciones artísticas acordes a tus gustos".
- [ ] Eslogan en archivo constants.ts.
- [ ] Responsive: se ajusta a mobile y desktop.
- [ ] Styling: breve, atractivo, coherente con identidad (usar variables CSS).
- [ ] Compilable.
- [ ] Unit test renderiza correctamente (T015 o similar).

**Duración**: 0.5 días

**Dependencias**: T001.

**Notas**: [P] Component simple, UI-focused.

---

## T014: Crear componente PreguntaForm [P]

**Descripción**: React component que renderiza una pregunta con opciones (checkboxes).

**Archivos a crear**:
- `Union/frontend/src/presentation/cuestionario/PreguntaForm.tsx`
- `Union/frontend/src/presentation/cuestionario/cuestionario.css` (parcial)

**Requisitos**: HU-02, HU-03, HU-04, RF-08, RF-09, RF-10, RNF-03, RNF-04, RNF-05

**Entrada**: T009 (Pregunta class).

**Salida**: Component renderizado, tipado.

**Criterios de aceptación**:
- [ ] Props: `pregunta: Pregunta`, `respuestasSeleccionadas: Set<string>`, `onSeleccionar: (idOpcion: string) => void`, `onDeseleccionar: (idOpcion: string) => void`.
- [ ] Renderiza título (texto de pregunta).
- [ ] Renderiza opciones como checkboxes.
- [ ] Checkboxes tienen label legible.
- [ ] Checked si opción en `respuestasSeleccionadas`.
- [ ] onClick llama `onSeleccionar` o `onDeseleccionar` según estado.
- [ ] Visualmente diferencia seleccionadas de no seleccionadas.
- [ ] Compilable.
- [ ] Unit test renderiza y maneja clicks (T016 o similar).

**Duración**: 1 día

**Dependencias**: T009.

**Notas**: [P] Component core de interacción.

---

## T015: Crear componente OpcionSelector [P]

**Descripción**: Component interno que renderiza opción individual (checkbox + label).

**Archivos a crear**:
- `Union/frontend/src/presentation/cuestionario/OpcionSelector.tsx`

**Requisitos**: RF-10, RNF-04, RNF-05

**Entrada**: T014.

**Salida**: Component reutilizable.

**Criterios de aceptación**:
- [ ] Props: `opcion: OpcionRespuesta`, `checked: boolean`, `onChange: (id: string, checked: boolean) => void`.
- [ ] Renderiza checkbox + label.
- [ ] Label muestra `opcion.descripcion`.
- [ ] onChange llama callback con id y estado.
- [ ] Styling: clara diferenciación checked/unchecked.
- [ ] Compilable.
- [ ] Unit test (T016 o similar).

**Duración**: 0.5 días

**Dependencias**: T014.

**Notas**: [P] Component pequeño, reutilizable.

---

## T016: Crear componente BotonContinuar [P]

**Descripción**: React component para botón "Continuar" con estado (enabled/disabled).

**Archivos a crear**:
- `Union/frontend/src/presentation/cuestionario/BotonContinuar.tsx`
- `Union/frontend/src/presentation/cuestionario/cuestionario.css` (parcial)

**Requisitos**: HU-06, RF-20, RNF-06

**Entrada**: T001.

**Salida**: Component botón.

**Criterios de aceptación**:
- [ ] Props: `enabled: boolean`, `onClick: () => void`, `loading?: boolean`.
- [ ] Renderiza botón con texto "Continuar".
- [ ] Disabled si `enabled = false`.
- [ ] Visual feedback: cursor, color, hover.
- [ ] Compilable.
- [ ] Unit test (T017 o similar).

**Duración**: 0.5 días

**Dependencias**: T001.

**Notas**: [P] Component simple.

---

## T017: Tests de componentes base (T013–T016)

**Descripción**: Tests unitarios para BienvenidaHeader, PreguntaForm, OpcionSelector, BotonContinuar.

**Archivos a crear**:
- `Union/frontend/tests/presentation/BienvenidaHeader.test.tsx`
- `Union/frontend/tests/presentation/PreguntaForm.test.tsx`
- `Union/frontend/tests/presentation/OpcionSelector.test.tsx`
- `Union/frontend/tests/presentation/BotonContinuar.test.tsx`

**Requisitos**: RNF-24, RNF-10

**Entrada**: T013–T016.

**Salida**: Tests > 60% cobertura UI.

**Criterios de aceptación**:
- [ ] BienvenidaHeader: renderiza eslogan.
- [ ] PreguntaForm: renderiza pregunta + opciones, maneja clicks.
- [ ] OpcionSelector: renderiza checkbox + label, onChange funciona.
- [ ] BotonContinuar: renderiza botón, estado enabled/disabled.
- [ ] Todos usan React Testing Library.
- [ ] Cobertura ≥ 60%.
- [ ] Todos pasan.

**Duración**: 1 día

**Dependencias**: T013–T016.

**Notas**: Tests críticos para UI. Paralelizable después de T013–T016.

---

---

# FASE 4: PREGUNTAS Y OPCIONES DE RESPUESTA

## T018: Crear factory CuestionarioFactory [P]

**Descripción**: Implementar factory que crea cuestionario default (3 preguntas con opciones).

**Archivos a crear**:
- `Union/frontend/src/application/CuestionarioFactory.ts`

**Requisitos**: RF-03, RF-04, RF-05, RF-06, A-2

**Entrada**: T004, T005, T006, T007, T009.

**Salida**: Factory que retorna array de 3 Preguntas con opciones.

**Criterios de aceptación**:
- [ ] Método estático `crearCuestionarioDefault(): Pregunta[]`.
- [ ] Retorna array de 3 preguntas en orden:
  1. Intereses artísticos (obligatoria, multi-selección).
  2. Géneros musicales (obligatoria, multi-selección).
  3. Estilos de pintura (opcional, multi-selección).
- [ ] Pregunta 1: 10 opciones (T004 enum).
- [ ] Pregunta 2: 12 opciones (T005 enum).
- [ ] Pregunta 3: 10 opciones (T006 enum).
- [ ] Cada opción: OpcionRespuesta con id, categoría, descripción.
- [ ] Compilable.
- [ ] Unit tests > 80% (T019).

**Duración**: 1 día

**Dependencias**: T004–T007, T009.

**Notas**: [P] Factory determinística. Opciones hardcoded en MVP.

---

## T019: Tests para CuestionarioFactory

**Descripción**: Tests que verifican factory crea preguntas correctas.

**Archivos a crear**:
- `Union/frontend/tests/application/CuestionarioFactory.test.ts`

**Requisitos**: RNF-24, A-2

**Entrada**: T018.

**Salida**: Tests > 80% cobertura.

**Criterios de aceptación**:
- [ ] Test retorna array de 3 preguntas.
- [ ] Test pregunta 1: 10 opciones, obligatoria, multi-selección.
- [ ] Test pregunta 2: 12 opciones, obligatoria, multi-selección.
- [ ] Test pregunta 3: 10 opciones, opcional, multi-selección.
- [ ] Test todas opciones tienen id único.
- [ ] Test opciones coinciden con enums (sincronía).
- [ ] Cobertura ≥ 80%.
- [ ] Todos pasan.

**Duración**: 0.5 días

**Dependencias**: T018.

**Notas**: Tests determinísticos, sin mocks.

---

## T020: Crear datos para Pregunta 1 (Intereses Artísticos) [P]

**Descripción**: Definir estructura de datos (OpcionRespuesta) para 10 opciones artísticas en factory.

**Archivos a modificar**:
- `Union/frontend/src/application/CuestionarioFactory.ts` — extend T018

**Requisitos**: HU-02, RF-06, A-2

**Entrada**: T018, T004.

**Salida**: 10 opciones artísticas en factory.

**Criterios de aceptación**:
- [ ] 10 OpcionRespuesta creadas con ids únicos.
- [ ] Categorías mapean a CategoriaInteres enum.
- [ ] Descripciones claras y atractivas.
- [ ] Pregunta 1 creada correctamente en factory.

**Duración**: 0.5 días

**Dependencias**: T018.

**Notas**: [P] Data hardcoded, reutilizable.

---

## T021: Crear datos para Pregunta 2 (Géneros Musicales) [P]

**Descripción**: Definir estructura de datos (OpcionRespuesta) para 12 géneros musicales en factory.

**Archivos a modificar**:
- `Union/frontend/src/application/CuestionarioFactory.ts` — extend T018

**Requisitos**: HU-03, RF-06, A-2

**Entrada**: T018, T005.

**Salida**: 12 opciones musicales en factory.

**Criterios de aceptación**:
- [ ] 12 OpcionRespuesta creadas con ids únicos.
- [ ] Categorías mapean a GeneroMusical enum.
- [ ] Descripciones claras.
- [ ] Pregunta 2 creada correctamente en factory.

**Duración**: 0.5 días

**Dependencias**: T018.

**Notas**: [P] Data hardcoded, reutilizable.

---

## T022: Crear datos para Pregunta 3 (Estilos de Pintura) [P]

**Descripción**: Definir estructura de datos (OpcionRespuesta) para 10 estilos de pintura en factory.

**Archivos a modificar**:
- `Union/frontend/src/application/CuestionarioFactory.ts` — extend T018

**Requisitos**: HU-04, RF-06, A-2

**Entrada**: T018, T006.

**Salida**: 10 opciones de pintura en factory.

**Criterios de aceptación**:
- [ ] 10 OpcionRespuesta creadas con ids únicos.
- [ ] Categorías mapean a EstiloPintura enum.
- [ ] Descripciones claras.
- [ ] Pregunta 3 creada correctamente en factory (opcional).

**Duración**: 0.5 días

**Dependencias**: T018.

**Notas**: [P] Data hardcoded.

---

## T023: Crear DTO PreferenciasDTO

**Descripción**: Implementar DTO que representa preferencias transformadas (para handoff).

**Archivos a crear**:
- `Union/frontend/src/application/dto/PreferenciasDTO.ts`

**Requisitos**: RF-21, RF-22, A-6

**Entrada**: T004, T005, T006.

**Salida**: DTO tipado.

**Criterios de aceptación**:
- [ ] Propiedades: `interesesArtisticos: CategoriaInteres[]`, `generosMusical: GeneroMusical[]`, `estilosPintura: EstiloPintura[]`.
- [ ] Constructor o factory function.
- [ ] Métodos de validación (no vacío si es requerido).
- [ ] Serializable a JSON (para futuro localStorage/API).
- [ ] Compilable.

**Duración**: 0.5 días

**Dependencias**: T004, T005, T006.

**Notas**: [P] DTO simple, independiente.

---

## T024: Crear clase Preferencias (dominio)

**Descripción**: Implementar value object Preferencias con deduplicación de categorías.

**Archivos a crear**:
- `Union/frontend/src/domain/entities/Preferencias.ts`

**Requisitos**: RF-21, RF-22, RNF-20, RNF-21, A-6

**Entrada**: T004, T005, T006, T023.

**Salida**: Clase Preferencias con invariantes.

**Criterios de aceptación**:
- [ ] Constructor: `(interesesArtisticos: CategoriaInteres[], generosMusical: GeneroMusical[], estilosPintura: EstiloPintura[])`.
- [ ] Deduplica automáticamente arrays (Set → Array).
- [ ] Propiedades readonly.
- [ ] Método `toDTO(): PreferenciasDTO`.
- [ ] Método `isEmpty(): boolean`.
- [ ] Validación: al menos 1 interés + 1 género (pintura opcional).
- [ ] Immutable.
- [ ] Compilable.

**Duración**: 0.5 días

**Dependencias**: T004, T005, T006, T023.

**Notas**: [P] Value object, lógica de deduplicación.

---

## T025: Tests para DTO y Preferencias

**Descripción**: Tests para PreferenciasDTO y Preferencias.

**Archivos a crear**:
- `Union/frontend/tests/domain/Preferencias.test.ts`
- `Union/frontend/tests/application/PreferenciasDTO.test.ts`

**Requisitos**: RNF-24, RNF-23

**Entrada**: T023, T024.

**Salida**: Tests > 80% cobertura.

**Criterios de aceptación**:
- [ ] Preferencias: test deduplicación.
- [ ] Preferencias: test isEmpty().
- [ ] Preferencias: test validación invariantes.
- [ ] Preferencias: test toDTO().
- [ ] DTO: test serialización.
- [ ] Cobertura ≥ 80%.
- [ ] Todos pasan.

**Duración**: 0.5 días

**Dependencias**: T023, T024.

**Notas**: Tests de invariantes.

---

---

# FASE 5: SELECCIÓN Y VALIDACIÓN DE RESPUESTAS

## T026: Crear servicio CuestionarioService

**Descripción**: Implementar servicio que valida y transforma respuestas.

**Archivos a crear**:
- `Union/frontend/src/application/CuestionarioService.ts`

**Requisitos**: RF-16, RF-17, RF-18, RF-19, RF-21, RF-22, RNF-20

**Entrada**: T009, T012, T024.

**Salida**: Servicio con métodos de validación y transformación.

**Criterios de aceptación**:
- [ ] Método `validarCompletitud(respuestas: RespuestaCuestionario, preguntas: Pregunta[]): {valida: boolean, errores?: Map<string, string>}`.
- [ ] Método `transformarAPreferencias(respuestas: RespuestaCuestionario, preguntas: Pregunta[]): Preferencias`.
- [ ] Método `validarSeleccion(pregunta: Pregunta, idOpcion: string): {valida: boolean, error?: string}`.
- [ ] Todos los métodos retornan tipos correctos.
- [ ] Compilable.
- [ ] Unit tests > 80% (T027).

**Duración**: 1 día

**Dependencias**: T009, T012, T024.

**Notas**: Core de lógica de validación.

---

## T027: Tests para CuestionarioService

**Descripción**: Tests exhaustivos para CuestionarioService.

**Archivos a crear**:
- `Union/frontend/tests/application/CuestionarioService.test.ts`

**Requisitos**: RNF-24, RF-16, RF-17, RF-18, RF-19

**Entrada**: T026.

**Salida**: Tests > 80% cobertura.

**Criterios de aceptación**:
- [ ] Test validarCompletitud: pregunta obligatoria vacía → inválida.
- [ ] Test validarCompletitud: todas preguntas obligatorias con respuesta → válida.
- [ ] Test validarCompletitud: pregunta opcional vacía → válida.
- [ ] Test transformarAPreferencias: respuestas correctas → Preferencias.
- [ ] Test transformarAPreferencias: deduplicación en Preferencias.
- [ ] Test validarSeleccion: opción válida → válida.
- [ ] Test validarSeleccion: opción fuera catálogo → inválida.
- [ ] Cobertura ≥ 80%.
- [ ] Todos pasan.

**Duración**: 1 día

**Dependencias**: T026.

**Notas**: Tests críticos de lógica.

---

## T028: Implementar manejo de selección en PreguntaForm [P]

**Descripción**: Extender PreguntaForm para manejar seleccionar/deseleccionar opciones.

**Archivos a modificar**:
- `Union/frontend/src/presentation/cuestionario/PreguntaForm.tsx` — extend T014

**Requisitos**: HU-05, RF-08, RF-09, RNF-08

**Entrada**: T014, T026.

**Salida**: PreguntaForm con handlers de selección.

**Criterios de aceptación**:
- [ ] Props: `onSeleccionar`, `onDeseleccionar` callbacks.
- [ ] Click en checkbox desmarcar → onDeseleccionar.
- [ ] Click en checkbox marcar → onSeleccionar.
- [ ] Validación de selección: usa CuestionarioService.validarSeleccion().
- [ ] Si opción inválida: no se cambia estado, se muestra error (opcional).
- [ ] Compilable.

**Duración**: 0.5 días

**Dependencias**: T014, T026.

**Notas**: [P] Integración de servicio con componente.

---

## T029: Implementar validación de obligatorias en BotonContinuar [P]

**Descripción**: Extender BotonContinuar para validar respuestas antes de continuar.

**Archivos a modificar**:
- `Union/frontend/src/presentation/cuestionario/BotonContinuar.tsx` — extend T016

**Requisitos**: HU-06, RF-16, RF-17, RF-19, RNF-07

**Entrada**: T016, T026.

**Salida**: BotonContinuar que valida antes de ejecutar onClick.

**Criterios de aceptación**:
- [ ] Props: agregar `respuestas: RespuestaCuestionario`, `preguntas: Pregunta[]`, `onValidationError?: (errores: Map<string, string>) => void`.
- [ ] Si respuestas inválidas: bloquea click, llama onValidationError.
- [ ] Si válidas: ejecuta onClick.
- [ ] Mensaje de error visible.
- [ ] Compilable.

**Duración**: 0.5 días

**Dependencias**: T016, T026.

**Notas**: [P] Integración de validación.

---

## T030: Crear componente MensajeError [P]

**Descripción**: Component que renderiza mensaje de error de validación.

**Archivos a crear**:
- `Union/frontend/src/presentation/cuestionario/MensajeError.tsx`
- `Union/frontend/src/presentation/cuestionario/cuestionario.css` (parcial)

**Requisitos**: HU-06, RF-17, RNF-07

**Entrada**: T001.

**Salida**: Component de error.

**Criterios de aceptación**:
- [ ] Props: `mensaje: string`, `visible: boolean`.
- [ ] Renderiza mensaje si visible.
- [ ] Styling: rojo/alert, legible.
- [ ] Compilable.
- [ ] Unit test (T031 o similar).

**Duración**: 0.5 días

**Dependencias**: T001.

**Notas**: [P] Component simple.

---

## T031: Crear componente CuestionarioPage (estructura principal)

**Descripción**: React component principal que orquesta cuestionario: renderiza preguntas, maneja estado, valida.

**Archivos a crear**:
- `Union/frontend/src/presentation/cuestionario/CuestionarioPage.tsx`

**Requisitos**: HU-01 a HU-08, RF-01 a RF-26, RNF-01 a RNF-25

**Entrada**: T013–T016, T018, T028–T030.

**Salida**: Component página que renderiza cuestionario completo.

**Criterios de aceptación**:
- [ ] Renderiza BienvenidaHeader.
- [ ] Renderiza array de PreguntaForm (3 preguntas).
- [ ] Renderiza BotonContinuar.
- [ ] Mantiene estado de respuestas (useState RespuestaCuestionario).
- [ ] Handlers: seleccionar, deseleccionar.
- [ ] Handler continuar: validar, transformar, navegar.
- [ ] Muestra MensajeError si validación falla.
- [ ] Responsive.
- [ ] Compilable.
- [ ] UI tests > 60% (T032 o similar).

**Duración**: 1.5 días

**Dependencias**: T013–T016, T018, T026, T028–T030.

**Notas**: Component core. Integra todo.

---

## T032: Tests para CuestionarioPage

**Descripción**: Tests de integración para CuestionarioPage: flujo completo.

**Archivos a crear**:
- `Union/frontend/tests/presentation/CuestionarioPage.test.tsx`

**Requisitos**: RNF-24, HU-01 a HU-08

**Entrada**: T031.

**Salida**: Tests > 60% cobertura UI.

**Criterios de aceptación**:
- [ ] Test renderiza bienvenida, 3 preguntas, botón continuar.
- [ ] Test seleccionar opción actualiza estado.
- [ ] Test deseleccionar opción actualiza estado.
- [ ] Test continuar sin responder obligatoria: muestra error.
- [ ] Test continuar con todas obligatorias respondidas: no muestra error.
- [ ] Test flujo completo: inicio → seleccionar → continuar → éxito.
- [ ] Cobertura ≥ 60%.
- [ ] Todos pasan.

**Duración**: 1 día

**Dependencias**: T031.

**Notas**: Tests críticos de flujo.

---

## T033: Tests de casos borde (spec.md § 8)

**Descripción**: Tests que verifican casos borde: recarga, cierre, deseleccionar todas, etc.

**Archivos a crear**:
- `Union/frontend/tests/integration/CasosBorde.test.tsx`

**Requisitos**: RNF-24, spec.md § 8

**Entrada**: T031, T012, T026.

**Salida**: Tests de casos borde.

**Criterios de aceptación**:
- [ ] Test recarga página: respuestas se pierden (no implementar localStorage en MVP).
- [ ] Test deseleccionar todas en obligatoria: bloquea continuar.
- [ ] Test deseleccionar todas en opcional: permite continuar.
- [ ] Test seleccionar todas opciones: válido (idempotente).
- [ ] Test cambiar respuesta de pregunta A no afecta pregunta B.
- [ ] Todos pasan.

**Duración**: 1 día

**Dependencias**: T031, T012, T026.

**Notas**: Tests de robustez.

---

## T034: Tests de conservación de estado (RF-13, RF-14, RF-15)

**Descripción**: Tests que verifican RespuestaCuestionario mantiene estado inmutable.

**Archivos a crear**:
- `Union/frontend/tests/domain/RespuestaCuestionario.test.ts`

**Requisitos**: RNF-24, RF-13, RF-14, RF-15

**Entrada**: T012.

**Salida**: Tests > 80% cobertura.

**Criterios de aceptación**:
- [ ] Test seleccionar retorna nueva instancia.
- [ ] Test deseleccionar retorna nueva instancia.
- [ ] Test cambiar pregunta A no afecta pregunta B.
- [ ] Test obtenerRespuesta retorna Set correcto.
- [ ] Test validarCompletitud valida todas preguntas.
- [ ] Cobertura ≥ 80%.
- [ ] Todos pasan.

**Duración**: 0.5 días

**Dependencias**: T012.

**Notas**: Tests de invariantes.

---

---

# FASE 6: CONSERVACIÓN DE RESPUESTAS Y GESTIÓN DEL ESTADO

## T035: Implementar estado React en CuestionarioPage

**Descripción**: Extender CuestionarioPage para usar useState con RespuestaCuestionario.

**Archivos a modificar**:
- `Union/frontend/src/presentation/cuestionario/CuestionarioPage.tsx` — extend T031

**Requisitos**: RF-13, RF-14, RF-15, RNF-08

**Entrada**: T031, T012.

**Salida**: CuestionarioPage con estado.

**Criterios de aceptación**:
- [ ] useState<RespuestaCuestionario> inicializado.
- [ ] setRespuestas actualiza estado immutablemente.
- [ ] Handlers: manejarSeleccionar, manejarDeseleccionar.
- [ ] Estado se pasa a PreguntaForm.
- [ ] Estado se pasa a BotonContinuar para validación.
- [ ] Compilable.

**Duración**: 0.5 días

**Dependencias**: T031, T012.

**Notas**: ⚠️ Sin paralelización (depende de T031).

---

## T036: Implementar callbacks de selección/deselección

**Descripción**: Crear callbacks que actualizan RespuestaCuestionario en estado.

**Archivos a modificar**:
- `Union/frontend/src/presentation/cuestionario/CuestionarioPage.tsx` — extend T035

**Requisitos**: RF-08, RF-09, RNF-08

**Entrada**: T035.

**Salida**: Callbacks funcionales.

**Criterios de aceptación**:
- [ ] `manejarSeleccionar(idPregunta: string, idOpcion: string)` → actualiza estado.
- [ ] `manejarDeseleccionar(idPregunta: string, idOpcion: string)` → actualiza estado.
- [ ] Ambos retornan nueva RespuestaCuestionario (immutable).
- [ ] Se pasan a PreguntaForm.
- [ ] PreguntaForm los invoca en onClick checkbox.
- [ ] Compilable.

**Duración**: 0.5 días

**Dependencias**: T035.

**Notas**: ⚠️ Secuencial.

---

## T037: Implementar useEffect para inicializar cuestionario

**Descripción**: Crear useEffect que carga preguntas del factory al montar componente.

**Archivos a modificar**:
- `Union/frontend/src/presentation/cuestionario/CuestionarioPage.tsx` — extend T036

**Requisitos**: RF-03, RNF-08

**Entrada**: T036, T018.

**Salida**: CuestionarioPage con preguntas inicializadas.

**Criterios de aceptación**:
- [ ] useEffect([], []) al montar.
- [ ] Llama CuestionarioFactory.crearCuestionarioDefault().
- [ ] Guarda en estado local.
- [ ] Se renderiza solo una vez.
- [ ] Compilable.

**Duración**: 0.5 días

**Dependencias**: T036, T018.

**Notas**: ⚠️ Secuencial.

---

## T038: Implementar handlers de validación y error

**Descripción**: Crear handler para validación antes de continuar y mostrar errores.

**Archivos a modificar**:
- `Union/frontend/src/presentation/cuestionario/CuestionarioPage.tsx` — extend T037

**Requisitos**: RF-16, RF-17, RF-19, RNF-07

**Entrada**: T037, T026.

**Salida**: Handler de validación.

**Criterios de aceptación**:
- [ ] `manejarContinuar()` → valida respuestas.
- [ ] Si inválidas: setMensajeError, retorna.
- [ ] Si válidas: continúa a transformación (T039).
- [ ] setMensajeError(null) al iniciar.
- [ ] useState<string | null> para mensaje error.
- [ ] MensajeError renderizado condicionalmente.
- [ ] Compilable.

**Duración**: 0.5 días

**Dependencias**: T037, T026.

**Notas**: ⚠️ Secuencial.

---

## T039: Implementar transformación de respuestas a Preferencias

**Descripción**: Extender manejarContinuar para transformar respuestas en Preferencias.

**Archivos a modificar**:
- `Union/frontend/src/presentation/cuestionario/CuestionarioPage.tsx` — extend T038

**Requisitos**: RF-21, RF-22, A-1

**Entrada**: T038, T024, T026.

**Salida**: Transformación Respuestas → Preferencias.

**Criterios de aceptación**:
- [ ] Dentro manejarContinuar, después validación.
- [ ] Llama CuestionarioService.transformarAPreferencias().
- [ ] Recibe Preferencias.
- [ ] Guarda en estado local o prepara para handoff.
- [ ] Compilable.

**Duración**: 0.5 días

**Dependencias**: T038, T024, T026.

**Notas**: ⚠️ Secuencial. No navegar aún (T040).

---

---

# FASE 7: PREPARACIÓN DE PREFERENCIAS PARA EL FEED

## T040: Implementar navegación a feed con preferencias [P]

**Descripción**: Extender manejarContinuar para navegar a /feed pasando Preferencias.

**Archivos a modificar**:
- `Union/frontend/src/presentation/cuestionario/CuestionarioPage.tsx` — extend T039
- `Union/frontend/src/presentation/feed/FeedPage.tsx` — crear stub

**Requisitos**: HU-07, RF-23, A-6

**Entrada**: T039.

**Salida**: Navegación React Router con state.

**Criterios de aceptación**:
- [ ] useNavigate() hook.
- [ ] navigate("/feed", { state: { preferencias } }).
- [ ] FeedPage recibe preferencias vía useLocation().
- [ ] FeedPage valida que preferencias existen; si no, redirige a /cuestionario.
- [ ] Compilable.

**Duración**: 0.5 días

**Dependencias**: T039.

**Notas**: [P] Integración de navegación.

---

## T041: Crear FeedPage (stub)

**Descripción**: Crear componente FeedPage que recibe Preferencias y prepara para feed.

**Archivos a crear**:
- `Union/frontend/src/presentation/feed/FeedPage.tsx`

**Requisitos**: HU-07, RF-23, A-6, A-9

**Entrada**: T040.

**Salida**: Componente FeedPage.

**Criterios de aceptación**:
- [ ] useLocation() para obtener preferencias.
- [ ] Si no hay preferencias, navigate("/cuestionario").
- [ ] Si hay preferencias, renderiza mensaje: "Generando feed personalizado basado en tus intereses..."
- [ ] Compilable.
- [ ] Nota: No obtiene publicaciones aún (backend en futuro).

**Duración**: 0.5 días

**Dependencias**: T040.

**Notas**: [P] Stub. Implementación completa en módulo feed.

---

## T042: Tests de flujo cuestionario → feed

**Descripción**: Tests de E2E que verifican flujo completo desde cuestionario hasta feed.

**Archivos a crear**:
- `Union/frontend/tests/integration/FlujoCuestionarioFeed.test.tsx`

**Requisitos**: RNF-24, HU-07, A-6

**Entrada**: T031, T040, T041.

**Salida**: Tests de flujo completo.

**Criterios de aceptación**:
- [ ] Test: Usuario completa cuestionario → navega a feed.
- [ ] Test: Feed recibe preferencias.
- [ ] Test: Si usuario intenta acceder a feed sin cuestionario, redirige a cuestionario.
- [ ] Test: Flujo reverso (atrás en navegador) → vuelve a cuestionario.
- [ ] Todos pasan.

**Duración**: 1 día

**Dependencias**: T031, T040, T041.

**Notas**: Tests críticos de E2E.

---

---

# FASE 8: INTEGRACIÓN PREPARADA CON LA API REST

## T043: Documentar contrato de API (OpenAPI)

**Descripción**: Revisar y completar `contracts/openapi.yaml` con endpoints que consumirá backend.

**Archivos a crear/modificar**:
- `Union/specs/006-inspiraciones-cuestionario/contracts/openapi.yaml` — review T

**Requisitos**: A-6, spec.md § 11, plan.md § 8

**Entrada**: Spec completa.

**Salida**: Documento OpenAPI listo para backend.

**Criterios de aceptación**:
- [ ] Endpoints documentados: POST /respuestas-cuestionario.
- [ ] DTO Request y Response definidas.
- [ ] Ejemplos incluidos.
- [ ] Notas sobre futuras iteraciones.
- [ ] Compilable (YAML válido).

**Duración**: 0.5 días

**Dependencias**: Ninguna (documentación).

**Notas**: [P] Documentación, no bloquea otros.

---

## T044: Crear hooks preparados para consumo de API

**Descripción**: Crear hooks custom (sin implementación) preparados para futuro consumo de API.

**Archivos a crear**:
- `Union/frontend/src/presentation/cuestionario/hooks/useFetchPublicaciones.ts`
- `Union/frontend/src/presentation/cuestionario/hooks/useRecommendations.ts`

**Requisitos**: A-6, plan.md § 8, spec.md § 11

**Entrada**: T040, T041.

**Salida**: Hooks con TODOs documentados.

**Criterios de aceptación**:
- [ ] `useFetchPublicaciones(preferencias: Preferencias)` → hook stub.
- [ ] `useRecommendations(preferencias: Preferencias)` → hook stub.
- [ ] Comments documentan qué harán (futuro backend).
- [ ] TS types definidas.
- [ ] No implementados en MVP.
- [ ] Compilable.

**Duración**: 0.5 días

**Dependencias**: T040, T041.

**Notas**: [P] Documentación técnica.

---

---

# FASE 9: VALIDACIÓN DE INTERFAZ SEGÚN QUICKSTART.MD

## T045: Verificar Definition of Done (Fase 1–4)

**Descripción**: Ejecutar checklist de verificación de Fase 1–4 según `quickstart.md § 1`.

**Archivos a revisar**:
- Fase 1 (T001–T003): Setup, Vitest, README.
- Fase 2 (T004–T012): Dominio, sincronía.
- Fase 3 (T013–T017): Componentes base.
- Fase 4 (T018–T025): Preguntas, opciones, DTO.

**Requisitos**: quickstart.md § 1, plan.md § 5

**Entrada**: T001–T025 completados.

**Salida**: Checklist marcado.

**Criterios de aceptación**:
- [ ] Enums compilables.
- [ ] OpcionRespuesta inmutable.
- [ ] Pregunta.validarRespuesta() funciona.
- [ ] RespuestaCuestionario (seleccionar, deseleccionar, conservar).
- [ ] Tests unitarios > 80%.
- [ ] Componentes renderuzan.
- [ ] Responsive en mobile + desktop.
- [ ] PR aprobado (simulado).

**Duración**: 1 día

**Dependencias**: T001–T025.

**Notas**: ⚠️ Revisión, no implementación.

---

## T046: Verificar Definition of Done (Fase 5–7)

**Descripción**: Ejecutar checklist de verificación de Fase 5–7 según `quickstart.md § 1`.

**Archivos a revisar**:
- Fase 5 (T026–T034): Selección, validación, estado.
- Fase 6 (T035–T039): Conservación de estado.
- Fase 7 (T040–T042): Preferencias, feed.

**Requisitos**: quickstart.md § 1, plan.md § 5

**Entrada**: T026–T042 completados.

**Salida**: Checklist marcado.

**Criterios de aceptación**:
- [ ] Seleccionar/deseleccionar funciona.
- [ ] Validación de obligatorias funciona.
- [ ] BotonContinuar bloqueado si incompleta.
- [ ] Responsive.
- [ ] Tests flujo crítico > 60%.
- [ ] Flujo completo: inicio → respuestas → validación → preferencias → feed.
- [ ] Mensajes de error claros.
- [ ] UX sin lag.
- [ ] README actualizado.
- [ ] PR aprobado (simulado).

**Duración**: 1 día

**Dependencias**: T026–T042.

**Notas**: ⚠️ Revisión.

---

## T047: Validar sincronía con módulo 002 (final)

**Descripción**: Ejecutar test de sincronía (T011) y verificar no hay desincronías.

**Archivos a revisar**:
- Test de sincronía (T011).
- Enums 006 (T004, T005, T006).
- Spec módulo 002.

**Requisitos**: A-2, RNF-23, quickstart.md § 7

**Entrada**: T001–T042 completados, T011 test.

**Salida**: Test de sincronía pasa.

**Criterios de aceptación**:
- [ ] npm run test SincroniaModulo002.test.ts → PASS.
- [ ] No hay desincronías en categorías artísticas.
- [ ] No hay desincronías en géneros musicales.
- [ ] No hay desincronías en estilos pintura.
- [ ] Si hay desincronía: report genera y comunica al team.
- [ ] Team resuelve antes de pasar a producción.

**Duración**: 0.5 días

**Dependencias**: T001–T042, T011.

**Notas**: ⚠️ Crítico. Si falla, STOP.

---

---

# FASE 10: REVISIÓN FINAL DEL FRONTEND

## T048: Revisión final y preparación para producción

**Descripción**: Revisión completa: tests, cobertura, documentación, linting, build.

**Archivos a revisar**:
- Todos los tests (npm run test).
- Cobertura (npm run test:coverage).
- Linting (npm run lint).
- Build (npm run build).
- README.md.
- Trazabilidad spec.md → código.

**Requisitos**: RNF-24, RNF-25, plan.md § 5, quickstart.md § 11

**Entrada**: T001–T047 completados.

**Salida**: Frontend listo para producción.

**Criterios de aceptación**:
- [ ] npm run test → todos pasan, cobertura dominio ≥ 80%, aplicación ≥ 80%, UI ≥ 60%.
- [ ] npm run lint → sin errores.
- [ ] npm run build → build exitoso.
- [ ] README.md actualizado con: setup, tests, debugging, decisiones.
- [ ] Trazabilidad: cada RF/RNF tiene comentario o test que lo cubre.
- [ ] Sin console.error o console.log en código.
- [ ] Respons testing en real device/emulador.
- [ ] Performance: sin lag, sin parpadeos.
- [ ] Sincronía 002 ✅ (T047).
- [ ] Code review aprobado.
- [ ] PR fusionado.
- [ ] Tag de release creado: v1.0.0-006-cuestionario.

**Duración**: 1 día

**Dependencias**: T001–T047.

**Notas**: ❌ No paralelizable. Final.

---

---

## Matriz de dependencias (DAG)

```
T001 ──→ T002, T003, T004, T005, T006, T007, T013, T014, T015, T016
          ↓
T002 ────→ (tests ready)
T003 ────→ (docs ready)

T004, T005, T006 ──→ T007, T008, T011, T023, T024
          ↓
T007 ────→ T008, T009, T012, T014
          ↓
T008 ────→ (domain unit tests)

T009 ────→ T010, T012, T026
          ↓
T010 ────→ (domain unit tests)

T011 ────→ (CRITICAL: if fails, STOP)

T012 ────→ T031, T034
          ↓
T013, T014, T015, T016 ──→ T017, T028, T029, T031
          ↓
T017 ────→ (UI unit tests)

T018 ────→ T019, T020, T021, T022
          ↓
T019 ────→ (application tests)

T023, T024 ──→ T025, T039
          ↓
T025 ────→ (domain/DTO tests)

T026 ────→ T027, T028, T029, T031
          ↓
T027 ────→ (service tests)

T028, T029, T030 ──→ T031
          ↓
T031 ────→ T032, T033, T035, T040, T042
          ↓
T032, T033 ─→ (UI integration tests)
T034 ────→ (domain state tests)

T035 ────→ T036
          ↓
T036 ────→ T037
          ↓
T037 ────→ T038
          ↓
T038 ────→ T039
          ↓
T039 ────→ T040, T042
          ↓
T040 ────→ T041, T042
          ↓
T041 ────→ T042
          ↓
T042 ────→ T045, T046, T047

T043, T044 ──→ (documentation, parallel)

T045, T046 ──→ T047
          ↓
T047 ────→ T048

T048 ────→ PRODUCTION READY ✅
```

---

## Resumen de tareas por rol

### Developer (Frontend TypeScript/React)

| Tarea | Rol | Estimación | Dependencias |
|---|---|---|---|
| T001–T003 | Setup | 1 día | Ninguna |
| T004–T006 | Enums | 1.5 días | T001 |
| T007–T012 | Dominio | 4 días | T004–T006 |
| T013–T017 | Componentes | 2–3 días | T001, T009 |
| T018–T025 | Datos + DTOs | 3 días | T004–T007, T009 |
| T026–T039 | Servicios + Estado | 6–8 días | T012, T024, T026 |
| T040–T042 | Navegación + E2E | 2 días | T039 |
| T045–T048 | Revisión final | 2 días | T001–T047 |

**Total**: 21–30 días (1 developer FT).

### QA / Code Reviewer

| Tarea | Rol | Estimación |
|---|---|---|
| T008, T010, T011, T019, T025, T027, T032–T034, T042 | Tests | Paralelo a dev |
| T045–T047 | Validación | 2 días (final) |

### Tech Lead / Architect

| Tarea | Rol | Estimación |
|---|---|---|
| T043, T044 | Integración API | 1 día |
| T047 | Sincronía 002 | 0.5 días |
| T048 | Review final | 1 día |

---

## Criterios de calidad

| Métrica | Objetivo | Verificación |
|---|---|---|
| **Cobertura tests dominio** | ≥ 80% | `npm run test:coverage` |
| **Cobertura tests aplicación** | ≥ 80% | `npm run test:coverage` |
| **Cobertura tests UI** | ≥ 60% | `npm run test:coverage` |
| **Tests passing** | 100% | `npm run test` |
| **Linting** | 0 errores | `npm run lint` |
| **Build** | Exitoso | `npm run build` |
| **Responsive** | mobile + desktop | Manual testing |
| **Performance** | Sin lag | Manual + browser DevTools |
| **Trazabilidad** | RF/RNF → tests | Revisar comentarios |
| **Sincronía 002** | 100% | Test T011 |

---

## Checklist final (Antes de T048)

- [ ] T001–T047 completadas.
- [ ] Todos los tests pasan.
- [ ] Cobertura ≥ 80% dominio/aplicación, ≥ 60% UI.
- [ ] npm run lint sin errores.
- [ ] npm run build exitoso.
- [ ] README completo.
- [ ] Trazabilidad verificada.
- [ ] Sincronía módulo 002 ✅ (T047).
- [ ] Code review completado.
- [ ] Team alineado en decisiones (T010–T047).
- [ ] Responsive testing completado.
- [ ] No hay console.error ni console.log.

---

**Versión**: 1.0 | **Estado**: ✅ Ready for Development | **Fecha**: 2026-10-19

> **Siguiente paso**: Asignar tareas a developer(s) y comenzar por T001–T003 (setup).
> **Dependencias críticas**: T011 (sincronía 002) y T047 (validación final).
