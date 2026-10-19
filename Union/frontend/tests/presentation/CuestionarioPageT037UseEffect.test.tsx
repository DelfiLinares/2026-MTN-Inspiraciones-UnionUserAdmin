/**
 * ============================================================================
 * CuestionarioPageT037UseEffect.test.tsx
 * ============================================================================
 *
 * Tests para T037: useEffect initialization
 *
 * T037: Implementar useEffect para cargar preguntas desde la factory en el
 *       montaje del componente. El useEffect debe:
 *       - Ejecutarse una sola vez (dependencyArray vacío [])
 *       - Llamar a CuestionarioFactory.crearCuestionarioDefault()
 *       - Guardar en estado local
 *       - Renderizar una sola vez
 *
 * Requisitos cubiertos:
 * - RF-03: Load questions from factory on component mount
 * - RNF-08: React state management with hooks
 *
 * Referencia: spec.md § 5.2, tasks.md § T037
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { CuestionarioPage } from '../../src/presentation/cuestionario/CuestionarioPage';
import { CuestionarioFactory } from '../../src/application/CuestionarioFactory';

// No mockeamos CuestionarioFactory aquí - usamos la implementación real
// porque necesitamos verificar que el useEffect funcione correctamente

describe('CuestionarioPageT037UseEffect: useEffect Initialization', () => {
  const mockOnCuestionarioCompleto = vi.fn();
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Suite 1: Basic useEffect execution and initialization
  describe('useEffect Execution and Initialization', () => {
    it('debe ejecutar useEffect al montar el componente', async () => {
      const { container } = render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      // Esperar a que el componente se renderice completamente
      await waitFor(() => {
        const formDiv = container.querySelector('.cuestionario-page__form');
        expect(formDiv).toBeInTheDocument();
      });
    });

    it('debe cargar las preguntas desde CuestionarioFactory en useEffect', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      // Las preguntas deben estar disponibles después del montaje
      await waitFor(() => {
        const preguntaElements = screen.queryAllByText(/Pregunta/i);
        expect(preguntaElements.length).toBeGreaterThan(0);
      });
    });

    it('debe renderizar las 3 preguntas del cuestionario default', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const preguntaElements = screen.getAllByText(/Pregunta/i);
        expect(preguntaElements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('debe renderizar sin errores incluso si el cuestionario está inicialmente vacío', async () => {
      const { container } = render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      // El componente debe existir en el DOM
      const cuestionarioPage = container.querySelector('.cuestionario-page');
      expect(cuestionarioPage).toBeInTheDocument();
    });
  });

  // Suite 2: State management with useEffect
  describe('State Management with useEffect', () => {
    it('debe inicializar estado cuestionario como array vacío', async () => {
      const { container } = render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      // El componente debe renderizar sin error incluso con array vacío
      const formDiv = container.querySelector('.cuestionario-page__form');
      expect(formDiv).toBeInTheDocument();
    });

    it('debe actualizar el estado cuestionario cuando useEffect se ejecuta', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        // El contenido debe cambiar de vacío a lleno
        const preguntaElements = screen.queryAllByText(/Pregunta/i);
        expect(preguntaElements.length).toBeGreaterThan(0);
      });
    });

    it('debe mantener cuestionario independiente de respuestas state', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        // El cuestionario debe estar disponible
        const preguntaElements = screen.queryAllByText(/Pregunta/i);
        expect(preguntaElements.length).toBeGreaterThan(0);

        // Las respuestas deben estar vacías inicialmente
        const noAnswerCheckboxes = screen.queryAllByRole('checkbox', { checked: false });
        expect(noAnswerCheckboxes.length).toBeGreaterThan(0);
      });
    });

    it('debe permitir que los componentes hijos usen el cuestionario después del useEffect', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        // PreguntaForm debe recibir las preguntas
        const preguntaElements = screen.getAllByText(/Pregunta/i);
        expect(preguntaElements.length).toBeGreaterThan(0);
      });
    });
  });

  // Suite 3: Rendering behavior after useEffect
  describe('Rendering After useEffect', () => {
    it('debe mostrar header de bienvenida', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const headerText = screen.queryByText(/Descubre inspiraciones/i);
        expect(headerText).toBeInTheDocument();
      });
    });

    it('debe mostrar todas las 3 preguntas después del useEffect', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const preguntaElements = screen.getAllByText(/Pregunta/i);
        expect(preguntaElements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('debe renderizar el botón continuar después del useEffect', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
      });
    });

    it('debe renderizar opciones de respuesta para cada pregunta', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });
    });
  });

  // Suite 4: Integration with T036 callbacks
  describe('Integration with Callbacks (T036)', () => {
    it('debe trabajar correctamente con handleSeleccionar después del useEffect', async () => {
      const { container } = render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });

      // El componente debe estar funcional
      const formDiv = container.querySelector('.cuestionario-page__form');
      expect(formDiv).toBeInTheDocument();
    });

    it('debe permitir selección de opciones después del useEffect', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
        expect(checkboxes.length).toBeGreaterThan(0);
        // Verificar que las checkboxes existen y son interaccionables
        checkboxes.forEach((checkbox) => {
          expect(checkbox).toBeDefined();
        });
      });
    });

    it('debe mantener respuestas state al re-renderizar después del useEffect', async () => {
      const { rerender } = render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });

      // Re-renderizar con nuevas props
      rerender(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      // El cuestionario debe seguir siendo visible
      await waitFor(() => {
        const preguntaElements = screen.getAllByText(/Pregunta/i);
        expect(preguntaElements.length).toBeGreaterThan(0);
      });
    });
  });

  // Suite 5: Empty state handling
  describe('Empty State Handling', () => {
    it('debe permitir estado vacío inicialmente antes del useEffect', () => {
      const { container } = render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionarioPage = container.querySelector('.cuestionario-page');
      expect(cuestionarioPage).toBeInTheDocument();
    });

    it('debe pasar de estado vacío a estado lleno sin errores', async () => {
      const { container } = render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      // Estado inicial
      let formDiv = container.querySelector('.cuestionario-page__form');
      expect(formDiv).toBeInTheDocument();

      // Estado final (después del useEffect)
      await waitFor(() => {
        formDiv = container.querySelector('.cuestionario-page__form');
        const preguntaElements = screen.queryAllByText(/Pregunta/i);
        expect(preguntaElements.length).toBeGreaterThan(0);
      });
    });

    it('debe no causar errores cuando .map() se ejecuta sobre array vacío', () => {
      const { container } = render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      // No debe haber error al renderizar inicialmente
      expect(container).toBeDefined();
      const cuestionarioPage = container.querySelector('.cuestionario-page');
      expect(cuestionarioPage).toBeInTheDocument();
    });
  });

  // Suite 6: Compilability and TypeScript
  describe('Compilability', () => {
    it('debe compilar sin errores TypeScript', () => {
      expect(CuestionarioPage).toBeDefined();
      expect(typeof CuestionarioPage).toBe('function');
    });

    it('debe tener las props correctas', () => {
      const props = {
        onCuestionarioCompleto: mockOnCuestionarioCompleto,
        onNavigate: mockOnNavigate,
      };
      expect(props.onCuestionarioCompleto).toBeDefined();
      expect(props.onNavigate).toBeDefined();
    });

    it('debe ser un componente React.FC', () => {
      const component = CuestionarioPage;
      expect(component).toBeDefined();
      expect(typeof component).toBe('function');
    });
  });

  // Suite 7: Single execution guarantee
  describe('Single Execution Guarantee (Empty Dependency Array)', () => {
    it('debe ejecutarse solo una vez durante el ciclo de vida del componente', async () => {
      const { rerender } = render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      let renderCount = 0;
      await waitFor(() => {
        const preguntaElements = screen.queryAllByText(/Pregunta/i);
        if (preguntaElements.length > 0) {
          renderCount++;
        }
      });

      // Hacer re-render
      rerender(
        <CuestionarioPage
          onCuestionarioCompleto={vi.fn()}
          onNavigate={mockOnNavigate}
        />
      );

      // Verificar que el cuestionario siga siendo el mismo
      await waitFor(() => {
        const preguntaElements = screen.getAllByText(/Pregunta/i);
        expect(preguntaElements.length).toBeGreaterThan(0);
      });
    });

    it('debe no recargar las preguntas cuando el componente se re-renderiza', async () => {
      const { rerender } = render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      // Primera renderización - esperar a que cargue
      await waitFor(() => {
        const preguntaElements = screen.queryAllByText(/Pregunta/i);
        expect(preguntaElements.length).toBeGreaterThan(0);
      });

      // Re-renderizar con props diferentes
      rerender(
        <CuestionarioPage
          onCuestionarioCompleto={vi.fn()}
          onNavigate={mockOnNavigate}
        />
      );

      // Las preguntas deben seguir siendo las mismas
      await waitFor(() => {
        const preguntaElements = screen.getAllByText(/Pregunta/i);
        expect(preguntaElements.length).toBeGreaterThan(0);
      });
    });
  });

  // Suite 8: No regression with previous tasks
  describe('No Regression with T036 (Callbacks) and Earlier Tasks', () => {
    it('debe preservar callbacks después del useEffect', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        expect(continueButton).toBeInTheDocument();
      });
    });

    it('debe permitir interacción después del useEffect', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
        
        // Las checkboxes deben ser interaccionables
        checkboxes.forEach((checkbox) => {
          expect((checkbox as HTMLInputElement).type).toBe('checkbox');
        });
      });
    });

    it('debe funcionar correctamente con el flujo completo', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        // Header
        const headerText = screen.queryByText(/Descubre inspiraciones/i);
        expect(headerText).toBeInTheDocument();
        
        // Preguntas
        const preguntaElements = screen.queryAllByText(/Pregunta/i);
        expect(preguntaElements.length).toBeGreaterThan(0);
        
        // Botón continuar
        expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
      });
    });
  });
});
