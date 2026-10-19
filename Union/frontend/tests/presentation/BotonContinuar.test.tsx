import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BotonContinuar } from '../../src/presentation/cuestionario/BotonContinuar';

/**
 * Tests para BotonContinuar Component (T016)
 *
 * Requisitos:
 * - RNF-24: Tests unitarios con React Testing Library
 * - RNF-10: Responsive design
 * - T017: Cobertura ≥ 60%
 *
 * Criterios de aceptación:
 * - [ ] Renderiza botón
 * - [ ] Estado enabled/disabled funciona
 * - [ ] onClick se ejecuta correctamente
 * - [ ] Loading state muestra spinner
 */
describe('BotonContinuar', () => {
  it('debe renderizar el componente sin errores', () => {
    const mockOnClick = vi.fn();
    render(<BotonContinuar enabled={true} onClick={mockOnClick} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('debe renderizar botón con texto "Continuar"', () => {
    const mockOnClick = vi.fn();
    render(<BotonContinuar enabled={true} onClick={mockOnClick} />);
    expect(screen.getByText('Continuar')).toBeInTheDocument();
  });

  it('debe estar habilitado cuando enabled=true', () => {
    const mockOnClick = vi.fn();
    render(<BotonContinuar enabled={true} onClick={mockOnClick} />);
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('debe estar deshabilitado cuando enabled=false', () => {
    const mockOnClick = vi.fn();
    render(<BotonContinuar enabled={false} onClick={mockOnClick} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('debe llamar onClick cuando se hace click en enabled=true', () => {
    const mockOnClick = vi.fn();
    render(<BotonContinuar enabled={true} onClick={mockOnClick} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('no debe llamar onClick cuando está deshabilitado', () => {
    const mockOnClick = vi.fn();
    render(<BotonContinuar enabled={false} onClick={mockOnClick} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('debe mostrar spinner cuando loading=true', () => {
    const mockOnClick = vi.fn();
    render(
      <BotonContinuar enabled={true} onClick={mockOnClick} loading={true} />
    );
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('debe estar deshabilitado cuando loading=true', () => {
    const mockOnClick = vi.fn();
    render(
      <BotonContinuar enabled={true} onClick={mockOnClick} loading={true} />
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('no debe llamar onClick cuando loading=true', () => {
    const mockOnClick = vi.fn();
    render(
      <BotonContinuar enabled={true} onClick={mockOnClick} loading={true} />
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('debe renderizar spinner cuando loading=true', () => {
    const mockOnClick = vi.fn();
    const { container } = render(
      <BotonContinuar enabled={true} onClick={mockOnClick} loading={true} />
    );
    const spinner = container.querySelector('.boton-continuar__spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('no debe renderizar spinner cuando loading=false', () => {
    const mockOnClick = vi.fn();
    const { container } = render(
      <BotonContinuar enabled={true} onClick={mockOnClick} loading={false} />
    );
    const spinner = container.querySelector('.boton-continuar__spinner');
    expect(spinner).not.toBeInTheDocument();
  });

  it('debe tener aria-label apropiado cuando loading=true', () => {
    const mockOnClick = vi.fn();
    render(
      <BotonContinuar enabled={true} onClick={mockOnClick} loading={true} />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Cargando...');
  });

  it('debe tener aria-label "Continuar" cuando loading=false', () => {
    const mockOnClick = vi.fn();
    render(
      <BotonContinuar enabled={true} onClick={mockOnClick} loading={false} />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Continuar');
  });

  it('debe tener aria-busy=true cuando loading=true', () => {
    const mockOnClick = vi.fn();
    render(
      <BotonContinuar enabled={true} onClick={mockOnClick} loading={true} />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('debe tener clase CSS boton-continuar', () => {
    const mockOnClick = vi.fn();
    const { container } = render(
      <BotonContinuar enabled={true} onClick={mockOnClick} />
    );
    const button = container.querySelector('.boton-continuar');
    expect(button).toBeInTheDocument();
  });

  it('debe manejar cambios de enabled dinámicamente', () => {
    const mockOnClick = vi.fn();
    const { rerender } = render(
      <BotonContinuar enabled={false} onClick={mockOnClick} />
    );
    let button = screen.getByRole('button');
    expect(button).toBeDisabled();

    rerender(<BotonContinuar enabled={true} onClick={mockOnClick} />);
    button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('debe manejar cambios de loading dinámicamente', () => {
    const mockOnClick = vi.fn();
    const { rerender } = render(
      <BotonContinuar
        enabled={true}
        onClick={mockOnClick}
        loading={false}
      />
    );
    expect(screen.getByText('Continuar')).toBeInTheDocument();

    rerender(
      <BotonContinuar enabled={true} onClick={mockOnClick} loading={true} />
    );
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('debe tener loading=false por defecto', () => {
    const mockOnClick = vi.fn();
    const { container } = render(
      <BotonContinuar enabled={true} onClick={mockOnClick} />
    );
    const spinner = container.querySelector('.boton-continuar__spinner');
    expect(spinner).not.toBeInTheDocument();
  });

  it('debe ser un button element', () => {
    const mockOnClick = vi.fn();
    render(<BotonContinuar enabled={true} onClick={mockOnClick} />);
    const button = screen.getByRole('button');
    expect(button.tagName).toBe('BUTTON');
  });
});
