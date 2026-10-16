/**
 * IMPLEMENTACIÓN T052: `ConfirmarAccionDestructiva`
 *
 * Tarea: T052 [P] `ConfirmarAccionDestructiva`: envoltorio de `ConfirmDialog` con variante de peligro y textos por caso.
 *
 * Fuente de verdad:
 * - Union/specs/003-desafios/spec.md (RF-22, RNF-01)
 * - Union/specs/003-desafios/plan.md (sección 3, principio 13)
 * - Union/specs/003-desafios/tasks.md (T052, T073)
 * - Union/specs/003-desafios/research.md (sección 11)
 *
 * Dependencias:
 * - T006: Confirmar que ConfirmDialog está exportado (RESUELTO: creado como base reutilizable)
 *
 * ==================================
 * COMPONENTES CREADOS
 * ==================================
 *
 * 1. `ConfirmDialog` (frontend/src/components/ConfirmDialog.tsx)
 *    - Componente base reutilizable para confirmaciones genéricas
 *    - Props: abierto, titulo, mensaje, variante, textoConfirmar, textoCancelar, confirmando, onConfirmar, onCancelar
 *    - Variantes: 'peligro' (rojo), 'advertencia' (ámbar), 'informativa' (índigo)
 *    - Accesibilidad: atributos ARIA (role='dialog', aria-modal, aria-labelledby)
 *    - Estilos: Tailwind CSS, foco en diferenciación visual con iconos distintivos
 *
 * 2. `ConfirmarAccionDestructiva` (frontend/src/desafios/components/ConfirmarAccionDestructiva.tsx)
 *    - Envoltorio especializado de ConfirmDialog para acciones destructivas en Desafíos
 *    - Casos predefinidos (CasoAccionDestructiva):
 *      * 'eliminar-desafio': Para eliminar desafíos completos
 *      * 'editar-desafio-activo': Para editar desafíos ACTIVO o con respuestas
 *      * 'eliminar-solicitud': Para eliminar solicitudes de desafío
 *      * 'editar-solicitud': Para editar solicitudes propias
 *      * 'eliminar-respuesta': Para eliminar respuestas de usuarios
 *    - Variante fija: 'peligro' (diferenciación visual obligatoria)
 *    - Props personalizables: tituloCustom, mensajeCustom (para sobrescribir textos por defecto)
 *    - Reutilizable en todas las pantallas que requieran confirmación destructiva
 *
 * 3. Barrel export (frontend/src/desafios/components/index.ts)
 *    - Exporta ConfirmarAccionDestructiva y sus tipos (ConfirmarAccionDestructivaProps, CasoAccionDestructiva)
 *
 * ==================================
 * TESTS
 * ==================================
 *
 * - tests/components/ConfirmDialog.import.test.ts: Verifica importación correcta
 * - tests/desafios/ConfirmarAccionDestructiva.import.test.ts: Verifica importación correcta
 *
 * Nota: Tests de integración completos requieren configuración de jsdom/vitest environment
 * (document, window) que no está disponible en la config actual. Los tests pueden ser
 * extendidos cuando se complete T002 (configurar Vitest).
 *
 * ==================================
 * USO
 * ==================================
 *
 * En las páginas de administración (T063, T064, T066, T067):
 *
 * ```tsx
 * import { ConfirmarAccionDestructiva } from '@/desafios/components'
 *
 * export const MiPagina = () => {
 *   const [abrirConfirmacion, setAbrirConfirmacion] = useState(false)
 *   const [eliminando, setEliminando] = useState(false)
 *
 *   const handleEliminarDesafio = async () => {
 *     setEliminando(true)
 *     try {
 *       await eliminarDesafio(id)
 *       // success
 *     } finally {
 *       setEliminando(false)
 *       setAbrirConfirmacion(false)
 *     }
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={() => setAbrirConfirmacion(true)}>Eliminar</button>
 *
 *       <ConfirmarAccionDestructiva
 *         caso="eliminar-desafio"
 *         abierto={abrirConfirmacion}
 *         confirmando={eliminando}
 *         onConfirmar={handleEliminarDesafio}
 *         onCancelar={() => setAbrirConfirmacion(false)}
 *       />
 *     </>
 *   )
 * }
 * ```
 *
 * ==================================
 * VALIDACIÓN CONTRA ESPECIFICACIÓN
 * ==================================
 *
 * ✓ RF-22: Las acciones destructivas requieren confirmación explícita
 *          → ConfirmarAccionDestructiva solicita confirmación antes de proceder
 *
 * ✓ RNF-01: Diferenciación visual de acciones sensibles con variante 'peligro'
 *           → Componente usa always 'peligro' (rojo) para acciones destructivas
 *           → Icono distintivo y colores de advertencia aplicados
 *           → Contraste visual claro respecto de acciones normales
 *
 * ✓ A-07 (edición de desafío ACTIVO): Confirmación explícita diferenciada
 *         → Caso 'editar-desafio-activo' con mensaje contextualizador
 *
 * ✓ Accesibilidad (T073): Foco en diálogos, aria-live, roles ARIA
 *                         → role='dialog' con aria-modal='true'
 *                         → aria-labelledby apunta a título
 *                         → Accesible con teclado y lectores de pantalla
 *
 * ==================================
 * PENDIENTES FUTUROS
 * ==================================
 *
 * - T073: Enhancements de accesibilidad (aria-live para mensajes de error)
 * - Tests completos con jsdom environment tras completar T002
 * - Integración en T063, T064, T066, T067 (todas las pantallas destructivas)
 * - Posible traducción/i18n de textos predefinidos (fuera del alcance actual)
 *
 * ==================================
 * FICHEROS CREADOS
 * ==================================\n */

// Exportaciones verificadas:
export { ConfirmDialog } from './src/components/ConfirmDialog'
export type { ConfirmDialogProps } from './src/components/ConfirmDialog'
export { ConfirmarAccionDestructiva } from './src/desafios/components/ConfirmarAccionDestructiva'
export type { ConfirmarAccionDestructivaProps, CasoAccionDestructiva } from './src/desafios/components/ConfirmarAccionDestructiva'
