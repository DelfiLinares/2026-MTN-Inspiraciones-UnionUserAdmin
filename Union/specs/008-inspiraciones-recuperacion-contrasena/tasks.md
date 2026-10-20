# Tasks — 008 Recuperación de Contraseña# Tasks — 008 Recuperación de Contraseña# Tasks — 005 Recuperación de Contraseña



**Versión**: 1.0  

**Estado**: ✅ 58 Tareas Completamente Definidas  

**Módulo**: 008  **Versión**: 1.0  **Versión**: 1.0  

**Fecha**: 2026-10-20  

**Estado**: ✅ Tasks Reorganizadas por Fases  **Estado**: ✅ Tasks Completas  

---

**Fecha**: 2026-10-20  **Fecha**: 2026-10-20  

## Propósito

**Módulo**: 008 Recuperación de Contraseña  **Módulo**: 005 Recuperación de Cuenta y Contraseña  

Este documento define 58 tareas concretas y únicas para implementar el módulo 008 de recuperación de contraseña, basadas en HU, RF, RNF y CB de la especificación. Todas las tareas usan nomenclatura en español y marcan aquellas que pueden ejecutarse en paralelo [P].

**Total Tasks**: T001-T050 (50 tareas)  

---

**Organización**: 10 Fases  ---

## Matriz de Trazabilidad: RF ↔ Tareas



| RF | HU | Tareas | Fase | Prioridad |

|----|----|---------|----|-----------|---## Propósito

| RF-001 | HU-001 | T001, T002, T003 | Dominio | ALTA |

| RF-002 | HU-002 | T004, T005, T006 | Dominio | ALTA |

| RF-003 | HU-003 | T007, T008, T009, T010 | Dominio | ALTA |

| RF-004 | HU-003 | T011, T012, T013 | Aplicación | ALTA |## PropósitoEste documento desglosa el trabajo en tareas específicas (T001-T060) que deben ejecutarse secuencialmente según `plan.md`. Cada tarea incluye:

| RF-005 | HU-004 | T014, T015, T016, T017 | Dominio | ALTA |

| RF-006 | HU-004 | T018, T019, T020 | Dominio | ALTA |

| RF-007 | HU-005 | T021, T022, T023 | Presentación | ALTA |

| RF-008 | HU-006 | T024, T025, T026 | Presentación | ALTA |Este documento organiza el trabajo en **50 tareas específicas** agrupadas en **10 fases** de implementación. Cada tarea es:- **Descripción clara**

| RF-009 | HU-006 | T027, T028, T029 | Presentación | ALTA |

| RF-010 | HU-007 | T030, T031 | Presentación | MEDIA |- Independiente y ejecutable- **Criterios de aceptación numerados**

| RF-011 | HU-007 | T032, T033 | Presentación | MEDIA |

| RF-012 | HU-008 | T034, T035, T036 | Presentación | MEDIA |- Bien definida con criterios de aceptación- **Archivos a crear/modificar**

| RF-013 | HU-008 | T037 | Integración | BAJA |

| RF-014 | HU-003 | T038 | Testing | BAJA |- Marcada con dependencias claras- **Tests esperados**

| RF-015 | HU-006 | T039 | Testing | BAJA |

| RF-016 | HU-008 | T040 | Testing | BAJA |- Indicada como paralelizable [P] donde aplique- **Estimación de tiempo**



---- Rastreable a requisitos de spec.md- **Dependencias**



## Fase 1: Capa de Dominio (2-3 días)



### 1.1 Value Objects**IMPORTANTE**: Este documento define TAREAS, NO código. Ninguna tarea incluye implementación.---



**T001** [P] - Crear VO CorreoElectronico con validación regex

- HU: HU-001

- RF: RF-001---## FASE 1: Domain Layer (Tareas T001-T012)

- Descripción: Implementar value object inmutable que valide emails con regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

- Entrada: String con email

- Salida: CorreoElectronico o ErrorCorreoInvalido

- Criterios: Trimea, lowercase, regex validación## Estructura de Cada Tarea### ✅ T001: Crear Value Object `Email` con Validación

- Archivo: `src/domain/valueObjects/CorreoElectronico.ts`



**T002** [P] - Validar y normalizar email en CorreoElectronico

- HU: HU-001```**Categoría**: Domain Layer - Value Objects  

- RF: RF-001

- Descripción: Implementar normalización (trim, lowercase) en constructor**T0XX: Descripción Breve****Prioridad**: P1 - CRÍTICA  

- Entrada: String con espacios/mayúsculas

- Salida: Email normalizado**Estimación**: 2 horas  

- Criterios: Máximo 255 caracteres, sin espacios, lowercase

- Archivo: `src/domain/valueObjects/CorreoElectronico.ts`**Fase**: [Fase # — Nombre]  **Dependencias**: Ninguna  



**T003** [P] - Crear método de igualdad en CorreoElectronico**Prioridad**: P1/P2/P3  

- HU: HU-001

- RF: RF-001**Paralelizable**: [P] Sí / No  **Descripción**:

- Descripción: Implementar `esIgual()` para comparación segura

- Entrada: CorreoElectronico**Estimación**: X horas  Implementar el Value Object `Email` que encapsula la validación de correos electrónicos según especificación.

- Salida: Boolean

- Criterios: Comparación case-insensitive**Dependencias**: T000, T001...  

- Archivo: `src/domain/valueObjects/CorreoElectronico.ts`

**Archivos a crear**:

**T004** [P] - Crear VO EstadoFormularioRecuperacion

- HU: HU-002**Descripción**:1. `src/domain/valueObjects/Email.ts`

- RF: RF-002

- Descripción: Value object para estados: reposo, cargando, exito, errorExplicación detallada de qué debe hacerse2. `src/domain/errors/EmailInvalidError.ts`

- Entrada: EstadoEnum

- Salida: EstadoFormularioRecuperacion3. `tests/domain/valueObjects/Email.test.ts`

- Criterios: Factory methods para cada estado

- Archivo: `src/domain/valueObjects/EstadoFormularioRecuperacion.ts`**Archivos Afectados**:



**T005** [P] - Implementar predicados en EstadoFormularioRecuperacion- Crear: src/archivo.ts**Criterios de Aceptación**:

- HU: HU-002

- RF: RF-002- Modificar: src/archivo-existente.tsx

- Descripción: Métodos `esReposo()`, `esCargando()`, `esExito()`, `esError()`

- Entrada: EstadoFormularioRecuperacion- Tests: tests/archivo.test.ts- [ ] C-001: Clase Email en archivo correcto

- Salida: Boolean para cada predicado

- Criterios: Retornan true solo para estado específico- [ ] C-002: Constructor valida formato con regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

- Archivo: `src/domain/valueObjects/EstadoFormularioRecuperacion.ts`

**Criterios de Aceptación**:- [ ] C-003: Constructor lanza `EmailInvalidError` si email es inválido

**T006** [P] - Manejo de mensajes en EstadoFormularioRecuperacion

- HU: HU-002- [ ] Criterio 1- [ ] C-004: Constructor trimea automáticamente espacios

- RF: RF-002

- Descripción: Implementar `obtenerMensaje()` para errores- [ ] Criterio 2- [ ] C-005: Constructor normaliza a minúsculas

- Entrada: EstadoFormularioRecuperacion

- Salida: String | undefined...- [ ] C-006: Método `getValue()` retorna email validado

- Criterios: Solo estado ERROR puede tener mensaje

- Archivo: `src/domain/valueObjects/EstadoFormularioRecuperacion.ts`- [ ] C-007: Método `equals()` compara correctamente



---**Tests Esperados**:- [ ] C-008: Método `toString()` retorna valor



### 1.2 Entities- Test 1- [ ] C-009: Factory method `Email.create()`



**T007** [P] - Crear Entity SolicitudRecuperacion- Test 2- [ ] C-010: Pruebas: email válido, inválido, con espacios, sin @, sin punto

- HU: HU-003

- RF: RF-003- [ ] C-011: Coverage >= 95%

- Descripción: Implementar entidad que represente solicitud de recuperación con correo, tocado, errores

- Entrada: correo?: string, tocado?: boolean**Ref Spec**: HU-XXX, RF-XXX- [ ] C-012: 0 errores TypeScript

- Salida: SolicitudRecuperacion

- Criterios: Inmutable (cada cambio retorna nueva instancia)```

- Archivo: `src/domain/entities/SolicitudRecuperacion.ts`

**Tests Esperados** (~10 tests):

**T008** [P] - Implementar getter/setter fluidos en SolicitudRecuperacion

- HU: HU-003---```

- RF: RF-003

- Descripción: Métodos que retornan nueva instancia (patrón immutable)✓ debe crear Email válido

- Entrada: nuevos valores

- Salida: SolicitudRecuperacion# FASE 1: Setup e Integración con Frontend Existente✓ debe rechazar Email inválido (sin @)

- Criterios: `establecerCorreo()`, `establecerTocado()`, etc.

- Archivo: `src/domain/entities/SolicitudRecuperacion.ts`✓ debe rechazar Email sin punto en dominio



**T009** [P] - Manejo de errores en SolicitudRecuperacionObjetivo: Preparar la estructura base del proyecto y integrar rutas.✓ debe trimear espacios automáticamente

- HU: HU-003

- RF: RF-003✓ debe normalizar a minúsculas

- Descripción: Métodos `agregarError()`, `obtenerError()`, `tieneErrores()`, `limpiarErrores()`

- Entrada: campo: string, mensaje: string---✓ getValue() retorna email

- Salida: SolicitudRecuperacion o string | undefined

- Criterios: Map<string, string> para errores✓ equals() compara correctamente

- Archivo: `src/domain/entities/SolicitudRecuperacion.ts`

## T001: Crear Estructura de Carpetas para Módulo 008✓ toString() funciona

**T010** [P] - Método reiniciar en SolicitudRecuperacion

- HU: HU-003✓ Email.create() factory funciona

- RF: RF-003

- Descripción: Implementar `reiniciar()` que borre todo**Fase**: 1 — Setup  ✓ debe lanzar EmailInvalidError con mensaje descriptivo

- Entrada: void

- Salida: SolicitudRecuperacion limpia**Prioridad**: P1  ```

- Criterios: Vuelve a estado inicial

- Archivo: `src/domain/entities/SolicitudRecuperacion.ts`**Paralelizable**: [P] No (base requerida)  



---**Estimación**: 0.5 horas  **Comandos**:



### 1.3 Domain Services```bash



**T011** [P] - Crear ValidadorCorreoElectronico con regex**Descripción**:# Verificar

- HU: HU-003, HU-004

- RF: RF-004, RF-005Crear la estructura de carpetas necesaria para alojar el código del módulo 008 siguiendo el patrón DDD de 3 capas.npm run test -- tests/domain/valueObjects/Email.test.ts

- Descripción: Service que valida emails y retorna `{esValido, error?}`

- Entrada: string email```

- Salida: {esValido: boolean, error?: string}

- Criterios: Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`**Archivos Afectados**:

- Archivo: `src/domain/services/ValidadorCorreoElectronico.ts`

- Crear: `src/domain/valueObjects/`---

**T012** [P] - Mensajes de error específicos en ValidadorCorreoElectronico

- HU: HU-004- Crear: `src/domain/entities/`

- RF: RF-005

- Descripción: Implementar mensajes: "El correo electrónico es requerido" y "Ingresa un correo electrónico válido"- Crear: `src/domain/services/`### ✅ T002: Crear Value Object `RecoveryState`

- Entrada: string email

- Salida: Mensaje específico- Crear: `src/domain/errors/`

- Criterios: 2 casos (vacío, formato inválido)

- Archivo: `src/domain/services/ValidadorCorreoElectronico.ts`- Crear: `src/application/services/`**Categoría**: Domain Layer - Value Objects  



**T013** [P] - Métodos auxiliares en ValidadorCorreoElectronico- Crear: `src/application/factories/`**Prioridad**: P1 - CRÍTICA  

- HU: HU-004

- RF: RF-005- Crear: `src/application/dtos/`**Estimación**: 1.5 horas  

- Descripción: Implementar `esFormatoValido()` y `esValido()` públicos

- Entrada: string email- Crear: `src/presentation/pages/recuperar-contrasena/`**Dependencias**: T001  

- Salida: boolean

- Criterios: Métodos simples sin mensajes- Crear: `src/presentation/components/recuperacion/`

- Archivo: `src/domain/services/ValidadorCorreoElectronico.ts`

- Crear: `src/presentation/hooks/`**Descripción**:

**T014** [P] - Crear ErrorCorreoInvalido custom error

- HU: HU-004- Crear: `tests/domain/valueObjects/`Implementar el Value Object `RecoveryState` que representa los posibles estados del proceso de recuperación.

- RF: RF-005

- Descripción: Implementar clase que extienda Error- Crear: `tests/domain/entities/`

- Entrada: mensaje: string

- Salida: ErrorCorreoInvalido- Crear: `tests/domain/services/`**Archivos a crear**:

- Criterios: name = 'ErrorCorreoInvalido'

- Archivo: `src/domain/errors/ErrorCorreoInvalido.ts`- Crear: `tests/application/services/`1. `src/domain/valueObjects/RecoveryState.ts`



**T015** [P] - Crear factory method en ValidadorCorreoElectronico- Crear: `tests/application/factories/`2. `tests/domain/valueObjects/RecoveryState.test.ts`

- HU: HU-004

- RF: RF-005- Crear: `tests/integration/recuperacion/`

- Descripción: Implementar `static crear()`

- Entrada: void**Criterios de Aceptación**:

- Salida: ValidadorCorreoElectronico

- Criterios: Patrón factory**Criterios de Aceptación**:

- Archivo: `src/domain/services/ValidadorCorreoElectronico.ts`

- [ ] Todas las carpetas creadas- [ ] C-001: Enum `RecoveryStatusEnum` con 4 valores: idle, loading, success, error

---

- [ ] Archivos `index.ts` en carpetas principales (barrel exports)- [ ] C-002: Clase `RecoveryState` con campo privado `status`

## Fase 2: Capa de Aplicación (2-3 días)

- [ ] Estructura coincide con data-model.md- [ ] C-003: Clase `RecoveryState` con campo privado `error` opcional

### 2.1 Application Services

- [ ] C-004: Constructor privado

**T016** [P] - Crear ServicioFormularioRecuperacion

- HU: HU-003, HU-004**Tests Esperados**:- [ ] C-005: Factory methods: `idle()`, `loading()`, `success()`, `error(message)`

- RF: RF-006, RF-007

- Descripción: Service que orquesta validación y cambios de estado- N/A (setup)- [ ] C-006: Métodos getters: `getStatus()`, `getError()`

- Entrada: SolicitudRecuperacion

- Salida: SolicitudRecuperacion validada- [ ] C-007: Métodos predicados: `isIdle()`, `isLoading()`, `isSuccess()`, `isError()`

- Criterios: Inyecta ValidadorCorreoElectronico

- Archivo: `src/application/services/ServicioFormularioRecuperacion.ts`**Ref Spec**: plan.md § 2.3 Estructura de Carpetas- [ ] C-008: Tests cubren todos los estados



**T017** [P] - Implementar validarCorreo en ServicioFormularioRecuperacion- [ ] C-009: Coverage >= 95%

- HU: HU-004

- RF: RF-006---- [ ] C-010: 0 errores TypeScript

- Descripción: Método que valida y agregaErrores

- Entrada: SolicitudRecuperacion

- Salida: SolicitudRecuperacion con errores si aplica

- Criterios: Establece tocado=true## T002: Crear Types TypeScript Compartidos**Tests Esperados** (~8 tests):

- Archivo: `src/application/services/ServicioFormularioRecuperacion.ts`

```

**T018** [P] - Implementar manejarCambioCorreo en ServicioFormularioRecuperacion

- HU: HU-004**Fase**: 1 — Setup  ✓ debe crear estado idle

- RF: RF-006

- Descripción: Responde a onChange en input**Prioridad**: P1  ✓ debe crear estado loading

- Entrada: SolicitudRecuperacion, correo: string

- Salida: SolicitudRecuperacion actualizada**Paralelizable**: [P] No (dependencia temprana)  ✓ debe crear estado success

- Criterios: Limpia errores si ya estaba tocado

- Archivo: `src/application/services/ServicioFormularioRecuperacion.ts`**Estimación**: 1 hora  ✓ debe crear estado error con mensaje



**T019** [P] - Implementar manejarBlurCorreo en ServicioFormularioRecuperacion✓ predicado isIdle() funciona

- HU: HU-004

- RF: RF-006**Descripción**:✓ predicado isLoading() funciona

- Descripción: Responde a onBlur en input

- Entrada: SolicitudRecuperacionDefinir los tipos TypeScript que serán compartidos entre capas (Domain, Application, Presentation).✓ predicado isSuccess() funciona

- Salida: SolicitudRecuperacion validada

- Criterios: Llama a validarCorreo✓ predicado isError() funciona

- Archivo: `src/application/services/ServicioFormularioRecuperacion.ts`

**Archivos Afectados**:```

