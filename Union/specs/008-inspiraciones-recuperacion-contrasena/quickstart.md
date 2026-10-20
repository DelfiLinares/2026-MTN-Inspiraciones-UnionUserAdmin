# Quick Start — 008 Recuperación de Contraseña

**Versión**: 1.0  
**Estado**: ✅ Guía de Inicio Rápido  
**Fecha**: 2026-10-20  
**Módulo**: 008 Recuperación de Cuenta y Contraseña  

---

## 🎯 Descripción General

Módulo frontend 100% funcional que implementa un flujo de recuperación de contraseña. Usuario ingresa su correo, recibe confirmación neutral, sistema simula envío (750ms) sin backend real.

**Características principales**:
- ✅ Validación de email en blur + submit
- ✅ Mensajes de error específicos
- ✅ Confirmación neutral (igual para todos)
- ✅ Simulación local (sin API)
- ✅ 230+ tests con >= 80% cobertura
- ✅ Diseño responsive
- ✅ Accesibilidad integrada

---

## 📁 Estructura de Carpetas

```
Union/
├── frontend/
│   ├── src/
│   │   ├── domain/
│   │   │   ├── valueObjects/
│   │   │   │   ├── CorreoElectronico.ts
│   │   │   │   └── EstadoFormularioRecuperacion.ts
│   │   │   ├── entities/
│   │   │   │   └── SolicitudRecuperacion.ts
│   │   │   └── services/
│   │   │       └── ValidadorCorreoElectronico.ts
│   │   │
│   │   ├── application/
│   │   │   ├── services/
│   │   │   │   └── ServicioFormularioRecuperacion.ts
│   │   │   ├── dtos/
│   │   │   │   └── DTOFormularioRecuperacion.ts
│   │   │   └── factories/
│   │   │       └── FabricaSolicitudRecuperacion.ts
│   │   │
│   │   └── presentation/
│   │       ├── pages/
│   │       │   └── recuperar-contrasena/
│   │       │       └── PaginaRecuperacion.tsx
│   │       │
│   │       ├── components/
│   │       │   ├── formulario/
│   │       │   │   ├── FormularioRecuperacion.tsx
│   │       │   │   └── FormularioRecuperacion.test.tsx
│   │       │   └── confirmacion/
│   │       │       ├── ConfirmacionRecuperacion.tsx
│   │       │       └── ConfirmacionRecuperacion.test.tsx
│   │       │
│   │       └── hooks/
│   │           ├── useFormularioRecuperacion.ts
│   │           └── useFormularioRecuperacion.test.ts
│   │
│   └── tests/
│       ├── domain/
│       │   ├── valueObjects/
│       │   ├── entities/
│       │   └── services/
│       ├── application/
│       │   ├── services/
│       │   ├── factories/
│       │   └── dtos/
│       └── integration/
│           └── flujo-recuperacion.test.ts
│
├── specs/
│   └── 008-inspiraciones-recuperacion-contrasena/
│       ├── constitution.md      ✅ Principios del módulo
│       ├── spec.md             ✅ Especificación completa
│       ├── clarifications.md   ✅ Resolución de ambigüedades
│       ├── data-model.md       ✅ Modelo de datos (este documento)
│       ├── plan.md             ✅ Plan de implementación
│       ├── tasks.md            ✅ 40 tareas T001-T040
│       ├── research.md         ✅ Investigación técnica
│       ├── quickstart.md       ✅ Este archivo
│       └── contracts/
│           └── openapi.yaml    ✅ Referencia de APIs futuras
```

---

## 🚀 Instalación y Setup

### Requisitos Previos

```bash
Node.js >= 18.0.0
npm >= 9.0.0 o pnpm >= 8.0.0
```

### Pasos Iniciales

1. **Clonar repositorio** (ya existe)
```bash
cd /home/Alumno26.LINARES.PATARO.Delfina@ipm.edu.ar/2026-MTN-Inspiraciones-UnionUserAdmin
```

2. **Navegar a carpeta del frontend**
```bash
cd Union/frontend
```

3. **Instalar dependencias**
```bash
npm install
# o
pnpm install
```

4. **Verificar stack de pruebas**
```bash
npm run test --version
# Debería mostrar: vitest 2.1.9
```

---

## 📚 Documentos Clave

### Antes de Codificar

**Orden recomendado de lectura**:

