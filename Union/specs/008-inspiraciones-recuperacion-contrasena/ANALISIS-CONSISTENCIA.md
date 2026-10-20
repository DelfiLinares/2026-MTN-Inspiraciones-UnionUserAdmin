# Análisis de Consistencia — Módulo 008

**Versión**: 1.0  
**Fecha**: 2026-10-20  
**Módulo**: 008 Recuperación de Contraseña  
**Alcance del análisis**: Consistencia entre 7 documentos principales  

---

## 🎯 Resumen Ejecutivo

**ESTADO**: ⚠️ **INCONSISTENCIAS CRÍTICAS DETECTADAS**

Se encontraron **9 inconsistencias graves** que deben resolverse antes de proceder a implementación:

1. ❌ **Versión/Número de módulo confuso** — Documentos mezclan "005" y "008"
2. ❌ **plan.md tiene contenido duplicado/corrupto** — Texto superpuesto
3. ❌ **data-model.md tiene estructura parcial** — Clases incompletas
4. ❌ **tasks.md tiene contenido duplicado/corrupto** — Múltiples versiones superpuestas
5. ❌ **Inconsistencia en nombres de entidades** — Mix de CorreoElectronico/Email, SolicitudRecuperacion/RecoveryForm
6. ⚠️ **openapi.yaml es reference-only pero no está claramente vinculado a tasks.md**
7. ⚠️ **Falta trazabilidad explícita entre RF y tareas**
8. ⚠️ **quickstart.md tiene estructura incompleta**
9. ⚠️ **Algunos RNF no tienen tareas asociadas**

---

## ✅ Hallazgos Positivos

Antes del análisis de problemas, lo que SÍ está bien:

✅ **spec.md**: Completo, coherente, bien estructurado (8 HU, 16 RF, 11 RNF, 13 CB, 10 ambigüedades)  
✅ **clarifications.md**: Todas las 10 ambigüedades resueltas (según referencia en AMBIGÜEDADES-VALIDADAS.md)  
✅ **research.md**: Justificaciones técnicas claras  
✅ **Alcance frontend**: Correctamente limitado a frontend-only  
✅ **Matriz de trazabilidad en spec.md**: Bien definida  
✅ **Estándares de calidad**: Metas claras (230+ tests, >= 80% cobertura)  

---

## 🔴 PROBLEMA CRÍTICO #1: Número de Módulo Confuso

### Síntoma
- spec.md dice: "**Módulo**: 005 Recuperación de Cuenta y Contraseña"
- Directorio es: `008-inspiraciones-recuperacion-contrasena`
- plan.md dice ambos ("008" en header, "005" en cuerpo)
- tasks.md dice: "**Módulo**: 005" y "**Módulo**: 008"

### Impacto
- **ALTO**: Confusión en identificación del módulo
- **Bloquea**: Comprensión clara de scope e integración

### Corrección Requerida

**En spec.md:**
```markdown
# Especificación — 008 Recuperación de Contraseña

**Módulo**: 008 Recuperación de Cuenta y Contraseña
```

**En plan.md header:**
```markdown
# Plan de Implementación — 008 Recuperación de Contraseña

**Módulo**: 008 Recuperación de Cuenta y Contraseña
```

**En tasks.md:**
```markdown
# Tasks — 008 Recuperación de Contraseña

**Módulo**: 008 Recuperación de Contraseña
```

---

## 🔴 PROBLEMA CRÍTICO #2: plan.md Tiene Contenido Duplicado/Corrupto

### Síntoma
plan.md líneas 1-50 contienen:
```
# Plan de Implementación — 008 Recuperación de Contraseña
# Plan de Implementación — 008 Recuperación de Contraseña

**Versión**: 1.0  
**Versión**: 1.0  

**Estado**: ✅ Plan Completo  
**Estado**: ✅ Plan Completo  
```

Línea 26: `Este documento define...la construcción del módulo 005 (Recuperación de Contraseña).`

Estructuras duplicadas: "Visión general", "Arquitectura en 3 capas", carpetas, fases (todo repetido)