**T020** [P] - Implementar prepararParaEnvio en ServicioFormularioRecuperacion

- HU: HU-005- Crear: `src/types/recuperacion.ts`

- RF: RF-007

- Descripción: Valida antes de enviar, retorna {esValido, solicitud}---

- Entrada: SolicitudRecuperacion

- Salida: {esValido: boolean, solicitud: SolicitudRecuperacion}**Criterios de Aceptación**:

- Criterios: Valida email completamente

- Archivo: `src/application/services/ServicioFormularioRecuperacion.ts`- [ ] Type `EstadoFormularioRecuperacionUI` definido### ✅ T003: Crear Entity `RecoveryForm`



---- [ ] Type `EstadoProceso` definido ('reposo' | 'cargando' | 'exito' | 'error')



### 2.2 Factories- [ ] Type `PropsFormularioRecuperacion` definido**Categoría**: Domain Layer - Entities  



**T021** [P] - Crear FabricaSolicitudRecuperacion- [ ] Type `PropsConfirmacionRecuperacion` definido**Prioridad**: P1 - CRÍTICA  

- HU: HU-005

- RF: RF-007- [ ] Type `ResultadoValidacion` definido**Estimación**: 3 horas  

- Descripción: Factory para crear solicitudes

- Entrada: void o correo o correo+error- [ ] Todos exportables desde `index.ts`**Dependencias**: T001, T002  

- Salida: SolicitudRecuperacion

- Criterios: 4 factory methods- [ ] 0 errores TypeScript

- Archivo: `src/application/factories/FabricaSolicitudRecuperacion.ts`

**Descripción**:

**T022** [P] - Implementar método desdeCorreo en FabricaSolicitudRecuperacion

- HU: HU-005**Tests Esperados**:Implementar la entidad `RecoveryForm` que representa el estado del formulario de manera inmutable.

- RF: RF-007

- Descripción: Factory que crea solicitud con correo inicial- N/A (tipos)

- Entrada: correo: string

- Salida: SolicitudRecuperacion**Archivos a crear**:

- Criterios: tocado = false

- Archivo: `src/application/factories/FabricaSolicitudRecuperacion.ts`**Ref Spec**: data-model.md § 4.1 Types1. `src/domain/entities/RecoveryForm.ts`



**T023** [P] - Implementar método conError en FabricaSolicitudRecuperacion2. `tests/domain/entities/RecoveryForm.test.ts`

- HU: HU-005

- RF: RF-007---

- Descripción: Factory que crea solicitud con error preexistente

- Entrada: correo: string, error: string**Criterios de Aceptación**:

- Salida: SolicitudRecuperacion

- Criterios: tocado = true, error agregado## T003: Actualizar Rutas React Router para Módulo 008

- Archivo: `src/application/factories/FabricaSolicitudRecuperacion.ts`

- [ ] C-001: Clase RecoveryForm con propiedades privadas: email, touched, errors

---

**Fase**: 1 — Setup  - [ ] C-002: Constructor puede recibir email y touched opcionales

### 2.3 DTOs y Mappers

**Prioridad**: P1  - [ ] C-003: Método `setEmail(email: string)` retorna nueva instancia

**T024** [P] - Crear DTOFormularioRecuperacion

- HU: HU-006**Paralelizable**: [P] No (base crítica)  - [ ] C-004: Método `getEmail()` retorna email

- RF: RF-008

- Descripción: Implementar type con {correo, tocado, errores}**Estimación**: 1 hora  - [ ] C-005: Método `getTrimmedEmail()` retorna email trimado

- Entrada: void

- Salida: type DTOFormularioRecuperacion- [ ] C-006: Método `setTouched(boolean)` retorna nueva instancia

- Criterios: errores es Record<string, string>

- Archivo: `src/application/dtos/DTOFormularioRecuperacion.ts`**Descripción**:- [ ] C-007: Método `isTouched()` retorna booleano



**T025** [P] - Crear MapeadorFormularioRecuperacion.aDominioIntegrar la nueva ruta `/recuperar-contrasena` al sistema de rutas existente.- [ ] C-008: Método `addError(field, message)` retorna nueva instancia

- HU: HU-006

- RF: RF-008- [ ] C-009: Método `getError(field)` retorna error o undefined

- Descripción: Mapea DTO → SolicitudRecuperacion

- Entrada: DTOFormularioRecuperacion**Archivos Afectados**:- [ ] C-010: Método `hasErrors()` retorna booleano

- Salida: SolicitudRecuperacion

- Criterios: Preserva todos los valores- Modificar: `src/routes/AppRoutes.tsx`- [ ] C-011: Método `clearErrors()` retorna nueva instancia sin errores

- Archivo: `src/application/dtos/DTOFormularioRecuperacion.ts`

- Crear: `src/routes/index.ts` (si necesita actualización)- [ ] C-012: Método `reset()` retorna formulario vacío

**T026** [P] - Crear MapeadorFormularioRecuperacion.aDTO

- HU: HU-006- [ ] C-013: Factory method `RecoveryForm.create()`

- RF: RF-008

- Descripción: Mapea SolicitudRecuperacion → DTO**Criterios de Aceptación**:- [ ] C-014: Todos los métodos retornan nuevas instancias (immutabilidad)

- Entrada: SolicitudRecuperacion

- Salida: DTOFormularioRecuperacion- [ ] Ruta `/recuperar-contrasena` agregada- [ ] C-015: Tests cubren todos los métodos y casos

- Criterios: Extrae errores del Map

- Archivo: `src/application/dtos/DTOFormularioRecuperacion.ts`- [ ] Apunta a componente `PaginaRecuperacion` (a crear en T010)- [ ] C-016: Coverage >= 90%



---- [ ] Ruta accesible desde `/login`- [ ] C-017: 0 errores TypeScript



## Fase 3: Capa de Presentación (3-4 días)- [ ] No modifica otras rutas existentes



### 3.1 Types- [ ] Tests de navegación pasan (si existen)**Tests Esperados** (~20 tests):



**T027** [P] - Definir EstadoFormularioRecuperacionUI- [ ] 0 errores TypeScript```

- HU: HU-006

- RF: RF-009✓ debe crear RecoveryForm vacío

- Descripción: Type para UI: {correo, errorCorreo?, tocado}

- Entrada: void**Tests Esperados**:✓ debe setear email

- Salida: type EstadoFormularioRecuperacionUI

- Criterios: Refleja state del formulario- Route /recuperar-contrasena existe✓ debe retornar nueva instancia al setear email

- Archivo: `src/types/recuperacion.ts`

- Route renderiza componente correcto (test esperará)✓ debe trimear email

**T028** [P] - Definir EstadoProceso

- HU: HU-006✓ debe setear touched

- RF: RF-009

- Descripción: Literal type: 'reposo' | 'cargando' | 'exito' | 'error'**Ref Spec**: clarifications.md A-003, quickstart.md § 🔗 Integración con Rutas✓ debe agregar error a campo

- Entrada: void

- Salida: type EstadoProceso✓ debe obtener error del campo

- Criterios: Estados del flujo completo

- Archivo: `src/types/recuperacion.ts`---✓ debe detectar si hay errores



**T029** [P] - Definir PropsFormularioRecuperacion✓ debe limpiar errores

- HU: HU-006

- RF: RF-009## T004: Agregar Enlace "¿Olvidaste tu contraseña?" en LoginPage✓ debe resetear formulario

- Descripción: Props del componente con 7 campos

- Entrada: void✓ debe verificar immutabilidad

- Salida: type PropsFormularioRecuperacion

- Criterios: Incluye correo, errorCorreo, tocado, estaCargando, 4 handlers**Fase**: 1 — Setup  ✓ debería poder tener múltiples errores (si aplica)

- Archivo: `src/types/recuperacion.ts`

**Prioridad**: P1  ... más tests

---

**Paralelizable**: [P] Sí (después de T003)  ```

### 3.2 Hooks

**Estimación**: 0.5 horas  

**T030** [P] - Crear hook useFormularioRecuperacion

- HU: HU-006, HU-007---

- RF: RF-009, RF-010

- Descripción: Hook que gestiona estado del formulario**Descripción**:

- Entrada: void

- Salida: {correo, errorCorreo, tocado, estaCargando, esExito, 4 handlers}Modificar LoginPage para agregar un enlace/botón que navegue a `/recuperar-contrasena`.### ✅ T004: Crear Domain Service `EmailValidator`

- Criterios: Usa useState, useCallback

- Archivo: `src/presentation/hooks/useFormularioRecuperacion.ts`



**T031** [P] - Implementar manejarCambioCorreo en hook**Archivos Afectados**:**Categoría**: Domain Layer - Services  

- HU: HU-006

- RF: RF-009- Modificar: `src/presentation/pages/login/LoginPage.tsx` (o archivo existente de login)**Prioridad**: P1 - CRÍTICA  

- Descripción: Callback que responde a onChange

- Entrada: correo: string**Estimación**: 2.5 horas  

- Salida: void (actualiza estado)

- Criterios: Usa ServicioFormularioRecuperacion.manejarCambioCorreo**Criterios de Aceptación**:**Dependencias**: T001, T002, T003  

- Archivo: `src/presentation/hooks/useFormularioRecuperacion.ts`

- [ ] Link o button con texto "¿Olvidaste tu contraseña?" agregado

---

- [ ] Navega a `/recuperar-contrasena` al hacer clic**Descripción**:

### 3.3 Components

- [ ] Posicionado lógicamente en formulario (debajo del login)Implementar el servicio de dominio `EmailValidator` que proporciona validación de emails con mensajes específicos.

**T032** [P] - Crear componente FormularioRecuperacion

- HU: HU-007- [ ] Estilo coherente con aplicación

- RF: RF-010

- Descripción: Componente functional con input email y 2 botones- [ ] Accesible (aria-label si es botón, href correcto si es link)**Archivos a crear**:

- Entrada: PropsFormularioRecuperacion

- Salida: JSX.Element- [ ] 0 errores TypeScript1. `src/domain/services/EmailValidator.ts`

- Criterios: Input email, botón Continuar, botón Regresar

- Archivo: `src/presentation/components/FormularioRecuperacion.tsx`2. `tests/domain/services/EmailValidator.test.ts`



**T033** [P] - Implementar validación visual en FormularioRecuperacion**Tests Esperados**:

- HU: HU-007

- RF: RF-010- Link/button existe en LoginPage**Criterios de Aceptación**:

- Descripción: Mostrar clase 'input--error' y mensaje si hay error

- Entrada: errorCorreo, tocado- Link/button navega a /recuperar-contrasena

- Salida: JSX con clases CSS

- Criterios: Muestra solo si tocado && errorCorreo- [ ] C-001: Clase EmailValidator con regex privada: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

- Archivo: `src/presentation/components/FormularioRecuperacion.tsx`

**Ref Spec**: clarifications.md A-008, quickstart.md § 🔗 Integración con Rutas- [ ] C-002: Método `validate(email)` retorna `{ isValid: boolean, error?: string }`

**T034** [P] - Implementar estado de carga en FormularioRecuperacion

- HU: HU-007- [ ] C-003: Email vacío retorna `{ isValid: false, error: "El correo electrónico es requerido" }`

- RF: RF-010

- Descripción: Deshabilitar inputs/botones durante carga---- [ ] C-004: Email inválido retorna `{ isValid: false, error: "Ingresa un correo electrónico válido" }`

- Entrada: estaCargando: boolean

- Salida: JSX deshabilitado- [ ] C-005: Email válido retorna `{ isValid: true }`

- Criterios: disabled={estaCargando}

- Archivo: `src/presentation/components/FormularioRecuperacion.tsx`# FASE 2: Modelo de Datos y Validaciones- [ ] C-006: Método `isValidFormat(email)` retorna booleano (sin mensajes)



**T035** [P] - Crear componente ConfirmacionRecuperacion- [ ] C-007: Método `isValid(email)` retorna booleano (simplificado)

- HU: HU-007, HU-008

- RF: RF-011Objetivo: Crear domain layer con validadores y value objects.- [ ] C-008: Factory method `EmailValidator.create()`

- Descripción: Componente que muestra "Solicitud Procesada"

- Entrada: alRegresar: () => void- [ ] C-009: Trimea automáticamente en validación

- Salida: JSX.Element

- Criterios: Icono ✓, mensaje, botón Regresar---- [ ] C-010: Casos cubiertos: vacío, inválido, válido, con espacios, sin @, sin punto, múltiples @

- Archivo: `src/presentation/components/ConfirmacionRecuperacion.tsx`

- [ ] C-011: Coverage >= 95%

**T036** [P] - Implementar icono de éxito en ConfirmacionRecuperacion

- HU: HU-008## T005: Crear Value Object `CorreoElectronico`- [ ] C-012: 0 errores TypeScript

- RF: RF-011

- Descripción: Mostrar ✓ en div con clase 'icono-exito'

- Entrada: void

- Salida: JSX**Fase**: 2 — Modelo de Datos  **Tests Esperados** (~25 tests):

- Criterios: Visual clara de éxito

- Archivo: `src/presentation/components/ConfirmacionRecuperacion.tsx`**Prioridad**: P1  ```



---**Paralelizable**: [P] No (base crítica)  ✓ debe rechazar email vacío con mensaje específico



### 3.4 Pages**Estimación**: 1.5 horas  ✓ debe rechazar email sin @



**T037** [P] - Crear página PaginaRecuperacion✓ debe rechazar email sin punto en dominio

- HU: HU-008

- RF: RF-012**Descripción**:✓ debe rechazar email con espacios en medio

- Descripción: Página que integra formulario + confirmación + navegación

- Entrada: voidImplementar el Value Object que valida y encapsula un correo electrónico.✓ debe rechazar email con múltiples @

- Salida: JSX.Element

- Criterios: Renderiza FormularioRecuperacion o ConfirmacionRecuperacion según estado✓ debe aceptar email válido simple

- Archivo: `src/presentation/pages/recuperar-contrasena/PaginaRecuperacion.tsx`

**Archivos Afectados**:✓ debe aceptar email con punto en usuario

**T038** - Integrar hook useNavigate en PaginaRecuperacion

- HU: HU-008- Crear: `src/domain/valueObjects/CorreoElectronico.ts`✓ debe aceptar email con subdominio

- RF: RF-012

- Descripción: Implementar manejo de navegación hacia `/login`- Crear: `tests/domain/valueObjects/CorreoElectronico.test.ts`✓ debe aceptar email con plus addressing

- Entrada: void

- Salida: navigate('/login')✓ debe trimear espacios antes de validar

- Criterios: Usa useNavigate de React Router

- Archivo: `src/presentation/pages/recuperar-contrasena/PaginaRecuperacion.tsx`**Criterios de Aceptación**:✓ isValidFormat() debe funcionar



---- [ ] Clase `CorreoElectronico` con constructor privado✓ isValid() debe funcionar



## Fase 4: Integración (1-2 días)- [ ] Validación regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`✓ EmailValidator.create() factory funciona



**T039** - Registrar ruta `/recuperar-contrasena` en AppRoutes- [ ] Trimea espacios automáticamente... más tests de casos borde

- HU: HU-001

