# Constitution — 005 Recuperación de Contraseña

**Versión**: 1.0  
**Estado**: Borrador  
**Fecha**: 2026-10-20

---

## Contexto del Proyecto

Este proyecto es una red social de inspiración artística donde usuarios y artistas pueden compartir sus creaciones (dibujos, música, esculturas, etc.) e inspirarse en las de otros. 

**Este módulo** permite iniciar el proceso de recuperación de cuenta y contraseña desde la pantalla de login, mediante un formulario donde el usuario ingresa el correo electrónico asociado a su cuenta.

---

## Stack Tecnológico

- **Frontend**: 1 aplicación React para la recuperación de cuenta y contraseña.
- **Backend**: No implementar en esta iteración.
- **API REST**: No implementar en esta iteración.
- **Servicios de correo**: No implementar en esta iteración.

---

## Principios Obligatorios

### 1. Especificación > Implementación

La especificación manda sobre la implementación. No se debe programar funcionalidad, pantalla, componente o flujo que no esté trazado a una historia de usuario o requisito del documento de alcance correspondiente.

### 2. Dominio Orientado a Objetos

El dominio debe modelarse con orientación a objetos cuando existan reglas de negocio claras. Evitar clases anémicas cuando corresponda y mantener las reglas de validación separadas de los componentes de interfaz.

### 3. Frontend Only

Este módulo debe funcionar únicamente como frontend. No se debe implementar backend, API REST, servicios de servidor ni funciones de backend para realizar pruebas.

### 4. Sin Servicios de Correo

No implementar el envío real de correos electrónicos ni la recuperación efectiva de contraseñas. Estas operaciones quedan fuera del alcance y deberán integrarse en una próxima iteración mediante los servicios correspondientes.

### 5. Separación de Responsabilidades

Separar responsabilidades por capa:

- **Dominio**: Reglas y validaciones relacionadas con el formulario de recuperación.
- **Aplicación/Servicios**: Gestión del estado del formulario y preparación de los datos necesarios para una futura integración.
- **Frontend**: Pantallas, componentes, formularios, mensajes y navegación del proceso de recuperación.

### 6. Integración Visual con Login

El módulo debe integrarse visualmente con la pantalla de login existente de la red social.

- La pantalla de login debe incluir la pregunta "¿Olvidaste tu contraseña?".
- Al seleccionar esa opción, el usuario debe acceder a la pantalla de recuperación.
- La pantalla de recuperación debe permitir ingresar el correo electrónico asociado a la cuenta.
- El formulario debe incluir una acción para continuar con el proceso y una opción para regresar al login.

### 7. Validación de Correo Electrónico

El correo electrónico debe validarse antes de permitir continuar:

- El campo no debe estar vacío.
- El formato del correo debe ser válido.
- Los errores deben mostrarse mediante mensajes claros.
- Los espacios innecesarios al principio y al final deben tratarse correctamente.
- No se deben inventar restricciones de formato que no estén definidas en los requisitos.

### 8. Sin Verificación de Existencia de Cuenta

El frontend no debe verificar por sí mismo si una cuenta existe ni determinar si el correo ingresado pertenece a un usuario registrado. Esa validación corresponde al backend en una próxima iteración.

### 9. Privacidad: No Revelar Existencia de Cuenta

La interfaz debe evitar revelar si un correo electrónico está asociado a una cuenta existente. Los mensajes de confirmación deben ser neutrales y no depender de una comprobación que el frontend no puede realizar.

### 10. Mensaje Informativo Post-Envío

Después de enviar el formulario, la interfaz debe mostrar un mensaje informativo que indique que, si el correo corresponde a una cuenta, se recibirán instrucciones para recuperar la contraseña.

### 11. Mensajes Neutrales

El mensaje mostrado en el frontend no debe afirmar que se envió un correo real, ya que el envío no forma parte de este módulo.

### 12. Prevención de Envíos Repetidos

El formulario debe impedir envíos repetidos accidentales mientras procesa una acción simulada o una futura operación integrada. Los estados visuales deben estar preparados para una integración posterior, sin implementar servicios externos.

### 13. Usabilidad y Accesibilidad

La interfaz debe priorizar usabilidad, claridad y accesibilidad. Los campos deben tener etiquetas visibles, los errores deben ser comprensibles y las acciones principales deben distinguirse claramente.

