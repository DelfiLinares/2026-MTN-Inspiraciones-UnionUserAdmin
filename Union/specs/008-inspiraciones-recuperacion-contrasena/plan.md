# Plan de Implementación — 008 Recuperación de Contraseña# Plan de Implementación — 008 Recuperación de Contraseña# Plan de Implementación — 008 Recuperación de Contraseña



**Versión**: 1.0  

**Estado**: ✅ Plan Completo  

**Fecha**: 2026-10-20  **Versión**: 1.0  **Versión**: 1.0  

**Módulo**: 008 Recuperación de Cuenta y Contraseña  

**Estado**: ✅ Plan Completo  **Estado**: ✅ Plan Completo  

---

**Fecha**: 2026-10-20  **Fecha**: 2026-10-20  

## Propósito

**Módulo**: 008 Recuperación de Cuenta y Contraseña  **Módulo**: 008 Recuperación de Cuenta y Contraseña  

Este documento define la arquitectura, fases de implementación y estrategia de testing para construir el módulo 008 de frontend. Guía el trabajo de desarrollo de 6 fases independientes pero conectadas.



---

------

## 1. Visión General



### Objetivos Principales

## Propósito## Propósito

1. **Funcionalidad**: Crear una interfaz frontend para iniciar recuperación de contraseña

2. **Calidad**: 230+ tests, >= 80% cobertura, TypeScript sin errores

3. **Experiencia**: UX intuitiva, accesible, responsive

4. **Arquitectura**: DDD con 3 capas (Domain → Application → Presentation)Este documento define la arquitectura, fases de implementación y estrategia de testing para construir el módulo 008 de frontend. Guía el trabajo de desarrollo de 6 fases independientes pero conectadas.Este documento define la arquitectura, fases de implementación, estrategia de testing y detalles técnicos para la construcción del módulo 005 (Recuperación de Contraseña).

5. **Preparación**: Base sólida para integración backend futuro



### Resultados Esperados

------

- ✅ Componentes React reutilizables

- ✅ Servicios de dominio desacoplados de React

- ✅ Validadores testeables independientemente

- ✅ 230+ tests (65 domain + 35 application + 130 presentation)## 1. Visión General## 1. Visión General del Proyecto

- ✅ Cobertura >= 80% total (95% domain, 90% application, 85% presentation)

- ✅ TypeScript: 0 errores

- ✅ ESLint: 0 warnings

- ✅ Integración con rutas existentes (/login, /recuperar-contrasena)### Objetivos Principales### Objetivos



### Restricciones1. **Funcionalidad**: Crear una interfaz frontend para iniciar recuperación de contraseña



- ❌ No implementar backend real1. **Funcionalidad**: Crear interfaz frontend para recuperación de contraseña2. **Calidad**: Código limpio, testeable, mantenible (>80% coverage)

- ❌ No implementar API REST

- ❌ No enviar correos reales2. **Calidad**: 230+ tests, >= 80% cobertura, TypeScript sin errores3. **Experiencia**: UX intuitiva, accesible, responsive

- ❌ No verificar existencia de cuentas

- ✅ Simulación local (setTimeout 750ms)3. **Experiencia**: UX intuitiva, accesible, responsive4. **Preparación**: Estructura lista para integración backend futura

- ✅ 100% Frontend-only (MVP)

4. **Arquitectura**: DDD con 3 capas (Domain → Application → Presentation)

---

5. **Preparación**: Base sólida para integración backend futuro### Resultados Esperados

## 2. Arquitectura Técnica

- ✅ Componentes React reutilizables

### 2.1 Stack Tecnológico

### Resultados Esperados- ✅ Servicios de dominio desacoplados de React

| Componente | Tecnología | Versión | Propósito |

|----------|-----------|---------|----------|- ✅ Validadores testeables independientemente

| Build | Vite | 5.4.2 | Compilación rápida |

| Runtime | React | 18.3.1 | Framework UI |- ✅ Componentes React reutilizables y testables- ✅ 220+ tests (mínimo)

| Lenguaje | TypeScript | 5.5.4 | Type safety |

| Routing | React Router | 6+ | Navegación SPA |- ✅ Servicios de dominio desacoplados de React- ✅ Cero errores TypeScript

| Testing | Vitest | 2.1.9 | Unit tests |

| Testing | React Testing Library | 16.0.0 | Component tests |- ✅ Validadores independientes y probados- ✅ Cero console.log/error en producción

| Styling | CSS Modules | - | Diseño responsive |

| Patrón | DDD | 3 capas | Arquitectura |- ✅ 230+ tests (65 domain + 35 application + 130 presentation)- ✅ Navegación integrada con login existente



### 2.2 Estructura de Carpetas- ✅ Cobertura >= 80% total (95% domain, 90% application, 85% presentation)



```- ✅ TypeScript: 0 errores### Restricciones

Union/frontend/src/

├── domain/- ✅ ESLint: 0 warnings- No implementar backend real

│   ├── valueObjects/

│   │   ├── CorreoElectronico.ts- ✅ Integración con rutas existentes (/login, /recuperar-contrasena)- No implementar API REST

│   │   └── EstadoFormularioRecuperacion.ts

│   ├── entities/- No enviar correos reales

│   │   └── SolicitudRecuperacion.ts

│   ├── services/### Restricciones- No verificar existencia de cuentas en frontend

│   │   └── ValidadorCorreoElectronico.ts

│   ├── errors/- Frontend-only (Módulo 005 es MVP)

│   │   └── ErrorCorreoInvalido.ts

│   └── index.ts- ❌ No implementar backend real

│

├── application/- ❌ No implementar API REST---

│   ├── services/

│   │   └── ServicioFormularioRecuperacion.ts- ❌ No enviar correos reales

│   ├── factories/

│   │   └── FabricaSolicitudRecuperacion.ts- ❌ No verificar existencia de cuentas## 2. Arquitectura Técnica

│   ├── dtos/

│   │   └── DTOFormularioRecuperacion.ts- ❌ 100% Frontend-only (MVP)

│   └── index.ts

│- ✅ Simulación local (setTimeout 750ms)### 2.1 Stack Tecnológico

├── presentation/

│   ├── pages/

│   │   └── recuperar-contrasena/

│   │       └── PaginaRecuperacion.tsx---| Capa | Tecnología | Propósito |

│   ├── components/

│   │   ├── FormularioRecuperacion.tsx|------|-----------|----------|

│   │   └── ConfirmacionRecuperacion.tsx

│   ├── hooks/## 2. Arquitectura Técnica| Build | Vite 5.4.2 | Compilación rápida |

│   │   └── useFormularioRecuperacion.ts

│   ├── styles/| Runtime | React 18.3.1 | Framework UI |

│   │   └── recuperacion.module.css

│   └── index.ts### 2.1 Stack Tecnológico| Lenguaje | TypeScript 5.5.4 | Type safety |

│

├── types/| Routing | React Router 6+ | Navegación |

│   └── recuperacion.ts

│| Capa | Tecnología | Versión | Propósito || Testing | Vitest 2.1.9 | Unit tests |

└── routes/

    ├── AppRoutes.tsx (actualizar)|------|-----------|---------|----------|| Testing | React Testing Library | Component tests |

    └── index.ts

| Build | Vite | 5.4.2 | Compilación rápida || UI Testing | Testing Library | Accesibilidad |

Union/frontend/tests/

├── domain/| Runtime | React | 18.3.1 | Framework UI || Styling | CSS Modules o Tailwind | Estilos (a definir) |

│   ├── valueObjects/

│   ├── entities/| Lenguaje | TypeScript | 5.5.4 | Type safety |

│   └── services/

├── application/| Routing | React Router | 6+ | Navegación SPA |### 2.2 Estructura de Carpetas

│   ├── services/

│   ├── factories/| Testing | Vitest | 2.1.9 | Unit tests |

│   └── dtos/

└── integration/| Testing | React Testing Library | 16.0.0 | Component tests |```

    └── recuperacion/