- RF: RF-013- [ ] Normaliza a minúsculas```

- Descripción: Agregar ruta pública hacia PaginaRecuperacion

- Entrada: void- [ ] Lanza `ErrorCorreoInvalido` si es inválido

- Salida: Ruta disponible en routing

- Criterios: Ruta sin protección de autenticación- [ ] Método `obtenerValor()` retorna email validado---

- Archivo: `src/routes/AppRoutes.tsx`

- [ ] Método `esIgual(otro)` compara correos

---

- [ ] Factory method `crear(email)`### ✅ T005: Crear Barrel Exports para Domain Layer

## Fase 5: Testing (2-3 días)

- [ ] Immutable (sin setters)

### 5.1 Unit Tests - Dominio (70 tests)

- [ ] Cobertura >= 95%**Categoría**: Domain Layer - Organización  

**T040** - Crear suite de tests para CorreoElectronico (15 tests)

- HU: HU-001, HU-003, HU-004**Prioridad**: P2 - MEDIA  

- RF: RF-001, RF-003, RF-004, RF-005

- Pruebas: Validación regex, normalización, igualdad, error handling, casos límite**Tests Esperados** (8-10 tests):**Estimación**: 1 hora  

- Archivo: `tests/domain/CorreoElectronico.test.ts`

- Criterios: >= 90% coverage- Crear correo válido**Dependencias**: T001-T004  



**T041** - Crear suite de tests para EstadoFormularioRecuperacion (12 tests)- Rechazar correo sin punto en dominio

- HU: HU-002, HU-006

- RF: RF-002, RF-009- Rechazar correo sin @**Descripción**:

- Pruebas: Factory methods, predicados, mensajes, transiciones de estado

- Archivo: `tests/domain/EstadoFormularioRecuperacion.test.ts`- Trimear espaciosCrear archivos de índice (barrel exports) para simplificar imports del domain layer.

- Criterios: >= 90% coverage

- Normalizar mayúsculas

**T042** - Crear suite de tests para SolicitudRecuperacion (18 tests)

- HU: HU-003, HU-005- Método esIgual() funciona**Archivos a crear**:

- RF: RF-003, RF-007

- Pruebas: Inmutabilidad, getters/setters, errores, reinicio, encadenamiento- Factory method funciona1. `src/domain/valueObjects/index.ts`

- Archivo: `tests/domain/SolicitudRecuperacion.test.ts`

- Criterios: >= 95% coverage- Lanza error con mensaje descriptivo2. `src/domain/entities/index.ts`



**T043** - Crear suite de tests para ValidadorCorreoElectronico (15 tests)3. `src/domain/services/index.ts`

- HU: HU-004

- RF: RF-005, RF-006**Ref Spec**: spec.md RF-005, CB-004, CB-005; clarifications.md A-001, A-0094. `src/domain/errors/index.ts`

- Pruebas: Validaciones (vacío, formato inválido, válido), mensajes específicos

- Archivo: `tests/domain/ValidadorCorreoElectronico.test.ts`5. `src/domain/index.ts` (principal)

- Criterios: >= 90% coverage

---

**T044** - Crear suite de tests para ErrorCorreoInvalido (10 tests)

- HU: HU-004**Criterios de Aceptación**:

- RF: RF-005

- Pruebas: Instanciación, propiedades, herencia, logging## T006: Crear Value Object `EstadoFormularioRecuperacion`

- Archivo: `tests/domain/ErrorCorreoInvalido.test.ts`

- Criterios: >= 100% coverage- [ ] C-001: `domain/valueObjects/index.ts` exporta Email y RecoveryState



### 5.2 Unit Tests - Aplicación (35 tests)**Fase**: 2 — Modelo de Datos  - [ ] C-002: `domain/entities/index.ts` exporta RecoveryForm



**T045** - Crear suite de tests para ServicioFormularioRecuperacion (20 tests)**Prioridad**: P1  - [ ] C-003: `domain/services/index.ts` exporta EmailValidator

- HU: HU-003, HU-004, HU-005

- RF: RF-006, RF-007**Paralelizable**: [P] Sí (después de T005)  - [ ] C-004: `domain/errors/index.ts` exporta EmailInvalidError

- Pruebas: validarCorreo, manejarCambioCorreo, manejarBlurCorreo, prepararParaEnvio, inyección de dependencias

- Archivo: `tests/application/ServicioFormularioRecuperacion.test.ts`**Estimación**: 1 hora  - [ ] C-005: `domain/index.ts` exporta todo

- Criterios: >= 90% coverage

- [ ] C-006: Se puede importar: `import { Email, RecoveryForm } from '@/domain'`

**T046** - Crear suite de tests para FabricaSolicitudRecuperacion (8 tests)

- HU: HU-005**Descripción**:- [ ] C-007: 0 errores TypeScript

- RF: RF-007

- Pruebas: Factory methods (crear, desdeCorreo, conError, reiniciar), creación correctaImplementar Value Object que encapsula los estados del formulario (reposo, cargando, exito, error).

- Archivo: `tests/application/FabricaSolicitudRecuperacion.test.ts`

- Criterios: >= 90% coverage---



**T047** - Crear suite de tests para MapeadorFormularioRecuperacion (7 tests)**Archivos Afectados**:

- HU: HU-006

- RF: RF-008- Crear: `src/domain/valueObjects/EstadoFormularioRecuperacion.ts`### ✅ T006: Tests de Domain Layer - Cobertura >= 90%

- Pruebas: Mapeo bidireccional DTO ↔ Dominio, preservación de datos

- Archivo: `tests/application/MapeadorFormularioRecuperacion.test.ts`- Crear: `tests/domain/valueObjects/EstadoFormularioRecuperacion.test.ts`

- Criterios: >= 100% coverage

**Categoría**: Domain Layer - Testing  

### 5.3 Unit Tests - Presentación (130 tests)

**Criterios de Aceptación**:**Prioridad**: P1 - CRÍTICA  

**T048** - Crear suite de tests para FormularioRecuperacion (45 tests)

- HU: HU-007- [ ] Enum `EstadoEnum` con 4 valores: REPOSO, CARGANDO, EXITO, ERROR**Estimación**: 2 horas  

- RF: RF-010

- Pruebas: Renderizado, onChange, onBlur, validación visual, estados de carga, accesibilidad (a11y), prop spreading- [ ] Clase `EstadoFormularioRecuperacion` con campos privados**Dependencias**: T001-T005  

- Archivo: `tests/presentation/components/FormularioRecuperacion.test.tsx`

- Criterios: >= 85% coverage- [ ] Constructor privado



**T049** - Crear suite de tests para ConfirmacionRecuperacion (15 tests)- [ ] Factory methods: `reposo()`, `cargando()`, `exito()`, `error(mensaje)`**Descripción**:

- HU: HU-007, HU-008

- RF: RF-011- [ ] Getters: `obtenerEstado()`, `obtenerMensaje()`Revisión exhaustiva y adición de tests faltantes para alcanzar >= 90% coverage en domain layer.

- Pruebas: Renderizado, icono, mensajes neutrales, botón Regresar, accesibilidad

- Archivo: `tests/presentation/components/ConfirmacionRecuperacion.test.tsx`- [ ] Predicados: `esReposo()`, `esCargando()`, `esExito()`, `esError()`

- Criterios: >= 85% coverage

- [ ] Immutable**Criterios de Aceptación**:

**T050** - Crear suite de tests para useFormularioRecuperacion hook (40 tests)

- HU: HU-006, HU-007- [ ] Cobertura >= 95%

- RF: RF-009, RF-010

- Pruebas: Estado inicial, handlers, cambios de estado, ciclo de vida, delays, cleanup- [ ] C-001: `npm run test -- tests/domain/` muestra >= 90% coverage

- Archivo: `tests/presentation/hooks/useFormularioRecuperacion.test.ts`

- Criterios: >= 90% coverage**Tests Esperados** (8 tests):- [ ] C-002: Todos los tests pasan (100%)



**T051** - Crear suite de tests para PaginaRecuperacion (30 tests)- Factory methods crean estado correcto- [ ] C-003: No hay `.skip()` ni `.only()` en tests

- HU: HU-008

- RF: RF-012- Predicados funcionan para cada estado- [ ] C-004: Casos borde de `CB-001` a `CB-007` están testeados

- Pruebas: Renderizado según estado, navegación, integración con hook, transiciones visuales

- Archivo: `tests/presentation/pages/PaginaRecuperacion.test.tsx`- Mensaje guardado en estado error- [ ] C-005: Se agregaron ~63 tests en total en T001-T004

- Criterios: >= 80% coverage

- Immutability verificada- [ ] C-006: Documentación de tests clara

### 5.4 Integration Tests (7 tests)

- [ ] C-007: 0 errores de linter

**T052** - Test: Flujo completo de entrada de email válido

- HU: HU-001 a HU-008**Ref Spec**: spec.md HU-006, HU-007; data-model.md § 2.1 EstadoFormularioRecuperacion

- RF: RF-001 a RF-012

- Entrada: Usuario ingresa "usuario@ejemplo.com" y hace clic en Continuar**Comando de Verificación**:

- Salida: Confirmación mostrada después de 750ms

- Criterios: Sin errores, estado final = exito, navegación disponible---```bash

- Archivo: `tests/integration/FlujoBuntoValido.test.tsx`

npm run test -- tests/domain/ --coverage

**T053** - Test: Flujo de email vacío y luego válido

- HU: HU-003, HU-004, HU-006, HU-007## T007: Crear Entity `SolicitudRecuperacion````

- RF: RF-003, RF-005, RF-009

- Entrada: Usuario deja vacío, onBlur, luego ingresa email válido, onChange

- Salida: Error inicial "El correo electrónico es requerido", luego error desaparece

- Criterios: Validación en tiempo real, errores contextuales**Fase**: 2 — Modelo de Datos  **Resultado Esperado**:

- Archivo: `tests/integration/FlujoCorreoVacioValido.test.tsx`

**Prioridad**: P1  ```

**T054** - Test: Flujo de email con formato inválido

- HU: HU-004, HU-005, HU-007**Paralelizable**: [P] Sí (después de T005)  tests/domain/valueObjects/Email.test.ts        10 tests ✓

- RF: RF-005, RF-007, RF-010

- Entrada: Usuario ingresa "correo-invalido" y onBlur**Estimación**: 1.5 horas  tests/domain/valueObjects/RecoveryState.test.ts 8 tests ✓

- Salida: Mensaje "Ingresa un correo electrónico válido"

- Criterios: Mensaje específico correcto, botón Continuar deshabilitadotests/domain/entities/RecoveryForm.test.ts      20 tests ✓

- Archivo: `tests/integration/FlujoCorreoInvalido.test.tsx`

**Descripción**:tests/domain/services/EmailValidator.test.ts   25 tests ✓

**T055** - Test: Recuperación de error a éxito

- HU: HU-005, HU-006, HU-007Implementar Entity que mantiene el estado del formulario (email, tocado, errores).────────────────────────────────────────────────────────

- RF: RF-007, RF-009, RF-010

- Entrada: Usuario ingresa formato inválido → corrige con válido → ContinuarTotal Domain Layer:                             63 tests ✓

- Salida: Error desaparece, confirmación aparece

- Criterios: Limpieza de errores exitosa, flujo sin saltos**Archivos Afectados**:Coverage:                                       >= 90% ✓

- Archivo: `tests/integration/FlujoRecuperacionError.test.tsx`

- Crear: `src/domain/entities/SolicitudRecuperacion.ts````

**T056** - Test: Navegación hacia Login desde confirmación

- HU: HU-008- Crear: `tests/domain/entities/SolicitudRecuperacion.test.ts`

- RF: RF-012

- Entrada: Usuario en confirmación, hace clic en "Regresar al Login"---

- Salida: Navegación a `/login`, formulario reiniciado en caso de volver

- Criterios: useNavigate llamado con '/login', estado limpio**Criterios de Aceptación**:

- Archivo: `tests/integration/FlujoNavegacion.test.tsx`

- [ ] Clase `SolicitudRecuperacion` con propiedades: correo, tocado, errores### ✅ T007: Verificación de Fase 1 - Definition of Done

**T057** - Test: Reinicio de formulario por navegación

- HU: HU-001, HU-008- [ ] Constructor: `constructor(correo?, tocado?)`

- RF: RF-001, RF-012

- Entrada: Usuario completa flujo → regresa a página → accede de nuevo- [ ] Métodos: `establecerCorreo()`, `obtenerCorreo()`, `obtenerCorreoTrimado()`**Categoría**: Quality Assurance  

- Salida: Formulario en estado inicial limpio

- Criterios: Reinicio automático, no hay datos residuales- [ ] Métodos: `establecerTocado()`, `estaTocado()`**Prioridad**: P1 - CRÍTICA  

- Archivo: `tests/integration/FlujoReinicio.test.tsx`

- [ ] Métodos: `agregarError()`, `obtenerError()`, `tieneErrores()`, `limpiarErrores()`**Estimación**: 1 hora  

---

- [ ] Método: `reiniciar()`**Dependencias**: T001-T006  

## Fase 6: Refinamiento (1-2 días)

- [ ] Factory method: `crear()`

**T058** - Revisar y optimizar puntuación de cobertura

- Criterios: >= 95% dominio, >= 90% aplicación, >= 85% presentación, total >= 242 tests- [ ] Immutability: cada método retorna nueva instancia**Descripción**:

- Archivo: Reporte de coverage

- Validación: npm run coverage- [ ] Mapa de errores Map<string, string>Verificación exhaustiva de que Fase 1 está completa y lista para Fase 2.



**T059** - Validar accesibilidad (a11y) en componentes- [ ] Cobertura >= 95%

- Criterios: aria-label, aria-invalid, aria-describedby, roles ARIA correctos

- Validación: WCAG 2.1 AA compliance**Criterios de Aceptación**:

- Archivo: Componentes actualizados con a11y

**Tests Esperados** (10 tests):

**T060** - Implementar estilos finales de UI

- Criterios: Clases CSS completas, responsive, dark mode compatible- Crear solicitud vacía- [ ] C-001: Todos los tests de T001-T006 pasan: 63 tests ✓

- Archivo: `src/styles/recuperacion.css`

- Validación: npm run build sin warnings- Establecer correo- [ ] C-002: Coverage domain layer >= 90%



---- Marcar tocado- [ ] C-003: `npm run build` exitoso



## Consolidación de Tareas- Agregar/limpiar errores- [ ] C-004: 0 errores TypeScript: `npx tsc --noEmit`



**Total de Tareas**: 60 tareas mapeadas- Reiniciar solicitud- [ ] C-005: ESLint sin errores: `npm run lint`



**Por Fase**:- Immutability verificada- [ ] C-006: Ningún código depende de React

- Fase 1 (Dominio): 15 tareas (T001-T015)

- Fase 2 (Aplicación): 10 tareas (T016-T026)- Métodos getter funcionan- [ ] C-007: Ningún console.log/error

- Fase 3 (Presentación): 12 tareas (T027-T038)

- Fase 4 (Integración): 1 tarea (T039)- [ ] C-008: Documentación de Fase 1 actualizada

- Fase 5 (Testing): 18 tareas (T040-T057)

- Fase 6 (Refinamiento): 3 tareas (T058-T060)**Ref Spec**: spec.md HU-005; data-model.md § 2.2 SolicitudRecuperacion- [ ] C-009: README.md del módulo existe con descripción



**Tareas Paralelizables** [P]: 37 tareas

- Todas las de Dominio (T001-T015): 15

- Todas las de Aplicación (T016-T026): 10---**Checklist**:

- Primeras de Presentación (T027-T036): 10

- Plus Types/Hooks iniciales (T027-T031): 5```bash



**Estimación**: Paralelización puede reducir 35-40% del tiempo total## T008: Crear Domain Service `ValidadorCorreoElectronico`# Correr todos



**Distribution de Testing**:npm run test -- tests/domain/ --coverage

- Dominio: 70 tests (T040-T044)

- Aplicación: 35 tests (T045-T047)**Fase**: 2 — Modelo de Datos  npm run build

- Presentación: 130 tests (T048-T051)

- Integración: 7 tests (T052-T057)**Prioridad**: P1  npx tsc --noEmit

- **Total**: 242 tests (cumple meta de 230+)

**Paralelizable**: [P] Sí (después de T005)  npm run lint -- src/domain/ tests/domain/

**Cobertura Esperada**:

- Dominio: 95%**Estimación**: 1 hora  grep -r "console\." src/domain/ && echo "FAIL" || echo "OK"

- Aplicación: 90%

- Presentación: 85%grep -r "React" src/domain/ && echo "FAIL" || echo "OK"

- **Total combinado**: >= 88%

**Descripción**:```

---

Implementar servicio de dominio que valida correos con mensajes específicos por error.

**Estado**: 60 tareas completamente definidas y mapeadas  

**Versión**: 1.0  **Resultado Esperado**:

**Fecha**: 2026-10-20  

