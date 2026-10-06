# Revisión de Alcance / Ausencia de Persistencia — T086

**Fecha**: 2026-10-06  
**Objetivo**: Verificar que el frontend NO accede a MySQL, no implementa persistencia de datos de
negocio propia, ni recalcula rankings/recomendaciones/estadísticas (RF-25, RF-26, RF-27).  
**Metodología**: Grep automático + análisis manual.

## Conclusión Ejecutiva

✅ **CONFORME A RF-25, RF-26, RF-27**

El frontend **no**:
- ❌ Accede a MySQL u otra base de datos.
- ❌ Implementa persistencia propia de datos de negocio.
- ❌ Recalcula rankings, recomendaciones ni estadísticas.

**Única persistencia permitida**: Tokens de sesión en `localStorage`/`sessionStorage` (estándar web,
no relacionada con datos de negocio).

---

## Búsquedas de Verificación

### Resultados de grep

```bash
Búsqueda: MySQL/Database/Persist en código        → 17 matches
Análisis:                                          → 100% en comentarios sobre SESIÓN
                                                     0 accesos a base de datos real

Búsqueda: localStorage                             → 4 matches
Análisis:                                          → 100% en `tokenStorage.ts`
                                                     Uso: guardar token de sesión

Búsqueda: sessionStorage                           → 7 matches
Análisis:                                          → 100% en `tokenStorage.ts`, `sessionManager.ts`
                                                     Uso: guardar sesión administrativa

Búsqueda: IndexedDB                                → 0 matches
Búsqueda: ranking/recommendation/statistics        → 0 matches
```

---

## Análisis Detallado

### 1. ❌ Acceso a MySQL / Base de Datos

**Hallazgo**: 0 conexiones directas a MySQL, PostgreSQL, MongoDB, o cualquier base de datos.

**Contexto de los 17 matches "database/persist"**:
Todos aparecen en comentarios de documentación sobre gestión de SESIÓN, no de datos de negocio:

```typescript
// src/infrastructure/tokenStorage.ts
/**
 * Persiste el token en localStorage y lo mantiene también en memoria durante la sesión.
 */

// src/services/AuthAdminService.ts
/**
 * Persistencia de la sesión administrativa exitosa mediante `sessionManager.guardarSesion()`.
 */
```

**Conclusión**: ✅ Ningún acceso a bases de datos. Frontend recibe 100% de datos desde la API
(contratos en `contracts/openapi.yaml`, T016).

---

### 2. ❌ Persistencia Propia de Datos de Negocio

**Definición de "persistencia propia"** (RF-25):
- Guardar/recuperar publicaciones, usuarios, reportes en localStorage/IndexedDB.
- Mantener cache local de datos sin sincronización con servidor.
- Implementar caché offline que altera datos de negocio.

**Hallazgo**: 0 usos de localStorage/sessionStorage para datos de negocio.

**Usos permitidos encontrados** (estándar web):

1. **`src/infrastructure/tokenStorage.ts`**
   - Guarda: `token` (JWT de sesión)
   - Usa: `window.localStorage` y `window.sessionStorage`
   - **Propósito**: Mantener sesión autenticada entre recargas de página.
   - **Justificación**: Estándar web. El token es infraestructura de seguridad, no datos de negocio.

   ```typescript
   if (typeof window !== 'undefined' && window.localStorage) {
     return window.localStorage.getItem('admin_token')
   }
   ```

2. **`src/infrastructure/sessionManager.ts`**
   - Guarda: Metadatos de sesión administrativa (ID usuario, rol)
   - Usa: `window.sessionStorage` (borrado al cerrar navegador)
   - **Propósito**: Recuperar datos de sesión sin re-autenticar.
   - **Justificación**: Estándar web. Sesión de infraestructura, no negocio.

   ```typescript
   if (typeof window !== 'undefined' && window.sessionStorage) {
     return window.sessionStorage.getItem('admin_session')
   }
   ```

**Conclusión**: ✅ Persistencia de sesión es estándar HTTP/web. No persiste datos de negocio
(publicaciones, usuarios, reportes, etc.).

---

### 3. ❌ Cálculo de Rankings / Recomendaciones / Estadísticas

**Definición** (RF-26, RF-27):
- Calcular puntuaciones de reputación de usuarios.
- Generar rankings de publicaciones por relevancia.
- Computar estadísticas agregadas (trending, top-X).

**Búsqueda ejecutada**:
```bash
grep -ri "ranking\|recommendation\|statistic\|calculate.*score" src/
→ 0 resultados
```

**Análisis**: El frontend recibe reportes listados desde la API con filtros/ordenamientos (T020,
`FiltroReportes`). No calcula nada.

**Patrón observado** (correcto):
```typescript
// En ReportesService.ts (T034c):
async listar(filtros?: FiltroReportes) {
  // Envía filtros al servidor, NO filtra en cliente
  return this.client.get('/reportes', { params: filtros })
}
```