```| Styling | CSS | (existente) | Diseño responsive |src/



### 2.3 Arquitectura de Capas| Patrón | DDD | 3 capas | Arquitectura |  domain/                           # Lógica de negocio



```    entities/

┌─────────────────────────────────────────┐

│  PRESENTATION LAYER (React)             │### 2.2 Arquitectura en 3 Capas      RecoveryForm.ts              # Entidad principal

│  ├─ Pages (PaginaRecuperacion)          │

│  ├─ Components (Formulario, Confirmación)│    valueObjects/

│  ├─ Hooks (useFormularioRecuperacion)   │

│  └─ Types (Props, State)                │```      Email.ts                     # Value object: email validado

└──────────────┬──────────────────────────┘

               │ usa┌─────────────────────────────────────────────────┐      RecoveryState.ts             # Value object: estados del proceso

┌──────────────▼──────────────────────────┐

│  APPLICATION LAYER (Orquestación)       ││  PRESENTATION LAYER (React)                     │    services/

│  ├─ Services (ServicioFormularioRecuperación) │

│  ├─ Factories (FabricaSolicitudRecuperación)  ││  ├─ Pages (PaginaRecuperacion)                  │      EmailValidator.ts            # Lógica de validación

│  ├─ DTOs (DTOFormularioRecuperación)    │

│  └─ Mappers                             ││  ├─ Components (FormularioRecuperacion,         │    errors/

└──────────────┬──────────────────────────┘

               │ usa│  │             ConfirmacionRecuperacion)        │      index.ts                     # Excepciones personalizadas

┌──────────────▼──────────────────────────┐

│  DOMAIN LAYER (Lógica de Negocio)       ││  ├─ Hooks (useFormularioRecuperacion)           │    index.ts                       # Barrel export

│  ├─ Entities (SolicitudRecuperación)    │

│  ├─ Value Objects (CorreoElectronico,  ││  └─ Types (PropsFormularioRecuperacion)         │

│  │  EstadoFormularioRecuperación)       │

│  ├─ Services (ValidadorCorreoElectronico)│└─────────────────┬───────────────────────────────┘  application/                      # Casos de uso

│  └─ Errors (ErrorCorreoInvalido)        │

└─────────────────────────────────────────┘                  │ usa    services/

```

┌─────────────────▼───────────────────────────────┐      RecoveryFormService.ts       # Orquestador de aplicación

---

│  APPLICATION LAYER (Coordinación)              │    dtos/

## 3. Fases de Implementación

│  ├─ Services (ServicioFormularioRecuperacion)   │      RecoveryFormDTO.ts           # DTO del formulario

### Fase 1: Domain Layer (2-3 días)

│  ├─ Factories (FabricaSolicitudRecuperacion)    │      RecoverySubmitDTO.ts         # DTO para submit

**Objetivo**: Implementar lógica de negocio pura, independiente de React.

│  ├─ DTOs (DTOFormularioRecuperacion)            │    factories/

**Tareas**:

- ✅ CorreoElectronico (Value Object)│  └─ Mappers (MapeadorFormularioRecuperacion)    │      RecoveryFormFactory.ts       # Factory para crear instancias

- ✅ EstadoFormularioRecuperacion (Value Object)

- ✅ SolicitudRecuperacion (Entity)└─────────────────┬───────────────────────────────┘    index.ts                       # Barrel export

- ✅ ValidadorCorreoElectronico (Service)

- ✅ ErrorCorreoInvalido (Custom Error)                  │ usa



**Tests**: ~70 tests, >= 95% coverage┌─────────────────▼───────────────────────────────┐  presentation/                     # UI React



**Deliverables**:│  DOMAIN LAYER (Lógica de Negocio)              │    pages/

- Módulo domain/ completo y funcionando

- 0 importes de React│  ├─ Value Objects (CorreoElectronico,           │      RecoveryPage.tsx             # Página contenedora

- TypeScript validado

│  │                EstadoFormularioRecuperacion) │    components/

---

│  ├─ Entities (SolicitudRecuperacion)            │      RecoveryForm.tsx             # Componente formulario

### Fase 2: Application Layer (2-3 días)

│  ├─ Services (ValidadorCorreoElectronico)       │      RecoveryConfirmation.tsx     # Componente confirmación

**Objetivo**: Orquestar entre domain y presentation.

│  └─ Errors (ErrorCorreoInvalido)                │    hooks/

**Tareas**:

- ✅ ServicioFormularioRecuperacion└─────────────────────────────────────────────────┘      useRecoveryForm.ts           # Hook principal

- ✅ FabricaSolicitudRecuperacion

- ✅ DTOFormularioRecuperacion```    styles/

- ✅ Mappers

      RecoveryForm.module.css      # Estilos (si usamos módulos)

**Tests**: ~35 tests, >= 90% coverage

### 2.3 Estructura de Carpetas    index.ts                       # Barrel export

**Deliverables**:

- Módulo application/ completo

- Coordinación domain/presentation definida

- 80+ tests totales```  types/



---Union/frontend/src/    recovery.ts                    # Tipos TypeScript compartidos



### Fase 3: Presentation Layer (3-4 días)├── domain/



**Objetivo**: Crear componentes React y lógica de UI.│   ├── valueObjects/  routes/



**Tareas**:│   │   ├── CorreoElectronico.ts    index.ts                       # Actualizar con nueva ruta

- ✅ Types compartidos (recuperacion.ts)

- ✅ useFormularioRecuperacion Hook│   │   └── EstadoFormularioRecuperacion.ts    AppRoutes.tsx                  # Agregar ruta /recuperar-contrasena

- ✅ FormularioRecuperacion Component

- ✅ ConfirmacionRecuperacion Component│   ├── entities/

- ✅ PaginaRecuperacion Container

│   │   └── SolicitudRecuperacion.ts  tests/

**Tests**: ~130 tests, >= 85% coverage

│   ├── services/    domain/

**Deliverables**:

- Componentes React funcionales│   │   └── ValidadorCorreoElectronico.ts      services/

- Hook de state management

- 160+ tests totales│   ├── errors/        EmailValidator.test.ts     # Tests de validador



---│   │   ├── ErrorCorreoInvalido.ts      entities/



### Fase 4: Integración & Routing (1-2 días)│   │   └── index.ts        RecoveryForm.test.ts       # Tests de entidad



