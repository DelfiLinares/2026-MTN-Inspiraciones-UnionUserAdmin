# IMPLEMENTATION_GUIDE — 006 Cuestionario de Intereses

**Versión**: 0.1 (Borrador)  
**Fecha**: October 19, 2026  
**Módulo**: 006 — Cuestionario de Intereses  
**Stack**: React + TypeScript + Vitest + React Testing Library

---

## Propósito de este documento

Esta guía proporciona instrucciones prácticas para implementar el módulo 006 (Cuestionario de Intereses) en el frontend Union. Complementa la especificación técnica (`spec.md`), el plan de implementación (`plan.md`), y el modelo de datos (`data-model.md`).

**Documentos de referencia**:
- 📋 **spec.md**: Requisitos funcionales, historias de usuario, requisitos no funcionales
- 📅 **plan.md**: Fases, cronograma, estructura de directorios
- 🗂️ **data-model.md**: Enums, entidades, servicios, pseudocódigo TypeScript
- ✅ **tasks.md**: Tareas concretas (T001–T048) con criterios de aceptación

---

## 1. Setup y Preparación

### 1.1 Verificar T001 Completado

Antes de comenzar, verifica que la estructura de directorios está lista:

```bash
ls -la Union/frontend/src/domain/entities/
ls -la Union/frontend/src/application/services/
ls -la Union/frontend/src/application/dto/
ls -la Union/frontend/src/presentation/cuestionario/
ls -la Union/frontend/src/presentation/feed/
ls -la Union/frontend/tests/domain/
ls -la Union/frontend/tests/application/
ls -la Union/frontend/tests/integration/
```

**Resultado esperado**: 9 directorios vacíos o con archivos template.

### 1.2 Verificar T002 Completado

Asegúrate que Vitest está configurado:

```bash
cd Union/frontend
npm run test
```

**Resultado esperado**: Tests ejecutan sin errores (al menos 215 tests pasando).

### 1.3 Instalar Dependencias

```bash
cd Union/frontend
npm install
```

**Librerías clave**:
- `react@^18.3.1` — UI framework
- `react-router-dom@^6.26.0` — Routing
- `typescript@^5.5.4` — Type safety
- `vitest@^2.0.5` — Testing framework
- `@testing-library/react@^16.0.0` — Component testing

---

## 2. Arquitectura y Estructura de Directorios

### 2.1 Patrón DDD (Domain-Driven Design)

El módulo 006 sigue arquitectura capas:

```
┌─────────────────────────────────────┐
│     PRESENTATION (React components) │
│  - CuestionarioPage, Forms, Buttons │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│  APPLICATION (Services, DTOs)        │
│  - CuestionarioService              │
│  - CuestionarioFactory              │
│  - PreferenciasDTO                  │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│    DOMAIN (Entities, Value Objects) │
│  - Pregunta, OpcionRespuesta        │
│  - RespuestaCuestionario            │
│  - Preferencias                     │
│  - Enums (Categoría, Género, Estilo)│
└─────────────────────────────────────┘
```

### 2.2 Estructura de Directorios Esperada

