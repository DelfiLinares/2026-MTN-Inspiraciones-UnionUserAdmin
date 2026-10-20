# Especificación — 008 Recuperación de Contraseña

**Versión**: 1.0  
**Estado**: ✅ Especificación Completa  
**Fecha**: 2026-10-20  
**Módulo**: 008 Recuperación de Cuenta y Contraseña  

---

## 1. Resumen Ejecutivo

El módulo **Recuperación de Contraseña** permite que un usuario que olvidó su contraseña acceda desde la pantalla de login a un flujo de recuperación donde ingresa su correo electrónico, recibe confirmación visual neutral, y puede regresar al login cuando lo desee.

**Objetivo**: Crear una interfaz frontend-only que facilite el inicio del proceso de recuperación sin implementar backend, API REST, envío real de correos ni verificación de cuentas.

**Stack**: React + TypeScript  
**Alcance**: Frontend únicamente (MVP)  
**Usuarios**: Personas que olvidaron su contraseña  

---

## 2. Historias de Usuario

### HU-001: Acceder a Recuperación desde Login

**Categoría**: Navegación  
**Prioridad**: P1 - CRÍTICA  
**Puntos de historia**: 5  

**Como** usuario que olvidé mi contraseña  
**Quiero** acceder a la opción de recuperación desde la pantalla de login  
**Para** iniciar el proceso de recuperación de mi cuenta.

**Criterios de Aceptación**:

- [ ] La pantalla de login incluye un enlace/control que dice "¿Olvidaste tu contraseña?"
- [ ] El enlace está posicionado estratégicamente (cerca del formulario de login)
- [ ] Al hacer clic, navego a la pantalla de recuperación de contraseña
- [ ] La navegación es inmediata (sin recargas)
- [ ] El enlace visualmente se distingue como interactivo (color, subrayado, cursor pointer)

**Escenarios de Aceptación**:
1. **Escenario 1: Acceso exitoso a recuperación**
   - Estoy en la pantalla de login
   - Veo el enlace "¿Olvidaste tu contraseña?"
   - Hago clic en el enlace
   - Soy redirigido a la pantalla de recuperación

2. **Escenario 2: Regresar al login desde recuperación**
   - Estoy en la pantalla de recuperación
   - Veo un botón/enlace para regresar al login
   - Hago clic en él
   - Regreso a la pantalla de login

**Notas técnicas**:
- Usar React Router para la navegación entre rutas
- Las rutas podrían ser: `/login` y `/login/recuperar` o `/recuperar-contrasena`
- No requiere autenticación
- No requiere verificación de estado

---

### HU-002: Ver Pantalla de Recuperación

**Categoría**: Interfaz de Usuario  
**Prioridad**: P1 - CRÍTICA  
**Puntos de historia**: 3  

**Como** usuario en la pantalla de recuperación  
**Quiero** ver un formulario claro con instrucciones  
**Para** entender qué debo hacer para recuperar mi contraseña.

**Criterios de Aceptación**:

- [ ] La pantalla tiene un título que indica "Recuperación de Contraseña" o similar
- [ ] Hay un texto explicativo que dice aproximadamente "Ingresa el correo electrónico asociado a tu cuenta"
- [ ] El campo de correo tiene una etiqueta visible ("Correo electrónico" o "Email")
- [ ] El formulario es responsive (se adapta a mobile, tablet, desktop)
- [ ] El diseño mantiene coherencia visual con el login existente
- [ ] Hay un botón destacado para "Continuar" o "Recuperar"
- [ ] Hay un enlace/botón para regresar al login

**Escenarios de Aceptación**:
1. **Escenario 1: Ver formulario en desktop**
   - Ancho >= 768px
   - El formulario ocupa un ancho razonable (300-500px)
   - Los elementos están centrados o alineados coherentemente

2. **Escenario 2: Ver formulario en mobile**
   - Ancho < 768px
   - El formulario se adapta al ancho disponible
   - El campo de correo es fácil de tocar (altura >= 44px)
   - No hay scroll horizontal

**Notas técnicas**:
- Considerar CSS media queries o Tailwind responsive
- Verificar accesibilidad: <label> vinculado con <input>
- Botón principal debe ser prominente

---

### HU-003: Ingresar Correo Electrónico

**Categoría**: Interacción de Formulario  
**Prioridad**: P1 - CRÍTICA  
**Puntos de historia**: 3  

**Como** usuario en la pantalla de recuperación  
**Quiero** ingresar el correo electrónico de mi cuenta  
**Para** poder avanzar con el proceso de recuperación.

**Criterios de Aceptación**:

- [ ] El campo de correo acepta entrada de texto
- [ ] Puedo escribir un correo sin restricciones innecesarias (ej: no limitar a 255 caracteres de forma artificial)
- [ ] Los espacios en blanco al inicio y final se eliminan automáticamente (trim)
- [ ] El campo tiene un placeholder que sugiere el formato (ej: "usuario@ejemplo.com")
- [ ] El campo mantiene el enfoque después de escribir
- [ ] Puedo editar el correo después de escribir (no es solo lectura)

**Escenarios de Aceptación**:
1. **Escenario 1: Ingresar correo válido**
   - Escribo: "usuario@dominio.com"
   - El campo muestra exactamente lo que escribí
   - Puedo editar libremente

2. **Escenario 2: Ingresar correo con espacios**
   - Escribo: "  usuario@dominio.com  "
   - El sistema automáticamente trimea los espacios
   - Se valida como: "usuario@dominio.com"

