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

## Siguiente Lectura Recomendada

Para una inmersión completa sobre la arquitectura interna de 4 capas (Presentación, Aplicación/Servicios, Dominio, e Infraestructura), diagramas de conexión, análisis exhaustivo de qué hace cada carpeta y archivo dentro de los proyectos, y cómo fluye la información en las operaciones clave del sistema, por favor lee las especificaciones detalladas en el archivo [FUNCIONAMIENTO.md](FUNCIONAMIENTO.md).
