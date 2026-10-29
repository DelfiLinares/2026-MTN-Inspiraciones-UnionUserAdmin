# Plataforma de Red Social de Inspiración Artística (Frontend)

Este repositorio contiene la implementación del frontend para la **Red Social de Inspiración Artística**, un ecosistema modular diseñado con una arquitectura en 4 capas estrictas sobre React, Vite y TypeScript. El proyecto unifica y desacopla la experiencia de los usuarios artistas (creación de contenido, descubrimiento, carpetas, desafíos) y de los administradores della plataforma (moderación de reportes, control de cuentas de usuarios, gestión de desafíos y métricas).

---

## Estructura de Proyectos

El espacio de trabajo se organiza en tres subproyectos principales de frontend independientes que consumen una única API REST externa (no incluida en el alcance de este repositorio):

1. **Plataforma de Usuario Independiente**: Ubicada en [Usuario/my-project/backend_usuario/frontend](Usuario/my-project/backend_usuario/frontend), enfocada en interacciones públicas y privadas de usuarios y artistas de la red.
2. **Plataforma de Administración Independiente**: Ubicada en [Admin/my-proyect/frontend-admin](Admin/my-proyect/frontend-admin), enfocada puramente en las vistas del portal de backoffice para administradores y moderación.
3. **Plataforma Unificada (Unión)**: Ubicada en [Union/frontend](Union/frontend), una aplicación integrada que agrupa funcionalmente las superficies de usuario y de administración en una única SPA, respetando los guards de acceso y de roles.

---

## Requisitos Previos

Antes de ejecutar cualquier aplicación, asegúrate de tener instalado en tu sistema:
- **Node.js**: Versión v18 o superior (v20 recomendada).
- **npm**: Versión v9 o superior (incluido por defecto con Node.js).

---

## Guía de Ejecución Rápida

Sigue los siguientes pasos para instalar y levantar cualquiera de los tres subproyectos:

### 1. Frontend de Usuario (Independiente)

Esta aplicación proporciona soporte completo al flujo de artistas (feed, perfil, carpetas, likes, crear publicación).

```bash
# Cambiar al directorio del frontend de usuario
cd Usuario/my-project/backend_usuario/frontend

# Instalar dependencias del proyecto
npm install

# Levantar el servidor de desarrollo local
npm run dev
```
- **URL por Defecto**: `http://localhost:5173` (o el puerto que indique la terminal si el puerto 5173 está ocupado).
- **Consola de test**: `npm run test` para ejecutar los tests unitarios y de integración con Vitest.

---

### 2. Frontend de Administración (Independiente)

Esta aplicación implementa las pantallas dedicadas (dashboard, moderación de posts, control de usuarios, exportar analíticas).

```bash
# Cambiar al directorio del frontend de administración
cd Admin/my-proyect/frontend-admin

# Instalar dependencias del proyecto
npm install

# Levantar el servidor de desarrollo local
npm run dev
```
- **URL por Defecto**: `http://localhost:5173` (u otro puerto alternativo que asigne Vite en caso de colisión, p. ej., `http://localhost:5174`).
- **Consola de test**: `npm run test` para correr los tests, o `npm run test:coverage` para verificar los umbrales de cobertura obligatorios (100% sobre dominio).

---

### 3. Plataforma Unificada (Unión)

Este subproyecto integra de manera consolidada en un solo lugar la experiencia completa declarada en la especificación global de plataforma.

```bash
# Cambiar al directorio de la plataforma unificada
cd Union/frontend

# Instalar dependencias del proyecto
npm install

# Levantar el servidor de desarrollo local
npm run dev
```
- **URL por Defecto**: `http://localhost:5175` (configurado estáticamente en la configuración de Vite).
- **Consola de test**: `npm run test` para validar todos los flujos de integración y comportamiento cruzado con Vitest.

#### Versión visual Trama

La rama `feat/frontend-v2` actualiza la plataforma unificada siguiendo el
[manual de marca](manualMarca/MANUAL_MARCA_RED_ARTISTAS.md) y las
[correcciones de interfaz](manualMarca/feedback.md), sin modificar los contratos
de la API ni los proyectos independientes.

- Identidad compartida para artistas y administración: Inter local, fondo cálido,
  texto carbón, acciones cobalto y estados semánticos. Los tokens viven en
  [global.css](Union/frontend/src/global.css).
- Símbolo Encuentro provisto por el manual, reutilizado desde su PNG original;
  no se presenta como un SVG maestro validado. La licencia de Inter se conserva
  junto con la fuente en [public/brand](Union/frontend/public/brand).
- Navegación superior en escritorio e inferior en móvil, con espacio reservado
  para no cubrir contenido. Login y registro se adaptan a escritorio 16:9 y móvil.
