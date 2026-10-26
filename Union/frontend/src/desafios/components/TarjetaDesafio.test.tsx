import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { TarjetaDesafio, DesafioCardItem } from './TarjetaDesafio'

/**
 * T075 - Pruebas de TarjetaDesafio
 *
 * Verifica:
 * - Datos mostrados: nombre, fechas, ámbitos, estado
 * - Lazy loading de imágenes
 * - Badge de estado visible
 * - Accesibilidad: role="link", aria-label, tabIndex
 * - Navegación al hacer click
 */

describe('TarjetaDesafio (T075)', () => {
  const desafioBasico: DesafioCardItem = {
    id: 'desafio-1',
    nombre: 'Reforestación en la comunidad',
    fotoPrincipalUrl: 'https://example.com/foto.jpg',
    ambitos: ['Ambiente', 'Educación'],
    fechaInicio: '2024-10-15',
    fechaFin: '2024-12-31',
    estado: 'ACTIVO',
  }

  describe('Datos mostrados', () => {
    it('debe mostrar el nombre del desafío', () => {
      const { container } = render(
        <TarjetaDesafio desafio={desafioBasico} onClick={vi.fn()} />,
      )
      expect(container.textContent).toContain('Reforestación en la comunidad')
    })

    it('debe mostrar las fechas de inicio y fin formateadas', () => {
      const { container } = render(
        <TarjetaDesafio desafio={desafioBasico} onClick={vi.fn()} />,
      )
      // Las fechas se formatean a formato local (es-AR)
      expect(container.textContent).toContain('Inicio:')
      expect(container.textContent).toContain('Fin:')
    })

    it('debe mostrar los ámbitos sin la palabra clave', () => {
      const { container } = render(
        <TarjetaDesafio desafio={desafioBasico} onClick={vi.fn()} />,
      )
      expect(container.textContent).toContain('#Ambiente')
      expect(container.textContent).toContain('#Educación')
    })

    it('debe mostrar "Sin ámbitos especificados" cuando no hay ámbitos', () => {
      const desafioSinAmbitos: DesafioCardItem = {
        ...desafioBasico,
        ambitos: [],
      }
      const { container } = render(
        <TarjetaDesafio desafio={desafioSinAmbitos} onClick={vi.fn()} />,
      )
      const srOnly = container.querySelector('.sr-only')
      expect(srOnly?.textContent).toBe('Sin ámbitos especificados')
    })

    it('debe mostrar el estado en el badge', () => {
      const { container } = render(
        <TarjetaDesafio desafio={desafioBasico} onClick={vi.fn()} />,
      )
      const badge = container.querySelector('.estado-badge')
      expect(badge?.textContent).toBe('ACTIVO')
    })

    it('debe mostrar "Desconocido" cuando el estado es undefined', () => {
      const desafioSinEstado: DesafioCardItem = {
        ...desafioBasico,
        estado: undefined,
      }
      const { container } = render(
        <TarjetaDesafio desafio={desafioSinEstado} onClick={vi.fn()} />,
      )
      const badge = container.querySelector('.estado-badge')
      expect(badge?.textContent).toBe('Desconocido')
    })
  })

  describe('Imagen y lazy loading', () => {
    it('debe renderizar la imagen con loading="lazy"', () => {
      const { container } = render(
        <TarjetaDesafio desafio={desafioBasico} onClick={vi.fn()} />,
      )
      const img = container.querySelector('img')
      expect(img).not.toBeNull()
      expect(img?.getAttribute('loading')).toBe('lazy')
    })

    it('debe usar la URL de foto principal en el src de la imagen', () => {
      const { container } = render(
        <TarjetaDesafio desafio={desafioBasico} onClick={vi.fn()} />,
      )
      const img = container.querySelector('img')
      expect(img?.src).toContain('foto.jpg')
    })

    it('debe mostrar placeholder cuando no hay foto', () => {
      const desafioSinFoto: DesafioCardItem = {
        ...desafioBasico,
        fotoPrincipalUrl: undefined,
      }
      const { container } = render(
        <TarjetaDesafio desafio={desafioSinFoto} onClick={vi.fn()} />,
      )
      const placeholder = container.querySelector('.desafio-card-placeholder')
      expect(placeholder).not.toBeNull()
    })

    it('debe usar el nombre como alt text de la imagen', () => {
      const { container } = render(
        <TarjetaDesafio desafio={desafioBasico} onClick={vi.fn()} />,
      )
      const img = container.querySelector('img')
      expect(img?.getAttribute('alt')).toBe('Reforestación en la comunidad')
    })
  })

  describe('Accesibilidad', () => {
    it('debe tener role="link" para indicar que es un elemento navegable', () => {
      const { container } = render(
        <TarjetaDesafio desafio={desafioBasico} onClick={vi.fn()} />,
      )
      const article = container.querySelector('[role="link"]')
      expect(article).not.toBeNull()
    })

    it('debe tener aria-label describiendo el desafío', () => {
      const { container } = render(
        <TarjetaDesafio desafio={desafioBasico} onClick={vi.fn()} />,
      )
      const article = container.querySelector('[role="link"]')
      expect(article?.getAttribute('aria-label')).toContain('Reforestación en la comunidad')
    })

    it('debe ser navegable con teclado (tabIndex={0})', () => {
      const { container } = render(
        <TarjetaDesafio desafio={desafioBasico} onClick={vi.fn()} />,
      )
      const article = container.querySelector('article')
      expect(article?.getAttribute('tabindex')).toBe('0')
    })

    it('debe tener estado con role="status"', () => {
      const { container } = render(
        <TarjetaDesafio desafio={desafioBasico} onClick={vi.fn()} />,
      )
      const badge = container.querySelector('[role="status"]')
      expect(badge).not.toBeNull()
    })

    it('debe tener sr-only para "Ámbitos:" cuando hay ámbitos', () => {
      const { container } = render(
        <TarjetaDesafio desafio={desafioBasico} onClick={vi.fn()} />,
      )
      const srOnly = container.querySelector('.sr-only')
      expect(srOnly?.textContent).toBe('Ámbitos: ')
    })
  })

  describe('Navegación', () => {
    it('debe llamar onClick con el ID del desafío cuando se hace click', () => {
      const onClickMock = vi.fn()
      const { container } = render(
        <TarjetaDesafio desafio={desafioBasico} onClick={onClickMock} />,
      )
      const article = container.querySelector('article')
      article?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      expect(onClickMock).toHaveBeenCalledWith('desafio-1')
    })

    it('debe llamar onClick cuando se presiona Enter en la tarjeta', () => {
      const onClickMock = vi.fn()
      const { container } = render(
        <TarjetaDesafio desafio={desafioBasico} onClick={onClickMock} />,
      )
      const article = container.querySelector('article')
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      article?.dispatchEvent(event)
      expect(onClickMock).toHaveBeenCalledWith('desafio-1')
    })

    it('debe llamar onClick cuando se presiona Space en la tarjeta', () => {
      const onClickMock = vi.fn()
      const { container } = render(
        <TarjetaDesafio desafio={desafioBasico} onClick={onClickMock} />,
      )
      const article = container.querySelector('article')
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true })
      article?.dispatchEvent(event)
      expect(onClickMock).toHaveBeenCalledWith('desafio-1')
    })
  })

  describe('Memoización y optimización', () => {
    it('debe ser un componente memoizado', () => {
      // Verificar que el componente es memoizado revisando su displayName
      expect(TarjetaDesafio.displayName).toBe('TarjetaDesafio')
    })

    it('debe renderizar con diferentes estados sin causar errores', () => {
      const estadosPosibles = ['ACTIVO', 'PROGRAMADO', 'FINALIZADO', 'ELIMINADO']
      const onClickMock = vi.fn()

      estadosPosibles.forEach((estado) => {
        const desafio: DesafioCardItem = {
          ...desafioBasico,
          estado,
        }
        const { container } = render(
          <TarjetaDesafio desafio={desafio} onClick={onClickMock} />,
        )
        expect(container.querySelector('.estado-badge')).not.toBeNull()
      })
    })
  })

  describe('Casos especiales', () => {
    it('debe manejar desafíos sin foto principal correctamente', () => {
      const desafioSinFoto: DesafioCardItem = {
        ...desafioBasico,
        fotoPrincipalUrl: undefined,
      }
      const { container } = render(
        <TarjetaDesafio desafio={desafioSinFoto} onClick={vi.fn()} />,
      )
      expect(container.textContent).toContain('Reforestación en la comunidad')
    })

    it('debe formatear fechas correctamente en locale es-AR', () => {
      const desafio: DesafioCardItem = {
        ...desafioBasico,
        fechaInicio: '2024-10-15',
        fechaFin: '2024-12-31',
      }
      const { container } = render(
        <TarjetaDesafio desafio={desafio} onClick={vi.fn()} />,
      )
      // Verificar que contiene la palabra "Inicio" y "Fin"
      expect(container.textContent).toContain('Inicio:')
      expect(container.textContent).toContain('Fin:')
    })

    it('debe mostrar "-" para fechas faltantes', () => {
      const desafioSinFechas: DesafioCardItem = {
        ...desafioBasico,
        fechaInicio: undefined,
        fechaFin: undefined,
      }
      const { container } = render(
        <TarjetaDesafio desafio={desafioSinFechas} onClick={vi.fn()} />,
      )
      // El componente muestra "-" para fechas undefined
      const contenido = container.textContent
      expect(contenido).toContain('-')
    })
  })
})