**Objetivo**: Integrar con login existente y rutas.│   └── index.ts      valueObjects/



**Tareas**:│        Email.test.ts              # Tests de value object

- ✅ Agregar ruta /recuperar-contrasena

- ✅ Agregar link en LoginPage├── application/    application/

- ✅ Estilos CSS responsive

- ✅ Navegación login ↔ recuperación│   ├── services/      services/



**Tests**: Tests de integración de rutas│   │   └── ServicioFormularioRecuperacion.ts        RecoveryFormService.test.ts # Tests de servicio



**Deliverables**:│   ├── factories/    presentation/

- Módulo integrado con login

- Rutas funcionales│   │   └── FabricaSolicitudRecuperacion.ts      components/

- Estilos completos

│   ├── dtos/        RecoveryForm.test.tsx      # Tests de componente

---

│   │   └── DTOFormularioRecuperacion.ts      hooks/

### Fase 5: Testing & Coverage (2-3 días)

│   ├── mappers/        useRecoveryForm.test.ts    # Tests de hook

**Objetivo**: Asegurar cobertura >= 80% y casos borde.

│   │   └── MapeadorFormularioRecuperacion.ts      pages/

**Tareas**:

- ✅ Tests de casos borde (CB-001 a CB-013)│   └── index.ts        RecoveryPage.test.tsx      # Tests de página

- ✅ Tests de accesibilidad (WCAG AA)

- ✅ Tests de responsive design│    integration/

- ✅ Tests E2E (flujos completos)

- ✅ Verificar cobertura >= 80%├── presentation/      flujos/



**Tests**: 50+ tests nuevos│   ├── pages/        FlujoCancelación.test.tsx  # Test: usuario cancela



**Deliverables**:│   │   └── recuperar-contrasena/        FlujoValidación.test.tsx   # Test: validación completa

- 230+ tests totales

- Coverage >= 80%│   │       └── PaginaRecuperacion.tsx        FlujoConfirmación.test.tsx # Test: flujo de confirmación

- Todos los casos borde cubiertos

│   ├── components/        SincroniaLogin.test.ts     # Test: integración con login

---

│   │   ├── formulario/```

### Fase 6: Refinamiento (1-2 días)

│   │   │   ├── FormularioRecuperacion.tsx

**Objetivo**: Pulir código y preparar producción.

│   │   │   └── FormularioRecuperacion.module.css### 2.3 Arquitectura de Capas

**Tareas**:

- ✅ Code review│   │   └── confirmacion/

- ✅ Limpieza de código

- ✅ Documentación (JSDoc)│   │       ├── ConfirmacionRecuperacion.tsx```

- ✅ Build verificado

- ✅ 0 errores TypeScript/ESLint│   │       └── ConfirmacionRecuperacion.module.cssPresentation Layer (React)



**Deliverables**:│   ├── hooks/├── Pages

- Código production-ready

- Documentación completa│   │   └── useFormularioRecuperacion.ts│   └── RecoveryPage.tsx ─────────────────┐

- Build exitoso

│   └── index.ts│       │ orquesta                        │

---

││       ├──> Hooks (useState, etc.)       │

## 4. Estrategia de Testing

├── types/│       └──> Components                   │

### Distribución de Tests

│   └── recuperacion.ts│           ├── RecoveryForm              │

| Capa | Target | Tests | Estrategia |

|------|--------|-------|-----------|││           └── RecoveryConfirmation      │

| Domain | 95% | ~70 | TDD: tests primero |

| Application | 90% | ~35 | TDD: servicios + DTOs |└── routes/│

| Presentation | 85% | ~130 | RTL: comportamiento usuario |

| **Total** | **80%** | **230+** | Mix: unit + integration |    ├── AppRoutes.tsx (actualizar)Application Layer (Services)



### Herramientas    └── index.ts (actualizar)├── Services



- **Vitest 2.1.9**: Unit tests, fixtures, mocking│   └── RecoveryFormService ──────────────┤

- **React Testing Library 16.0.0**: Component tests, accesibilidad

- **Fake timers**: Para simulación de 750msUnion/frontend/tests/│       │ usa                             │



---├── domain/│       ├──> EmailValidator (domain)      │



## 5. Criterios de Aceptación (DoD)│   ├── valueObjects/│       └──> Factories                    │



### Por Tarea│   │   ├── CorreoElectronico.test.ts (15 tests)├── DTOs



- ✅ Código escrito siguiendo especificación│   │   └── EstadoFormularioRecuperacion.test.ts (10 tests)│   ├── RecoveryFormDTO                   │

- ✅ Tests 100% pasando

- ✅ Coverage >= meta por capa│   ├── entities/│   └── RecoverySubmitDTO                 │

- ✅ TypeScript sin errores

- ✅ ESLint sin warnings│   │   └── SolicitudRecuperacion.test.ts (20 tests)└── Factories



### Por Fase│   ├── services/    └── RecoveryFormFactory               │



- ✅ Todas las tareas completadas│   │   └── ValidadorCorreoElectronico.test.ts (20 tests)                                          │

- ✅ Tests pasan

- ✅ Documentación actualizada│   └── errors/Domain Layer (Business Logic)             │

- ✅ Code review pasó

- ✅ Integración validada│       └── ErrorCorreoInvalido.test.ts (5 tests)├── Entities                              │



---││   └── RecoveryForm ◄─────────────────┐  │



## 6. Timeline Estimado├── application/│       │ usa                          │  │



| Fase | Duración | Hitos |│   ├── services/│       ├──> Value Objects             │  │

|------|----------|-------|

| Fase 1 (Domain) | 2-3 días | 50+ tests, 95% coverage |│   │   └── ServicioFormularioRecuperacion.test.ts (25 tests)│       │   ├── Email                  │  │

| Fase 2 (Application) | 2-3 días | 80+ tests, 90% coverage |

| Fase 3 (Presentation) | 3-4 días | 160+ tests, 85% coverage |│   ├── factories/│       │   └── RecoveryState          │  │

| Fase 4 (Integración) | 1-2 días | Routing + estilos |

| Fase 5 (Testing) | 2-3 días | 230+ tests, 80% coverage |│   │   └── FabricaSolicitudRecuperacion.test.ts (5 tests)│       └──> Services                  │  │

| Fase 6 (Refinamiento) | 1-2 días | Production-ready |

| **Total** | **12-18 días** | **Módulo READY** |│   └── dtos/│           └── EmailValidator ◄──────┘  │



---│       └── DTOFormularioRecuperacion.test.ts (5 tests)├── Value Objects                        │



## 7. Riesgos y Mitigación││   ├── Email                            │



| Riesgo | Probabilidad | Impacto | Mitigación |└── integration/│   │   └── valida formato               │

|--------|------------|--------|-----------|

| Cambios en spec | Media | Alto | Revisar spec.md antes de cada fase |    ├── flujo-recuperacion.test.ts (35 tests)│   └── RecoveryState                    │

| Coverage bajo | Media | Medio | Tests desde el principio (TDD) |

| Integración login | Media | Alto | Análisis previo de código existente |    ├── casos-borde.test.ts (15 tests)│       └── estados del proceso          │

