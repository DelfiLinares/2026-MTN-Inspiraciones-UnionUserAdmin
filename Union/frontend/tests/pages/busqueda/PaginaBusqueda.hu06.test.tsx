import { describe, expect, it } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { PublicacionResumen } from '../../../src/domain/busqueda/PublicacionResumen'
import { EstadoPublicacion } from '../../../src/domain/enums/EstadoPublicacion'
import type { PublicacionEjemplo } from '../../../src/infrastructure/busqueda/datosEjemplo'
import {
  TAMANO_PAGINA,
  esperarTarjetas,
  instalarEntorno,
  renderizarPagina,
  tarjetas,
  titulos,
  todos,
  ubicacion,
} from './ayudas'

/**
 * T067 — HU-06: abrir una publicación (CA-06.1 … CA-06.4; RF-15, RF-16, RF-19, RF-26).
 * Integración UI + SesionBusqueda + adaptador en memoria. Contrato de la página: ver `ayudas.tsx`.
 * El detalle es de otro módulo: se comprueba solo la navegación a `/publicaciones/:id`.
 */
instalarEntorno()

describe('PaginaBusqueda — HU-06: abrir una publicación', () => {
  it('cada tarjeta muestra miniatura, título, autor y tipo de contenido (CA-06.1, RF-26)', async () => {
    renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)

    const primera = todos[0].resumen
    const tarjeta = tarjetas()[0]

    expect(within(tarjeta).getByRole('img', { name: primera.titulo })).toHaveAttribute(
      'src',
      primera.miniaturaUrl,
    )
    expect(within(tarjeta).getByText(primera.titulo)).toBeInTheDocument()
    expect(within(tarjeta).getByText(primera.autor.nombre)).toBeInTheDocument()
    expect(within(tarjeta).getByText(/imagen/i)).toBeInTheDocument()
  })

  it('abrir una tarjeta navega a la pantalla de detalle (CA-06.2, RF-15)', async () => {
    renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    const primera = todos[0].resumen

    const enlace = within(tarjetas()[0]).getByRole('link')
    expect(enlace).toHaveAttribute('href', `/publicaciones/${primera.id}`)
    fireEvent.click(enlace)

    expect(await screen.findByRole('heading', { name: /detalle de publicación/i })).toBeInTheDocument()
    expect(ubicacion()).toBe(`/publicaciones/${primera.id}`)
  })

  it('las publicaciones ELIMINADA no se muestran: las excluye la API (CA-06.3, RF-16)', async () => {
    const eliminada: PublicacionEjemplo = {
      ...todos[0],
      resumen: new PublicacionResumen({
        id: 'pub-eliminada',
        titulo: 'Publicación eliminada de prueba',
        autor: todos[0].resumen.autor,
        miniaturaUrl: 'https://example.com/miniaturas/eliminada.jpg',
        tipoContenido: todos[0].resumen.tipoContenido,
        estado: EstadoPublicacion.ELIMINADA,
      }),
    }
    renderizarPagina({ datos: [eliminada, ...todos] })

    await esperarTarjetas(TAMANO_PAGINA)

    expect(titulos()).not.toContain('Publicación eliminada de prueba')
  })

  it('las imágenes son diferidas y reservan su espacio (CA-06.4)', async () => {
    renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)

    expect(screen.getAllByTestId('tarjeta-miniatura')).toHaveLength(TAMANO_PAGINA)
    for (const tarjeta of tarjetas()) {
      expect(within(tarjeta).getByRole('img')).toHaveAttribute('loading', 'lazy')
    }
  })

  it('una imagen que falla se reemplaza por un placeholder sin romper la tarjeta', async () => {
    renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    const primera = todos[0].resumen

    fireEvent.error(within(tarjetas()[0]).getByRole('img', { name: primera.titulo }))

    expect(within(tarjetas()[0]).getByRole('img', { name: /no (est[aá] )?disponible/i }))
      .toBeInTheDocument()
    expect(within(tarjetas()[0]).getByText(primera.titulo)).toBeInTheDocument()
    expect(tarjetas()).toHaveLength(TAMANO_PAGINA)
  })

  it('es de solo lectura: las tarjetas no tienen acciones rápidas (RF-19)', async () => {
    renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)

    for (const tarjeta of tarjetas()) {
      expect(within(tarjeta).queryByRole('button')).not.toBeInTheDocument()
    }
  })
})
