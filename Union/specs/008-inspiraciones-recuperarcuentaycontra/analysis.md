# Análisis de consistencia — 008 Recuperar cuenta y contraseña

**Fecha**: 2026-10-22 | Solo lectura sobre spec, plan, tasks, contrato y constitución.

## 1. Cobertura requisito → tarea

| RF | Tareas | Estado |
|---|---|---|
| RF-01 | T014, T015, T018 | ✅ |
| RF-02 | T009, T020 | ✅ |
| RF-03 | T002 | ✅ |
| RF-04 | T003 | ✅ |
| RF-05 | T004, T015 | ✅ |
| RF-06 | T007, T010 | ✅ |
| RF-07 | T010, T019 | ✅ |
| RF-08 | T021 | ✅ |
| RF-09 | T022, T024 | ✅ |
| RF-10 | T013, T016 | ✅ |
| RF-11 | T026–T028 | ✅ |
| RF-12 | T010, T032 | ✅ |
| RF-13 | T008 | ✅ |
| RF-14 | T009–T012 (red/5xx cubierto en T009) | ✅ (H-03 resuelto) |

Todas las HU (01–09) tienen al menos una tarea; no hay tareas huérfanas.

## 2. Hallazgos

| ID | Severidad | Hallazgo | Acción |
|---|---|---|---|
| H-01 | Alta | El backend no implementa ninguno de los endpoints del contrato; la integración real queda bloqueada (research G-01…G-10). | Abrir spec en el repo API (ver research §6). No bloquea Fases 1–2 ni los tests con cliente simulado. |
| H-02 | Media | A-3 y A-9 (parámetros de OTP y reglas de apelación) son supuestos sin confirmar con backend (CHK009). | Confirmar antes de integrar; están centralizados en T001. |
| H-03 | Baja | RF-14 (error de red/5xx) no tenía test dedicado. | Resuelto: incorporado a T009. |
| H-04 | Baja | La constitución de Union está escrita para admin; este módulo es de usuario final. | Igual que 006; sin conflicto de principios. Considerar una enmienda de alcance en la constitución. |
| H-05 | Baja | `authService.ts` usa `/auth/me` y `/auth/logout` inexistentes en la API. | Fuera de alcance; informado en research §4. |
| H-06 | Media | G-06 cambia el comportamiento de login (de 401 a 403 para SUSPENDED con contraseña correcta); puede afectar a otros clientes. | Revisar tests existentes `AuthControllerLoginTest` al planificar el backend. |

## 3. Constitución

Sin violaciones. Principios III, IV y XV respetados: no se creó código ni backend de prueba; los faltantes del backend se documentan como dependencias.

## 4. Veredicto

La documentación está completa y consistente para pasar a implementación del **frontend** (Fases 1–6). La integración extremo a extremo queda condicionada a B-01…B-08 en el backend.
