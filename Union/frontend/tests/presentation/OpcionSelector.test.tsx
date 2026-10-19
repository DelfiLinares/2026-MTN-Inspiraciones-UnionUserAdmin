import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OpcionSelector } from '../../src/presentation/cuestionario/OpcionSelector';
import { OpcionRespuesta } from '../../src/domain/entities/OpcionRespuesta';
import { CategoriaInteres } from '../../src/domain/enums/CategoriaInteres';

/**
 * Tests para OpcionSelector Component (T015)
 *
 * Requisitos:
 * - RNF-24: Tests unitarios con React Testing Library
 * - RNF-10: Responsive design
 * - T017: Cobertura ≥ 60%
 *
 * Criterios de aceptación:
 * - [ ] Renderiza checkbox + label
 * - [ ] onChange funciona correctamente
 * - [ ] Refleja estado checked/unchecked
 * - [ ] Accesibilidad correcta
 */
describe('OpcionSelector', () => {
  const opcionMock = OpcionRespuesta.crear(
    'opcion-1',
    CategoriaInteres.Dibujo,
    'Dibujo'
  );

  it('debe renderizar el componente sin errores', () => {
    const mockOnChange = vi.fn();
    render(
      <OpcionSelector
        opcion={opcionMock}
        checked={false}
        onChange={mockOnChange}
      />
    );
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('debe renderizar checkbox y label', () => {
    const mockOnChange = vi.fn();
    render(
      <OpcionSelector
        opcion={opcionMock}
        checked={false}
        onChange={mockOnChange}
      />
    );
    const checkbox = screen.getByRole('checkbox');
    const label = screen.getByText('Dibujo');
    expect(checkbox).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('debe renderizar checkbox no marcado cuando checked=false', () => {
    const mockOnChange = vi.fn();
    render(
      <OpcionSelector
        opcion={opcionMock}
        checked={false}
        onChange={mockOnChange}
      />
    );
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('debe renderizar checkbox marcado cuando checked=true', () => {
    const mockOnChange = vi.fn();
    render(
      <OpcionSelector
        opcion={opcionMock}
        checked={true}
        onChange={mockOnChange}
      />
    );
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('debe llamar onChange cuando se hace click en el checkbox', () => {
    const mockOnChange = vi.fn();
    render(
      <OpcionSelector
        opcion={opcionMock}
        checked={false}
        onChange={mockOnChange}
      />
    );
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('debe pasar id y checked al onChange', () => {
    const mockOnChange = vi.fn();
    render(
      <OpcionSelector
        opcion={opcionMock}
        checked={false}
        onChange={mockOnChange}
      />
    );
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(mockOnChange).toHaveBeenCalledWith('opcion-1', true);
  });

  it('debe vincular label con checkbox usando htmlFor', () => {
    const mockOnChange = vi.fn();
    render(
      <OpcionSelector
        opcion={opcionMock}
        checked={false}
        onChange={mockOnChange}
      />
    );
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    const label = screen.getByText('Dibujo') as HTMLLabelElement;
    expect(label.htmlFor).toBe(checkbox.id);
  });

  it('debe generar ID único con preguntaId por defecto', () => {
    const mockOnChange = vi.fn();
    const { container } = render(
      <OpcionSelector
        opcion={opcionMock}
        checked={false}
        onChange={mockOnChange}
      />
    );
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox?.id).toContain('opcion-1');
  });

  it('debe generar ID único con preguntaId personalizado', () => {
    const mockOnChange = vi.fn();
    const { container } = render(
      <OpcionSelector
        opcion={opcionMock}
        checked={false}
        onChange={mockOnChange}
        preguntaId="pregunta-1"
      />
    );
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox?.id).toBe('pregunta-1-opcion-1');
  });

  it('debe tener aria-label con descripción', () => {
    const mockOnChange = vi.fn();
    render(
      <OpcionSelector
        opcion={opcionMock}
        checked={false}
        onChange={mockOnChange}
      />
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Dibujo');
  });

  it('debe tener estructura correcta de clases CSS', () => {
    const mockOnChange = vi.fn();
    const { container } = render(
      <OpcionSelector
        opcion={opcionMock}
        checked={false}
        onChange={mockOnChange}
      />
    );
    const selectorDiv = container.querySelector('.opcion-selector');
    expect(selectorDiv).toBeInTheDocument();
    expect(selectorDiv?.querySelector('.opcion-selector__checkbox')).toBeInTheDocument();
    expect(selectorDiv?.querySelector('.opcion-selector__label')).toBeInTheDocument();
  });

  it('debe manejar múltiples cambios de estado', () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(
      <OpcionSelector
        opcion={opcionMock}
        checked={false}
        onChange={mockOnChange}
      />
    );
    let checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    rerender(
      <OpcionSelector
        opcion={opcionMock}
        checked={true}
        onChange={mockOnChange}
      />
    );
    checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });
});
