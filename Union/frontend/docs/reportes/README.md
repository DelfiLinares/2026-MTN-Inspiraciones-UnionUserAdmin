# Diseño de Reportes y analíticas

Implementado el 22/10/2026 en `/admin/reportes`, dentro de este frontend.

La referencia de esta pantalla es la interfaz existente: Manrope, blanco, escala de grises, marca InspiraBoard, bordes suaves y controles redondeados. Se conserva esa identidad, sin aplicar la dirección editorial de los mockups anteriores.

## Organización

- Navegación administrativa y acceso al panel.
- Título, actualización de datos y exportación del reporte.
- Resumen de reportes registrados, pendientes, publicaciones activas y usuarios activos.
- Distribuciones de reportes por estado, motivo y prioridad.
- Estado de publicaciones y usuarios.
- Campos adicionales del contrato genérico en una sección desplegable legible.

Las cifras provienen de `obtenerAnaliticas()`. No se inventan tendencias, períodos ni filtros sin soporte. Los campos ausentes se distinguen de los ceros con “Sin datos”. Las barras representan la proporción de cada categoría dentro de su distribución.

## Estados e interacción

Carga, ausencia de reportes, error de consulta con reintento, generación de archivo, éxito con enlace de descarga y error de exportación recuperable. La exportación mantiene el servicio existente y el cuerpo `{}`. El enlace incluye `download` para admitir también las respuestas CSV mediante URL de datos que entrega el servicio local.

Estilos limitados a `.ra-page`, navegación por teclado, enlace de salto al contenido, foco visible y adaptación para movimiento reducido. No se modifican las pantallas vecinas ni los mecanismos de sesión.

## Verificación

- `npm run build`: correcto.
- Pantalla y servicio: 12 pruebas correctas (`ReportesAnaliticaPage.test.tsx` y `ReportesAnaliticaService.test.ts`). Cubren categorías nuevas, campos adicionales, ceros frente a datos ausentes, reintento, exportación en curso, enlace de descarga y fallo de exportación.
- Revisión visual en 1440 × 1080, 820 × 1180 y 390 × 844; sin desbordes horizontales.
- Actualización y generación del CSV comprobadas contra el servicio de `localhost:5175`. La automatización no confirmó el guardado final del archivo descargado.
- Detector de diseño sin hallazgos. ESLint del componente correcto, ejecutado con `node node_modules/eslint/bin/eslint.js src/presentation/reportes/ReportesAnaliticaPage.tsx` (el enlace de consola de ESLint no existe en este checkout).

## Capturas

- [Escritorio](capturas/reportes-escritorio.jpg)
- [Tableta](capturas/reportes-tableta.jpg)
- [Móvil](capturas/reportes-movil.jpg)
- [Versión final con exportación generada](capturas/reportes-final.jpg)

## Archivos

- `src/presentation/reportes/ReportesAnaliticaPage.tsx`
- `src/presentation/reportes/reportes-analitica.css`
- `tests/presentation/ReportesAnaliticaPage.test.tsx`
