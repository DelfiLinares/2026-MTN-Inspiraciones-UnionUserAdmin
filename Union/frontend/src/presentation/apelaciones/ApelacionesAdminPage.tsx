/**
 * `ApelacionesAdminPage`: revisión de apelaciones de cuentas suspendidas (spec 008, HU-08, RF-11).
 * Aceptar y rechazar piden confirmación explícita (constitución XIII); rechazar exige motivo.
 * La autorización real la valida el backend (constitución IX).
 */

import React, { useCallback, useEffect, useState } from 'react'
import { appealsAdminService as servicioPorDefecto } from '../../application/appealsAdminService'
import type { Apelacion, AppealsAdminService, PaginaApelaciones } from '../../application/appealsAdminService'
import { EstadoApelacion, LONGITUD_MAXIMA_MOTIVO_RECHAZO } from '../../domain/recuperacion'
import { ConfirmacionAccionSensibleModal } from '../shared/ConfirmacionAccionSensibleModal'

const TAMANO_PAGINA = 20

type AccionApelacion =
  | { tipo: 'aceptar'; apelacion: Apelacion }
  | { tipo: 'rechazar'; apelacion: Apelacion; motivo: string; fase: 'motivo' | 'confirmar' }

interface Props {
  service?: AppealsAdminService
}

export const ApelacionesAdminPage: React.FC<Props> = ({ service = servicioPorDefecto }) => {
  const [estado, setEstado] = useState<EstadoApelacion | ''>(EstadoApelacion.PENDIENTE)
  const [pagina, setPagina] = useState(0)
  const [resultado, setResultado] = useState<PaginaApelaciones | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)
  const [accion, setAccion] = useState<AccionApelacion | null>(null)
  const [procesando, setProcesando] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    setErrorMensaje(null)
    try {
      setResultado(
        await service.listar({ estado: estado || undefined, page: pagina, size: TAMANO_PAGINA }),
      )
    } catch (e) {
      const status = (e as { status?: number }).status
      setErrorMensaje(
        status === 403
          ? 'No tenés permisos para ver las apelaciones.'
          : 'No se pudo cargar el listado de apelaciones.',
      )
    } finally {
      setCargando(false)
    }
  }, [service, estado, pagina])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const ejecutar = async () => {
    if (!accion || procesando) return
    setProcesando(true)
    setErrorMensaje(null)
    try {
      if (accion.tipo === 'aceptar') {
        await service.aceptar(accion.apelacion.id)
      } else {
        await service.rechazar(accion.apelacion.id, accion.motivo)
      }
      setAccion(null)
      await cargar()
    } catch {
      setAccion(null)
      setErrorMensaje('No se pudo resolver la apelación. Puede que ya haya sido resuelta.')
    } finally {
      setProcesando(false)
    }
  }

  const totalPaginas = resultado ? Math.max(1, Math.ceil(resultado.totalElementos / TAMANO_PAGINA)) : 1
  const apelaciones = resultado?.contenido ?? []

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Apelaciones de cuentas suspendidas</h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <label htmlFor="apelaciones-estado" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="apelaciones-estado"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value as EstadoApelacion | '')
              setPagina(0)
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            <option value={EstadoApelacion.PENDIENTE}>Pendientes</option>
            <option value={EstadoApelacion.ACEPTADA}>Aceptadas</option>
            <option value={EstadoApelacion.RECHAZADA}>Rechazadas</option>
          </select>
        </div>

        {errorMensaje && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMensaje}
          </div>
        )}

        {cargando && <p role="status" className="text-sm text-gray-500">Cargando apelaciones...</p>}

        {!cargando && apelaciones.length === 0 && !errorMensaje && (
          <p className="text-sm text-gray-500">No hay apelaciones para mostrar.</p>
        )}

        <ul className="space-y-4">
          {apelaciones.map((a) => (
            <li key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{a.username}</p>
                  <p className="text-sm text-gray-500">{a.email}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{a.estado}</p>
                  <p>{new Date(a.creadaEn).toLocaleString()}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{a.mensaje}</p>
              {a.estado === EstadoApelacion.RECHAZADA && a.motivoRechazo && (
                <p className="mt-2 text-sm text-gray-500">Motivo del rechazo: {a.motivoRechazo}</p>
              )}
              {a.estado === EstadoApelacion.PENDIENTE && (
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    onClick={() => setAccion({ tipo: 'aceptar', apelacion: a })}
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
                    onClick={() => setAccion({ tipo: 'rechazar', apelacion: a, motivo: '', fase: 'motivo' })}
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <button
            type="button"
            disabled={pagina === 0 || cargando}
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Anterior
          </button>
          <span>Página {pagina + 1} de {totalPaginas}</span>
          <button
            type="button"
            disabled={pagina + 1 >= totalPaginas || cargando}
            onClick={() => setPagina((p) => p + 1)}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      {accion?.tipo === 'rechazar' && accion.fase === 'motivo' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="apelacion-motivo-titulo">
          <form
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (accion.motivo.trim()) setAccion({ ...accion, fase: 'confirmar' })
            }}
          >
            <h2 id="apelacion-motivo-titulo" className="text-base font-semibold text-gray-900">Motivo del rechazo</h2>
            <label htmlFor="apelacion-motivo" className="block text-sm text-gray-600">
              Se enviará al usuario. Es obligatorio.
            </label>
            <textarea
              id="apelacion-motivo"
              value={accion.motivo}
              maxLength={LONGITUD_MAXIMA_MOTIVO_RECHAZO}
              onChange={(e) => setAccion({ ...accion, motivo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm min-h-[100px]"
            />
            <div className="flex justify-end gap-3">
              <button type="button" className="px-4 py-2 text-sm border border-gray-300 rounded-lg" onClick={() => setAccion(null)}>
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!accion.motivo.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmacionAccionSensibleModal
        abierto={accion?.tipo === 'aceptar' || (accion?.tipo === 'rechazar' && accion.fase === 'confirmar')}
        titulo={accion?.tipo === 'aceptar' ? 'Aceptar apelación' : 'Rechazar apelación'}
        mensaje={
          accion?.tipo === 'aceptar'
            ? `La cuenta de ${accion.apelacion.username} volverá a estar activa.`
            : accion
              ? `Se rechazará la apelación de ${accion.apelacion.username}.`
              : ''
        }
        variante={accion?.tipo === 'aceptar' ? 'advertencia' : 'peligro'}
        textoConfirmar={accion?.tipo === 'aceptar' ? 'Aceptar apelación' : 'Rechazar apelación'}
        confirmando={procesando}
        onConfirmar={() => void ejecutar()}
        onCancelar={() => setAccion(null)}
      />
    </div>
  )
}
