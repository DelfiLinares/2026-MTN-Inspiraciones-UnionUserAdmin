# Feature Specification: Frontend de Perfil — Gestión de Perfil, Carpetas y Publicaciones Propias

**Feature Branch**: `004-inspiraciones-perfil`

**Created**: 2026-10-06

**Status**: Draft

**Input**: Desarrollar únicamente el frontend de perfil de una red social de inspiración artística
donde usuarios y artistas comparten sus creaciones y se inspiran en las de otros. El sistema debe
permitir a usuarios y administradores gestionar su perfil, carpetas de posts y publicaciones
propias, además de visualizar perfiles ajenos y seguirlos. El frontend funciona únicamente como
frontend; consumirá en una próxima iteración una API REST de Java ya existente, que no se
implementa en este speckit.

**Alineado con**: `Union/.specify/memory/constitution.md` (v3.0.0).

---

## 1. Descripción General

### 1.1 Objetivo

Proveer a cualquier persona autenticada —sin distinción de rol— una pantalla de perfil dentro de la
aplicación React existente, que le permita:

1. Visualizar y editar los datos de su propio perfil (foto de perfil, nombre de usuario, sobre mí,
   descripción).
2. Crear, renombrar y eliminar carpetas de posts guardados.
3. Guardar posts en carpetas y quitarlos de ellas sin eliminarlos de la plataforma.
4. Editar y eliminar sus propias publicaciones.
5. Visualizar el perfil de otras personas y seguirlas.

### 1.2 Alcance

Esta especificación cubre exclusivamente el comportamiento del **frontend de perfil** y su
interacción prevista con una API REST de Java que se conectará en una iteración futura. No incluye
backend, persistencia, ni creación de publicaciones.

### 1.3 Nota sobre el rol

A diferencia del módulo `002-frontend-admin`, **el rol no condiciona las capacidades de este
módulo**. `USER` y `ADMIN` tienen exactamente las mismas capacidades sobre su perfil, sus carpetas
y sus publicaciones. La única distinción relevante es **perfil propio vs. perfil ajeno**.

### 1.4 Actores

| Actor | Descripción |
|---|---|
| **Usuario (`USER`)** | Posee cuenta, publicaciones y perfil dentro de la red social. |
| **Administrador (`ADMIN`)** | Posee cuenta, publicaciones y perfil. En este módulo opera con las mismas capacidades que un `USER`. |
| **Sistema (API/backend externo)** | Valida datos, estados, permisos y acciones de forma autoritativa. No se implementa en este speckit. |

---

## 2. Historias de Usuario

> **Escala de prioridad**: P1 (crítica, bloquea el módulo) · P2 (alta, completa el flujo
> principal) · P3 (media, mejora o caso complementario).

### HU-01 — Visualizar el perfil propio · **P1**

**Como** usuario o administrador autenticado,
**quiero** ver mi propio perfil,
**para** consultar mis datos, mis carpetas y mis publicaciones en un solo lugar.

**Criterios de aceptación**

- **AC-01.1**: El perfil propio muestra foto de perfil, nombre de usuario, sobre mí y descripción.
- **AC-01.2**: Debajo del recuadro de datos se muestran las carpetas de posts del usuario.
- **AC-01.3**: Debajo de las carpetas se muestran todas las publicaciones propias del usuario.
- **AC-01.4**: En el perfil propio se ofrece la acción de editar el perfil.
- **AC-01.5**: En el perfil propio **no** se ofrece la acción de seguir.

---

### HU-02 — Editar el perfil propio · **P1**

**Como** usuario o administrador autenticado,
**quiero** editar los datos de mi perfil,
**para** mantener actualizada mi identidad en la plataforma.

**Criterios de aceptación**

- **AC-02.1**: Se pueden editar los cuatro campos: foto de perfil, nombre de usuario, sobre mí y
  descripción.
