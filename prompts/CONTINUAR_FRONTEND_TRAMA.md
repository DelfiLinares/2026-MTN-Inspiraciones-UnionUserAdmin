# Trama — Resumen para continuar desde otra PC

## Estado actual de la continuación

**Actualización:** 30 de octubre de 2026, horario de Buenos Aires.

La implementación se retomó con autorización del usuario. La demo independiente
ya tiene entrada, rutas, estilos, pantallas administrativas y `/acerca`; se puede
recorrer de punta a punta. No se modificó `Union/frontend/`.

La guía vigente de ejecución y verificación está en
[frontend-trama/README.md](../frontend-trama/README.md).

- Node 24.21.0 portátil, sin reemplazar el Node global. Desarrollo en `http://127.0.0.1:5180/`.
- 38 pruebas, lint y build aprobados; auditoría de dependencias sin vulnerabilidades conocidas.
- Flujos de artista y administración comprobados en navegador y 160 combinaciones de ruta y ancho revisadas.
- Escape, retorno de foco y descarga del CSV verificados además en Edge aislado. Se revisaron capturas de escritorio/móvil y el símbolo a 16 y 24 px.
- Se corrigieron durante la verificación el reintento de audio tras un fallo de carga, las opciones vacías duplicadas en Descubrir y el nombre accesible del enlace móvil a la comunidad.
- Los datos creados en el navegador para las pruebas se reiniciaron al estado de ejemplo.
- Pendientes reales: contraste directo con Figma autenticado, Safari/iOS y la advertencia de tamaño del bloque principal de Vite. No se añadió un backend ni autenticación real.

El resto del documento conserva el corte histórico original. Sus apartados de
trabajo faltante no son una lista vigente de tareas; consultar primero la guía
anterior y el código actual, sin recrear los módulos ya terminados.

## Corte histórico del 29 de octubre

**Fecha de corte:** 29 de octubre de 2026.

**Estado:** trabajo pausado por pedido del usuario. La aplicación está en construcción; todavía no se puede ejecutar de punta a punta.

Este documento describe el estado al detener la implementación. Su creación no implica retomar el desarrollo ni modificar el código.

## 1. Objetivo

Construir desde cero un frontend independiente en [frontend-trama/](frontend-trama/), sin reemplazar ni modificar el [frontend anterior](Union/frontend/).

Debe conservar aproximadamente la distribución y la grilla de obras del diseño original, aplicar la identidad de Trama y resolver las correcciones del frontend actual.

### Referencias

