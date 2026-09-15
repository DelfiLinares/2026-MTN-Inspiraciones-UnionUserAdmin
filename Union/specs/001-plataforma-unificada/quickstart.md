# Quickstart: Plataforma Unificada — Frontend Usuario + Frontend Admin

**Input**: `plan.md`, `research.md`, `data-model.md`, `contracts/api-contracts.md`

Esta guía describe cómo ejecutar localmente ambos frontends una vez implementados, incluyendo
configuración de variables de entorno y estrategia de mock de la API mientras el backend no esté
disponible. **No implica que el código ya exista**; es la guía de referencia a seguir cuando se
implemente, para mantener consistencia entre ambos equipos de frontend.

---

## 1. Requisitos previos

- Node.js LTS (≥ 18.x) y un gestor de paquetes (npm, pnpm o yarn — a definir en fase de tasks).
- Acceso a la API REST del backend (o a un servidor de mocks compatible con
  `contracts/api-contracts.md`).

---

## 2. Variables de entorno

Ambos frontends son proyectos Vite independientes; cada uno define su propio `.env` en la raíz de
su carpeta.

### `frontend/.env`
```dotenv
VITE_API_BASE_URL=http://localhost:8080/api
VITE_AUTH_GOOGLE_REDIRECT_URL=http://localhost:8080/auth/google
VITE_AUTH_GITHUB_REDIRECT_URL=http://localhost:8080/auth/github
VITE_GEOLOCATION_ENABLED_DEFAULT=false
```

### `frontend-admin/.env`
```dotenv
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SESSION_EXPIRY_REDIRECT=/login
```

> Ninguna clave secreta (client secret de OAuth, credenciales de backend) debe residir en estos
> `.env` de frontend: la resolución de OAuth ocurre en el backend (ver `research.md`, punto 3).

---

## 3. Instalación y ejecución (referencia, sin ejecutar código en esta fase)

```bash
# Frontend de usuario
cd frontend
npm install
npm run dev

# Frontend de administración (en otra terminal)
cd frontend-admin
npm install
npm run dev
```

Ambos se ejecutan como SPA independientes, típicamente en puertos distintos (por ejemplo, `5173` y
`5174`), sin dependencias cruzadas entre sí.

---

## 4. Conexión con la API / Mockeo

Mientras el backend no esté disponible, se recomienda:

1. Levantar un servidor de mocks (por ejemplo, un JSON server o un mock server basado en el
   contrato de `contracts/api-contracts.md`) que responda en `VITE_API_BASE_URL`.
2. Asegurar que las respuestas de mock incluyan los campos exactos documentados en cada endpoint
   (incluyendo casos 4xx/5xx) para poder probar los casos borde (CB-01 a CB-15 de `spec.md`) sin
   depender de un backend real.
3. Para probar expiración de sesión (CB-06, CB-13), el mock debe poder simular una respuesta `401`
   en cualquier endpoint autenticado bajo demanda (por ejemplo, mediante un header o flag de
   control en el propio mock).

---

## 5. Validación manual de extremo a extremo (smoke test funcional)

### Frontend de Usuario
1. Registrar una cuenta nueva (HU-05) → verificar redirección a cuestionario (RF-09).
2. Iniciar sesión con mail/contraseña (HU-04) → verificar redirección a home.
3. Publicar contenido con al menos un tag (HU-02) → verificar que aparece en el perfil sin recargar.
4. Dar like a una publicación ajena (HU-01) → verificar actualización optimista y su reverso ante
   error simulado (mock devolviendo 500 en el endpoint de like).
5. Buscar con un filtro activo (HU-03) → verificar chip removible y estado vacío al usar un filtro
   muy restrictivo (CB-04).
6. Reportar una publicación ajena (HU-07) → verificar que el botón se deshabilita tras el envío.
7. Seguir a otro usuario (HU-08) → verificar botón ausente en el perfil propio (RF-37).
8. Crear una carpeta y guardar un post (HU-09) → verificar conteo de posts actualizado.

### Frontend de Administración
1. Intentar ingresar con un usuario rol USER (HU-10) → verificar rechazo con mensaje claro
   (AC-10.2).
2. Ingresar con un usuario rol ADMIN → verificar acceso al dashboard con los 7 indicadores
   (HU-13).
3. Abrir el listado de publicaciones reportadas y ver el detalle de un reporte (HU-11).
4. Eliminar una publicación reportada → verificar modal de confirmación explícita antes de
   ejecutar (RF-63).
5. Marcar un reporte como "resuelto sin eliminar" (HU-11) → verificar que la publicación permanece
   ACTIVA/REPORTADA según corresponda y solo cambia el estado del reporte.
6. Intentar banear/eliminar a otro ADMIN o a sí mismo (CB-11) → verificar que la acción está
   deshabilitada en la UI.
7. Promover un usuario USER a ADMIN (HU-12) → verificar confirmación explícita previa.
8. Intentar promover a un usuario que ya es ADMIN (CB-12) → verificar rechazo como no-op.
9. Aprobar/rechazar un desafío propuesto (HU-14) → verificar que las acciones quedan deshabilitadas
   permanentemente tras la decisión (CB-15).
10. Solicitar una exportación de reporte (HU-15) → verificar comportamiento síncrono y, en caso de
    simular un fallo del backend, el mensaje exacto "Error: Reporte no generado." (RF-74).
11. Simular expiración de sesión a mitad de una confirmación destructiva (CB-13) → verificar
    cancelación de la acción y redirección a login con mensaje explícito.

---

## 6. Ejecución de tests

```bash
# Dentro de cada proyecto de frontend
npm run test        # Vitest — tests unitarios de dominio y servicios
npm run test:watch  # modo watch durante desarrollo
```

Prioridad de cobertura según RNF-14 de `spec.md` (reglas de negocio críticas):
- `frontend/tests/domain/`: reglas de `Publicacion` (like/reportar/editar según autoría),
  `Usuario` (botón seguir en perfil propio), `Filtro` (habilitación de distancia), `Carpeta`
  (límite de 100).
- `frontend-admin/tests/domain/`: reglas de `UsuarioAdmin` (banear/eliminar/promover según rol),
  `DesafioPropuesto` (transición final de estado), `Reporte` (resolución sin eliminar).

---

## 7. Checklist previo a considerar el entorno "listo"

- [ ] `.env` configurado en ambos proyectos, apuntando a la misma `VITE_API_BASE_URL` (real o mock).
- [ ] Mock o backend real respondiendo los contratos de `contracts/api-contracts.md`.
- [ ] Smoke test manual de la sección 5 ejecutado sin errores bloqueantes.
- [ ] Tests de dominio de la sección 6 en verde para las reglas críticas de RNF-14.
- [ ] Verificado que `frontend/` no expone ninguna pantalla/acción administrativa (RF-15) y que
  `frontend-admin/` no expone ninguna pantalla exclusiva de usuario final (sección "Fuera de
  Alcance" de `spec.md`).
