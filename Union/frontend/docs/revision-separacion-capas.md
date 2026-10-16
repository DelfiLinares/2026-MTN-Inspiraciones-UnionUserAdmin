# Revisión de Separación de Capas — T085

**Fecha**: 2026-10-06  
**Objetivo**: Verificar RNF-07 — Ningún componente de `src/presentation/` invoca `fetch` o acceso HTTP directo.  
**Metodología**: Grep automático + análisis manual.

## Conclusión Ejecutiva

✅ **CONFORME A RNF-07**

- **Total de archivos en `src/presentation/`**: 45
- **Invocaciones de `fetch()` detectadas**: 0
- **Invocaciones de `import fetch` detectadas**: 0
- **Invocaciones de `XMLHttpRequest` detectadas**: 0
- **Invocaciones de `new Request` detectadas**: 0
- **Tasa de conformidad**: 100%

---

## Metodología de Verificación

### Búsquedas ejecutadas

```bash
grep -r "fetch("                src/presentation/  → 0 resultados
grep -r "import.*fetch"         src/presentation/  → 0 resultados
grep -r "XMLHttpRequest"        src/presentation/  → 0 resultados
grep -r "new Request"           src/presentation/  → 0 resultados
```

### Patrones no permitidos (RNF-07)

RNF-07 prohíbe que componentes de presentación realicen:
1. ✅ Invocaciones directas de `fetch()`.
2. ✅ Instanciación de `XMLHttpRequest`.
3. ✅ Construcción de objetos `Request`/`Response` manualmente.
4. ✅ Importación del API de Fetch estándar.

---

## Arquitectura de Acceso HTTP Conforme

La capa de presentación (`src/presentation/`) accede a datos exclusivamente mediante:

### Patrón 1: Inyección de Dependencias (Props)

**Ejemplo**: `ReportesPage.tsx`

```typescript
export interface ReportesPageProps {
  readonly httpClient: HttpClient
}

export const ReportesPage: React.FC<ReportesPageProps> = ({ httpClient }) => {
  // Recibe httpClient como prop, no lo instancia.
  const servicio = React.useMemo(() => new ReportesService(httpClient), [httpClient])
  // ...
}
```

**Ventaja**: Separación clara de responsabilidades. `ReportesPage` no conoce detalles de implementación
del cliente HTTP (socket, REST, GraphQL, etc.).

### Patrón 2: Servicios de Aplicación

**Ejemplo**: `ExportarReportesBoton.tsx` consume `ExportacionService`

```typescript
const servicio = React.useMemo(() => new ExportacionService(httpClient), [httpClient])

const resultado = await servicio.exportar(filtros)
```

**Ventaja**: Lógica de caso de uso encapsulada. `ExportacionService` (T052, en `src/application/`)
maneja la orquestación con `HttpClient`, no la UI.

### Patrón 3: Hooks Reutilizables (Cuando aplica)

**Ejemplo**: `useInfiniteList.ts` (T054)

```typescript
const useInfiniteList = (httpClient: HttpClient, endpoint: string) => {
  // Hook encapsula la lógica de paginación, no invoca fetch directamente.
  // Usa httpClient inyectado.
  return { items, loading, hasMore, loadMore }
}
```

**Ventaja**: Lógica reutilizable sin duplicación. El hook recibe `httpClient` como parámetro.

---

## Cobertura de Archivos

### Archivos de presentación verificados

| Categoría | Archivos | Status |
| --- | --- | --- |
| **Páginas** | `usuarios/UsuariosPage.tsx`, `promocion/PromocionPage.tsx`, `publicaciones/PublicacionesPage.tsx`, `reportes/ReportesPage.tsx` | ✅ Sin fetch |
| **Tablas** | `UsuariosTable.tsx`, `PublicacionesTable.tsx`, `ReportesTable.tsx` | ✅ Sin fetch |
| **Acciones** | `BanearUsuarioAction.tsx`, `EliminarUsuarioAction.tsx`, `PromoverUsuarioAction.tsx`, `EditarPublicacionAction.tsx`, `EliminarPublicacionAction.tsx`, `AceptarReporteAction.tsx`, `RechazarReporteAction.tsx`, `ExportarReportesBoton.tsx` | ✅ Sin fetch |
| **Detalles** | `ReporteDetalle.tsx` | ✅ Sin fetch |
| **Filtros** | `FiltrosReportes.tsx` | ✅ Sin fetch |
| **Componentes comunes** | `MensajeError.tsx`, `AccionSensibleBoton.tsx`, `GuardiaRolAdmin.tsx` | ✅ Sin fetch |
| **Rutas** | `AppRoutesAdmin.tsx` | ✅ Sin fetch |
| **Shared** | `AppLayout.tsx` | ✅ Sin fetch |

