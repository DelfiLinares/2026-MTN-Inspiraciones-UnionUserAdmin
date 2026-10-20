/**
 * Rangos cerrados del filtro DISTANCIA, en km (módulo 007, clarify A-02).
 * CUALQUIERA equivale a no filtrar por distancia.
 *
 * Fuente: Union/specs/007-inspiraciones-busqueda/data-model.md
 */
export enum RangoDistancia {
  KM_5 = "KM_5",
  KM_25 = "KM_25",
  KM_100 = "KM_100",
  CUALQUIERA = "CUALQUIERA",
}
