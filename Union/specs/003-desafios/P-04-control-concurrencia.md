
# Clarificación P-04: Control de concurrencia (CB-02)

**Fecha**: 13 de octubre de 2026  
**Scope**: 003 Desafíos (Frontend)  
**Estado**: Pendiente de decisión  
**Bloquea**: T045 (actualizaciones optimistas), HU-02 (editar desafío), HU-05 (editar solicitud), HU-07 (admin edita solicitud)

---

## 1. Contexto

**Requisito original (CB-02 en spec.md)**:
> "Dos administradores editan el mismo desafío a la vez: el segundo recibe un aviso de conflicto y no sobrescribe cambios sin confirmación."

**Decisión actual (plan.md, sección 6)**:
> "P-04 Control de concurrencia (CB-02): Campo `version` y cabecera `If-Match`, con 409 si hay conflicto"

**Problema**: La decisión está propuesta pero no confirmada. Faltan detalles sobre:
1. Estructura del campo `version`
2. Cabeceras HTTP exactas y semántica
3. Manejo de errores 409 en el frontend
4. Comportamiento en el adaptador en memoria vs. HTTP

---

## 2. Opciones evaluadas

### Opción A: **Version + If-Match** (PROPUESTA ACTUAL)

**Mecanismo**:
- Cada entidad editable (`Desafio`, `SolicitudDesafio`, `RespuestaDesafio`) tiene campo `version: number`
- Al editar, el cliente envía: `PUT /desafios/123` con cabecera `If-Match: "5"`
- Si la versión en servidor es distinta, backend responde `409 Conflict`
- El cliente muestra diálogo: "Alguien más cambió esto" y ofrece opciones

**Ventajas**:
- ✅ Estándar HTTP (RFC 7232)
- ✅ Preciso: detecta cualquier cambio entre lectura y escritura
- ✅ Escalable: funciona bien con múltiples clientes
- ✅ Compatible con REST
- ✅ Fácil de entender

**Desventajas**:
- ❌ Requiere que el backend mantenga versiones
- ❌ Cliente debe guardar y enviar la versión actual
- ❌ Manejo de 409 es más complejo en UI

**Implementación**:
```typescript
// Backend API
PUT /desafios/{id}
If-Match: "5"
{ nombre: "Nuevo nombre", ... }

// Respuesta exitosa (200/204)
Desafio { id, nombre, ..., version: 6 }

// Conflicto (409)
{ error: "Conflict", version: 6, mensaje: "..." }
```

---

### Opción B: **Last-Write-Wins (sin control)**

**Mecanismo**:
- No hay validación de versión
- Ultimo que escribe gana
- Sin aviso de conflicto

**Ventajas**:
- ✅ Muy simple de implementar
- ✅ Sin cambios en contrato

**Desventajas**:
- ❌ Viola CB-02 (sin aviso de conflicto)
- ❌ Pérdida de cambios silenciosa
- ❌ No es aceptable para datos críticos

**Descartada**: Viola requisitos de spec

---

### Opción C: **Timestamp + If-Unmodified-Since**

**Mecanismo**:
- Cada cambio actualiza `updatedAt: timestamp`
- Cliente envía: `PUT /desafios/123` con `If-Unmodified-Since: "2026-10-13T10:00:00Z"`

**Ventajas**:
- ✅ Semántica más clara ("no modificar si fue editado después de...")
- ✅ Usa cabeceras estándar

**Desventajas**:
- ❌ Menos preciso (no distingue quién cambió qué)
- ❌ Problemas con sincronización de reloj
- ❌ Más complejo para frontend (gestionar timestamps)

**Recomendación**: Menos robusto que Opción A

---

## 3. PROPUESTA: Confirmar Opción A

**Decisión recomendada**: 
✅ **Usar `version: number` (entero) + cabecera `If-Match`**

**Razones**:
1. Estándar HTTP probado
2. Más preciso que timestamps
3. Fácil de implementar en ambos adaptadores
4. Compatible con React Query
5. Encaja bien en architecture actual

---

## 4. Especificación de Opción A (detalles)

### 4.1 Estructura de datos

**Dominio** (`Desafio`, `SolicitudDesafio`, `RespuestaDesafio`):
```typescript
// Ya está en todas las entidades:
readonly version: number;  // Empezando en 1, se incrementa en cada PUT
```

### 4.2 Contrato HTTP (OpenAPI)

```yaml
components:
  schemas:
    Desafio:
      properties:
        # ... campos existentes ...
        version:
          type: integer
          minimum: 1
          description: "Versión del desafío para control de concurrencia (CB-02)"
          
    ErrorConflicto:
      type: object
      properties:
        error:
          type: string
          enum: ["Conflict"]
        message:
          type: string
          example: "El desafío ha sido modificado por otro usuario"
        version:
          type: integer
          description: "Versión actual en servidor"
        conflictData:
          $ref: "#/components/schemas/Desafio"
          description: "Datos actuales del servidor (para decidir qué hacer)"

responses:
  409Conflict:
    description: "Conflicto de versión: otro usuario modificó este recurso"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ErrorConflicto"

paths:
  /desafios/{id}:
    put:
      summary: "Editar desafío"
      parameters:
        - name: If-Match
          in: header
          required: true
          schema:
            type: string
            example: '"5"'
          description: "Versión del desafío (entre comillas, RFC 7232)"
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/DesafioEscritura"
      responses:
        200:
          description: "Desafío actualizado"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Desafio"
        409:
          $ref: "#/components/responses/409Conflict"
        403:
          description: "Permiso denegado"
```

### 4.3 Implementación en adaptadores

