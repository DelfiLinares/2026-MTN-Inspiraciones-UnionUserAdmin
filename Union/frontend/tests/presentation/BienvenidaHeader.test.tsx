import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BienvenidaHeader } from '../../src/presentation/cuestionario/BienvenidaHeader';
import { ESLOGAN_BIENVENIDA, SUBTITULO_BIENVENIDA } from '../../src/presentation/cuestionario/constants';

/**
 * Tests para BienvenidaHeader Component (T013)
 *
 * Requisitos:
 * - RNF-24: Tests unitarios con React Testing Library
 * - RNF-10: Responsive design
 * - T017: Cobertura ≥ 60%
 *
 * Criterios de aceptación:
 * - [ ] Renderiza eslogan
 * - [ ] Renderiza subtítulo
 * - [ ] Estructura semántica correcta (header, h1)
 * - [ ] Accesibilidad básica
 */
describe('BienvenidaHeader', () => {
  it('debe renderizar el componente sin errores', () => {
    render(<BienvenidaHeader />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('debe renderizar el eslogan correcto', () => {
    render(<BienvenidaHeader />);
    const eslogan = screen.getByRole('heading', { level: 1 });
    expect(eslogan).toHaveTextContent(ESLOGAN_BIENVENIDA);
  });

  it('debe renderizar el eslogan con el texto exacto', () => {
    render(<BienvenidaHeader />);
    expect(screen.getByText(ESLOGAN_BIENVENIDA)).toBeInTheDocument();
  });

  it('debe renderizar el subtítulo', () => {
    render(<BienvenidaHeader />);
    expect(screen.getByText(SUBTITULO_BIENVENIDA)).toBeInTheDocument();
  });

  it('debe tener estructura de header', () => {
    const { container } = render(<BienvenidaHeader />);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('bienvenida-header');
  });

  it('debe contener el h1 dentro del header', () => {
    const { container } = render(<BienvenidaHeader />);
    const header = container.querySelector('header');
    const heading = header?.querySelector('h1');
    expect(heading).toBeInTheDocument();
  });

  it('debe renderizar dos elementos de texto (eslogan y subtítulo)', () => {
    const { container } = render(<BienvenidaHeader />);
    const header = container.querySelector('header');
    const textElements = header?.querySelectorAll('h1, p');
    expect(textElements?.length).toBeGreaterThanOrEqual(2);
  });

  it('debe tener la clase correcta en el eslogan', () => {
    const { container } = render(<BienvenidaHeader />);
    const eslogan = container.querySelector('.bienvenida-header__eslogan');
    expect(eslogan).toBeInTheDocument();
    expect(eslogan).toHaveTextContent(ESLOGAN_BIENVENIDA);
  });

  it('debe tener la clase correcta en el subtítulo', () => {
    const { container } = render(<BienvenidaHeader />);
    const subtitulo = container.querySelector('.bienvenida-header__subtitulo');
    expect(subtitulo).toBeInTheDocument();
    expect(subtitulo).toHaveTextContent(SUBTITULO_BIENVENIDA);
  });

  it('debe ser accesible: eslogan es un heading', () => {
    render(<BienvenidaHeader />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
  });
});