**Módulo**: 008  **Archivos Afectados**:```

**Trazabilidad**: RF ↔ Tareas ✅ Completa  

**Naming**: Español ✅ Consistente  - Crear: `src/domain/services/ValidadorCorreoElectronico.ts`✓ 63 tests pasando

**Duplication**: Eliminada ✅ Sin duplicados  

**Cobertura Testing**: 242 tests ✅ Supera meta- Crear: `tests/domain/services/ValidadorCorreoElectronico.test.ts`✓ Coverage >= 90%


✓ Build exitoso

**Criterios de Aceptación**:✓ 0 errores TypeScript

- [ ] Clase `ValidadorCorreoElectronico` con regex interno: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`✓ 0 errores linter

- [ ] Método `validar(correo)`: retorna `{esValido, error?}`✓ 0 referencias a React

- [ ] Mensaje si vacío: "El correo electrónico es requerido"✓ 0 console statements

- [ ] Mensaje si formato inválido: "Ingresa un correo electrónico válido"✓ Fase 1 READY para Fase 2

- [ ] Método `esFormatoValido(correo)`: boolean simple```

- [ ] Método `esValido(correo)`: boolean simple

- [ ] Factory method: `crear()`---

- [ ] Cobertura >= 95%

## FASE 2: Application Layer (Tareas T008-T018)

**Tests Esperados** (8 tests):

- Validar correo vacío### ✅ T008: Crear Application Service `RecoveryFormService`

- Validar correo inválido (sin @, sin punto)

- Validar correo válido**Categoría**: Application Layer - Services  

- Mensajes de error específicos**Prioridad**: P1 - CRÍTICA  

- Métodos esValido() y esFormatoValido()**Estimación**: 3 horas  

**Dependencias**: T001-T007  

**Ref Spec**: spec.md RF-005, RF-006; clarifications.md A-004, A-005, A-009

**Descripción**:

---Implementar el servicio de aplicación `RecoveryFormService` que coordina entre domain y presentation.



## T009: Crear Custom Error `ErrorCorreoInvalido`**Archivos a crear**:

1. `src/application/services/RecoveryFormService.ts`

**Fase**: 2 — Modelo de Datos  2. `tests/application/services/RecoveryFormService.test.ts`

**Prioridad**: P2  

**Paralelizable**: [P] Sí  **Criterios de Aceptación**:

**Estimación**: 0.5 horas  

- [ ] C-001: Clase RecoveryFormService con inyección de EmailValidator

**Descripción**:- [ ] C-002: Método `validateEmail(form)` retorna form validado

Crear excepción personalizada para errores de validación de correo.- [ ] C-003: Método `handleEmailChange(form, email)` limpia errores si toca el campo

- [ ] C-004: Método `handleEmailBlur(form)` valida email

**Archivos Afectados**:- [ ] C-005: Método `prepareForSubmit(form)` retorna `{ isValid, form }`

- Crear: `src/domain/errors/ErrorCorreoInvalido.ts`- [ ] C-006: Método `createSubmitDTO(form)` retorna RecoverySubmitDTO

- Crear: `tests/domain/errors/ErrorCorreoInvalido.test.ts`- [ ] C-007: Factory method `RecoveryFormService.create()`

- [ ] C-008: Todos los métodos retornan nuevas instancias (coordinan immutabilidad)

**Criterios de Aceptación**:- [ ] C-009: Tests cubren todos los métodos y flujos

- [ ] Clase `ErrorCorreoInvalido` extiende `Error`- [ ] C-010: Coverage >= 90%

- [ ] Constructor acepta mensaje- [ ] C-011: 0 errores TypeScript

- [ ] Nombre de error: "ErrorCorreoInvalido"

- [ ] Mensaje descriptivo**Tests Esperados** (~25 tests):

- [ ] Cobertura 100%```

✓ validateEmail() con email válido

**Tests Esperados** (2-3 tests):✓ validateEmail() con email inválido

- Crear y lanzar error✓ validateEmail() con campo vacío

- Mensaje correcto✓ handleEmailChange() limpia error si hay contenido

- Stack trace completo✓ handleEmailChange() mantiene error si campo vacío

✓ handleEmailBlur() valida

**Ref Spec**: data-model.md § 2.1 CorreoElectronico✓ prepareForSubmit() retorna isValid true/false

✓ prepareForSubmit() retorna form actualizado

---✓ createSubmitDTO() crea DTO correcto

✓ RecoveryFormService.create() factory

# FASE 3: Componentes y Navegación Base... más tests

```

Objetivo: Crear contenedores de página base sin lógica aún.

---

---

### ✅ T009: Crear DTOs y Mappers

## T010: Crear Container `PaginaRecuperacion`

**Categoría**: Application Layer - DTOs  

**Fase**: 3 — Componentes Base  **Prioridad**: P1 - CRÍTICA  

**Prioridad**: P1  **Estimación**: 2 horas  

**Paralelizable**: [P] No (depende de T003)  **Dependencias**: T008  

**Estimación**: 1 hora  

**Descripción**:

**Descripción**:Implementar los Data Transfer Objects (DTOs) necesarios para la aplicación.

Crear página contenedora principal que orquestará el flujo de recuperación.

**Archivos a crear**:

**Archivos Afectados**:1. `src/application/dtos/RecoveryFormDTO.ts`

- Crear: `src/presentation/pages/recuperar-contrasena/PaginaRecuperacion.tsx`2. `src/application/dtos/RecoverySubmitDTO.ts`

- Crear: `tests/presentation/pages/recuperar-contrasena/PaginaRecuperacion.test.ts`3. `tests/application/dtos/` (tests de DTOs)



**Criterios de Aceptación**:**Criterios de Aceptación**:

- [ ] Componente funcional React

- [ ] Enrutamiento correcto: accesible en `/recuperar-contrasena`- [ ] C-001: Tipo `RecoveryFormDTO` con propiedades: email, touched, errors

- [ ] Puede renderizar FormularioRecuperacion (a crear en T011)- [ ] C-002: Clase `RecoveryFormDTOMapper` con métodos `toDomain()` y `toDTO()`

- [ ] Puede renderizar ConfirmacionRecuperacion (a crear en T012)- [ ] C-003: Tipo `RecoverySubmitDTO` con: email, timestamp, userAgent

- [ ] useNavigate importado para navegación- [ ] C-004: Clase `RecoverySubmitDTOBuilder` con patrón fluido

- [ ] Props internas bien tipadas- [ ] C-005: DTOs son serializables (no contienen métodos complejos)

- [ ] 0 errores TypeScript- [ ] C-006: Tests de mapeo domain ↔ DTO

- [ ] Estructura preparada para hook (será agregado en T014)- [ ] C-007: Tests de builder

- [ ] C-008: Coverage >= 85%

**Tests Esperados** (3-4 tests):- [ ] C-009: 0 errores TypeScript

- Componente renderiza sin error

- Renderiza formulario inicialmente**Tests Esperados** (~8 tests):

- Puede cambiar a confirmación (estructura preparada)```

- Navegación disponible✓ RecoveryFormDTO mapea correctamente a domain

✓ RecoveryFormDTO mapea correctamente desde domain

**Ref Spec**: spec.md HU-001; data-model.md § 4.3 Componentes✓ RecoverySubmitDTOBuilder crea DTO válido

✓ RecoverySubmitDTOBuilder es fluido

---✓ DTOs son serializables (JSON.stringify)

```

## T011: Crear Componente `FormularioRecuperacion`

---

**Fase**: 3 — Componentes Base  

**Prioridad**: P1  ### ✅ T010: Crear Factories

**Paralelizable**: [P] Sí (después de T002)  

**Estimación**: 1.5 horas  **Categoría**: Application Layer - Factories  

**Prioridad**: P1 - ALTA  

**Descripción**:**Estimación**: 1.5 horas  

Crear componente presentacional de formulario sin lógica (props-driven).**Dependencias**: T003  



**Archivos Afectados**:**Descripción**:

- Crear: `src/presentation/components/recuperacion/FormularioRecuperacion.tsx`Implementar factories para crear instancias de dominio de manera consistente.

- Crear: `src/presentation/components/recuperacion/FormularioRecuperacion.module.css`

- Crear: `tests/presentation/components/recuperacion/FormularioRecuperacion.test.ts`**Archivos a crear**:

1. `src/application/factories/RecoveryFormFactory.ts`

**Criterios de Aceptación**:2. `tests/application/factories/` (tests de factories)

- [ ] Componente props-driven (sin lógica de negocio)

- [ ] Props: `{correo, errorCorreo, tocado, estaCargando, alCambiarCorreo, alBlurCorreo, alEnviar, alRegresar}`**Criterios de Aceptación**:

- [ ] Input email controlado (value + onChange)

- [ ] onBlur handler conectado- [ ] C-001: Clase `RecoveryFormFactory` con métodos estáticos

- [ ] Mostrar error si `tocado && errorCorreo`- [ ] C-002: Método `create()` retorna RecoveryForm vacío

- [ ] Error mensaje debajo del input- [ ] C-003: Método `fromEmail(email)` retorna RecoveryForm con email

- [ ] Borde rojo en input si hay error (CSS)- [ ] C-004: Método `reset()` retorna RecoveryForm vacío

- [ ] Botón "Continuar" habilitado solo si sin errores- [ ] C-005: Método `withError(email, error)` retorna con error

- [ ] Botón "Regresar" secundario- [ ] C-006: Tests cubren todos los métodos

- [ ] Spinner visible si `estaCargando`- [ ] C-007: Coverage >= 90%

- [ ] Label y accesibilidad (htmlFor, aria-*)- [ ] C-008: 0 errores TypeScript

- [ ] CSS responsive (mobile, tablet, desktop)

- [ ] 0 errores TypeScript---



**Tests Esperados** (8-10 tests):### ✅ T011: Crear Barrel Exports para Application Layer

- Renderiza input email

- Renderiza botones**Categoría**: Application Layer - Organización  

- Muestra error si hay**Prioridad**: P2 - MEDIA  

- Oculta error si no hay**Estimación**: 1 hora  

- onChange dispara handler**Dependencias**: T008-T010  

- onBlur dispara handler

- Spinner muestra si estaCargando**Descripción**:

- Accesibilidad verificadaCrear archivos de índice para application layer.



**Ref Spec**: spec.md RF-002, RF-003, RF-007; clarifications.md A-004; data-model.md § 4.3 FormularioRecuperacion**Archivos a crear**:

1. `src/application/services/index.ts`

---2. `src/application/dtos/index.ts`

3. `src/application/factories/index.ts`

## T012: Crear Componente `ConfirmacionRecuperacion`4. `src/application/index.ts` (principal)



**Fase**: 3 — Componentes Base  **Criterios de Aceptación**:

**Prioridad**: P1  

**Paralelizable**: [P] Sí (después de T002)  - [ ] C-001: Todos los servicios, DTOs y factories exportados

**Estimación**: 1 hora  - [ ] C-002: Imports simplificados: `import { RecoveryFormService } from '@/application'`

- [ ] C-003: 0 errores TypeScript

**Descripción**:

Crear componente presentacional de confirmación sin lógica.---



**Archivos Afectados**:### ✅ T012: Tests de Application Layer - Cobertura >= 90%

- Crear: `src/presentation/components/recuperacion/ConfirmacionRecuperacion.tsx`

- Crear: `src/presentation/components/recuperacion/ConfirmacionRecuperacion.module.css`**Categoría**: Application Layer - Testing  

- Crear: `tests/presentation/components/recuperacion/ConfirmacionRecuperacion.test.ts`**Prioridad**: P1 - CRÍTICA  

**Estimación**: 2 horas  

**Criterios de Aceptación**:**Dependencias**: T008-T011  

- [ ] Componente props-driven

- [ ] Props: `{alRegresar}`**Descripción**:

- [ ] Muestra mensaje neutral exacto (de clarifications.md A-005)Revisión exhaustiva y adición de tests faltantes para alcanzar >= 90% coverage.

- [ ] Ícono o indicador de éxito

- [ ] Botón "Regresar al Login"**Criterios de Aceptación**:

- [ ] No revela si correo existe (privacidad)

- [ ] CSS responsive- [ ] C-001: `npm run test -- tests/application/` muestra >= 90% coverage

- [ ] Accesibilidad verificada- [ ] C-002: Todos los tests pasan (100%)

- [ ] 0 errores TypeScript- [ ] C-003: Integración con domain layer testeada

- [ ] C-004: Se agregaron ~35 tests en total en T008-T010

**Tests Esperados** (4-5 tests):- [ ] C-005: Total tests hasta ahora: 98 (63 + 35)

- Renderiza mensaje correcto

- Botón disponible**Comando de Verificación**:

- Llama alRegresar cuando se hace clic```bash

- Mensaje es neutral (no revela nada)npm run test -- tests/domain/ tests/application/ --coverage

- Accesibilidad OK```



**Ref Spec**: spec.md RF-010, RNF-007; clarifications.md A-005; data-model.md § 4.3 ConfirmacionRecuperacion**Resultado Esperado**:

```

---Total:                                          98 tests ✓

Domain + Application Coverage:                  >= 90% ✓

## T013: Crear Barrel Exports para Presentación```



**Fase**: 3 — Componentes Base  ---

**Prioridad**: P2  

**Paralelizable**: [P] No  ### ✅ T013: Verificación de Fase 2 - Definition of Done

**Estimación**: 0.5 horas  

**Categoría**: Quality Assurance  

**Descripción**:**Prioridad**: P1 - CRÍTICA  

Crear archivos `index.ts` en carpetas de presentación para facilitar importes.**Estimación**: 1 hora  

**Dependencias**: T008-T012  

**Archivos Afectados**:

- Crear/Actualizar: `src/presentation/index.ts`**Descripción**:

- Crear/Actualizar: `src/presentation/pages/index.ts`Verificación de que Fase 2 está completa y lista para Fase 3.

- Crear/Actualizar: `src/presentation/components/recuperacion/index.ts`

- Crear/Actualizar: `src/presentation/hooks/index.ts`**Criterios de Aceptación**:



**Criterios de Aceptación**:- [ ] C-001: 98 tests pasando ✓

- [ ] Todos los componentes exportables desde `index.ts`- [ ] C-002: Coverage >= 90%

- [ ] Facilita importes limpios- [ ] C-003: Build exitoso

- [ ] 0 errores TypeScript- [ ] C-004: 0 errores TypeScript

- [ ] C-005: 0 errores ESLint

**Tests Esperados**:- [ ] C-006: Application layer integrado con domain layer

- N/A (exports)- [ ] C-007: Fase 2 READY para conectar con presentation



**Ref Spec**: plan.md § 2.3 Estructura de Carpetas---



---## FASE 3: Presentation Layer (Tareas T014-T030)



# FASE 4: Acceso a Recuperación desde Login### ✅ T014: Crear Hook `useRecoveryForm`



Objetivo: Asegurar que el acceso desde login es fluido y correctamente integrado.**Categoría**: Presentation Layer - Hooks  

**Prioridad**: P1 - CRÍTICA  

---**Estimación**: 3 horas  

**Dependencias**: T008-T013  

## T014: Validar Integración: Link Login → Recuperación

**Descripción**:

**Fase**: 4 — Acceso desde Login  Implementar el hook principal que gestiona todo el estado del formulario y proceso.

**Prioridad**: P1  

**Paralelizable**: [P] No  **Archivos a crear**:

**Estimación**: 1 hora  1. `src/presentation/hooks/useRecoveryForm.ts`

2. `tests/presentation/hooks/useRecoveryForm.test.ts`

**Descripción**:

Escribir tests e2e/integración que validen que el flujo login → recuperación funciona.**Criterios de Aceptación**:



**Archivos Afectados**:- [ ] C-001: Hook inicializa con RecoveryFormFactory

- Crear: `tests/integration/recuperacion/navegacion-login.test.ts`- [ ] C-002: Hook inicializa con RecoveryState.idle()

- [ ] C-003: Hook inyecta RecoveryFormService

**Criterios de Aceptación**:- [ ] C-004: Retorna objeto con: email, emailError, touched, isLoading, isSuccess, isError

- [ ] Test: LoginPage renderiza enlace a recuperación- [ ] C-005: Retorna handlers: handleEmailChange, handleEmailBlur, handleSubmit, handleReset

- [ ] Test: Link navegadirigea `/recuperar-contrasena`- [ ] C-006: `handleEmailChange()` actualiza email y limpia errores si es necesario

- [ ] Test: PaginaRecuperacion renderiza correctamente desde link- [ ] C-007: `handleEmailBlur()` valida email

