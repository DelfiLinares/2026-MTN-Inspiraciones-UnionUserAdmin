/**
 * A-22 — RESOLUCIÓN
 * 
 * Fecha: 2026-10-13
 * Bloqueador de: T055, T061, T071
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PREGUNTAS Y RESPUESTAS
 * 
 * 1. Formatos soportados: ¿imagen, video, audio o todos?
 *    RESPUESTA: Todos (imagen, video, audio)
 * 
 * 2. Integración con spec 002: ¿las respuestas son publicaciones en el feed?
 *    RESPUESTA: Sí, las respuestas son publicaciones normales que:
 *               - Aparecen en la vista de respuestas del desafío
 *               - Aparecen en la cuenta del usuario (su perfil)
 *               - Aparecen en el FYP (feed) de personas que siguen al autor
 * 
 * 3. Validaciones: ¿qué límites de tamaño y formato?
 *    RESPUESTA: Los recomendados (según spec 002)
 *               Nota: Los límites exactos quedan pendientes de A-15 (RNF-02, RNF-03)
 * 
 * 4. Configuración por desafío: ¿cada desafío define qué acepta?
 *    RESPUESTA: Sí, cada desafío puede especificar qué tipos de contenido acepta
 *               (ej: "solo fotos", "solo video", "todos los formatos")
 * 
 * 5. Edición: ¿se pueden editar respuestas después de enviar?
 *    RESPUESTA: Sí, se pueden editar porque las respuestas son publicaciones normales
 *               y las publicaciones son editables por su autor
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * IMPLICACIONES TÉCNICAS
 * 
 * 1. RespuestaDesafio es una Publicacion
 *    - Hereda campos de Publicacion: contenido, autor, fechaCreacion, etc.
 *    - Adicionales: desafioId (vinculación), estado de respuesta
 *    - Soporta: edición (solo autor), eliminación (autor o admin)
 * 
 * 2. FormularioRespuesta debe permitir:
 *    - Carga de imagen, video o audio
 *    - Validación según formato aceptado del desafío
 *    - Edición de respuestas existentes
 *    - Mostrar errores de validación por campo
 * 
 * 3. Contenido: union type de formatos
 *    type ContenidoRespuesta = 
 *      | { tipo: 'imagen', url: string, formato: 'JPEG' | 'PNG' }
 *      | { tipo: 'video', url: string, formato: 'MP4' | 'WebM' }
 *      | { tipo: 'audio', url: string, formato: 'MP3' | 'WAV' }
 * 
 * 4. Validación a nivel Desafio
 *    - Nuevo campo en Desafio: formatosContenidoAceptados?: ('imagen' | 'video' | 'audio')[]
 *    - Si no especificado, acepta todos
 *    - RespuestaDesafio.validar() debe validar contra esto
 * 
 * 5. Permisos: igual a Publicacion
 *    - Solo el autor puede editar
 *    - El autor o admin pueden eliminar
 *    - El admin NUNCA edita respuestas (aclaración 2026-10-11)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ARCHIVOS AFECTADOS EN FRONTEND
 * 
 * Nuevos:
 *   - frontend/src/domain/RespuestaDesafio.ts (entidad completa)
 *   - frontend/src/desafios/components/FormularioRespuesta.tsx (T055)
 * 
 * Modificados:
 *   - frontend/src/domain/Desafio.ts (agregar formatosContenidoAceptados)
 *   - frontend/src/desafios/components/index.ts (exportar FormularioRespuesta)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * DEPENDENCIAS NECESARIAS
 * 
 * - Publicacion (spec 002): debe existir para heredar tipo de contenido
 * - Validaciones de Publicacion: límites de tamaño (A-15)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ESTADOS DESBLOQUEADOS
 * 
 * ✅ T055 - FormularioRespuesta: LISTA PARA IMPLEMENTAR
 * ✅ T061 - RespuestasDesafioSection: LISTA PARA IMPLEMENTAR (parcial)
 * ✅ T071 - Conservación de borradores: LISTA PARA AMPLIAR
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */
