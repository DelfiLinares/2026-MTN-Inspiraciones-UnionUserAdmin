# Adaptadores para Desafíos - Estructura Lista para Integración

## Estado: Esqueleto Preparado para T089-T095

Este directorio contiene la estructura completa lista para integrar la API Java una vez que se resuelvan los pendientes de T089.

### Archivos

#### 1. `HttpDesafiosAdapter.ts`
**Adaptador HTTP para la API Java**

- **Estado**: Esqueleto con métodos comentados, listos para descomentar
- **Responsabilidad**: Implementar `DesafiosPort` usando `httpClient`
- **Métodos**: 23 métodos cubiertos (4 recursos: Desafíos, Respuestas, Solicitudes, Ámbitos)

**Estructura de cada método:**
1. Endpoint HTTP (método, path, query, body)
2. Tipo de respuesta esperada
3. Pendientes de T089 (qué información falta)
4. Código comentado listo para descomentar
5. Error temporal indicando que está pendiente

**Pendientes para completar:**
- **T089**: Definir DTOs y validar estructura del API
- **T090**: Resolver puntos A-02 a A-22 y P-01 a P-05
- **T091**: Configurar `VITE_DESAFIOS_ADAPTER=http`
- **T092**: Prueba de humo de lectura (GET endpoints)
- **T093**: Ajustar mapeo de errores
- **T094**: Subida de fotos en multipart
- **T095**: Control de concurrencia con If-Match

#### 2. `mapearErrorDesafios.ts`
**Mapeo de errores HTTP a excepciones de dominio**

- **Estado**: Estructura base con excepciones definidas
- **Responsabilidad**: Convertir errores HTTP (400, 401, 403, 404, 409, 500+) a excepciones de dominio
- **Excepciones definidas**:
  - `DesafioNoEncontradoError` (404)
  - `ConflictoVersionError` (409)
  - `ValidacionError` (400)
  - `OperacionNoPermitidaError` (403)
  - `SesionExpiradaError` (401)

**Pendientes:**
- **T093**: Ajustar mapeos según estructura real de errores del API
- Confirmar codificación de errores en respuestas

#### 3. `index.ts`
**Factory y selector de adaptador**

- **Estado**: Placeholder de factory
- **Responsabilidad**: Crear instancia del adaptador correcto según configuración
- **Configuración**: Variable de entorno `VITE_DESAFIOS_ADAPTER`
  - `memoria` (default): InMemoryDesafiosAdapter
  - `http` (cuando esté listo): HttpDesafiosAdapter

**Pendientes:**
- **T091**: Implementar selector una vez configurada variable de entorno

---

## Cómo Usar Esta Estructura

### Para el Equipo de Frontend

Cuando T089 esté resuelto y se proporcione:
1. DTOs del API (estructura de Desafio, Solicitud, Respuesta, Ámbito)
2. URLs exactas de endpoints
3. Parámetros de query y headers

**Pasos para completar:**

1. **T092 (Prueba de humo - lectura)**
   ```
   - Descomenta métodos GET en HttpDesafiosAdapter
   - Implementa mapeos DTO → Dominio
   - Valida contra endpoints reales
   ```

2. **T093 (Mapeo de errores)**
   ```
   - Ajusta mapearErrorDesafios() según respuestas reales
   - Prueba con 400, 401, 403, 404, 409
   ```

3. **T094 (Subida de fotos)**
   ```
   - Descomenta publicarDesafio() y editarDesafio()
   - Implementa serialización multipart/form-data
   - Valida con archivos reales
   ```

4. **T095 (Control de concurrencia)**
   ```
   - Añade headers If-Match en PUT
   - Maneja 409 Conflict
   - Implementa UI de aviso de conflicto
   ```

### Para el Equipo de API Java

La estructura espera:

