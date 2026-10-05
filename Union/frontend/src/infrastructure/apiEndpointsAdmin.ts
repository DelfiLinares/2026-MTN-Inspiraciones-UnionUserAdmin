/**
 * Catálogo de rutas relativas de la API para el módulo `002-frontend-admin` (gestión de usuarios y
 * publicaciones).
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T032; T040, depende de T032)
 * - Union/specs/002-frontend-admin/contracts/openapi.yaml (`/usuarios`,
 *   `/usuarios/{usuarioId}/banear`, `/usuarios/{usuarioId}/eliminar`, `/publicaciones`,
 *   `/publicaciones/{publicacionId}`, `/publicaciones/{publicacionId}/eliminar`)
 *
 * Nota de colisión de nombres (mismo patrón documentado en T012/T014/T015/T020/T022/T030/T031):
 * `tasks.md` indica la ruta `frontend-admin/src/infrastructure/apiEndpoints.ts`, pero ese nombre ya
 * está ocupado en `Union/frontend/src/infrastructure/apiEndpoints.ts` por el catálogo del módulo
 * administrativo de `001-plataforma-unificada` (T043), cuyas rutas usan el prefijo `/admin/...`
 * (p. ej. `/admin/usuarios/{id}/banear`). El contrato de ESTE módulo (`contracts/openapi.yaml` de
 * `002-frontend-admin`) define rutas SIN ese prefijo (`/usuarios`, `/usuarios/{id}/banear`,
 * `/usuarios/{id}/eliminar`, `/publicaciones`, etc.), por lo que no pueden unificarse sin alterar
 * ninguno de los dos contratos existentes. Por lo tanto, este archivo se llama
 * `apiEndpointsAdmin.ts`, siguiendo el mismo patrón de sufijo `*Admin` aplicado a los enums e
 * interfaces de este módulo.
 */

export const apiEndpointsAdmin = {
  usuarios: () => '/usuarios',
  banearUsuario: (usuarioId: string) => `/usuarios/${usuarioId}/banear`,
  eliminarUsuario: (usuarioId: string) => `/usuarios/${usuarioId}/eliminar`,

  // Gestión de publicaciones (RF-09 a RF-12, T040)
  publicaciones: () => '/publicaciones',
  publicacion: (publicacionId: string) => `/publicaciones/${publicacionId}`,
  eliminarPublicacion: (publicacionId: string) => `/publicaciones/${publicacionId}/eliminar`,
} as const
