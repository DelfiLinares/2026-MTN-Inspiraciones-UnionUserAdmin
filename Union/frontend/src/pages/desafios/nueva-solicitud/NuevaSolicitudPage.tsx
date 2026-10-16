import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormularioSolicitud } from '../../../desafios/components/FormularioSolicitud'
import { SolicitudDesafio } from '../../../domain/SolicitudDesafio'
import { httpClient } from '../../../infrastructure/httpClient'
import './nueva-solicitud.css'

export const NuevaSolicitudPage: React.FC = () => {
  const navigate = useNavigate()
  const [enviando, setEnviando] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleEnviarSolicitud = async (solicitud: SolicitudDesafio) => {
    setEnviando(true)
    setError(null)

    try {
      // Validar la solicitud antes de enviar
      const erroresValidacion = solicitud.validar()
      if (Object.keys(erroresValidacion).length > 0) {
        const erroresTexto = Object.values(erroresValidacion).join(', ')
        setError(`Hay errores en el formulario: ${erroresTexto}`)
        setEnviando(false)
        return
      }

      // Preparar payload para el API
      const payload = {
        nombre: solicitud.nombre,
        descripcionLarga: solicitud.descripcionLarga,
        fotos: solicitud.fotos || [],
        rango: solicitud.rango
          ? {
              inicio: solicitud.rango.inicio,
              fin: solicitud.rango.fin,
            }
          : undefined,
        ambitos: solicitud.ambitos || [],
      }

      // Enviar solicitud
      const resultado = await httpClient.post<{ id: string }>('/solicitudes', payload)

      // Redirigir a mis solicitudes con confirmación
      if (resultado?.id) {
        navigate('/desafios/mis-solicitudes', {
          state: { mensaje: 'Solicitud creada correctamente' },
        })
      }
    } catch (err: any) {
      if (err?.status === 401) {
        setError('Debes iniciar sesión para enviar una solicitud.')
      } else if (err?.status === 400) {
        setError('Hay errores en los datos enviados. Por favor, verifica el formulario.')
      } else {
        setError('No se pudo enviar la solicitud. Intentá nuevamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="nueva-solicitud-page" aria-labelledby="nueva-solicitud-titulo">
      <header className="nueva-solicitud-encabezado">
        <h1 id="nueva-solicitud-titulo">Proponer un nuevo desafío</h1>
        <p className="nueva-solicitud-descripcion">
          Completa el formulario para enviar tu propuesta. Un administrador la revisará y la publicará si cumple con
          nuestros estándares.
        </p>
      </header>

      {error && (
        <div className="nueva-solicitud-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setError(null)} className="nueva-solicitud-error-cerrar">
            Cerrar
          </button>
        </div>
      )}

      <section className="nueva-solicitud-formulario">
        <FormularioSolicitud onEnviar={handleEnviarSolicitud} cargando={enviando} />
      </section>

      <footer className="nueva-solicitud-ayuda">
        <h2>Requisitos para una buena solicitud</h2>
        <ul>
          <li>
            <strong>Nombre claro:</strong> Describe brevemente el desafío
          </li>
          <li>
            <strong>Descripción detallada:</strong> Explica qué se debe hacer y cómo participar
          </li>
          <li>
            <strong>Al menos una foto:</strong> Máximo 5 fotos (JPEG o PNG)
          </li>
          <li>
            <strong>Fechas válidas:</strong> La fecha de inicio debe ser antes que la de fin
          </li>
          <li>
            <strong>Ámbitos relevantes:</strong> Selecciona las categorías que correspondan
          </li>
        </ul>
      </footer>
    </main>
  )
}