| Performance | Baja | Medio | Profiling con DevTools |

| Accesibilidad | Media | Medio | WCAG 2.1 AA en mente desde inicio |    └── navegacion.test.ts (20 tests)└── Services                             │



---```    └── EmailValidator ◄────────────────┘



## 8. Extensibilidad Futura        └── lógica de validación



### Módulo 008 (Actual)---```

- Frontend-only

- Simulación local (setTimeout 750ms)

- NO implementar endpoints

## 3. Plan de Implementación por Fases---

### Módulos Posteriores (909 o similar)

- Implementar endpoints de openapi.yaml

- POST /recuperacion/solicitar → persistencia

- POST /recuperacion/verificar/{token} → cambio de contraseña### Fase 1: Domain Layer (2-3 días)## 3. Fases de Implementación

- Reemplazar simulación con API real



**Preparación en Módulo 008**:

- Estructura DTOs listos (RecoverySubmitDTO)**Objetivo**: Implementar lógica de negocio pura, independent de React.### Fase 1: Domain Layer (2-3 días)

- Servicio preparado para inyección de API

- Componentes NO requieren cambios para integración



---**Deltas**:**Objetivo**: Implementar la lógica de negocio independiente de React.



## 9. Herramientas y Configuración1. ✅ CorreoElectronico (Value Object)



### Ya Instaladas   - Validación regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`#### Tarea 1.1: Value Objects

- ✅ Vitest 2.1.9

- ✅ React Testing Library 16.0.0   - Trimea y normaliza a lowercase- [ ] `Email.ts` - Value object con validación

- ✅ TypeScript 5.5.4

- ✅ Vite 5.4.2   - Lanza ErrorCorreoInvalido si es inválido- [ ] `RecoveryState.ts` - Estados del proceso

- ✅ React 18.3.1

- ✅ React Router v6+   - Factory method: `crear()`- [ ] Tests para ambos value objects

- ✅ ESLint, Prettier



### Sin Librerías Nuevas

- Fase 1-3: Solo lo existente2. ✅ EstadoFormularioRecuperacion (Value Object)**Criterios de aceptación**:

- Si Fase 4 necesita CSS-in-JS: usar existentes

   - Estados: reposo, cargando, exito, error- Email no permite instancias inválidas

---

   - Factory methods para cada estado- Trimea automáticamente

## 10. Definición de Hecho (DoD)

   - Predicados: `esReposo()`, `esCargando()`, `esExito()`, `esError()`- Normaliza a minúsculas

```bash

# Antes de cada merge:- RecoveryState solo puede estar en estados definidos

npm run test                    # 100% passing

npm run test -- --coverage      # >= 80%3. ✅ SolicitudRecuperacion (Entity)- Coverage >= 90%

npm run type-check              # 0 errores

npm run lint                    # 0 warnings   - Propiedades: correo, tocado, errores

npm run build                   # Exitoso

```   - Immutable (cada cambio retorna nueva instancia)#### Tarea 1.2: Entities



---   - Métodos: establecer*, obtener*, agregar*, limpiar*, reiniciar*- [ ] `RecoveryForm.ts` - Entidad principal



**Estado**: Plan 100% definido  - [ ] Tests exhaustivos

**Versión**: 1.0  

**Fecha**: 2026-10-20  4. ✅ ValidadorCorreoElectronico (Service)

**Próximo paso**: Crear tasks.md (45 tareas específicas)

   - Método: `validar()` → {esValido, error?}**Criterios de aceptación**:

   - Mensajes específicos por tipo de error- Inmutable (cada cambio retorna nueva instancia)

   - Métodos auxiliares: `esFormatoValido()`, `esValido()`- Mantiene estado de "tocado"

- Acumula errores por campo

5. ✅ ErrorCorreoInvalido (Custom Error)- Método reset() limpia todo

   - Extends Error- Coverage >= 85%

   - Mensaje descriptivo

#### Tarea 1.3: Domain Services

**Tests Expected**:- [ ] `EmailValidator.ts` - Servicio de validación

- CorreoElectronico: 15 tests (crear, trimear, normalize, invalidar)- [ ] Tests para todos los casos borde

- EstadoFormularioRecuperacion: 10 tests (factory methods, predicados)

- SolicitudRecuperacion: 20 tests (setters, getters, immutability)**Criterios de aceptación**:

- ValidadorCorreoElectronico: 20 tests (validación, mensajes)- Valida emails según regex de clarifications.md

- ErrorCorreoInvalido: 5 tests- Retorna mensajes de error específicos

- Trimea automáticamente

**Total Fase 1**: ~70 tests, >= 95% coverage- Tests cubren: vacío, inválido, válido, con espacios

- Coverage >= 95%

**Definition of Done**:

- Todos los archivos creados con TypeScript puro**Deliverables Fase 1**:

- Tests pasando 100%- ✅ 50+ tests unitarios

- Cobertura >= 95%- ✅ 0 imports de React

- Documentados con JSDoc- ✅ Código testeable sin dependencias externas

- Cero dependencias de React

- No hay console.log/error---



---### Fase 2: Application Layer (2-3 días)



### Fase 2: Application Layer (2 días)**Objetivo**: Implementar servicios de aplicación y DTOs.



**Objetivo**: Orquestar entre domain y presentation.#### Tarea 2.1: Services

- [ ] `RecoveryFormService.ts` - Orquestador

**Deltas**:- [ ] Métodos: validateEmail, handleEmailChange, handleEmailBlur, prepareForSubmit

1. ✅ ServicioFormularioRecuperacion- [ ] Tests exhaustivos

   - Métodos:

     - `validarCorreo()`: valida y marca como tocado**Criterios de aceptación**:

     - `manejarCambioCorreo()`: limpia errores si se reedita- Coordina entre domain y presentation

     - `manejarBlurCorreo()`: valida al perder foco- Retorna formulario validado y mensaje de error

     - `prepararParaEnvio()`: valida antes de submit- Prepara DTO para futura integración

   - Factory: `static crear()`- Coverage >= 90%



2. ✅ FabricaSolicitudRecuperacion#### Tarea 2.2: DTOs y Factories

   - `crear()`: instancia vacía- [ ] `RecoveryFormDTO.ts` + mapper

   - `desdeCorreo()`: con correo específico- [ ] `RecoverySubmitDTO.ts` + builder

   - `conError()`: pre-cargado con error- [ ] `RecoveryFormFactory.ts`

   - `reiniciar()`: instancia limpia- [ ] Tests



3. ✅ DTOFormularioRecuperacion**Criterios de aceptación**:

   - Type: {correo, tocado, errores}- DTOs son serializable

   - Mapper: `aDominio()`, `aDTO()`- Factory crea instancias correctas

- Builders son fluidos

4. ✅ MapeadorFormularioRecuperacion- Coverage >= 85%

   - Convierte entre SolicitudRecuperacion ↔ DTO

**Deliverables Fase 2**:

**Tests Expected**:- ✅ 30+ tests adicionales

- ServicioFormularioRecuperacion: 25 tests- ✅ 80+ tests totales

