import React, { useEffect, useState } from 'react'
import {
  buscarUsuariosEtiquetables,
  crearPublicacionCompleta,
  obtenerCategoriasPublicacion,
  subirImagenPublicacion,
} from '../../services/publicacionService'
import type { CategoriaPublicacionDto, PublicUserSummaryDto } from '../../services/publicacionService'

/**
 * `CrearPublicacionDialog`: Modal para crear una publicación de texto desde el perfil propio.
 * Usa `POST /api/publicaciones` (JSON, tipoContenido TEXTO).
 */
export interface CrearPublicacionDialogProps {
  onSuccess: () => void
  onCancel: () => void
}

const LIMITE_CONTENIDO = 2000

const etiquetaCampo: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  marginTop: '0.75rem',
  fontSize: '13px',
  color: '#374151',
}
const campo: React.CSSProperties = {
  padding: '0.5rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
}
const chip: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.625rem',
  border: '1px solid #d1d5db',
  borderRadius: '999px',
  background: 'white',
  fontSize: '12px',
  cursor: 'pointer',
}
const chipActivo: React.CSSProperties = {
  backgroundColor: '#4b5563',
  borderColor: '#4b5563',
  color: 'white',
}

export const CrearPublicacionDialog: React.FC<CrearPublicacionDialogProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [contenido, setContenido] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [tipo, setTipo] = useState<'TEXTO' | 'IMAGEN'>('TEXTO')
  const [imagen, setImagen] = useState<File | null>(null)
  const [vistaPrevia, setVistaPrevia] = useState('')
  const [hashtagsTexto, setHashtagsTexto] = useState('')
  const [categorias, setCategorias] = useState<CategoriaPublicacionDto[]>([])
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [resultadosBusqueda, setResultadosBusqueda] = useState<PublicUserSummaryDto[]>([])
  const [etiquetadas, setEtiquetadas] = useState<PublicUserSummaryDto[]>([])
  useEffect(() => {
    if (!imagen) { setVistaPrevia(''); return }
    const url = URL.createObjectURL(imagen)
    setVistaPrevia(url)
    return () => URL.revokeObjectURL(url)
  }, [imagen])

  useEffect(() => {
    let activo = true
    obtenerCategoriasPublicacion()
      .then((lista) => {
        if (activo) setCategorias(lista)
      })
      .catch(() => {
        if (activo) setError('No se pudieron cargar las categorías.')
      })
    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    const texto = busqueda.trim()
    if (texto.length < 2) {
      setResultadosBusqueda([])
      return
    }
    let activo = true
    const timer = setTimeout(() => {
      buscarUsuariosEtiquetables(texto)
        .then((lista) => {
          if (activo) setResultadosBusqueda(lista)
        })
        .catch(() => {
          if (activo) setResultadosBusqueda([])
        })
    }, 300)
    return () => {
      activo = false
      clearTimeout(timer)
    }
  }, [busqueda])

  const toggleCategoria = (codigo: string) => {
    setCategoriasSeleccionadas((prev) =>
      prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo],
    )
  }

  const agregarEtiquetada = (usuario: PublicUserSummaryDto) => {
    setEtiquetadas((prev) => (prev.some((u) => u.id === usuario.id) ? prev : [...prev, usuario]))
    setBusqueda('')
  }

  const handleCrear = async () => {
    const texto = contenido.trim()
    if (!texto) {
      setError('Escribe el contenido de la publicación.')
      return
    }
    if (texto.length > LIMITE_CONTENIDO) {
      setError(`El contenido no puede superar ${LIMITE_CONTENIDO} caracteres.`)
      return
    }

    if (tipo === 'IMAGEN' && !imagen) {
      setError('Elegí una imagen de tu dispositivo.')
      return
    }

    const hashtags = hashtagsTexto
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0)

    setEnviando(true)
    setError('')
    try {
      const fotoUrl = tipo === 'IMAGEN' && imagen ? await subirImagenPublicacion(imagen) : undefined
      await crearPublicacionCompleta({
        contenido: texto,
        tipoContenido: tipo,
        fotoUrl,
        categorias: categoriasSeleccionadas,
        hashtags,
        cuentasEtiquetadas: etiquetadas.map((u) => u.id),
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la publicación.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crear-publicacion-titulo"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          width: '100%',
          boxSizing: 'border-box',
          minWidth: 0,
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          fontFamily: 'sans-serif',
        }}
      >
        <h2 id="crear-publicacion-titulo" style={{ margin: '0 0 1rem 0', fontSize: '18px' }}>
          Nueva publicación
        </h2>

        <textarea
          aria-label="Contenido de la publicación"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Escribe algo para compartir..."
          rows={6}
          maxLength={LIMITE_CONTENIDO + 1}
          disabled={enviando}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            resize: 'vertical',
          }}
        />
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '12px', color: '#6b7280', textAlign: 'right' }}>
          {contenido.length}/{LIMITE_CONTENIDO}
        </p>

        <label style={etiquetaCampo}>
          Tipo
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'TEXTO' | 'IMAGEN')}
            disabled={enviando}
            style={campo}
          >
            <option value="TEXTO">Texto</option>
            <option value="IMAGEN">Imagen</option>
          </select>
        </label>

        {tipo === 'IMAGEN' && (
          <label style={etiquetaCampo}>
            Imagen del dispositivo
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => {
                const archivo = e.target.files?.[0]
                if (!archivo) { setImagen(null); return }
                if (!['image/png', 'image/jpeg'].includes(archivo.type) || archivo.size > 5 * 1024 * 1024) {
                  setError('Elegí una imagen PNG o JPEG de hasta 5 MB.'); setImagen(null); e.target.value = ''; return
                }
                setError(''); setImagen(archivo)
              }}
              disabled={enviando}
              style={campo}
            />
            <span>PNG o JPEG, hasta 5 MB.</span>
            {vistaPrevia && <img src={vistaPrevia} alt="Vista previa de la imagen seleccionada" style={{ width: '100%', maxHeight: 240, objectFit: 'contain', marginTop: 12, borderRadius: 8 }} />}
          </label>
        )}

        <div style={etiquetaCampo}>
          <span>Categorías</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {categorias.map((cat) => {
              const activa = categoriasSeleccionadas.includes(cat.codigo)
              return (
                <button
                  key={cat.codigo}
                  type="button"
                  aria-pressed={activa}
                  onClick={() => toggleCategoria(cat.codigo)}
                  disabled={enviando}
                  style={{ ...chip, ...(activa ? chipActivo : {}) }}
                >
                  {cat.nombre}
                </button>
              )
            })}
          </div>
        </div>

        <label style={etiquetaCampo}>
          Hashtags (separados por coma)
          <input
            type="text"
            value={hashtagsTexto}
            onChange={(e) => setHashtagsTexto(e.target.value)}
            placeholder="arte, fotografia"
            disabled={enviando}
            style={campo}
          />
        </label>

        <div style={etiquetaCampo}>
          <label htmlFor="buscar-etiquetas">Etiquetar cuentas</label>
          <input
            id="buscar-etiquetas"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por username..."
            disabled={enviando}
            style={campo}
          />
          {resultadosBusqueda.map((u) => (
            <button key={u.id} type="button" onClick={() => agregarEtiquetada(u)} style={chip}>
              @{u.username}
            </button>
          ))}
          {etiquetadas.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {etiquetadas.map((u) => (
                <span key={u.id} style={{ ...chip, ...chipActivo, cursor: 'default' }}>
                  @{u.username}
                  <button
                    type="button"
                    aria-label={`Quitar @${u.username}`}
                    onClick={() => setEtiquetadas((prev) => prev.filter((x) => x.id !== u.id))}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.25rem' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p role="alert" style={{ margin: '0.5rem 0', color: '#c33', fontSize: '13px' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={enviando}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleCrear()}
            disabled={enviando}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4b5563',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: enviando ? 'wait' : 'pointer',
            }}
          >
            {enviando ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}