1. **constitution.md** (2.8 kB, 10 min)
   - Principios fundamentales
   - Stack tecnológico
   - Historias de usuario resumidas

2. **spec.md** (9.2 kB, 20 min)
   - 8 Historias de Usuario detalladas
   - 16 Requisitos Funcionales
   - 11 Requisitos No Funcionales
   - 13 Casos Borde

3. **clarifications.md** (8.5 kB, 15 min)
   - 10 Ambigüedades resueltas
   - Decisiones técnicas documentadas
   - Validaciones explicadas

4. **data-model.md** (Este documento, 20 min)
   - Entidades y Value Objects
   - Servicios de dominio
   - Types y Interfaces

5. **research.md** (8.2 kB, 15 min)
   - Justificaciones técnicas
   - Análisis de módulos anteriores
   - Riesgos identificados

6. **plan.md** (Implementación, 15 min)
   - 6 Fases de desarrollo
   - Timeline estimado
   - Criterios de Done

7. **tasks.md** (40 tareas detalladas, 30 min)
   - T001-T010: Domain Layer (65 tests)
   - T011-T020: Application Layer (35 tests)
   - T021-T030: Presentation Layer (85 tests)
   - T031-T040: Testing & Refinement

---

## 🏗️ Arquitectura en 5 Minutos

### Domain Layer
```
CorreoElectronico (VO)
├─ Valida regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
├─ Trimea automáticamente
└─ Lanza error si es inválido

EstadoFormularioRecuperacion (VO)
├─ Estados: reposo, cargando, exito, error
└─ Factory methods para cada estado

SolicitudRecuperacion (Entity)
├─ Inmutable (cada cambio = nueva instancia)
├─ Mantiene: correo, tocado, errores
└─ Métodos: establecer*, obtener*, limpiar*

ValidadorCorreoElectronico (Service)
├─ validar() → {esValido, error?}
├─ esFormatoValido() → boolean
└─ Mensajes específicos por error
```

### Application Layer
```
ServicioFormularioRecuperacion (Orchestrator)
├─ validarCorreo()
├─ manejarCambioCorreo()
├─ manejarBlurCorreo()
└─ prepararParaEnvio()

DTOFormularioRecuperacion (Data Transfer)
└─ Mapeo entre domain ↔ presentation

FabricaSolicitudRecuperacion (Factory)
├─ crear()
├─ desdeCorreo()
├─ conError()
└─ reiniciar()
```

### Presentation Layer
```
useFormularioRecuperacion (Hook)
├─ Estado local: solicitud, estado
├─ Handlers: cambioCorreo, blurCorreo, envio, reinicio
└─ Retorna: correo, errorCorreo, tocado, estaCargando, esExito

FormularioRecuperacion (Component)
├─ Input email controlado
├─ Label accesible
├─ Error message si tocado + hay error
└─ Spinner cuando estaCargando

ConfirmacionRecuperacion (Component)
├─ Mensaje neutral
├─ Botón "Regresar al Login"
└─ No revela validez del email

PaginaRecuperacion (Container)
├─ Orquesta useFormularioRecuperacion
├─ Renderiza Form o Confirmacion
└─ Integra navegación (React Router)
```

---

## 🧪 Testing

### Ejecutar Todos los Tests

```bash
# Desarrollo (watch mode)
npm run test

# Una sola ejecución
npm run test run

# Con cobertura
npm run test -- --coverage

# Archivo específico
npm run test -- src/domain/valueObjects/CorreoElectronico.test.ts
```

### Cobertura Esperada

```
┌─────────────────────────────────────────────┐
│ Layer           │ Target │ Expected          │
├─────────────────────────────────────────────┤
│ Domain          │ 95%    │ ~65 tests + 95%   │
│ Application     │ 90%    │ ~35 tests + 90%   │
│ Presentation    │ 85%    │ ~130 tests + 85%  │
├─────────────────────────────────────────────┤
│ TOTAL           │ 80%    │ ~230+ tests ≥ 80% │
└─────────────────────────────────────────────┘
```

### Organización de Tests