3. **Escenario 3: Campo vacío**
   - El campo se ve vacío
   - El placeholder es visible como sugerencia

**Notas técnicas**:
- `<input type="email">` o `type="text"` con validación manual
- Implementar `trim()` en el manejador de onChange
- Considerar `placeholder` attribute

---

### HU-004: Validar Formato de Correo

**Categoría**: Validación  
**Prioridad**: P1 - CRÍTICA  
**Puntos de historia**: 5  

**Como** sistema  
**Quiero** validar el formato del correo ingresado  
**Para** asegurar que sea un formato válido antes de permitir continuar.

**Criterios de Aceptación**:

- [ ] El campo vacío muestra el error: "El correo electrónico es requerido" o similar
- [ ] Un correo sin '@' muestra: "Ingresa un correo válido" o similar
- [ ] Un correo sin dominio (ej: "usuario@") muestra error de formato
- [ ] Un correo sin usuario (ej: "@dominio.com") muestra error de formato
- [ ] Un correo sin punto en el dominio (ej: "usuario@dominio") muestra error o es rechazado según requisitos
- [ ] Un correo válido (ej: "usuario@dominio.com") NO muestra error
- [ ] Los mensajes de error son claros y comprensibles para usuarios no técnicos
- [ ] La validación ocurre en el frontend (no requiere servidor)

**Escenarios de Aceptación**:
1. **Escenario 1: Campo vacío**
   - No he ingresado nada
   - Intento hacer clic en "Continuar"
   - Veo error: "El correo electrónico es requerido"
   - El botón "Continuar" está deshabilitado o muestra error

2. **Escenario 2: Formato inválido**
   - Ingreso: "usuariodominio" (sin @)
   - Intento continuar
   - Veo error: "Ingresa un correo válido"
   - Permanezco en el formulario

3. **Escenario 3: Formato válido**
   - Ingreso: "juan@empresa.com"
   - No veo ningún error
   - El botón "Continuar" está habilitado