### Impacto
- **CRÍTICO**: El archivo está corrupto
- **Bloquea**: Lectura clara del plan
- **Confunde**: Estructura y contenido

### Corrección Requerida

**plan.md necesita ser REGENERADO completamente:**
- Eliminar todas las duplicaciones
- Mantener solo la estructura válida más reciente
- Verificar módulo "008" en todo el documento
- Asegurar que las 6 fases están claras (sin duplicación)

---

## 🔴 PROBLEMA CRÍTICO #3: data-model.md Tiene Estructura Parcial/Corrupta

### Síntoma
Desde línea ~600, las definiciones de clases están incompletas:

```typescript
class SolicitudRecuperacion {
  private readonly correo: string;
  private readonly tocado: boolean;
  private readonly errores: Map<string, string>;

  constructor(correo?: string, tocado?: boolean) {
    this.correo = correo || '';
    this.tocado = tocado || false;
    this.errores = new Map();
  }

  establecerCorreo(correo: string): SolicitudRecuperacion {
    const nueva = new SolicitudRecuperacion(correo, this.tocado);
    nueva.errores = new Map(this.errores);
    return nueva;
  }
  // ... SE CORTA AQÍ SIN CERRAR LA CLASE
```

Al final, no hay cierre de clase ni definiciones completas de:
- `RecoverySubmitDTO`
- `RecoverySubmitDTOBuilder`
- `RecoveryFormFactory`
- `RecoveryFormService`

### Impacto
- **ALTO**: Modelos de datos incompletos
- **Bloquea**: Desarrollo de domain layer
- **Requiere**: Regeneración de secciones

### Corrección Requerida

data-model.md necesita:
1. Cierre completo de todas las clases en Domain Layer
2. Definiciones completas de Application Layer (DTOs, Factories, Services)
3. Definiciones completas de Presentation Layer (Types, Hooks, Components)
4. Verificar que todos los archivos referenciados en tasks.md estén documentados

---

## 🔴 PROBLEMA CRÍTICO #4: tasks.md Tiene Contenido Duplicado/Corrupto

### Síntoma
tasks.md contiene dos versiones superpuestas:

**Versión Antigua** (detectada en líneas iniciales):
```
# Tasks — 005 Recuperación de Contraseña
**Versión**: 1.0  
**Estado**: ✅ Tasks Completas  
**Módulo**: 005 Recuperación de Cuenta y Contraseña  
```

**Versión Nueva** (que debería ser la única):
```
# Tasks — 008 Recuperación de Contraseña
**Versión**: 1.0  
**Estado**: ✅ Tasks Reorganizadas por Fases  
**Módulo**: 008 Recuperación de Contraseña  
**Total Tasks**: T001-T050 (50 tareas)  
```

El archivo tiene **estructuras duplicadas**:
- "Propósito" duplicado
- "Estructura de Cada Tarea" duplicado
- Definiciones de T001-T022 aparecen dos veces
- Mezcla de "45 tareas" vs "50 tareas"

### Impacto
- **CRÍTICO**: Tareas mal definidas
- **Confunde**: Conteo y estructura
- **Bloquea**: Implementación clara

### Corrección Requerida

**tasks.md debe ser limpiado:**
1. Remover todas las versiones antiguas
2. Mantener SOLO la versión 008 completa (45 tareas como fue generada)
3. Verificar que:
   - T001-T045 están definidas una sola vez
   - No hay duplicaciones
   - Número de tareas es consistente

---

## ⚠️ PROBLEMA #5: Inconsistencia en Nombres de Entidades

### Síntoma

spec.md, research.md y plan.md usan: `CorreoElectronico`, `EstadoFormularioRecuperacion`, `SolicitudRecuperacion`

Pero data-model.md y tasks.md introducen: `Email`, `RecoveryState`, `RecoveryForm`

Ejemplo:
```
spec.md: "CorreoElectronico VO (validación regex)"
data-model.md: "Email - Value Object que encapsula la validación"

spec.md: "SolicitudRecuperacion Entity"
data-model.md: "RecoveryForm.ts"
```

### Impacto
- **MEDIO**: Confusión en naming
- **Afecta**: Comunicación entre documentos
- **Requiere**: Alineación