- **AC-02.2**: El nombre de usuario acepta números, mayúsculas, minúsculas, guion bajo (`_`) y
  punto (`.`); rechaza espacios y cualquier otro carácter.
- **AC-02.3**: El nombre de usuario no supera los 10 caracteres.
- **AC-02.4**: El sobre mí no supera los 80 caracteres y permite espacios.
- **AC-02.5**: La descripción no supera los 200 caracteres y permite espacios.
- **AC-02.6**: Guardar un cambio de **nombre de usuario** requiere confirmación explícita previa.
- **AC-02.7**: Si la validación falla, se muestra un mensaje claro indicando el campo y la regla
  incumplida, y no se envía la solicitud.
- **AC-02.8**: Si la operación falla en el servidor, se muestra un mensaje de error y los datos
  editados **no** se pierden del formulario.

---

### HU-03 — Visualizar el perfil de otra persona · **P1**

**Como** usuario o administrador autenticado,
**quiero** ver el perfil de otra persona,
**para** conocer su identidad, sus carpetas y sus publicaciones.

**Criterios de aceptación**

- **AC-03.1**: El perfil ajeno muestra foto de perfil, nombre de usuario, sobre mí, descripción,
  carpetas de posts y publicaciones propias de esa persona.
- **AC-03.2**: Se puede acceder al perfil de una persona tocando su **foto de perfil** dentro de
  una publicación.
- **AC-03.3**: Se puede acceder al perfil de una persona tocando su **nombre de usuario** dentro de
  una publicación.
- **AC-03.4**: En un perfil ajeno **no** se ofrecen acciones de edición de datos, ni de gestión de
  carpetas, ni de edición/eliminación de publicaciones.
- **AC-03.5**: Las carpetas ajenas se muestran en modo consulta, con nombre y cantidad de posts.

---

### HU-04 — Seguir a otra persona · **P2**

**Como** usuario o administrador autenticado,
**quiero** seguir a otra persona desde su perfil,
**para** mantenerme al tanto de sus creaciones.

**Criterios de aceptación**

- **AC-04.1**: En un perfil ajeno se muestra la opción de seguir.
- **AC-04.2**: La acción está disponible para cualquier persona autenticada, sin distinción de rol.
- **AC-04.3**: Tras seguir con éxito, la interfaz refleja el nuevo estado de seguimiento.
- **AC-04.4**: Si la operación falla, se muestra un mensaje de error y el estado de seguimiento no
  cambia en la interfaz.
- **AC-04.5**: La acción de seguir **no** requiere confirmación explícita (no es destructiva).

---

### HU-05 — Crear una carpeta de posts guardados · **P1**

**Como** usuario o administrador autenticado,
**quiero** crear carpetas de posts guardados,
**para** organizar el contenido que me inspira.

**Criterios de aceptación**

- **AC-05.1**: Para crear una carpeta se debe indicar un nombre.
- **AC-05.2**: El nombre de carpeta no supera los 15 caracteres y permite espacios.
- **AC-05.3**: Si el nombre está vacío o excede el límite, se muestra un mensaje claro y no se
  envía la solicitud.
- **AC-05.4**: Si el usuario ya tiene **50 carpetas**, la acción de crear queda impedida y se
  comunica claramente el motivo en la interfaz.
- **AC-05.5**: Tras crear con éxito, la nueva carpeta aparece en la lista de carpetas del perfil.

---

### HU-06 — Renombrar una carpeta · **P2**

**Como** usuario o administrador autenticado,
**quiero** renombrar mis carpetas,
**para** corregir o mejorar su organización.

**Criterios de aceptación**

- **AC-06.1**: Renombrar aplica las mismas reglas de nombre que crear (máx. 15 caracteres, permite
  espacios, no vacío).
- **AC-06.2**: Renombrar requiere confirmación explícita antes de ejecutarse.
- **AC-06.3**: Tras renombrar con éxito, la lista refleja el nuevo nombre.
- **AC-06.4**: Renombrar una carpeta no altera la cantidad ni el contenido de posts guardados.
- **AC-06.5**: La acción de renombrar solo está disponible sobre carpetas propias.

