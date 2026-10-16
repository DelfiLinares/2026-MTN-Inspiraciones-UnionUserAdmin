# ✅ T001 — Verificar/crear estructura de carpetas del módulo perfil en presentación

**Estado**: COMPLETADA  
**Fecha**: 2026-10-08  
**Branch**: `004-inspiraciones-perfil`

## Descripción de la Tarea

Crear/normalizar la estructura base de UI por feature según `plan.md`, para el módulo de perfil.

**Archivos a crear** (especificados en tasks.md):
- `Union/frontend/src/presentation/perfil/`
- `Union/frontend/src/presentation/carpetas/`
- `Union/frontend/src/presentation/publicaciones/`
- `Union/frontend/src/presentation/seguimiento/`
- `Union/frontend/src/presentation/shared/`

**Depende de**: Ninguna

**Trazabilidad**: plan.md §"Project Structure"

---

## ✅ Trabajo Completado

### Carpetas Creadas

1. ✅ `Union/frontend/src/presentation/perfil/`
   - `.gitkeep` (para rastrear en git)
   - `README.md` con documentación de propósito y componentes esperados

2. ✅ `Union/frontend/src/presentation/carpetas/`
   - `.gitkeep`
   - `README.md` con documentación

3. ✅ `Union/frontend/src/presentation/publicaciones/`
   - `.gitkeep`
   - `README.md` con documentación

4. ✅ `Union/frontend/src/presentation/seguimiento/`
   - `.gitkeep`
   - `README.md` con documentación

5. ✅ `Union/frontend/src/presentation/shared/`
   - `.gitkeep`
   - `README.md` con documentación

### Contenido de cada Carpeta

Cada carpeta contiene:

- **.gitkeep**: Archivo vacío que garantiza que git rastree la carpeta incluso si está vacía.
- **README.md**: Documento que describe:
  - **Propósito**: Breve descripción de qué componentes vivirán en esa carpeta
  - **Componentes**: Lista de componentes esperados con referencias a las tareas (T###) que los implementarán
  - **Trazabilidad**: HUs, RFs, clarificaciones y tareas relacionadas
  - **Notas**: Decisiones de diseño y restricciones

### Alineación con Especificaciones

Según **plan.md** §"Project Structure":

✅ `presentation/perfil/` — Pantalla de perfil propio y ajeno, edición, foto  
✅ `presentation/carpetas/` — CRUD de carpetas con diálogos  
✅ `presentation/publicaciones/` — Editar/eliminar publicaciones, guardar en carpetas  
✅ `presentation/seguimiento/` — Botón de seguimiento  
✅ `presentation/shared/` — Modal de confirmación, mensajes de error centralizados  

Cada README.md documenta explícitamente:
- Componentes que se implementarán (según tasks.md T019–T075)
- Historias de Usuario cubiertas (HU-01..HU-13)
- Requisitos funcionales (RF-01..RF-49)
- Clarificaciones incorporadas (A1..A10)
- Tasks que tocan esa carpeta

---

## Decisiones de Diseño

### 1. Organización por Funcionalidad, no por Tipo

Las carpetas están organizadas por **funcionalidad del negocio** (perfil, carpetas, publicaciones, seguimiento), no por tipo técnico (containers, components, hooks).

**Justificación** (plan.md): Evita solapamiento de lógica y mejora colocación.

### 2. Carpeta `shared/` para Componentes Reutilizables

Diálogos, mensajes de error y componentes que se usan en varias funcionalidades viven en `shared/`, siguiendo arquitectura limpia.

**Justificación** (tasks.md T065–T068): Reutilización y centralización de mensajes.

### 3. `.gitkeep` + `README.md`

Cada carpeta tiene:
- **.gitkeep**: Garantiza que git rastree carpetas vacías (buena práctica)
- **README.md**: Documentación de propósito (reduce fricción para nuevos desarrolladores)

---

## Verificación Final

```bash
$ ls -la Union/frontend/src/presentation/ | grep -E "perfil|carpetas|publicaciones|seguimiento|shared"
drwxrwxr-x  2  ...  4096 Oct  8 14:07 carpetas
drwxrwxr-x  2  ...  4096 Oct  8 14:07 perfil
drwxrwxr-x  2  ...  4096 Oct  8 14:07 publicaciones
drwxrwxr-x  2  ...  4096 Oct  8 14:07 seguimiento
drwxrwxr-x  2  ...  4096 Oct  8 14:07 shared
```

✅ Todas las carpetas creadas  
✅ Archivos `.gitkeep` presentes  
✅ `README.md` documentados en cada carpeta  

---

## Próximas Tareas (NO EJECUTAR)

- **T002**: Crear estructura de `application/` (puertos, servicios, DTOs)
- **T003**: Crear estructura de `tests/`
- **T004**: Preparar `.env.example`
- **T005**: Registrar endpoints en `apiEndpoints.ts`
- ... (T006 en adelante)

---

**Status**: ✅ **T001 COMPLETADA**

No avanzar con T002 ni posteriores. Esta tarea es independiente ([P]) y no bloquea ni depende de otras.