### Corrección Requerida

**Decisión requerida**: ¿Usar nombres en español o inglés?

**Recomendación**: Mantener español (coherente con spec.md y módulo 006)

**Cambios necesarios en data-model.md y tasks.md:**
- `Email` → `CorreoElectronico`
- `RecoveryState` → `EstadoFormularioRecuperacion`
- `RecoveryForm` → `SolicitudRecuperacion`
- `EmailValidator` → `ValidadorCorreoElectronico`
- `RecoveryFormService` → `ServicioFormularioRecuperacion`
- etc.

---

## ⚠️ PROBLEMA #6: openapi.yaml No Está Vinculado a tasks.md

### Síntoma

openapi.yaml documenta dos endpoints:
- POST `/recuperacion/solicitar`
- POST `/recuperacion/verificar/{token}`

Pero **NO hay tareas en tasks.md para implementar estos endpoints** (correcto, pues es frontend-only).

Sin embargo, falta **claridad explícita** sobre:
1. ¿Cuándo se implementarán estos endpoints? (Módulo posterior)
2. ¿Qué preparación hace el frontend en módulo 008? (Simulación local)
3. ¿Cómo se integrarán en el futuro?

### Impacto
- **BAJO-MEDIO**: Claridad de scope futuro
- **No bloquea**: Implementación actual
- **Requiere**: Documentación en plan.md

### Corrección Requerida

En **plan.md**, sección "Restricciones" o "Extensibilidad Futura":

```markdown
### Integración Backend Futura

**Módulo 008 (Actual)**: 
- Frontend-only
- Simulación local con setTimeout 750ms
- NO implementar endpoints

**Módulo Posterior** (909 o similar):
- Implementar endpoints de openapi.yaml
- POST /recuperacion/solicitar → persistencia
- POST /recuperacion/verificar/{token} → cambio de contraseña
- Reemplazar simulación con API real

**Preparación en Módulo 008**:
- Estructura DTOs (RecoverySubmitDTO)
- Servicio preparado para inyección de API
- Sin cambios en componentes necesarios
```

---

## ⚠️ PROBLEMA #7: Falta Trazabilidad Explícita RF → Tasks

### Síntoma

spec.md define 16 RF (RF-001 a RF-016):
```
RF-001: Enlace de Recuperación en Login
RF-002: Pantalla de Recuperación Renderizada
RF-003: Campo de Correo Aceptar Entrada
...
RF-016: Prevenir Envíos Repetidos Accidentales
```

Pero en **tasks.md no hay matriz que diga explícitamente:**
- "T004 implementa RF-001"
- "T011 implementa RF-002"
- etc.

Las tareas tienen "Ref Spec: spec.md RF-...", pero sin **mapeo 1:1 claro**.

### Impacto
- **MEDIO**: Difícil verificar que todos los RF tienen tareas
- **Requiere**: Análisis manual para confirmar cobertura

### Corrección Requerida

Agregar en tasks.md una **matriz de trazabilidad**:

```markdown
## Trazabilidad RF → Tasks

| RF | Descripción | Tasks Asociadas | Verificación |
|----|-------------|-----------------|-------------|
| RF-001 | Enlace en Login | T004 | ✓ |
| RF-002 | Pantalla de Recuperación | T010, T011, T012 | ✓ |
| RF-003 | Campo Aceptar Entrada | T011 | ✓ |
| RF-004 | Trimear Espacios | T019 (validación blur) | ✓ |
| RF-005 | Validar Campo Requerido | T019, T021 | ✓ |
| RF-006 | Validar Formato | T005, T019, T021 | ✓ |
| RF-007 | Mostrar Errores | T011, T012, T020, T021 | ✓ |
| RF-008 | Botón Habilitado/Deshabilitado | T020, T024 | ✓ |
| RF-009 | Navegar a Confirmación | T025 | ✓ |
| RF-010 | Mostrar Confirmación Neutral | T026 | ✓ |
| RF-011 | Opción Regresar desde Confirmación | T030 | ✓ |
| RF-012 | Opción Regresar en Formulario | T029 | ✓ |
| RF-013 | Limpiar Datos al Regresar | T031, T032 | ✓ |
| RF-014 | Responsive Design | T033 | ✓ |
| RF-015 | Coherencia Visual | T024, T025 | ✓ |
| RF-016 | Prevenir Envíos Repetidos | T024 (spinner), T027 | ✓ |
```