---

### HU-07 — Eliminar una carpeta · **P2**

**Como** usuario o administrador autenticado,
**quiero** eliminar carpetas que ya no uso,
**para** mantener mi perfil ordenado.

**Criterios de aceptación**

- **AC-07.1**: Eliminar requiere confirmación explícita antes de ejecutarse.
- **AC-07.2**: La confirmación **advierte** que el contenido guardado en esa carpeta se perderá.
- **AC-07.3**: La confirmación **aclara** que los posts originales no se eliminan de la plataforma.
- **AC-07.4**: Tras eliminar con éxito, la carpeta desaparece de la lista.
- **AC-07.5**: Eliminar una carpeta libera cupo respecto del límite de 50.
- **AC-07.6**: La acción de eliminar solo está disponible sobre carpetas propias.
- **AC-07.7**: La acción de eliminar se diferencia visualmente de las acciones de consulta.

---

### HU-08 — Visualizar la lista de carpetas · **P2**

**Como** cualquier visitante del perfil,
**quiero** ver las carpetas de esa persona,
**para** explorar cómo organiza el contenido que le inspira.

**Criterios de aceptación**

- **AC-08.1**: Las carpetas son visibles públicamente en el perfil.
- **AC-08.2**: Cada carpeta muestra su nombre y su cantidad de posts.
- **AC-08.3**: La lista soporta hasta 50 carpetas sin degradar la interfaz, usando scroll o
  paginación cuando sea necesario.

---

### HU-09 — Guardar un post en una carpeta · **P1**

**Como** usuario o administrador autenticado,
**quiero** guardar un post en una carpeta,
**para** conservarlo como referencia.

**Criterios de aceptación**

- **AC-09.1**: Al guardar un post se puede seleccionar una carpeta existente.
- **AC-09.2**: Al guardar un post se puede crear una carpeta nueva **en el mismo flujo**, sin salir
  de la publicación.
- **AC-09.3**: La creación de carpeta dentro de este flujo aplica las mismas reglas que HU-05
  (nombre obligatorio, máx. 15 caracteres, límite de 50 carpetas).
- **AC-09.4**: Tras guardar con éxito, la interfaz refleja que el post quedó guardado.
- **AC-09.5**: Si la operación falla, se muestra un mensaje de error y el post no queda marcado
  como guardado.

---

### HU-10 — Quitar un post de una carpeta · **P2**

**Como** usuario o administrador autenticado,
**quiero** quitar un post de una carpeta,
**para** depurar lo que guardé sin afectar a la plataforma.

**Criterios de aceptación**

- **AC-10.1**: Quitar un post de una carpeta **no** elimina el post de la plataforma.
- **AC-10.2**: Tras quitar con éxito, la cantidad de posts de esa carpeta se actualiza.
- **AC-10.3**: La acción solo está disponible sobre carpetas propias.

---

### HU-11 — Editar una publicación propia · **P2**

**Como** usuario o administrador autenticado,
**quiero** editar mis propias publicaciones,
**para** corregir o mejorar lo que compartí.

**Criterios de aceptación**

- **AC-11.1**: La acción de editar solo está disponible sobre publicaciones propias.
- **AC-11.2**: Editar requiere confirmación explícita antes de ejecutarse.
- **AC-11.3**: Tras editar con éxito, el perfil refleja el contenido actualizado.
- **AC-11.4**: Si la operación falla, se muestra un mensaje de error y el contenido editado no se
  pierde del formulario.

---

### HU-12 — Eliminar una publicación propia · **P2**

**Como** usuario o administrador autenticado,
**quiero** eliminar mis propias publicaciones,
**para** retirar contenido que ya no quiero compartir.

**Criterios de aceptación**