```
tests/
├── domain/
│   ├── valueObjects/
│   │   ├── CorreoElectronico.test.ts (15 tests)
│   │   └── EstadoFormularioRecuperacion.test.ts (10 tests)
│   ├── entities/
│   │   └── SolicitudRecuperacion.test.ts (20 tests)
│   └── services/
│       └── ValidadorCorreoElectronico.test.ts (20 tests)
│
├── application/
│   ├── services/
│   │   └── ServicioFormularioRecuperacion.test.ts (25 tests)
│   ├── factories/
│   │   └── FabricaSolicitudRecuperacion.test.ts (5 tests)
│   └── dtos/
│       └── DTOFormularioRecuperacion.test.ts (5 tests)
│
└── integration/
    └── flujo-recuperacion.test.ts (35 tests)
        ├─ Flujo completo: usuario → validación → confirmación
        ├─ Casos borde
        ├─ Errores y recovery
        └─ Interacción de capas
```

---

## 🎨 Desarrollo Frontend

### Componentes Principales

**FormularioRecuperacion.tsx** (Presentacional)
```typescript
import { PropsFormularioRecuperacion } from '@/types/recuperacion';

export const FormularioRecuperacion = ({
  correo,
  errorCorreo,
  tocado,
  estaCargando,
  alCambiarCorreo,
  alBlurCorreo,
  alEnviar,
  alRegresar
}: PropsFormularioRecuperacion) => {
  // JSX puro, sin lógica de negocio
  // Input controlado, error conditional
  // Spinner durante carga
};
```

**ConfirmacionRecuperacion.tsx** (Presentacional)
```typescript
export const ConfirmacionRecuperacion = ({
  alRegresar
}: PropsConfirmacionRecuperacion) => {
  // Mensaje neutral (igual siempre)
  // Botón para regresar
  // Animación o ícono de éxito
};
```

**PaginaRecuperacion.tsx** (Container)
```typescript
export const PaginaRecuperacion = () => {
  const {
    correo, errorCorreo, tocado,
    estaCargando, esExito,
    manejarCambioCorreo, manejarBlurCorreo,
    manejarEnvio, manejarReinicio
  } = useFormularioRecuperacion();

  const navigate = useNavigate();

  if (esExito) {
    return <ConfirmacionRecuperacion alRegresar={() => navigate('/login')} />;
  }

  return <FormularioRecuperacion {...props} />;
};
```

### Validación en Tiempo Real

**Estrategia**: Blur + Submit (no onChange)

```typescript
// Campo vacío = sin validación
// onBlur = valida
// onChange = limpia errores si se edita
// onSubmit = valida y muestra errores
```

**Mensajes**:
1. Campo vacío: "El correo electrónico es requerido"
2. Formato inválido: "Ingresa un correo electrónico válido"

---

## 🔄 Flujo de Usuarios

### Caso Exitoso

```
1. Usuario ve form vacío (reposo)
   ↓
2. Digita correo (sin validación)
   ↓
3. Hace blur → Valida
   ├─ Si inválido: muestra error
   └─ Si válido: sin error
   ↓
4. Click "Recuperar"
   ↓
5. Estado cargando (spinner 750ms)
   ↓
6. Estado exito → renderiza confirmación
   ↓
7. Mensaje neutral mostrado
   ↓
8. Click "Regresar" → vuelve a /login
```

### Casos Borde (Ref: spec.md CB-*)

- CB-001: Email vacío → error requerido
- CB-002: Email sin punto → error formato
- CB-003: Email con spaces → trimea automáticamente
- CB-004: Email con MAYUSCULAS → normaliza
- CB-005: Múltiples @ → error formato
- CB-009: Usuario edita email con error → limpia error
- CB-010: Submit sin blur previo → valida en submit
- CB-011: Confirmación no revela validez → mensaje identical

---

## 📝 Ejemplo de Implementación

### 1. Crear Value Object (CorreoElectronico)

```typescript
// src/domain/valueObjects/CorreoElectronico.ts

class CorreoElectronico {
  private readonly valor: string;

  private constructor(email: string) {
    const trimado = email.trim();
    if (!this.esValido(trimado)) {
      throw new ErrorCorreoInvalido(`Correo inválido: ${email}`);
    }
    this.valor = trimado.toLowerCase();
  }

  private esValido(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  obtenerValor(): string {
    return this.valor;
  }

  static crear(email: string): CorreoElectronico {
    return new CorreoElectronico(email);
  }
}
```

### 2. Crear Test

