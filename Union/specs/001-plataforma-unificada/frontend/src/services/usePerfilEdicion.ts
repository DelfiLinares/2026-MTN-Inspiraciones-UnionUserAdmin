/**
 * Hook de aplicación para la edición de perfil de usuario (HU-06).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-16, RF-17, RF-18, RF-19, RF-20, AC-06.1..AC-06.6)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`PATCH /perfil`)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T058)
 *
 * Responsabilidades:
 * - Validación en cliente de campos requeridos (`nombre`, `apellido` no vacíos, RF-17, AC-06.3).
 * - Previsualización de nueva foto de perfil antes de confirmar subida (RF-20, AC-06.6).
 * - Advertencia de cambios sin guardar ante navegación o cierre de pestaña (`beforeunload`, RF-19, AC-06.5).
 * - Actualización inmediata vía `perfilService.actualizarPerfil` (RF-18, AC-06.4).
 * - NO incluye campo de contraseña (RF-16, AC-06.2).
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Usuario } from '../domain/Usuario'
import { perfilService } from './perfilService'

/**
 * Validador en cliente: bloquea el envío si `nombre` o `apellido` están vacíos o contienen solo espacios (RF-17, AC-06.3).
 */
export function puedeEnviarPerfilEdicion(datos: { nombre: string; apellido: string }): boolean {
  return datos.nombre.trim() !== '' && datos.apellido.trim() !== ''
}

export interface EstadoPerfilEdicion {
  nombre: string
  apellido: string
  bio: string
  foto: File | null
  fotoPreviewUrl: string | null
  enviando: boolean
  error: string | null
  guardadoConExito: boolean
}

export interface UsePerfilEdicionResult {
  estado: EstadoPerfilEdicion
  puedeEnviar: boolean
  hayCambiosSinGuardar: boolean
  establecerNombre: (nombre: string) => void
  establecerApellido: (apellido: string) => void
  establecerBio: (bio: string) => void
  establecerFoto: (foto: File | null) => void
  confirmarSalidaSiHayCambios: () => boolean
  enviar: () => Promise<Usuario | null>
  reiniciar: () => void
}

function construirEstadoInicial(usuarioActual: Usuario): EstadoPerfilEdicion {
  return {
    nombre: usuarioActual.nombre,
    apellido: usuarioActual.apellido,
    bio: usuarioActual.bio ?? '',
    foto: null,
    fotoPreviewUrl: null,
    enviando: false,
    error: null,
    guardadoConExito: false,
  }
}