- **AC-12.1**: La acción de eliminar solo está disponible sobre publicaciones propias.
- **AC-12.2**: Eliminar requiere confirmación explícita antes de ejecutarse.
- **AC-12.3**: Tras eliminar con éxito, la publicación desaparece del perfil.
- **AC-12.4**: La acción de eliminar se diferencia visualmente de las acciones de consulta.

---

### HU-13 — Visualizar las publicaciones de un perfil · **P1**

**Como** cualquier visitante del perfil,
**quiero** ver todas las publicaciones de esa persona,
**para** conocer su obra.

**Criterios de aceptación**

- **AC-13.1**: Se muestran todas las publicaciones pertenecientes específicamente a esa persona.
- **AC-13.2**: Las publicaciones se ubican debajo de la sección de carpetas.
- **AC-13.3**: En un perfil ajeno, las publicaciones se muestran en modo consulta.

---

## 3. Requisitos Funcionales

### 3.1 Gestión del perfil

| ID | Requisito |
|---|---|
| **RF-01** | El frontend DEBE permitir visualizar el perfil propio. |
| **RF-02** | El frontend DEBE permitir editar el perfil propio. |
| **RF-03** | El perfil DEBE gestionar foto de perfil, nombre de usuario, sobre mí y descripción. |
| **RF-04** | El nombre de usuario DEBE permitir números, mayúsculas, minúsculas, `_` y `.`. |
| **RF-05** | El nombre de usuario NO DEBE superar los 10 caracteres ni permitir espacios. |
| **RF-06** | El sobre mí NO DEBE superar los 80 caracteres y DEBE permitir espacios. |
| **RF-07** | La descripción NO DEBE superar los 200 caracteres y DEBE permitir espacios. |
| **RF-08** | La edición del nombre de usuario DEBE requerir confirmación explícita. |

### 3.2 Visualización de perfiles

| ID | Requisito |
|---|---|
| **RF-09** | El frontend DEBE permitir acceder al perfil de otra persona. |
| **RF-10** | El perfil ajeno DEBE poder abrirse desde la foto de perfil en una publicación. |
| **RF-11** | El perfil ajeno DEBE poder abrirse desde el nombre de usuario en una publicación. |
| **RF-12** | El perfil ajeno DEBE mostrar foto, nombre de usuario, sobre mí, descripción, carpetas y publicaciones propias. |
| **RF-13** | Al acceder a un perfil ajeno DEBE aparecer la opción de seguir. |
| **RF-14** | Las carpetas de un usuario DEBEN ser visibles públicamente en su perfil. |
| **RF-15** | Cada carpeta DEBE mostrar su nombre y su cantidad de posts. |
| **RF-16** | Todos los posts pertenecientes a esa persona DEBEN ser visibles en su perfil. |

### 3.3 Gestión de carpetas

| ID | Requisito |
|---|---|
| **RF-17** | El frontend DEBE permitir crear carpetas de posts guardados. |
| **RF-18** | El frontend DEBE permitir renombrar carpetas propias. |
| **RF-19** | El frontend DEBE permitir eliminar carpetas propias. |
| **RF-20** | Para crear una carpeta se DEBE indicar un nombre. |
| **RF-21** | El nombre de carpeta NO DEBE superar los 15 caracteres y DEBE permitir espacios. |
| **RF-22** | Un usuario NO DEBE poder tener más de 50 carpetas. |
| **RF-23** | Al alcanzar el límite de 50 carpetas, el frontend DEBE impedir la creación de nuevas carpetas. |
| **RF-24** | La lista de carpetas DEBE soportar hasta 50 carpetas sin degradar la interfaz, usando scroll o paginación cuando sea necesario. |
| **RF-25** | Eliminar una carpeta DEBE advertir que los posts guardados de esa carpeta se perderán. |
| **RF-26** | Dicha advertencia DEBE aclarar que los posts originales no se eliminan de la plataforma. |
| **RF-27** | Eliminar y renombrar carpetas DEBEN requerir confirmación explícita. |