```typescript
// tests/domain/valueObjects/CorreoElectronico.test.ts

import { describe, it, expect } from 'vitest';
import { CorreoElectronico } from '@/domain/valueObjects/CorreoElectronico';

describe('CorreoElectronico', () => {
  it('debe crear correo válido', () => {
    const correo = CorreoElectronico.crear('usuario@dominio.com');
    expect(correo.obtenerValor()).toBe('usuario@dominio.com');
  });

  it('debe trimear espacios', () => {
    const correo = CorreoElectronico.crear('  usuario@dominio.com  ');
    expect(correo.obtenerValor()).toBe('usuario@dominio.com');
  });

  it('debe normalizar a minúsculas', () => {
    const correo = CorreoElectronico.crear('USUARIO@DOMINIO.COM');
    expect(correo.obtenerValor()).toBe('usuario@dominio.com');
  });

  it('debe rechazar correo sin punto en dominio', () => {
    expect(() => CorreoElectronico.crear('usuario@dominio')).toThrow();
  });

  it('debe rechazar correo sin @', () => {
    expect(() => CorreoElectronico.crear('usuariodominio.com')).toThrow();
  });
});
```

### 3. Crear Hook (useFormularioRecuperacion)

```typescript
// src/presentation/hooks/useFormularioRecuperacion.ts

import { useState, useCallback } from 'react';
import { SolicitudRecuperacion } from '@/domain/entities/SolicitudRecuperacion';
import { EstadoFormularioRecuperacion } from '@/domain/valueObjects/EstadoFormularioRecuperacion';
import { ServicioFormularioRecuperacion } from '@/application/services/ServicioFormularioRecuperacion';
import { FabricaSolicitudRecuperacion } from '@/application/factories/FabricaSolicitudRecuperacion';

export const useFormularioRecuperacion = () => {
  const [solicitud, setSolicitud] = useState<SolicitudRecuperacion>(
    FabricaSolicitudRecuperacion.crear()
  );
  const [estado, setEstado] = useState<EstadoFormularioRecuperacion>(
    EstadoFormularioRecuperacion.reposo()
  );

  const servicio = ServicioFormularioRecuperacion.crear();

  const manejarCambioCorreo = useCallback((correo: string) => {
    setSolicitud(prev => servicio.manejarCambioCorreo(prev, correo));
  }, [servicio]);

  const manejarBlurCorreo = useCallback(() => {
    setSolicitud(prev => servicio.manejarBlurCorreo(prev));
  }, [servicio]);

  const manejarEnvio = useCallback(async () => {
    const { esValido, solicitud: validada } = servicio.prepararParaEnvio(solicitud);
    
    if (!esValido) {
      setSolicitud(validada);
      return;
    }

    // Simular carga
    setEstado(EstadoFormularioRecuperacion.cargando());
    await new Promise(resolve => setTimeout(resolve, 750));
    setEstado(EstadoFormularioRecuperacion.exito());
  }, [solicitud, servicio]);

  const manejarReinicio = useCallback(() => {
    setSolicitud(FabricaSolicitudRecuperacion.crear());
    setEstado(EstadoFormularioRecuperacion.reposo());
  }, []);

  return {
    correo: solicitud.obtenerCorreo(),
    errorCorreo: solicitud.obtenerError('correo'),
    tocado: solicitud.estaTocado(),
    estaCargando: estado.esCargando(),
    esExito: estado.esExito(),
    manejarCambioCorreo,
    manejarBlurCorreo,
    manejarEnvio,
    manejarReinicio
  };
};
```

---

## 🔗 Integración con Rutas

```typescript
// src/routes/AppRoutes.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from '@/presentation/pages/login/LoginPage';
import { PaginaRecuperacion } from '@/presentation/pages/recuperar-contrasena/PaginaRecuperacion';

export function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar-contrasena" element={<PaginaRecuperacion />} />
      </Routes>
    </Router>
  );
}
```

---

## 📊 Checklist de Implementación

### ✅ Fase 1: Domain Layer
- [ ] Crear CorreoElectronico VO
- [ ] Crear EstadoFormularioRecuperacion VO
- [ ] Crear SolicitudRecuperacion Entity
- [ ] Crear ValidadorCorreoElectronico Service
- [ ] Tests: ~65 tests, >= 95% coverage

### ✅ Fase 2: Application Layer
- [ ] Crear ServicioFormularioRecuperacion
- [ ] Crear DTOFormularioRecuperacion
- [ ] Crear FabricaSolicitudRecuperacion
- [ ] Tests: ~35 tests, >= 90% coverage