### 14. Responsive Design

La pantalla de recuperación debe adaptarse a diferentes tamaños de pantalla y mantener una apariencia coherente con el resto de la red social.

### 15. Seguridad: No Almacenar Sensible

No almacenar contraseñas, códigos de recuperación ni información sensible innecesaria. No guardar el correo ingresado de manera persistente sin un requisito explícito.

### 16. Testing de Reglas de Validación

Toda regla de validación importante debe tener tests. Ejemplos:

- No permitir continuar con el campo de correo vacío.
- Rechazar formatos de correo inválidos.
- Aceptar formatos de correo válidos.
- Mostrar mensajes de validación claros.
- Permitir regresar al login desde la pantalla de recuperación.
- Mostrar un mensaje neutral después de completar el formulario.
- No revelar si una cuenta existe.

### 17. Sin Código en Fases de Especificación

No implementar código durante las fases de especificación, aclaración, checklist, planificación y generación de tareas. Durante estas etapas solo se deben crear o actualizar los documentos correspondientes.

---

## Módulos del Sistema Relacionados

### Login

- Contiene el acceso a la opción "¿Olvidaste tu contraseña?".
- Punto de entrada al módulo de recuperación.

### Recuperación de Contraseña

- Permite ingresar el correo asociado a la cuenta.
- Visualiza las instrucciones informativas del proceso.
- Muestra un mensaje neutral de confirmación.

### Futura Recuperación mediante Correo

- Queda fuera del alcance actual.
- Deberá integrarse posteriormente mediante los servicios correspondientes.

---

## Alcance del Frontend

### Incluido en MVP

1. Incorporar el acceso a la recuperación desde la pantalla de login existente.
2. Mostrar la pantalla de recuperación de contraseña.
3. Permitir ingresar un correo electrónico.
4. Validar el formato del correo ingresado.
5. Mostrar mensajes de error y confirmación.
6. Permitir regresar a la pantalla de login.
7. Preparar la interfaz para una futura integración.

### Excluido del Alcance (Futura Iteración)

- Implementar backend, API REST.
- Envío real de correos electrónicos.
- Recuperación efectiva de contraseñas.
- Verificación de existencia de cuenta.
- Persistencia de datos de recuperación.
- Integración con servicios de correo.

---

## Decisiones Clave

### Decisión 1: Frontend Only

**Razón**: Enfoque en prototipo MVP que permite validar la interfaz y flujo de usuario sin dependencias backend.

**Implicación**: Todas las validaciones de correo se realizan en el frontend. La simulación de envío es opcional (pueden mostrarse directamente mensajes de confirmación).

### Decisión 2: Mensajes Neutrales

**Razón**: Privacidad y seguridad. No revelar si una cuenta existe o no existe.

**Implicación**: Siempre mostrar el mismo mensaje de confirmación, sin importar si el correo es válido o no.

### Decisión 3: Separación de Capas

**Razón**: Preparar para futuras integraciones backend sin cambiar código de UI.

**Implicación**: Servicios de validación y preparación de datos deben ser independientes de componentes React.

---

## Historias de Usuario (Preliminares)

### HU-01: Acceso a Recuperación desde Login

**Como** usuario que olvidó su contraseña  
**Quiero** acceder a la opción de recuperación desde la pantalla de login  
**Para** poder ingresar mi correo y recuperar acceso a mi cuenta.

**Criterios de aceptación**:
- Existe un enlace o botón "¿Olvidaste tu contraseña?" en la pantalla de login.
- Al hacer clic, me lleva a la pantalla de recuperación.
- Desde la recuperación, puedo regresar al login.

### HU-02: Ingresar Correo para Recuperación

**Como** usuario en la pantalla de recuperación  
**Quiero** ingresar el correo electrónico asociado a mi cuenta  
**Para** poder recibir instrucciones de recuperación (futura iteración).

**Criterios de aceptación**:
- El campo de correo es visible y tiene una etiqueta clara.
- Puedo escribir el correo sin restricciones innecesarias.
- El correo se valida antes de permitir continuar.
- Se muestran mensajes de error si el formato es inválido.

### HU-03: Validación de Correo

**Como** sistema  
**Quiero** validar el formato del correo ingresado  
**Para** asegurar que se reciba un dato válido.