**Resultado**: ✅ **TODOS los 16 RF tienen tareas asociadas**

---

## ⚠️ PROBLEMA #8: RNF sin Tareas Explícitas

### Síntoma

spec.md define 11 RNF (RNF-001 a RNF-011), pero no todos tienen tareas explícitamente:

```
RNF-001: Validación en Frontend — T019, T021
RNF-002: No Revelar Existencia — T026
RNF-003: No Almacenar Datos Sensibles — (implícito en diseño)
RNF-004: Sin Backend/API/Correos — (restricción de alcance)
RNF-005: Interfaz Intuitiva — T033
RNF-006: Performance: Navegación Rápida — T023 (routing)
RNF-007: Validación Sincrónica — T019
RNF-008: Testing — T037
RNF-009: Separación Responsabilidades — (arq DDD)
RNF-010: Responsive Design — T033
RNF-011: Sin Código en Especificación — (meta-restricción)
```

Algunos RNF son **restricciones de arquitectura** (RNF-009, RNF-011), no "tareas" explícitas.

### Impacto
- **BAJO**: Estos RNF son validados por diseño, no por tareas
- **Requiere**: Clarificación

### Corrección Requerida

Agregar en tasks.md una **sección de Restricciones Verificadas**:

```markdown
## Requisitos No Funcionales — Validación por Diseño

| RNF | Validación | Método |
|-----|-----------|--------|
| RNF-003 | No almacenar datos sensibles | Diseño: useState local, sin localStorage |
| RNF-004 | Sin backend/API | Restricción: 0 fetch/axios, solo setTimeout |
| RNF-009 | Separación responsabilidades | Arq: DDD 3 capas (domain puro) |
| RNF-011 | Sin código en specs | Proceso: spec.md, plan.md, tasks.md = solo .md |

**Verificación en T037 (Tests)**: Confirmar estas restricciones con assertions.
```

---

## ⚠️ PROBLEMA #9: quickstart.md Tiene Estructura Incompleta

### Síntoma

quickstart.md menciona:

```markdown
## 🔄 Flujo de Usuarios

### Caso Exitoso

```
1. Usuario ve form vacío (reposo)
   ↓
2. Digita correo (sin validación)
   ↓
...
8. Click "Regresar" → vuelve a /login
```

Pero el documento se corta sin completar:
- Casos de error
- Flujo de navegación
- Ejemplo de integración
- Debugging tips

### Impacto
- **BAJO**: Documento incompleto pero funcional
- **Requiere**: Completar secciones

### Corrección Requerida

quickstart.md necesita:

1. **Sección de Casos de Error**:
```markdown
### Caso: Usuario Ingresa Email Inválido

```
1. Usuario digita "usuario"
2. Click "Continuar"
3. Aparece error: "Ingresa un correo válido"
4. Botón deshabilitado
5. Usuario corrige a "usuario@dominio.com"
6. Error desaparece, botón habilitado
7. Click "Continuar" → confirmación
```
```

2. **Flujo de Navegación Completo**:
```markdown
### Mapeo de Rutas

| Ruta | Componente | Requerimientos |
|------|-----------|----------------|
| `/login` | LoginPage | Debe tener link "¿Olvidaste contraseña?" |
| `/recuperar-contrasena` | PaginaRecuperacion | Accesible sin autenticación |
| `/login` (regreso) | LoginPage | Formulario limpio |
```
```

---

## 📊 Matriz de Verificación — Antes de Continuar

Para confirmar que se han resuelto todos los problemas:

