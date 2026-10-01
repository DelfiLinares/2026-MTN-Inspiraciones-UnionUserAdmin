# Checklist de calidad funcional — 002 Inspiraciones

**Objetivo**: validar la calidad de los requisitos de `spec.md` (completitud, claridad, consistencia, testeabilidad). No verifica la implementación.
**Fecha**: 2026-10-01
**Leyenda**: `[x]` cumple · `[ ]` no cumple o pendiente (con nota)

## Completitud

- [x] CHK001 Cada requisito funcional tiene al menos una historia de usuario asociada (RF-01 a RF-29 ↔ HU-01 a HU-13).
- [x] CHK002 Los tres actores (usuario, admin, sistema) tienen responsabilidades definidas.
- [x] CHK003 Se listan explícitamente los elementos fuera de alcance.
- [ ] CHK004 Están definidas las reglas del feed y su orden. → A-12 sin resolver.
- [ ] CHK005 Están definidos los filtros concretos de búsqueda. → A-10 sin resolver.
- [ ] CHK006 Está definida la lista de motivos de reporte y el límite del texto libre. → A-13.
- [ ] CHK007 Está definida la visibilidad de las carpetas públicas (quién las ve, cómo se descubren). → A-5.
- [ ] CHK008 Están definidas las restricciones de nombres de carpeta (unicidad, longitud). → A-7.
- [ ] CHK009 Existe criterio de aceptación para "carpeta pública" sobre visibilidad a terceros (HU-10 solo cubre el cambio de visibilidad).
- [ ] CHK010 Existe criterio de aceptación para los casos de error de red/API (timeout, 5xx) en las acciones.
- [ ] CHK011 Hay requisitos de accesibilidad y de idioma de la interfaz.
- [ ] CHK012 Está definido el comportamiento ante una edición de publicación reportada (A-8).
- [ ] CHK013 Está definido el flujo de autenticación mínimo en el frontend (login, expiración); solo se cubre el rol en la sesión (RF-10b) y CB-09.

## Claridad

- [ ] CHK014 RNF-02 (tiempos y volumen) está cuantificado. → "A DEFINIR"; no es medible.
- [ ] CHK015 "Interfaz amigable y visual" (RNF-01) tiene criterio medible. → Subjetivo.
- [ ] CHK016 "Fáciles de encontrar y usar" tiene criterio medible (p. ej., clics máximos, visibilidad sin scroll).
- [x] CHK017 El borrado está definido como lógico (`ELIMINADA`).
- [x] CHK018 Los formatos admitidos están listados (png, jpeg, mp4, avi, mp3).
- [ ] CHK019 Los topes de tamaño son conocidos por el frontend. → Los define el backend; falta definir cómo los obtiene el frontend (configuración o respuesta de error).
- [ ] CHK020 "Categoría o etiquetas" aclara si son obligatorias, cuántas y si son libres o de lista cerrada.
- [ ] CHK021 "Cierto tiempo (4 años)" de retención es responsabilidad explícita del backend; el frontend no la gestiona (agregar nota).
- [ ] CHK022 Los términos "feed" y "listado" se diferencian o se unifican.

## Consistencia

- [ ] CHK023 Constitution y spec coinciden en el alcance: la constitution incluye comentarios y edición por admin; la spec los excluye (A-14).
- [ ] CHK024 `TipoContenido` de la constitution (IMAGEN, VIDEO, MUSICA, TUTORIAL) coincide con los formatos de la spec (TUTORIAL no tiene formato).
- [ ] CHK025 `TipoFiltro` de la constitution (incluye DISTANCIA) coincide con los filtros de la spec (sin geolocalización).
- [ ] CHK026 Principio 6 (admin "exclusivamente" administrativo) es consistente con "admin = usuario con extras".
- [ ] CHK027 La constitution (principio 8) menciona promover a admin y la spec excluye gestión de usuarios.
- [ ] CHK028 La constitution (principio 13) incluye baneo/eliminación de usuarios, fuera de alcance en la spec.
- [ ] CHK029 La constitution (principio 6) dice que el admin edita publicaciones de cualquier usuario; RF-08 lo prohíbe.
- [ ] CHK030 La constitution lista `EstadoPublicacion.REPORTADA`; la spec decidió que la publicación reportada sigue visible (A-16) y no define si cambia a ese estado.
- [ ] CHK031 La constitution menciona "recomendaciones" y la spec las excluye, pero pide "algoritmo con feed" (A-12).
- [x] CHK032 Reglas de like (propio, duplicado) coinciden entre HU-07 y RF-11 a RF-15.
- [x] CHK033 Reglas de reporte coinciden entre HU-11 y RF-21 a RF-23.
- [ ] CHK034 La regla "no like a publicación propia" se aplica explícitamente al admin tras la clarificación (agregar a HU-07).
- [ ] CHK035 La matriz de permisos (usuario/admin) está explicitada en una tabla única.

## Testeabilidad

- [x] CHK036 Las reglas de permisos (borrar ajena, editar ajena, admin editar) tienen criterios Dado/Cuando/Entonces verificables.
- [x] CHK037 Las reglas de unicidad (like, reporte) son verificables.
- [x] CHK038 Los casos borde CB-01 a CB-11 tienen resultado esperado observable.
- [ ] CHK039 Los criterios de HU-04/05/06 son verificables: faltan tamaño de página, orden y filtros concretos.
- [ ] CHK040 El criterio de "confirmación tras cada acción" define el mecanismo observable (mensaje, duración).
- [ ] CHK041 Criterios de éxito (sección 11) son medibles: dependen de RNF-02.
- [ ] CHK042 Cada requisito tiene ID de aceptación trazable (HU ↔ RF ↔ test); falta una matriz de trazabilidad.
- [ ] CHK043 Las reglas que valida el backend se distinguen de las que valida el frontend para poder testearlas por separado.

## Resumen

- Cumplen: 10 de 43.
- **¿La spec es testeable?** Parcialmente. Las reglas de permisos, likes y reportes sí lo son. Los bloqueos son la falta de métricas (CHK014 a CHK016, CHK041), el feed y los filtros sin definir (CHK004, CHK005, CHK039) y las contradicciones con la constitution (CHK023 a CHK031).

## Acciones sugeridas (por prioridad)

1. Reconciliar la constitution con la spec (CHK023 a CHK031): quitar comentarios, edición por admin, baneo y promoción, o ajustar el alcance.
2. Definir feed, filtros y motivos de reporte (CHK004 a CHK006).
3. Cuantificar RNF-02 y la usabilidad (CHK014 a CHK016).
4. Agregar la matriz de permisos y la de trazabilidad (CHK035, CHK042).
5. Resolver A-5, A-7 y A-8 (CHK007, CHK008, CHK012).