**InMemoryDesafiosAdapter.ts**:
```typescript
async editarDesafio(
  id: string,
  datos: DatosDesafio,
  version: number
): Promise<Desafio> {
  const desafio = this.desafios.get(id);
  
  if (!desafio) {
    throw new ErrorNoEncontrado(`Desafío ${id} no existe`);
  }
  
  // CB-02: Validar versión
  if (desafio.version !== version) {
    throw new ErrorConflicto(
      `Conflicto de versión: esperado ${version}, actual ${desafio.version}`,
      desafio
    );
  }
  
  // Actualizar con incremento de versión
  const actualizado: Desafio = {
    ...desafio,
    ...datos,
    version: version + 1,
  };
  
  this.desafios.set(id, actualizado);
  return actualizado;
}
```

**HttpDesafiosAdapter.ts**:
```typescript
async editarDesafio(
  id: string,
  datos: DatosDesafio,
  version: number
): Promise<Desafio> {
  const respuesta = await this.httpClient.put(
    `/desafios/${id}`,
    datos,
    {
      headers: {
        "If-Match": `"${version}"`,  // RFC 7232: versión entre comillas
      },
    }
  );
  
  // Si falla con 409, el mapearErrorDesafios lo convierte a ErrorConflicto
  // El error tendrá: error.version, error.conflictData, etc.
  
  return respuesta.json() as Desafio;
}
```

### 4.4 Manejo de conflictos en UI

**useMutacionesSolicitud.ts** (ej. para editar):
```typescript
const editar = useMutation({
  mutationFn: async ({ id, datos, version, sesion }) => {
    // Enviar version actual al servidor
    return await puerto.editarSolicitud(id, version);
  },
  onError: (error, variables) => {
    if (error instanceof ErrorConflicto) {
      // CB-02: Mostrar diálogo de conflicto
      // Opciones:
      // 1. "Ver cambios" → mostrar datos actuales
      // 2. "Usar mis cambios" → reintenta con nueva versión (si lo permite)
      // 3. "Cancelar" → abandona edición
      
      // Por ahora: mostrar error y sugerir recargar
      console.error("Conflicto:", error.message, error.version);
      // Componente manejará mostrar mensaje al usuario
    }
  },
});
```

---

## 5. Impacto en tareas

### Afectadas directamente

| Tarea | Impacto | Acción |
|---|---|---|
| T045 | Implementar actualizaciones optimistas con rollback | Puede proceder cuando P-04 se resuelva |
| T042 (`editar` en solicitudes) | Ya implementado sin optimistas | Añadir parámetro `version` (ya existe) |
| T043 (`editar` en respuestas) | Ya implementado sin optimistas | Añadir parámetro `version` (ya existe) |
| T063 (EditarDesafioAdminPage) | Formulario de edición | Requiere manejar 409 |
| T045 (editar solicitud usuario) | Similar a T063 | Requiere manejar 409 |

### Ya completadas (sin cambios necesarios)

- ✅ T027 (InMemoryDesafiosAdapter): entidades ya tienen `version`
- ✅ T029-T030 (HttpDesafiosAdapter): estructura lista para If-Match
- ✅ T041-T043 (Hooks de mutaciones): parámetro `version` ya está

---

## 6. Tareas derivadas de P-04

Una vez confirmada esta resolución:

1. **Actualizar OpenAPI** (`contracts/openapi.yaml`)
   - Añadir schema `ErrorConflicto`
   - Documentar cabecera `If-Match`
   - Añadir respuesta 409 a endpoints PUT

2. **Completar HttpDesafiosAdapter** (T030)
   - Si aún no incluye validación 409, completar

3. **Completar InMemoryDesafiosAdapter** (T027)
   - Validar versión en editarDesafio

4. **Implementar T045**
   - Actualizaciones optimistas con rollback en editar solicitud y respuesta
   - Manejo UI de 409 Conflict

5. **Componentes de edición** (T063, etc.)
   - Mostrar diálogos de conflicto
   - Opciones: ver cambios, reintentar, cancelar

---

## 7. Decision required

### Preguntas para el equipo

1. **¿Confirmamos Opción A (version + If-Match)?**
   - Sí ✅ / No ❌ / Preferimos Opción C

2. **¿El campo `version` es `number` (entero)?**
   - Sí, integer++
   - Sí, pero otro formato (especificar)

3. **¿Cómo muestra UI los conflictos (409)?**
   - Diálogo con 3 opciones (Ver cambios / Usar míos / Cancelar)
   - Simple: "Alguien más lo cambió, recarga"
   - Otro (especificar)

4. **¿El backend calcula `version` o es responsabilidad del cliente?**
   - Backend: incrementa en cada PUT exitoso
   - Cliente: propone, backend valida
   - Otro (especificar)

---

## 8. Recomendación final

**PROPUESTA**: Adoptar Opción A completa (version + If-Match) con:
- ✅ Campo `version: number` (ya existe en entidades)
- ✅ Cabecera `If-Match` en PUT
- ✅ Respuesta 409 Conflict con datos actuales
- ✅ Diálogo UI mostrando opciones ("Ver cambios", "Cancelar")
- ✅ Rollback de actualizaciones optimistas si falla

**Ventajas acumuladas**:
- Cumple CB-02 (aviso de conflicto)
- Desbloquea T045 (actualizaciones optimistas)
- Facilita T063+ (componentes seguros)
- Escalable y robusto

---

## 9. Próximos pasos

1. **Equipo confirma esta propuesta** → crear decision record
2. **Actualizar OpenAPI** (contratos/)
3. **Completar adaptadores** si falta algo
4. **Implementar T045** (actualizaciones optimistas)
5. **Componentes maneja 409** (T063 y similares)