**Endpoints necesarios:**
```
GET    /api/desafios/ambitos
GET    /api/desafios                    [query: ambito[], estado[], fechaDesde, fechaHasta, cursor, limit]
GET    /api/desafios/:id
POST   /api/desafios                    [multipart/form-data]
PUT    /api/desafios/:id                [multipart/form-data, If-Match]
DELETE /api/desafios/:id

GET    /api/desafios/:id/respuestas      [query: cursor, limit]
POST   /api/desafios/:id/respuestas
PUT    /api/respuestas/:id
DELETE /api/respuestas/:id

GET    /api/solicitudes                 [query: estado, cursor, limit]
POST   /api/solicitudes
PUT    /api/solicitudes/:id             [If-Match si aplica]
DELETE /api/solicitudes/:id
POST   /api/solicitudes/:id/aprobar
POST   /api/solicitudes/:id/rechazar
```

**DTOs esperados (por confirmar en T089):**
```typescript
// DesafioDTO
{
  id: string
  nombre: string
  descripcion: string
  fotosUrls: string[]  // O estructura más compleja (A-11)
  ambito: string       // Valor de catálogo (A-02)
  estado: string       // Enum: ABIERTO, ACTIVO, CERRADO, CANCELADO
  fechaInicio: Date
  fechaFin: Date
  version: number      // Para If-Match (P-04)
  tieneRespuestas: boolean  // Para RF-22, CB-02
  autorId: string
  createdAt: Date
  updatedAt: Date
}

// SolicitudDTO
{
  id: string
  estado: string       // Enum: PENDIENTE, APROBADA, RECHAZADA
  usuarioId: string
  // Campos adicionales (A-08, A-20)
  version?: number     // Si aplica P-04
}

// RespuestaDTO (A-22)
{
  id: string
  desafioId: string
  autorId: string
  contenido: string
  fotosUrls: string[]  // (A-21)
  createdAt: Date
  updatedAt: Date
}

// AmbitoDTO (A-02)
{
  id: string
  nombre: string
  descripcion?: string
}
```

---

## Roadmap de Integración

```
T088 ✓ (Validación Final - Tests OK)
  ↓
T089 (Resolver pendientes A-02, A-04, A-08, ... P-01 to P-05)
  ↓
T090 (Actualizar openapi.yaml según decisiones de T089)
  ↓
T091 (Configurar VITE_DESAFIOS_ADAPTER=http)
  ↓
T092 (Prueba humo lectura - GET endpoints)
  ↓
T093 (Ajustar mapeo de errores - códigos reales)
  ↓
T094 (Subida de fotos - multipart/form-data)
  ↓
T095 (Control concurrencia - If-Match, 409)
  ↓
T096 (Tests de contrato contra openapi.yaml)
  ↓
T097 (Verificar requisitos y .env)
  ↓
T098 (npm test completo)
  ↓
T099 (Validación manual como ADMIN)
```

---

## Referencias

- **Spec**: Union/specs/003-desafios/spec.md
- **Plan**: Union/specs/003-desafios/plan.md
- **Data Model**: Union/specs/003-desafios/data-model.md
- **OpenAPI**: Union/specs/003-desafios/contracts/openapi.yaml
- **Tasks**: Union/specs/003-desafios/tasks.md (T089-T099)

---

## Notas Importantes

1. **Sin cambios de lógica**: Solo estructura y comentarios. Todo funciona igual con InMemoryDesafiosAdapter hasta que se active T091.

2. **TypeScript deshabilitado en comentarios**: Los métodos tienen `Promise<any>` y `any` en parámetros para evitar errores de compilación mientras está pending T089.

3. **Pruebas existentes**: Todos los tests de T075-T087 siguen pasando. No hay cambio funcional.

4. **Error temporal**: Cada método lanza `Error('Pendiente T089 + TXX')` para indicar que está pendiente integración.

5. **Factory simple**: index.ts es un placeholder. Se implementará en T091 cuando se sepa cómo activar HTTP vs Memoria.