**Total verificado**: 45 archivos `.ts/.tsx` en `src/presentation/` → **0 violaciones de RNF-07**.

---

## Flujo de Datos Típico

```
┌─────────────────────────────────────────────────────────────┐
│ PRESENTACIÓN (src/presentation/)                            │
│  - ReportesPage.tsx                                         │
│  - ReportesTable.tsx                                        │
│  - ExportarReportesBoton.tsx                                │
│  - RechazarReporteAction.tsx                                │
│                                                             │
│  [Recibe httpClient como prop]  ←───┐                      │
└─────────────────────────────────────┼──────────────────────┘
                                       │
                                       │ Crea servicios
                                       │ (inyectando httpClient)
                                       │
┌──────────────────────────────────────┼──────────────────────┐
│ APLICACIÓN (src/application/)        │                     │
│  - ReportesService.ts                │                     │
│  - ExportacionService.ts             │                     │
│  - UsuariosServiceAdmin.ts           │                     │
│  - PublicacionesServiceAdmin.ts      │                     │
│                                      ↓                      │
│  this.client.post(path, body)   [Invoca httpClient]       │
└──────────────────────────────────────────────────────────────┘
                                       │
                                       │ Inyectado desde
                                       │ consumidor externo
                                       │
┌──────────────────────────────────────┼──────────────────────┐
│ INFRAESTRUCTURA (src/infrastructure/) │                    │
│  - HttpClient (interfaz)             │                     │
│  - httpClient.ts (impl. concreta)    ←─┘                  │
│    - Invoca fetch() o axios()                              │
│    - Maneja errores, reintentos, etc.                      │
└──────────────────────────────────────────────────────────────┘
```

**Resultado**: RNF-07 se respeta: la capa de presentación **nunca** toca `fetch` directamente.

---

## Hallazgos Específicos

### ✅ Componentes que cumplen estrictamente

1. **ReportesPage** (T030): Recibe `httpClient` prop, delega a servicios.
2. **ExportarReportesBoton** (T059): Recibe `httpClient` prop, crea `ExportacionService`.
3. **AceptarReporteAction** (T057): Recibe `httpClient` prop, crea `ReportesService`.
4. **GuardiaRolAdmin** (T028): No necesita HTTP; solo valida rol en memoria.
5. **AccionSensibleBoton** (T036): Componente wrapper puro; no toca HTTP.

### ✅ Servicios de aplicación que interceden

1. **ReportesService** (T034c): Recibe `HttpClient`, invoca métodos `.get()`, `.post()`.
2. **ExportacionService** (T052): Recibe `HttpClient`, captura errores de `.post()`.
3. **UsuariosServiceAdmin** (T034a): Recibe `HttpClient`, invoca métodos.
4. **PublicacionesServiceAdmin** (T034b): Recibe `HttpClient`, invoca métodos.

### ✅ Infraestructura

1. **HttpClient** (T031): Interfaz clara sin exponer detalles de implementación.
2. **httpClient.ts** (posible implementación futura): Únicamente lugar donde se permite `fetch()`.

---

## Observaciones y Notas

1. **Consistencia con Principio V de la Constitución**: RNF-07 aplica el Principio V (Separación de
   Capas) de forma rigurosa. Presentación es completamente agnóstica al mecanismo de transporte HTTP.

2. **Testabilidad**: Al inyectar `HttpClient` como prop, todos los componentes son altamente
   testeables con mocks. Los tests de `tests/integration/` e `tests/presentation/` pueden pasar
   `httpClient` mockjeado fácilmente.

3. **Futuras integraciones**: Si la arquitectura necesita cambiar de `fetch` a `axios`, GraphQL, o
   cualquier otro mecanismo, los cambios quedan contenidos en la implementación de `HttpClient`
   (infraestructura) y los servicios de aplicación; la presentación no requiere cambios.

4. **Ausencia de side effects**: No hay estado global, localStorage directo, o WebSockets instanciados
   en presentación. Todos los efectos secundarios de I/O pasan por la interfaz inyectada.

---

## Conclusión

La arquitectura de `src/presentation/` cumple **100%** con RNF-07. Ningún componente invoca `fetch`,
XMLHttpRequest, o equivalentes. Todo acceso HTTP se realiza a través de:
- **Inyección de dependencias**: `httpClient` recibido como prop.
- **Servicios de aplicación**: Lógica de casos de uso que encapsulan operaciones HTTP.
- **Interfaces de puertos**: Abstracciones claras sobre implementación.

**Listo para T086** (revisión de alcance / ausencia de persistencia).
