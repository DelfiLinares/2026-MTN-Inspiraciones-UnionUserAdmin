import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { httpClientAdmin as httpClient } from '../../../infrastructure/httpClientAdmin'
import { FormularioDesafio } from '../../../desafios/components/FormularioDesafio'
import { Desafio } from '../../../domain/Desafio'
import './publicar-desafio.css'

interface AmbitoDto {
  id?: string
  valor?: string
  nombre?: string
}

/**
 * PublicarDesafioPage (T062)
 * 
 * Página ADMIN para publicar un nuevo desafío completo.
 * 
 * Funcionalidad:
 * - Solo accesible para administradores (RF-20)
 * - Utiliza FormularioDesafio para crear un desafío con todos sus campos
 * - Envía el desafío creado mediante POST /desafios
 * - Redirige a la página de detalle tras éxito (HU-01)
 * 
 * Requisitos cumplidos:
 * - HU-01: Como administrador, quiero publicar un desafío completo
 * - RF-01: Publicar desafío completo
 * - RF-20: Solo admin publica
 * 
 * Dependencias:
 * - T053 (FormularioDesafio)
 * - T041 (PublicarDesafio use case)
 * 
 * Fuente: specs/003-desafios/spec.md (HU-01), tasks.md (T062)
 */
export const PublicarDesafioPage: React.FC = () => {
  const navigate = useNavigate()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ambitosDisponibles, setAmbitosDisponibles] = useState<string[]>([])

  // Cargar ámbitos disponibles al montar la página
  React.useEffect(() => {
    const cargarAmbitos = async () => {
      try {
        const respuesta = await httpClient.get<AmbitoDto[] | { items?: AmbitoDto[] }>('/ambitos')
        const items = Array.isArray(respuesta) ? respuesta : respuesta?.items ?? []
        
        const valores = items
          .map((item) => item.valor ?? item.nombre ?? item.id ?? '')
          .map((v) => v.trim())
          .filter(Boolean)
        
        setAmbitosDisponibles(valores)
      } catch {
        setError('No se pudieron cargar los ámbitos. Recargá la página para volver a intentarlo.')
        setAmbitosDisponibles([])
      }
    }

    cargarAmbitos()
  }, [])

  const handleEnviarDesafio = useCallback(
    async (desafio: Desafio) => {
      setCargando(true)
      setError(null)

      try {
        // Validar que el desafío tenga todos los datos requeridos
        const validacion = desafio.validar()
        if (Object.keys(validacion).length > 0) {
          setError('El desafío contiene errores de validación.')
          setCargando(false)
          return
        }

        // Construir payload para enviar
        const payload: Record<string, unknown> = {
          nombre: desafio.nombre || '',
          descripcionLarga: desafio.descripcionLarga || '',
        }

        // Agregar fechas
        if (desafio.rango?.inicio) {
          payload.fechaInicio = desafio.rango.inicio.toISOString()
        }
        if (desafio.rango?.fin) {
          payload.fechaFin = desafio.rango.fin.toISOString()
        }

        // Agregar ámbitos
        const ambitos = desafio.ambitos?.map(a => a.valor).filter(Boolean) ?? []
        if (ambitos.length > 0) {
          payload.ambitos = ambitos
        }

        // Agregar fotos (URLs, no archivos en esta implementación)
        if (desafio.fotos && desafio.fotos.length > 0) {
          payload.fotos = desafio.fotos.map(f => ({
            url: f.url,
            formato: f.formato,
            principal: f.principal,
          }))
        }

        // POST /desafios - crear desafío
        const respuesta = await httpClient.post<{ id: string }>('/desafios', payload)

        if (respuesta?.id) {
          // Éxito: redirigir a la página de detalle del desafío creado
          navigate('/admin/desafios', { state: { creado: true } })
        } else {
          setError('No se pudo crear el desafío. Intentá nuevamente.')
        }
      } catch (err: any) {
        if (err?.status === 401) {
          setError('Debes iniciar sesión para publicar un desafío.')
          navigate('/login-admin')
        } else if (err?.status === 403) {
          setError('No tienes permiso para publicar desafíos. Se requiere ser administrador.')
        } else if (err?.status === 400) {
          setError('Los datos del desafío no son válidos. Revisa el formulario.')
        } else {
          setError('Error al publicar el desafío. Intentá nuevamente.')
        }
      } finally {
        setCargando(false)
      }
    },
    [navigate]
  )

  return (
    <div className="publicar-desafio-page">
      <header className="publicar-desafio-header">
        <h1>Publicar Desafío</h1>
        <p className="publicar-desafio-subtitulo">
          Completa todos los campos para crear un nuevo desafío que será visible para todos los usuarios.
        </p>
      </header>

      <div className="publicar-desafio-contenedor">
        {error && (
          <div className="publicar-desafio-error" role="alert">
            {error}
          </div>
        )}

        <div className="publicar-desafio-formulario">
          <FormularioDesafio
            ambitorDisponibles={ambitosDisponibles}
            cargando={cargando}
            onEnviar={handleEnviarDesafio}
          />
        </div>

        <aside className="publicar-desafio-ayuda">
          <h2>Instrucciones</h2>
          <ul>
            <li><strong>Nombre:</strong> Título breve y atractivo del desafío</li>
            <li><strong>Descripción:</strong> Explica en detalle qué deben hacer los usuarios</li>
            <li><strong>Fotos:</strong> Sube entre 1 y 5 imágenes (JPEG o PNG). Una debe ser principal.</li>
            <li><strong>Fechas:</strong> Define el período en que el desafío estará activo</li>
            <li><strong>Ámbitos:</strong> Selecciona al menos un ámbito para clasificar el desafío</li>
          </ul>
          <p className="publicar-desafio-nota">
            Una vez publicado, el desafío será visible inmediatamente y los usuarios podrán responder.
          </p>
        </aside>
      </div>
    </div>
  )
}