- Inicio sin carrusel: pestañas Para vos y Desafíos, publicaciones y una tarjeta
  de consigna real. Seguidos queda oculto hasta disponer de una API de feed propia.
- Perfil con pestañas de obras y carpetas, y edición en una página dedicada.
  Las carpetas actuales siguen siendo públicas; no se simula almacenamiento privado.
- Los datos siguen viniendo de la API configurada. Carga, vacío y error se muestran
  explícitamente; no se incorporan publicaciones ficticias como respaldo.

---

## Comandos y Tareas Adicionales por Proyecto

Cada uno de los proyectos soporta tareas adicionales descritas en sus respectivos archivos de configuración:

### Construir para Producción (Build)
Para compilar la aplicación optimizada para un entorno de producción, ejecuta en el directorio del proyecto elegido:
```bash
npm run build
```
La salida se exportará a una carpeta `dist` lista para ser servida por servidores web de estáticos (Nginx, Amazon S3, etc.).

### Ejecución de Pruebas Unitarias y de Cobertura
Las pruebas están escritas usando Vitest y React Testing Library:
- **Ejecutar tests una vez (modo CI)**: `npm run test` (o `npm run test:ci` en el frontend de usuario).
- **Ejecutar en modo observador (watch)**: `npm run test:watch`.
- **Análisis de cobertura**: `npm run test:coverage` (disponible en el admin para revisar la cobertura estricta del 100% elegida sobre las entidades de dominio y reglas críticas).

---

## Despliegue automático en Dokploy (frontend unificado)

El workflow [deploy-frontend.yml](.github/workflows/deploy-frontend.yml) despliega
[Union/frontend](Union/frontend) con este flujo:

```text
push a dev -> GitHub Actions -> build Docker -> GitHub Packages (GHCR)
           -> API de Dokploy -> descargar imagen y desplegar
```

Se publica una imagen `linux/amd64` para servidores x86_64 con dos etiquetas:

- `ghcr.io/delfilinares/2026-mtn-inspiraciones-unionuseradmin:latest`
- `ghcr.io/delfilinares/2026-mtn-inspiraciones-unionuseradmin:sha-<commit completo>`

Solo `dev` publica y despliega, usando el environment `testing`; los pushes
a otras ramas no lo hacen. El environment `production` no se utiliza.
Las ejecuciones se serializan para que no compitan por la etiqueta `latest`.
La imagen se compila con Node.js y se sirve con Nginx en el **puerto interno 80**.
Las rutas SPA, como `/login-admin`, funcionan también al recargar.

### 1. Preparar Dokploy (una sola vez)

