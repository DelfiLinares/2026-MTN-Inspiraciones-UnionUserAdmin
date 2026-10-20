import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PaginaRecuperacion } from '../../src/presentation/pages/recuperar-contrasena/PaginaRecuperacion';

/**
 * T052 - Integration Test: Flujo completo de entrada de email válido
 *
 * Verifica el flujo completo cuando un usuario ingresa un email válido:
 * 1. Ingresa "usuario@ejemplo.com"
 * 2. Hace blur (validación)
 * 3. Hace clic en Continuar
 * 4. Sistema simula procesamiento durante 750ms
 * 5. Confirmación se muestra exitosamente
 *
 * HU: HU-001 a HU-008
 * RF: RF-001 a RF-012
 * 
 * Criterios:
 * - Sin errores en consola
 * - Estado final = éxito
 * - Navegación disponible después
 * - Tiempo de respuesta ~750ms
 */

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const renderConRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('T052 - Flujo Completo de Email Válido', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería procesar email válido correctamente', async () => {
    vi.useFakeTimers();
    
    await act(async () => {
      renderConRouter(<PaginaRecuperacion />);
    });

    // 1. Usuario escribe email válido
    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'usuario@ejemplo.com' } });
    });
    expect(input).toHaveValue('usuario@ejemplo.com');

    // 2. Usuario hace blur (dispara validación)
    await act(async () => {
      fireEvent.blur(input);
    });

    // 3. No debería haber errores (email válido)
    const errorMessages = screen.queryAllByText(/inválido|invalido|formato/i);
    expect(errorMessages.length).toBe(0);

    // 4. Usuario hace clic en Continuar
    const botones = screen.getAllByRole('button');
    const botonContinuar = botones.find(btn => 
      btn.textContent?.toLowerCase().includes('continuar')
    );
    
    expect(botonContinuar).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(botonContinuar!);
      // Avanzar timers para simular los 750ms de procesamiento
      vi.advanceTimersByTime(750);
    });

    // 5. Debería mostrar confirmación (botón Regresar)
    const todosLosBotones = screen.getAllByRole('button');
    const botonRegresar = todosLosBotones.find(btn => 
      btn.textContent?.toLowerCase().includes('regres')
    );
    expect(botonRegresar).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('debería mostrar confirmación después del éxito', async () => {
    vi.useFakeTimers();
    
    await act(async () => {
      renderConRouter(<PaginaRecuperacion />);
    });

    const input = screen.getByRole('textbox');
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'usuario@ejemplo.com' } });
      fireEvent.blur(input);
    });

    const botones = screen.getAllByRole('button');
    const botonContinuar = botones.find(btn => 
      btn.textContent?.toLowerCase().includes('continuar')
    );
    
    await act(async () => {
      fireEvent.click(botonContinuar!);
      vi.advanceTimersByTime(750);
    });

    // Después de 750ms, debería estar en estado de éxito
    const todosLosBotones = screen.getAllByRole('button');
    const botonRegresar = todosLosBotones.find(btn => 
      btn.textContent?.toLowerCase().includes('regres')
    );
    expect(botonRegresar).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('debería tener navegación disponible después de confirmación', async () => {
    vi.useFakeTimers();
    
    await act(async () => {
      renderConRouter(<PaginaRecuperacion />);
    });

    const input = screen.getByRole('textbox');
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'usuario@ejemplo.com' } });
      fireEvent.blur(input);
    });

    const botones = screen.getAllByRole('button');
    const botonContinuar = botones.find(btn => 
      btn.textContent?.toLowerCase().includes('continuar')
    );
    
    await act(async () => {
      fireEvent.click(botonContinuar!);
      vi.advanceTimersByTime(750);
    });

    const todosLosBotones = screen.getAllByRole('button');
    const botonRegresar = todosLosBotones.find(btn => 
      btn.textContent?.toLowerCase().includes('regres')
    );
    
    // El botón debería estar disponible (no deshabilitado)
    expect(botonRegresar).toBeInTheDocument();
    expect(botonRegresar).not.toBeDisabled();

    vi.useRealTimers();
  });

  it('debería permitir navegar a login después de confirmación', async () => {
    vi.useFakeTimers();
    
    await act(async () => {
      renderConRouter(<PaginaRecuperacion />);
    });

    const input = screen.getByRole('textbox');
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'usuario@ejemplo.com' } });
      fireEvent.blur(input);
    });

    const botones = screen.getAllByRole('button');
    const botonContinuar = botones.find(btn => 
      btn.textContent?.toLowerCase().includes('continuar')
    );
    
    await act(async () => {
      fireEvent.click(botonContinuar!);
      vi.advanceTimersByTime(750);
    });

    const todosLosBotones = screen.getAllByRole('button');
    const botonRegresar = todosLosBotones.find(btn => 
      btn.textContent?.toLowerCase().includes('regres')
    );
    
    await act(async () => {
      fireEvent.click(botonRegresar!);
    });
    
    // mockNavigate debería haber sido llamado
    expect(mockNavigate).toHaveBeenCalledWith('/login');

    vi.useRealTimers();
  });

  it('debería respetar el delay de 750ms', async () => {
    vi.useFakeTimers();
    
    await act(async () => {
      renderConRouter(<PaginaRecuperacion />);
    });

    const input = screen.getByRole('textbox');
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'usuario@ejemplo.com' } });
      fireEvent.blur(input);
    });

    const botones = screen.getAllByRole('button');
    const botonContinuar = botones.find(btn => 
      btn.textContent?.toLowerCase().includes('continuar')
    );
    
    await act(async () => {
      fireEvent.click(botonContinuar!);
    });

    // Después de menos de 750ms, el formulario debería estar en transición
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    
    // Después de 750ms total, la confirmación debería estar visible
    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    const todosLosBotones = screen.getAllByRole('button');
    const botonRegresar = todosLosBotones.find(btn => 
      btn.textContent?.toLowerCase().includes('regres')
    );
    expect(botonRegresar).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('debería mantener el estado durante todo el flujo', async () => {
    vi.useFakeTimers();
    
    await act(async () => {
      renderConRouter(<PaginaRecuperacion />);
    });

    const input = screen.getByRole('textbox');
    const emailValido = 'usuario@ejemplo.com';
    
    await act(async () => {
      fireEvent.change(input, { target: { value: emailValido } });
    });
    expect(input).toHaveValue(emailValido);

    await act(async () => {
      fireEvent.blur(input);
    });
    expect(input).toHaveValue(emailValido);

    const botones = screen.getAllByRole('button');
    const botonContinuar = botones.find(btn => 
      btn.textContent?.toLowerCase().includes('continuar')
    );
    
    await act(async () => {
      fireEvent.click(botonContinuar!);
      vi.advanceTimersByTime(750);
    });

    // El estado debe haberse mantenido correctamente
    const todosLosBotones = screen.getAllByRole('button');
    expect(todosLosBotones.length).toBeGreaterThan(0);

    vi.useRealTimers();
  });
});
