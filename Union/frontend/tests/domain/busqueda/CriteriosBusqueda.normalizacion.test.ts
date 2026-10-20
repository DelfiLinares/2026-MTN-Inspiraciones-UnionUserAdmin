import { describe, it, expect } from 'vitest'
import { CriteriosBusqueda } from '../../../src/domain/busqueda/CriteriosBusqueda'

/**
 * T007 — Normalización del texto de búsqueda (HU-02, RF-02, RF-23).
 * Fuente: Union/specs/007-inspiraciones-busqueda/{spec,data-model,tasks}.md
 *
 * Reglas:
 * - Se recortan los extremos y se colapsan los espacios internos.
 * - Un texto solo con espacios equivale a vacío.
 * - Máximo 100 caracteres (tras normalizar).
 * - El cliente solo normaliza espacios; no escapa ni descarta otros caracteres.
 * - `CriteriosBusqueda` es inmutable.
 */
describe('CriteriosBusqueda — normalización de texto', () => {
  const MAX_CARACTERES = 100

  it('recorta espacios al inicio y al final', () => {
    const criterios = CriteriosBusqueda.vacio().conTexto('   acuarela   ')

    expect(criterios.texto).toBe('acuarela')
  })

  it('colapsa espacios internos múltiples en uno solo', () => {
    const criterios = CriteriosBusqueda.vacio().conTexto('arte    digital   moderno')

    expect(criterios.texto).toBe('arte digital moderno')
  })

  it('recorta y colapsa a la vez', () => {
    const criterios = CriteriosBusqueda.vacio().conTexto('  paisaje   al   óleo  ')

    expect(criterios.texto).toBe('paisaje al óleo')
  })

  it('trata tabulaciones y saltos de línea como espacios sobrantes', () => {
    const criterios = CriteriosBusqueda.vacio().conTexto('\t retrato \n\n  lápiz \t')

    expect(criterios.texto).toBe('retrato lápiz')
  })

  it('un texto solo con espacios equivale a vacío', () => {
    const criterios = CriteriosBusqueda.vacio().conTexto('     ')

    expect(criterios.texto).toBe('')
    expect(criterios.esVacio()).toBe(true)
  })

  it('un texto vacío se mantiene vacío', () => {
    const criterios = CriteriosBusqueda.vacio().conTexto('')

    expect(criterios.texto).toBe('')
    expect(criterios.esVacio()).toBe(true)
  })

  it('un texto ya normalizado no cambia', () => {
    const criterios = CriteriosBusqueda.vacio().conTexto('ilustración')

    expect(criterios.texto).toBe('ilustración')
  })

  it('es idempotente: normalizar dos veces da el mismo resultado', () => {
    const una = CriteriosBusqueda.vacio().conTexto('  boceto   rápido ')
    const dos = una.conTexto(una.texto)

    expect(dos.texto).toBe(una.texto)
  })

  it('no escapa ni descarta caracteres especiales', () => {
    const criterios = CriteriosBusqueda.vacio().conTexto('  arte & diseño: "pop"  <3  ')

    expect(criterios.texto).toBe('arte & diseño: "pop" <3')
  })

  it('no supera el máximo de 100 caracteres', () => {
    const largo = 'a'.repeat(MAX_CARACTERES + 50)

    const criterios = CriteriosBusqueda.vacio().conTexto(largo)

    expect(criterios.texto).toHaveLength(MAX_CARACTERES)
  })

  it('aplica el máximo después de normalizar los espacios', () => {
    // 100 caracteres útiles rodeados de espacios sobrantes: no debe recortarse nada útil.
    const exacto = 'b'.repeat(MAX_CARACTERES)

    const criterios = CriteriosBusqueda.vacio().conTexto(`   ${exacto}   `)

    expect(criterios.texto).toBe(exacto)
  })

  it('es inmutable: conTexto devuelve nuevos criterios y no altera los originales', () => {
    const original = CriteriosBusqueda.vacio()

    const nuevo = original.conTexto('  acuarela ')

    expect(nuevo).not.toBe(original)
    expect(original.texto).toBe('')
    expect(nuevo.texto).toBe('acuarela')
  })
})
