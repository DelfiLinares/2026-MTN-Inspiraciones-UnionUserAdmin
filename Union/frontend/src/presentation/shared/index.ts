/**
 * Barrel export para componentes compartidos del módulo 004-inspiraciones-perfil.
 * 
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T006)
 * - Union/specs/004-inspiraciones-perfil/plan.md (líneas 183)
 * 
 * Exporte centralizado de:
 * - Componentes reutilizables (modales, diálogos)
 * - Mensajes de error centralizados (perfil, carpetas, publicaciones)
 * 
 * Utilizados por: perfil/, carpetas/, publicaciones/, seguimiento/
 */

export * from './ConfirmacionAccionSensibleModal'

// Centralizaciones de mensajes de error (se crean en T065–T068)
// export * from './perfilErrorMessages'
// export * from './carpetaErrorMessages'
// export * from './publicacionErrorMessages'