```
Union/frontend/
├── src/
│   ├── domain/
│   │   ├── enums/
│   │   │   ├── CategoriaInteres.ts      [T004]
│   │   │   ├── GeneroMusical.ts         [T005]
│   │   │   └── EstiloPintura.ts         [T006]
│   │   ├── entities/
│   │   │   ├── OpcionRespuesta.ts       [T007]
│   │   │   ├── Pregunta.ts              [T018-T020]
│   │   │   ├── RespuestaCuestionario.ts [T026-T028]
│   │   │   └── Preferencias.ts          [T040]
│   ├── application/
│   │   ├── services/
│   │   │   ├── CuestionarioService.ts   [T029]
│   │   │   └── CuestionarioFactory.ts   [T010]
│   │   └── dto/
│   │       └── PreferenciasDTO.ts       [T043]
│   ├── presentation/
│   │   ├── cuestionario/
│   │   │   ├── CuestionarioPage.tsx     [T035]
│   │   │   ├── BienvenidaHeader.tsx     [T013]
│   │   │   ├── PreguntaForm.tsx         [T037]
│   │   │   ├── OpcionSelector.tsx       [T036]
│   │   │   ├── BotonContinuar.tsx       [T038]
│   │   │   └── cuestionario.css         [T039]
│   │   └── feed/
│   │       └── FeedPage.tsx             [T034-stub]
│   └── App.tsx                          [actualizar rutas]
├── tests/
│   ├── domain/
│   │   ├── example.test.ts              [template T002]
│   │   ├── Pregunta.test.ts             [T021]
│   │   ├── RespuestaCuestionario.test.ts [T027]
│   │   ├── Preferencias.test.ts         [T041]
│   │   └── ...
│   ├── application/
│   │   ├── example.test.ts              [template T002]
│   │   ├── CuestionarioService.test.ts  [T030]
│   │   └── CuestionarioFactory.test.ts  [T012]
│   └── integration/
│       ├── example.test.ts              [template T002]
│       └── CuestionarioFlow.test.tsx    [T046]
└── vitest.config.ts                     [T002]
```

### 2.3 Mapeo de Tareas a Archivos

Cada tarea (T001–T048) corresponde a un componente, test, o configuración:

**Tareas por fase**:
- **Fase 1** (Setup, T001–T003): Directorios, Vitest, documentación
- **Fase 2** (Modelo, T004–T016): Enums, entidades, value objects
- **Fase 3** (Componentes, T017–T043): Servicios, DTOs, componentes React
- **Fase 4** (Integración, T044–T048): Flujos E2E, validación, tests finales

Ver `tasks.md` para detalles por tarea.

---

## 3. Desarrollo por Fase

### 3.1 Fase 1: Setup (T001–T003) ✅ COMPLETADA

**Estado**: Directorios creados, Vitest configurado, documentación actualizada.

**Verificar**:
```bash
npm run test  # Debe pasar sin errores
ls -la Union/frontend/tests/setupTests.ts
cat Union/frontend/VITEST_SETUP.md
```

### 3.2 Fase 2: Modelo de Datos (T004–T016)

**Tareas**:
- T004: Enum `CategoriaInteres` (10 valores)
- T005: Enum `GeneroMusical` (12 valores)
- T006: Enum `EstiloPintura` (10 valores)
- T007: Value object `OpcionRespuesta`
- T008: Tests para `OpcionRespuesta`
- T009: Enum `PreferenciaRespuesta`
- T010: Factory `CuestionarioFactory`
- T011: Sincronización con Módulo 002 (test)
- T012: Tests para `CuestionarioFactory`
- T016: Value object `Preferencias`

**Archivos a crear**:
```
src/domain/enums/
  ├── CategoriaInteres.ts
  ├── GeneroMusical.ts
  ├── EstiloPintura.ts
  └── PreferenciaRespuesta.ts

src/domain/entities/
  ├── OpcionRespuesta.ts
  └── (Pregunta, RespuestaCuestionario — Fase 3)
```

**Comando de compilación**:
```bash
npm run build
```

**Ejemplo: Crear CategoriaInteres.ts**:
```typescript
export enum CategoriaInteres {
  Dibujo = 'Dibujo',
  Escultura = 'Escultura',
  Fotografia = 'Fotografia',
  Literatura = 'Literatura',
  EsculuraDigital = 'EsculuraDigital',
  PinturaDigital = 'PinturaDigital',
  Instalacion = 'Instalacion',
  Performance = 'Performance',
  VideoArte = 'VideoArte',
  CineAudiovisual = 'CineAudiovisual',
}
```

### 3.3 Fase 3: Aplicación y Presentación (T017–T043)

**Tareas principales**:
- T013–T017: Componentes UI base (Header, Selector, Botón, Forms)
- T018–T025: Implementar 3 preguntas exactas
- T029: `CuestionarioService` (validación, transformación)
- T035–T039: Componentes principales y estilos
- T043: `PreferenciasDTO`

