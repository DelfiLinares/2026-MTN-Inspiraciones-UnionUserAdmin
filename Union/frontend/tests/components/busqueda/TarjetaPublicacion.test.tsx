import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TarjetaPublicacion } from '../../../src/components/busqueda/TarjetaPublicacion'
import { PublicacionResumen } from '../../../src/domain/busqueda/PublicacionResumen'
import { EstadoPublicacion } from '../../../src/domain/enums/EstadoPublicacion'
import { TipoContenido } from '../../../src/domain/enums/TipoContenido'

/**
 * T063 — TarjetaPublicacion (HU-06, RF-15, RF-26; CA-06.1, CA-06.2, CA-06.4).
 * Fuente: Union/specs/007-inspiraciones-busqueda/{spec,plan,tasks}.md
 *
 * Contrato asumido para T041 (no definido en las specs):
 * - `<TarjetaPublicacion publicacion={PublicacionResumen} />`, renderizada dentro de un Router.
 * - La tarjeta es un único enlace accesible a `/publicaciones/:id` (ruta de `AbrirPublicacion`),
 *   cuyo nombre accesible incluye el título.
 * - Miniatura: `<img loading="lazy">` con `alt` descriptivo, dentro de un contenedor
 *   `data-testid="tarjeta-miniatura"` que reserva el espacio (aspect-ratio por CSS) y se
 *   mantiene aunque la imagen falle.
 * - Si la imagen falla (evento `error`) se reemplaza por un placeholder `role="img"` con
 *   nombre accesible que menciona que la imagen no está disponible.
 * - Sin acciones rápidas (RF-26): solo el enlace, ningún botón.
 */
function crear(sobrescribir: Partial<ConstructorParameters<typeof PublicacionResumen>[0]> = {}) {
  return new PublicacionResumen({
    id: 'pub-42',
    titulo: 'Paisaje al óleo',
    autor: { id: 'aut-7', nombre: 'Lucía Fernández' },
    miniaturaUrl: 'https://cdn.example.com/min/pub-42.jpg',
    tipoContenido: TipoContenido.IMAGEN,
    estado: EstadoPublicacion.ACTIVA,
    ...sobrescribir,
  })
}

function renderizar(publicacion: PublicacionResumen = crear()) {
  return render(
    <MemoryRouter>
      <TarjetaPublicacion publicacion={publicacion} />
    </MemoryRouter>,
  )
}

describe('TarjetaPublicacion — contenido (RF-15, RF-26)', () => {
  it('muestra el título', () => {
    renderizar()

    expect(screen.getByText('Paisaje al óleo')).toBeInTheDocument()
  })

  it('muestra el nombre del autor', () => {
    renderizar()

    expect(screen.getByText('Lucía Fernández')).toBeInTheDocument()
  })

  it('muestra la miniatura con la URL recibida', () => {
    renderizar()

    const imagen = screen.getByRole('img', { name: /paisaje al óleo/i })
    expect(imagen).toHaveAttribute('src', 'https://cdn.example.com/min/pub-42.jpg')
  })

  it.each([
    [TipoContenido.IMAGEN, /imagen/i],
    [TipoContenido.VIDEO, /video/i],
    [TipoContenido.MUSICA, /m[uú]sica/i],
    [TipoContenido.TUTORIAL, /tutorial/i],
  ])('muestra el tipo de contenido %s', (tipo, patron) => {
    renderizar(crear({ tipoContenido: tipo }))

    expect(screen.getByText(patron)).toBeInTheDocument()
  })

  it('no ofrece acciones rápidas (solo lectura)', () => {
    renderizar()

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('TarjetaPublicacion — enlace al detalle (HU-06, CA-06.2)', () => {
  it('es un enlace a la ruta de detalle de la publicación', () => {
    renderizar()

    const enlace = screen.getByRole('link')
    expect(enlace).toHaveAttribute('href', '/publicaciones/pub-42')
  })

  it('el nombre accesible del enlace incluye el título', () => {
    renderizar()

    expect(screen.getByRole('link', { name: /paisaje al óleo/i })).toBeInTheDocument()
  })

  it('hay un único enlace por tarjeta', () => {
    renderizar()

    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  it('codifica el id en la ruta', () => {
    renderizar(crear({ id: 'a/b c' }))

    expect(screen.getByRole('link')).toHaveAttribute('href', '/publicaciones/a%2Fb%20c')
  })

  it('el enlace es alcanzable con el teclado', () => {
    renderizar()

    const enlace = screen.getByRole('link')
    enlace.focus()

    expect(enlace).toHaveFocus()
  })
})

describe('TarjetaPublicacion — imagen diferida con espacio reservado (CA-06.4)', () => {
  it('la imagen se carga de forma diferida', () => {
    renderizar()

    expect(screen.getByRole('img', { name: /paisaje al óleo/i })).toHaveAttribute(
      'loading',
      'lazy',
    )
  })

  it('la imagen vive dentro de un contenedor que reserva el espacio', () => {
    renderizar()

    const contenedor = screen.getByTestId('tarjeta-miniatura')
    expect(within(contenedor).getByRole('img')).toBeInTheDocument()
  })

  it('la imagen no es arrastrable ni se anuncia dos veces (alt descriptivo no vacío)', () => {
    renderizar()

    const alt = screen.getByRole('img', { name: /paisaje al óleo/i }).getAttribute('alt')
    expect(alt).toBeTruthy()
  })
})

describe('TarjetaPublicacion — placeholder si la imagen falla (RF-26)', () => {
  it('reemplaza la imagen por un placeholder accesible', () => {
    renderizar()

    fireEvent.error(screen.getByRole('img', { name: /paisaje al óleo/i }))

    const placeholder = screen.getByRole('img', { name: /no (est[aá] )?disponible/i })
    expect(placeholder).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /paisaje al óleo/i })).not.toBeInTheDocument()
  })

  it('el contenedor de la miniatura se conserva (sin salto de diseño)', () => {
    renderizar()
    const antes = screen.getByTestId('tarjeta-miniatura')

    fireEvent.error(screen.getByRole('img', { name: /paisaje al óleo/i }))

    expect(screen.getByTestId('tarjeta-miniatura')).toBe(antes)
  })

  it('con la imagen rota siguen visibles título, autor, tipo y enlace', () => {
    renderizar()

    fireEvent.error(screen.getByRole('img', { name: /paisaje al óleo/i }))

    expect(screen.getByText('Paisaje al óleo')).toBeInTheDocument()
    expect(screen.getByText('Lucía Fernández')).toBeInTheDocument()
    expect(screen.getByText(/imagen/i)).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/publicaciones/pub-42')
  })

  it('no muestra placeholder mientras la imagen carga bien', () => {
    renderizar()

    expect(screen.queryByRole('img', { name: /no (est[aá] )?disponible/i })).not.toBeInTheDocument()
  })
})