1. Si todavía no tenés una instancia, seguí la
   [instalación oficial](https://docs.dokploy.com/docs/core/installation)
   en tu VPS, no en la computadora de desarrollo. Configurá el panel con un
   dominio y HTTPS; GitHub Actions debe poder acceder a él por Internet.
2. Creá un proyecto y una **Application** para este frontend.
3. En **Source Type / Provider**, elegí **Docker**, no GitHub ni un build
   desde el repositorio. Configurá esta imagen y guardá:

   ```text
   ghcr.io/delfilinares/2026-mtn-inspiraciones-unionuseradmin:latest
   ```

4. Para una imagen privada, configurá las credenciales del registro en
   Dokploy: registry `ghcr.io`, tu usuario de GitHub y un **personal access
   token classic** con permiso `read:packages` y acceso al paquete. Si tu
   organización usa SSO, autorizá también el token. No uses el API key de
   Dokploy como contraseña del registro.
   Alternativamente, después de la primera publicación podés cambiar la
   visibilidad del paquete a público en GitHub Packages y omitir estas
   credenciales.
5. En **Domains**, agregá el dominio del frontend, apuntá su DNS al VPS,
   seleccioná el **puerto del contenedor 80** y activá HTTPS. No necesitás
   publicar manualmente un puerto del host.
6. Generá un API key en tu perfil de Dokploy con acceso a esta aplicación.
   Obtené también su `applicationId`: está en los datos/URL de la aplicación
   y se puede consultar con la API `GET /api/project.all`.

No hace falta configurar webhooks de GitHub ni de Docker Hub: el workflow
llama a la [API de despliegue de Dokploy](https://docs.dokploy.com/docs/core/auto-deploy#api-method)
**después** de publicar correctamente la imagen.

### 2. Configurar GitHub Actions (una sola vez)

En el repositorio, abrí **Settings → Environments → testing** y creá estos
**Environment secrets** (no variables):

| Secret | Valor |
| --- | --- |
| `DOKPLOY_URL` | URL HTTPS del panel, por ejemplo `https://dokploy.tu-dominio.com`, sin `/api` |
| `DOKPLOY_API_KEY` | API key generado en Dokploy |
| `DOKPLOY_APPLICATION_ID` | ID de la Application creada para el frontend |

El job `deploy` declara `environment: testing` para poder leer esos secrets.
Si configuraste restricciones de ramas en ese environment, permití `dev`;
si requiere aprobación, autorizá el despliegue cuando GitHub lo solicite.
Los secrets de `production` quedan reservados y no se leen en este workflow.

Para publicar en GHCR se utiliza el `GITHUB_TOKEN` automático con
`packages: write`; **no tenés que crear un secret para subir la imagen**.
Si las políticas de tu organización restringen Actions o Packages, habilitá
la ejecución del workflow y su permiso de publicación.

En **Settings → Secrets and variables → Actions → Variables**, configurá las
variables públicas que necesites a nivel de **repositorio**: el job de build
no utiliza un environment.

| Variable | Valor por defecto | Uso |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | URL base del backend accesible desde el navegador, por ejemplo `https://api.tu-dominio.com/api` |
| `VITE_USE_MOCKS` | `false` | Activar los mocks existentes con `true` |
| `VITE_AUTH_GOOGLE_REDIRECT_URL` | Vacío | URL pública del inicio de OAuth Google; vacía usa el endpoint de la API |
| `VITE_AUTH_GITHUB_REDIRECT_URL` | Vacío | URL pública del inicio de OAuth GitHub; vacía usa el endpoint de la API |
| `VITE_GEOLOCATION_ENABLED_DEFAULT` | `false` | Preferencia inicial de geolocalización |

**Importante sobre el backend:** este despliegue incluye solo el frontend.
El proxy a `localhost:8080` de Vite funciona únicamente en desarrollo.
En producción usá una URL HTTPS pública en `VITE_API_URL` y configurá CORS
y cookies en el backend para el dominio del frontend. Si mantenés `/api`,
tenés que enrutar ese prefijo a tu backend en el proxy de Dokploy/Traefik
(con prioridad sobre la ruta del frontend). Sin esa configuración, Nginx
responde 404 a `/api` en lugar de devolver HTML como si fuera una API.
No uses `localhost` ni nombres internos de contenedores como URL pública.

Las variables `VITE_*` se incorporan **durante el build** y son visibles en
el navegador: nunca pongas tokens ni contraseñas en ellas. Cambiarlas en
Dokploy no modifica la imagen; después de cambiarlas en GitHub, ejecutá
nuevamente el workflow. Los archivos `.env` locales no se copian a la imagen.

### 3. Primer despliegue y siguientes actualizaciones

1. Subí estos cambios a `dev`. La primera ejecución publicará el paquete
   en GitHub Packages. Si usás la opción de paquete público, cambiá su
   visibilidad antes de reintentar el job de despliegue.
2. Revisá **Actions → Build frontend and deploy to Dokploy**. Si faltan
   secrets o Dokploy devuelve un error HTTP, el job falla explícitamente;
   no se informa un despliegue exitoso.
3. Revisá **Dokploy → Deployments** para confirmar que terminó y visitá el
   dominio. El éxito del job significa que Dokploy aceptó la solicitud,
   no que el despliegue asíncrono haya terminado.
4. En adelante, cada push a `dev` repite el proceso hacia `testing`
   automáticamente, salvo las aprobaciones que hayas configurado en GitHub.

También se puede ejecutar desde **Actions → Run workflow**, seleccionando
`dev`. GitHub muestra ese botón cuando el workflow también existe en la
rama predeterminada del repositorio; esto no cambia que solo despliegue `dev`.
Para retroceder, podés elegir una etiqueta `sha-<commit>` anterior en
Dokploy y desplegarla manualmente; antes del siguiente despliegue automático,
restaurá la etiqueta `latest` en la configuración de la aplicación.

La imagen tiene un healthcheck HTTP en `/healthz`. Para probarla localmente:

```bash
docker build -t inspiraciones-frontend ./Union/frontend
docker run --rm -p 8080:80 inspiraciones-frontend
# Abrir http://localhost:8080 o consultar http://localhost:8080/healthz
```

---

## Siguiente Lectura Recomendada

Para una inmersión completa sobre la arquitectura interna de 4 capas (Presentación, Aplicación/Servicios, Dominio, e Infraestructura), diagramas de conexión, análisis exhaustivo de qué hace cada carpeta y archivo dentro de los proyectos, y cómo fluye la información en las operaciones clave del sistema, por favor lee las especificaciones detalladas en el archivo [FUNCIONAMIENTO.md](FUNCIONAMIENTO.md).