**Flujo de componentes**:
1. **CuestionarioPage** (contenedor principal)
2. **BienvenidaHeader** (eslogan + título)
3. **PreguntaForm** (pregunta actual)
4. **OpcionSelector** (checkboxes de opciones)
5. **BotonContinuar** (navegación + validación)

**Ejemplo: Estructura de CuestionarioPage.tsx**:
```typescript
import React, { useState } from 'react'
import BienvenidaHeader from './BienvenidaHeader'
import PreguntaForm from './PreguntaForm'
import BotonContinuar from './BotonContinuar'

export default function CuestionarioPage() {
  const [preguntaIndex, setPreguntaIndex] = useState(0)
  const [respuestas, setRespuestas] = useState<Map<number, string[]>>(new Map())

  return (
    <div className="cuestionario-container">
      <BienvenidaHeader />
      <PreguntaForm pregunta={preguntas[preguntaIndex]} />
      <BotonContinuar onContinue={() => setPreguntaIndex(prev => prev + 1)} />
    </div>
  )
}
```

### 3.4 Fase 4: Integración y Validación (T044–T048)

**Tareas**:
- T045: Validación UI completa
- T046: Tests E2E (flujo completo)
- T047: Responsive design
- T048: Revisión final y documentación

---

## 4. Ejecución de Tests

### 4.1 Ejecutar Todos los Tests

```bash
cd Union/frontend
npm run test
```

**Salida esperada**:
```
 Test Files  33 passed
      Tests  224+ passed
```

### 4.2 Ejecutar Tests de una Capa Específica

```bash
# Tests de dominio
npm run test -- tests/domain/

# Tests de aplicación
npm run test -- tests/application/

# Tests de integración
npm run test -- tests/integration/
```

### 4.3 Ejecutar Tests en Watch Mode

```bash
npm run test:watch
```

El terminal reexecutará tests cuando cambies archivos.

### 4.4 Generar Coverage Report

```bash
npm run test -- --coverage
```

**Nota**: Genera reporte en `coverage/` con HTML interactivo.

### 4.5 Tests con Patrón de Nombre

```bash
npm run test -- --grep "should create"
```

---

## 5. Patrones y Convenciones

### 5.1 Nomenclatura de Archivos

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Enum | PascalCase.ts | `CategoriaInteres.ts` |
| Entity | PascalCase.ts | `Pregunta.ts` |
| Service | PascalCase.ts | `CuestionarioService.ts` |
| Component | PascalCase.tsx | `BienvenidaHeader.tsx` |
| Test | name.test.ts/tsx | `Pregunta.test.ts` |
| Style | kebab-case.css | `cuestionario.css` |
| DTO | PascalCase.ts | `PreferenciasDTO.ts` |

### 5.2 Estructura de Tests

```typescript
import { describe, it, expect } from 'vitest'

describe('Feature', () => {
  // Arrange, Act, Assert (AAA pattern)
  it('should do something', () => {
    const expected = true
    const result = expected
    expect(result).toBe(true)
  })
})
```

### 5.3 Componentes React

Utiliza **hooks** para estado local:

```typescript
import { useState } from 'react'

export default function Component() {
  const [state, setState] = useState(initialValue)
  
  return <div>{state}</div>
}
```

**Estado compartido**: Usa `React Router` memory object para pasar preferencias al feed.

### 5.4 Importes con Alias

Utiliza los path aliases configurados en `vite.config.ts`:

```typescript
// ❌ Evitar paths relativos complejos
import { Pregunta } from '../../../domain/entities/Pregunta'

// ✅ Usar aliases
import { Pregunta } from '@domain/entities/Pregunta'
import { CuestionarioService } from '@application/services'
```

---

## 6. Debugging y Troubleshooting

### 6.1 Tests No Ejecutan

**Verificar**:
1. `tests/setupTests.ts` existe
2. `vite.config.ts` tiene configuración `test`
3. `npm install` ha sido ejecutado

**Solución**:
```bash
npm install
npm run test
```