- [Figma: Sitio Inspiraciones](https://www.figma.com/design/zf248AgDzL4lP4hIY6DBvV/Sitio-Inspiraciones?node-id=0-1).
- [Política de CreateApp](.createapp/POLICY.md).
- [Configuración de CreateApp](.createapp/config.json).
- [Manual de marca](manualMarca/MANUAL_MARCA_RED_ARTISTAS.md).
- [Ficha de entrega de marca](manualMarca/ENTREGA_IA_TRAMA.md).
- [Tokens oficiales](manualMarca/TOKENS_TRAMA.json).
- [Correcciones del frontend](manualMarca/feedback.md).

Leer estas referencias antes de continuar. No reabrir las decisiones de identidad ni el alcance ya aprobado.

## 2. Alcance confirmado con el usuario

| Tema | Decisión aprobada |
| --- | --- |
| Pantallas | Experiencia de usuarios y administración |
| Datos | Demo local funcional y persistente, sin backend real |
| Publicación | Imágenes y audio |
| Interacciones | Detalles de obras y desafíos, likes, seguimiento, carpetas privadas y comentarios |
| Inicio | Pestañas Para vos / Seguidos / Desafíos, más un aviso de desafío entre publicaciones |
| Carrusel | Eliminarlo |
| Descubrir | Diferenciarlo de Inicio mediante búsqueda y filtros de Obras, Música, Lugares y Artistas |
| Registro e ingreso | Escritorio 16:9 y adaptación móvil; el usuario aclaró que no era 16:4 |
| Navegación móvil | Barra inferior |
| Presentación | Fondos neutros, controles consistentes, evitar apartados que parezcan popups |
| Distribución | Conservar aproximadamente la idea del diseño actual, especialmente la grilla de obras |

### Identidad cerrada

- **Nombre:** Trama; palabra gráfica `trama`, en minúsculas.
- **Símbolo:** 11 · Encuentro. No reemplazarlo por otro.
- **Tipografía:** Inter para toda la interfaz, incluidos títulos y marca.
- **Acción:** `#2447D8`.
- **Fondo:** `#FAF9F6`.
- **Superficie:** `#FFFFFF`.
- **Texto:** `#202327`.
- **Selección:** `#E8EDFF`.
- Controles con radio de 10 px, tarjetas de 12 px y diálogos de 16 px.
- Las obras aportan el color; no agregar degradados decorativos, serif editorial ni sombras permanentes a la interfaz.

No se aprobó integrar un backend real, una aplicación nativa, una PWA ni un tema oscuro.

## 3. Cambios realizados

### 3.1 Proyecto independiente

Se creó [frontend-trama/](frontend-trama/) con:

- [Manifiesto y scripts](frontend-trama/package.json).
- [Lockfile](frontend-trama/package-lock.json).
- [Configuración de Vite y Vitest](frontend-trama/vite.config.ts).
- [Configuración de TypeScript](frontend-trama/tsconfig.json).
- [Configuración de ESLint](frontend-trama/eslint.config.js).
- [HTML de entrada](frontend-trama/index.html).
- [.gitignore propio](frontend-trama/.gitignore).

Versiones principales:

| Tecnología | Versión |
| --- | --- |
| React / React DOM | 19.3.1 |
| React Router DOM | 7.18.5 |
| Vite | 8.3.5 |
| TypeScript | 5.9.3 |
| Vitest | 5.0.5 |
| Zod | 4.6.7 |
| Lucide React | 1.64.0 |
| ESLint | 10.13.0 |

**Node.js requerido:** 24.15.0 o posterior. En la PC original se utilizó Node 24.21.0.

Puertos configurados:

- Desarrollo: `127.0.0.1:5180`.
- Preview: `127.0.0.1:4180`.

### 3.2 Modelo, lógica y persistencia

En [src/data/](frontend-trama/src/data/):

- [model.ts](frontend-trama/src/data/model.ts): modelos, esquemas Zod y comandos tipados.
- [seed.ts](frontend-trama/src/data/seed.ts): artistas, publicaciones, desafíos, solicitudes, reportes, apelaciones y lugares ficticios.
- [store.ts](frontend-trama/src/data/store.ts): validaciones y operaciones de dominio.
- [repository.ts](frontend-trama/src/data/repository.ts): persistencia transaccional en IndexedDB.

Operaciones implementadas en la lógica:

- Creación de perfiles locales y edición de datos públicos.
- Preferencias del cuestionario.
- Likes y seguimiento.
- Creación, renombrado, eliminación y contenido de carpetas privadas.
- Publicación y edición de obras.
- Comentarios y eliminación autorizada.
- Participación en desafíos abiertos.
- Propuestas de desafíos y revisión administrativa.
- Moderación de publicaciones y reportes.
- Suspensión, reactivación y eliminación de cuentas de demo.
- Cambios de rol y revisión de apelaciones.
- Registro de acciones administrativas.
- Búsqueda y filtrado de contenido público.
- Exportación CSV con neutralización de fórmulas.

Persistencia:

- Base IndexedDB: `trama-frontend-demo-v1`.
- Sesión de demostración en `sessionStorage`: `trama-demo-profile`.
- Las escrituras leen el estado vigente dentro de la transacción para evitar perder cambios simultáneos.
- Los errores de persistencia no deben mostrarse como operaciones exitosas.
- Los datos locales del navegador **no se trasladan mediante Git**.

Límites de archivos implementados:

- JPG, PNG y WebP: hasta **8 MiB**, inclusive.
- MP3, WAV, Ogg y M4A: hasta **16 MiB**, inclusive.
- SVG subido por el usuario no admitido.
- Se valida que el navegador pueda abrir el archivo y, para audio, leer su duración.

### 3.3 Contexto y componentes

El [proveedor de la demo](frontend-trama/src/context/DemoContext.tsx) contiene:

- Carga y reinicio explícito de datos.
- Selección de sesión de ejemplo.
- Notificaciones.
- Actualizaciones entre pestañas mediante BroadcastChannel.
- Estado de error sin reemplazar silenciosamente los datos por nuevos ejemplos.

En [src/components/](frontend-trama/src/components/) se escribieron:

- Marca compartida.
- Botones, campos, pestañas, estados vacíos, avisos y diálogos.
- [Shell de navegación y guards](frontend-trama/src/components/Shell.tsx).
- Tarjetas de publicaciones y acciones sociales.
- Diálogo de guardado en carpetas.
- Botón de seguimiento.
- Reproductor con coordinación para una sola pieza de audio activa.
- Confirmaciones de acciones sensibles.
- Aviso de cambios sin guardar.

**Importante para el enrutamiento:** [UnsavedChanges.tsx](frontend-trama/src/components/UnsavedChanges.tsx) utiliza `useBlocker`. La aplicación debe usar un data router de React Router, por ejemplo `createBrowserRouter` y `RouterProvider`.

### 3.4 Pantallas escritas, todavía sin integrar completamente

| Archivo | Contenido |
| --- | --- |
| [Access.tsx](frontend-trama/src/pages/Access.tsx) | Ingreso, registro, acceso de demo administrativo, explicación sobre contraseñas y cierre de sesión |
| [Onboarding.tsx](frontend-trama/src/pages/Onboarding.tsx) | Cuestionario de dos pasos, selección múltiple y opción de omitir |
| [Home.tsx](frontend-trama/src/pages/Home.tsx) | Inicio, pestañas aprobadas y aviso de desafío |
| [Discover.tsx](frontend-trama/src/pages/Discover.tsx) | Obras, música, lugares y artistas; búsqueda, filtros y mapa ilustrativo |
| [Profile.tsx](frontend-trama/src/pages/Profile.tsx) | Perfil propio/ajeno, guardados, carpetas y opciones de perfil |
| [Editors.tsx](frontend-trama/src/pages/Editors.tsx) | Edición de perfil, publicación y edición de publicaciones |
| [Work.tsx](frontend-trama/src/pages/Work.tsx) | Detalle de obra, comentarios, reportes y página no encontrada |
| [Challenges.tsx](frontend-trama/src/pages/Challenges.tsx) | Desafíos, detalle, participación, propuestas, seguimiento de propuestas y apelaciones |

Estos archivos contienen implementación, pero **no constituyen todavía una aplicación integrada ni validada en navegador**.

### 3.5 Marca, estilos y medios

- [tokens.css](frontend-trama/src/styles/tokens.css): Inter local y tokens de marca.
- [app.css](frontend-trama/src/styles/app.css): estilos globales, componentes, navegación lateral y barra inferior móvil.
- [Fuente y licencia](frontend-trama/public/fonts/): Inter incluida sin modificación y su licencia OFL.
- [Encuentro en SVG](frontend-trama/public/marca/encuentro.svg): trazado desde el recurso raster entregado.
- [Medios locales](frontend-trama/public/media/): seis fotografías de referencia de Unsplash, seis ilustraciones SVG originales y dos audios sintetizados.

La coincidencia medida entre el contorno raster y la vectorización de Encuentro fue de **99,3263 % de IoU**. Eso no sustituye la revisión visual pendiente a 24 y 16 px.

Los audios de ejemplo duran 8 y 6 segundos. Las imágenes y los audios se sirven localmente; no requieren servicios externos para mostrarse.

Las fuentes de las fotografías y los créditos se registraron en los datos de ejemplo. Falta completar la presentación de créditos y licencias en la documentación y en la página de información.

## 4. Tareas pendientes

### Prioridad 1 — Terminar el arranque y el enrutamiento

- Crear `frontend-trama/src/main.tsx`.
- Crear `frontend-trama/src/App.tsx` o el módulo equivalente de rutas.
- Conectar el proveedor de demo, el router y los estilos.
- Registrar todas las pantallas escritas.
- Aplicar los guards de cuenta y administración.
- Revisar los destinos existentes en enlaces y botones.
- Configurar la entrada inicial, la página no encontrada y el manejo de errores de ruta.
- Conservar posición y filtros al volver de los detalles.

El HTML de entrada ya apunta a `src/main.tsx`, pero ese archivo **todavía no existe**.

### Prioridad 2 — Completar los estilos de las pantallas

Existen estilos globales y de componentes, pero faltan muchas clases utilizadas por:

- Acceso y registro.
- Cuestionario.
- Perfiles y carpetas.
- Edición y publicación.
- Detalles de obras y conversaciones.
- Desafíos y propuestas.
- Directorio de artistas y lugares.

No asumir que las pantallas ya se ven correctamente porque existe su JSX.

### Prioridad 3 — Construir la administración

La navegación y la lógica local están preparadas; las pantallas administrativas siguen pendientes:

1. Resumen.
2. Usuarios.
3. Publicaciones.
4. Moderación, detalle de reportes y apelaciones.
5. Desafíos: listado, creación, edición y archivo.
6. Solicitudes/propuestas de la comunidad.
7. Reportes y exportación CSV.
8. Accesos y roles.

Reutilizar los comandos existentes. Los datos, cifras y estados deben derivarse del estado local; no inventar métricas, porcentajes de afinidad, rankings ni operaciones de servidor.

La aprobación de una propuesta **no publica automáticamente** un desafío. La publicación y sus fechas son un paso aparte.

### Prioridad 4 — Información de la demo

Implementar `/acerca`; ya hay enlaces a esa ruta.

Debe explicar:

- Que los perfiles, lugares y actividad son ejemplos.
- Qué se guarda en el navegador.
- Que no existe autenticación de producción.
- Cómo cambiar de perfil y reiniciar los datos con confirmación.
- Créditos y licencias de recursos, incluidos Inter, Lucide y las imágenes.
- Que el mapa es ilustrativo y no sirve para orientarse.

### Prioridad 5 — Verificación e iteración

- Ejecutar typecheck, lint y build del estado completo.
- Volver a ejecutar las pruebas afectadas por cambios posteriores.
- Añadir pruebas de componentes y flujos relevantes.
- Validar en navegador las experiencias de artista y administrador.
- Comprobar persistencia tras recargar.
- Comprobar acceso directo a rutas privadas y administrativas.
- Validar publicación de imagen/audio y sus errores.
- Verificar reproducción exclusiva y errores de medios.
- Comprobar seguimiento, likes, comentarios y carpetas privadas.
- Verificar propuestas, moderación, suspensiones, roles y apelaciones.
- Probar cambios sin guardar, cancelación y errores de almacenamiento.
- Revisar teclado, foco, diálogos, etiquetas y estados vacíos.
- Revisar a 320, 390, 768, 1024 y 1440 px, más escritorio 16:9.
- Verificar el símbolo a 24 y 16 px.
- No afirmar compatibilidad con Safari/iOS a partir de pruebas solo en Chromium.

### Prioridad 6 — Documentación y cierre

- Agregar un README del frontend con instalación, comandos, alcance y límites.
- Completar créditos y licencias.
- Documentar qué se verificó realmente y qué sigue sin integración.
- Mantener intacto el frontend anterior.

## 5. Pruebas ejecutadas

| Comprobación | Resultado observado |
| --- | --- |
| Pruebas iniciales antes de implementar | 21 fallaron y 1 pasó; etapa roja registrada |
| Vitest: lógica y persistencia | **22 de 22 pasaron** |
| `npx tsc --noEmit` | Pasó antes de los últimos bloques de pantallas |
| Auditoría automática de npm después de actualizar dependencias | **0 vulnerabilidades** |
| Fidelidad de la vectorización de Encuentro | **99,3263 % de IoU** |
| Build del frontend | No ejecutado |
| Lint completo | No ejecutado |
| Pruebas del frontend local en navegador | No ejecutadas |
| Responsive y revisión visual final | No ejecutados |

### Archivos de pruebas

- [store.test.ts](frontend-trama/src/data/store.test.ts).
- [repository.test.ts](frontend-trama/src/data/repository.test.ts).

Cubren:

- Likes sin duplicación ni mutación del estado anterior.
- Requisito de cuenta activa.
- Seguimiento y prohibición de seguirse a uno mismo.
- Privacidad de carpetas, incluso frente a otra cuenta administradora.
- Guardados independientes de los likes.
- Nombres de carpetas y eliminación sin borrar las obras.
- Comentarios y validación del perfil.
- Búsqueda y filtrado.
- Permisos administrativos y protección de la propia cuenta administradora.
- Visibilidad de publicaciones y cuentas moderadas.
- Resolución terminal de reportes y propuestas.
- Participación con obras propias en desafíos abiertos.
- Reactivación por apelación aprobada.
- Límites de archivos, incluyendo el umbral exacto.
- Neutralización de fórmulas en CSV.
- Persistencia, escrituras simultáneas y rollback de una escritura fallida.

La herramienta integrada de pruebas no detectó el proyecto nuevo. Se utilizó el runner de npm:

```bash
cd frontend-trama
npm test -- src/data/store.test.ts src/data/repository.test.ts
npx tsc --noEmit
```

**No presentar estos resultados como validación del estado final:** después de la última comprobación de TypeScript se escribieron más pantallas y se ajustaron componentes y modelos.

## 6. Errores, bloqueos y límites conocidos

### Bloqueos actuales

- Falta el punto de entrada y el router.
- La administración no tiene todavía sus pantallas.
- Los estilos específicos de muchas páginas están incompletos.
- No se verificó la integración final; podrían aparecer errores de tipos, rutas o comportamiento al completarla.
- No hay servidor de desarrollo ni otros procesos de trabajo activos.

### Problemas detectados y corregidos durante el trabajo

- Un error de TypeScript en una prueba de entrada maliciosa al perfil se corrigió sin usar `any`.
- npm detectó una vulnerabilidad alta en Zod 3; se actualizó a Zod 4.6.7. La instalación posterior informó cero vulnerabilidades.

### Limitaciones de la demostración

- La contraseña es un campo de muestra: no se verifica ni se guarda.
- Los accesos rápidos previstos usan los perfiles locales de artista y administrador.
- Los correos de ejemplo incluyen `mora@trama.demo` y `admin@trama.demo`.
- Los guards de interfaz y los comandos de demo no constituyen una frontera de seguridad de producción.
- IndexedDB y sessionStorage pueden ser manipulados desde el navegador.
- No hay envío de correos, backend, autenticación real ni servicio real de mapas.
- El mapa contiene lugares ficticios.
- No se implementó un motor real de recomendaciones.
- Los datos locales y la sesión no viajan con el repositorio a otra PC.

### Figma

Se pudo visualizar el wireframe de Inicio y el listado de frames. La selección y exportación automatizada de otras pantallas no respondió correctamente.

No afirmar que se revisaron visualmente todas las pantallas de Figma. Completar esa revisión al continuar, con la sesión del usuario cuando sea necesaria.

## 7. Rama y estado de Git al pausar

- **Repositorio:** `DelfiLinares/2026-MTN-Inspiraciones-UnionUserAdmin`.
- **Rama:** `feat/frontend-v3`.
- **Commit consultado:** `ac9861db`.
- **Mensaje del commit:** `media hecho`.
- **Árbol de trabajo al preparar el resumen inicial:** limpio.
- Los archivos de `frontend-trama/` se verificaron como incluidos en ese commit.
- La referencia local `origin/feat/frontend-v3` apuntaba al mismo commit.
- No se hizo `fetch` después del pedido de pausa; esa comparación corresponde a las referencias locales disponibles.

Este Markdown se agregó después de ese punto de corte. No se realizó un commit ni un push de este documento.

## 8. Continuar desde otra PC

Instalar Node.js 24.15.0 o posterior y obtener la rama:

```bash
git clone --branch feat/frontend-v3 --single-branch https://github.com/DelfiLinares/2026-MTN-Inspiraciones-UnionUserAdmin.git
cd 2026-MTN-Inspiraciones-UnionUserAdmin/frontend-trama
npm ci --ignore-scripts
npm test
```

Si el repositorio ya está clonado, comprobar primero su estado local y cambiar a la rama correspondiente sin descartar trabajo existente.

Para llevar también este resumen, copiar el Markdown a la otra PC o incluirlo explícitamente en Git.

### Punto exacto de continuación

> Leer CreateApp, el manual y este resumen. Mantener el alcance y la identidad ya aprobados. Completar el arranque, las rutas y los estilos de las pantallas escritas; después implementar la administración y validar los flujos completos. No reemplazar el frontend anterior ni presentar la demo como conectada a un backend real.
