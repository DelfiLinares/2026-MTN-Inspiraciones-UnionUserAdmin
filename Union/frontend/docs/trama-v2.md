# Trama: adaptación del frontend

## Rama y alcance

- Rama: `feat/trama-v2`, creada desde `main` (`cd307655`).
- Se integró `dev` (`8aee72b8`) mediante avance rápido, con autorización, para conservar los 370 commits que no estaban en `main`.
- No se modificaron las ramas `main` y `dev`, los contratos HTTP, los servicios ni el backend.
- Se adaptaron la experiencia de usuarios y la consola administrativa a la identidad del [manual de Trama](../../../manualMarca/MANUAL_MARCA_RED_ARTISTAS.md).

## Diseño aplicado

- Paleta clara oficial: cobalto `#2447D8`, fondo `#FAF9F6`, superficie blanca, tinta `#202327` y selección `#E8EDFF`.
- Inter local, con su licencia en `public/Inter-OFL.txt`; sin dependencia de Google Fonts.
- Símbolo Encuentro reutilizado desde el PNG oficial. No se generó un símbolo alternativo ni se declara validado un SVG maestro.
- Tokens compartidos en [global.css](../src/global.css) y adaptación de componentes existentes en [trama.css](../src/trama.css).
- Navegación de usuarios con Inicio, Descubrir, Desafíos y Perfil: lateral en escritorio, compacta en tablet e inferior en móvil.
- Publicar utiliza el diálogo y los servicios existentes. La confirmación aparece únicamente después de la respuesta exitosa del servicio.
- Acceso a notificaciones y cierre de sesión conservados, también en móvil.
- Formularios de acceso fluidos, perfiles sin recuadro decorativo, controles de al menos 44 px y campos de 48 px.
- Feed en orden de lectura, imágenes sin filtro de marca y enlace al detalle existente.
- Foco visible, contención de teclado en publicación, Escape, devolución de foco y movimiento reducido.
- Las tablas administrativas mantienen su desplazamiento horizontal dentro de su contenedor.

## Ejecución

Desde `Union/frontend`:

```sh
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Ingreso de usuarios: `/login`. Administración: `/login-admin`.
La conexión a la API sigue usando la configuración existente. No hay un modo de demostración nuevo ni se crearon credenciales.

## Verificación

- `npm run build`: TypeScript y compilación Vite correctos. Se conserva la advertencia de un chunk mayor de 500 kB.
- ESLint sin errores en Marca, UserLayout, HomePage, PaginaBusqueda y el nuevo test de navegación.
- 33 pruebas focalizadas aprobadas: 6 de navegación Trama, 6 de registro, 5 de acceso suspendido, 2 de edición de perfil, 1 de categorías del perfil, 2 de publicación con archivo, 1 de teclado administrativo y 10 del encabezado del cuestionario.
- Navegador revisado a 320, 390, 768, 1024 y 1440 px, sin desbordamiento de página en las pantallas comprobadas de acceso, registro, inicio, búsqueda, desafíos, perfil, edición, cuestionario y secciones administrativas.
- Probadas la carga de las imágenes del feed, la navegación activa, el foco inicial del diálogo, Escape y el regreso al botón Publicar.
- Las comprobaciones de pantallas protegidas usaron respuestas HTTP simuladas exclusivamente en el navegador de pruebas. No se incorporaron fixtures al runtime ni se escribieron datos reales en el backend.

La selección administrativa anterior de `AdminNavigation`, `AdminEntrypoints` y `AdminModalKeyboard` produjo 21 fallas y 12 éxitos tanto en esta versión como en una copia intacta de `dev`. Las fallas corresponden a mocks de sesión y expectativas de rutas existentes; no se modificaron como parte del rediseño.

## Límites

No se declara aprobada toda la suite del repositorio ni se certifica conformidad WCAG completa. La revisión de layout cubre los estados cargados con fixtures, vacíos y errores observados; no todos los contenidos posibles ni dispositivos físicos.

Las funciones no soportadas por la API no se simulan: no se agregaron pestañas funcionales de música o lugares, reproducción persistente, tema oscuro, rankings ni operaciones exitosas ficticias. Los errores reales de conexión requieren la API y su configuración, fuera del alcance visual acordado.

La instalación también informa vulnerabilidades en el árbol de dependencias existente; no se aplicaron actualizaciones incompatibles ni `npm audit fix --force`.