# T100 — Resolución de Abiertos (Fase 9)

**Objetivo**: Resolver las decisiones pendientes contrastando con API real (T097) y actualizar `research.md` y `data-model.md` con valores definitivos.

**Dependencias**: T097 (contrastar contrato con API real)

**Nota**: Este documento prepara la información para actualizar specs/. Cuando T097 esté completo y se haya integrado con API real, usar esta información para actualizar `research.md` y `data-model.md`.

---

## S-2: Topes de Tamaño de Archivo

### Situación actual (research.md)
```
S-2 Los topes de tamaño de archivo los informa la API (`GET /configuracion`) 
o el rechazo con 413; hasta entonces el frontend usa valores provisionales.
```

### Valores provisionales en código (frontend)
**Ubicación**: `SH/domain/validaciones.ts`

```typescript
// Provisional: máximos de tamaño
export const TAMAÑO_MAX_IMAGEN_MB = 5;
export const TAMAÑO_MAX_VIDEO_MB = 50;
export const TAMAÑO_MAX_AUDIO_MB = 20;
```

### Requerimientos para resolver T100
- [ ] **T097** consultó API real y obtuvo topes vía `GET /configuracion`
- [ ] API retorna estructura clara:
  ```json
  {
    "imagenMaxMB": 5,
    "videoMaxMB": 50,
    "audioMaxMB": 20
  }
  ```
- [ ] Frontend crea hook `useConfiguracion()` que:
  - Consulta `GET /configuracion` al iniciar sesión
  - Cachea valores en TanStack Query
  - Usa valores provisionales si API falla
  - Valida uploads con valores reales

### Resolución de T100
1. Obtener valores reales del API (T097)
2. Crear `SH/hooks/useConfiguracion.test.tsx` (test primero)
3. Implementar `SH/hooks/useConfiguracion.tsx`
4. Actualizar `SH/domain/validaciones.ts` con valores reales
5. **Actualizar `research.md`**: cambiar S-2 a RESUELTO con valores finales

### Cambio en research.md (ejemplo)
```diff
- S-2 Los topes de tamaño de archivo los informa la API (`GET /configuracion`) 
  o el rechazo con 413; hasta entonces el frontend usa valores provisionales.

+ **RESUELTO** (2026-10-08): API informa topes via `GET /configuracion`.
  - Imagen: 5 MB
  - Video: 50 MB
  - Audio: 20 MB
  Frontend valida con estos valores y maneja 413 como error definitivo.
```

---

## A-5: Carpetas Públicas — Visibilidad y Descubrimiento

### Situación actual (research.md)
```
A-5 Carpetas públicas | Interruptor privada/pública; visibilidad a terceros 
no se implementa en esta fase | Quién las ve y cómo se descubren
```

### Implementación actual (frontend)
- **Crear carpeta**: default PRIVADA (VisibilidadCarpeta.PRIVADA)
- **Editar carpeta**: toggle a PUBLICA (RF-20)
- **Ver carpetas**: solo el propietario ve sus carpetas (ambas visibilidades)

**NO implementado**:
- Endpoint para listar carpetas públicas de otros usuarios
- UI para "descubrir" carpetas públicas ajenas
- Compartir enlace a carpeta pública

### Requerimientos para resolver T100
- [ ] **T097** verificó API real:
  - ¿Existe endpoint `GET /usuarios/{id}/carpetas/publicas`?
  - ¿O las carpetas públicas son descubribles via búsqueda general?
  - ¿Pueden compartirse URLs directas a carpetas públicas?
- [ ] Clarificar el flujo de **descubrimiento**:
  - Opción 1: Vista de "Carpetas públicas de la comunidad"
  - Opción 2: Búsqueda integrada (carpetas + publicaciones)
  - Opción 3: Enlace directo (no hay descubrimiento, solo compartir URL)

### Resolución de T100
1. Consultar API real sobre endpoints de carpetas públicas (T097)
2. Si existe endpoint: crear test + hook `usePublicasOtrosUsuarios()`
3. Si no existe: documentar que "visibilidad pública sin descubrimiento"
4. **Actualizar `research.md`**: cambiar A-5 a RESUELTO

### Cambio en research.md (ejemplo)
```diff
- A-5 Carpetas públicas | Interruptor privada/pública; visibilidad a terceros 
  no se implementa en esta fase | Quién las ve y cómo se descubren

+ **RESUELTO** (2026-10-08): Carpetas públicas son un toggle en UI (RF-20).
  No hay descubrimiento de carpetas públicas ajenas en esta fase.
  Usuarios pueden compartir enlaces directos si conocen la URL.
  (Futuro: página "Carpetas públicas de la comunidad" o búsqueda integrada)
```

---

## A-12: Orden del Feed — Criterio Definitivo