### 6.2 Errores de Compilación

**Mensaje**: `Cannot find module '@domain/...'`

**Solución**: Verifica `vite.config.ts` tiene los path aliases definidos.

### 6.3 Tests Fallan por Dependencias Faltantes

**Verificar**:
```bash
npm list @testing-library/react
npm list vitest
```

**Reinstalar**:
```bash
npm install --save-dev vitest @testing-library/react
```

---

## 7. Referencias a Especificaciones

### 7.1 Historias de Usuario (spec.md § 5)

El cuestionario debe cumplir con 8 historias de usuario:
- HU-01: Bienvenida clara
- HU-02: Intereses artísticos (pregunta)
- HU-03: Géneros musicales (pregunta)
- HU-04: Estilos de pintura (pregunta)
- HU-05: Validación de respuestas
- HU-06: Navegación fluida
- HU-07: Conservación de estado
- HU-08: Transición al feed

Ver `spec.md § 5` para requisitos exactos.

### 7.2 Modelo de Datos (data-model.md)

**Enums** (3 total):
- `CategoriaInteres` — 10 valores
- `GeneroMusical` — 12 valores
- `EstiloPintura` — 10 valores

**Entidades**:
- `OpcionRespuesta` — value object con id, categoría, descripción
- `Pregunta` — value object con pregunta, opciones, validación
- `RespuestaCuestionario` — entidad mutable con respuestas del usuario
- `Preferencias` — estado final (categorías seleccionadas)

Ver `data-model.md` para pseudocódigo TypeScript completo.

### 7.3 Requisitos Funcionales (spec.md § 6)

24 requisitos funcionales documentan comportamiento esperado:
- RF-01 a RF-24

Ejemplo:
- **RF-06**: Mostrar 3 preguntas (artística, musical, pintura)
- **RF-14**: Validar que pregunta artística y musical tienen ≥1 opción seleccionada

Ver `spec.md § 6` para lista completa.

### 7.4 Requisitos No Funcionales (spec.md § 7)

25 requisitos no funcionales de calidad:
- RNF-01: Performance (< 100ms por interacción)
- RNF-20: Immutabilidad de value objects
- RNF-23: **CRÍTICO** — Sincronización con Módulo 002 (categorías idénticas)

**⚠️ Crítico**: RNF-23 requiere que enums de M006 coincidan exactamente con M002. Test en T011 verifica esto.

### 7.5 Plan de Implementación (plan.md)

**Fases**:
1. Setup (2-3 días) — T001–T003 ✅
2. Modelo (2-3 días) — T004–T016
3. Presentación (3-4 días) — T017–T043
4. Integración (1 día) — T044–T048

**Cronograma total**: 11–18 días con 1 developer FT.

---

## 8. Checklist de Implementación

### Fase 1 ✅ COMPLETADA
- [x] T001: Crear estructura de directorios
- [x] T002: Configurar Vitest
- [x] T003: Crear este documento (IMPLEMENTATION_GUIDE.md)

### Fase 2 (En progreso)
- [ ] T004: Enum CategoriaInteres
- [ ] T005: Enum GeneroMusical
- [ ] T006: Enum EstiloPintura
- [ ] T007: Value object OpcionRespuesta
- [ ] T008–T016: Tests y sincronización

### Fase 3 (Por comenzar)
- [ ] T013–T017: Componentes UI
- [ ] T018–T025: Preguntas
- [ ] T029: CuestionarioService
- [ ] T043: PreferenciasDTO

### Fase 4 (Por comenzar)
- [ ] T044–T048: Tests E2E y validación final

---

## 9. Contacto y Soporte

Para dudas sobre implementación:
1. Consultar `spec.md` para requisitos exactos
2. Consultar `plan.md` para arquitectura y cronograma
3. Consultar `data-model.md` para pseudocódigo TypeScript
4. Consultar `tasks.md` para criterios de aceptación por tarea

---

**Documento generado**: October 19, 2026  
**Versión**: 0.1 (Borrador)  
**Última actualización**: T003 completada
