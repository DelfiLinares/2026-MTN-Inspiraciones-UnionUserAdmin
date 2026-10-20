# Research — 008 Recuperación de Contraseña

**Versión**: 1.0  
**Estado**: ✅ Investigación Completa  
**Fecha**: 2026-10-20  
**Módulo**: 008 Recuperación de Cuenta y Contraseña  

---

## Propósito

Este documento compila investigación, referencias y decisiones técnicas basadas en la especificación del módulo 008 (spec.md).

---

## 1. Contexto de Investigación

### 1.1 Especificación de Referencia
**Fuente**: `/Union/specs/008-inspiraciones-recuperacion-contrasena/spec.md`

**Elementos clave de spec.md**:
- 8 Historias de Usuario (HU-001 a HU-008)
- 16 Requisitos Funcionales (RF-001 a RF-016)
- 11 Requisitos No Funcionales (RNF-001 a RNF-011)
- 13 Casos Borde (CB-001 a CB-013)
- 10 Ambigüedades Resueltas (A-001 a A-010)

**Estado de clarificaciones**: ✅ COMPLETAMENTE RESUELTAS EN clarifications.md

---

## 2. Análisis de Arquitectura

### 2.1 Patrón DDD (Domain-Driven Design)

**Justificación**:
- Módulo 006 (Cuestionario) ya utiliza DDD
- Consistencia en la codebase Union
- Separación clara de capas: Domain → Application → Presentation
- Testabilidad mejorada

**Capas esperadas**:
```
┌─────────────────────────────────┐
│  Presentation (React)           │  Componentes, Hooks, Pages
│  RecoveryPage, RecoveryForm    │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  Application (Orquestación)     │  Servicios, DTOs, Factories
│  RecoveryFormService            │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  Domain (Lógica de Negocio)     │  Entities, Value Objects, Services
│  RecoveryForm, Email, Validator │
└─────────────────────────────────┘
```

### 2.2 Modelo de Datos - Value Objects

**Email** (Value Object)
- Encapsula validación de correos
- Immutable
- Regex pragmático: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (de clarifications.md A-009)
- Trimea automáticamente
- Lanza excepción si es inválido

**EstadoFormularioRecuperacion** (Enum/Value Object)
- Estados: idle, loading, success, error
- No persiste entre sesiones
- Usado para UI state management

### 2.3 Modelo de Datos - Entidades

**SolicitudRecuperacion** (Entity)
- Representa formulario local (NO requiere backend)
- Propiedades:
  - email: string
  - touched: boolean (para mostrar/ocultar errores)
  - errors: Map<string, string>
- Métodos: setEmail(), addError(), clearErrors(), reset()
- Immutable (cada cambio retorna nueva instancia)

**Decisión**: No crear modelos de backend (tokens, códigos, etc.)

---

## 3. Stack Tecnológico - Decisiones

### 3.1 Frontend

**React** (18.3.1+)
- Ya en uso en módulo 006
- Hooks para gestión de estado local
- Context + Hooks (sin Zustand/Redux para MVP)

**TypeScript** (5.5.4+)
- Type safety
- Interfaces para componentes
- Generics para servicios

**React Router** (6+)
- Rutas: `/login` y `/recuperar-contrasena`
- Navegación sin recarga de página
- No requiere autenticación

**Vite** (5.4.2+)
- Build rápido
- Ya configurado en módulo 006

### 3.2 Testing

**Vitest** (2.1.9+)
- Tests unitarios (domain layer)
- Ya en uso en módulo 006

**React Testing Library** (16.0.0+)
- Tests de componentes
- Enfoque en comportamiento del usuario
- Accesibilidad (a11y)

**Target**: 220+ tests, >= 80% coverage

---

## 4. Decisiones Técnicas Importantes

### 4.1 Validación de Email

**Decisión**: Regex pragmático en frontend (sin API)

**Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Justificación**:
- Casos válidos: usuario@dominio.com, nombre.apellido@empresa.co.uk
- Casos rechazados: usuariodominio, usuario@dominio (sin punto), usuario@@dominio
- Balance entre validación y usabilidad
- RFC 5322 completo es demasiado complejo para frontend