### ✅ Fase 3: Presentation Layer
- [ ] Crear FormularioRecuperacion Component
- [ ] Crear ConfirmacionRecuperacion Component
- [ ] Crear useFormularioRecuperacion Hook
- [ ] Crear PaginaRecuperacion Container
- [ ] Tests: ~85 tests, >= 85% coverage

### ✅ Fase 4: Integration & CSS
- [ ] Integrar rutas React Router
- [ ] CSS responsive (desktop, tablet, mobile)
- [ ] Animaciones y transiciones
- [ ] Accesibilidad (a11y)

### ✅ Fase 5: Testing & Coverage
- [ ] Tests de integración completa (~45 tests)
- [ ] Alcanzar >= 80% total coverage
- [ ] ~230+ total tests

### ✅ Fase 6: Refinement
- [ ] Linting (ESLint) pasando 100%
- [ ] TypeScript sin errores
- [ ] Performance checks
- [ ] Documentación completa
- [ ] Production-ready

---

## 🐛 Debugging

### Habilitar Logging

```typescript
// Agregar al hook o servicio
console.log('Estado actual:', estado);
console.log('Solicitud:', solicitud);
console.log('Errores:', solicitud.obtenerError('correo'));
```

### Usar React DevTools

1. Instalar React DevTools (navegador)
2. Ver estado del componente
3. Ver props en tiempo real
4. Debuggear hooks

### Tests Fallando

```bash
# Verbose mode
npm run test -- --reporter=verbose

# Debug específico
npm run test -- --reporter=verbose tests/domain/valueObjects/CorreoElectronico.test.ts

# Pausar ejecución (agregar debugger; en código)
npm run test -- --inspect-brk
```

---

## 📚 Recursos Adicionales

### Documentos del Módulo
- ✅ **constitution.md** - Principios y scope
- ✅ **spec.md** - Especificación completa
- ✅ **clarifications.md** - Ambigüedades resueltas
- ✅ **data-model.md** - Entidades y tipos
- ✅ **plan.md** - Plan de implementación
- ✅ **tasks.md** - 40 tareas detalladas
- ✅ **research.md** - Investigación técnica
- ✅ **openapi.yaml** - Referencia de APIs futuras

### Referencias Externas
- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router v6](https://reactrouter.com/)

### Módulos Anteriores
- **Módulo 006**: Cuestionario (misma arquitectura DDD)
- Consultar para patrones consistentes

---

## ⚡ Tips y Trucos

### Validation Timing
```
onChange: No
onBlur: Sí (mostrar error si tocado)
onSubmit: Sí (forzar validación)
```

### Immutability Pattern
```typescript
// ❌ Evitar
solicitud.correo = 'nuevo@correo.com';

// ✅ Hacer
const nuevaSolicitud = solicitud.establecerCorreo('nuevo@correo.com');
```

### State Management
```typescript
// Todas las capas viven en componente React
// No hay Redux/Context (MVP)
// Preparado para refactoring futuro
```

### Message Privacy
```typescript
// ❌ Malo
if (usuarioExiste) return "Usuario encontrado";
return "Usuario no encontrado";

// ✅ Bien
return "Se ha enviado un enlace de recuperación a tu correo";
// Mismo mensaje siempre
```

---

## 🎓 Módulos de Aprendizaje

1. **DDD Basics** (10 min) - Entiende layers
2. **Value Objects** (15 min) - Immutable, validated
3. **Entities** (15 min) - Identity, state
4. **Domain Services** (15 min) - Business logic
5. **React Hooks** (20 min) - State management
6. **Testing** (30 min) - Vitest + RTL
7. **Integration** (15 min) - Flujo completo

---

## 📞 Soporte

**Preguntas comunes**:
- ¿Por qué trimea el email? → Clarifications.md A-001
- ¿Por qué regex sin dot-less? → Clarifications.md A-009
- ¿Por qué validar en blur? → Clarifications.md A-002
- ¿Por qué 750ms? → Clarifications.md A-010
- ¿Por qué mensaje neutral? → Clarifications.md A-008

**Escalación**:
1. Revisar spec.md
2. Revisar clarifications.md
3. Revisar plan.md
4. Revisar research.md
5. Consultar con equipo

---

**Estado**: Guía 100% completa  
**Versión**: 1.0  
**Fecha**: 2026-10-20  
**Próximo**: Comenzar Fase 1 de implementación (Domain Layer)
