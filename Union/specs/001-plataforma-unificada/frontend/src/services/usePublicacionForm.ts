/**
 * Hook y lógica de aplicación para el formulario de nueva publicación (HU-02).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-21, RF-22, RF-23, RF-24, RF-25, RF-26, RF-28, CB-09)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T051)
 *
 * Orquesta:
 * - T048: `crearPublicacion` (subida con progreso, conservación de datos ante fallo de red CB-01 / RF-28).
 * - T049: `validarArchivo` (validación en cliente de tipo y extensión MIME, sin límite de tamaño en cliente RF-24).
 * - T050: `puedeAgregarTag`, `LIMITE_MAXIMO_TAGS = 10` (vocabulario controlado, máximo 10 tags RF-22).
 * - Cobertura de CB-09: advertencia al usuario antes de cerrar la pestaña (`beforeunload`)
 *   o navegar fuera si hay cambios no guardados en el formulario.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { TipoContenido } from '../domain/enums/TipoContenido'
import type { Publicacion } from '../domain/Publicacion'
import { crearPublicacion } from './publicacionService'
import { validarArchivo } from './archivoValidacion'
import { LIMITE_MAXIMO_TAGS } from './tagsService'

/**
 * Validador de envío:
 * - Bloquea el envío si no hay archivo adjunto (RF-23).
 * - Bloquea si no hay tipo de contenido.
 * - Bloquea si excede el límite de 10 tags (RF-22).
 */
export function puedeEnviarPublicacion(
  archivo: File | null,
  tipoContenido?: TipoContenido | null,
  tags?: string[]
): boolean {
  if (archivo === null) {
    return false
  }
  if (tipoContenido === null || tipoContenido === undefined) {
    return false
  }
  if (tags && tags.length > LIMITE_MAXIMO_TAGS) {
    return false
  }
  return true
}

export interface EstadoPublicacionForm {
  archivo: File | null
  tipoContenido: TipoContenido | null
  tags: string[]
  enviando: boolean
  porcentajeProgreso: number
  error: string | null
  enviadoConExito: boolean
}

/**
 * Determina si el formulario contiene datos sin guardar que requieran advertencia (CB-09).
 */
export function tieneDatosSinGuardar(estado: EstadoPublicacionForm): boolean {
  const tieneArchivo = estado.archivo !== null
  const tieneTipo = estado.tipoContenido !== null
  const tieneTags = estado.tags.length > 0
  return (tieneArchivo || tieneTipo || tieneTags) && !estado.enviadoConExito
}

export const ESTADO_INICIAL_PUBLICACION_FORM: EstadoPublicacionForm = {
  archivo: null,
  tipoContenido: null,
  tags: [],
  enviando: false,
  porcentajeProgreso: 0,
  error: null,
  enviadoConExito: false,
}

export interface UsePublicacionFormResult {
  estado: EstadoPublicacionForm
  puedeEnviar: boolean
  tieneCambiosSinGuardar: boolean
  establecerArchivo: (archivo: File | null) => void
  establecerTipoContenido: (tipo: TipoContenido | null) => void
  establecerTags: (tags: string[]) => void
  agregarTag: (tag: string) => boolean
  removerTag: (tag: string) => void
  confirmarSalidaSiHayCambios: () => boolean
  enviar: () => Promise<Publicacion | null>
  reiniciar: () => void
}

/**
 * Hook de contenedor del formulario de publicación.
 */