- FabricaSolicitudRecuperacion: 5 tests- ✅ Aplicación lista para conectar con componentes

- DTOFormularioRecuperacion: 5 tests

---

**Total Fase 2**: ~35 tests, >= 90% coverage

### Fase 3: Presentation Layer (3-4 días)

**Definition of Done**:

- Coordina domain correctamente**Objetivo**: Implementar componentes React y páginas.

- Tests pasando 100%

- Cobertura >= 90%#### Tarea 3.1: Componentes de Presentación

- Factory methods funcionan- [ ] `RecoveryForm.tsx` - Formulario

- Mappers transforman correctamente- [ ] `RecoveryConfirmation.tsx` - Confirmación

- [ ] Tests de componentes

---

**Criterios de aceptación**:

### Fase 3: Presentation Layer (3-4 días)- Componentes "presentacionales" (prop-driven)

- Sin lógica de negocio

**Objetivo**: Crear componentes React y hook principal.- Accesibles (labels, aria-invalid, etc.)

- Responsive (mobile, tablet, desktop)

**Deltas**:- Tests de render y interacción

1. ✅ useFormularioRecuperacion Hook

   - Estado local: solicitud, estado#### Tarea 3.2: Custom Hooks

   - Handlers: cambioCorreo, blurCorreo, envio, reinicio- [ ] `useRecoveryForm.ts` - Hook principal

   - Integración con ServicioFormularioRecuperacion- [ ] Tests del hook

   - Simulación de carga (750ms setTimeout)

**Criterios de aceptación**:

2. ✅ FormularioRecuperacion Component- Gestiona todo el estado

   - Props-driven (sin lógica)- Retorna object con handlers y estado

   - Input controlado (value + onChange)- Integra RecoveryFormService

   - onBlur para validación- Maneja simulación de envío (750ms)

   - Error message condicional (if tocado && error)- Tests cubren: change, blur, submit, reset

   - Spinner durante cargando

   - Botón "Recuperar" disabled si hay errores#### Tarea 3.3: Container Page

- [ ] `RecoveryPage.tsx` - Página completa

3. ✅ ConfirmacionRecuperacion Component- [ ] Integración con navegación

   - Mensaje neutral (igual siempre)- [ ] Tests E2E

   - Botón "Regresar al Login"

   - Animación de éxito (ícono, color)**Criterios de aceptación**:

- Renderiza componentes correctos según estado

4. ✅ PaginaRecuperacion Container- Maneja navegación (regresa a login)

   - Usa useFormularioRecuperacion- Limpia datos al desmontar

   - Renderiza Form o Confirmacion según estado- Coverage >= 85%

   - Integra navegación (useNavigate)

   - Link "Regresar" → /login#### Tarea 3.4: Integración con Login

- [ ] Agregar enlace "¿Olvidaste tu contraseña?" en LoginPage

5. ✅ Types (recuperacion.ts)- [ ] Verificar navegación funciona

   - PropsFormularioRecuperacion- [ ] Tests de integración

   - PropsConfirmacionRecuperacion

   - EstadoFormularioRecuperacionUI**Criterios de aceptación**:

- Enlace visible y clickeable

6. ✅ CSS Modules- Navega a /recuperar-contrasena

   - FormularioRecuperacion.module.css- Regresa a /login funciona

   - ConfirmacionRecuperacion.module.css- No rompe nada en login existente

   - Responsive (mobile, tablet, desktop)

   - Accesibilidad: labels, aria-***Deliverables Fase 3**:

- ✅ 80+ tests de componentes

**Tests Expected**:- ✅ 160+ tests totales

- useFormularioRecuperacion: 30 tests- ✅ Interfaz funcional completa

- FormularioRecuperacion: 35 tests

- ConfirmacionRecuperacion: 15 tests---

- PaginaRecuperacion: 30 tests

- Integration: 20 tests### Fase 4: Routing y Estilos (2 días)



**Total Fase 3**: ~130 tests, >= 85% coverage**Objetivo**: Integrar rutas y CSS.



**Definition of Done**:#### Tarea 4.1: Rutas

- Componentes renderizan correctamente- [ ] Agregar ruta `/recuperar-contrasena` en `AppRoutes.tsx`

- Handlers funcionan- [ ] Tests de navegación

- Validación en blur + submit

- Transición Form → Confirmacion**Criterios de aceptación**:

- Tests pasando 100%- Ruta renderiza RecoveryPage

- Accesibilidad: labels correctas, ARIA- RecoveryPage render bien en ruta

- Tests de integración con router

---

#### Tarea 4.2: Estilos

### Fase 4: Integration & Routing (1-2 días)- [ ] CSS para componentes

- [ ] Responsive en 3 breakpoints mínimo

**Objetivo**: Conectar con sistema existente.- [ ] Accesibilidad visual



**Deltas**:**Criterios de aceptación**:

1. ✅ Actualizar AppRoutes.tsx- Funciona en mobile (320px), tablet (768px), desktop (1024px)

   - Agregar ruta: `/recuperar-contrasena` → PaginaRecuperacion- Sin scroll horizontal

- Elementos accesibles (44px+ en mobile)

2. ✅ Link desde LoginPage- Coherencia con diseño existente

   - Botón "¿Olvidaste tu contraseña?" → /recuperar-contrasena

**Deliverables Fase 4**:

3. ✅ CSS Responsive- ✅ Rutas integradas

   - Breakpoints: mobile (320px), tablet (768px), desktop (1024px)- ✅ CSS listo

   - Flex/Grid layout- ✅ Aplicación completamente funcional

   - Font sizes adaptativos

---

4. ✅ Accesibilidad (a11y)

   - Labels `htmlFor`### Fase 5: Testing Exhaustivo (2-3 días)

   - ARIA labels si es necesario

   - Keyboard navigation (Tab, Enter, Escape)**Objetivo**: Asegurar cobertura >= 80% y casos borde cubiertos.

   - Focus management

#### Tarea 5.1: Tests de Casos Borde

5. ✅ Performance- [ ] Email muy largo (500 chars)

   - Code splitting (lazy load si aplica)- [ ] Email con caracteres especiales (+, -, .)

   - Memoization (React.memo, useMemo, useCallback)- [ ] Email solo mayúsculas

   - No re-renders innecesarios- [ ] Espacios en medio

- [ ] Solo espacios en blanco

**Tests Expected**:- [ ] Múltiples @

- Integration: 20-30 tests (navegación, flujo completo)- [ ] Click repetido en continuar

- [ ] Navegación directa a ruta

**Definition of Done**:- [ ] Pantalla muy pequeña

- Rutas integradas

- Links funcionan**Criterios de aceptación**:

- CSS responsive en todos los breakpoints- Todos los casos borde de spec.md están testeados

- a11y: keyboard navigation OK- Tests fallan si se modifica comportamiento

- Performance: sin warnings en Lighthouse- Coverage >= 80%



---#### Tarea 5.2: Tests de Integración

- [ ] Flujo completo: login → recovery → confirmación → login

### Fase 5: Testing & Coverage (2-3 días)- [ ] Cancelación en cualquier punto

- [ ] Validación end-to-end

