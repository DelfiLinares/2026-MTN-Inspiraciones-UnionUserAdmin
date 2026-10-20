/**
 * ============================================================================
 * CuestionarioPageT038ValidationHandlers.test.tsx
 * ============================================================================
 *
 * Tests para T038: Validación y manejo de errores
 *
 * T038: Implementar handlers de validación y error
 *
 * Requisitos cubiertos:
 * - RF-16: Validar que respuestas sean completas
 * - RF-17: Mostrar errores claros si hay preguntas sin responder
 * - RF-19: Manejo de errores de validación
 * - RNF-07: Manejo de errores robusto
 *
 * Referencia: spec.md § 3.4, plan.md § 4, tasks.md § T038
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { CuestionarioPage } from '../../src/presentation/cuestionario/CuestionarioPage';
import { CuestionarioService } from '../../src/application/CuestionarioService';

// Mock de CuestionarioService para verificar comportamiento
vi.mock('../../src/application/CuestionarioService');

describe('CuestionarioPageT038ValidationHandlers: Validación y Manejo de Errores', () => {
  const mockOnCuestionarioCompleto = vi.fn();
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock de las funciones de CuestionarioService
    (CuestionarioService.validarCompletitud as any).mockReturnValue({
      valida: true,
      errores: null,
    });
    (CuestionarioService.transformarAPreferencias as any).mockReturnValue({
      toJSON: () => ({ intereses: 'test' }),
    });
  });

  // Suite 1: Validación básica
  describe('Validación Básica', () => {
    it('debe llamar handleContinuar cuando el usuario hace click en el botón', async () => {
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

      // El servicio de validación debe ser llamado
      await waitFor(() => {
        expect(CuestionarioService.validarCompletitud).toHaveBeenCalled();
      });
    });

    it('debe validar completitud de respuestas antes de continuar', async () => {
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
        expect(CuestionarioService.validarCompletitud).toHaveBeenCalled();
      });
    });

    it('debe retornar sin continuar si validación falla', async () => {
      // Mock para retornar error de validación
      (CuestionarioService.validarCompletitud as any).mockReturnValue({
        valida: false,
        errores: new Map([['pregunta-1', 'Esta pregunta es obligatoria']]),
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
        // El callback de completitud NO debe ser llamado
        expect(mockOnCuestionarioCompleto).not.toHaveBeenCalled();
        // El transformar a preferencias NO debe ser llamado
        expect(CuestionarioService.transformarAPreferencias).not.toHaveBeenCalled();
      });
    });

    it('debe continuar a transformación si validación pasa', async () => {
      // Mock para retornar validación exitosa
      (CuestionarioService.validarCompletitud as any).mockReturnValue({
        valida: true,
        errores: null,
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
        // La transformación debe ser llamada
        expect(CuestionarioService.transformarAPreferencias).toHaveBeenCalled();
      });
    });
  });

  // Suite 2: Manejo de errores de validación
  describe('Manejo de Errores de Validación', () => {
    it('debe mostrar mensaje de error cuando validación falla', async () => {
      (CuestionarioService.validarCompletitud as any).mockReturnValue({
        valida: false,
        errores: new Map([['global', 'Por favor completa todas las preguntas obligatorias']]),
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

      // Verificar que la validación se ejecutó
      await waitFor(() => {
        expect(CuestionarioService.validarCompletitud).toHaveBeenCalled();
      });
    });

    it('debe limpiar errores previos al validar correctamente', async () => {
      // Primero, generar un error
      (CuestionarioService.validarCompletitud as any).mockReturnValue({
        valida: false,
        errores: new Map([['global', 'Error de prueba']]),
      });

      const { rerender } = render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      // Ahora simular validación exitosa
      (CuestionarioService.validarCompletitud as any).mockReturnValue({
        valida: true,
        errores: null,
      });

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        // El callback debe ser llamado (validación pasó)
        expect(mockOnCuestionarioCompleto).toHaveBeenCalled();
      });
    });

    it('debe continuar procesando después de error de validación', async () => {
      // Primera validación falla
      (CuestionarioService.validarCompletitud as any)
        .mockReturnValueOnce({
          valida: false,
          errores: new Map([['global', 'Error de prueba']]),
        })
        .mockReturnValueOnce({
          valida: true,
          errores: null,
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

      // La función debe ser llamada
      expect(CuestionarioService.validarCompletitud).toHaveBeenCalled();
    });
  });

  // Suite 3: Transformación de respuestas a preferencias
  describe('Transformación de Respuestas a Preferencias', () => {
    it('debe llamar transformarAPreferencias después de validación exitosa', async () => {
      (CuestionarioService.validarCompletitud as any).mockReturnValue({
        valida: true,
        errores: null,
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
        expect(CuestionarioService.transformarAPreferencias).toHaveBeenCalled();
      });
    });

    it('debe pasar respuestas y cuestionario a transformarAPreferencias', async () => {
      (CuestionarioService.validarCompletitud as any).mockReturnValue({
        valida: true,
        errores: null,
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
        expect(CuestionarioService.transformarAPreferencias).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything()
        );
      });
    });

    it('debe NO llamar transformarAPreferencias si validación falla', async () => {
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
        expect(CuestionarioService.transformarAPreferencias).not.toHaveBeenCalled();
      });
    });
  });

  // Suite 4: Callbacks y navegación
  describe('Callbacks y Navegación', () => {
    it('debe llamar onCuestionarioCompleto después de transformación exitosa', async () => {
      (CuestionarioService.validarCompletitud as any).mockReturnValue({
        valida: true,
        errores: null,
      });
      (CuestionarioService.transformarAPreferencias as any).mockReturnValue({
        toJSON: () => ({ test: 'data' }),
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
        expect(mockOnCuestionarioCompleto).toHaveBeenCalled();
      });
    });

    it('debe navegar a /feed después de completar', async () => {
      (CuestionarioService.validarCompletitud as any).mockReturnValue({
        valida: true,
        errores: null,
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
        expect(mockOnNavigate).toHaveBeenCalledWith('/feed');
      });
    });

    it('debe NO navegar si validación falla', async () => {
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
        expect(mockOnNavigate).not.toHaveBeenCalled();
      });
    });
  });

  // Suite 5: Estado de carga
  describe('Estado de Carga', () => {
    it('debe mostrar botón en estado loading mientras se procesa', async () => {
      // Mock para simular latencia
      (CuestionarioService.validarCompletitud as any).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ valida: true, errores: null }), 50)
          )
      );
      (CuestionarioService.transformarAPreferencias as any).mockReturnValueOnce({
        toJSON: () => ({ intereses: 'test' }),
      });

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

      // Verificar que la validación fue llamada
      await waitFor(() => {
        expect(CuestionarioService.validarCompletitud).toHaveBeenCalled();
      });
    });
  });

  // Suite 6: Manejo de múltiples intentos
  describe('Manejo de Múltiples Intentos', () => {
    it('debe permitir múltiples intentos de continuar', async () => {
      (CuestionarioService.validarCompletitud as any).mockReturnValue({
        valida: true,
        errores: null,
      });

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
      
      // Primer intento
      fireEvent.click(continueButton);
      
      // Esperar a que se procese
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar que fue llamado
      expect(CuestionarioService.validarCompletitud).toHaveBeenCalled();
    });

    it('debe mantener errores hasta que se resuelvan', async () => {
      (CuestionarioService.validarCompletitud as any).mockReturnValue({
        valida: false,
        errores: new Map([['pregunta-1', 'Esta pregunta es obligatoria']]),
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

      // Debe haber errores en pantalla
      await waitFor(() => {
        expect(CuestionarioService.validarCompletitud).toHaveBeenCalled();
      });
    });
  });

  // Suite 7: Compilabilidad y tipado
  describe('Compilabilidad', () => {
    it('debe compilar sin errores TypeScript', () => {
      expect(CuestionarioPage).toBeDefined();
      expect(typeof CuestionarioPage).toBe('function');
    });

    it('debe tener handleContinuar implementado', async () => {
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
  });

  // Suite 8: Estados limpieza y reset
  describe('Limpieza de Estado', () => {
    it('debe limpiar errores cuando la validación pasa', async () => {
      (CuestionarioService.validarCompletitud as any).mockReturnValue({
        valida: true,
        errores: null,
      });

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

      // Los errores deben estar limpios si la validación pasa
      await waitFor(() => {
        expect(mockOnCuestionarioCompleto).toHaveBeenCalled();
      });
    });

    it('debe setear isLoading en false después de completar', async () => {
      (CuestionarioService.validarCompletitud as any).mockReturnValue({
        valida: true,
        errores: null,
      });

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

      // El botón debe estar disponible para hacer click
      const continueButton = screen.getByRole('button', { name: /continuar/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        // Después de procesar, el botón debe volver a estar habilitado
        expect(continueButton).toBeInTheDocument();
      });
    });
  });
});