export function usePublicacionForm(): UsePublicacionFormResult {
  const [estado, setEstado] = useState<EstadoPublicacionForm>(ESTADO_INICIAL_PUBLICACION_FORM)

  const tieneCambiosSinGuardar = useMemo(() => tieneDatosSinGuardar(estado), [estado])

  // Cobertura de CB-09: evento beforeunload del navegador
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (tieneCambiosSinGuardar && !estado.enviando) {
        event.preventDefault()
        event.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [tieneCambiosSinGuardar, estado.enviando])

  /**
   * Guard de navegación interna (CB-09):
   * Retorna `true` si es seguro navegar (no hay cambios o el usuario confirmó salir).
   */
  const confirmarSalidaSiHayCambios = useCallback((): boolean => {
    if (!tieneCambiosSinGuardar || estado.enviando) {
      return true
    }
    const confirmado = window.confirm(
      'Tenés cambios sin guardar en el formulario de publicación. ¿Seguro que querés salir?'
    )
    return confirmado
  }, [tieneCambiosSinGuardar, estado.enviando])

  const establecerArchivo = useCallback((archivo: File | null) => {
    if (!archivo) {
      setEstado((actual: EstadoPublicacionForm): EstadoPublicacionForm => ({
        ...actual,
        archivo: null,
        error: null,
      }))
      return
    }

    setEstado((actual: EstadoPublicacionForm): EstadoPublicacionForm => {
      // Si ya hay un tipo de contenido seleccionado, validar en cliente el tipo MIME / extensión (AC-02.4, RF-24)
      if (actual.tipoContenido) {
        const resultadoValidacion = validarArchivo(archivo, actual.tipoContenido)
        if (!resultadoValidacion.esValido) {
          return {
            ...actual,
            archivo,
            error:
              resultadoValidacion.mensajeError ??
              'El tipo de archivo no corresponde al tipo de contenido seleccionado.',
          }
        }
      }
      return { ...actual, archivo, error: null }
    })
  }, [])

  const establecerTipoContenido = useCallback((tipoContenido: TipoContenido | null) => {
    setEstado((actual: EstadoPublicacionForm): EstadoPublicacionForm => {
      if (tipoContenido && actual.archivo) {
        const resultadoValidacion = validarArchivo(actual.archivo, tipoContenido)
        if (!resultadoValidacion.esValido) {
          return {
            ...actual,
            tipoContenido,
            error:
              resultadoValidacion.mensajeError ??
              'El tipo de archivo no coincide con el nuevo tipo de contenido.',
          }
        }
      }
      return { ...actual, tipoContenido, error: null }
    })
  }, [])

  const establecerTags = useCallback((tags: string[]) => {
    if (tags.length > LIMITE_MAXIMO_TAGS) {
      setEstado((actual: EstadoPublicacionForm): EstadoPublicacionForm => ({
        ...actual,
        error: `No podés agregar más de ${LIMITE_MAXIMO_TAGS} tags.`,
      }))
      return
    }
    setEstado((actual: EstadoPublicacionForm): EstadoPublicacionForm => ({
      ...actual,
      tags,
      error: null,
    }))
  }, [])

  const agregarTag = useCallback((tag: string): boolean => {
    let agregado = false
    setEstado((actual: EstadoPublicacionForm): EstadoPublicacionForm => {
      if (actual.tags.length >= LIMITE_MAXIMO_TAGS) {
        return {
          ...actual,
          error: `Se alcanzó el límite máximo de ${LIMITE_MAXIMO_TAGS} tags por publicación.`,
        }
      }
      const tagLimpio = tag.trim()
      if (!tagLimpio || actual.tags.includes(tagLimpio)) {
        return actual
      }
      agregado = true
      return {
        ...actual,
        tags: [...actual.tags, tagLimpio],
        error: null,
      }
    })
    return agregado
  }, [])

  const removerTag = useCallback((tagARemover: string) => {
    setEstado((actual: EstadoPublicacionForm): EstadoPublicacionForm => ({
      ...actual,
      tags: actual.tags.filter((t: string) => t !== tagARemover),
      error: null,
    }))
  }, [])

  const reiniciar = useCallback(() => {
    setEstado(ESTADO_INICIAL_PUBLICACION_FORM)
  }, [])

  const enviar = useCallback(async (): Promise<Publicacion | null> => {
    const { archivo, tipoContenido, tags } = estado

    if (!archivo) {
      setEstado((actual: EstadoPublicacionForm): EstadoPublicacionForm => ({
        ...actual,
        error: 'Adjuntá un archivo para poder publicar.',
      }))
      return null
    }

    if (!tipoContenido) {
      setEstado((actual: EstadoPublicacionForm): EstadoPublicacionForm => ({
        ...actual,
        error: 'Seleccioná el tipo de contenido.',
      }))
      return null
    }

    // Validación de tipo de archivo en cliente (RF-24, AC-02.4)
    const validacion = validarArchivo(archivo, tipoContenido)
    if (!validacion.esValido) {
      setEstado((actual: EstadoPublicacionForm): EstadoPublicacionForm => ({
        ...actual,
        error: validacion.mensajeError ?? 'El archivo seleccionado no es válido.',
      }))
      return null
    }

    if (tags.length > LIMITE_MAXIMO_TAGS) {
      setEstado((actual: EstadoPublicacionForm): EstadoPublicacionForm => ({
        ...actual,
        error: `No podés incluir más de ${LIMITE_MAXIMO_TAGS} tags.`,
      }))
      return null
    }

    setEstado((actual: EstadoPublicacionForm): EstadoPublicacionForm => ({
      ...actual,
      enviando: true,
      error: null,
      porcentajeProgreso: 0,
    }))

    try {
      const resultado = await crearPublicacion(
        {
          archivo,
          tipoContenido,
          tags,
        },
        (porcentajeProgreso: number) => {
          setEstado((actual: EstadoPublicacionForm): EstadoPublicacionForm => ({
            ...actual,
            porcentajeProgreso,
          }))
        }
      )

      // Éxito: marcamos enviadoConExito para apagar CB-09 y reiniciamos
      setEstado({
        ...ESTADO_INICIAL_PUBLICACION_FORM,
        enviadoConExito: true,
      })

      return resultado.publicacion
    } catch (error: any) {
      // RF-28 / CB-01: Conservar los datos ingresados ante fallo y mostrar error descriptivo
      const mensaje =
        error?.body?.error ||
        error?.message ||
        'No se pudo publicar. Verificá los datos e intentá nuevamente.'

      setEstado((actual: EstadoPublicacionForm): EstadoPublicacionForm => ({
        ...actual,
        enviando: false,
        porcentajeProgreso: 0,
        error: String(mensaje),
      }))
      return null
    }
  }, [estado])

  const puedeEnviar = useMemo(
    () => puedeEnviarPublicacion(estado.archivo, estado.tipoContenido, estado.tags),
    [estado.archivo, estado.tipoContenido, estado.tags]
  )

  return {
    estado,
    puedeEnviar,
    tieneCambiosSinGuardar,
    establecerArchivo,
    establecerTipoContenido,
    establecerTags,
    agregarTag,
    removerTag,
    confirmarSalidaSiHayCambios,
    enviar,
    reiniciar,
  }
}

export const usePublicacionFormReglas = {
  puedeEnviarPublicacion,
  tieneDatosSinGuardar,
}
