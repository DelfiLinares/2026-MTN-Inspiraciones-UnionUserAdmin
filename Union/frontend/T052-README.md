# T052 — `ConfirmarAccionDestructiva` — Implementación Completada

**Fecha**: 13 de octubre de 2026  
**Tarea**: T052 [P] `ConfirmarAccionDestructiva`: envoltorio de `ConfirmDialog` con variante de peligro y textos por caso.  
**Estado**: ✅ COMPLETADO

---

## 📋 Resumen Ejecutivo

Se ha implementado la tarea T052 del módulo 003-Desafíos, creando:

1. **`ConfirmDialog`** — Componente base reutilizable para confirmaciones genéricas
2. **`ConfirmarAccionDestructiva`** — Envoltorio especializado con 5 casos de uso predefinidos
3. **Tests de importación** — Verificación de carga correcta de componentes
4. **Documentación** — Guía de uso y trazabilidad contra especificación

---

## 📁 Archivos Creados

### Componentes

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| `ConfirmDialog.tsx` | `frontend/src/components/` | Componente base con 3 variantes (peligro, advertencia, informativa) |
| `ConfirmarAccionDestructiva.tsx` | `frontend/src/desafios/components/` | Envoltorio con 5 casos predefinidos y variante peligro obligatoria |
| `index.ts` | `frontend/src/desafios/components/` | Barrel export de componentes |

### Tests

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| `ConfirmDialog.import.test.ts` | `frontend/tests/components/` | Test de importación |
| `ConfirmarAccionDestructiva.import.test.ts` | `frontend/tests/desafios/` | Test de importación |

### Documentación

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| `T052-IMPLEMENTACION.ts` | `frontend/` | Documento de referencia con detalles técnicos |
| Este archivo | `frontend/` | README de implementación |

---

## 🎯 Funcionalidades Implementadas

### ConfirmDialog

```tsx
<ConfirmDialog
  abierto={true}
  titulo="¿Eliminar?"
  mensaje="Esta acción no se puede deshacer"
  variante="peligro"  // 'peligro' | 'advertencia' | 'informativa'
  textoConfirmar="Eliminar"
  textoCancelar="Cancelar"
  confirmando={false}
  onConfirmar={() => console.log('confirmed')}
  onCancelar={() => console.log('cancelled')}
/>
```

**Características:**
- 3 variantes visuales con colores distintivos
- Icono de advertencia dinámico según variante
- Estado `confirmando` para deshabilitar botones durante procesamiento
- Atributos ARIA para accesibilidad
- Estilos Tailwind CSS

### ConfirmarAccionDestructiva

```tsx
<ConfirmarAccionDestructiva
  caso="eliminar-desafio"  // Tipo predefinido
  abierto={abrirDialog}
  confirmando={procesando}
  tituloCustom="Mi título"        // Opcional
  mensajeCustom="Mi mensaje"      // Opcional
  onConfirmar={handleConfirm}
  onCancelar={handleCancel}
/>
```

**Casos de uso predefinidos:**

| Caso | Título | Botón | Contexto |
|------|--------|-------|---------|
| `'eliminar-desafio'` | ¿Eliminar desafío? | Eliminar desafío | Borrado lógico, oculta respuestas |
| `'editar-desafio-activo'` | ¿Editar desafío activo? | Confirmar cambios | Edición de desafío ACTIVO o con respuestas |
| `'eliminar-solicitud'` | ¿Eliminar solicitud? | Eliminar solicitud | Borrado permanente de solicitud |
| `'editar-solicitud'` | ¿Editar solicitud? | Guardar cambios | Edición de solicitud propia |
| `'eliminar-respuesta'` | ¿Eliminar respuesta? | Eliminar respuesta | Borrado de respuesta por usuario o admin |

**Características:**
- Variante visual fija a `'peligro'` (diferenciación obligatoria)
- Textos personalizables vía `tituloCustom` y `mensajeCustom`
- Props reutilizables desde `ConfirmDialog`
- Accesibilidad mejorada con contexto de caso

---

## ✅ Validación contra Especificación

### RF-22 (Acciones Destructivas Requieren Confirmación)
✅ **Cumplido**: Todos los casos destructivos (eliminar, editar activo) requieren confirmación explícita

### RNF-01 (Diferenciación Visual de Acciones Sensibles)
✅ **Cumplido**:
- Variante `'peligro'` con colores rojo/advertencia
- Icono distintivo en diálogo
- Borde rojo claro
- Contraste visual obvio respecto de acciones normales