### 3.4 Gestión de posts

| ID | Requisito |
|---|---|
| **RF-28** | El frontend DEBE permitir guardar un post en una carpeta existente. |
| **RF-29** | Al guardar un post, el frontend DEBE permitir seleccionar una carpeta existente o crear una nueva sin salir de la publicación. |
| **RF-30** | El frontend DEBE permitir quitar un post de una carpeta sin eliminarlo de la plataforma. |
| **RF-31** | El frontend DEBE permitir editar publicaciones propias. |
| **RF-32** | El frontend DEBE permitir eliminar publicaciones propias. |
| **RF-33** | El frontend NO DEBE implementar la creación de publicaciones. |
| **RF-34** | Editar y eliminar publicaciones propias DEBEN requerir confirmación explícita. |

### 3.5 Permisos

| ID | Requisito |
|---|---|
| **RF-35** | Cualquier usuario autenticado, sin distinción de rol, PUEDE gestionar su propio perfil. |
| **RF-36** | Cualquier usuario autenticado, sin distinción de rol, PUEDE gestionar sus propias carpetas. |
| **RF-37** | Cualquier usuario autenticado, sin distinción de rol, PUEDE gestionar sus propias publicaciones. |
| **RF-38** | Un usuario SOLO PUEDE editar los datos de su propio perfil. |
| **RF-39** | Un usuario PUEDE visualizar el perfil de otros usuarios y administradores. |
| **RF-40** | Cualquier usuario autenticado PUEDE seguir a otra persona desde su perfil. |
| **RF-41** | La seguridad y los permisos DEBEN validarse en el backend y reflejarse en la interfaz. |
| **RF-42** | Ocultar una acción en el frontend NO REEMPLAZA la autorización del backend. |

### 3.6 Frontend

| ID | Requisito |
|---|---|
| **RF-43** | El frontend DEBE ser una aplicación React. |
| **RF-44** | El frontend DEBE permitir gestionar perfiles tanto de usuarios como de administradores. |
| **RF-45** | El frontend DEBE implementar exclusivamente perfil, carpetas y gestión de publicaciones propias. |
| **RF-46** | El frontend DEBE consumir una API REST de Java (no implementada en este speckit). |
| **RF-47** | NO SE DEBE implementar backend durante el desarrollo del frontend. |
| **RF-48** | Ningún frontend DEBE acceder directamente a MySQL. |
| **RF-49** | El frontend NO DEBE recalcular rankings, recomendaciones ni estadísticas complejas. |

---

## 4. Requisitos No Funcionales

| ID | Categoría | Requisito |
|---|---|---|
| **RNF-01** | Usabilidad | La interfaz DEBE ser amigable; gestionar perfil, carpetas y publicaciones DEBE ser simple, rápido y claro. |
| **RNF-02** | Usabilidad | Los datos del perfil DEBEN mostrarse claramente. |
| **RNF-03** | Usabilidad | Las acciones sensibles DEBEN diferenciarse visualmente de las acciones de consulta. |
| **RNF-04** | Usabilidad | Las acciones destructivas sensibles DEBEN requerir confirmación explícita antes de ejecutarse. |
| **RNF-05** | Performance | El sistema DEBE poder escalar a una gran cantidad de carpetas, posts y usuarios. |
| **RNF-06** | Performance | Las búsquedas y filtros NO DEBEN depender de recorrer listas completas en memoria; se apoyan en consultas, índices y caché del backend. |
| **RNF-07** | Performance | La visualización de hasta 50 carpetas DEBE mantenerse clara y usable mediante scroll o paginación. |
| **RNF-08** | Seguridad | La seguridad y los permisos DEBEN validarse en el backend. |
| **RNF-09** | Seguridad | El frontend NO DEBE implementar responsabilidades propias del backend. |
| **RNF-10** | Seguridad | El frontend NO DEBE acceder directamente a MySQL. |
| **RNF-11** | Calidad | Las reglas de negocio DEBEN estar separadas de la interfaz. |
| **RNF-12** | Calidad | El dominio DEBE modelarse con orientación a objetos real; las entidades encapsulan sus reglas. |
| **RNF-13** | Calidad | Las responsabilidades DEBEN estar separadas por capa (dominio, aplicación, presentación, infraestructura). |
| **RNF-14** | Calidad | Toda regla de negocio importante DEBE tener tests. |
| **RNF-15** | Calidad | NO SE DEBE implementar código durante especificación, aclaración, checklist, planificación y generación de tareas. |