**Notas técnicas**:
- Considerar regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` o similar
- Validación real de email es compleja (RFC 5322), usar regex pragmático
- Validar en onChange para feedback inmediato
- Considerar si `tipo="email"` HTML5 es suficiente o necesita validación adicional

---

### HU-005: Ver Errores de Validación

**Categoría**: Feedback de Usuario  
**Prioridad**: P1 - CRÍTICA  
**Puntos de historia**: 3  

**Como** usuario  
**Quiero** ver mensajes de error claros cuando hay problemas con el correo  
**Para** saber exactamente qué debo corregir.

**Criterios de Aceptación**:

- [ ] Los mensajes de error aparecen debajo del campo o cerca de él
- [ ] El mensaje es visible (color rojo, icono, etc.)
- [ ] El texto del error es específico (no solo "Error")
- [ ] El campo con error se distingue visualmente (borde rojo, fondo, etc.)
- [ ] Los errores desaparecen cuando corrijo el problema
- [ ] Los errores no aparecen mientras estoy escribiendo (opcional: pueden aparecer después de onBlur)
- [ ] El mensaje no es técnico (ej: no mostrar mensajes de console)

**Escenarios de Aceptación**:
1. **Escenario 1: Ver error después de hacer clic en Continuar**
   - Dejo el campo vacío
   - Hago clic en "Continuar"
   - Veo el mensaje de error
   - El campo está rodeado de rojo o tiene un icono de error

2. **Escenario 2: Corregir y desaparezca el error**
   - Veo el error
   - Escribo un correo válido
   - El error desaparece
   - El campo vuelve a su aspecto normal

**Notas técnicas**:
- Mostrar errores al hacer submit o onBlur, no en tiempo real mientras se escribe
- Usar `<div>` o `<span>` con clase CSS para mensajes de error
- Considerar accesibilidad: `aria-invalid="true"`, `aria-describedby`

---

### HU-006: Continuar Cuando Formato es Válido

**Categoría**: Flujo Principal  
**Prioridad**: P1 - CRÍTICA  
**Puntos de historia**: 5  

**Como** usuario con un correo válido ingresado  
**Quiero** hacer clic en "Continuar" y avanzar en el proceso  
**Para** recibir la confirmación del proceso de recuperación.

**Criterios de Aceptación**:

- [ ] El botón "Continuar" está habilitado cuando el correo es válido
- [ ] El botón está deshabilitado o no es clickeable cuando hay errores
- [ ] Al hacer clic en "Continuar" con correo válido, avanzo a la pantalla de confirmación
- [ ] La pantalla de confirmación aparece sin recarga de página
- [ ] No hay llamadas reales a API o servidor
- [ ] El estado de "procesando" puede simularse visualmente (ej: spinner brevemente)

**Escenarios de Aceptación**:
1. **Escenario 1: Continuar exitosamente**
   - Ingreso: "juan@empresa.com"
   - El botón "Continuar" está habilitado y visible
   - Hago clic en "Continuar"
   - Veo la pantalla de confirmación

2. **Escenario 2: Botón deshabilitado con errores**
   - Ingreso: "correo_inválido"
   - El botón "Continuar" está deshabilitado (grisado, no interactivo)
   - No puedo hacer clic en él

**Notas técnicas**:
- `disabled` attribute en el botón o condicional en el manejador onClick
- No realizar peticiones HTTP
- Posible breve simulación de carga (setTimeout, no async/await con API)

---

### HU-007: Ver Confirmación Neutral

**Categoría**: Confirmación  
**Prioridad**: P1 - CRÍTICA  
**Puntos de historia**: 5  

**Como** usuario después de completar el formulario  
**Quiero** ver un mensaje que confirme el proceso  
**Para** saber que mi solicitud ha sido registrada.

**Criterios de Aceptación**:

- [ ] Aparece una pantalla/estado de confirmación diferente del formulario
- [ ] El mensaje dice aproximadamente: "Si el correo corresponde a una cuenta registrada, recibirás instrucciones para recuperar tu contraseña"
- [ ] El mensaje NO afirma que se envió un correo real
- [ ] El mensaje NO revela si el correo existe o no existe
- [ ] El mensaje es claro y comprensible
- [ ] El mensaje mantiene coherencia visual con el resto de la aplicación
- [ ] Hay un botón/enlace para regresar al login

**Escenarios de Aceptación**:
1. **Escenario 1: Ver confirmación después de continuar**
   - Completo el formulario con "juan@empresa.com"
   - Hago clic en "Continuar"
   - Veo un mensaje neutral de confirmación
   - El mensaje no dice "Se envió un correo"
   - Veo opción para regresar al login

2. **Escenario 2: Mensajes neutrales**
   - Si ingreso un correo que existe: veo el mismo mensaje
   - Si ingreso un correo que NO existe: veo el mismo mensaje (el frontend no sabe)
   - No hay diferencia visual entre ambos casos

**Notas técnicas**:
- Posible icono de éxito (checkmark, etc.)
- Puede ser un componente diferente o un estado del mismo componente
- El mensaje debe ser exactamente neutral (no verificar si existe cuenta)

---

### HU-008: Regresar al Login desde Recuperación

**Categoría**: Navegación  
**Prioridad**: P1 - CRÍTICA  
**Puntos de historia**: 3  

**Como** usuario en cualquier paso del proceso de recuperación  
**Quiero** poder regresar al login  
**Para** acceder a mi cuenta si recuerdo mi contraseña.

**Criterios de Aceptación**:

- [ ] Hay un botón/enlace "Regresar al Login" o "Cancelar" en el formulario
- [ ] Hay un botón/enlace para regresar después de ver la confirmación
- [ ] Al hacer clic, regreso a la pantalla de login
- [ ] Los datos del formulario se limpian (no persisten)
- [ ] La navegación es inmediata (sin recargas innecesarias)
- [ ] El botón es visualmente accesible

**Escenarios de Aceptación**:
1. **Escenario 1: Regresar desde formulario**
   - Estoy en el formulario de recuperación
   - Escribí un correo (ej: "juan@empresa.com")
   - Hago clic en "Regresar al Login"
   - Vuelvo al login
   - El correo que escribí NO aparece en futuras visitas

2. **Escenario 2: Regresar desde confirmación**
   - Estoy en la pantalla de confirmación
   - Hago clic en "Regresar al Login"
   - Vuelvo al login

**Notas técnicas**:
- Usar `useNavigate()` de React Router
- Limpiar el estado del formulario al navegar
- Considerar si el enlace debe estar siempre visible (ej: botón flotante) o solo en ciertos lugares

---

## 3. Requisitos Funcionales Numerados

### RF-001: Enlace de Recuperación en Login
**Prioridad**: P1 - CRÍTICA  
**Dependencia**: Ninguna  

La pantalla de login debe mostrar un enlace interactivo que diga "¿Olvidaste tu contraseña?" o similar que lleve a la pantalla de recuperación.

- **Criterio**: El enlace debe estar visible en la pantalla de login
- **Criterio**: El enlace debe ser clickeable y navegar a `/recuperar-contrasena` (ruta a definir en plan.md)
- **Criterio**: No debe requerir autenticación
- **Criterio**: Debe responder inmediatamente (sin recargas)

---

### RF-002: Pantalla de Recuperación Renderizada
**Prioridad**: P1 - CRÍTICA  
**Dependencia**: RF-001  

La pantalla de recuperación debe mostrar un formulario con todos los elementos necesarios.

- **Criterio**: Mostrar título (ej: "Recuperación de Contraseña")
- **Criterio**: Mostrar texto explicativo
- **Criterio**: Mostrar campo de entrada para correo
- **Criterio**: Mostrar botón "Continuar"
- **Criterio**: Mostrar enlace "Regresar al Login"
- **Criterio**: Todos los elementos deben ser accesibles (labels, etc.)

---

### RF-003: Campo de Correo Aceptar Entrada
**Prioridad**: P1 - CRÍTICA  
**Dependencia**: RF-002  

El campo de correo debe aceptar entrada de texto del usuario.

- **Criterio**: Debe ser un campo `<input>` funcional
- **Criterio**: Debe aceptar caracteres alfanuméricos y especiales (ej: @, ., -)
- **Criterio**: Debe tener placeholder indicativo
- **Criterio**: Debe tener una `<label>` asociada
- **Criterio**: Debe aceptar hasta 255 caracteres sin limitación artificial

---

### RF-004: Trimear Espacios en Blanco
**Prioridad**: P1 - CRÍTICA  
**Dependencia**: RF-003  

El campo debe limpiar espacios innecesarios al inicio y final del correo.

- **Criterio**: Si ingreso "  usuario@dominio.com  ", se valida como "usuario@dominio.com"
- **Criterio**: El usuario no debe ver los espacios en el campo
- **Criterio**: Ocurre automáticamente sin necesidad de acción manual

---

### RF-005: Validar Campo Requerido
**Prioridad**: P1 - CRÍTICA  
**Dependencia**: RF-003, RF-004  

El formulario debe validar que el correo no esté vacío.

- **Criterio**: Mostrar error "El correo electrónico es requerido" cuando está vacío
- **Criterio**: El error aparece al intentar hacer clic en "Continuar"
- **Criterio**: El error desaparece cuando se ingresa texto
- **Criterio**: El botón "Continuar" debe estar deshabilitado si está vacío

---

### RF-006: Validar Formato de Correo
**Prioridad**: P1 - CRÍTICA  
**Dependencia**: RF-005  

El formulario debe validar que el correo tenga un formato válido.

- **Criterio**: Aceptar: usuario@dominio.com, nombre.apellido@empresa.co.uk, etc.
- **Criterio**: Rechazar: "usuariodominio" (sin @), "usuario@" (sin dominio), "@dominio" (sin usuario)
- **Criterio**: Rechazar: "usuario @dominio.com" (espacio antes de @)
- **Criterio**: Mostrar mensaje: "Ingresa un correo electrónico válido" o similar
- **Criterio**: Usar validación frontend con regex pragmático

---

### RF-007: Mostrar Errores de Validación
**Prioridad**: P1 - CRÍTICA  
**Dependencia**: RF-005, RF-006  

Los errores de validación deben mostrarse clara y accesiblemente.

- **Criterio**: Aparecen debajo del campo de correo
- **Criterio**: Visibles con color rojo o icono de error
- **Criterio**: Texto claro y específico
- **Criterio**: Campo con error se distingue visualmente (borde rojo, etc.)
- **Criterio**: Desaparecen cuando se corrige el error
- **Criterio**: Compatible con lectores de pantalla (`aria-invalid`, `aria-describedby`)

---

### RF-008: Botón Continuar Habilitado/Deshabilitado
**Prioridad**: P1 - CRÍTICA  
**Dependencia**: RF-005, RF-006  

El botón "Continuar" debe estar habilitado solo cuando el correo es válido.

- **Criterio**: Habilitado (clickeable, color normal) cuando el correo es válido
- **Criterio**: Deshabilitado (grisado, no clickeable) cuando hay errores
- **Criterio**: Usar atributo `disabled` o condicional en onClick
- **Criterio**: Debe ser visualmente claro cuándo está activo/inactivo

---

### RF-009: Navegar a Confirmación
**Prioridad**: P1 - CRÍTICA  
**Dependencia**: RF-008  

Cuando el usuario hace clic en "Continuar" con correo válido, debe ir a la pantalla de confirmación.

- **Criterio**: La navegación es inmediata (sin recargas de página)
- **Criterio**: No hay llamadas a servidor o API
- **Criterio**: Se puede simular brevemente un estado de carga
- **Criterio**: La pantalla de confirmación es diferente visualmente del formulario

---

### RF-010: Mostrar Confirmación Neutral
**Prioridad**: P1 - CRÍTICA  
**Dependencia**: RF-009  

La pantalla de confirmación debe mostrar un mensaje neutral que no revele si la cuenta existe.

- **Criterio**: Mensaje: "Si el correo corresponde a una cuenta registrada, recibirás instrucciones..."
- **Criterio**: NO debe decir "Se envió un correo" o "Correo enviado"
- **Criterio**: NO debe diferenciar entre correos válidos e inválidos
- **Criterio**: Debe ser el MISMO mensaje para cualquier correo ingresado
- **Criterio**: Visualmente diferente del formulario

---

### RF-011: Mostrar Opción Regresar desde Confirmación
**Prioridad**: P1 - CRÍTICA  
**Dependencia**: RF-010  

La pantalla de confirmación debe tener un botón/enlace para regresar al login.

- **Criterio**: Botón claro "Regresar al Login" o similar
- **Criterio**: Navega de vuelta a `/login`
- **Criterio**: La navegación es inmediata
- **Criterio**: Es visualmente accesible

---

### RF-012: Opción Regresar en Formulario
**Prioridad**: P1 - CRÍTICA  
**Dependencia**: RF-002  

El formulario debe tener un botón/enlace para regresar al login.

- **Criterio**: Visible en la pantalla de recuperación
- **Criterio**: Navega a `/login`
- **Criterio**: La navegación es inmediata
- **Criterio**: Los datos del formulario se limpian

---

### RF-013: Limpiar Datos al Regresar
**Prioridad**: P1 - ALTA  
**Dependencia**: RF-012  

Cuando el usuario regresa al login, los datos del formulario de recuperación deben borrarse.

- **Criterio**: Si el usuario vuelve a entrar a recuperación, el campo está vacío
- **Criterio**: No hay datos persistidos entre sesiones
- **Criterio**: El estado del formulario se reinicia

---

### RF-014: Responsive Design
**Prioridad**: P2 - ALTA  
**Dependencia**: RF-002  

La pantalla de recuperación debe adaptarse a diferentes tamaños de pantalla.

- **Criterio**: Desktop (>= 1024px): formulario centrado, ancho <= 500px
- **Criterio**: Tablet (768px - 1023px): formulario adaptado al ancho disponible
- **Criterio**: Mobile (< 768px): formulario full-width con padding, sin scroll horizontal
- **Criterio**: Todos los elementos son accesibles en cada tamaño
- **Criterio**: El campo de correo tiene altura >= 44px en mobile para fácil toque

---

### RF-015: Coherencia Visual con Login
**Prioridad**: P2 - ALTA  
**Dependencia**: RF-002  

El diseño de la pantalla de recuperación debe mantener coherencia visual con el login existente.

- **Criterio**: Mismo esquema de colores
- **Criterio**: Misma tipografía
- **Criterio**: Similar espaciado y layout
- **Criterio**: Botones con estilo consistente
- **Criterio**: No debe parecer una aplicación diferente

---

### RF-016: Prevenir Envíos Repetidos Accidentales
**Prioridad**: P2 - MEDIA  
**Dependencia**: RF-008, RF-009  

El formulario debe evitar que el usuario haga múltiples clics en "Continuar" por accidente.

- **Criterio**: Después de hacer clic en "Continuar", el botón se deshabilita brevemente
- **Criterio**: Se muestra un spinner o estado de carga
- **Criterio**: El usuario no puede hacer clic nuevamente hasta que se complete
- **Criterio**: Preparado para integración futura con API (sin implementar API real)

---

## 4. Requisitos No Funcionales

### RNF-001: Validación en Frontend
**Categoría**: Arquitectura  
**Prioridad**: P1 - CRÍTICA  

Toda validación debe ocurrir en el cliente (frontend). No se debe hacer llamadas a servidor para validar el correo.

- **Cómo verificar**: Los tests deben demostrar validación sin HTTP calls
- **Métrica**: 0 llamadas a servidor durante validación
- **Excepto**: Futuras integraciones cuando el backend esté disponible

---

### RNF-002: No Revelar Existencia de Cuenta
**Categoría**: Seguridad y Privacidad  
**Prioridad**: P1 - CRÍTICA  

El frontend no debe revelar si una cuenta existe o no existe asociada a un correo.

- **Cómo verificar**: Mensaje de confirmación es IGUAL para cualquier correo
- **Cómo verificar**: No hay diferencia visual entre "correo válido" y "correo no registrado"
- **Cómo verificar**: El frontend NO verifica contra base de datos
- **Métrica**: Un solo mensaje de confirmación neutral para todos los casos

---

### RNF-003: No Almacenar Datos Sensibles
**Categoría**: Seguridad  
**Prioridad**: P1 - CRÍTICA  

El frontend no debe almacenar contraseñas, tokens de recuperación ni información sensible.

- **Cómo verificar**: No hay localStorage, sessionStorage ni state persistido con datos sensibles
- **Cómo verificar**: El correo ingresado no se persiste entre sesiones
- **Cómo verificar**: No hay cookies con información de recuperación
- **Métrica**: Cero datos sensibles almacenados

---

### RNF-004: Sin Backend, API ni Correos Reales
**Categoría**: Alcance  
**Prioridad**: P1 - CRÍTICA  

No implementar backend, API REST, envío real de correos ni verificación de cuentas.

- **Cómo verificar**: No hay carpetas de backend en el proyecto
- **Cómo verificar**: No hay llamadas HTTP a servidor (fetch, axios, etc.)
- **Cómo verificar**: No hay integraciones con servicios de correo (SendGrid, AWS SES, etc.)
- **Cómo verificar**: No hay cambio de contraseña efectivo
- **Métrica**: Cero líneas de código backend, cero HTTP calls (excepto futuras integraciones)

---

### RNF-005: Interfaz Intuitiva
**Categoría**: Usabilidad  
**Prioridad**: P2 - ALTA  

La interfaz debe ser fácil de entender sin necesidad de instrucciones adicionales.

- **Cómo verificar**: Tests de usabilidad (análisis heurístico)
- **Cómo verificar**: Labels visibles, errores claros, flujo lógico
- **Cómo verificar**: El usuario entiende qué hacer en cada paso
- **Métrica**: Accesibilidad WCAG AA mínimo

---

### RNF-006: Performance: Navegación Rápida
**Categoría**: Performance  
**Prioridad**: P2 - ALTA  

La navegación entre login y recuperación debe ser instantánea.

- **Cómo verificar**: Medir tiempo de cambio de ruta (< 100ms)
- **Cómo verificar**: No hay recargas de página
- **Cómo verificar**: Transiciones suaves (opcional, no son requeridas)
- **Métrica**: Navegación instantánea (sin delay perceptible)

---

### RNF-007: Validación Sincrónica
**Categoría**: Performance  
**Prioridad**: P2 - MEDIA  

La validación del correo debe ser instantánea (sin delays artificiales).

- **Cómo verificar**: Feedback inmediato al escribir o al enviar
- **Cómo verificar**: No hay esperas innecesarias
- **Cómo verificar**: Los tests confirman validación < 10ms
- **Métrica**: Validación sincrónica en tiempo real

---

### RNF-008: Testing de Validaciones
**Categoría**: Calidad  
**Prioridad**: P2 - ALTA  

Todas las reglas de validación deben tener tests unitarios.

- **Cómo verificar**: Tests con Vitest o Jest
- **Cómo verificar**: Cada caso de validación cubierto
- **Cómo verificar**: Coverage >= 80% en lógica de validación
- **Métricas**: 
  - Test: No permitir campo vacío
  - Test: Rechazar correos sin @
  - Test: Rechazar correos sin dominio
  - Test: Aceptar formatos válidos
  - Test: Trimear espacios
  - Mínimo: 5 tests de validación

---

### RNF-009: Separación de Responsabilidades
**Categoría**: Arquitectura  
**Prioridad**: P2 - ALTA  

La lógica de validación debe estar separada de los componentes React.

- **Cómo verificar**: Existe un módulo/archivo para validación (no mixido en componentes)
- **Cómo verificar**: Los servicios de validación pueden testearse independientemente
- **Cómo verificar**: Los componentes usan servicios, no contienen lógica de negocio
- **Métrica**: Validadores en archivo separado (ej: `recoveryValidation.ts`)

---

### RNF-010: Responsive Design (WCAG)
**Categoría**: Accesibilidad  
**Prioridad**: P2 - ALTA  

La interfaz debe ser responsive y accesible en diferentes dispositivos.

- **Cómo verificar**: Funciona en mobile (320px), tablet (768px), desktop (1024px+)
- **Cómo verificar**: Sin scroll horizontal
- **Cómo verificar**: Elementos clickeables tienen >= 44px de altura en mobile
- **Cómo verificar**: Cumple WCAG AA (etiquetas, colores, contraste)
- **Métrica**: Funcional en 3 breakpoints mínimo

---

### RNF-011: Sin Código en Especificación
**Categoría**: Proceso  
**Prioridad**: P1 - CRÍTICA  

No implementar código durante las fases de especificación, aclaración, checklist y planificación.

- **Cómo verificar**: Solo documentos (.md) en esta fase
- **Cómo verificar**: Cero archivos .tsx, .ts, .jsx con código de negocio
- **Cómo verificar**: Solo comentarios y ejemplos, no código ejecutable
- **Cuándo aplica**: Hasta que se apruebe la especificación completa y se generen tasks.md

---

## 5. Casos Borde

### CB-001: Correo Muy Largo
**Descripción**: El usuario ingresa un correo extremadamente largo (ej: 500 caracteres).  
**Comportamiento esperado**: 
- Debe aceptarse sin truncar (hasta ~255 caracteres estándar)
- Debe validarse correctamente si cumple el formato
- No debe causar errores de UI (overflow, etc.)

**Cómo validar**:
```
Input: aaaaa...aaaaa@bbbbb...bbbbb.com (500+ caracteres)
Expected: Validarse según regex, aceptarse si es válido
Result: No crashes, sin truncado visual
```

---

### CB-002: Correo con Caracteres Especiales
**Descripción**: El usuario ingresa caracteres especiales válidos en correos (ej: +, -, .).  
**Comportamiento esperado**:
- `usuario+tag@dominio.com` debe ser válido
- `usuario-nombre@dominio.com` debe ser válido
- `usuario.nombre@dominio.com` debe ser válido
- `usuario_nombre@dominio.com` podría ser válido según regex

**Cómo validar**:
```
Input: usuario+tag@dominio.com
Expected: Válido, sin errores
```

---

### CB-003: Correo en Minúsculas vs Mayúsculas
**Descripción**: El usuario ingresa correo con mayúsculas (ej: Usuario@Dominio.COM).  
**Comportamiento esperado**:
- Debe aceptarse (emails son case-insensitive)
- Puede normalizarse a minúsculas internamente (opcional)
- No debe mostrar error

**Cómo validar**:
```
Input: Usuario@Dominio.COM
Expected: Válido, sin errores
```

---

### CB-004: Espacio en Medio del Correo
**Descripción**: El usuario ingresa correo con espacio en medio (ej: "usuario @dominio.com").  
**Comportamiento esperado**:
- Debe rechazarse (espacios en medio no son válidos en correos)
- Mostrar error: "Ingresa un correo válido"

**Cómo validar**:
```
Input: usuario @dominio.com (espacio antes de @)
Expected: Error de validación
```

---

### CB-005: Solo Espacios en Blanco
**Descripción**: El usuario ingresa solo espacios ("   ").  
**Comportamiento esperado**:
- Después de trimear, el campo queda vacío
- Debe mostrarse error: "El correo electrónico es requerido"
- El botón "Continuar" está deshabilitado

**Cómo validar**:
```
Input: "   " (solo espacios)
After trim: "" (vacío)
Expected: Error requerido
```

---

### CB-006: Múltiples @ en el Correo
**Descripción**: El usuario ingresa correo con múltiples @ (ej: "usuario@@dominio.com").  
**Comportamiento esperado**:
- Debe rechazarse
- Mostrar error: "Ingresa un correo válido"

**Cómo validar**:
```
Input: usuario@@dominio.com
Expected: Error de validación
```

---

### CB-007: Sin Punto en el Dominio
**Descripción**: El usuario ingresa correo sin punto en dominio (ej: "usuario@dominio").  
**Comportamiento esperado**:
- Podría rechazarse según regex (RFC mínimo: dominio.extensión)
- O aceptarse si el regex es muy permisivo
- **NOTA**: Aclaración requerida en clarifications.md (ver sección 6)

**Cómo validar**:
```
Input: usuario@dominio (sin extensión)
Expected: ??? (Requiere definición en clarifications.md)
```

---

### CB-008: Correo Válido Rápida Edición
**Descripción**: El usuario escribe rápidamente, corrige, escribe nuevamente.  
**Comportamiento esperado**:
- El estado del formulario se actualiza correctamente
- No hay "ghost" validations
- La última entrada es la que se valida

**Cómo validar**:
```
Acciones:
1. Escribir: usuari (inválido)
2. Corregir a: usuario@dominio.com (válido)
3. Error desaparece, botón se habilita
```

---

### CB-009: Click en Continuar Sin Llenar Campo
**Descripción**: El usuario hace clic en "Continuar" con el campo vacío.  
**Comportamiento esperado**:
- Se muestra error: "El correo electrónico es requerido"
- El usuario permanece en el formulario
- El campo recibe el enfoque (opcional)

**Cómo validar**:
```
Acción: Click en Continuar (campo vacío)
Expected: Error visible, usuario en formulario
```

---

### CB-010: Regresar al Login Desde Confirmación
**Descripción**: El usuario completa el formulario, ve confirmación, y regresa al login.  
**Comportamiento esperado**:
- Regresa a la pantalla de login
- El formulario de recuperación se reinicia
- Si entra nuevamente a recuperación, el campo está vacío

**Cómo validar**:
```
Flujo:
1. Completo formulario
2. Veo confirmación
3. Click en "Regresar"
4. Estoy en login
5. Click en "¿Olvidaste contraseña?"
6. Campo de correo está vacío
```

---

### CB-011: Click Repetido en Continuar
**Descripción**: El usuario hace clic múltiples veces en "Continuar" rápidamente.  
**Comportamiento esperado**:
- Solo se procesa una solicitud
- Se deshabilita el botón después del primer clic
- Se evita múltiples transiciones

**Cómo validar**:
```
Acción: Click 3 veces rápidamente en "Continuar"
Expected: Botón deshabilitado después de primer clic, solo una navegación
```

---

### CB-012: Navegación Directa a Ruta de Recuperación
**Descripción**: El usuario ingresa directamente la URL de recuperación sin pasar por login.  
**Comportamiento esperado**:
- La pantalla se renderiza correctamente
- Se puede usar sin autenticación (MVP sin auth)
- No hay errores

**Cómo validar**:
```
Acción: Navegar a /recuperar-contrasena directamente (copiar URL)
Expected: Pantalla se carga correctamente
```

---

### CB-013: Pantalla Muy Pequeña (< 320px)
**Descripción**: Usuario en dispositivo con pantalla < 320px (raro pero posible).  
**Comportamiento esperado**:
- La interfaz se adapta sin quebrarse
- Todos los elementos son visibles con scroll
- No hay overflow horizontal

**Cómo validar**:
```
Viewport: 280px x 400px
Expected: Responsive, sin horizontal scroll
```

---

## 6. Ambigüedades Explícitamente Marcadas

### ⚠️ Ambigüedad A-001: Validación de Dominio sin Punto
**Descripción**: ¿Debe aceptarse "usuario@dominio" (sin extensión como .com)?  

**Contexto**: 
- RFC 5321/5322 permite técnicamente dominios sin punto
- Pero en la práctica, casi todos requieren al menos un punto
- Nuestra validación regex actual podría ser muy permisiva

**Opciones**:
1. **Opción A**: Requerir punto en dominio (ej: usuario@dominio.com) ✓ Recomendado
2. **Opción B**: Permitir "usuario@dominio" como válido
3. **Opción C**: Usar HTML5 `<input type="email">` y confiar en su validación

**Decisión a tomar en clarifications.md**:  
- Opción A es más pragmática para MVP
- Usar regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

---

### ⚠️ Ambigüedad A-002: Validación en Tiempo Real vs Al Enviar
**Descripción**: ¿Cuándo se valida el correo?

**Contexto**:
- UX contemporáneo sugiere validación en tiempo real (onChange)
- Pero puede ser frustrante ver errores mientras el usuario está escribiendo
- Alternativa: validar solo cuando el usuario hace blur o intenta enviar

**Opciones**:
1. **Opción A**: Validación en tiempo real (onChange) - El usuario ve errores mientras escribe
2. **Opción B**: Validación al hacer blur (onBlur) - Errores aparecen al salir del campo
3. **Opción C**: Validación solo al hacer submit (Click en Continuar) - Errores solo al intentar enviar
4. **Opción D**: Validación mixta (blur + submit)

**Decisión a tomar en clarifications.md**:  
- Recomendación: Opción B o D (blur o submit)
- Motivo: Menos frustrante para usuarios

---

### ⚠️ Ambigüedad A-003: Ruta de la Pantalla de Recuperación
**Descripción**: ¿Cuál debe ser la ruta exacta?

**Contexto**:
- Podría ser `/login/recuperar`
- Podría ser `/recuperar-contrasena`
- Podría ser `/forgot-password`
- Podría ser algo más complejo

**Opciones**:
1. `/login/recuperar` - Dentro del contexto de login
2. `/recuperar-contrasena` - Ruta independiente
3. `/forgot-password` - En inglés (menos recomendado)
4. `/auth/recovery` - Agrupada con auth

**Decisión a tomar en plan.md**:  
- Recomendación: `/recuperar-contrasena`
- Motivo: Clara, en español, independiente

---

### ⚠️ Ambigüedad A-004: Diseño Visual de Errores
**Descripción**: ¿Cómo se muestran exactamente los errores?

**Contexto**:
- Borde rojo en el campo
- Icono de error (X, exclamación)
- Texto en rojo o color específico
- Combinación de lo anterior
- Todavía no hay definición visual exacta

**Opciones**:
1. Solo texto en rojo debajo del campo
2. Borde rojo + icono + texto
3. Fondo rojo claro en el campo
4. Combinación según contexto

**Decisión a tomar en data-model.md o durante implementación**:  
- Se definirá en el diseño visual (figma, etc.)

---

### ⚠️ Ambigüedad A-005: Mensaje de Confirmación Exacto
**Descripción**: ¿Cuál es el texto exacto del mensaje de confirmación?

**Contexto**:
- Debe ser neutral (no revelar si cuenta existe)
- Debe ser claro y comprensible
- Pero el texto exacto no está especificado

**Opciones**:
1. "Si el correo corresponde a una cuenta registrada, recibirás instrucciones para recuperar tu contraseña."
2. "Hemos procesado tu solicitud. Si el correo es válido, recibirás un enlace de recuperación."
3. "Si el correo está asociado a una cuenta, te enviaremos instrucciones."
4. Otro formato

**Decisión a tomar en clarifications.md**:  
- Recomendación: Opción 1
- Motivo: Neutral, clara, no asume envío de correo

---

### ⚠️ Ambigüedad A-006: Botón/Enlace para Regresar
**Descripción**: ¿Debe ser un botón o un enlace?

**Contexto**:
- Botón secundario (menos prominente)
- Enlace de texto
- Icono clickeable (flecha atrás)
- Ubicación unclear

**Opciones**:
1. Botón secundario claro ("Regresar al Login")
2. Enlace de texto ("← Volver al login")
3. Icono flotante en la esquina
4. Combinación

**Decisión a tomar en plan.md o data-model.md**:  
- Se definirá en el prototipo visual

---

### ⚠️ Ambigüedad A-007: Limpieza de Datos al Regresar
**Descripción**: ¿Se limpian automáticamente los datos del formulario?

**Contexto**:
- Al navegar fuera del componente, ¿se limpia el state?
- ¿Se usa context/zustand o solo state local?
- ¿Qué sucede si el usuario abre en otra pestaña?

**Opciones**:
1. Limpiar automáticamente al desmontar el componente (unmount)
2. Limpiar al navegar (beforeLeave hook)
3. Confiar en que cada renderizado crea un estado nuevo
4. Usar localStorage con expiración

**Decisión a tomar en plan.md**:  
- Recomendación: Opción 1 o 3 (state local, sin persistencia)
- Motivo: Seguridad, simplicidad

---

### ⚠️ Ambigüedad A-008: Integración con Login Existente
**Descripción**: ¿Cómo se integra exactamente con el componente Login?

**Contexto**:
- El login ya existe
- Necesitamos agregar un enlace "¿Olvidaste tu contraseña?"
- Pero no sabemos la estructura exacta del login actual

**Opciones**:
1. Modificar el componente Login existente
2. Crear un wrapper alrededor de Login
3. Usar condicionales en el router
4. Crear un componente nuevo que incluya login + recuperación

**Decisión a tomar en plan.md**:  
- Requiere análisis del código existente del login
- Probablemente Opción 1 (agregar enlace al login)

---

### ⚠️ Ambigüedad A-009: Regex Exacto para Validación
**Descripción**: ¿Cuál es el regex exacto para validar correos?

**Contexto**:
- Regex simple: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Regex más complejo: `/^[a-zA-Z0-9+._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`
- Regex HTML5: Usar `type="email"` nativo
- RFC 5322 completo: Muy complejo

**Opciones**:
1. Usar regex pragmático simple
2. Usar regex más estricto
3. Usar `<input type="email">` HTML5
4. Combinación (HTML5 + custom validation)

**Decisión a tomar en clarifications.md o data-model.md**:  
- Recomendación: Regex pragmático: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Motivo: Balance entre validación y usabilidad

---

### ⚠️ Ambigüedad A-010: Estados de Carga/Procesamiento
**Descripción**: ¿Se muestra un spinner o estado de carga?

**Contexto**:
- No hay API real, pero se simula
- ¿Mostrar un loading spinner?
- ¿Por cuánto tiempo?
- ¿Afecta a los tests?

**Opciones**:
1. No mostrar spinner (cambio instantáneo a confirmación)
2. Mostrar spinner por 500ms-1000ms (simular latencia)
3. Mostrar spinner solo si se especifica en requisitos de UX
4. Preparar la estructura pero no implementar en MVP

**Decisión a tomar en plan.md**:  
- Recomendación: Opción 2 o 4 (spinner opcional, sin API real)
- Motivo: Preparación para futura integración

---

## 7. Matriz de Trazabilidad

| HU | RF | RNF | Casos Borde | Ambigüedad |
|----|----|----|-----------|-----------|
| HU-001 | RF-001 | RNF-006 | CB-012 | A-008, A-003 |
| HU-002 | RF-002, RF-014, RF-015 | RNF-005, RNF-010 | CB-013 | A-004 |
| HU-003 | RF-003, RF-004 | RNF-007 | CB-001, CB-002, CB-003, CB-008 | A-002, A-005 |
| HU-004 | RF-005, RF-006 | RNF-001, RNF-008 | CB-004, CB-006, CB-007 | A-001, A-009 |
| HU-005 | RF-007 | RNF-005 | CB-001 | A-004 |
| HU-006 | RF-008, RF-009 | RNF-002, RNF-004, RNF-007 | CB-009, CB-011 | A-010 |
| HU-007 | RF-010, RF-011 | RNF-002 | CB-010 | A-005 |
| HU-008 | RF-012, RF-013 | RNF-006 | CB-010, CB-012 | A-007 |

---

## 8. Notas Finales

Esta especificación define el módulo 005 (Recuperación de Contraseña) de manera comprensiva, detallando todos los requisitos, casos borde y ambigüedades conocidas.

**Próximos pasos**:
1. ✅ Revisar y aprobar esta especificación (spec.md)
2. ⏳ Crear clarifications.md (resolver ambigüedades)
3. ⏳ Crear data-model.md (definir entidades y DTOs)
4. ⏳ Crear plan.md (arquitectura y fases)
5. ⏳ Crear tasks.md (tareas específicas de desarrollo)

**Estado**: Especificación 100% completa  
**Versión**: 1.0  
**Fecha**: 2026-10-20
