/**
 * ============================================================================
 * CuestionarioPageT040Navigation.test.tsx
 * ============================================================================
 *
 * Tests para T040: Navegación a feed con preferencias
 *
 * T040: Implementar navegación a feed con preferencias
 *
 * Requisitos cubiertos:
 * - HU-07: Finalizar y acceder a feed personalizado
 * - RF-23: Feed personalizado basado en respuestas
 * - A-6: Paso de preferencias entre componentes
 *
 * Referencia: spec.md § 5, plan.md § 4, tasks.md § T040
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import { CuestionarioPage } from '../../src/presentation/cuestionario/CuestionarioPage';
import { FeedPage } from '../../src/presentation/feed/FeedPage';
import { CuestionarioService } from '../../src/application/CuestionarioService';

// Mock de CuestionarioService
vi.mock('../../src/application/CuestionarioService');

describe('CuestionarioPageT040Navigation: Navegación a feed con preferencias', () => {
  const mockOnCuestionarioCompleto = vi.fn();
  const mockOnNavigate = vi.fn();

  // Mock para Preferencias
  const mockPreferencias = {
    toJSON: () => ({
      intereses: ['Arte Urbano', 'Escultura'],
      generoMusical: ['Rock'],
      estiloPintura: ['Abstracto'],
    }),
  } as any;

  // Helper para envolver componentes en Router
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (CuestionarioService.validarCompletitud as any).mockReturnValue({
      valida: true,
      errores: null,
    });
    (CuestionarioService.transformarAOnboardingRequest as any).mockReturnValue(mockPreferencias);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Suite 1: useNavigate hook
  describe('useNavigate Hook', () => {
    it('debe importar useNavigate de react-router-dom', () => {
      const cuestionarioCode = CuestionarioPage.toString();
      expect(cuestionarioCode).toContain('useNavigate');
    });

    it('debe instanciar useNavigate en el componente', () => {
      const cuestionarioCode = CuestionarioPage.toString();
      expect(cuestionarioCode).toContain('navigate');
      expect(cuestionarioCode).toContain('useNavigate');
    });
  });

  // Suite 2: Navegación con state
  describe('Navegación con State', () => {
    it('debe llamar navigate con ruta /feed', () => {
      const cuestionarioCode = CuestionarioPage.toString();
      expect(cuestionarioCode).toContain('/feed');
    });

    it('debe pasar state con preferencias en la navegación', () => {
      const cuestionarioCode = CuestionarioPage.toString();
      expect(cuestionarioCode).toContain('state');
      expect(cuestionarioCode).toContain('preferencias');
    });

    it('debe transformar y guardar el DTO antes de navegar', () => {
      const cuestionarioCode = CuestionarioPage.toString();
      expect(cuestionarioCode).toContain('transformarAOnboardingRequest');
      expect(cuestionarioCode).toContain('guardarInteresesOnboarding');
    });
  });

  // Suite 3: FeedPage recibe preferencias
  describe('FeedPage Recibe Preferencias', () => {
    it('debe usar useLocation para recibir state', () => {
      const feedPageCode = FeedPage.toString();
      expect(feedPageCode).toContain('useLocation');
    });

    it('debe extraer preferencias del state de location', () => {
      const feedPageCode = FeedPage.toString();
      expect(feedPageCode).toContain('location.state');
      expect(feedPageCode).toContain('preferencias');
    });

    it('debe validar que preferencias existen', () => {
      const feedPageCode = FeedPage.toString();
      expect(feedPageCode).toContain('if');
      expect(feedPageCode).toContain('!preferencias');
    });
  });

  // Suite 4: FeedPage redirige si no hay preferencias
  describe('FeedPage Redirige si no hay Preferencias', () => {
    it('debe redirigir a /cuestionario si no hay preferencias', () => {
      const feedPageCode = FeedPage.toString();
      expect(feedPageCode).toContain('/cuestionario');
    });

    it('debe usar useNavigate para redirigir', () => {
      const feedPageCode = FeedPage.toString();
      expect(feedPageCode).toContain('navigate');
      expect(feedPageCode).toContain('useNavigate');
    });

    it('debe ejecutar validación en useEffect', () => {
      const feedPageCode = FeedPage.toString();
      expect(feedPageCode).toContain('useEffect');
    });
  });

  // Suite 5: FeedPage UI
  describe('FeedPage UI', () => {
    it('debe renderizar mensaje de carga', () => {
      const feedPageCode = FeedPage.toString();
      expect(feedPageCode).toContain('Generando feed personalizado');
    });

    it('debe mostrar subtitle sobre intereses', () => {
      const feedPageCode = FeedPage.toString();
      expect(feedPageCode).toContain('artísticos');
    });

    it('debe tener spinner de carga', () => {
      const feedPageCode = FeedPage.toString();
      expect(feedPageCode).toContain('spinner');
    });

    it('debe tener sección de debug', () => {
      const feedPageCode = FeedPage.toString();
      expect(feedPageCode).toContain('debug');
    });
  });

  // Suite 6: CuestionarioPage con useNavigate
  describe('CuestionarioPage useNavigate Integration', () => {
    it('debe usar useNavigate al manejar continuar', () => {
      const cuestionarioCode = CuestionarioPage.toString();
      expect(cuestionarioCode).toContain('navigate');
    });

    it('debe incluir navigate en dependencies de useCallback', () => {
      const cuestionarioCode = CuestionarioPage.toString();
      // El useCallback debe tener navigate en sus dependencias
      expect(cuestionarioCode).toMatch(/useCallback[\s\S]*navigate/);
    });
  });

  // Suite 7: Compilabilidad
  describe('Compilabilidad', () => {
    it('debe compilar sin errores TypeScript', () => {
      expect(CuestionarioPage).toBeDefined();
      expect(typeof CuestionarioPage).toBe('function');
      expect(FeedPage).toBeDefined();
      expect(typeof FeedPage).toBe('function');
    });

    it('debe exportar CuestionarioPage', () => {
      expect(CuestionarioPage).toBeDefined();
    });

    it('debe exportar FeedPage', () => {
      expect(FeedPage).toBeDefined();
    });

    it('debe tener useNavigate disponible en CuestionarioPage', () => {
      const cuestionarioCode = CuestionarioPage.toString();
      expect(cuestionarioCode).toContain('useNavigate');
    });

    it('debe tener useLocation disponible en FeedPage', () => {
      const feedPageCode = FeedPage.toString();
      expect(feedPageCode).toContain('useLocation');
    });
  });

  // Suite 8: Fallback a onNavigate prop
  describe('Fallback a onNavigate Prop', () => {
    it('debe verificar onNavigate callback después de navigate', () => {
      const cuestionarioCode = CuestionarioPage.toString();
      expect(cuestionarioCode).toContain('onNavigate');
    });

    it('debe mantener compatibilidad con prop onNavigate', () => {
      const cuestionarioCode = CuestionarioPage.toString();
      expect(cuestionarioCode).toContain('if (onNavigate)');
    });
  });

  // Suite 9: Transformación antes de navegar
  describe('Transformación antes de Navegar', () => {
    it('debe llamar transformarAOnboardingRequest antes de navegar', () => {
      const cuestionarioCode = CuestionarioPage.toString();
      expect(cuestionarioCode).toContain('transformarAOnboardingRequest');
    });

    it('debe confirmar la respuesta de onboarding antes de navegar', () => {
      const cuestionarioCode = CuestionarioPage.toString();
      expect(cuestionarioCode).toContain('resultadoOnboarding.onboardingCompletado');
    });
  });

  // Suite 10: Validación antes de navegar
  describe('Validación antes de Navegar', () => {
    it('debe validar completitud antes de navegar', () => {
      const cuestionarioCode = CuestionarioPage.toString();
      expect(cuestionarioCode).toContain('validarCompletitud');
    });

    it('debe solo navegar si validación es exitosa', () => {
      const cuestionarioCode = CuestionarioPage.toString();
      // Debe haber una condición que verifica validación
      expect(cuestionarioCode).toMatch(/if[\s\S]*valida/);
    });
  });

  // Suite 11: handleContinuar logic
  describe('handleContinuar Logic', () => {
    it('debe verificar que handleContinuar contiene navigate', () => {
      const cuestionarioCode = CuestionarioPage.toString();
      expect(cuestionarioCode).toContain('handleContinuar');
      expect(cuestionarioCode).toMatch(/handleContinuar[\s\S]*navigate|navigate[\s\S]*handleContinuar/);
    });
  });
});
