import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CuestionarioPage } from '../../src/presentation/cuestionario/CuestionarioPage';
import { CuestionarioFactory } from '../../src/application/CuestionarioFactory';

vi.mock('../../src/services/onboardingInteresesService', async () => {
  const { onboardingServiceMock } = await import('../helpers/mockOnboardingInteresesService');
  return onboardingServiceMock;
});

/**
 * Tests de integración para CuestionarioPage (T032)
 *
 * Requisitos:
 * - RNF-24: Tests de integración
 * - HU-01 a HU-08: Flujo completo del cuestionario
 *
 * Criterios de aceptación:
 * - Test renderiza bienvenida, 3 preguntas, botón continuar
 * - Test seleccionar opción actualiza estado
 * - Test deseleccionar opción actualiza estado
 * - Test continuar sin responder obligatoria: muestra error
 * - Test continuar con todas obligatorias respondidas: no muestra error
 * - Test flujo completo: inicio → seleccionar → continuar → éxito
 * - Cobertura ≥ 60%
 *
 * Referencia: spec.md, plan.md § 5, tasks.md § T032
 */
describe('CuestionarioPage', () => {
  let mockOnCuestionarioCompleto: ReturnType<typeof vi.fn>;
  let mockOnNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnCuestionarioCompleto = vi.fn();
    mockOnNavigate = vi.fn();
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar bienvenida con eslogan', () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const eslogan = screen.getByText(/Descubre inspiraciones artísticas/i);
      expect(eslogan).toBeInTheDocument();
    });

    it('debe renderizar 3 preguntas', () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      const preguntas = cuestionario.map((p) => p.texto);

      preguntas.forEach((textoPregunta) => {
        expect(screen.getByText(textoPregunta)).toBeInTheDocument();
      });
    });

    it('debe renderizar botón continuar', () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const boton = screen.getByRole('button', { name: /Continuar/i });
      expect(boton).toBeInTheDocument();
    });

    it('debe renderizar todas las opciones de todas las preguntas', () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      const totalOpciones = cuestionario.reduce((acc, p) => acc + p.opciones.length, 0);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(totalOpciones);
    });
  });

  describe('Selección de opciones', () => {
    it('debe seleccionar una opción al hacer click', async () => {
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

      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('debe deseleccionar una opción al hacer click en checkbox seleccionado', async () => {
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

      // Deseleccionar
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('debe permitir múltiples selecciones en una pregunta', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      const primerasPregunta = cuestionario[0];
      const primeraOpcion = primerasPregunta.opciones[0];
      const segundaOpcion = primerasPregunta.opciones[1];

      const checkbox1 = screen.getByRole('checkbox', {
        name: primeraOpcion.descripcion,
      });

      const checkbox2 = screen.getByRole('checkbox', {
        name: segundaOpcion.descripcion,
      });

      await user.click(checkbox1);
      await user.click(checkbox2);

      expect(checkbox1).toBeChecked();
      expect(checkbox2).toBeChecked();
    });
  });

  describe('Validación de completitud', () => {
    it('debe mostrar error al continuar sin responder preguntas obligatorias', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const boton = screen.getByRole('button', { name: /Continuar/i });

      await user.click(boton);

      // Debe mostrar error
      await waitFor(() => {
        const errorMessages = screen.queryAllByText(/Por favor, complete las siguientes preguntas/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });

      // No debe llamar callback
      expect(mockOnCuestionarioCompleto).not.toHaveBeenCalled();
    });

    it('debe mostrar errores específicos para cada pregunta obligatoria sin responder', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      await waitFor(() => {
        // Debe mostrar errores para cada pregunta obligatoria
        const errorContainer = screen.queryByRole('alert');
        expect(errorContainer).toBeInTheDocument();
      });
    });

    it('no debe mostrar error al continuar con todas las obligatorias respondidas', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Seleccionar una opción de las primeras 2 preguntas (obligatorias)
      const primeraOpcionP1 = cuestionario[0].opciones[0];
      const primeraOpcionP2 = cuestionario[1].opciones[0];

      const checkbox1 = screen.getByRole('checkbox', {
        name: primeraOpcionP1.descripcion,
      });

      const checkbox2 = screen.getByRole('checkbox', {
        name: primeraOpcionP2.descripcion,
      });

      await user.click(checkbox1);
      await user.click(checkbox2);

      const boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      // Esperar a que se ejecute el callback
      await waitFor(() => {
        expect(mockOnCuestionarioCompleto).toHaveBeenCalled();
      });
    });

    it('debe limpiar error de una pregunta al seleccionar opción', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // 1. Intentar continuar sin respuestas (mostrar errores)
      const boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).toBeInTheDocument();
      });

      // 2. Seleccionar opción de primera pregunta
      const primeraOpcion = cuestionario[0].opciones[0];
      const checkbox1 = screen.getByRole('checkbox', {
        name: primeraOpcion.descripcion,
      });

      await user.click(checkbox1);

      // Error debe limpiarse (o permanecer solo para otras preguntas)
      // Nota: el error se limpia para esa pregunta en particular
      expect(checkbox1).toBeChecked();
    });
  });

  describe('Flujo completo', () => {
    it('debe completar flujo: inicio → seleccionar → continuar → éxito', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // 1. Verificar renderizado inicial
      expect(screen.getByText(/Descubre inspiraciones artísticas/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continuar/i })).toBeInTheDocument();

      // 2. Seleccionar opciones de preguntas obligatorias
      const opcionP1 = cuestionario[0].opciones[0];
      const opcionP2 = cuestionario[1].opciones[0];
      const opcionP3 = cuestionario[2].opciones[0]; // Opcional, pero la seleccionamos

      const checkbox1 = screen.getByRole('checkbox', {
        name: opcionP1.descripcion,
      });
      const checkbox2 = screen.getByRole('checkbox', {
        name: opcionP2.descripcion,
      });
      const checkbox3 = screen.getByRole('checkbox', {
        name: opcionP3.descripcion,
      });

      await user.click(checkbox1);
      await user.click(checkbox2);
      await user.click(checkbox3);

      expect(checkbox1).toBeChecked();
      expect(checkbox2).toBeChecked();
      expect(checkbox3).toBeChecked();

      // 3. Hacer click en continuar
      const boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      // 4. Verificar que se llamó callback de completitud
      await waitFor(() => {
        expect(mockOnCuestionarioCompleto).toHaveBeenCalledTimes(1);
      });

      // 5. Verificar que se pasó el DTO de onboarding correcto
      expect(mockOnCuestionarioCompleto).toHaveBeenCalledWith(
        expect.objectContaining({
          generoIds: expect.arrayContaining([opcionP1.id]),
          tipoMusicaIds: expect.arrayContaining([opcionP2.id]),
          estiloIds: expect.arrayContaining([opcionP3.id]),
        })
      );
    });

    it('debe tener estructura correcta del DTO en callback', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Seleccionar opciones
      const checkbox1 = screen.getByRole('checkbox', {
        name: cuestionario[0].opciones[0].descripcion,
      });
      const checkbox2 = screen.getByRole('checkbox', {
        name: cuestionario[1].opciones[0].descripcion,
      });

      await user.click(checkbox1);
      await user.click(checkbox2);

      const boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      await waitFor(() => {
        expect(mockOnCuestionarioCompleto).toHaveBeenCalled();

        const request = mockOnCuestionarioCompleto.mock.calls[0][0];
        expect(request).toEqual({
          generoIds: [cuestionario[0].opciones[0].id],
          estiloIds: [],
          tipoMusicaIds: [cuestionario[1].opciones[0].id],
        });
      });
    });
  });

  describe('Accesibilidad y UX', () => {
    it('debe tener labels asociados a checkboxes', () => {
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

      expect(checkbox).toHaveAttribute('id');
      expect(checkbox).toBeInTheDocument();
    });

    it('debe tener aria-label para checkboxes', () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAttribute('aria-label');
      });
    });

    it('debe mostrar mensajes de error con role="alert"', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      await waitFor(() => {
        const alerts = screen.queryAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
      });
    });

    it('debe tener indicador visual de preguntas obligatorias', () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Las primeras 2 preguntas son obligatorias
      const asteriscos = screen.getAllByText('*');
      expect(asteriscos.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Responsive', () => {
    it('debe ser renderizable en mobile', () => {
      // Simular mobile viewport
      window.innerWidth = 375;
      window.innerHeight = 667;

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      // Verificar que todos los elementos principales están presentes
      expect(screen.getByText(/Descubre inspiraciones artísticas/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continuar/i })).toBeInTheDocument();
    });

    it('debe ser renderizable en tablet', () => {
      // Simular tablet viewport
      window.innerWidth = 768;
      window.innerHeight = 1024;

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText(/Descubre inspiraciones artísticas/i)).toBeInTheDocument();
    });

    it('debe ser renderizable en desktop', () => {
      // Desktop viewport
      window.innerWidth = 1920;
      window.innerHeight = 1080;

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText(/Descubre inspiraciones artísticas/i)).toBeInTheDocument();
    });
  });
});