- [ ] Test: Botón regresar en formulario regresa a `/login`- [ ] C-008: `handleSubmit()` valida, entra en estado loading, espera 750ms, vai a success

- [ ] Test: Botón regresar en confirmación regresa a `/login`- [ ] C-009: `handleReset()` limpia todo

- [ ] Tests pasan (estructura, sin lógica aún)- [ ] C-010: Simulación de carga: Promise con setTimeout (750ms)

- [ ] C-011: Tests cubren todos los handlers y flujos

**Tests Esperados** (5 tests):- [ ] C-012: Coverage >= 85%

- Link exists en LoginPage- [ ] C-013: 0 errores TypeScript

- Link navega correctamente

- Página recuperación renderiza**Tests Esperados** (~25 tests):

- Navegación regreso funciona```

- Flujo completo ida y vuelta✓ debe inicializar con estado correcto

✓ handleEmailChange() actualiza email

**Ref Spec**: clarifications.md A-003, A-006, A-008✓ handleEmailChange() limpia errores

✓ handleEmailBlur() valida

---✓ handleSubmit() con email válido entra en loading

✓ handleSubmit() con email válido llega a success (después de 750ms)

## T015: Verificar No Regresión en LoginPage✓ handleSubmit() con email inválido muestra error

✓ handleReset() limpia estado

**Fase**: 4 — Acceso desde Login  ✓ isLoading es true durante submit

**Prioridad**: P2  ✓ isSuccess es true después de completar

**Paralelizable**: [P] No  ... más tests

**Estimación**: 0.5 horas  ```



**Descripción**:---

Verificar que modificaciones a LoginPage no rompieron funcionalidad existente.

### ✅ T015: Crear Componente `RecoveryForm`

**Archivos Afectados**:

- Revisar: `src/presentation/pages/login/LoginPage.tsx`**Categoría**: Presentation Layer - Components  

- Tests existentes: `tests/presentation/pages/login/LoginPage.test.ts`**Prioridad**: P1 - CRÍTICA  

**Estimación**: 2.5 horas  

**Criterios de Aceptación**:**Dependencias**: T014  

- [ ] Login existente funciona sin cambios

- [ ] Tests de login siguen pasando**Descripción**:

- [ ] Nuevo link no interfiere con formulario loginImplementar el componente presentacional del formulario de recuperación.

- [ ] Estilos no rompidos

- [ ] 0 nuevos errores TypeScript**Archivos a crear**:

1. `src/presentation/components/RecoveryForm.tsx`

**Tests Esperados**:2. `src/presentation/components/RecoveryForm.module.css` (o estilos)

- Tests existentes pasan3. `tests/presentation/components/RecoveryForm.test.tsx`

- No hay regresión

**Criterios de Aceptación**:

**Ref Spec**: Integración mínima sin modificar login

- [ ] C-001: Componente React funcional que acepta props

---- [ ] C-002: Título "Recuperación de Contraseña"

- [ ] C-003: Campo de email con label vinculado

# FASE 5: Formulario de Correo Electrónico- [ ] C-004: Campo de email tiene placeholder

- [ ] C-005: Campo de email está deshabilitado durante loading

Objetivo: Completar formulario con lógica de validación.- [ ] C-006: Muestra error cuando touched && !!emailError

- [ ] C-007: Mensaje de error tiene icono y texto

---- [ ] C-008: Error tiene aria-invalid y aria-describedby

- [ ] C-009: Botón "Continuar" habilitado/deshabilitado según validación

## T016: Crear Application Service `ServicioFormularioRecuperacion`- [ ] C-010: Botón "Continuar" muestra "Procesando..." cuando isLoading

- [ ] C-011: Botón "Regresar al Login" siempre visible

**Fase**: 5 — Lógica de Formulario  - [ ] C-012: Sin lógica de negocio (prop-driven)

**Prioridad**: P1  - [ ] C-013: Responsive (CSS mobile/tablet/desktop)

**Paralelizable**: [P] No (depende de T008)  - [ ] C-014: Tests de render, props, interacción

**Estimación**: 1.5 horas  - [ ] C-015: Coverage >= 80%

- [ ] C-016: 0 errores TypeScript

**Descripción**:- [ ] C-017: Accesible (labels, aria attributes, etc.)

Implementar servicio de aplicación que orquesta validación y cambios de estado.

**Tests Esperados** (~30 tests):

**Archivos Afectados**:```

- Crear: `src/application/services/ServicioFormularioRecuperacion.ts`✓ debe renderizar título

- Crear: `tests/application/services/ServicioFormularioRecuperacion.test.ts`✓ debe renderizar campo de email

✓ debe renderizar botones

**Criterios de Aceptación**:✓ debe mostrar error cuando touched && error

- [ ] Clase `ServicioFormularioRecuperacion` con inyección de `ValidadorCorreoElectronico`✓ debe ocultar error cuando no hay error

- [ ] Método `validarCorreo()`: valida y marca tocado✓ debe estar deshabilitado durante loading

- [ ] Método `manejarCambioCorreo()`: limpia errores si se reedita✓ debe llamar onEmailChange al escribir

- [ ] Método `manejarBlurCorreo()`: valida al perder foco✓ debe llamar onEmailBlur al salir del campo

- [ ] Método `prepararParaEnvio()`: valida antes de submit✓ debe llamar onSubmit al hacer clic en Continuar

- [ ] Factory method: `crear()`✓ debe llamar onBack al hacer clic en Regresar

- [ ] Retorna `SolicitudRecuperacion` actualizada✓ debe mostrar texto "Procesando..." cuando isLoading

- [ ] Maneja estrategia blur + submit... más tests

- [ ] Cobertura >= 90%```



**Tests Esperados** (8-10 tests):---

- Validar correo en blur

- Limpiar error al editar### ✅ T016: Crear Componente `RecoveryConfirmation`

- Marcar tocado

- Preparar para envío**Categoría**: Presentation Layer - Components  

- Retornar solicitud actualizada**Prioridad**: P1 - CRÍTICA  

- Mensajes de error correctos**Estimación**: 1.5 horas  

**Dependencias**: T015  

**Ref Spec**: spec.md RF-005, RF-007; clarifications.md A-002; data-model.md § 3.1 ServicioFormularioRecuperacion

**Descripción**:

---Implementar el componente de confirmación neutral.



## T017: Crear Factory `FabricaSolicitudRecuperacion`**Archivos a crear**:

1. `src/presentation/components/RecoveryConfirmation.tsx`

**Fase**: 5 — Lógica de Formulario  2. `tests/presentation/components/RecoveryConfirmation.test.tsx`

**Prioridad**: P1  

**Paralelizable**: [P] Sí (después de T007)  **Criterios de Aceptación**:

**Estimación**: 0.5 horas  

- [ ] C-001: Componente funcional que acepta onBack prop

**Descripción**:- [ ] C-002: Icono de éxito (ej: ✓)

Implementar factory para crear instancias de SolicitudRecuperacion de forma consistente.- [ ] C-003: Título "Solicitud Procesada"

- [ ] C-004: Mensaje neutral exacto: "Si el correo electrónico corresponde a una cuenta registrada, recibirás instrucciones..."

**Archivos Afectados**:- [ ] C-005: Texto secundario: "Por favor, revisa tu bandeja de entrada y la carpeta de spam"

- Crear: `src/application/factories/FabricaSolicitudRecuperacion.ts`- [ ] C-006: Botón "Regresar al Login"

- Crear: `tests/application/factories/FabricaSolicitudRecuperacion.test.ts`- [ ] C-007: Al hacer clic, llama onBack()

- [ ] C-008: Mensaje NO afirma envío real de correo

**Criterios de Aceptación**:- [ ] C-009: Mensaje NO revela si cuenta existe

- [ ] Método `crear()`: instancia vacía- [ ] C-010: Tests de render, props, interacción

- [ ] Método `desdeCorreo(correo)`: con email preestablecido- [ ] C-011: Coverage >= 85%

- [ ] Método `conError(correo, error)`: con error preestablecido- [ ] C-012: 0 errores TypeScript

- [ ] Método `reiniciar()`: nueva instancia limpia- [ ] C-013: Accesible

- [ ] Cobertura >= 90%

**Tests Esperados** (~10 tests):

**Tests Esperados** (4-5 tests):```

- Factory methods crean instancias correctas✓ debe renderizar mensaje neutral

- Instancias tienen estado esperado✓ debe renderizar botón Regresar

- Factory es reutilizable✓ debe llamar onBack cuando se hace clic

✓ NO debe decir "Se envió un correo"

**Ref Spec**: data-model.md § 3.3 FabricaSolicitudRecuperacion✓ NO debe revelar si cuenta existe

... más tests

---```



## T018: Crear DTO `DTOFormularioRecuperacion`---



**Fase**: 5 — Lógica de Formulario  ### ✅ T017: Crear Container Page `RecoveryPage`

**Prioridad**: P1  

**Paralelizable**: [P] Sí  **Categoría**: Presentation Layer - Pages  

**Estimación**: 0.5 horas  **Prioridad**: P1 - CRÍTICA  

**Estimación**: 2 horas  

**Descripción**:**Dependencias**: T014-T016  

Definir DTO para transferencia de datos entre capas.

**Descripción**:

**Archivos Afectados**:Implementar la página contenedora que orquesta el flujo completo.

- Crear: `src/application/dtos/DTOFormularioRecuperacion.ts`

- Crear: `tests/application/dtos/DTOFormularioRecuperacion.test.ts`**Archivos a crear**:

1. `src/presentation/pages/RecoveryPage.tsx`

**Criterios de Aceptación**:2. `tests/presentation/pages/RecoveryPage.test.tsx`

- [ ] Type `DTOFormularioRecuperacion` con campos: correo, tocado, errores

- [ ] Mapper `MapeadorFormularioRecuperacion.aDominio()`**Criterios de Aceptación**:

- [ ] Mapper `MapeadorFormularioRecuperacion.aDTO()`

- [ ] Conversión bidireccional funciona- [ ] C-001: Componente funcional que usa useRecoveryForm

- [ ] Cobertura >= 90%- [ ] C-002: Usa useNavigate de React Router

- [ ] C-003: Renderiza RecoveryForm cuando state != success

**Tests Esperados** (4 tests):- [ ] C-004: Renderiza RecoveryConfirmation cuando isSuccess

- Mapping a domain- [ ] C-005: handleBack() resetea formulario y navega a /login

- Mapping a DTO- [ ] C-006: Pasa todos los props a componentes hijos

- Conversión bidireccional- [ ] C-007: Tests de flujo completo

- Preserva datos- [ ] C-008: Tests de navegación

- [ ] C-009: Tests de transición form → confirmation

**Ref Spec**: data-model.md § 3.2 DTOFormularioRecuperacion- [ ] C-010: Coverage >= 85%

- [ ] C-011: 0 errores TypeScript

---

**Tests Esperados** (~20 tests):

# FASE 6: Validaciones y Mensajes de Error```

✓ debe renderizar RecoveryForm inicialmente

Objetivo: Implementar lógica de validación y manejo de errores.✓ debe cambiar a RecoveryConfirmation después de success

✓ debe regresar a /login al hacer clic en Regresar

---✓ debe limpiar formulario al regresar

✓ debe pasar props correctos a RecoveryForm

## T019: Crear Hook `useFormularioRecuperacion`✓ debe pasar props correctos a RecoveryConfirmation

... más tests

**Fase**: 6 — Validaciones  ```

**Prioridad**: P1  

**Paralelizable**: [P] No (depende de T016, T017)  ---

**Estimación**: 2 horas  

### ✅ T018: Integración con LoginPage

**Descripción**:

Implementar hook React que gestiona estado del formulario usando servicios de dominio.**Categoría**: Presentation Layer - Integración  

**Prioridad**: P1 - CRÍTICA  

**Archivos Afectados**:**Estimación**: 1.5 horas  

- Crear: `src/presentation/hooks/useFormularioRecuperacion.ts`**Dependencias**: T017  

- Crear: `tests/presentation/hooks/useFormularioRecuperacion.test.ts`

**Descripción**:

**Criterios de Aceptación**:Modificar `LoginPage.tsx` para agregar enlace a recuperación.

- [ ] Hook usa `useState` para solicitud y estado

- [ ] Hook usa `useCallback` para handlers**Archivos a modificar**:

- [ ] Retorna: `{correo, errorCorreo, tocado, estaCargando, esExito, manejarCambioCorreo, manejarBlurCorreo, manejarEnvio, manejarReinicio}`1. `src/presentation/pages/LoginPage.tsx` (o donde esté login)

- [ ] `manejarCambioCorreo(correo)`: llama service y actualiza state2. `tests/presentation/pages/LoginPage.test.tsx` (actualizar)

- [ ] `manejarBlurCorreo()`: valida en blur

- [ ] `manejarEnvio()`: valida antes de enviar, simula carga 750ms, transiciona a exito**Criterios de Aceptación**:

- [ ] `manejarReinicio()`: reinicia formulario

- [ ] Simulación de carga: 750ms con setTimeout- [ ] C-001: LoginPage incluye Link a `/recuperar-contrasena`

- [ ] Sin dependencias externas (no fetch, solo simulación local)- [ ] C-002: Texto del enlace: "¿Olvidaste tu contraseña?"

- [ ] Cobertura >= 85%- [ ] C-003: Enlace está posicionado apropiadamente (abajo del formulario)

- [ ] C-004: Enlace es clickeable y accesible

**Tests Esperados** (10-12 tests):- [ ] C-005: No rompe funcionalidad existente del login

- Hook renderiza sin error- [ ] C-006: Tests verifican que enlace funciona

- Handlers funcionan- [ ] C-007: Tests verifican navegación

- Validación en blur- [ ] C-008: 0 regresiones en tests de login

- Limpieza de error al editar

- Simulación de carga 750ms**Tests Esperados** (~5 tests):

- Transición a confirmación```

- Reinicio limpia todo✓ debe mostrar enlace "¿Olvidaste tu contraseña?"

- No hace llamadas API✓ debe navegar a /recuperar-contrasena al hacer clic

✓ no debe romper login existente

**Ref Spec**: spec.md HU-004, HU-005, HU-006, HU-007; clarifications.md A-002, A-010; data-model.md § 4.2 useFormularioRecuperacion... más tests

```

---

---

## T020: Integrar Hook en FormularioRecuperacion

### ✅ T019: Crear Barrel Exports para Presentation Layer

**Fase**: 6 — Validaciones  

**Prioridad**: P1  **Categoría**: Presentation Layer - Organización  

**Paralelizable**: [P] No (depende de T019)  **Prioridad**: P2 - MEDIA  

**Estimación**: 1 hora  **Estimación**: 1 hora  

**Dependencias**: T014-T018  

**Descripción**:

Conectar el hook al componente presentacional del formulario.**Descripción**:

Crear archivos de índice para presentation layer.

**Archivos Afectados**:

- Modificar: `src/presentation/components/recuperacion/FormularioRecuperacion.tsx`**Archivos a crear**:

- Actualizar: `tests/presentation/components/recuperacion/FormularioRecuperacion.test.ts`1. `src/presentation/hooks/index.ts`

2. `src/presentation/components/index.ts`

**Criterios de Aceptación**:3. `src/presentation/pages/index.ts`

- [ ] PaginaRecuperacion usa useFormularioRecuperacion4. `src/presentation/index.ts` (principal)

- [ ] Props del formulario se proveen desde hook

- [ ] Handlers conectados correctamente---

- [ ] Estados reflejados en UI

- [ ] Validación funciona end-to-end### ✅ T020: Crear Tipos TypeScript Compartidos

- [ ] Tests de integración pasan

**Categoría**: Shared Types  

**Tests Esperados** (6-8 tests):**Prioridad**: P2 - MEDIA  

- Hook + Component funcionan juntos**Estimación**: 1 hora  

- Flujo validación blur funciona**Dependencias**: T001-T019  

- Flujo validación submit funciona

- Error messages muestran correctamente**Descripción**:

- Cambios de estado reflejadosCrear archivo con tipos TypeScript compartidos.



**Ref Spec**: spec.md HU-003, HU-004, HU-005**Archivos a crear**:

1. `src/types/recovery.ts`

---

**Criterios de Aceptación**:

## T021: Implementar Validación en Blur

- [ ] C-001: Tipos: RecoveryFormState, ProcessState, ValidationResponse

**Fase**: 6 — Validaciones  - [ ] C-002: Types de componentes: RecoveryFormComponentProps, etc.

**Prioridad**: P1  - [ ] C-003: 0 errores TypeScript

**Paralelizable**: [P] Sí (después de T020)  - [ ] C-004: Tipos documentados con JSDoc

**Estimación**: 1 hora  

---

**Descripción**:

Verificar que la validación ocurre correctamente al hacer blur en el campo email.### ✅ T021: Tests de Presentation Layer - Cobertura >= 80%



**Archivos Afectados**:**Categoría**: Presentation Layer - Testing  

- Tests: `tests/integration/recuperacion/validacion-blur.test.ts`**Prioridad**: P1 - CRÍTICA  

**Estimación**: 3 horas  

**Criterios de Aceptación**:**Dependencias**: T014-T020  

- [ ] Test: Usuario escribe email inválido

- [ ] Test: Al hacer blur, aparece error**Descripción**:

- [ ] Test: Mensaje de error es correctoRevisión exhaustiva y adición de tests faltantes para alcanzar >= 80% coverage.

- [ ] Test: Usuario retoma edición, error desaparece

- [ ] Test: Usuario escribe válido, desaparece error**Criterios de Aceptación**:

- [ ] Tests pasan

- [ ] C-001: `npm run test -- tests/presentation/` muestra >= 80% coverage

**Tests Esperados** (5 tests):- [ ] C-002: Todos los tests pasan (100%)

- Blur sin error inicialmente- [ ] C-003: Se agregaron ~85 tests en T014-T018

- Blur con error muestra mensaje- [ ] C-004: Total tests hasta ahora: 183 (98 + 85)

- Edición limpia error

- Mensaje es específico por tipo**Comando de Verificación**:

- Error desaparece al corregir```bash