**Criterios de aceptación**:
- El campo vacío no es permitido.
- El formato debe ser válido (ej: usuario@dominio.com).
- Los espacios antes/después se tratan automáticamente.
- Se muestran mensajes específicos para cada tipo de error.

### HU-04: Confirmación Neutral

**Como** usuario después de enviar el formulario  
**Quiero** recibir una confirmación clara pero neutral  
**Para** saber que mi solicitud fue registrada sin revelar si mi correo existe.

**Criterios de aceptación**:
- Se muestra un mensaje indicando que, si el correo corresponde a una cuenta, recibirá instrucciones.
- El mensaje no revela si la cuenta existe o no.
- El mensaje es claro y comprensible.

### HU-05: Regresar al Login

**Como** usuario en la pantalla de recuperación  
**Quiero** poder regresar al login sin completar el formulario  
**Para** acceder a mi cuenta si recuerdo mi contraseña.

**Criterios de aceptación**:
- Existe un botón o enlace para regresar al login.
- Al hacer clic, regreso a la pantalla de login sin perder datos.
- No se guardan datos del formulario después de regresar.

---

## Requisitos Funcionales (RF)

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF-01 | Pantalla de login debe mostrar enlace "¿Olvidaste tu contraseña?" | P1 |
| RF-02 | Enlace debe navegar a pantalla de recuperación | P1 |
| RF-03 | Pantalla de recuperación debe tener campo para ingresar correo | P1 |
| RF-04 | Campo debe tener etiqueta visible | P1 |
| RF-05 | Formulario debe validar que correo no esté vacío | P1 |
| RF-06 | Formulario debe validar formato de correo | P1 |
| RF-07 | Errores deben mostrarse de manera clara | P1 |
| RF-08 | Espacios antes/después del correo deben tratarse automáticamente | P1 |
| RF-09 | Botón continuar debe estar deshabilitado si hay errores | P1 |
| RF-10 | Al hacer clic en continuar, mostrar mensaje neutral de confirmación | P1 |
| RF-11 | Mensaje debe indicar que si correo corresponde a cuenta, recibirá instrucciones | P1 |
| RF-12 | Pantalla de recuperación debe tener botón/enlace para regresar al login | P1 |
| RF-13 | Regresar al login no debe guardar datos del formulario | P1 |
| RF-14 | Interfaz debe adaptarse a mobile y desktop | P2 |

---

## Requisitos No Funcionales (RNF)

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RNF-01 | Validación de correo debe ocurrir en el frontend | P1 |
| RNF-02 | No revelar si una cuenta existe o no | P1 |
| RNF-03 | No almacenar contraseñas o códigos de recuperación | P1 |
| RNF-04 | No implementar backend ni API REST en MVP | P1 |
| RNF-05 | No implementar envío real de correos | P1 |
| RNF-06 | Interfaz debe ser accesible (etiquetas, mensajes claros) | P2 |
| RNF-07 | Interfaz debe ser responsive (mobile, tablet, desktop) | P2 |
| RNF-08 | Coherencia visual con resto de red social | P2 |
| RNF-09 | Formulario debe prevenir envíos repetidos mientras procesa | P2 |
| RNF-10 | Tests para validación de correo | P2 |
| RNF-11 | Tests para navegación entre login y recuperación | P2 |

---

## Restricciones y Limitaciones

1. **No hay backend**: Todas las validaciones ocurren en el frontend.
2. **No hay persistencia**: Los datos no se guardan entre sesiones.
3. **No hay integración de correos**: El envío es simulado.
4. **No hay autenticación**: No se verifica si el usuario está logueado.
5. **No hay verificación de cuenta**: El frontend no sabe si un correo existe.

---

## Próximas Fases (Después de este documento)

1. **Especificación (spec.md)**: Definir requisitos funcionales y no funcionales detallados.
2. **Aclaraciones (clarifications.md)**: Resolver ambigüedades y preguntas.
3. **Modelo de datos (data-model.md)**: Definir entidades y estructuras.
4. **Plan de implementación (plan.md)**: Arquitectura y fases de desarrollo.
5. **Generación de tareas (tasks.md)**: Lista de tareas específicas.
6. **Implementación**: Solo después de completar todo lo anterior.

---

**Versión**: 1.0  
**Estado**: ✅ Completado (Fase 1: Constitución)  
**Próximo paso**: Crear spec.md  
**Fecha**: 2026-10-20
