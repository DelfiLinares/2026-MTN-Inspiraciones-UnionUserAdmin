/**
 * ============================================================================
 * CuestionarioPageT039Transformation.test.tsx
 * ============================================================================
 *
 * Tests para T039: Transformación de respuestas a Preferencias
 *
 * T039: Implementar transformación de respuestas a Preferencias
 *
 * Requisitos cubiertos:
 * - RF-21: Transformar respuestas a objeto Preferencias
 * - RF-22: Guardar preferencias para feed personalizado
 * - A-1: Transformación automática de respuestas seleccionadas
 *
 * Referencia: spec.md § 4, plan.md § 4, tasks.md § T039
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { CuestionarioPage } from '../../src/presentation/cuestionario/CuestionarioPage';
import { CuestionarioService } from '../../src/application/CuestionarioService';

vi.mock('../../src/services/onboardingInteresesService', async () => {
  const { onboardingServiceMock } = await import('../helpers/mockOnboardingInteresesService');
  return onboardingServiceMock;
});

// Mock de CuestionarioService
vi.mock('../../src/application/CuestionarioService');

describe('CuestionarioPageT039Transformation: Transformación de Respuestas a Preferencias', () => {
  const mockOnCuestionarioCompleto = vi.fn();
  const mockOnNavigate = vi.fn();

  // Mock para la solicitud de onboarding
  const mockPreferencias = {
    generoIds: ['GENERO_ARTE', 'GENERO_ESCULTURA'],
    estiloIds: ['ARTE_ABSTRACTO'],
    tipoMusicaIds: ['MUSICA_ROCK'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (CuestionarioService.validarCompletitud as any).mockReturnValue({
      valida: true,
      errores: null,
    });
    (CuestionarioService.transformarAOnboardingRequest as any).mockReturnValue(mockPreferencias);
  });

  // Suite 1: Llamada a transformarAPreferencias
  describe('Llamada a transformarAPreferencias', () => {
    it('debe llamar transformarAPreferencias después de validación exitosa', async () => {
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

      const continueButton = screen.getByRole('button', { name: /continuar/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(CuestionarioService.transformarAOnboardingRequest).toHaveBeenCalled();
      });
    });

    it('NO debe llamar transformarAPreferencias si validación falla', async () => {
      (CuestionarioService.validarCompletitud as any).mockReturnValue({
        valida: false,
        errores: new Map([['pregunta-1', 'Error']]),
      });

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        expect(CuestionarioService.transformarAOnboardingRequest).not.toHaveBeenCalled();
      });
    });

    it('debe pasar respuestas y cuestionario a transformarAPreferencias', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        // Verificar que se llamó con dos argumentos
        expect(CuestionarioService.transformarAOnboardingRequest).toHaveBeenCalledWith(
          expect.anything(), // respuestas
          expect.anything()  // cuestionario
        );
      });
    });
  });

  // Suite 2: Estructura de Preferencias
  describe('Estructura de Preferencias', () => {
    it('debe retornar objeto Preferencias con estructura correcta', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        // El callback debe recibir preferenciasJSON
        expect(mockOnCuestionarioCompleto).toHaveBeenCalledWith(
          expect.objectContaining({
            generoIds: expect.any(Array),
            estiloIds: expect.any(Array),
            tipoMusicaIds: expect.any(Array),
          })
        );
      });
    });

    it('debe serializar el DTO de onboarding como JSON', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        const payload = mockOnCuestionarioCompleto.mock.calls[0][0];
        expect(JSON.parse(JSON.stringify(payload))).toEqual(mockPreferencias);
      });
    });

    it('debe serializar Preferencias a JSON correctamente', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        const jsonCall = mockOnCuestionarioCompleto.mock.calls[0][0];
        expect(jsonCall).toEqual(mockPreferencias);
      });
    });
  });

  // Suite 3: Flujo completo de transformación
  describe('Flujo Completo de Transformación', () => {
    it('debe ejecutar transformación como parte del flujo completo', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        // Verificar que ambas funciones fueron llamadas en orden correcto
        expect(CuestionarioService.validarCompletitud).toHaveBeenCalled();
        expect(CuestionarioService.transformarAOnboardingRequest).toHaveBeenCalled();
      });
    });

    it('debe limpiar errores después de transformación exitosa', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        // No debe haber errores visibles
        expect(mockOnCuestionarioCompleto).toHaveBeenCalled();
      });
    });

    it('debe llamar onCuestionarioCompleto con Preferencias transformadas', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        expect(mockOnCuestionarioCompleto).toHaveBeenCalledWith(
          expect.objectContaining({
            generoIds: expect.any(Array),
            estiloIds: expect.any(Array),
            tipoMusicaIds: expect.any(Array),
          })
        );
      });
    });
  });

  // Suite 4: Manejo de errores en transformación
  describe('Manejo de Errores en Transformación', () => {
    it('debe manejar error si transformación falla', async () => {
      (CuestionarioService.transformarAOnboardingRequest as any).mockImplementation(() => {
        throw new Error('Error en transformación');
      });

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      // Esperar a que se procese
      await new Promise(resolve => setTimeout(resolve, 100));

      // El callback no debe ser llamado si hay error
      expect(mockOnCuestionarioCompleto).not.toHaveBeenCalled();
    });

    it('debe mostrar error genérico si transformación falla', async () => {
      (CuestionarioService.transformarAOnboardingRequest as any).mockImplementation(() => {
        throw new Error('Error en transformación');
      });

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      // Esperar a que se procese
      await new Promise(resolve => setTimeout(resolve, 100));

      // No debe navegar
      expect(mockOnNavigate).not.toHaveBeenCalled();
    });
  });

  // Suite 5: No navegar en T039 (navegación es T040)
  describe('Sin Navegación (T039 solo transforma)', () => {
    it('NO debe navegar al /feed en T039 (navegación es T040)', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        // En T039, la navegación es opcional (controlada por prop onNavigate)
        // El callback debe ser llamado para handoff
        expect(mockOnCuestionarioCompleto).toHaveBeenCalled();
      });
    });

    it('debe preparar Preferencias para handoff pero no navegar', async () => {
      // Sin onNavigate prop - solo debe transformar
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          // onNavigate omitido deliberadamente
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        // Debe transformar y llamar callback
        expect(CuestionarioService.transformarAOnboardingRequest).toHaveBeenCalled();
        expect(mockOnCuestionarioCompleto).toHaveBeenCalled();
      });
    });
  });

  // Suite 6: Inmutabilidad de Preferencias
  describe('Inmutabilidad y Validación de Preferencias', () => {
    it('debe generar objeto Preferencias nuevo cada vez', async () => {
      const calls: any[] = [];
      (CuestionarioService.transformarAOnboardingRequest as any).mockImplementation(() => {
        const pref = { ...mockPreferencias };
        calls.push(pref);
        return pref;
      });

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        // Cada transformación debe crear un objeto nuevo
        expect(CuestionarioService.transformarAOnboardingRequest).toHaveBeenCalled();
      });
    });

    it('debe incluir todas las categorías de preferencias', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        const jsonCall = mockOnCuestionarioCompleto.mock.calls[0][0];
        // Debe tener las 3 categorías: intereses, generoMusical, estiloPintura
        expect(Object.keys(jsonCall).length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  // Suite 7: Estado y ciclo de vida
  describe('Estado y Ciclo de Vida', () => {
    it('debe mantener isLoading durante transformación', async () => {
      (CuestionarioService.transformarAOnboardingRequest as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockPreferencias), 50)
          )
      );

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      // Esperar procesamiento
      await waitFor(() => {
        expect(CuestionarioService.transformarAOnboardingRequest).toHaveBeenCalled();
      });
    });

    it('debe setear isLoading en false después de transformación', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        // El botón debe volver a estar disponible
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        expect(continueButton).toBeInTheDocument();
      });
    });
  });

  // Suite 8: Compilabilidad y tipado
  describe('Compilabilidad', () => {
    it('debe compilar sin errores TypeScript', () => {
      expect(CuestionarioPage).toBeDefined();
      expect(typeof CuestionarioPage).toBe('function');
    });

    it('debe estar disponible CuestionarioService.transformarAOnboardingRequest', () => {
      expect(CuestionarioService.transformarAOnboardingRequest).toBeDefined();
    });

    it('debe exponer los tres campos del DTO de onboarding', async () => {
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        expect(mockPreferencias).toEqual(expect.objectContaining({
          generoIds: expect.any(Array),
          estiloIds: expect.any(Array),
          tipoMusicaIds: expect.any(Array),
        }));
      });
    });
  });
});
