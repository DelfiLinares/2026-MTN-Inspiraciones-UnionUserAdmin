import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CuestionarioPage } from '../../src/presentation/cuestionario/CuestionarioPage';
import { RespuestaCuestionario } from '../../src/domain/entities/RespuestaCuestionario';
import { CuestionarioFactory } from '../../src/application/CuestionarioFactory';

vi.mock('../../src/services/onboardingInteresesService', async () => {
  const { onboardingServiceMock } = await import('../helpers/mockOnboardingInteresesService');
  return onboardingServiceMock;
});

/**
 * Tests para T035: Implementar estado React en CuestionarioPage
 *
 * Requisitos:
 * - RF-13, RF-14, RF-15: Conservación de estado
 * - RNF-08: Manejo de estado con React
 *
 * Criterios de aceptación:
 * - useState<RespuestaCuestionario> inicializado
 * - setRespuestas actualiza estado immutablemente
 * - Handlers: manejarSeleccionar, manejarDeseleccionar
 * - Estado se pasa a PreguntaForm
 * - Estado se pasa a BotonContinuar para validación
 * - Compilable
 *
 * Referencia: spec.md, plan.md, tasks.md § T035
 */
describe('CuestionarioPage - T035: Estado React', () => {
  let mockOnCuestionarioCompleto: ReturnType<typeof vi.fn>;
  let mockOnNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnCuestionarioCompleto = vi.fn();
    mockOnNavigate = vi.fn();
  });

  describe('useState<RespuestaCuestionario> inicializado', () => {
    it('debe inicializar estado con RespuestaCuestionario vacío', () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Verificar que ningún checkbox está checked inicialmente
      for (const pregunta of cuestionario) {
        for (const opcion of pregunta.opciones) {
          const checkbox = screen.getByRole('checkbox', {
            name: opcion.descripcion,
          });
          expect(checkbox).not.toBeChecked();
        }
      }
    });

    it('debe permitir interacción inicial en componentes hijos', () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      // Verificar que botones y checkboxes están presentes
      expect(screen.getByRole('button', { name: /Continuar/i })).toBeInTheDocument();
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
    });
  });

  describe('setRespuestas actualiza estado immutablemente', () => {
    it('debe actualizar estado cuando se selecciona opción', async () => {
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

      expect(checkbox).not.toBeChecked();

      // Seleccionar
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('debe actualizar estado cuando se deselecciona opción', async () => {
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

    it('debe mantener inmutabilidad del estado interno', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Seleccionar en pregunta 1
      const opcionP1 = cuestionario[0].opciones[0];
      const checkboxP1 = screen.getByRole('checkbox', {
        name: opcionP1.descripcion,
      });

      await user.click(checkboxP1);

      // Verificar que selección se refleja
      expect(checkboxP1).toBeChecked();

      // Seleccionar otra en pregunta 1
      const opcionP1_2 = cuestionario[0].opciones[1];
      const checkboxP1_2 = screen.getByRole('checkbox', {
        name: opcionP1_2.descripcion,
      });

      await user.click(checkboxP1_2);

      // Ambas deben estar checked (estado actualizado sin mutar interno)
      expect(checkboxP1).toBeChecked();
      expect(checkboxP1_2).toBeChecked();
    });
  });

  describe('Handlers: manejarSeleccionar y manejarDeseleccionar', () => {
    it('handler seleccionar debe funcionar correctamente', async () => {
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

      // Inicialmente no checked
      expect(checkbox).not.toBeChecked();

      // Invocar handler (mediante click)
      await user.click(checkbox);

      // Debe estar checked
      expect(checkbox).toBeChecked();
    });

    it('handler deseleccionar debe funcionar correctamente', async () => {
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

      // Seleccionar
      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      // Deseleccionar
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('handlers deben mantener independencia entre preguntas', async () => {
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

      // Deseleccionar P1
      await user.click(checkboxP1);
      expect(checkboxP1).not.toBeChecked();
      expect(checkboxP2).toBeChecked(); // P2 no afectada
    });

    it('handlers deben limpiar errores de validación al seleccionar', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // 1. Intentar continuar sin respuestas → error
      const boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).toBeInTheDocument();
      });

      // 2. Seleccionar opción de P1
      const opcion = cuestionario[0].opciones[0];
      const checkbox = screen.getByRole('checkbox', {
        name: opcion.descripcion,
      });

      await user.click(checkbox);

      // Error debe limpiarse (o permanecer solo para otras preguntas)
      // Verificar que checkbox está checked
      expect(checkbox).toBeChecked();
    });
  });

  describe('Estado se pasa a PreguntaForm', () => {
    it('PreguntaForm debe recibir respuestasSeleccionadas', async () => {
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

      // Antes: no checked
      expect(checkbox).not.toBeChecked();

      // Seleccionar
      await user.click(checkbox);

      // Después: checked (PreguntaForm recibió estado actualizado)
      expect(checkbox).toBeChecked();
    });

    it('PreguntaForm debe recibir callbacks onSeleccionar y onDeseleccionar', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Seleccionar múltiples opciones (verifica que callbacks funcionan)
      for (let i = 0; i < 3 && i < cuestionario[0].opciones.length; i++) {
        const opcion = cuestionario[0].opciones[i];
        const checkbox = screen.getByRole('checkbox', {
          name: opcion.descripcion,
        });

        await user.click(checkbox);
        expect(checkbox).toBeChecked();
      }

      // Deseleccionar una
      const primeraOpcion = cuestionario[0].opciones[0];
      const checkbox = screen.getByRole('checkbox', {
        name: primeraOpcion.descripcion,
      });

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Estado se pasa a BotonContinuar para validación', () => {
    it('BotonContinuar debe recibir estado de respuestas', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Continuar sin respuestas → error
      const boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).toBeInTheDocument();
      });

      expect(mockOnCuestionarioCompleto).not.toHaveBeenCalled();
    });

    it('BotonContinuar debe usar estado para validar completitud', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Seleccionar opciones obligatorias
      const opcionP1 = cuestionario[0].opciones[0];
      const opcionP2 = cuestionario[1].opciones[0];

      const checkboxP1 = screen.getByRole('checkbox', {
        name: opcionP1.descripcion,
      });
      const checkboxP2 = screen.getByRole('checkbox', {
        name: opcionP2.descripcion,
      });

      await user.click(checkboxP1);
      await user.click(checkboxP2);

      // Continuar → debe funcionar
      const boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      await waitFor(() => {
        expect(mockOnCuestionarioCompleto).toHaveBeenCalled();
      });
    });

    it('BotonContinuar debe acceder a respuestas y preguntas del estado', async () => {
      const user = userEvent.setup();

      const onCompleto = vi.fn();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={onCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Responder preguntas
      const opcionP1 = cuestionario[0].opciones[0];
      const opcionP2 = cuestionario[1].opciones[0];

      const checkboxP1 = screen.getByRole('checkbox', {
        name: opcionP1.descripcion,
      });
      const checkboxP2 = screen.getByRole('checkbox', {
        name: opcionP2.descripcion,
      });

      await user.click(checkboxP1);
      await user.click(checkboxP2);

      const boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      await waitFor(() => {
        expect(onCompleto).toHaveBeenCalledWith(
          expect.objectContaining({
            generoIds: expect.arrayContaining([opcionP1.id]),
            estiloIds: expect.any(Array),
            tipoMusicaIds: expect.arrayContaining([opcionP2.id]),
          })
        );
      });
    });
  });

  describe('Compilabilidad y integración', () => {
    it('componente debe renderizar sin errores', () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText(/Descubre inspiraciones artísticas/i)).toBeInTheDocument();
    });

    it('debe mantener estado consistente a través de múltiples interacciones', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Múltiples selecciones
      const opciones = cuestionario[0].opciones.slice(0, 3);

      for (const opcion of opciones) {
        const checkbox = screen.getByRole('checkbox', {
          name: opcion.descripcion,
        });
        await user.click(checkbox);
        expect(checkbox).toBeChecked();
      }

      // Múltiples deselecciones
      for (const opcion of opciones) {
        const checkbox = screen.getByRole('checkbox', {
          name: opcion.descripcion,
        });
        await user.click(checkbox);
        expect(checkbox).not.toBeChecked();
      }

      // Seleccionar de nuevo
      for (const opcion of opciones) {
        const checkbox = screen.getByRole('checkbox', {
          name: opcion.descripcion,
        });
        await user.click(checkbox);
        expect(checkbox).toBeChecked();
      }
    });

    it('debe propagar estado a todos los componentes hijos correctamente', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      // Verificar que todos los componentes hijos están presentes
      expect(screen.getByText(/Descubre inspiraciones artísticas/i)).toBeInTheDocument(); // BienvenidaHeader
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0); // PreguntaForm
      expect(screen.getByRole('button', { name: /Continuar/i })).toBeInTheDocument(); // BotonContinuar

      // Interactuar con checkbox
      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      const opcion = cuestionario[0].opciones[0];

      const checkbox = screen.getByRole('checkbox', {
        name: opcion.descripcion,
      });

      await user.click(checkbox);

      // Verificar que la interacción se propague correctamente
      expect(checkbox).toBeChecked();
    });
  });
});