export function usePerfilEdicion(usuarioActual: Usuario): UsePerfilEdicionResult {
  const estadoInicial = useMemo(() => construirEstadoInicial(usuarioActual), [usuarioActual])
  const [estado, setEstado] = useState<EstadoPerfilEdicion>(estadoInicial)

  // Detección de cambios sin guardar respecto a los datos originales (AC-06.5, RF-19)
  const hayCambiosSinGuardar = useMemo(() => {
    if (estado.guardadoConExito) {
      return false
    }
    const cambioNombre = estado.nombre !== usuarioActual.nombre
    const cambioApellido = estado.apellido !== usuarioActual.apellido
    const cambioBio = estado.bio !== (usuarioActual.bio ?? '')
    const cambioFoto = estado.foto !== null
    return cambioNombre || cambioApellido || cambioBio || cambioFoto
  }, [estado, usuarioActual])

  // Advertencia beforeunload ante cierre de pestaña o recarga con cambios pendientes (AC-06.5, RF-19)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hayCambiosSinGuardar && !estado.enviando) {
        event.preventDefault()
        event.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hayCambiosSinGuardar, estado.enviando])

  // Limpieza de URL de previsualización para prevenir memory leaks
  useEffect(() => {
    return () => {
      if (estado.fotoPreviewUrl && estado.fotoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(estado.fotoPreviewUrl)
      }
    }
  }, [estado.fotoPreviewUrl])

  const confirmarSalidaSiHayCambios = useCallback((): boolean => {
    if (!hayCambiosSinGuardar || estado.enviando) {
      return true
    }
    return window.confirm(
      'Tenés cambios sin guardar en la edición de tu perfil. ¿Seguro que querés salir?'
    )
  }, [hayCambiosSinGuardar, estado.enviando])

  const establecerNombre = useCallback((nombre: string) => {
    setEstado((actual: EstadoPerfilEdicion): EstadoPerfilEdicion => ({
      ...actual,
      nombre,
      error: null,
      guardadoConExito: false,
    }))
  }, [])

  const establecerApellido = useCallback((apellido: string) => {
    setEstado((actual: EstadoPerfilEdicion): EstadoPerfilEdicion => ({
      ...actual,
      apellido,
      error: null,
      guardadoConExito: false,
    }))
  }, [])

  const establecerBio = useCallback((bio: string) => {
    setEstado((actual: EstadoPerfilEdicion): EstadoPerfilEdicion => ({
      ...actual,
      bio,
      error: null,
      guardadoConExito: false,
    }))
  }, [])

  // Previsualización de nueva foto de perfil (AC-06.6, RF-20)
  const establecerFoto = useCallback((foto: File | null) => {
    setEstado((actual: EstadoPerfilEdicion): EstadoPerfilEdicion => {
      if (actual.fotoPreviewUrl && actual.fotoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(actual.fotoPreviewUrl)
      }

      if (!foto) {
        return {
          ...actual,
          foto: null,
          fotoPreviewUrl: null,
          error: null,
          guardadoConExito: false,
        }
      }

      const previewUrl = URL.createObjectURL(foto)
      return {
        ...actual,
        foto,
        fotoPreviewUrl: previewUrl,
        error: null,
        guardadoConExito: false,
      }
    })
  }, [])

  const reiniciar = useCallback(() => {
    setEstado((actual: EstadoPerfilEdicion): EstadoPerfilEdicion => {
      if (actual.fotoPreviewUrl && actual.fotoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(actual.fotoPreviewUrl)
      }
      return construirEstadoInicial(usuarioActual)
    })
  }, [usuarioActual])

  const enviar = useCallback(async (): Promise<Usuario | null> => {
    const { nombre, apellido, bio, foto } = estado

    // Validación obligatoria en cliente (RF-17, AC-06.3)
    if (!puedeEnviarPerfilEdicion({ nombre, apellido })) {
      setEstado((actual: EstadoPerfilEdicion): EstadoPerfilEdicion => ({
        ...actual,
        error: 'El nombre y el apellido son campos obligatorios.',
      }))
      return null
    }

    setEstado((actual: EstadoPerfilEdicion): EstadoPerfilEdicion => ({
      ...actual,
      enviando: true,
      error: null,
    }))

    try {
      const usuarioActualizado = await perfilService.actualizarPerfil({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        bio: bio.trim(),
        foto: foto ?? undefined,
      })

      // Guardado exitoso (RF-18, AC-06.4): actualizamos sin recarga y reseteamos el dirty flag
      setEstado({
        nombre: usuarioActualizado.nombre,
        apellido: usuarioActualizado.apellido,
        bio: usuarioActualizado.bio ?? '',
        foto: null,
        fotoPreviewUrl: null,
        enviando: false,
        error: null,
        guardadoConExito: true,
      })

      return usuarioActualizado
    } catch (error: any) {
      const mensaje =
        error?.body?.error ||
        error?.message ||
        'No se pudo actualizar el perfil. Intentá nuevamente.'

      setEstado((actual: EstadoPerfilEdicion): EstadoPerfilEdicion => ({
        ...actual,
        enviando: false,
        error: String(mensaje),
      }))
      return null
    }
  }, [estado])

  const puedeEnviar = useMemo(
    () => puedeEnviarPerfilEdicion({ nombre: estado.nombre, apellido: estado.apellido }),
    [estado.nombre, estado.apellido]
  )

  return {
    estado,
    puedeEnviar,
    hayCambiosSinGuardar,
    establecerNombre,
    establecerApellido,
    establecerBio,
    establecerFoto,
    confirmarSalidaSiHayCambios,
    enviar,
    reiniciar,
  }
}