### Situación actual (research.md)
```
A-12 Feed | Más recientes primero; el orden lo da la API | Criterio definitivo
```

### Implementación actual (frontend)
- **useFeed()**: pide al API lista de publicaciones
- **Asume**: API retorna ordenadas por fecha (más recientes primero)
- **Paginación**: 20 por página, scroll infinito

### Requerimientos para resolver T100
- [ ] **T097** verificó con API real:
  - ¿Retorna publicaciones ordenadas por `fecha DESC` (más recientes primero)?
  - ¿O por otro criterio (trending, likes, relevancia)?
  - ¿Permite override de orden con query param `?sort=...`?
- [ ] Verificar que `useFeed()` espera el orden correcto

### Resolución de T100
1. Confirmar orden del API en T097
2. Verificar/actualizar `SH/hooks/useFeed.ts` para usar el orden correcto
3. Si API soporta múltiples órdenes: crear UI de selector (Filtros)
4. **Actualizar `research.md`**: cambiar A-12 a RESUELTO

### Cambio en research.md (ejemplo)
```diff
- A-12 Feed | Más recientes primero; el orden lo da la API | Criterio definitivo

+ **RESUELTO** (2026-10-08): API retorna publicaciones ordenadas por 
  fecha DESC (más recientes primero). Frontend no aplica orden local.
  Frontend pide paginación al API que mantiene consistencia.
```

---

## A-13: Motivos de Reporte — Lista Final

### Situación actual (research.md)
```
A-13 Motivos de reporte | Provisional: spam, contenido inapropiado, plagio, 
otro (exige texto); texto libre hasta 500 caracteres | Lista final
```

### Implementación actual (frontend)
**Ubicación**: `SH/domain/enums.ts`

```typescript
export enum MotivoReporte {
  SPAM = "SPAM",
  CONTENIDO_INAPROPIADO = "CONTENIDO_INAPROPIADO",
  PLAGIO = "PLAGIO",
  OTRO = "OTRO",
}
```

### Requerimientos para resolver T100
- [ ] **T097** consultó API real sobre motivos aceptados:
  - ¿API retorna lista de motivos válidos via `/reportes/motivos`?
  - ¿O lista es fija y acordada entre frontend + backend?
  - ¿Se aceptan otros motivos además de estos 4?
  - ¿El campo `OTRO` siempre requiere texto libre?

### Resolución de T100
1. Confirmar lista de motivos con API en T097
2. Actualizar `SH/domain/enums.ts` si hay cambios
3. Verificar `SH/domain/validaciones.ts`: OTRO exige 1-500 caracteres
4. **Actualizar `research.md`**: cambiar A-13 a RESUELTO

### Cambio en research.md (ejemplo)
```diff
- A-13 Motivos de reporte | Provisional: spam, contenido inapropiado, plagio, 
  otro (exige texto); texto libre hasta 500 caracteres | Lista final

+ **RESUELTO** (2026-10-08): Backend confirma 4 motivos válidos:
  1. SPAM
  2. CONTENIDO_INAPROPIADO
  3. PLAGIO
  4. OTRO (exige texto libre 1-500 caracteres)
  API rechaza otros motivos (validación en backend).
```

---

## Checklist T100 — Pasos para Completar

### Fase 1: Verificación API (T097)
- [ ] API real disponible y contactable
- [ ] Endpoints verificados:
  - [ ] `GET /configuracion` → tamaños máximos
  - [ ] `GET /usuarios/{id}/carpetas/publicas` → ¿existe?
  - [ ] `GET /publicaciones` → orden del feed
  - [ ] `POST /reportes` → motivos aceptados

### Fase 2: Documentación T100
- [ ] Completar este archivo con hallazgos reales
- [ ] Contrastar código frontend con respuestas API

### Fase 3: Actualización de specs
- [ ] Actualizar `specs/002-inspiraciones-publicaciones/research.md`:
  - Cambiar S-2 a RESUELTO con valores reales
  - Cambiar A-5 a RESUELTO con decisión final
  - Cambiar A-12 a RESUELTO con orden confirmado
  - Cambiar A-13 a RESUELTO con motivos finales
- [ ] Actualizar `specs/002-inspiraciones-publicaciones/data-model.md` si hay cambios en tipos/enums

### Fase 4: Implementación si es necesario
- [ ] Si S-2 requiere fetch de `/configuracion`: crear hook
- [ ] Si A-5 tiene descubrimiento: crear endpoint + UI
- [ ] Si A-12 soporta múltiples órdenes: agregar selector

---

## Notas para T101-T107

Cuando T100 esté resuelto:
- T101-T107 pueden ejecutarse contra API real con **claridad total**
- No hay ambigüedades en tamaños, órdenes o motivos
- Documentación está sincronizada (specs = API real)

**Estado actual**: Estructura lista. Espera T097.