| # | Problema | Estado | Acción |
|---|----------|--------|--------|
| 1 | Módulo 005 vs 008 | ❌ REVISAR | Cambiar **008 en TODOS los documentos** |
| 2 | plan.md duplicado | ❌ REGENERAR | Limpiar y mantener estructura única |
| 3 | data-model.md incompleto | ❌ COMPLETAR | Cierre todas las clases y definiciones |
| 4 | tasks.md duplicado | ❌ LIMPIAR | Remover versión antigua, mantener 45 tareas |
| 5 | Nombres entidades inconsistentes | ⚠️ ALINEAR | Decidir: español o inglés → **Español** |
| 6 | openapi.yaml sin vinculación | ⚠️ DOCUMENTAR | Agregar sección "Extensibilidad Futura" en plan.md |
| 7 | Sin trazabilidad RF→Tasks | ⚠️ AGREGAR | Crear matriz en tasks.md |
| 8 | RNF sin tareas | ⚠️ ACLARAR | Distinguir restricciones vs tareas |
| 9 | quickstart.md incompleto | ⚠️ COMPLETAR | Agregar casos de error y flujos completos |

---

## ✅ Verificación de Alcance — Frontend-Only

Revisión de que **NO hay** tareas/requisitos fuera de scope:

```bash
# Búsquedas en spec.md y tasks.md para scope violations:

❌ ENCONTRADO: "backend" → 0 resultados (correcto)
❌ ENCONTRADO: "API REST" → 0 tareas (correcto)
❌ ENCONTRADO: "envío de correos" → 0 tareas (correcto)
❌ ENCONTRADO: "token de recuperación" → 0 tareas (correcto)
❌ ENCONTRADO: "cambio de contraseña" → 0 tareas (correcto)
❌ ENCONTRADO: "persistencia" → 0 tareas (correcto)
❌ ENCONTRADO: "base de datos" → 0 tareas (correcto)

✅ CORRECTO: Frontend-only 100%
```

---

## 🎯 Recomendación Final

### ANTES de pasar a `/speckit.taskstoissues`:

**Estado ACTUAL**: ❌ **NO APTO PARA CONTINUAR**

**Acciones Requeridas** (Por Orden de Prioridad):

### 🔴 CRÍTICAS (Bloquean Implementación):
1. **plan.md**: Limpiar contenido duplicado/corrupto
2. **tasks.md**: Limpiar contenido duplicado, verificar 45 tareas
3. **data-model.md**: Completar definiciones de clases

### ⚠️ IMPORTANTES (Mejoran Claridad):
4. **spec.md**: Cambiar "005" → "008" en todo
5. **Nombres de entidades**: Alinear a español en data-model.md y tasks.md
6. **tasks.md**: Agregar matriz RF → Tasks
7. **plan.md**: Agregar sección "Extensibilidad Futura" para openapi.yaml

### 📋 MENORES (Completan Documentación):
8. **quickstart.md**: Agregar casos de error y flujos completos
9. **Validación**: Ejecutar linters en archivos .md para sintaxis

---

## 📋 Checklist Post-Corrección

Después de resolver los problemas:

```bash
# Verificaciones antes de `/speckit.taskstoissues`:

[ ] spec.md: 0 referencias a "módulo 005"
[ ] plan.md: No hay duplicaciones, estructura única
[ ] data-model.md: Todas las clases están cerradas
[ ] tasks.md: 45 tareas únicas, sin duplicación
[ ] Nombres: Todos en español (CorreoElectronico, no Email)
[ ] Trazabilidad: Matriz RF→Tasks visible en tasks.md
[ ] openapi.yaml: Vinculado en plan.md como "futura"
[ ] quickstart.md: Casos de error y flujos completos
[ ] alcance: 0 referencias a backend/API/email real

→ Una vez completado: ✅ LISTO PARA taskstoissues
```

---

## 📞 Próximos Pasos

1. **Resolver problemas críticos** (plan.md, tasks.md, data-model.md)
2. **Alinear nombres de entidades** a español
3. **Validar sintaxis** de archivos .md
4. **Re-ejecutar análisis** después de correcciones
5. **Ejecutar `/speckit.taskstoissues`** cuando estado sea ✅

---

**Análisis completado**: 2026-10-20  
**Versión**: 1.0  
**Siguiente acción**: Resolver problemas críticos listados arriba
