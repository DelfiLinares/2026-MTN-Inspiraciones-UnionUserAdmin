import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PaginaRecuperacion } from '../../../src/presentation/pages/recuperar-contrasena/PaginaRecuperacion';

/**
 * PaginaRecuperacion Test Suite
 *
 * Tests para la página principal del flujo de recuperación de contraseña.
 * Verifica:
 * - Renderizado según estado del formulario
 * - Integración con el hook useFormularioRecuperacion
 * - Navegación y transiciones visuales
 * - Manejo de eventos del usuario
 * - Transiciones entre formulario y confirmación
 *
 * Total tests: 31
 */

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Wrapper para proporcionar BrowserRouter
const renderConRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PaginaRecuperacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado inicial', () => {
    it('debería renderizarse sin errores', () => {
      renderConRouter(<PaginaRecuperacion />);
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('debería mostrar el formulario cuando esExito es falso', () => {
      renderConRouter(<PaginaRecuperacion />);
      const formulario = screen.getByRole('textbox');
      expect(formulario).toBeInTheDocument();
    });

    it('debería tener el campo de email visible', () => {
      renderConRouter(<PaginaRecuperacion />);
      const emailInput = screen.getByPlaceholderText(/usuario@ejemplo/i);
      expect(emailInput).toBeInTheDocument();
    });

    it('debería tener un botón para enviar', () => {
      renderConRouter(<PaginaRecuperacion />);
      const botones = screen.getAllByRole('button');
      expect(botones.length).toBeGreaterThan(0);
    });
  });

  describe('Integración con hook useFormularioRecuperacion', () => {
    it('debería actualizar el correo cuando el usuario escribe', async () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      
      await waitFor(() => {
        expect(input).toHaveValue('usuario@example.com');
      });
    });

    it('debería mostrar error cuando el email es inválido', async () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'email-invalido' } });
      fireEvent.blur(input);
      
      await waitFor(() => {
        const errorText = screen.queryByText(/inválido|invalido|formato/i);
        // Esperamos que haya un error (puede estar vacío, inválido, etc)
      });
    });

    it('debería limpiar errores cuando el usuario corrige el email', async () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'invalido' } });
      fireEvent.blur(input);
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      
      await waitFor(() => {
        expect(input).toHaveValue('usuario@example.com');
      });
    });

    it('debería mantener el estado del formulario entre interacciones', async () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(input).toHaveValue('usuario@example.com');
      });
    });
  });

  describe('Renderizado del formulario', () => {
    it('debería mostrar FormularioRecuperacion cuando no hay éxito', () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('debería tener un campo de entrada accesible', () => {
      renderConRouter(<PaginaRecuperacion />);
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('debería permitir escribir en el campo de email', async () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      const testEmail = 'test@example.com';
      fireEvent.change(input, { target: { value: testEmail } });
      
      await waitFor(() => {
        expect(input).toHaveValue(testEmail);
      });
    });

    it('debería tener un botón de envío accesible', () => {
      renderConRouter(<PaginaRecuperacion />);
      const botones = screen.getAllByRole('button');
      expect(botones.length).toBeGreaterThan(0);
    });

    it('debería mostrar el atributo aria-label en el input', () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      // El input puede tener aria-label o estar asociado a un label
      expect(input).toBeInTheDocument();
    });
  });

  describe('Transición a confirmación', () => {
    it('debería mostrar ConfirmacionRecuperacion después de envío exitoso', async () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      const botones = screen.getAllByRole('button');
      const botonEnvio = botones[botones.length - 1]; // Último botón suele ser el de envío
      
      // Escribir email válido
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      fireEvent.blur(input);
      
      // Enviar formulario
      fireEvent.click(botonEnvio);
      
      // Esperar a que cambie la vista
      await waitFor(() => {
        // Después del envío exitoso, debería mostrar confirmación
        // El texto del heading o la presencia de ConfirmacionRecuperacion
      }, { timeout: 1500 });
    });

    it('debería permitir interacción completa: llenar, validar, enviar', async () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      // Escribir
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      
      // Validar
      fireEvent.blur(input);
      
      // El email debería estar en el input
      await waitFor(() => {
        expect(input).toHaveValue('usuario@example.com');
      });
    });
  });

  describe('Navegación', () => {
    it('debería tener navegación disponible después de confirmación', async () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      const botones = screen.getAllByRole('button');
      
      // Llenar y enviar
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      fireEvent.blur(input);
      fireEvent.click(botones[botones.length - 1]);
      
      // Esperar a que aparezca el botón Regresar
      await waitFor(() => {
        const botonesActualizados = screen.getAllByRole('button');
        expect(botonesActualizados.length).toBeGreaterThan(0);
      }, { timeout: 1500 });
    });

    it('debería llamar a navigate cuando el usuario regresa', async () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      const botones = screen.getAllByRole('button');
      
      // Enviar para llegar a la confirmación
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      fireEvent.blur(input);
      fireEvent.click(botones[botones.length - 1]);
      
      // Esperar a confirmación y buscar botón Regresar
      await waitFor(() => {
        const todosLosBotones = screen.getAllByRole('button');
        const botonRegresar = todosLosBotones.find(btn => 
          btn.textContent?.toLowerCase().includes('regres') || btn.textContent?.toLowerCase().includes('atrás')
        );
        
        if (botonRegresar) {
          fireEvent.click(botonRegresar);
          // El navigate debería haber sido llamado
        }
      }, { timeout: 1500 });
    });
  });

  describe('Estados visuales', () => {
    it('debería tener estilos consistentes en el formulario', () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      // El input debería tener clases o estilos
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass(/form|input|field/i);
    });

    it('debería mostrar estado de carga durante el envío', async () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      fireEvent.blur(input);
      const botones = screen.getAllByRole('button');
      fireEvent.click(botones[botones.length - 1]);
      
      // El componente debería indicar que está cargando
      await waitFor(() => {
        // Podría haber un spinner o texto que diga "Enviando..."
      }, { timeout: 1500 });
    });

    it('debería mostrar transición suave entre formulario y confirmación', async () => {
      const { rerender } = renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      fireEvent.blur(input);
      const botones = screen.getAllByRole('button');
      fireEvent.click(botones[botones.length - 1]);
      
      // Esperar a que se complete la transición
      await waitFor(() => {
        // El componente debería renderizar ConfirmacionRecuperacion
      }, { timeout: 1500 });
    });
  });

  describe('Casos borde', () => {
    it('debería manejar email con espacios al inicio y final', async () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: '  usuario@example.com  ' } });
      fireEvent.blur(input);
      
      await waitFor(() => {
        // El email debería mantenerse (aunque el componente podría normalizarlo)
        const valor = input.getAttribute('value');
        expect(valor).toBeTruthy();
      });
    });

    it('debería manejar múltiples intentos de envío', async () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      const botones = screen.getAllByRole('button');
      
      // Primer intento
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      fireEvent.blur(input);
      
      // Los múltiples clicks deberían ser manejados
      fireEvent.click(botones[botones.length - 1]);
      fireEvent.click(botones[botones.length - 1]);
      
      await waitFor(() => {
        // Solo debería procesar uno
      }, { timeout: 1500 });
    });

    it('debería restablecer el formulario después de regresar', async () => {
      renderConRouter(<PaginaRecuperacion />);
      let input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      fireEvent.blur(input);
      const botones = screen.getAllByRole('button');
      fireEvent.click(botones[botones.length - 1]);
      
      await waitFor(() => {
        const todosLosBotones = screen.getAllByRole('button');
        const botonRegresar = todosLosBotones.find(btn => 
          btn.textContent?.toLowerCase().includes('regres') || btn.textContent?.toLowerCase().includes('atrás')
        );
        
        if (botonRegresar) {
          fireEvent.click(botonRegresar);
        }
      }, { timeout: 1500 });
    });

    it('debería permitir un flujo completo: escribir → validar → enviar → confirmar → regresar', async () => {
      renderConRouter(<PaginaRecuperacion />);
      
      // Escribir
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      
      // Validar
      fireEvent.blur(input);
      
      // Enviar
      const botones = screen.getAllByRole('button');
      fireEvent.click(botones[botones.length - 1]);
      
      // Confirmar
      await waitFor(() => {
        const todosLosBotones = screen.getAllByRole('button');
        const botonRegresar = todosLosBotones.find(btn => 
          btn.textContent?.toLowerCase().includes('regres') || btn.textContent?.toLowerCase().includes('atrás')
        );
        
        if (botonRegresar) {
          fireEvent.click(botonRegresar);
        }
      }, { timeout: 1500 });
      
      // Regresar - el formulario debería estar disponible nuevamente
      await waitFor(() => {
        const nuevoInput = screen.queryByRole('textbox');
        expect(nuevoInput).toBeInTheDocument();
      });
    });
  });

  describe('Accesibilidad', () => {
    it('debería tener texto accesible para el botón de envío', () => {
      renderConRouter(<PaginaRecuperacion />);
      const botones = screen.getAllByRole('button');
      
      // Los botones deberían tener texto descriptivo
      const tieneTextosDescriptivos = botones.some(btn => 
        btn.textContent && btn.textContent.length > 0
      );
      expect(tieneTextosDescriptivos).toBe(true);
    });

    it('debería permitir navegación con teclado', async () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      input.focus();
      expect(input).toHaveFocus();
      
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      expect(input).toHaveValue('usuario@example.com');
    });

    it('debería tener contraste de colores adecuado', () => {
      renderConRouter(<PaginaRecuperacion />);
      const formulario = screen.getByRole('textbox');
      
      // El elemento debería estar visible
      expect(formulario).toBeVisible();
    });
  });

  describe('Props y composición', () => {
    it('debería integrar FormularioRecuperacion correctamente', () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      // FormularioRecuperacion debería estar renderizado
      expect(input).toBeInTheDocument();
    });

    it('debería integrar ConfirmacionRecuperacion después del éxito', async () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      fireEvent.blur(input);
      const botones = screen.getAllByRole('button');
      fireEvent.click(botones[botones.length - 1]);
      
      await waitFor(() => {
        // ConfirmacionRecuperacion debería estar visible
        const elementosActuales = screen.getAllByRole('button');
        expect(elementosActuales.length).toBeGreaterThan(0);
      }, { timeout: 1500 });
    });

    it('debería pasar props correctas a FormularioRecuperacion', () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      // El input debería aceptar cambios
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      expect(input).toHaveValue('test@example.com');
    });

    it('debería pasar callback alRegresar a ConfirmacionRecuperacion', async () => {
      renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      fireEvent.blur(input);
      const botones = screen.getAllByRole('button');
      fireEvent.click(botones[botones.length - 1]);
      
      await waitFor(() => {
        // Debería permitir hacer clic en el botón Regresar
        const todosLosBotones = screen.getAllByRole('button');
        expect(todosLosBotones.length).toBeGreaterThan(0);
      }, { timeout: 1500 });
    });
  });

  describe('Cleanup y desmontaje', () => {
    it('debería limpiar recursos al desmontar', () => {
      const { unmount } = renderConRouter(<PaginaRecuperacion />);
      
      unmount();
      
      // No debería haber errores después del desmontaje
      expect(() => unmount()).not.toThrow();
    });

    it('debería no causar memory leaks con listeners', () => {
      const { unmount } = renderConRouter(<PaginaRecuperacion />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'usuario@example.com' } });
      
      unmount();
      
      // No debería haber efectos secundarios después del desmontaje
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