**Objetivo**: Alcanzar >= 80% cobertura total con 230+ tests.- [ ] Sincronía con login existente



**Deltas**:**Criterios de aceptación**:

1. ✅ Tests de Integración Completa- Tests E2E demuestran flujos funcionales

   - Usuario ingresa email → blur → error → corrección → submit → éxito- No hay efectos colaterales

   - Casos borde (espacios, mayúsculas, multiple @, etc.)- Datos se limpian correctamente

   - Error recovery

#### Tarea 5.3: Tests de Accesibilidad

2. ✅ Aumentar Cobertura- [ ] Labels vinculados

   - Domain: 95% (todas las ramas)- [ ] aria-invalid y aria-describedby

   - Application: 90%- [ ] Navegación con teclado

   - Presentation: 85%- [ ] Contraste de colores

   - Integration: 100%- [ ] Focus visible



3. ✅ Casos Borde (13 CB de spec.md)**Criterios de aceptación**:

   - CB-001 a CB-013 todos cubiertos- Tests verifican accesibilidad

   - Edge cases: empty, invalid format, special chars, etc.- Axe-core lint pasa (si se integra)



4. ✅ Snapshot Tests (opcional)**Deliverables Fase 5**:

   - FormularioRecuperacion snapshot- ✅ 50+ tests adicionales

   - ConfirmacionRecuperacion snapshot- ✅ 220+ tests totales

- ✅ 80%+ coverage

5. ✅ Error Boundaries (opcional)- ✅ Todos los casos borde cubiertos

   - Manejo de errores inesperados

---

**Tests Expected**:

- Tests nuevos de integración: ~45 tests### Fase 6: Refinamiento y Documentación (1-2 días)

- Tests ajustados para cobertura: variable

**Objetivo**: Limpiar código, documentar, preparar para producción.

**Total Fase 5**: ~45 tests nuevos (230+ total)

#### Tarea 6.1: Revisión de Código

**Definition of Done**:- [ ] Linter (ESLint)

- Cobertura >= 80% (comprobable con `npm run test -- --coverage`)- [ ] Formatter (Prettier)

- 230+ tests totales- [ ] No console.log/error en producción

- Todos los CB cubiertos- [ ] TypeScript sin errores

- Todos los HU validados con tests

- Tests claros, mantenibles, rápidos**Criterios de aceptación**:

- 0 errores de linter

---- 0 advertencias relevantes

- 0 console statements

### Fase 6: Refinement & Production (1-2 días)- 0 errores TypeScript



**Objetivo**: Asegurar calidad y documentación.#### Tarea 6.2: Documentación

- [ ] Comentarios en código complejo

**Deltas**:- [ ] README de módulo

1. ✅ ESLint- [ ] Guía de uso para componentes

   - Ejecutar: `npm run lint`

   - Arreglar todos los warnings**Criterios de aceptación**:

   - 0 errores al terminar- Código auto-documentado

- Contratos claros en tipos

2. ✅ TypeScript- Ejemplos de uso

   - Ejecutar: `npm run type-check`

   - 0 errores de tipo#### Tarea 6.3: Build y Verificación

   - No usar `any` innecesariamente- [ ] `npm run build` exitoso

- [ ] Verificar tamaño de bundle

3. ✅ Performance- [ ] Performance check

   - Lighthouse audit

   - Bundle size check**Criterios de aceptación**:

   - No memory leaks- Build tiempo < 1 segundo

- Bundle size razonable

4. ✅ Documentación- No hay warnings en build

   - JSDoc en funciones públicas

   - README de módulo (opcional)**Deliverables Fase 6**:

   - Comentarios en lógica compleja- ✅ Código listo para producción

- ✅ Documentación completa

5. ✅ Final Review- ✅ README módulo 005

   - Code review con equipo

   - Verificar spec.md compliance---

   - Verificar clarifications.md compliance

## 4. Estrategia de Testing

6. ✅ Production-Ready

   - Build: `npm run build`### 4.1 Niveles de Testing

   - No warnings

   - Asset sizes OK```

                        Tests E2E (10-15)

**Tests Expected**:                        Flujos completosOctober

- No tests nuevos (refinement)                              ↑

- Todos los tests siguen pasando                Integration Tests (30-40)

                Sincronía, componentes juntos

**Definition of Done**:                              ↑

- ESLint: 0 warnings            Component Tests (60-80) [React Testing Library]

- TypeScript: 0 errors            Render, interacción, props

- Cobertura: >= 80%                              ↑

- Performance: Lighthouse > 90            Unit Tests (100-130) [Vitest]

- Documentation: completa            Servicios, validators, entidades

- Ready to merge ✅```



---### 4.2 Coverage Target



## 4. Hoja de Ruta Temporal| Capa | Target | Mínimo |

|------|--------|--------|

```| Domain | 95% | 90% |

Día 1-2:   Fase 1 (Domain Layer)     → 70 tests, 95% coverage| Application | 90% | 85% |

Día 3:     Fase 2 (Application)      → 35 tests, 90% coverage| Presentation | 80% | 75% |

Día 4-6:   Fase 3 (Presentation)     → 130 tests, 85% coverage| **Total** | **85%** | **80%** |

Día 6:     Fase 4 (Integration)      → 30 tests integration

Día 7-8:   Fase 5 (Testing & Cov.)   → +45 tests, total 230+, 80%+### 4.3 Tipos de Tests por Artifact

Día 8:     Fase 6 (Refinement)       → 0 errors, production-ready

#### Domain Layer

Total: 8 días laborales

```**EmailValidator.ts**: ~25 tests

- Vacío: 3 tests

---- Formato inválido: 8 tests

- Formato válido: 10 tests

## 5. Estrategia de Testing- Edge cases: 4 tests



### Test Pyramid**RecoveryForm.ts**: ~20 tests

- Creación: 3 tests

```- Setters: 5 tests

           /\                    (E2E & Integration)- Errores: 8 tests

          /  \                   ~20% of tests- Reset: 2 tests

         /────\- Immutabilidad: 2 tests

        /      \                 (Component Tests)

       /        \                ~50% of tests**Email.ts**: ~10 tests

      /──────────\- Instanciación válida: 3 tests

     /            \              (Unit Tests)- Instanciación inválida: 4 tests

    /              \             ~30% of tests- Métodos: 3 tests

   /────────────────\

  (Domain Tests)**RecoveryState.ts**: ~8 tests

```- Factory methods: 4 tests

- Predicados: 4 tests

### Cobertura por Capa

**Subtotal Domain**: ~63 tests

| Capa | Target | Tests | Archivos |

|------|--------|-------|----------|#### Application Layer

| Domain | 95% | 70 | 5 |

| Application | 90% | 35 | 4 |**RecoveryFormService.ts**: ~25 tests

| Presentation | 85% | 130 | 7 |- validateEmail: 6 tests

| Integration | 100% | 45 | 3 |- handleEmailChange: 4 tests

| **TOTAL** | **80%** | **280** | **19** |- handleEmailBlur: 4 tests

- prepareForSubmit: 5 tests

### Tipos de Tests- createSubmitDTO: 3 tests

- Integration: 3 tests

