import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ResultadoPublicacionesPaginado } from '../../application/ports/PublicacionRepository'
import { carpetaService } from '../../services/carpetaPerfilService'
import { PublicacionList } from '../publicaciones/PublicacionList'

const TAMANIO_PAGINA = 20

export const CarpetaPostsPage: React.FC = () => {
  const { id: carpetaId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pagina, setPagina] = useState<ResultadoPublicacionesPaginado>({
    items: [],
    total: 0,
    limit: TAMANIO_PAGINA,
    offset: 0,
    hasMore: false,
  })
  const [cargando, setCargando] = useState(true)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!carpetaId) {
      setError('No se encontró el identificador de la carpeta.')
      setCargando(false)
      return
    }

    let activo = true
    setCargando(true)
    setError(undefined)
    void carpetaService
      .listarPostsDeCarpeta(carpetaId, TAMANIO_PAGINA, 0)
      .then((resultado) => {
        if (activo) {
          setPagina({
            items: resultado.publicaciones,
            total: resultado.total,
            limit: resultado.limit,
            offset: resultado.offset,
            hasMore:
              resultado.offset + resultado.publicaciones.length < resultado.total,
          })
        }
      })
      .catch((reason: unknown) => {
        if (activo) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'No se pudieron cargar las publicaciones de la carpeta.',
          )
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false)
        }
      })

    return () => {
      activo = false
    }
  }, [carpetaId])

  const cargarMas = async () => {
    if (!carpetaId || !pagina.hasMore || cargandoMas) {
      return
    }

    setCargandoMas(true)
    setError(undefined)
    try {
      const offset = pagina.offset + pagina.limit
      const resultado = await carpetaService.listarPostsDeCarpeta(
        carpetaId,
        pagina.limit,
        offset,
      )
      setPagina((actual) => ({
        items: [...actual.items, ...resultado.publicaciones],
        total: resultado.total,
        limit: resultado.limit,
        offset: resultado.offset,
        hasMore:
          resultado.offset + resultado.publicaciones.length < resultado.total,
      }))
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No se pudieron cargar más publicaciones.',
      )
    } finally {
      setCargandoMas(false)
    }
  }

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <button type="button" onClick={() => navigate(-1)}>
        Volver
      </button>
      <h1>Publicaciones de la carpeta</h1>
      {error && <p role="alert">{error}</p>}
      <PublicacionList
        publicaciones={pagina.items}
        paginacion={pagina}
        esPerfilPropio={false}
        cargando={cargando}
        cargandoMas={cargandoMas}
        onCargarMas={() => void cargarMas()}
      />
    </main>
  )
}