npm run test -- tests/ --coverage

**Ref Spec**: spec.md RF-005, HU-004; clarifications.md A-002```



---**Resultado Esperado**:

```

## T022: Implementar Validación en SubmitTotal:                                          183+ tests ✓

Overall Coverage:                               >= 80% ✓

**Fase**: 6 — Validaciones  ```

**Prioridad**: P1  

**Paralelizable**: [P] Sí (después de T020)  ---

**Estimación**: 1 hora  

### ✅ T022: Verificación de Fase 3 - Definition of Done

**Descripción**:

Verificar que se valida antes de permitir envío del formulario.**Categoría**: Quality Assurance  

**Prioridad**: P1 - CRÍTICA  

**Archivos Afectados**:**Estimación**: 1 hora  

- Tests: `tests/integration/recuperacion/validacion-submit.test.ts`**Dependencias**: T014-T021  



**Criterios de Aceptación**:**Descripción**:

- [ ] Test: Usuario intenta enviar sin emailVerificación de que Fase 3 está completa y lista para Fase 4.

- [ ] Test: Error aparece, no avanza

- [ ] Test: Usuario intenta enviar con email inválido**Criterios de Aceptación**:

- [ ] Test: Error aparece, no avanza

- [ ] Test: Usuario envía con email válido- [ ] C-001: 183+ tests pasando ✓

- [ ] Test: Avanza a confirmación- [ ] C-002: Coverage >= 80%

- [ ] Tests pasan- [ ] C-003: Build exitoso

- [ ] C-004: 0 errores TypeScript

**Tests Esperados** (5 tests):- [ ] C-005: 0 errores ESLint

- Submit vacío muestra error- [ ] C-006: Componentes renderizados correctamente

- Submit inválido muestra error- [ ] C-007: Navegación funciona (login ↔ recovery)

- Submit válido avanza- [ ] C-008: Formulario interactivo completo

- Formulario no procesa sin validez- [ ] C-009: Fase 3 READY para rutas y estilos

- Estados de error correctos

---

**Ref Spec**: spec.md RF-007; clarifications.md A-002

## FASE 4: Routing y Estilos (Tareas T023-T027)

---

### ✅ T023: Agregar Ruta `/recuperar-contrasena`

## T023: Validar Casos Borde de Email

**Categoría**: Routing  

**Fase**: 6 — Validaciones  **Prioridad**: P1 - CRÍTICA  

**Prioridad**: P2  **Estimación**: 1 hora  

**Paralelizable**: [P] Sí  **Dependencias**: T017, T022  

**Estimación**: 1.5 horas  

**Descripción**:

**Descripción**:Integrar la ruta de recuperación en `AppRoutes.tsx` o router principal.

Tests para casos borde mencionados en spec.md CB-001 a CB-013.

**Archivos a modificar**:

**Archivos Afectados**:1. `src/routes/AppRoutes.tsx`

- Crear: `tests/integration/recuperacion/casos-borde-email.test.ts`2. `tests/routes/AppRoutes.test.tsx` (si existe)



**Criterios de Aceptación**:**Criterios de Aceptación**:

- [ ] Test CB-001: Email vacío → error requerido

- [ ] Test CB-002: Email sin punto → error formato- [ ] C-001: Ruta `/recuperar-contrasena` renderiza `RecoveryPage`

- [ ] Test CB-003: Email con espacios → trimea- [ ] C-002: Ruta es accesible sin autenticación

- [ ] Test CB-004: Email MAYÚSCULAS → normaliza- [ ] C-003: Tests verifican que ruta funciona

- [ ] Test CB-005: Email con +tag → válido- [ ] C-004: No rompe rutas existentes

- [ ] Test CB-009: Edición limpia error previo- [ ] C-005: 0 errores TypeScript

- [ ] Test CB-010: Submit sin blur valida

- [ ] Tests pasan**Tests Esperados** (~3 tests):

```

**Tests Esperados** (8 tests por cada caso borde):✓ debe renderizar RecoveryPage en /recuperar-contrasena

- Cada CB tiene test específico✓ debe navegar a ruta correctamente

- Comportamiento esperado verificado✓ no debe romper rutas existentes

- Edge cases cubiertos```



**Ref Spec**: spec.md CB-001 a CB-013---



---### ✅ T024: Crear Estilos para RecoveryForm



# FASE 7: Confirmación y Estados de Interfaz**Categoría**: Styling  

**Prioridad**: P1 - CRÍTICA  

Objetivo: Implementar flujo de confirmación y manejo de estados.**Estimación**: 2.5 horas  

**Dependencias**: T015, T023  

---

**Descripción**:

## T024: Implementar Simulación de Carga (750ms)Implementar CSS para el componente RecoveryForm con responsive design.



**Fase**: 7 — Confirmación  **Archivos a crear/modificar**:

**Prioridad**: P1  1. `src/presentation/components/RecoveryForm.module.css` (o similar)

**Paralelizable**: [P] No (depende de T019)  2. Estilos: contenedor, label, input, botones, mensajes de error

**Estimación**: 1 hora  3. Media queries: mobile (< 768px), tablet, desktop



**Descripción**:**Criterios de Aceptación**:

Completar lógica de simulación de carga con setTimeout en hook.

- [ ] C-001: Formulario centrado

**Archivos Afectados**:- [ ] C-002: Campo de email ancho apropiado (300-500px desktop, full mobile)

- Modificar: `src/presentation/hooks/useFormularioRecuperacion.ts` (ya creado en T019)- [ ] C-003: Error con color rojo (#E53E3E)

- Tests: `tests/presentation/hooks/useFormularioRecuperacion.test.ts`- [ ] C-004: Borde rojo en campo con error

- [ ] C-005: Mensaje de error debajo del campo

**Criterios de Aceptación**:- [ ] C-006: Botones distinguibles (primario/secundario)

- [ ] `manejarEnvio()` entra en estado loading- [ ] C-007: Mobile: campo altura >= 44px, sin scroll horizontal

- [ ] Espera 750ms exactos (simulación)- [ ] C-008: Tablet: adaptado a pantalla

- [ ] Después de 750ms, transiciona a exito- [ ] C-009: Desktop: formulario centrado y legible

- [ ] Botón deshabilitado durante loading- [ ] C-010: Coherencia visual con login existente

- [ ] Spinner visible durante loading- [ ] C-011: Hover y focus states definidos

- [ ] Tests usan fake timers o wait- [ ] C-012: Sin conflictos de CSS (módulos o namespacing)

- [ ] Cobertura >= 90%

---

**Tests Esperados** (3-4 tests):

- Loading state activado### ✅ T025: Crear Estilos para RecoveryConfirmation

- Duración 750ms verificada

- Transición a success después**Categoría**: Styling  

- Spinner visible/invisible correctamente**Prioridad**: P1 - CRÍTICA  

**Estimación**: 1.5 horas  

**Ref Spec**: spec.md HU-006, HU-007; clarifications.md A-010**Dependencias**: T016, T024  



---**Descripción**:

Implementar CSS para el componente de confirmación.

## T025: Crear Transición Form → Confirmación

**Archivos a crear/modificar**:

**Fase**: 7 — Confirmación  1. `src/presentation/components/RecoveryConfirmation.module.css` (o similar)

**Prioridad**: P1  2. Estilos: icono, título, mensaje, botón

**Paralelizable**: [P] No (depende de T024)  3. Responsive design

**Estimación**: 1 hora  

**Criterios de Aceptación**:

**Descripción**:

Implementar lógica para transicionar de formulario a confirmación después de envío exitoso.- [ ] C-001: Icono prominente (ej: ✓ grande)

- [ ] C-002: Título claro

**Archivos Afectados**:- [ ] C-003: Mensaje centrado y legible

- Modificar: `src/presentation/pages/recuperar-contrasena/PaginaRecuperacion.tsx`- [ ] C-004: Botón destacado

- Tests: `tests/presentation/pages/recuperar-contrasena/PaginaRecuperacion.test.ts`- [ ] C-005: Responsive en mobile/tablet/desktop

- [ ] C-006: Coherencia visual con formulario

**Criterios de Aceptación**:

- [ ] PaginaRecuperacion renderiza FormularioRecuperacion inicialmente---

- [ ] Después de envío exitoso, renderiza ConfirmacionRecuperacion

- [ ] Estado `esExito` del hook controla renderización### ✅ T026: Crear Estilos Globales / Tema

- [ ] Confirmación no muestra si no es exito

- [ ] Formulario no muestra si es exito**Categoría**: Styling  

- [ ] Transición suave (sin flasheos)**Prioridad**: P2 - MEDIA  

- [ ] 0 errores TypeScript**Estimación**: 1 hora  

**Dependencias**: T024, T025  

**Tests Esperados** (4 tests):

- Renderiza form inicialmente**Descripción**:

- Transiciona a confirmationCrear/actualizar estilos globales y variables de tema.

- Muestra confirmación cuando exito

- Estados controlados correctamente**Archivos a crear/modificar**:

1. `src/styles/recovery.css` (o variables globales)

**Ref Spec**: spec.md HU-006, HU-007, HU-0082. Variables: colores, espaciado, tipografía

3. Mixins/utilitarios si es necesario

---

**Criterios de Aceptación**:

## T026: Integrar Confirmación con Mensaje Neutral

- [ ] C-001: Variables de color definidas

**Fase**: 7 — Confirmación  - [ ] C-002: Espaciado consistente

**Prioridad**: P1  - [ ] C-003: Tipografía coherente

**Paralelizable**: [P] No (depende de T025)  - [ ] C-004: Eficiencia: reutilización en componentes

**Estimación**: 0.5 horas  

---

**Descripción**:

Verificar que ConfirmacionRecuperacion muestra mensaje neutral que no revela si email existe.### ✅ T027: Verificación de Fase 4 - Definition of Done



**Archivos Afectados**:**Categoría**: Quality Assurance  

- Tests: `tests/integration/recuperacion/confirmacion.test.ts`**Prioridad**: P1 - CRÍTICA  

**Estimación**: 1 hora  

**Criterios de Aceptación**:**Dependencias**: T023-T026  

- [ ] Test: Confirmación muestra mensaje exacto de clarifications.md A-005

- [ ] Test: Mensaje es idéntico para todos los emails**Descripción**:

- [ ] Test: NO dice "Se envió correo"Verificación de que Fase 4 está completa.

- [ ] Test: NO revela si correo existe

- [ ] Test: Mensaje está entre tags correctos (h1, p, etc.)**Criterios de Aceptación**:

- [ ] Tests pasan

- [ ] C-001: Ruta funciona: `npm run dev` → ir a /recuperar-contrasena

**Tests Esperados** (4 tests):- [ ] C-002: Formulario renderiza correctamente

- Mensaje neutral presente- [ ] C-003: Estilos se aplican (sin colisiones)

- Mensaje idéntico siempre- [ ] C-004: Responsive: probado en mobile (320px), tablet (768px), desktop (1024px)

- No revela información- [ ] C-005: Sin scroll horizontal

- Accesibilidad OK- [ ] C-006: Build exitoso

- [ ] C-007: 0 errores TypeScript

**Ref Spec**: spec.md RF-010; clarifications.md A-005- [ ] C-008: 0 advertencias CSS

- [ ] C-009: Fase 4 READY para testing exhaustivo

---

---

## T027: Crear Spinner/Loader para Estado Cargando

## FASE 5: Testing Exhaustivo (Tareas T028-T040)

**Fase**: 7 — Confirmación  

**Prioridad**: P1  ### ✅ T028: Tests de Casos Borde - Email

**Paralelizable**: [P] Sí (después de T024)  

**Estimación**: 1 hora  **Categoría**: Testing - Casos Borde  

**Prioridad**: P1 - CRÍTICA  

**Descripción**:**Estimación**: 2 horas  

Crear componente o clase CSS de spinner que se muestra durante estado loading.**Dependencias**: T021  



**Archivos Afectados**:**Descripción**:

- Crear: `src/presentation/components/recuperacion/Spinner.tsx` (opcional, puede ser CSS puro)Agregar tests para casos borde relacionados con validación de email.

- Crear: `src/presentation/components/recuperacion/Spinner.module.css`

- Tests: `tests/presentation/components/recuperacion/Spinner.test.ts` (si es componente)**Archivos a modificar**:

1. `tests/domain/services/EmailValidator.test.ts`

**Criterios de Aceptación**:2. `tests/application/services/RecoveryFormService.test.ts`

- [ ] Spinner visible cuando `estaCargando === true`

- [ ] Animación CSS girando suave**Criterios de Aceptación**:

- [ ] Spinner se oculta cuando `estaCargando === false`

- [ ] No bloquea la interfaz- [ ] C-001: Email muy largo (500 caracteres)

- [ ] Compatible con formulario (posicionamiento)- [ ] C-002: Email con caracteres especiales (+, -, .)

- [ ] Accesible (aria-label si es componente)- [ ] C-003: Email solo mayúsculas

- [ ] 0 errores TypeScript- [ ] C-004: Email mixto mayúsculas/minúsculas

- [ ] C-005: Espacio en medio (antes de @)

**Tests Esperados** (3-4 tests):- [ ] C-006: Solo espacios en blanco

- Spinner renderiza- [ ] C-007: Múltiples @ en email

- Animación funciona- [ ] C-008: Sin punto en dominio

- Visibilidad controlada- [ ] C-009: Trimeo automático de espacios

- Accesibilidad OK- [ ] C-010: Se agregan ~20 tests adicionales



**Ref Spec**: spec.md HU-006; clarifications.md A-010**Resultado**: 203+ tests totales



------



## T028: Implementar Estados de Error en UI### ✅ T029: Tests de Navegación y Flujo



**Fase**: 7 — Confirmación  **Categoría**: Testing - Integración  

**Prioridad**: P1  **Prioridad**: P1 - CRÍTICA  

**Paralelizable**: [P] Sí (después de T006)  **Estimación**: 2 horas  

**Estimación**: 1 hora  **Dependencias**: T027  



**Descripción**:**Descripción**:

Verificar que estados de error se reflejan visualmente en UI (colores, mensajes, iconos).Tests E2E y de integración para flujos completos.



**Archivos Afectados**:**Archivos a crear**:

- Tests: `tests/integration/recuperacion/estados-ui.test.ts`1. `tests/integration/FlujoRecuperacionCompleto.test.tsx`

- Posible modificación: `src/presentation/components/recuperacion/FormularioRecuperacion.module.css`2. `tests/integration/FlujoValidacionRecuperacion.test.tsx`

3. `tests/integration/FlujoCancelacionRecuperacion.test.tsx`

**Criterios de Aceptación**:4. `tests/integration/SincroniaLoginRecuperacion.test.ts`

- [ ] Test: Campo con error tiene borde rojo

- [ ] Test: Mensaje de error visible debajo del campo**Criterios de Aceptación**:

- [ ] Test: Icono de error presente (opcional)

- [ ] Test: Color contrasta adecuadamente- [ ] C-001: Flujo completo: login → recovery → confirmación → login

- [ ] Test: Sin error, campo normal- [ ] C-002: Cancelación en formulario

- [ ] Tests pasan- [ ] C-003: Cancelación en confirmación

- [ ] C-004: Validación end-to-end

**Tests Esperados** (5 tests):- [ ] C-005: Datos se limpian correctamente

- Borde rojo con error- [ ] C-006: Enlace en login funciona

- Mensaje visible- [ ] C-007: No hay regresiones en login

- Sin error, borde normal- [ ] C-008: Se agregan ~15 tests E2E

- Colores correctos

- Contraste adecuado**Resultado**: 218+ tests totales



**Ref Spec**: clarifications.md A-004---



---### ✅ T030: Tests de Accesibilidad



# FASE 8: Navegación de Regreso al Login**Categoría**: Testing - Accesibilidad  

**Prioridad**: P2 - ALTA  

Objetivo: Completar flujos de regreso desde ambas pantallas.**Estimación**: 1.5 horas  

**Dependencias**: T027  

---

**Descripción**:

## T029: Implementar Botón "Regresar" en FormularioTests para verificar accesibilidad WCAG AA.



**Fase**: 8 — Navegación  **Archivos a modificar/crear**:

**Prioridad**: P1  1. `tests/presentation/components/RecoveryForm.test.tsx`

**Paralelizable**: [P] No (depende de T011)  2. `tests/presentation/components/RecoveryConfirmation.test.tsx`

**Estimación**: 0.5 horas  3. Tests de a11y: labels, aria attributes, navegación con teclado



**Descripción**:**Criterios de Aceptación**:

Completar funcionalidad del botón "Regresar" en FormularioRecuperacion.

- [ ] C-001: Label vinculado con input

**Archivos Afectados**:- [ ] C-002: aria-invalid="true" en campo con error

- Modificar: `src/presentation/components/recuperacion/FormularioRecuperacion.tsx`- [ ] C-003: aria-describedby vinculado con mensaje de error

- Tests: `tests/presentation/components/recuperacion/FormularioRecuperacion.test.ts`- [ ] C-004: Navegación con teclado (Tab, Enter)

- [ ] C-005: Focus visible

**Criterios de Aceptación**:- [ ] C-006: Contraste de colores >= 4.5:1 (WCAG AA)

- [ ] Botón "Regresar al Login" presente- [ ] C-007: Se agregan ~10 tests de a11y

- [ ] Estilo secundario (outline)

- [ ] Al hacer clic, llama `alRegresar()`**Resultado**: 228+ tests totales

- [ ] Handler conectado a `useNavigate(-1)` o `navigate("/login")`

- [ ] Tests verifican click---

- [ ] Accesible (keyboard, aria-label)

### ✅ T031: Revisión de Coverage - Alcanzar >= 80%

**Tests Esperados** (2-3 tests):

- Botón existe**Categoría**: Testing - Coverage  

- Click dispara navegación**Prioridad**: P1 - CRÍTICA  

- Accesibilidad OK**Estimación**: 2 horas  

**Dependencias**: T028-T030  

**Ref Spec**: clarifications.md A-006

**Descripción**:

---Análisis exhaustivo de cobertura y adición de tests faltantes.



## T030: Implementar Botón "Regresar" en Confirmación**Criterios de Aceptación**:



**Fase**: 8 — Navegación  - [ ] C-001: `npm run test -- tests/ --coverage` muestra >= 80%

**Prioridad**: P1  - [ ] C-002: Domain layer >= 90%

**Paralelizable**: [P] Sí (después de T012)  - [ ] C-003: Application layer >= 90%

**Estimación**: 0.5 horas  - [ ] C-004: Presentation layer >= 80%

- [ ] C-005: Coverage detallado por archivo

**Descripción**:- [ ] C-006: Ningún archivo crítico < 75%

Completar funcionalidad del botón "Regresar" en ConfirmacionRecuperacion.

**Comando**:

**Archivos Afectados**:```bash