1. **Unit Tests** (70%):

   - Domain layer (Value Objects, Entities, Services)**RecoveryFormDTO.ts**: ~5 tests

   - Application layer (Services, Factories)- Mapper to domain: 2 tests

   - Lógica sin dependencias- Mapper to DTO: 2 tests

- Serialización: 1 test

2. **Component Tests** (20%):

   - Render del componente**RecoveryFormFactory.ts**: ~5 tests

   - Props funcionan- create: 1 test

   - Handlers disparan correctamente- fromEmail: 1 test

   - Usar React Testing Library- reset: 1 test

- withError: 2 tests

3. **Integration Tests** (10%):

   - Flujo completo usuario**Subtotal Application**: ~35 tests

   - Interacción entre capas

   - Navegación#### Presentation Layer

   - Estados finales

**RecoveryForm.tsx**: ~30 tests

### Test Naming Convention- Render inicial: 3 tests

- Props: 5 tests

```typescript- onChange: 4 tests

describe('CorreoElectronico', () => {- onBlur: 3 tests

  describe('crear', () => {- onSubmit: 4 tests

    it('debe crear correo válido', () => {});- Errores visual: 4 tests

    it('debe trimear espacios', () => {});- Loading state: 4 tests

  });- Accesibilidad: 3 tests

});

```**RecoveryConfirmation.tsx**: ~10 tests

- Render: 2 tests

### Testing Tools & Config- Mensaje neutral: 2 tests

- Botón regresar: 2 tests

```bash- Props: 2 tests

# Vitest 2.1.9- Accesibilidad: 2 tests

npm run test                    # Watch mode

npm run test run                # Single run**useRecoveryForm.ts**: ~25 tests

npm run test -- --coverage      # Con cobertura- Inicial state: 2 tests

npm run test -- --reporter=verbose  # Verbose- handleEmailChange: 4 tests

- handleEmailBlur: 4 tests

# React Testing Library 16.0.0- handleSubmit: 6 tests

npm run test -- src/**/*.test.ts- handleReset: 2 tests

```- Loading state: 3 tests

- Success state: 2 tests

---

**RecoveryPage.tsx**: ~20 tests

## 6. Criterios de Aceptación (DoD)- Render inicial: 2 tests

- Cambio de view (form → confirmation): 2 tests

### Código- Navegación: 3 tests

- ✅ TypeScript: sin errores- Limpieza de datos: 3 tests

- ✅ ESLint: sin warnings- Props forwarding: 4 tests

- ✅ Prettier: formateado- Integración: 3 tests

- ✅ Tests: 100% pasando

- ✅ Cobertura: >= 80% (95% domain, 90% app, 85% presentation)**Subtotal Presentation**: ~85 tests



### Funcionalidad#### Integration & E2E

- ✅ Validación en blur + submit

- ✅ Errores específicos por tipo**Flujo completoFlujoConfirmación.test.tsx**: ~8 tests

- ✅ Confirmación neutral- Login → Recovery → Confirmación → Login

- ✅ Navegación /login ↔ /recuperar-contrasena- Cancelación en cada paso

- ✅ Simulación 750ms- Datos limpios después



### Calidad**FlujoValidación.test.tsx**: ~10 tests

- ✅ Accesibilidad: labels, ARIA, keyboard navigation- Validación inmediata

- ✅ Responsive: mobile, tablet, desktop- Corrección de errores

- ✅ Performance: Lighthouse > 90- Submit con y sin errores

- ✅ Security: sin vulnerabilidades

**SincroniaLogin.test.ts**: ~10 tests

### Documentación- Enlace en login funciona

- ✅ JSDoc en funciones públicas- Regresar desde recovery

- ✅ Comentarios en lógica compleja- No rompe login existente

- ✅ README de módulo (si aplica)

- ✅ Decisiones registradas en clarifications.md**Subtotal Integration/E2E**: ~28 tests



---### 4.4 Total Estimado: 211+ tests ✅



## 7. Riesgos y Mitigación---



| Riesgo | Probabilidad | Impacto | Mitigación |## 5. Definición de Hecho (Definition of Done)

|--------|------------|--------|-----------|

| Cambios en spec.md | Media | Alto | Revisar spec.md antes de empezar cada fase |### Por Tarea

| Coverage bajo | Media | Medio | Tests desde el principio (TDD) |

| Performance | Baja | Medio | Profiling con DevTools |#### ✅ Code Complete

| Accesibilidad | Media | Medio | WCAG 2.1 AA en mind |- [ ] Código escrito siguiendo especificación

| Integración backend futura | Baja | Bajo | Estructurar para plug-and-play |- [ ] Sin TODO pendientes

- [ ] Sin código comentado obsoleto

---- [ ] Nombres descriptivos



## 8. Dependencias y Recursos#### ✅ Tests Passing

- [ ] Unit tests 100% pasando

### Internos- [ ] Integration tests 100% pasando

- ✅ spec.md — Especificación funcional (referencia)- [ ] Coverage >= 80%

- ✅ clarifications.md — Decisiones técnicas (referencia)- [ ] No hay test.skip() ni test.only()

- ✅ data-model.md — Entidades y tipos (referencia)

- ✅ research.md — Investigación técnica (referencia)#### ✅ Code Quality

- ✅ Módulo 006 — Patrón DDD de referencia- [ ] ESLint sin errores

- ✅ tasks.md — 40 tareas detalladas (descomposición)- [ ] Prettier formateado

- [ ] TypeScript sin errores

### Externos- [ ] No console.log/error en producción

- Vitest Docs: https://vitest.dev/

- React Testing Library: https://testing-library.com/react#### ✅ Documentation

- TypeScript Handbook: https://www.typescriptlang.org/docs/- [ ] Comentarios en código complejo

- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/- [ ] Tipos documentados

- [ ] README actualizado

---

#### ✅ Performance

## 9. Monitoreo y Control- [ ] Build time < 1s

- [ ] No performance regressions

### Checkpoints por Fase- [ ] Validación < 10ms



**Fase 1 Complete Check**:### Por Fase

- [ ] Todos los VOs creados

- [ ] Todos los Entities creados#### ✅ Fase 1 DoD

- [ ] Todos los Services creados- 50+ tests pasando

- [ ] 70+ tests pasando- Domain layer 100% funcional

- [ ] Cobertura 95%+- Código standalone (sin React)

- [ ] TypeScript OK

- [ ] ESLint OK#### ✅ Fase 2 DoD

- 30+ tests nuevos (80+ totales)

**Fase 2 Complete Check**:- Application layer 100% funcional

- [ ] Servicios de aplicación creados- Puede conectarse a presentation

- [ ] Factories creadas

- [ ] DTOs creados#### ✅ Fase 3 DoD

- [ ] 35+ tests pasando- 80+ tests nuevos (160+ totales)

- [ ] Cobertura 90%+- Presentation layer 100% funcional

- [ ] Integración domain OK- UI interactiva completa

- Integración con login

**Fase 3 Complete Check**:

- [ ] Hook creado y testado#### ✅ Fase 4 DoD

- [ ] Componentes creados- Rutas integradas

- [ ] CSS responsive OK- Estilos completos