---

## 5. Casos Borde

| ID | Caso | Comportamiento esperado |
|---|---|---|
| **CB-01** | El usuario intenta guardar un nombre de usuario con espacios. | Se rechaza con mensaje claro; no se envía la solicitud. |
| **CB-02** | El usuario intenta guardar un nombre de usuario de 11+ caracteres. | Se rechaza con mensaje claro; no se envía la solicitud. |
| **CB-03** | El usuario intenta guardar un nombre de usuario con caracteres no permitidos (p. ej. `#`, `-`, `@`). | Se rechaza con mensaje claro; no se envía la solicitud. |
| **CB-04** | El sobre mí excede 80 caracteres. | Se rechaza con mensaje claro; no se envía la solicitud. |
| **CB-05** | La descripción excede 200 caracteres. | Se rechaza con mensaje claro; no se envía la solicitud. |
| **CB-06** | El usuario intenta crear una carpeta con nombre vacío. | Se rechaza con mensaje claro; no se envía la solicitud. |
| **CB-07** | El usuario intenta crear una carpeta con nombre de 16+ caracteres. | Se rechaza con mensaje claro; no se envía la solicitud. |
| **CB-08** | El usuario ya tiene 50 carpetas e intenta crear otra. | La acción de crear queda impedida y se comunica el motivo. |
| **CB-09** | El usuario tiene 50 carpetas, elimina una e intenta crear otra. | La creación vuelve a estar habilitada. |
| **CB-10** | El usuario intenta crear una carpeta desde el flujo de guardar post, estando en el límite de 50. | Se impide igual que en CB-08, sin salir de la publicación. |
| **CB-11** | El usuario elimina una carpeta que contiene posts. | Se advierte la pérdida del contenido guardado y se aclara que los posts originales permanecen en la plataforma. |
| **CB-12** | El usuario cancela la confirmación de eliminar carpeta. | No se ejecuta ninguna acción; la carpeta permanece intacta. |
| **CB-13** | El usuario cancela la confirmación de cambiar su nombre de usuario. | No se ejecuta ninguna acción; el nombre previo se mantiene. |
| **CB-14** | Falla la operación de guardar perfil en el servidor. | Se muestra mensaje de error y los datos editados no se pierden del formulario. |
| **CB-15** | El usuario visita un perfil ajeno. | No se ofrecen acciones de edición de perfil, carpetas ni publicaciones; sí se ofrece seguir. |
| **CB-16** | El usuario visita su propio perfil. | No se ofrece la acción de seguir. |
| **CB-17** | Un perfil no tiene carpetas. | La sección de carpetas se muestra vacía de forma clara, sin error. |
| **CB-18** | Un perfil no tiene publicaciones. | La sección de publicaciones se muestra vacía de forma clara, sin error. |
| **CB-19** | Falla la acción de seguir. | Se muestra mensaje de error y el estado de seguimiento no cambia en la interfaz. |
| **CB-20** | El usuario quita un post de una carpeta. | El post permanece en la plataforma; solo baja la cantidad de posts de esa carpeta. |

---

## 6. Reglas de Negocio Críticas (requieren test, Principio VIII)

> Lista exhaustiva de reglas que, según el Principio VIII de la constitución v3.0.0, deben contar
> con tests automatizados.