- Modificar: `src/presentation/components/recuperacion/ConfirmacionRecuperacion.tsx`npm run test -- tests/ --coverage --reporter=verbose

- Tests: `tests/presentation/components/recuperacion/ConfirmacionRecuperacion.test.ts````



**Criterios de Aceptación**:**Resultado esperado**:

- [ ] Botón "Regresar al Login" presente (primario)```

- [ ] Al hacer clic, llama `alRegresar()`────────────────────────────────────────────────

- [ ] Handler navegaa `/login`File                                  | % Stmts

- [ ] Tests verifican click────────────────────────────────────────────────

- [ ] Accesibledomain/valueObjects/Email.ts          | 95%

domain/entities/RecoveryForm.ts        | 92%

**Tests Esperados** (2-3 tests):domain/services/EmailValidator.ts      | 96%

- Botón existeapplication/services/*.ts              | 91%

- Click dispara navegaciónpresentation/hooks/useRecoveryForm.ts  | 85%

- Accesibilidad OKpresentation/components/*.tsx          | 82%

────────────────────────────────────────────────

**Ref Spec**: clarifications.md A-006All files                               | 85% ✓

────────────────────────────────────────────────

---```



## T031: Validar Flujo Completo: Regreso desde Formulario---



**Fase**: 8 — Navegación  ### ✅ T032: Verificación de Fase 5 - Definition of Done

**Prioridad**: P1  

**Paralelizable**: [P] Sí (después de T029)  **Categoría**: Quality Assurance  

**Estimación**: 1 hora  **Prioridad**: P1 - CRÍTICA  

**Estimación**: 1 hora  

**Descripción**:**Dependencias**: T028-T031  

Test de integración que valida regreso desde formulario a login y estado limpio.

**Descripción**:

**Archivos Afectados**:Verificación de que Fase 5 está completa.

- Tests: `tests/integration/recuperacion/flujo-regreso-formulario.test.ts`

**Criterios de Aceptación**:

**Criterios de Aceptación**:

- [ ] Test: Usuario está en formulario- [ ] C-001: 230+ tests pasando ✓

- [ ] Test: Usuario hace clic en "Regresar"- [ ] C-002: Coverage >= 80%

- [ ] Test: Navega a `/login`- [ ] C-003: Todos los casos borde de spec.md testeados

- [ ] Test: Regresa a recuperación nuevamente- [ ] C-004: Flujos E2E funcionan

- [ ] Test: Formulario está vacío (limpieza automática)- [ ] C-005: Accesibilidad verificada

- [ ] Tests pasan- [ ] C-006: Build exitoso

- [ ] C-007: 0 regressions

**Tests Esperados** (3-4 tests):- [ ] C-008: Fase 5 READY para refinamiento

- Regreso desde formulario

- Navegación correcta---

- Limpieza de estado

- Estado limpio al regresar## FASE 6: Refinamiento y Documentación (Tareas T033-T040)



**Ref Spec**: clarifications.md A-007### ✅ T033: Revisión y Limpieza de Código



---**Categoría**: Code Quality  

**Prioridad**: P1 - CRÍTICA  

## T032: Validar Flujo Completo: Regreso desde Confirmación**Estimación**: 2 horas  

**Dependencias**: T032  

**Fase**: 8 — Navegación  

**Prioridad**: P1  **Descripción**:

**Paralelizable**: [P] Sí (después de T030)  Revisión exhaustiva del código para asegurar calidad y consistencia.

**Estimación**: 1 hora  

**Criterios de Aceptación**:

**Descripción**:

Test de integración que valida regreso desde confirmación a login.- [ ] C-001: ESLint sin errores: `npm run lint -- src/`

- [ ] C-002: Prettier formateado: `npm run format`

**Archivos Afectados**:- [ ] C-003: No hay console.log/error/warn en producción

- Tests: `tests/integration/recuperacion/flujo-regreso-confirmacion.test.ts`- [ ] C-004: No hay código comentado obsoleto

- [ ] C-005: Nombres descriptivos (variables, funciones, clases)

**Criterios de Aceptación**:- [ ] C-006: Funciones pequeñas y enfocadas

- [ ] Test: Usuario entra en formulario- [ ] C-007: Sin código muerto (unused variables, imports)

- [ ] Test: Envía email válido- [ ] C-008: Comentarios útiles en código complejo

- [ ] Test: Ve confirmación

- [ ] Test: Hace clic en "Regresar"**Comandos**:

- [ ] Test: Navega a `/login````bash

- [ ] Test: Puede iniciar sesión o volver a recuperarnpm run lint -- src/

- [ ] Tests pasannpm run format

grep -r "console\." src/ && echo "WARNINGS" || echo "OK"

**Tests Esperados** (4 tests):```

- Flujo completo hasta confirmación

- Regreso desde confirmación---

- Navegación correcta

- Estado limpio### ✅ T034: TypeScript - Sin Errores



**Ref Spec**: spec.md HU-008; clarifications.md A-006, A-007**Categoría**: Code Quality  

**Prioridad**: P1 - CRÍTICA  

---**Estimación**: 1 hora  

**Dependencias**: T033  

# FASE 9: Validación de Interfaz según Quickstart.md

**Descripción**:

Objetivo: Asegurar que la interfaz cumple con todo lo documentado en quickstart.md.Verificación exhaustiva de TypeScript sin errores.



---**Criterios de Aceptación**:



## T033: Validar Responsive Design (Mobile, Tablet, Desktop)- [ ] C-001: `npx tsc --noEmit` no muestra errores

- [ ] C-002: Todos los tipos correctamente annotados

**Fase**: 9 — Validación UI  - [ ] C-003: No hay `any` types innecesarios

**Prioridad**: P1  - [ ] C-004: Tipos son precisos (no `unknown`)

**Paralelizable**: [P] No  - [ ] C-005: Generics usados cuando corresponde

**Estimación**: 2 horas  - [ ] C-006: 0 advertencias de TypeScript



**Descripción**:**Comando**:

Verificar que la interfaz es responsive y funciona en todos los breakpoints.```bash

npx tsc --noEmit

**Archivos Afectados**:```

- Tests: `tests/integration/recuperacion/responsive-design.test.ts`

- Posibles modificaciones: CSS modules para breakpoints---



**Criterios de Aceptación**:### ✅ T035: Tests - Últimas Verificaciones

- [ ] Test: Mobile (320px) - Formulario legible

- [ ] Test: Mobile - Botones clicables**Categoría**: Testing  

- [ ] Test: Mobile - Mensajes de error visibles**Prioridad**: P1 - CRÍTICA  

- [ ] Test: Tablet (768px) - Layout óptimo**Estimación**: 1.5 horas  

- [ ] Test: Desktop (1024px+) - Ancho adecuado**Dependencias**: T033  

- [ ] Test: Sin scroll horizontal innecesario

- [ ] Test: Tipografía escalable**Descripción**:

- [ ] Tests pasanÚltimas verificaciones de tests.



**Tests Esperados** (8 tests):**Criterios de Aceptación**:

- Cada breakpoint funciona

- Elementos accesibles en todos- [ ] C-001: Todos los tests pasan: `npm run test`

- Legibilidad OK- [ ] C-002: No hay `.skip()` ni `.only()`

- Layouts correctos- [ ] C-003: 0 test warnings

- [ ] C-004: Tests son determinísticos (no flaky)

**Ref Spec**: quickstart.md § 🎨 Desarrollo Frontend; RNF-001- [ ] C-005: Tests corren en < 30 segundos

- [ ] C-006: Coverage >= 80%

---

---

## T034: Validar Accesibilidad (A11y - WCAG 2.1)

### ✅ T036: Build - Verificación de Producción

**Fase**: 9 — Validación UI  

**Prioridad**: P1  **Categoría**: Build  

**Paralelizable**: [P] Sí (después de T033)  **Prioridad**: P1 - CRÍTICA  

**Estimación**: 2 horas  **Estimación**: 1 hora  

**Dependencias**: T034, T035  

**Descripción**:

Verificar que la interfaz cumple con WCAG 2.1 AA (accesibilidad).**Descripción**:

Verificación de que el build es exitoso y optimizado.

**Archivos Afectados**:

- Tests: `tests/integration/recuperacion/accesibilidad.test.ts`**Criterios de Aceptación**:



**Criterios de Aceptación**:- [ ] C-001: `npm run build` exitoso

- [ ] Test: Labels vinculados a inputs (htmlFor)- [ ] C-002: Build time < 1 segundo

- [ ] Test: aria-invalid y aria-describedby presentes- [ ] C-003: 0 errores en console de build

- [ ] Test: Navegación por teclado funciona (Tab)- [ ] C-004: 0 advertencias importantes

- [ ] Test: Focus visible en todos los elementos- [ ] C-005: Bundle size razonable (< 500KB gzip)

- [ ] Test: Contraste de colores >= 4.5:1 (texto)- [ ] C-006: Archivos generados son válidos

- [ ] Test: Errores tienen aria-live o son percibibles- [ ] C-007: Source maps se generan (para debug)

- [ ] Test: Confirmación accesible

- [ ] Tests pasan**Comando**:

```bash

**Tests Esperados** (8 tests):npm run build

- Labels OK```

- ARIA attributes OK

- Keyboard nav OK**Resultado esperado**:

- Focus visible```

- Color contrast OK  built in 815ms

- Error announcement OK

- Screen reader friendly✓ Verificación de build READY

```

**Ref Spec**: RNF-006 (Accesibilidad); WCAG 2.1 AA

---

---

### ✅ T037: Documentación - README del Módulo

## T035: Validar Performance (Lighthouse)

**Categoría**: Documentation  

**Fase**: 9 — Validación UI  **Prioridad**: P2 - MEDIA  

**Prioridad**: P2  **Estimación**: 1.5 horas  

**Paralelizable**: [P] Sí  **Dependencias**: T035  

**Estimación**: 1.5 horas  

**Descripción**:

**Descripción**:Crear README.md para el módulo 005 con documentación completa.

Verificar que el módulo tiene buen performance según Lighthouse.

**Archivos a crear**:

**Archivos Afectados**:1. `Union/specs/005-inspiraciones-recuperacion-contrasena/README.md`

- Tests: Manual o script de Lighthouse2. Posible: `src/modules/recovery/README.md` (si hay carpeta de módulo)



**Criterios de Aceptación**:**Contenido del README**:

- [ ] Test: LCP (Largest Contentful Paint) < 2.5s- Descripción del módulo

- [ ] Test: FID (First Input Delay) < 100ms- Rutas disponibles

- [ ] Test: CLS (Cumulative Layout Shift) < 0.1- Componentes principales

- [ ] Test: Sin console errors- Cómo ejecutar tests

- [ ] Test: Bundle size razonable- Cómo hacer build

- [ ] Test: Sin memory leaks- Arquitectura DDD

- [ ] Test: Performance score >= 90- Ejemplos de uso

- Guía de contribución

**Tests Esperados** (7 tests):

- Cada métrica de performance**Criterios de Aceptación**:

- Sin errores console

- Sin memory leaks- [ ] C-001: README.md existe y es legible

- Score Lighthouse OK- [ ] C-002: Instrucciones claras para ejecutar

- [ ] C-003: Descripción de arquitectura

**Ref Spec**: RNF-001, RNF-002 (Performance, Responsiveness)- [ ] C-004: Ejemplos de código

- [ ] C-005: Links a documentación de spec

---- [ ] C-006: Información de contacto/mantenedor



## T036: Validar Integración con Módulo 006 (Cuestionario)---



**Fase**: 9 — Validación UI  ### ✅ T038: Documentación - Comentarios en Código

**Prioridad**: P2  

**Paralelizable**: [P] Sí  **Categoría**: Documentation  

**Estimación**: 1 hora  **Prioridad**: P2 - MEDIA  

**Estimación**: 1 hora  

**Descripción**:**Dependencias**: T037  

Verificar que el módulo 008 no interfiere con módulo 006 (Cuestionario) existente.

**Descripción**:

**Archivos Afectados**:Agregar comentarios JSDoc en funciones y clases complejas.

- Tests: `tests/integration/recuperacion/no-regresion-modulo006.test.ts`

**Criterios de Aceptación**:

**Criterios de Aceptación**:

- [ ] Test: Módulo 006 sigue funcionando- [ ] C-001: Funciones públicas tienen comentarios JSDoc

- [ ] Test: Rutas de 006 no afectadas- [ ] C-002: Parámetros y retornos documentados

- [ ] Test: Componentes de 006 siguen renderizando- [ ] C-003: Comentarios en lógica compleja

- [ ] Test: No hay conflictos de estilos- [ ] C-004: Ejemplos de uso en comentarios (opcional)

- [ ] Test: No hay conflictos de tipos TypeScript- [ ] C-005: Sin sobre-comentado (código auto-explicativo)

- [ ] Tests pasan

**Ejemplo**:

**Tests Esperados** (5 tests):```typescript

- Módulo 006 funciona/**

- Sin conflictos * Valida un email y retorna resultado con mensaje específico.

- Sin regresión * @param email - Email a validar

- Integración limpia * @returns Objeto con isValid y mensaje de error opcional

 */