- [ ] 130+ tests pasando- Responsive en 3 breakpoints

- [ ] Cobertura 85%+- 0 crashes

- [ ] Validación blur + submit funciona

#### ✅ Fase 5 DoD

**Fase 4 Complete Check**:- 50+ tests nuevos (220+ totales)

- [ ] Rutas integradas- Coverage >= 80%

- [ ] Links funcionan- Todos los casos borde cubiertos

- [ ] Navegación OK- E2E tests pasando

- [ ] a11y verificado

#### ✅ Fase 6 DoD

**Fase 5 Complete Check**:- 0 errores TypeScript

- [ ] 230+ tests total- 0 console statements

- [ ] Cobertura >= 80%- Build exitoso

- [ ] Todos los CB cubiertos- Documentación completa

- [ ] Todos los HU validados- Listo para producción



**Fase 6 Complete Check**:---

- [ ] ESLint: 0 warnings

- [ ] TypeScript: 0 errors## 6. Timeline Estimado

- [ ] Lighthouse > 90

- [ ] Production build OK| Fase | Duración | Hitos |

- [ ] Code review passed|------|----------|-------|

| Fase 1 (Domain) | 2-3 días | 50+ tests, sin React |

---| Fase 2 (Application) | 2-3 días | 80+ tests, servicios funcionales |

| Fase 3 (Presentation) | 3-4 días | 160+ tests, UI completa |

## 10. Entrega Final| Fase 4 (Routing/CSS) | 2 días | Integración, estilos |

| Fase 5 (Testing) | 2-3 días | 220+ tests, casos borde |

### Artifacts| Fase 6 (Refinamiento) | 1-2 días | Producción-ready |

- ✅ Código fuente en src/| **Total** | **12-18 días** | **Módulo 005 READY** |

- ✅ Tests en tests/

- ✅ 230+ tests pasando---

- ✅ Cobertura >= 80%

- ✅ Documentación (JSDoc, README)## 7. Criterios de Éxito

- ✅ Build producción compilado

### Funcional

### Validación- ✅ Usuario puede acceder a recuperación desde login

- ✅ Spec.md compliance: 100%- ✅ Validación de email funciona correctamente

- ✅ Clarifications.md compliance: 100%- ✅ Mensajes de error son claros y específicos

- ✅ Data-model.md compliance: 100%- ✅ Confirmación es neutral (no revela existencia de cuenta)

- ✅ Tasks.md compliance: 100%- ✅ Usuario puede navegar de/hacia login sin problemas

- ✅ Research.md findings applied: 100%

### Técnico

### Sign-Off- ✅ 220+ tests, 100% pasando

- [ ] Lead Developer: _________ Date: _______- ✅ Coverage >= 80%

- [ ] Tech Lead: _________ Date: _______- ✅ 0 errores TypeScript

- [ ] QA: _________ Date: _______- ✅ 0 console.log/error

- ✅ Build exitoso (< 1s)

---- ✅ Responsive en 3 breakpoints



## 11. Referencias Cruzadas### UX

- ✅ Interfaz intuitiva y clara

| Documento | Sección | Propósito |- ✅ Accesible (WCAG AA mínimo)

|-----------|---------|----------|- ✅ Coherencia visual con login

| spec.md | 8 HU | Validar funcionalidad |- ✅ Navegación rápida (< 100ms)

| clarifications.md | 10 ambigüedades | Decisiones técnicas |- ✅ Feedback claro en cada paso

| data-model.md | Entidades | Definiciones |

| research.md | Técnicas | Justificaciones |### Mantenibilidad

| tasks.md | 40 tareas | Descomposición |- ✅ Código limpio y autodocumentado

| constitution.md | Principios | Guía general |- ✅ Separación clara de capas (DDD)

- ✅ Servicios desacoplados de React

---- ✅ Preparado para integración backend

- ✅ Tests exhaustivos como documentación viva

**Estado**: Plan 100% completo y actualizado  

**Versión**: 1.0  ---

**Fecha**: 2026-10-20  

**Próximo**: Comenzar Fase 1 — Domain Layer## 8. Riesgos y Mitigación


### Riesgo 1: Complejidad de Validación
**Impacto**: Alto  
**Probabilidad**: Media  
**Mitigación**: Tests exhaustivos de casos borde en Fase 1

### Riesgo 2: Integración con Login Existente
**Impacto**: Alto  
**Probabilidad**: Media  
**Mitigación**: Análisis previo de código existente

### Riesgo 3: Performance de Validación
**Impacto**: Bajo  
**Probabilidad**: Baja  
**Mitigación**: Benchmarks en tests

### Riesgo 4: Accesibilidad
**Impacto**: Medio  
**Probabilidad**: Media  
**Mitigación**: Tests de a11y en Fase 5

### Riesgo 5: Scope Creep
**Impacto**: Alto  
**Probabilidad**: Alta  
**Mitigación**: Adherer estrictamente a spec.md

---

## 9. Herramientas y Configuración

### Herramientas ya Instaladas (según package.json módulo 006)
- ✅ Vitest 2.1.9
- ✅ React Testing Library 16.0.0
- ✅ TypeScript 5.5.4
- ✅ Vite 5.4.2
- ✅ React 18.3.1
- ✅ React Router v6+
- ✅ ESLint
- ✅ Prettier

### Configuración Requerida
- ✅ Vitest config (ya existe en módulo 006)
- ✅ TypeScript config (ya existe)
- ✅ ESLint config (ya existe)
- ✅ Rutas en AppRoutes.tsx (agregar)

### Sin Herramientas Nuevas
- No se agregarán librerías nuevas en Fase 1-3
- Si en Fase 4 se necesita CSS-in-JS, usar existentes

---

## 10. Monitoreo de Progreso

### Checklist por Día

**Día 1-2: Domain Layer**
- [ ] Email.ts y tests
- [ ] RecoveryState.ts y tests
- [ ] RecoveryForm.ts y tests
- [ ] EmailValidator.ts y tests
- [ ] 50+ tests pasando
- [ ] Coverage domain >= 90%

**Día 3: Application Layer**
- [ ] RecoveryFormService.ts y tests
- [ ] DTOs y factories
- [ ] 80+ tests totales
- [ ] Linter OK

**Día 4-6: Presentation Layer**
- [ ] useRecoveryForm hook
- [ ] RecoveryForm component
- [ ] RecoveryConfirmation component
- [ ] RecoveryPage container
- [ ] 160+ tests totales

**Día 7-8: Integración y Estilos**
- [ ] Rutas integradas
- [ ] CSS/Styling
- [ ] Link en LoginPage
- [ ] 0 crashes

**Día 9-10: Testing Exhaustivo**
- [ ] Casos borde testeados
- [ ] E2E tests
- [ ] Coverage >= 80%
- [ ] 220+ tests

**Día 11-12: Refinamiento**
- [ ] 0 TypeScript errors
- [ ] 0 console statements
- [ ] Build exitoso
- [ ] Documentación completa
- [ ] Módulo READY

---

**Estado**: Plan 100% definido  
**Versión**: 1.0  
**Fecha**: 2026-10-20  
**Próximo paso**: Crear tasks.md