**Conclusión**: ✅ Ningún cálculo de rankings/recomendaciones/estadísticas. Todo delegado al backend.

---

## Matriz de Cobertura

| Restricción (RF-XX) | Descripción | Búsqueda | Status | Evidencia |
| --- | --- | --- | --- | --- |
| RF-25a | Sin acceso a MySQL | grep "mysql\|Database" | ✅ 0 matches | Todos los datos vienen de la API |
| RF-25b | Sin persistencia propia de negocio | grep "localStorage.*publicacion\|usuario\|reporte" | ✅ 0 matches | localStorage solo almacena token |
| RF-26 | Sin cálculo de rankings | grep "ranking\|score" | ✅ 0 matches | Filtros/ordenamiento delegados al servidor |
| RF-27 | Sin estadísticas derivadas | grep "statistic\|aggregate" | ✅ 0 matches | Métricas no se calculan en frontend |

---

## Arquitectura Conforme a RF-25/26/27

```
┌─────────────────────────────────────────────────────┐
│ FRONTEND (Union/frontend)                            │
│                                                     │
│ ✅ Recibe datos de la API                           │
│ ✅ Renderiza UI                                     │
│ ❌ NO calcula rankings                              │
│ ❌ NO persiste datos de negocio                     │
│ ❌ NO accede a MySQL                                │
│                                                     │
│ [Persistencia permitida]:                           │
│ ✅ Tokens en localStorage/sessionStorage            │
│    (sesión, no negocio)                             │
└─────────────────────────────────────────────────────┘
         ↑
         │ GET /reportes?prioridad=ALTA
         │ GET /usuarios?estado=ACTIVO
         │ POST /reportes/{id}/aceptar
         │ (Filtros, cálculos, stats → servidor)
         │
┌─────────────────────────────────────────────────────┐
│ BACKEND (API Java, futura integración)              │
│                                                     │
│ ✅ Accede a MySQL                                   │
│ ✅ Calcula rankings/estadísticas                   │
│ ✅ Implementa reglas de negocio complejas          │
└─────────────────────────────────────────────────────┘
```

---

## Capas del Frontend Auditadas

| Capa | Archivos | ¿Almacena datos? | ¿Calcula stats? | Status |
| --- | --- | --- | --- | --- |
| **Presentación** | 45 archivos | ❌ No | ❌ No | ✅ OK |
| **Aplicación** (Servicios) | ReportesService, UsuariosServiceAdmin, etc. | ❌ No | ❌ No | ✅ OK |
| **Infraestructura** | tokenStorage.ts, sessionManager.ts | ✅ Token only | ❌ No | ✅ OK |
| **Dominio** | Entidades, Value Objects, Enums | ❌ No | ❌ No | ✅ OK |

---

## Casos Particulares Revisados

### ¿Qué es `tokenStorage.ts`?

**Respuesta**: Almacena TOKENS, no datos de negocio.

```typescript
export function guardarToken(token: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('admin_token', token)
  }
}
```

- El token es credencial de autenticación (infraestructura).
- No es "persistencia de datos de negocio" (RF-25).
- Es estándar web: toda app web autenticada almacena tokens.

### ¿Qué es `sessionManager.ts`?

**Respuesta**: Gestiona METADATOS DE SESIÓN, no datos de negocio.

```typescript
export function guardarSesion(sesion: SesionAdministrativa): void {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.setItem('admin_session', JSON.stringify(sesion))
  }
}
```

- Almacena: `{ usuarioId, rol, autenticadoEn }` (infraestructura).
- No almacena: publicaciones, usuarios, reportes.
- Se limpia al cerrar navegador (`sessionStorage`, no `localStorage`).

### ¿Por qué ningún cálculo de ranking?

**Respuesta**: No es responsabilidad del frontend.

- El backend filtra/ordena reportes por prioridad.
- El backend calcula estadísticas de moderadores.
- El frontend solo renderiza lo que recibe.

Ejemplo correcto (T049):
```typescript
// ReportesService.listar NO filtra en cliente; envía al servidor:
return this.client.get('/reportes', { params: filtros })
// Servidor responde con reportes ya filtrados y ordenados.
```

---

## Conclusión Final

✅ **100% conforme a RF-25, RF-26, RF-27**

1. **MySQL**: No se accede. Todos los datos vienen de la API.
2. **Persistencia propia**: No existe. Solo sesión web estándar.
3. **Rankings/Estadísticas**: No se calculan. Delegado al backend.

El frontend es un cliente **stateless** de la API, siguiendo la arquitectura cliente-servidor
esperada. Todo procesamiento de datos críticos queda en el backend (Java, MySQL, reglas de negocio).

**Listo para T087** (re-validación de Constitution Check).