**Casos de prueba** (de spec.md):
```
✓ usuario@dominio.com
✓ nombre.apellido@empresa.co.uk
✓ usuario+tag@dominio.com
✗ usuariodominio
✗ usuario@dominio (sin punto)
✗ usuario@@dominio
✗ usuario @dominio (espacio)
```

### 4.2 Mensajes de Validación

**Decisión**: Mensajes específicos por tipo de error

**Mensajes**:
1. Campo vacío: "El correo electrónico es requerido"
2. Formato inválido: "Ingresa un correo electrónico válido"

**Justificación**: Claridad para usuarios no técnicos

### 4.3 Timing de Validación

**Decisión**: Validación en blur + submit (estrategia mixta)

**Flujo**:
1. Usuario escribe (sin validación inmediata)
2. Usuario hace blur → se valida y muestra errores
3. Usuario retoma edición → se limpian errores
4. Usuario hace submit → se valida nuevamente

**Justificación**: Reduce frustración mientras se escribe

### 4.4 Estado de Carga Simulado

**Decisión**: Simulación 750ms con setTimeout

**Razón**: Preparar UI para integración futura sin API real

**Comportamiento**:
```
Click en "Continuar" 
  → Estado "loading" (750ms)
  → Mostrar spinner
  → Estado "success"
  → Mostrar confirmación
```

### 4.5 Privacidad: No Revelar Existencia de Cuenta

**Decisión**: Mensaje neutral idéntico para todos los correos

**Mensaje**: "Si el correo electrónico corresponde a una cuenta registrada, recibirás instrucciones..."

**Justificación**:
- Frontend no verifica contra BD
- No diferencia entre correo válido e inválido
- Seguridad y privacidad del usuario

### 4.6 Navegación e Integración

**Decisión**: Link directo en LoginPage

**Ubicación**: Abajo del formulario de login

**Texto**: "¿Olvidaste tu contraseña?"

**Rutas**:
- `/login` → `/recuperar-contrasena` (forward)
- `/recuperar-contrasena` → `/login` (back, con limpieza de datos)

---

## 5. Patrones y Prácticas

### 5.1 Immutability en Domain

**Patrón**: Cada cambio de estado retorna nueva instancia

**Ejemplo**:
```typescript
// ✗ NO (muta estado)
form.email = "nuevo@email.com";

// ✓ SÍ (retorna nueva instancia)
const newForm = form.setEmail("nuevo@email.com");
```

**Beneficios**: Traceabilidad, debugging, tests deterministicos

### 5.2 Separación de Capas

**Principio**: Cada capa tiene responsabilidades claras

**Domain**:
- Lógica pura de validación
- No depende de React
- Testeble sin framework

**Application**:
- Orquestación entre domain y presentation
- DTOs para transformación
- Factories para creación

**Presentation**:
- Componentes React
- Hooks para state management
- Sin lógica de negocio

### 5.3 Error Handling

**Estrategia**:
- Validadores retornan `{ isValid: boolean, error?: string }`
- Errores acumulables por campo en entity
- Presentación visual clara en componentes

---

## 6. Decisiones sobre Casos Borde (de spec.md)

### 6.1 Email Muy Largo
**Decisión**: Aceptar hasta ~255 caracteres (estándar HTTP)  
**Validación**: Regex lo valida si tiene formato correcto

### 6.2 Caracteres Especiales
**Decisión**: Aceptar +, -, . en usuario y dominio  
**Regex**: Ya los soporta

### 6.3 Mayúsculas/Minúsculas
**Decisión**: Aceptar ambos, normalizar a minúsculas internamente  
**Razón**: Emails son case-insensitive

### 6.4 Solo Espacios en Blanco
**Decisión**: Trimear automáticamente, tratar como vacío  
**Flujo**: Trimeo automático → validación de requerido → error

### 6.5 Click Repetido en Continuar
**Decisión**: Desabilitar botón durante loading  
**UI**: Mostrar spinner, texto "Procesando..."

### 6.6 Navegación Directa a Ruta
**Decisión**: Permitir (sin autenticación en MVP)  
**Razón**: Accesibilidad, usuario puede copiar URL

---

## 7. Trazabilidad con spec.md

### 7.1 Historias de Usuario

