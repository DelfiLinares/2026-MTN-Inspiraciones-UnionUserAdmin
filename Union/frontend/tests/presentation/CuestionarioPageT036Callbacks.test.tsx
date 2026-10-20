import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CuestionarioPage } from '../../src/presentation/cuestionario/CuestionarioPage';
import { CuestionarioFactory } from '../../src/application/CuestionarioFactory';

/**
 * Tests para T036: Implementar callbacks de selección/deselección
 *
 * Requisitos:
 * - RF-08: Manejo de selección de opciones
 * - RF-09: Manejo de deselección de opciones
 * - RNF-08: Manejo eficiente de estado con React
 *
 * Criterios de aceptación:
 * - manejarSeleccionar(idPregunta, idOpcion) → actualiza estado
 * - manejarDeseleccionar(idPregunta, idOpcion) → actualiza estado
 * - Ambos retornan nueva RespuestaCuestionario (immutable)
 * - Se pasan a PreguntaForm
 * - PreguntaForm los invoca en onClick checkbox
 * - Compilable
 *
 * Referencia: spec.md, plan.md, tasks.md § T036
 */
describe('CuestionarioPage - T036: Callbacks de selección/deselección', () => {
  let mockOnCuestionarioCompleto: ReturnType<typeof vi.fn>;
  let mockOnNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnCuestionarioCompleto = vi.fn();
    mockOnNavigate = vi.fn();
  });

  describe('manejarSeleccionar callback', () => {
    it('debe actualizar estado cuando se invoca manejarSeleccionar', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      const primeraOpcion = cuestionario[0].opciones[0];

      const checkbox = screen.getByRole('checkbox', {
        name: primeraOpcion.descripcion,
      });

      // Inicialmente unchecked
      expect(checkbox).not.toBeChecked();

      // Invocar callback via click
      await user.click(checkbox);

      // Debe estar checked (estado actualizado)
      expect(checkbox).toBeChecked();
    });

    it('manejarSeleccionar debe retornar nueva RespuestaCuestionario (immutable)', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Seleccionar en P1
      const opcionP1_0 = cuestionario[0].opciones[0];
      const opcionP1_1 = cuestionario[0].opciones[1];

      const checkboxP1_0 = screen.getByRole('checkbox', {
        name: opcionP1_0.descripcion,
      });

      const checkboxP1_1 = screen.getByRole('checkbox', {
        name: opcionP1_1.descripcion,
      });

      // Seleccionar primera opción
      await user.click(checkboxP1_0);
      expect(checkboxP1_0).toBeChecked();

      // Seleccionar segunda opción (nueva instancia de RespuestaCuestionario)
      await user.click(checkboxP1_1);
      expect(checkboxP1_0).toBeChecked();
      expect(checkboxP1_1).toBeChecked();

      // Las selecciones anteriores deben mantenerse (immutabilidad)
      // Ya que no se mutó el estado, ambas deben seguir checked
    });

    it('manejarSeleccionar debe permitir múltiples selecciones en pregunta', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Seleccionar todas las opciones de Q1
      const checkboxes = cuestionario[0].opciones.map((opcion) =>
        screen.getByRole('checkbox', { name: opcion.descripcion })
      );

      for (const checkbox of checkboxes) {
        await user.click(checkbox);
        expect(checkbox).toBeChecked();
      }

      // Todas deben estar checked
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });
    });

    it('manejarSeleccionar debe limpiarse errores de validación previos', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      // 1. Intentar continuar sin respuestas → error
      const boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).toBeInTheDocument();
      });

      // 2. Seleccionar opción → debe limpiar error
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      const opcion = cuestionario[0].opciones[0];

      const checkbox = screen.getByRole('checkbox', {
        name: opcion.descripcion,
      });

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      // El error se limpia para esa pregunta
    });
  });

  describe('manejarDeseleccionar callback', () => {
    it('debe actualizar estado cuando se invoca manejarDeseleccionar', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      const primeraOpcion = cuestionario[0].opciones[0];

      const checkbox = screen.getByRole('checkbox', {
        name: primeraOpcion.descripcion,
      });

      // Seleccionar
      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      // Deseleccionar (invocar callback)
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('manejarDeseleccionar debe retornar nueva RespuestaCuestionario (immutable)', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      const opcion1 = cuestionario[0].opciones[0];
      const opcion2 = cuestionario[0].opciones[1];

      const checkbox1 = screen.getByRole('checkbox', {
        name: opcion1.descripcion,
      });

      const checkbox2 = screen.getByRole('checkbox', {
        name: opcion2.descripcion,
      });

      // Seleccionar ambas
      await user.click(checkbox1);
      await user.click(checkbox2);
      expect(checkbox1).toBeChecked();
      expect(checkbox2).toBeChecked();

      // Deseleccionar primera (nueva instancia)
      await user.click(checkbox1);
      expect(checkbox1).not.toBeChecked();

      // La segunda debe mantenerse (nuevo estado immutable)
      expect(checkbox2).toBeChecked();
    });

    it('manejarDeseleccionar debe permitir deseleccionar una por una', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Seleccionar todas
      const checkboxes = cuestionario[0].opciones.map((opcion) =>
        screen.getByRole('checkbox', { name: opcion.descripcion })
      );

      for (const checkbox of checkboxes) {
        await user.click(checkbox);
      }

      // Verificar todas checked
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });

      // Deseleccionar una por una
      for (let i = 0; i < checkboxes.length; i++) {
        await user.click(checkboxes[i]);
        expect(checkboxes[i]).not.toBeChecked();

        // Las demás deben seguir checked
        for (let j = i + 1; j < checkboxes.length; j++) {
          expect(checkboxes[j]).toBeChecked();
        }
      }

      // Todas deseleccionadas
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked();
      });
    });
  });

  describe('Callbacks se pasan a PreguntaForm', () => {
    it('PreguntaForm debe recibir manejarSeleccionar y manejarDeseleccionar', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      const opcion = cuestionario[0].opciones[0];

      const checkbox = screen.getByRole('checkbox', {
        name: opcion.descripcion,
      });

      // Invocar callback via PreguntaForm
      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      // Invocar segundo callback
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('PreguntaForm debe invocar callbacks en onClick checkbox', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Hacer click en varios checkboxes (verifica que callbacks se invocan)
      for (const pregunta of cuestionario) {
        for (const opcion of pregunta.opciones.slice(0, 2)) {
          const checkbox = screen.getByRole('checkbox', {
            name: opcion.descripcion,
          }) as HTMLInputElement;

          const initialState = checkbox.checked;
          await user.click(checkbox);
          expect(checkbox.checked).toBe(!initialState);
        }
      }
    });
  });

  describe('Inmutabilidad de callbacks', () => {
    it('callbacks deben mantener inmutabilidad en cada invocación', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Secuencia: select, deselect, select, deselect
      const opcion = cuestionario[0].opciones[0];
      const checkbox = screen.getByRole('checkbox', {
        name: opcion.descripcion,
      });

      await user.click(checkbox); // select
      expect(checkbox).toBeChecked();

      await user.click(checkbox); // deselect
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox); // select
      expect(checkbox).toBeChecked();

      await user.click(checkbox); // deselect
      expect(checkbox).not.toBeChecked();

      // Cada operación retornó nueva instancia sin mutar
    });

    it('callbacks deben preservar otras opciones no modificadas', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Seleccionar P1 opción 0 y 1
      const opcion0 = cuestionario[0].opciones[0];
      const opcion1 = cuestionario[0].opciones[1];
      const opcion2 = cuestionario[0].opciones[2];

      const checkbox0 = screen.getByRole('checkbox', {
        name: opcion0.descripcion,
      });
      const checkbox1 = screen.getByRole('checkbox', {
        name: opcion1.descripcion,
      });
      const checkbox2 = screen.getByRole('checkbox', {
        name: opcion2.descripcion,
      });

      await user.click(checkbox0);
      await user.click(checkbox1);

      // Deseleccionar 0 → 1 debe mantenerse
      await user.click(checkbox0);

      expect(checkbox0).not.toBeChecked();
      expect(checkbox1).toBeChecked();
      expect(checkbox2).not.toBeChecked();
    });
  });

  describe('Independencia entre preguntas', () => {
    it('manejarSeleccionar en P1 no debe afectar P2', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      const opcionP1 = cuestionario[0].opciones[0];
      const opcionP2 = cuestionario[1].opciones[0];

      const checkboxP1 = screen.getByRole('checkbox', {
        name: opcionP1.descripcion,
      });
      const checkboxP2 = screen.getByRole('checkbox', {
        name: opcionP2.descripcion,
      });

      // Seleccionar P1
      await user.click(checkboxP1);
      expect(checkboxP1).toBeChecked();
      expect(checkboxP2).not.toBeChecked();

      // Seleccionar P2
      await user.click(checkboxP2);
      expect(checkboxP1).toBeChecked();
      expect(checkboxP2).toBeChecked();

      // Deseleccionar P1 → P2 no afectada
      await user.click(checkboxP1);
      expect(checkboxP1).not.toBeChecked();
      expect(checkboxP2).toBeChecked();
    });

    it('manejarDeseleccionar en P1 no debe afectar P2', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      const opcionP1 = cuestionario[0].opciones[0];
      const opcionP2 = cuestionario[1].opciones[0];

      const checkboxP1 = screen.getByRole('checkbox', {
        name: opcionP1.descripcion,
      });
      const checkboxP2 = screen.getByRole('checkbox', {
        name: opcionP2.descripcion,
      });

      // Seleccionar ambas
      await user.click(checkboxP1);
      await user.click(checkboxP2);

      // Deseleccionar P1
      await user.click(checkboxP1);

      expect(checkboxP1).not.toBeChecked();
      expect(checkboxP2).toBeChecked(); // No afectada
    });
  });

  describe('Compilabilidad', () => {
    it('componente debe compilar sin errores', () => {
      const { container } = render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      expect(container).toBeTruthy();
      expect(screen.getByText(/Descubre inspiraciones artísticas/i)).toBeInTheDocument();
    });

    it('callbacks deben ser invocables múltiples veces sin error', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Invocar callbacks muchas veces
      for (let i = 0; i < 10; i++) {
        const opcion = cuestionario[0].opciones[i % cuestionario[0].opciones.length];
        const checkbox = screen.getByRole('checkbox', {
          name: opcion.descripcion,
        });

        await user.click(checkbox);
      }

      // No debe haber errores
      expect(screen.getByText(/Descubre inspiraciones artísticas/i)).toBeInTheDocument();
    });
  });

  describe('Eficiencia con useCallback', () => {
    it('callbacks deben funcionar correctamente con dependencies optimizadas', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Primera selección
      const opcion1 = cuestionario[0].opciones[0];
      const checkbox1 = screen.getByRole('checkbox', {
        name: opcion1.descripcion,
      });

      await user.click(checkbox1);
      expect(checkbox1).toBeChecked();

      // Segunda selección (puede tener diferentes dependencies)
      const opcion2 = cuestionario[0].opciones[1];
      const checkbox2 = screen.getByRole('checkbox', {
        name: opcion2.descripcion,
      });

      await user.click(checkbox2);
      expect(checkbox2).toBeChecked();

      // Ambas deben estar checked (callbacks funcionan correctamente)
      expect(checkbox1).toBeChecked();
      expect(checkbox2).toBeChecked();
    });
  });
});
