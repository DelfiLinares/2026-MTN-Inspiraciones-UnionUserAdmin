/**
 * `ReportesPage`: Página contenedora (placeholder) para la pantalla de revisión de reportes,
 * incluyendo la acción de exportación (botón integrado en el mismo listado; no existe
 * `ExportacionPage.tsx` separada, Clarifications Session 2026-10-01).
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T030, depende de T022, T023)
 * - Union/specs/002-frontend-admin/plan.md §Project Structure
 *   (`src/presentation/reportes/` → "Pantalla: revisión de reportes (ver, aceptar, rechazar) y
 *   exportación")
 *
 * Nota de colisión de nombres: `Union/frontend/src/presentation/reportes/` ya contenía
 * `ReportesAnaliticaPage.tsx` (preexistente, de `001-plataforma-unificada`, T101: dashboard de
 * analíticas administrativas, no relacionado con moderación de reportes). Este archivo nuevo,
 * `ReportesPage.tsx`, es la pantalla del módulo `002-frontend-admin` (revisión/moderación de
 * reportes de contenido), una entidad y propósito completamente distintos; ambos conviven en la
 * misma carpeta sin conflicto de nombre de archivo.
 *
 * Placeholder vacío: el cableado real (Fase 7, pendiente) consumirá `ReportesService` para
 * listar/aceptar/rechazar reportes y exportar resultados (RF-19, RF-20).
 */

import React from 'react'

export const ReportesPage: React.FC = () => {
  return (
    <section>
      <h1>Reportes</h1>
    </section>
  )
}
