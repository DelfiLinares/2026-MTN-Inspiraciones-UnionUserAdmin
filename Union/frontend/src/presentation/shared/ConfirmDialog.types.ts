/**
 * Contrato de props de `ConfirmDialog`.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T023b, depende de T023; hallazgo de
 *   `/speckit.analyze`: evita que cada consumidor defina su propia forma de invocar el diálogo)
 * - Union/specs/002-frontend-admin/spec.md RF-23, RNF-06
 *
 * Este archivo define ÚNICAMENTE el tipo de las props, sin implementación del componente
 * (implementado en T024, `ConfirmDialog.tsx`). Se define por separado para que los 7 consumidores
 * previstos (T036, T037, T044, T045, T058, T066, y la rama condicional de T057) compartan un único
 * contrato de invocación.
 */
export interface ConfirmDialogProps {
  readonly titulo: string
  readonly mensaje: string
  readonly onConfirmar: () => void
  readonly onCancelar: () => void
  readonly cargando?: boolean
}