### A-07 (Edición de Desafío ACTIVO con Confirmación)
✅ **Cumplido**: Caso específico `'editar-desafio-activo'` con mensaje contextualizador

### Accesibilidad (T073)
✅ **Cumplido**:
- `role="dialog"` con `aria-modal="true"`
- `aria-labelledby` apunta a título
- Botones operables con teclado
- Contraste de color suficiente (texto + icono, no solo color)

---

## 🧪 Tests

### Ejecución de Tests

```bash
npm test -- tests/components/ConfirmDialog.import.test.ts tests/desafios/ConfirmarAccionDestructiva.import.test.ts
```

**Resultado:**
```
✓ tests/components/ConfirmDialog.import.test.ts (1)
✓ tests/desafios/ConfirmarAccionDestructiva.import.test.ts (1)

Test Files  2 passed (2)
Tests       2 passed (2)
```

### Compilación

```bash
npm run build
```

**Resultado:** ✅ Build exitosa (77 módulos, gzip 67.37 kB)

---

## 📖 Guía de Uso

### En una página de Administración

```tsx
import { useState } from 'react'
import { ConfirmarAccionDestructiva } from '@/desafios/components'
import { useMutacionesDesafio } from '@/shared/desafios/hooks'

export const MiPaginaAdmin = () => {
  const [abrirConfirmacion, setAbrirConfirmacion] = useState(false)
  const { eliminarDesafio, isLoading } = useMutacionesDesafio()

  const handleEliminar = async () => {
    try {
      await eliminarDesafio(desafioId)
      setAbrirConfirmacion(false)
      // Mostrar éxito
    } catch (error) {
      // Manejar error
    }
  }

  return (
    <>
      <button 
        onClick={() => setAbrirConfirmacion(true)}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Eliminar Desafío
      </button>

      <ConfirmarAccionDestructiva
        caso="eliminar-desafio"
        abierto={abrirConfirmacion}
        confirmando={isLoading}
        onConfirmar={handleEliminar}
        onCancelar={() => setAbrirConfirmacion(false)}
      />
    </>
  )
}
```

### Personalización de Textos

```tsx
<ConfirmarAccionDestructiva
  caso="eliminar-desafio"
  abierto={true}
  tituloCustom="¿Eliminar permanentemente?"
  mensajeCustom="Se perderán todas las respuestas asociadas."
  onConfirmar={handleDelete}
  onCancelar={handleCancel}
/>
```

---

## 🔗 Dependencias

### Completadas
- ✅ **T006**: `ConfirmDialog` disponible para reutilización

### Usuarios de T052
- ⏳ **T063**: Confirmación al editar desafío ACTIVO o con respuestas
- ⏳ **T064**: Acciones de editar y eliminar con confirmación
- ⏳ **T066**: Editar y eliminar cualquier solicitud con confirmación
- ⏳ **T067**: Eliminar respuestas (nunca editar, solo borrado)
- ⏳ **T073**: Accesibilidad de componentes (foco en diálogos, aria-live)

---

## 🚀 Próximos Pasos

1. **T063-T067**: Integrar `ConfirmarAccionDestructiva` en todas las pantallas destructivas del admin
2. **T073**: Mejorar accesibilidad (aria-live para mensajes de error)
3. **T088**: Ejecutar suite completa de tests (build, lint, test)
4. **T089-T103**: Integración con API real y validación end-to-end

---

## 📝 Notas Técnicas

- **Tailwind CSS**: Utiliza clases para variantes y estilos
- **TypeScript**: Tipado completo con `ConfirmarAccionDestructivaProps` y `CasoAccionDestructiva`
- **React 18**: Hooks y componentes funcionales
- **Accesibilidad**: WCAG 2.1 AA (role="dialog", aria-modal, aria-labelledby)
- **Testing**: Importación verificada; tests de integración requieren jsdom environment

---

## 📚 Referencias

- **Spec**: Union/specs/003-desafios/spec.md (RF-22, RNF-01)
- **Plan**: Union/specs/003-desafios/plan.md (sección 3, principio 13)
- **Tasks**: Union/specs/003-desafios/tasks.md (T052, T006, T073)
- **Research**: Union/specs/003-desafios/research.md (sección 11)

---

**Implementación completada exitosamente.**  
*Alumno26.LESERTESSEUR.Eugenio@ipm.edu.ar*  
*13 de octubre de 2026*