**Ref Spec**: Integración modular sin afectar otros módulosvalidate(email: string): EmailValidationResult {

  // ...

---}

```

# FASE 10: Revisión Final del Frontend

---

Objetivo: Realizar revisión final, documentación y preparación para producción.

### ✅ T039: Documentación - Actualizar README General

---

**Categoría**: Documentation  

## T037: Ejecutar Suite Completa de Tests**Prioridad**: P2 - MEDIA  

**Estimación**: 1 hora  

**Fase**: 10 — Revisión Final  **Dependencias**: T038  

**Prioridad**: P1  

**Paralelizable**: [P] No  **Descripción**:

**Estimación**: 1 hora  Actualizar README general de Union con información del módulo 005.



**Descripción**:**Archivos a modificar**:

Ejecutar todos los tests del módulo 008 y verificar cobertura total.1. `/Union/README.md` (o similar)

2. `/Union/specs/README.md` (si existe)

**Archivos Afectados**:

- Tests: Todos los tests de `tests/domain/`, `tests/application/`, `tests/presentation/`, `tests/integration/`**Criterios de Aceptación**:



**Criterios de Aceptación**:- [ ] C-001: Referencia a módulo 005

- [ ] `npm run test` - Todos los tests pasan (230+ tests esperados)- [ ] C-002: Link a documentación de 005

- [ ] `npm run test -- --coverage` - Cobertura >= 80% total- [ ] C-003: Descripción breve

- [ ] Cobertura por capa:- [ ] C-004: Status del módulo (ej: "MVP")

  - [ ] Domain: >= 95%

  - [ ] Application: >= 90%---

  - [ ] Presentation: >= 85%

  - [ ] Integration: >= 80%### ✅ T040: Verificación Final de Fase 6 - Módulo READY

- [ ] No hay tests pendientes (skip)

- [ ] No hay warnings en tests**Categoría**: Quality Assurance  

**Prioridad**: P1 - CRÍTICA  

**Tests Esperados**:**Estimación**: 2 horas  

- 230+ tests pasan**Dependencias**: T033-T039  

- Cobertura 80%+ total

- Distribución por capa correcta**Descripción**:

Verificación final exhaustiva de que el módulo está listo para producción.

**Ref Spec**: plan.md § 5 Estrategia de Testing

**Checklist Completo**:

---

```bash

## T038: Ejecutar TypeScript Type-Check# 1. Tests

npm run test -- tests/ --coverage

**Fase**: 10 — Revisión Final  ✓ 230+ tests pasando

**Prioridad**: P1  ✓ Coverage >= 80%

**Paralelizable**: [P] No  

**Estimación**: 0.5 horas  # 2. Linting

npm run lint -- src/

**Descripción**:✓ 0 errores

Ejecutar verificación de tipos TypeScript sin errores.✓ 0 advertencias



**Archivos Afectados**:# 3. TypeScript

- Todos los archivos `.ts` y `.tsx` del módulo 008npx tsc --noEmit

✓ 0 errores

**Criterios de Aceptación**:

- [ ] `npm run type-check` - 0 errores# 4. Build

- [ ] No hay `any` innecesariosnpm run build

- [ ] Tipos importados correctamente✓ Build exitoso

- [ ] No hay `@ts-ignore` excepto si es documentado✓ Build time < 1s

- [ ] Tipos genéricos correctos

# 5. Código limpio

**Tests Esperados**:grep -r "console\." src/ && echo "FAIL" || echo "OK"

- 0 errores TypeScript✓ 0 console statements

- Tipos validan

# 6. Documentación

**Ref Spec**: plan.md § 6 Criterios de Aceptación (Código)ls -la Union/specs/005-inspiraciones-recuperacion-contrasena/*.md

✓ constitution.md ✓

---✓ spec.md ✓

✓ clarifications.md ✓

## T039: Ejecutar ESLint y Formateo✓ data-model.md ✓

✓ plan.md ✓

**Fase**: 10 — Revisión Final  ✓ tasks.md ✓

**Prioridad**: P1  

**Paralelizable**: [P] No  # 7. Archivos clave

**Estimación**: 0.5 horas  ls -la src/domain/

ls -la src/application/

**Descripción**:ls -la src/presentation/

Ejecutar linter y verificar que el código cumple estándares.✓ Estructura completa



**Archivos Afectados**:# 8. README

- Todos los archivos del módulo 008ls -la Union/specs/005-inspiraciones-recuperacion-contrasena/README.md

✓ README existe

**Criterios de Aceptación**:```

- [ ] `npm run lint` - 0 warnings

- [ ] Código formateado (Prettier)**Criterios de Aceptación Final**:

- [ ] No hay `console.log`, `console.error` en producción

- [ ] No hay variables sin usar- [ ] C-001: 230+ tests pasando (100%)

- [ ] No hay imports sin usar- [ ] C-002: Coverage >= 80%

- [ ] Estilos de código consistentes- [ ] C-003: 0 errores TypeScript

- [ ] C-004: 0 errores ESLint

**Tests Esperados**:- [ ] C-005: 0 console.log/error/warn

- ESLint pasa- [ ] C-006: Build exitoso (< 1s)

- Código formateado- [ ] C-007: Documentación completa

- Sin problemas de linting- [ ] C-008: README.md existe

- [ ] C-009: Código coherente con módulo 006

**Ref Spec**: plan.md § 6 Criterios de Aceptación (Código)- [ ] C-010: Ninguna regresión en código existente

- [ ] C-011: Funcionamiento verificado manualmente

---- [ ] C-012: Listo para producción ✓



## T040: Crear BUILD de Producción**Release Tag**:

```bash

**Fase**: 10 — Revisión Final  git tag -a v1.0.0-005-recuperacion-contrasena -m "Release Módulo 005"

**Prioridad**: P1  git push origin v1.0.0-005-recuperacion-contrasena

**Paralelizable**: [P] No  ```

**Estimación**: 1 hora  

---

**Descripción**:

Compilar código a producción y verificar que build es válido.## Resumen de Tareas



**Archivos Afectados**:### Por Fase

- Build output: `dist/`

| Fase | Tareas | Count | Estado |

**Criterios de Aceptación**:|------|--------|-------|--------|

- [ ] `npm run build` - Build exitoso| Fase 1: Domain | T001-T007 | 7 | 📋 Ready |

- [ ] 0 errores en build| Fase 2: Application | T008-T013 | 6 | 📋 Ready |

- [ ] 0 warnings en build (o acceptados)| Fase 3: Presentation | T014-T022 | 9 | 📋 Ready |

- [ ] Asset sizes razonables| Fase 4: Routing/CSS | T023-T027 | 5 | 📋 Ready |

- [ ] Source maps generados| Fase 5: Testing | T028-T032 | 5 | 📋 Ready |

- [ ] No hay console errors en bundle| Fase 6: Refinamiento | T033-T040 | 8 | 📋 Ready |

- [ ] Bundle analizable| **TOTAL** | **T001-T040** | **40** | **✓ 100%** |



**Tests Esperados**:### Métricas Esperadas

- Build completo

- Sin errores| Métrica | Esperado | Target |

- Tamaño aceptable|---------|----------|--------|

| Tests | 230+ | >= 200 ✓ |

**Ref Spec**: plan.md § 6 Criterios de Aceptación (Producción)| Coverage | >= 80% | >= 80% ✓ |

| TypeScript Errors | 0 | 0 ✓ |

---| ESLint Errors | 0 | 0 ✓ |

| Console Statements | 0 | 0 ✓ |

## T041: Documentar Módulo 008| Build Time | < 1s | < 2s ✓ |

| Timeline | 12-18 días | Estimado ✓ |

**Fase**: 10 — Revisión Final  

**Prioridad**: P2  ---

**Paralelizable**: [P] Sí  

**Estimación**: 2 horas  ## Instrucciones de Ejecución



**Descripción**:### Cómo Ejecutar las Tareas

Crear documentación interna del módulo (JSDoc, README del módulo, etc.).

**Paso 1: Clonar/Setup**

**Archivos Afectados**:```bash

- Crear: `src/modules/recuperacion/README.md` (si aplica)cd /Union/specs/005-inspiraciones-recuperacion-contrasena

- Documentar: JSDoc en archivos públicos```



**Criterios de Aceptación**:**Paso 2: Ejecutar por Fase**

- [ ] Funciones públicas tienen JSDoc```bash

- [ ] Tipos complejos documentados# Fase 1

- [ ] README de módulo creado (o actualizado)T001, T002, T003, T004, T005, T006, T007

- [ ] Ejemplos de uso incluidos

- [ ] Dependencias documentadas# Fase 2

- [ ] Known issues listados (si hay)T008, T009, T010, T011, T012, T013



**Tests Esperados**:# Fase 3

- N/A (documentación)T014, T015, T016, T017, T018, T019, T020, T021, T022



**Ref Spec**: plan.md § 6 Criterios de Aceptación (Documentación)# Fase 4

T023, T024, T025, T026, T027

---

# Fase 5

## T042: Crear Checklist Final de IntegraciónT028, T029, T030, T031, T032



**Fase**: 10 — Revisión Final  # Fase 6

**Prioridad**: P1  T033, T034, T035, T036, T037, T038, T039, T040

**Paralelizable**: [P] No  ```

**Estimación**: 1 hora  

**Paso 3: Verificar Completitud**

**Descripción**:```bash

Ejecutar checklist final verificando que todo funciona integrado.# Después de cada tarea

npm run test

**Archivos Afectados**:npm run lint

- Crear: `INTEGRATION-CHECKLIST-008.md` (documento de verificación)npm run build



**Criterios de Aceptación**:# Después de cada fase

- [ ] Checkitem: LoginPage → link a recuperación visiblenpm run test -- tests/ --coverage

- [ ] Checkitem: Click en link → navega a `/recuperar-contrasena````

- [ ] Checkitem: Formulario carga correctamente

- [ ] Checkitem: Validación en blur funciona---

- [ ] Checkitem: Validación en submit funciona

- [ ] Checkitem: Casos borde funcionan**Estado**: Tasks 100% definidas  

- [ ] Checkitem: Estados de carga visibles**Versión**: 1.0  

- [ ] Checkitem: Transición a confirmación funciona**Fecha**: 2026-10-20  

- [ ] Checkitem: Mensaje neutral visible**Total Tasks**: 40 (T001-T040)  

- [ ] Checkitem: Regreso a login funciona**Estimación**: 12-18 días  

- [ ] Checkitem: Formulario limpio al regresar

- [ ] Checkitem: Tests pasan (230+)✅ **ESPECIFICACIÓN 005 COMPLETA - LISTA PARA IMPLEMENTACIÓN**

- [ ] Checkitem: Cobertura >= 80%
- [ ] Checkitem: TypeScript OK
- [ ] Checkitem: ESLint OK
- [ ] Checkitem: Build OK
- [ ] Checkitem: Performance OK
- [ ] Checkitem: Accesibilidad OK
- [ ] Checkitem: Responsive OK
- [ ] Checkitem: No regresión en 006

**Tests Esperados**:
- 20 items verificados
- 0 items fallidos

**Ref Spec**: ESTADO-FINAL.md § ✅ Conclusión

---

## T043: Code Review y Aprobación

**Fase**: 10 — Revisión Final  
**Prioridad**: P1  
**Paralelizable**: [P] No  
**Estimación**: 2 horas  

**Descripción**:
Realizar code review con equipo y obtener aprobaciones.

**Archivos Afectados**:
- Todos los archivos del módulo 008

**Criterios de Aceptación**:
- [ ] Lead Developer: Review completo ✓
- [ ] Tech Lead: Architecture review ✓
- [ ] QA: Tests review ✓
- [ ] Ningún cambio requerido (o menor/documentado)
- [ ] Aprobación explícita de merge

**Tests Esperados**:
- N/A (revisión manual)

**Ref Spec**: plan.md § 10 Entrega Final (Sign-Off)

---

## T044: Merge a Rama Principal

**Fase**: 10 — Revisión Final  
**Prioridad**: P1  
**Paralelizable**: [P] No  
**Estimación**: 0.5 horas  

**Descripción**:
Mergear módulo 008 a rama principal (main/develop).

**Archivos Afectados**:
- Rama: 008-inspiraciones-recuperacion-contrasena → main/develop

**Criterios de Aceptación**:
- [ ] Merge sin conflictos
- [ ] Tests CI/CD pasan
- [ ] Checks pre-merge pasan
- [ ] Commit message claro
- [ ] PR/MR cerrado

**Tests Esperados**:
- Build CI/CD pasa
- Tests CI/CD pasan
- Merge limpio

**Ref Spec**: Git workflow estándar

---

## T045: Deploy a Staging (Opcional)

**Fase**: 10 — Revisión Final  
**Prioridad**: P2  
**Paralelizable**: [P] No  
**Estimación**: 1 hora  

**Descripción**:
Deploy del módulo 008 a environment de staging para validación final.

**Archivos Afectados**:
- Deploy: Staging environment

**Criterios de Aceptación**:
- [ ] Deploy exitoso
- [ ] Módulo 008 funciona en staging
- [ ] No hay errores en logs
- [ ] QA final aprueba
- [ ] Listo para producción

**Tests Esperados**:
- Smoke tests pasan en staging
- Sin errores runtime
- Performance OK en staging

**Ref Spec**: Opcional, depende del workflow

---

# Resumen de Tasks

## Por Fase

| Fase | Tareas | Prioridad | Paralelizables |
|------|--------|-----------|-----------------|
| 1. Setup | T001-T004 | P1 | 2 |
| 2. Modelo | T005-T009 | P1 | 4 |
| 3. Componentes | T010-T013 | P1 | 3 |
| 4. Acceso | T014-T015 | P1 | 1 |
| 5. Formulario | T016-T018 | P1 | 2 |
| 6. Validaciones | T019-T023 | P1 | 3 |
| 7. Confirmación | T024-T028 | P1 | 3 |
| 8. Navegación | T029-T032 | P1 | 3 |
| 9. Validación UI | T033-T036 | P1-P2 | 2 |
| 10. Revisión | T037-T045 | P1 | 2 |
| **TOTAL** | **T001-T045 (45 tareas)** | | **25 paralelizables** |

---

## Dependencias Principales

```
T001 (Setup) → T002, T003, T004
   ↓
T005-T009 (Modelo Domain)
   ↓
T016-T018 (Services/DTO)
   ↓
T019 (Hook)
   ↓
T020 (Integración)
   ↓
T024-T028 (Confirmación/Estados)
   ↓
T029-T032 (Navegación)
   ↓
T033-T036 (Validación UI)
   ↓
T037-T045 (Revisión Final)
```

---

## Criterios de Éxito Final

✅ **Código**:
- 230+ tests pasan
- Cobertura >= 80% (95% domain, 90% app, 85% presentation)
- 0 errores TypeScript
- 0 warnings ESLint
- Build exitoso

✅ **Funcionalidad**:
- Flujo recuperación funciona end-to-end
- Validación blur + submit
- Confirmación neutral
- Regreso a login funciona
- Datos limpios automáticamente

✅ **Calidad**:
- Accesibilidad WCAG 2.1 AA
- Responsive (mobile, tablet, desktop)
- Performance Lighthouse >= 90
- Sin regresión en módulo 006

✅ **Documentación**:
- JSDoc completo
- README module
- Checklist integración
- Code review aprobado

✅ **Integración**:
- Mergeable sin conflictos
- CI/CD pasa
- Pronto para producción

---

**Estado**: Tasks 100% definidas  
**Versión**: 1.0  
**Fecha**: 2026-10-20  
**Total**: 45 tareas específicas, sin código  
**Próximo**: Iniciar Fase 1 — Setup e Integración