1. Cualquier tipo de usuario puede seguir a otra persona mediante el acceso a su perfil (RF-40).
2. Cualquier tipo de usuario puede crear carpetas de posts guardados, indicándole un nombre
   (RF-17, RF-20).
3. Cualquier tipo de usuario puede editar los datos de su propio perfil únicamente (RF-38).
4. El sistema permite crear, renombrar y eliminar carpetas desde el perfil, con nombre no mayor a
   15 caracteres y que permita espacios (RF-17, RF-18, RF-19, RF-21).
5. Al guardar un post, se permite seleccionar una carpeta existente o crear una nueva en el mismo
   flujo, sin salir de la publicación (RF-29).
6. Al eliminar una carpeta se advierte que el contenido guardado se perderá, aclarando que los
   posts originales no se eliminan de la plataforma (RF-25, RF-26).
7. Se permite quitar un post de una carpeta sin eliminarlo de la plataforma (RF-30).
8. La lista de carpetas soporta hasta 50 carpetas sin degradar la interfaz; al alcanzar el límite
   se impide crear nuevas (RF-22, RF-23, RF-24).
9. Las carpetas son visibles públicamente en el perfil, mostrando nombre y cantidad de posts
   (RF-14, RF-15).
10. Todos los posts pertenecientes a ese usuario son visibles en su perfil (RF-16).
11. El nombre de usuario permite números, mayúsculas, minúsculas, `_` y `.`; no supera 10
    caracteres y no permite espacios (RF-04, RF-05).
12. El sobre mí no supera los 80 caracteres y permite espacios (RF-06).
13. La descripción no supera los 200 caracteres y permite espacios (RF-07).

---

## 7. Estados, Enums y Reglas de Validación

### 7.1 Enums obligatorios

| Enum | Valores | Entidad asociada |
|---|---|---|
| `RolUsuario` | `USER`, `ADMIN` | Usuario |
| `EstadoCuentaUsuario` | `ACTIVO`, `BANEADO`, `ELIMINADO` | Usuario |

> Nota: estos enums ya existen en el proyecto como legado del módulo `002-frontend-admin`. Este
> módulo los reutiliza; **no** introduce enums nuevos obligatorios.

### 7.2 Reglas de validación de campos

| Campo | Longitud máxima | Espacios | Caracteres permitidos |
|---|---|---|---|
| Nombre de usuario | 10 | ❌ No permitidos | números, mayúsculas, minúsculas, `_`, `.` |
| Sobre mí | 80 | ✅ Permitidos | sin restricción adicional declarada |
| Descripción | 200 | ✅ Permitidos | sin restricción adicional declarada |
| Nombre de carpeta | 15 | ✅ Permitidos | sin restricción adicional declarada |

### 7.3 Límites de cantidad

| Límite | Valor |
|---|---|
| Carpetas por usuario | 50 (máximo) |

---

## 8. Permisos por Contexto

> **Importante**: en este módulo el rol (`USER` / `ADMIN`) **no** altera los permisos. Lo que
> determina las capacidades es si el perfil visitado es propio o ajeno.

| Funcionalidad | Perfil propio | Perfil ajeno |
|---|---|---|
| Ver foto, nombre de usuario, sobre mí, descripción | Sí | Sí |
| Ver carpetas (nombre y cantidad de posts) | Sí | Sí |
| Ver publicaciones de esa persona | Sí | Sí |
| Editar datos del perfil | Sí | No |
| Crear carpeta | Sí | No |
| Renombrar carpeta | Sí | No |
| Eliminar carpeta | Sí | No |
| Quitar post de una carpeta | Sí | No |
| Editar publicación propia | Sí | No |
| Eliminar publicación propia | Sí | No |
| Seguir a la persona | No | Sí |

---

## 9. Ambigüedades

> Puntos no definidos por el documento de alcance. Requieren aclaración antes o durante
> `/speckit.clarify`.

