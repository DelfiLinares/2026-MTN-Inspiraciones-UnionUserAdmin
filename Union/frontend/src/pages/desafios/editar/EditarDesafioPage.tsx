import React, { useCallback, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { httpClient } from '../../../infrastructure/httpClient'
import { FormularioDesafio } from '../../../desafios/components/FormularioDesafio'
import { ConfirmarAccionDestructiva } from '../../../desafios/components/ConfirmarAccionDestructiva'
import { Desafio } from '../../../domain/Desafio'
import { Foto } from '../../../domain/Foto'
import { RangoFechas } from '../../../domain/RangoFechas'
import { AmbitoDesafio } from '../../../domain/AmbitoDesafio'
import './editar-desafio.css'

interface DesafioDetailDto {
  id: string
  nombre?: string
  titulo?: string
  descripcion?: string
  descripcionLarga?: string
  activo?: boolean
  tieneRespuestas?: boolean
  fotos?: Array<{
    id: string
    url: string
    formato: 'JPEG' | 'PNG'
    principal: boolean
  }>
  rango?: {
    inicio: string
    fin: string
  }
  ambitos?: Array<{
    valor: string
  }>
  version?: number
}

interface AmbitoDto {
  id?: string
  valor?: string
  nombre?: string
}

/**
 * EditarDesafioPage (T063)
 * 
 * Página ADMIN para editar un desafío existente.
 * 
 * Funcionalidad:
 * - Solo accesible para administradores
 * - Carga el desafío por ID desde la URL
 * - Muestra FormularioDesafio con datos pre-cargados
 * - Si el desafío está ACTIVO o tiene respuestas, pide confirmación (HU-02, CB-02)
 * - Maneja errores de concurrencia (CB-02 con version/If-Match, P-04)
 * - Envía los cambios mediante PUT /desafios/:id
 * 
 * Requisitos cumplidos:
 * - HU-02: Como administrador, quiero editar un desafío existente
 * - CB-02: Confirmación de edición si ACTIVO o con respuestas
 * - RF-22: Edición con confirmación
 * 
 * Dependencias:
 * - T053 (FormularioDesafio)
 * - T041 (EditarDesafio use case)
 * - T052 (ConfirmarAccionDestructiva)
 * 
 * Fuente: specs/003-desafios/spec.md (HU-02, CB-02), tasks.md (T063)
 */
export const EditarDesafioPage: React.FC = () => {
  const { desafioId } = useParams<{ desafioId: string }>()
  const navigate = useNavigate()
  
  const [desafio, setDesafio] = useState<Desafio | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ambitosDisponibles, setAmbitosDisponibles] = useState<string[]>([])
  const [guardando, setGuardando] = useState(false)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [desafioAGuardar, setDesafioAGuardar] = useState<Desafio | null>(null)

  // Cargar desafío y ámbitos al montar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true)
        setError(null)

        // Cargar desafío
        const [desafioResp, ambitosResp] = await Promise.all([
          httpClient.get<DesafioDetailDto>(`/desafios/${desafioId}`),
          httpClient.get<AmbitoDto[] | { items?: AmbitoDto[] }>('/ambitos'),
        ])

        // Mapear DTO a Desafio
        if (desafioResp) {
          const fotos = (desafioResp.fotos || []).map(
            f => new Foto({
              id: f.id,
              url: f.url,
              formato: f.formato,
              principal: f.principal,
            })
          )
          
          const rango = desafioResp.rango
            ? new RangoFechas({
                inicio: new Date(desafioResp.rango.inicio),
                fin: new Date(desafioResp.rango.fin),
              })
            : undefined

          const ambitos = (desafioResp.ambitos || []).map(
            a => new AmbitoDesafio({ valor: a.valor })
          )

          const desafioEntity = new Desafio({
            id: desafioResp.id,
            nombre: desafioResp.nombre || desafioResp.titulo,
            descripcionLarga: desafioResp.descripcionLarga || desafioResp.descripcion,
            fotos,
            rango,
            ambitos,
            activo: desafioResp.activo,
            tieneRespuestas: desafioResp.tieneRespuestas,
            version: desafioResp.version,
          })
          setDesafio(desafioEntity)
        } else {
          setError('No se pudo cargar el desafío.')
        }

        // Mapear ámbitos
        const items = Array.isArray(ambitosResp) ? ambitosResp : ambitosResp?.items ?? []
        const valores = items
          .map((item) => item.valor ?? item.nombre ?? item.id ?? '')
          .map((v) => v.trim())
          .filter(Boolean)
        setAmbitosDisponibles(valores)
      } catch (err: any) {
        if (err?.status === 404) {
          setError('El desafío no existe o fue eliminado.')
        } else {
          setError('Error al cargar el desafío.')
        }
      } finally {
        setCargando(false)
      }
    }

    if (desafioId) {
      cargarDatos()
    }
  }, [desafioId])

  const handleEnviarDesafio = useCallback(
    (desafioActualizado: Desafio) => {
      // Verificar si necesita confirmación: ACTIVO o tiene respuestas
      const necesitaConfirmacion =
        (desafioActualizado.activo === true) || (desafioActualizado.tieneRespuestas === true)

      if (necesitaConfirmacion) {
        // Guardar el desafío y mostrar confirmación
        setDesafioAGuardar(desafioActualizado)
        setMostrarConfirmacion(true)
      } else {
        // Guardar directamente
        guardarDesafio(desafioActualizado)
      }
    },
    []
  )

  const guardarDesafio = async (desafioActualizado: Desafio) => {
    setGuardando(true)
    setError(null)

    try {
      // Validar que el desafío tenga todos los datos requeridos
      const validacion = desafioActualizado.validar()
      if (Object.keys(validacion).length > 0) {
        setError('El desafío contiene errores de validación.')
        setGuardando(false)
        return
      }

      // Construir payload para enviar
      const payload: Record<string, unknown> = {
        nombre: desafioActualizado.nombre || '',
        descripcionLarga: desafioActualizado.descripcionLarga || '',
      }

      // Agregar fechas
      if (desafioActualizado.rango?.inicio) {
        payload.fechaInicio = desafioActualizado.rango.inicio.toISOString()
      }
      if (desafioActualizado.rango?.fin) {
        payload.fechaFin = desafioActualizado.rango.fin.toISOString()
      }

      // Agregar ámbitos
      const ambitos = desafioActualizado.ambitos?.map(a => a.valor).filter(Boolean) ?? []
      if (ambitos.length > 0) {
        payload.ambitos = ambitos
      }

      // Agregar fotos (URLs, no archivos en esta implementación)
      if (desafioActualizado.fotos && desafioActualizado.fotos.length > 0) {
        payload.fotos = desafioActualizado.fotos.map(f => ({
          url: f.url,
          formato: f.formato,
          principal: f.principal,
        }))
      }

      // Agregar version para control de concurrencia (P-04)
      if (desafioActualizado.version !== undefined) {
        payload.version = desafioActualizado.version
      }

      // PUT /desafios/:id - actualizar desafío
      const respuesta = await httpClient.put<{ id: string }>(
        `/desafios/${desafioId}`,
        payload
      )

      if (respuesta?.id) {
        // Éxito: redirigir a la página de detalle del desafío
        navigate(`/desafios/${respuesta.id}`, { state: { editado: true } })
      } else {
        setError('No se pudo guardar el desafío. Intentá nuevamente.')
      }
    } catch (err: any) {
      if (err?.status === 401) {
        setError('Debes iniciar sesión para editar un desafío.')
        navigate('/login')
      } else if (err?.status === 403) {
        setError('No tienes permiso para editar desafíos. Se requiere ser administrador.')
      } else if (err?.status === 404) {
        setError('El desafío no existe o fue eliminado.')
      } else if (err?.status === 409) {
        setError(
          'El desafío fue modificado por otro administrador. Recargá la página e intentá nuevamente.'
        )
      } else if (err?.status === 400) {
        setError('Los datos del desafío no son válidos. Revisa el formulario.')
      } else {
        setError('Error al guardar el desafío. Intentá nuevamente.')
      }
    } finally {
      setGuardando(false)
      setMostrarConfirmacion(false)
      setDesafioAGuardar(null)
    }
  }

  const handleConfirmarEdicion = () => {
    if (desafioAGuardar) {
      guardarDesafio(desafioAGuardar)
    }
  }

  const handleCancelarConfirmacion = () => {
    setMostrarConfirmacion(false)
    setDesafioAGuardar(null)
  }

  if (cargando) {
    return (
      <div className="editar-desafio-page">
        <div className="editar-desafio-cargando">Cargando desafío...</div>
      </div>
    )
  }

  if (error && !desafio) {
    return (
      <div className="editar-desafio-page">
        <div className="editar-desafio-error">{error}</div>
      </div>
    )
  }

  return (
    <div className="editar-desafio-page">
      <header className="editar-desafio-header">
        <h1>Editar Desafío</h1>
        <p className="editar-desafio-subtitulo">
          Modifica los datos del desafío. Todos los campos son editables.
        </p>
      </header>

      <main className="editar-desafio-contenedor">
        {error && (
          <div className="editar-desafio-error-inline" role="alert">
            {error}
          </div>
        )}

        {desafio && (
          <div className="editar-desafio-formulario">
            <FormularioDesafio
              desafioInicial={desafio}
              ambitorDisponibles={ambitosDisponibles}
              cargando={guardando}
              onEnviar={handleEnviarDesafio}
            />
          </div>
        )}

        <aside className="editar-desafio-ayuda">
          <h2>Sobre esta edición</h2>
          <ul>
            <li>
              <strong>Desafío activo:</strong> Si está siendo respondido, se pedirá confirmación.
            </li>
            <li>
              <strong>Concurrencia:</strong> Si otro admin lo edita, verás una advertencia.
            </li>
            <li>
              <strong>Todos editables:</strong> Nombre, descripción, fotos, fechas y ámbitos.
            </li>
          </ul>
          <p className="editar-desafio-nota">
            Los cambios se guardan en la base de datos inmediatamente después de la confirmación.
          </p>
        </aside>
      </main>

      {mostrarConfirmacion && (
        <ConfirmarAccionDestructiva
          abierto={mostrarConfirmacion}
          caso="editar-desafio-activo"
          tituloCustom="¿Estás seguro de que querés editar este desafío?"
          mensajeCustom={`Este desafío está ${
            desafio?.activo ? 'ACTIVO' : ''
          } ${desafio?.tieneRespuestas ? 'y tiene respuestas' : ''}. 
          Los cambios afectarán a los usuarios que ya respondieron.`}
          confirmando={guardando}
          onConfirmar={handleConfirmarEdicion}
          onCancelar={handleCancelarConfirmacion}
        />
      )}
    </div>
  )
}