| HU | Título | Validación en Research |
|----|--------|----------------------|
| HU-001 | Acceder a Recuperación desde Login | Link directo en LoginPage ✓ |
| HU-002 | Ver Pantalla de Recuperación | Formulario con estructura definida ✓ |
| HU-003 | Ingresar Correo | Campo text, trim automático ✓ |
| HU-004 | Validar Formato | Regex pragmático, mensajes claros ✓ |
| HU-005 | Ver Errores | Mostrar bajo campo, color rojo ✓ |
| HU-006 | Continuar Validado | Botón habilitado si válido ✓ |
| HU-007 | Ver Confirmación | Mensaje neutral, icono éxito ✓ |
| HU-008 | Regresar al Login | Link/botón siempre visible ✓ |

### 7.2 Requisitos Funcionales

| RF | Elemento | Implementación |
|----|----------|-----------------|
| RF-001 | Enlace en login | Link component (React Router) |
| RF-002 | Pantalla renderizada | RecoveryPage container |
| RF-003 | Campo acepta entrada | `<input type="text">` |
| RF-004 | Trimear espacios | onChange handler con .trim() |
| RF-005 | Validar requerido | Regex + isEmpty check |
| RF-006 | Validar formato | Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| RF-007 | Mostrar errores | Component ErrorMessage |
| RF-008 | Botón habilitado/deshabilitado | Condicional basado en validación |
| RF-009 | Navegar a confirmación | useNavigate() / setState |
| RF-010 | Confirmación neutral | Mensaje sin revelar cuenta |
| RF-011 | Opción regresar confirmación | Button con onClick |
| RF-012 | Opción regresar formulario | Button con onClick |
| RF-013 | Limpiar datos | Reset state en useEffect |
| RF-014 | Responsive | CSS media queries (3 breakpoints) |
| RF-015 | Coherencia visual | Estilos consistentes con login |
| RF-016 | Prevenir envíos repetidos | Deshabilitar botón durante loading |

### 7.3 Requisitos No Funcionales

| RNF | Aspecto | Decisión |
|-----|--------|----------|
| RNF-001 | Validación frontend | Regex + EmailValidator service |
| RNF-002 | No revelar cuenta | Mensaje identical para todos |
| RNF-003 | No almacenar sensible | State local, sin persistencia |
| RNF-004 | Sin backend/API | Frontend-only MVP |
| RNF-005 | Interfaz intuitiva | Labels claras, flujo lógico |
| RNF-006 | Performance rápida | Validación < 10ms, navegación instantánea |
| RNF-007 | Validación sincrónica | Sin async en validación |
| RNF-008 | Testing validaciones | 220+ tests, >= 80% coverage |
| RNF-009 | Separación de capas | DDD: Domain/App/Presentation |
| RNF-010 | Responsive design | Mobile/tablet/desktop |
| RNF-011 | Sin código en especificación | Solo .md hasta plan.md ✓ |

---

## 8. Comparación con Módulo 006

### 8.1 Similitudes

**Stack técnico idéntico**:
- React 18.3.1
- TypeScript 5.5.4
- Vitest 2.1.9
- React Testing Library 16.0.0
- React Router v6+
- Vite 5.4.2

**Patrón arquitectónico**:
- DDD con 3 capas
- Validadores independientes
- Entities immutables
- Tests exhaustivos

**Testing**: 220+ tests (similar a módulo 006)

### 8.2 Diferencias

| Aspecto | Módulo 006 | Módulo 008 |
|---------|-----------|-----------|
| Complejidad | Media (7 preguntas dinámicas) | Baja (1 campo validado) |
| Integración | Independiente | Con login existente |
| Navegación | Dentro de flujo | Entre pantallas |
| Persistencia | Respuestas guardadas | Sin persistencia |
| Estados | 7+ (por pregunta) | 4 (idle/loading/success/error) |

### 8.3 Reutilización de Código

**Posible reutilizar**:
- Estructura de tests
- Patrones de validación
- Componentes de error (potencialmente)
- Estilos base

**No reutilizable**:
- Lógica de cuestionario
- Respuestas/validación de preguntas
- Transformación de datos

---

## 9. Decisiones sobre Ambigüedades Resueltas

**Todas las 10 ambigüedades de spec.md fueron resueltas en clarifications.md**:

