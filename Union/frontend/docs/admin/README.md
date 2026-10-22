# Administración de InspiraBoard

Diseño integrado en `Union/frontend`, 22/10/2026. Modo de uso: operar la comunidad, revisar contenido y administrar cuentas.

Se extiende el diseño de Reportes: Manrope, blanco, tinta `#2F2F2F`, texto secundario `#686868`, bordes `#E6E6E6`, superficies `#F5F5F5` y botones principales `#414141`. El encabezado, la navegación, el ancho del contenido, las tablas, los formularios y las confirmaciones forman un sistema común. Los colores de error y confirmación se reservan para esos estados.

[Ver las capturas](index.html) · [Abrir el panel](http://localhost:5175/admin/dashboard)

## Pantallas y rutas

| Ruta | Pantalla |
| --- | --- |
| `/login-admin` | Ingreso administrativo |
| `/admin` | Redirige al resumen |
| `/admin/dashboard` | Resumen de la comunidad |
| `/admin/usuarios` | Búsqueda, filtros y acciones sobre cuentas |
| `/admin/publicaciones` | Listado, edición y eliminación de publicaciones |
| `/admin/promocion` | Otorgar acceso de administrador |
| `/admin/moderacion` | Bandeja de moderación |
| `/admin/moderacion/:reporteId` | Detalle del reporte y acciones de moderación |
| `/admin/desafios` | Desafíos publicados |
| `/admin/desafios/nuevo` | Formulario de publicación |
| `/admin/desafios/:desafioId/editar` | Edición de un desafío |
| `/admin/desafios/propuestas` | Propuestas de la comunidad |
| `/admin/desafios/propuestas/:propuestaId` | Detalle y decisión sobre una propuesta |
| `/admin/solicitudes` | Bandeja de solicitudes |
| `/admin/solicitudes/:solicitudId` | Edición y eliminación de una solicitud |
| `/admin/reportes` | Analíticas y exportación |
| `/admin/reportes/gestion` | Filtros, detalle y gestión de reportes |
| `/admin/*` desconocida | Página de recuperación con enlace al resumen |

Los accesos anteriores `/usuarios`, `/publicaciones`, `/promocion` y `/reportes` redirigen a las rutas administrativas correspondientes. El árbol administrativo activo se concentra en `src/presentation/AppRouterAdmin.tsx`; `App.tsx` lo selecciona para todo `/admin`. El enrutador de usuario conserva sus propios recorridos.

## Correcciones funcionales

- Usuarios y Publicaciones adaptan la respuesta real `contenido` / `totalElementos` al modelo de las pantallas. Las consultas traducen `page` / `pageSize` / `q` a `pagina` / `tamanio` / `texto`, con paginación base cero.
- Búsqueda de Usuarios con envío explícito y reinicio de página al cambiar filtros. La búsqueda real por “Diego” devolvió una cuenta; el listado completo mostró ocho.
- Baneo permanente con el cuerpo que espera la API; eliminación de cuenta por el endpoint POST correspondiente. Se conservan las restricciones sobre administradores y la propia cuenta.
- La edición de publicaciones carga la descripción actual y envía `descripcion`, el campo que espera el backend.
- Las pantallas administrativas de desafíos y solicitudes usan el cliente y la sesión del admin. Sus enlaces de creación, edición, regreso y expiración de sesión permanecen en el contexto administrativo.
- Las confirmaciones contienen el foco, permiten cancelar con Escape y devuelven el foco al control de origen. No se ejecutaron baneos, eliminaciones ni promociones durante la revisión manual.

## Estado del backend

Resumen, Usuarios, Publicaciones, Accesos, Moderación y Reportes se comprobaron con el servicio local. Moderación y Gestión de reportes muestran un vacío válido porque no hay reportes registrados.

Las consultas de Desafíos, Propuestas, Solicitudes y el catálogo de ámbitos fallan en el backend local actual. Sus páginas, formularios y rutas están integrados; se presentan estados de error y recuperación, sin simular éxito ni mostrar los errores como listas vacías. Completar sus operaciones requiere implementar o conectar esos endpoints. La API actual de usuarios tampoco ofrece una operación para quitar el rol de administrador, por lo que esa acción no se expone en la interfaz.

## Verificación

- Compilación de producción y TypeScript correctos.
- 120 pruebas administrativas aprobadas en 17 archivos: rutas de entrada, navegación entre las tres secciones reportadas, guardia de acceso, contrato de listados, servicios, edición, moderación, exportación y teclado de confirmaciones. El resultado de la ejecución final está en [QA-tests.json](QA-tests.json). Se limitó la ejecución a cuatro trabajadores para evitar demoras por contención de recursos.
- ESLint correcto para los componentes nuevos y los principales componentes administrativos modificados. Detector de diseño sin hallazgos.
- Doce pantallas principales verificadas a 390 px, con la app real dentro de un iframe del mismo origen y la sesión existente. Sin desbordes del documento; navegación y tablas tienen desplazamiento propio. Las capturas móviles muestran el primer viewport de 390 × 844.
- Revisión de escritorio y recuperaciones de las cuatro rutas de detalle. Evidencia en [QA-visual.json](QA-visual.json) y `capturas/`.
- Una ejecución más amplia del proyecto no quedó en verde (incluyó fallos en otras áreas); la verificación de este trabajo se informa por su conjunto administrativo, sin afirmar que toda la suite del repositorio pase.

## Archivos centrales

- `src/presentation/admin/AdminLayout.tsx`: marco y navegación.
- `src/presentation/admin/admin.css`: sistema visual con alcance administrativo.
- `src/presentation/admin/AdminUI.tsx`: encabezados, datos legibles y recuperación de rutas.
- `src/presentation/admin/useModalFocus.ts`: comportamiento de teclado de confirmaciones.
- `src/infrastructure/adaptadorListadosAdmin.ts`: compatibilidad con el contrato real de listados.

`build-gallery.cjs` regenera la galería a partir de las capturas. `responsive.html` es una herramienta local de revisión de la aplicación real, sin datos ni credenciales simulados.
