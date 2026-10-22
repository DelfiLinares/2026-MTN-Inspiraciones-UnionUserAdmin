# Checklist de calidad — 008 Recuperar cuenta y contraseña

**Fecha**: 2026-10-22 | **Spec**: [../spec.md](../spec.md)

## Completitud
- [x] CHK001 Cada HU tiene criterios de aceptación verificables.
- [x] CHK002 Todos los RF trazan a una o más HU.
- [x] CHK003 Alcance y fuera de alcance explícitos (DELETED excluido).
- [x] CHK004 Parámetros del OTP definidos (longitud, vigencia, intentos, reenvío, tasa).
- [x] CHK005 Política de contraseña definida y alineada con el registro del backend.

## Claridad y consistencia
- [x] CHK006 Sin marcadores `[NEEDS CLARIFICATION]` pendientes.
- [x] CHK007 Mensajes de error distinguen OTP incorrecto, vencido, agotado y límite de tasa.
- [x] CHK008 El código de error `CUENTA_BANEADA` coincide con lo que ya maneja `authService.ts`.
- [ ] CHK009 Parámetros A-3 y A-9 confirmados por el equipo backend. **Pendiente externo.**

## Seguridad
- [x] CHK010 Anti-enumeración definida (A-4, RF-02).
- [x] CHK011 No se persisten código ni contraseña en el cliente (RF-12).
- [x] CHK012 Autorización de la vista admin delegada al backend (IX).
- [x] CHK013 Invalidación de sesiones previas exigida al backend (A-6).

## Cobertura de escenarios
- [x] CHK014 Flujo principal, reenvío, vencimiento, intentos agotados, 429, red caída.
- [x] CHK015 Apelación: éxito, duplicada, rechazo reciente.
- [x] CHK016 Accesibilidad y móvil (HU-09, RNF-02).

## Gobernanza
- [x] CHK017 Sin código en esta fase (XV) ni backend de prueba (III, IV).
- [x] CHK018 Dependencias externas identificadas y documentadas en `research.md`.
