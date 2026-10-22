/**
 * Cooldown de reenvío del código (spec 008, RF-10, HU-07).
 * `segundosRestantes` es puro y recibe el reloj para poder probarse sin temporizadores reales.
 */

import { useCallback, useEffect, useState } from 'react'

export function segundosRestantes(disponibleEn: number | null, ahora: number): number {
  if (disponibleEn === null) return 0
  return Math.max(0, Math.ceil((disponibleEn - ahora) / 1000))
}

export function useCooldown(reloj: () => number = Date.now) {
  const [disponibleEn, setDisponibleEn] = useState<number | null>(null)
  const [restantes, setRestantes] = useState(0)

  useEffect(() => {
    setRestantes(segundosRestantes(disponibleEn, reloj()))
    if (disponibleEn === null) return undefined
    const id = setInterval(() => {
      const faltan = segundosRestantes(disponibleEn, reloj())
      setRestantes(faltan)
      if (faltan === 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [disponibleEn, reloj])

  const iniciar = useCallback(
    (segundos: number) => setDisponibleEn(reloj() + segundos * 1000),
    [reloj],
  )

  return { restantes, activo: restantes > 0, iniciar }
}