| ID | Ambigüedad | Impacto | Resolución propuesta |
|---|---|---|---|
| **A1** | No se define si el nombre de usuario debe ser **único** en la plataforma, ni qué ocurre si se intenta usar uno ya existente. | Afecta HU-02 y los mensajes de error de CB-01..CB-03. | Asumir que la unicidad la valida el backend; el frontend debe mostrar el error devuelto. Confirmar en `/speckit.clarify`. |
| **A2** | No se definen restricciones para la **foto de perfil** (formatos aceptados, tamaño máximo, resolución). | Afecta HU-02 (AC-02.1) y la validación del formulario. | Definir formatos y tamaño máximo, o delegar explícitamente la validación al backend. |
| **A3** | No se define si los **nombres de carpeta** deben ser únicos por usuario. | Afecta HU-05 y HU-06. | Definir si se permiten nombres duplicados dentro del mismo usuario. |
| **A4** | No se define si existe la acción inversa de **dejar de seguir** a una persona. | Afecta HU-04 (AC-04.3). | Definir si el botón alterna entre "Seguir" / "Dejar de seguir" o si solo existe seguir. |
| **A5** | No se especifica **qué campos** de una publicación son editables en HU-11 (texto, imagen, ambos). | Afecta HU-11 y su formulario. | Enumerar los campos editables de una publicación. |
| **A6** | No se define si la **paginación o scroll** de carpetas (RF-24) es responsabilidad del cliente o si la API entrega páginas. | Afecta RNF-06 y RNF-07, y el contrato con la API. | Dado RNF-06, asumir paginación server-side. Confirmar en el contrato. |
| **A7** | No se define si eliminar una carpeta requiere que esté vacía, o si puede eliminarse con posts dentro. | Afecta HU-07 y CB-11. | Según RF-25, se interpreta que puede eliminarse con contenido, previa advertencia. Confirmar. |
| **A8** | No se define el comportamiento si se intenta guardar un post **ya guardado** en la misma carpeta. | Afecta HU-09. | Definir si es idempotente, si se rechaza o si se ofrece quitar. |
| **A9** | No se define si las carpetas tienen algún estado de **privacidad**. RF-14 las declara públicas sin excepción. | Afecta HU-08 y la visibilidad en perfiles ajenos. | Confirmar que no existen carpetas privadas en esta iteración. |
| **A10** | No se define si un perfil con cuenta `BANEADO` o `ELIMINADO` es visible para terceros. | Afecta HU-03 y la relación con el módulo 002. | Definir visibilidad de perfiles según `EstadoCuentaUsuario`. |

---

## 10. Fuera de Alcance

- Implementación del backend.
- Funciones de backend para realizar pruebas.
- Acceso directo a MySQL desde el frontend.
- Implementación de la API REST de Java.
- **Creación** de publicaciones (solo se cubren editar y eliminar las propias).
- Recomendaciones y analytics dentro del frontend.
- Recalcular rankings, recomendaciones o estadísticas complejas en el cliente.
- Funcionalidades de moderación/administración (banear, promover, reportes), cubiertas por el
  módulo `002-frontend-admin`.

---

## 11. Criterio Final de Consistencia

1. ✅ Toda historia de usuario (HU-01..HU-13) está trazada a al menos un requisito funcional.
2. ✅ Todo requisito funcional (RF-01..RF-49) proviene del documento de alcance.
3. ✅ Las 13 reglas de negocio críticas del Principio VIII (constitución v3.0.0) están listadas en
   la sección 6 con referencia a tests obligatorios.
4. ✅ Los límites de caracteres y de cantidad coinciden exactamente con la sección "Reglas de
   Validación de Datos del Perfil y Carpetas" de la constitución v3.0.0.
5. ✅ Las ambigüedades detectadas están marcadas explícitamente en la sección 9.
6. ✅ No se incluye código en este documento, conforme al Principio XV.