- ✅ A-001: Regex sin punto en dominio
- ✅ A-002: Validación blur + submit
- ✅ A-003: Ruta `/recuperar-contrasena`
- ✅ A-004: Estilos error (borde rojo)
- ✅ A-005: Mensaje neutral exacto
- ✅ A-006: Button secundario
- ✅ A-007: Limpieza automática datos
- ✅ A-008: Integración con login
- ✅ A-009: Regex pragmático
- ✅ A-010: Spinner 750ms

**Implementación de research.md**:
- Valida cada decisión
- Explica justificación
- Referencia casos borde

---

## 10. Recomendaciones Técnicas

### 10.1 Para Development

1. **Empezar por Domain Layer**
   - Implementar Value Objects primero
   - Validadores sin dependencias
   - Tests para casos borde

2. **Luego Application Layer**
   - Servicios orquestadores
   - DTOs y factories
   - Integración con domain

3. **Finalmente Presentation**
   - Componentes prop-driven
   - Hooks de state
   - Integración con router

### 10.2 Para Testing

1. **Domain Layer**: 50+ tests (95% coverage)
2. **Application Layer**: 30+ tests (90% coverage)
3. **Presentation Layer**: 80+ tests (80% coverage)
4. **Integration/E2E**: 60+ tests (flujos completos)

**Total**: 220+ tests, >= 80% overall coverage

### 10.3 Para Performance

- Validación debe ser < 10ms
- Navegación instantánea (< 100ms)
- No debe haber re-renders innecesarios
- CSS sin animations costosas

---

## 11. Riesgos Identificados y Mitigación

### 11.1 Riesgo: Complejidad de Integración con Login

**Impacto**: Alto  
**Probabilidad**: Media  
**Mitigación**: 
- Analizar código existente de login previo
- Tests de integración específicos
- No modificar lógica existente del login

### 11.2 Riesgo: Regresiones en Módulo 006

**Impacto**: Alto  
**Probabilidad**: Baja  
**Mitigación**:
- Módulos completamente separados
- Tests independientes
- No compartir lógica de dominio

### 11.3 Riesgo: Scope Creep (backend)

**Impacto**: Crítico  
**Probabilidad**: Media  
**Mitigación**:
- Adherer estrictamente a spec.md
- No implementar "por si acaso" funcionalidades
- Mensajes y architecture preparados pero no implementados

### 11.4 Riesgo: Accesibilidad

**Impacto**: Medio  
**Probabilidad**: Media  
**Mitigación**:
- Tests de a11y desde el inicio
- Labels vinculados
- ARIA attributes correctos
- Navegación con teclado

---

## 12. Referencias y Recursos

### 12.1 Documentos Relacionados

- `/Union/specs/008-inspiraciones-recuperacion-contrasena/spec.md` - Especificación completa
- `/Union/specs/008-inspiraciones-recuperacion-contrasena/clarifications.md` - Ambigüedades resueltas
- `/Union/specs/008-inspiraciones-recuperacion-contrasena/data-model.md` - Modelo de datos
- `/Union/specs/006-inspiraciones-cuestionario/tasks.md` - Referencia de estructura

### 12.2 RFC y Standards

- **RFC 5322**: Email format (demasiado complejo, usamos pragmático)
- **WCAG 2.1 AA**: Accesibilidad web
- **DDD by Eric Evans**: Domain-Driven Design pattern

### 12.3 Herramientas

- **Vitest**: https://vitest.dev/
- **React Testing Library**: https://testing-library.com/react
- **React Router**: https://reactrouter.com/

---

## 13. Conclusiones de Research

**Viabilidad**: ✅ ALTA
- Stack conocido (módulo 006)
- Complejidad baja (1 campo)
- Especificación clara y completa
- Arquitectura probada (DDD)

**Timeline**: ✅ 12-18 días (similar módulo 006)

**Riesgos**: ⚠️ MANEJABLES
- Integración con login (mitigable)
- Scope creep (mitigable con spec.md)

**Recomendación**: ✅ PROCEDER A plan.md

---

**Estado**: Research 100% completa  
**Versión**: 1.0  
**Fecha**: 2026-10-20  
**Próximo paso**: Crear plan.md, data-model.md, contracts/openapi.yaml, quickstart.md
