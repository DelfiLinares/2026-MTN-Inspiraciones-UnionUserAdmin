import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreguntaForm } from '../../src/presentation/cuestionario/PreguntaForm';
import { Pregunta } from '../../src/domain/entities/Pregunta';
import { OpcionRespuesta } from '../../src/domain/entities/OpcionRespuesta';
import { CategoriaInteres } from '../../src/domain/enums/CategoriaInteres';

/**
 * Tests para PreguntaForm Component (T014)
 *
 * Requisitos:
 * - RNF-24: Tests unitarios con React Testing Library
 * - RNF-10: Responsive design
 * - T017: Cobertura ≥ 60%
 *
 * Criterios de aceptación:
 * - [ ] Renderiza pregunta + opciones
 * - [ ] Maneja clicks en opciones
 * - [ ] Refleja estado de selección
 * - [ ] Muestra indicador de obligatoria
 */
describe('PreguntaForm', () => {
  const crearPregunta = (
    id: string,
    texto: string,
    obligatoria: boolean,
    cantidadOpciones: number = 3
  ): Pregunta => {
    const opciones: OpcionRespuesta[] = [];
    for (let i = 0; i < cantidadOpciones; i++) {
      opciones.push(
        OpcionRespuesta.crear(
          `opcion-${i + 1}`,
          CategoriaInteres.Dibujo,
          `Opción ${i + 1}`
        )
      );
    }

    return Pregunta.crear(id, texto, opciones, true, obligatoria);
  };

  it('debe renderizar el componente sin errores', () => {
    const pregunta = crearPregunta('p1', '¿Cuáles son tus intereses?', true);
    const mockOnSeleccionar = vi.fn();
    const mockOnDeseleccionar = vi.fn();

    render(
      <PreguntaForm
        pregunta={pregunta}
        respuestasSeleccionadas={new Set()}
        onSeleccionar={mockOnSeleccionar}
        onDeseleccionar={mockOnDeseleccionar}
      />
    );

    expect(screen.getByText('¿Cuáles son tus intereses?')).toBeInTheDocument();
  });

  it('debe renderizar pregunta + opciones', () => {
    const pregunta = crearPregunta('p1', '¿Cuáles son tus intereses?', true, 3);
    const mockOnSeleccionar = vi.fn();
    const mockOnDeseleccionar = vi.fn();

    render(
      <PreguntaForm
        pregunta={pregunta}
        respuestasSeleccionadas={new Set()}
        onSeleccionar={mockOnSeleccionar}
        onDeseleccionar={mockOnDeseleccionar}
      />
    );

    expect(screen.getByText('¿Cuáles son tus intereses?')).toBeInTheDocument();
    expect(screen.getByText('Opción 1')).toBeInTheDocument();
    expect(screen.getByText('Opción 2')).toBeInTheDocument();
    expect(screen.getByText('Opción 3')).toBeInTheDocument();
  });

  it('debe renderizar todos los checkboxes de opciones', () => {
    const pregunta = crearPregunta('p1', 'Pregunta Test', true, 5);
    const mockOnSeleccionar = vi.fn();
    const mockOnDeseleccionar = vi.fn();

    render(
      <PreguntaForm
        pregunta={pregunta}
        respuestasSeleccionadas={new Set()}
        onSeleccionar={mockOnSeleccionar}
        onDeseleccionar={mockOnDeseleccionar}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(5);
  });

  it('debe marcar opciones seleccionadas', () => {
    const pregunta = crearPregunta('p1', 'Pregunta Test', true, 3);
    const respuestasSeleccionadas = new Set(['opcion-1', 'opcion-3']);
    const mockOnSeleccionar = vi.fn();
    const mockOnDeseleccionar = vi.fn();

    render(
      <PreguntaForm
        pregunta={pregunta}
        respuestasSeleccionadas={respuestasSeleccionadas}
        onSeleccionar={mockOnSeleccionar}
        onDeseleccionar={mockOnDeseleccionar}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
    expect((checkboxes[2] as HTMLInputElement).checked).toBe(true);
  });

  it('debe llamar onSeleccionar cuando se selecciona una opción', () => {
    const pregunta = crearPregunta('p1', 'Pregunta Test', true, 3);
    const mockOnSeleccionar = vi.fn();
    const mockOnDeseleccionar = vi.fn();

    render(
      <PreguntaForm
        pregunta={pregunta}
        respuestasSeleccionadas={new Set()}
        onSeleccionar={mockOnSeleccionar}
        onDeseleccionar={mockOnDeseleccionar}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(mockOnSeleccionar).toHaveBeenCalled();
  });

  it('debe llamar onDeseleccionar cuando se deselecciona una opción', () => {
    const pregunta = crearPregunta('p1', 'Pregunta Test', true, 3);
    const respuestasSeleccionadas = new Set(['opcion-1']);
    const mockOnSeleccionar = vi.fn();
    const mockOnDeseleccionar = vi.fn();

    render(
      <PreguntaForm
        pregunta={pregunta}
        respuestasSeleccionadas={respuestasSeleccionadas}
        onSeleccionar={mockOnSeleccionar}
        onDeseleccionar={mockOnDeseleccionar}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(mockOnDeseleccionar).toHaveBeenCalled();
  });

  it('debe mostrar indicador de obligatoria (*)', () => {
    const pregunta = crearPregunta('p1', 'Pregunta Obligatoria', true, 2);
    const mockOnSeleccionar = vi.fn();
    const mockOnDeseleccionar = vi.fn();

    const { container } = render(
      <PreguntaForm
        pregunta={pregunta}
        respuestasSeleccionadas={new Set()}
        onSeleccionar={mockOnSeleccionar}
        onDeseleccionar={mockOnDeseleccionar}
      />
    );

    const requiredIndicator = container.querySelector('.pregunta-form__requerida');
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveTextContent('*');
  });

  it('no debe mostrar indicador de obligatoria cuando es opcional', () => {
    const pregunta = crearPregunta('p1', 'Pregunta Opcional', false, 2);
    const mockOnSeleccionar = vi.fn();
    const mockOnDeseleccionar = vi.fn();

    const { container } = render(
      <PreguntaForm
        pregunta={pregunta}
        respuestasSeleccionadas={new Set()}
        onSeleccionar={mockOnSeleccionar}
        onDeseleccionar={mockOnDeseleccionar}
      />
    );

    const requiredIndicator = container.querySelector('.pregunta-form__requerida');
    expect(requiredIndicator).not.toBeInTheDocument();
  });

  it('debe tener estructura fieldset + legend', () => {
    const pregunta = crearPregunta('p1', 'Pregunta Test', true, 2);
    const mockOnSeleccionar = vi.fn();
    const mockOnDeseleccionar = vi.fn();

    const { container } = render(
      <PreguntaForm
        pregunta={pregunta}
        respuestasSeleccionadas={new Set()}
        onSeleccionar={mockOnSeleccionar}
        onDeseleccionar={mockOnDeseleccionar}
      />
    );

    const fieldset = container.querySelector('fieldset');
    const legend = container.querySelector('legend');
    expect(fieldset).toBeInTheDocument();
    expect(legend).toBeInTheDocument();
    expect(fieldset?.querySelector('legend')).toBe(legend);
  });

  it('debe renderizar labels vinculados a checkboxes', () => {
    const pregunta = crearPregunta('p1', 'Pregunta Test', true, 3);
    const mockOnSeleccionar = vi.fn();
    const mockOnDeseleccionar = vi.fn();

    const { container } = render(
      <PreguntaForm
        pregunta={pregunta}
        respuestasSeleccionadas={new Set()}
        onSeleccionar={mockOnSeleccionar}
        onDeseleccionar={mockOnDeseleccionar}
      />
    );

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    const labels = container.querySelectorAll('label');

    checkboxes.forEach((checkbox) => {
      const label = Array.from(labels).find(
        (l) => l.htmlFor === checkbox.id
      );
      expect(label).toBeTruthy();
    });
  });

  it('debe tener clases CSS correctas', () => {
    const pregunta = crearPregunta('p1', 'Pregunta Test', true, 2);
    const mockOnSeleccionar = vi.fn();
    const mockOnDeseleccionar = vi.fn();

    const { container } = render(
      <PreguntaForm
        pregunta={pregunta}
        respuestasSeleccionadas={new Set()}
        onSeleccionar={mockOnSeleccionar}
        onDeseleccionar={mockOnDeseleccionar}
      />
    );

    expect(container.querySelector('.pregunta-form')).toBeInTheDocument();
    expect(container.querySelector('.pregunta-form__titulo')).toBeInTheDocument();
    expect(container.querySelector('.pregunta-form__opciones')).toBeInTheDocument();
  });

  it('debe manejar selección múltiple', () => {
    const pregunta = crearPregunta('p1', 'Pregunta Test', true, 4);
    const mockOnSeleccionar = vi.fn();
    const mockOnDeseleccionar = vi.fn();

    const { rerender } = render(
      <PreguntaForm
        pregunta={pregunta}
        respuestasSeleccionadas={new Set()}
        onSeleccionar={mockOnSeleccionar}
        onDeseleccionar={mockOnDeseleccionar}
      />
    );

    let checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[2]);

    rerender(
      <PreguntaForm
        pregunta={pregunta}
        respuestasSeleccionadas={new Set(['opcion-1', 'opcion-3'])}
        onSeleccionar={mockOnSeleccionar}
        onDeseleccionar={mockOnDeseleccionar}
      />
    );

    checkboxes = screen.getAllByRole('checkbox');
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[2] as HTMLInputElement).checked).toBe(true);
  });
});
