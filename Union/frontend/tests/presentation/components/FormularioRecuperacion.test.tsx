import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormularioRecuperacion } from '../../../src/presentation/components/recuperacion/FormularioRecuperacion';
import { PropsFormularioRecuperacion } from '../../../src/types/recuperacion';

describe('FormularioRecuperacion', () => {
  const mockHandlers = {
    alCambiarCorreo: vi.fn(),
    alBlurCorreo: vi.fn(),
    alEnviar: vi.fn(),
    alRegresar: vi.fn()
  };

  const defaultProps: PropsFormularioRecuperacion = {
    correo: '',
    errorCorreo: undefined,
    tocado: false,
    estaCargando: false,
    ...mockHandlers
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado básico', () => {
    it('debería renderizar el componente correctamente', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      expect(screen.getByText('Recuperación de Contraseña')).toBeInTheDocument();
    });

    it('debería renderizar el input de correo', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
    });

    it('debería renderizar botón Continuar', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      expect(screen.getByRole('button', { name: /enviar solicitud/i })).toBeInTheDocument();
    });

    it('debería renderizar botón Regresar', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      expect(screen.getByRole('button', { name: /regresar a la pantalla/i })).toBeInTheDocument();
    });

    it('debería renderizar descripción del formulario', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      expect(screen.getByText(/Ingresa tu correo electrónico/)).toBeInTheDocument();
    });
  });

  describe('Atributos del input', () => {
    it('debería tener tipo email', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      const input = screen.getByLabelText('Correo Electrónico') as HTMLInputElement;
      expect(input.type).toBe('email');
    });

    it('debería tener placeholder correcto', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      const input = screen.getByLabelText('Correo Electrónico') as HTMLInputElement;
      expect(input.placeholder).toBe('usuario@ejemplo.com');
    });

    it('debería mostrar el valor del correo', () => {
      const props = { ...defaultProps, correo: 'usuario@example.com' };
      render(<FormularioRecuperacion {...props} />);

      const input = screen.getByLabelText('Correo Electrónico') as HTMLInputElement;
      expect(input.value).toBe('usuario@example.com');
    });
  });

  describe('Eventos onChange', () => {
    it('debería llamar alCambiarCorreo al escribir', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      const input = screen.getByLabelText('Correo Electrónico');
      fireEvent.change(input, { target: { value: 'nuevo@example.com' } });

      expect(mockHandlers.alCambiarCorreo).toHaveBeenCalledWith('nuevo@example.com');
    });

    it('debería llamar alCambiarCorreo con valor vacío', () => {
      const props = { ...defaultProps, correo: 'usuario@example.com' };
      render(<FormularioRecuperacion {...props} />);

      const input = screen.getByLabelText('Correo Electrónico');
      fireEvent.change(input, { target: { value: '' } });

      expect(mockHandlers.alCambiarCorreo).toHaveBeenCalledWith('');
    });
  });

  describe('Eventos onBlur', () => {
    it('debería llamar alBlurCorreo al perder foco', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      const input = screen.getByLabelText('Correo Electrónico');
      fireEvent.blur(input);

      expect(mockHandlers.alBlurCorreo).toHaveBeenCalled();
    });
  });

  describe('Validación visual - Mensaje de error', () => {
    it('no debería mostrar error sin tocado', () => {
      const props = {
        ...defaultProps,
        errorCorreo: 'Correo inválido',
        tocado: false
      };
      render(<FormularioRecuperacion {...props} />);

      expect(screen.queryByText('Correo inválido')).not.toBeInTheDocument();
    });

    it('debería mostrar error si tocado y hay error', () => {
      const props = {
        ...defaultProps,
        errorCorreo: 'Correo inválido',
        tocado: true
      };
      render(<FormularioRecuperacion {...props} />);

      expect(screen.getByText('Correo inválido')).toBeInTheDocument();
    });

    it('debería aplicar clase error al input si hay error y tocado', () => {
      const props = {
        ...defaultProps,
        errorCorreo: 'Correo inválido',
        tocado: true
      };
      render(<FormularioRecuperacion {...props} />);

      const input = screen.getByLabelText('Correo Electrónico');
      expect(input).toHaveClass('input--error');
    });

    it('no debería aplicar clase error si tocado pero sin error', () => {
      const props = {
        ...defaultProps,
        errorCorreo: undefined,
        tocado: true
      };
      render(<FormularioRecuperacion {...props} />);

      const input = screen.getByLabelText('Correo Electrónico');
      expect(input).not.toHaveClass('input--error');
    });

    it('debería mostrar múltiples mensajes de error diferentes', () => {
      const { rerender } = render(
        <FormularioRecuperacion
          {...defaultProps}
          errorCorreo="Error 1"
          tocado={true}
        />
      );
      expect(screen.getByText('Error 1')).toBeInTheDocument();

      rerender(
        <FormularioRecuperacion
          {...defaultProps}
          errorCorreo="Error 2"
          tocado={true}
        />
      );
      expect(screen.getByText('Error 2')).toBeInTheDocument();
    });
  });

  describe('Estados de carga', () => {
    it('debería deshabilitar inputs durante carga', () => {
      const props = { ...defaultProps, estaCargando: true };
      render(<FormularioRecuperacion {...props} />);

      const input = screen.getByLabelText('Correo Electrónico') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('debería deshabilitar botón Continuar durante carga', () => {
      const props = { ...defaultProps, estaCargando: true };
      render(<FormularioRecuperacion {...props} />);

      const botonContinuar = screen.getByRole('button', { name: /Enviando/i });
      expect(botonContinuar).toBeDisabled();
    });

    it('debería deshabilitar botón Regresar durante carga', () => {
      const props = { ...defaultProps, estaCargando: true };
      render(<FormularioRecuperacion {...props} />);

      const botonRegresar = screen.getByRole('button', { name: /regresar a la pantalla/i });
      expect(botonRegresar).toBeDisabled();
    });

    it('debería cambiar texto botón durante carga', () => {
      const props = { ...defaultProps, estaCargando: true };
      render(<FormularioRecuperacion {...props} />);

      expect(screen.getByRole('button', { name: /enviando solicitud/i })).toBeInTheDocument();
    });

    it('debería mostrar texto normal cuando no está cargando', () => {
      const props = { ...defaultProps, estaCargando: false };
      render(<FormularioRecuperacion {...props} />);

      expect(screen.getByRole('button', { name: /enviar solicitud/i })).toBeInTheDocument();
    });
  });

  describe('Clicks en botones', () => {
    it('debería llamar alEnviar al hacer click en Continuar', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      const botonContinuar = screen.getByRole('button', { name: /enviar solicitud/i });
      fireEvent.click(botonContinuar);

      expect(mockHandlers.alEnviar).toHaveBeenCalled();
    });

    it('debería llamar alRegresar al hacer click en Regresar', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      const botonRegresar = screen.getByRole('button', { name: /regresar a la pantalla/i });
      fireEvent.click(botonRegresar);

      expect(mockHandlers.alRegresar).toHaveBeenCalled();
    });

    it('no debería permitir click en Continuar si está cargando', () => {
      const props = { ...defaultProps, estaCargando: true };
      render(<FormularioRecuperacion {...props} />);

      const botonContinuar = screen.getByRole('button', { name: /enviando solicitud/i });
      expect(botonContinuar).toBeDisabled();
    });
  });

  describe('Accesibilidad (a11y)', () => {
    it('debería tener aria-invalid=true cuando hay error', () => {
      const props = {
        ...defaultProps,
        errorCorreo: 'Error',
        tocado: true
      };
      render(<FormularioRecuperacion {...props} />);

      const input = screen.getByLabelText('Correo Electrónico');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('debería tener aria-invalid=false cuando no hay error', () => {
      const props = {
        ...defaultProps,
        errorCorreo: undefined,
        tocado: false
      };
      render(<FormularioRecuperacion {...props} />);

      const input = screen.getByLabelText('Correo Electrónico');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('debería tener aria-describedby cuando hay error y tocado', () => {
      const props = {
        ...defaultProps,
        errorCorreo: 'Error',
        tocado: true
      };
      render(<FormularioRecuperacion {...props} />);

      const input = screen.getByLabelText('Correo Electrónico');
      expect(input).toHaveAttribute('aria-describedby', 'correo-error');
    });

    it('no debería tener aria-describedby sin error y sin tocado', () => {
      const props = {
        ...defaultProps,
        errorCorreo: undefined,
        tocado: false
      };
      render(<FormularioRecuperacion {...props} />);

      const input = screen.getByLabelText('Correo Electrónico');
      expect(input).toHaveAttribute('aria-describedby', 'correo-help');
    });

    it('debería tener aria-busy durante carga', () => {
      const props = { ...defaultProps, estaCargando: true };
      render(<FormularioRecuperacion {...props} />);

      const botonContinuar = screen.getByRole('button', { name: /Enviando/i });
      expect(botonContinuar).toHaveAttribute('aria-busy', 'true');
    });

    it('debería tener aria-busy=false cuando no está cargando', () => {
      const props = { ...defaultProps, estaCargando: false };
      render(<FormularioRecuperacion {...props} />);

      const botonContinuar = screen.getByRole('button', { name: /enviar solicitud/i });
      expect(botonContinuar).toHaveAttribute('aria-busy', 'false');
    });

    it('debería tener labels asociados correctamente', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      const label = screen.getByText('Correo Electrónico');
      expect(label.tagName).toBe('LABEL');
      // La label está asociada correctamente porque screen.getByLabelText puede encontrar el input
      const input = screen.getByLabelText('Correo Electrónico');
      expect(input).toBeInTheDocument();
    });

    it('debería tener id en el input coincidiendo con htmlFor del label', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      const input = screen.getByLabelText('Correo Electrónico');
      expect(input).toHaveAttribute('id', 'correo');
    });
  });

  describe('Clases CSS', () => {
    it('debería aplicar clase formulario-recuperacion', () => {
      const { container } = render(<FormularioRecuperacion {...defaultProps} />);

      expect(container.querySelector('.formulario-recuperacion')).toBeInTheDocument();
    });

    it('debería aplicar clase input base', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      const input = screen.getByLabelText('Correo Electrónico');
      expect(input).toHaveClass('input');
    });

    it('debería aplicar clase button--primary en Continuar', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      const botonContinuar = screen.getByRole('button', { name: /enviar solicitud/i });
      expect(botonContinuar).toHaveClass('button--primary');
    });

    it('debería aplicar clase button--secondary en Regresar', () => {
      render(<FormularioRecuperacion {...defaultProps} />);

      const botonRegresar = screen.getByRole('button', { name: /regresar a la pantalla/i });
      expect(botonRegresar).toHaveClass('button--secondary');
    });

    it('debería aplicar clase error-message al mostrar error', () => {
      const props = {
        ...defaultProps,
        errorCorreo: 'Error',
        tocado: true
      };
      const { container } = render(<FormularioRecuperacion {...props} />);

      expect(container.querySelector('.error-message')).toBeInTheDocument();
    });
  });

  describe('Prop spreading y composición', () => {
    it('debería aceptar y usar todas las props requeridas', () => {
      const allProps: PropsFormularioRecuperacion = {
        correo: 'test@example.com',
        errorCorreo: 'Error test',
        tocado: true,
        estaCargando: false,
        alCambiarCorreo: vi.fn(),
        alBlurCorreo: vi.fn(),
        alEnviar: vi.fn(),
        alRegresar: vi.fn()
      };

      render(<FormularioRecuperacion {...allProps} />);

      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Error test')).toBeInTheDocument();
    });

    it('debería renderizar correctamente sin errorCorreo', () => {
      const props: PropsFormularioRecuperacion = {
        correo: 'test@example.com',
        tocado: false,
        estaCargando: false,
        alCambiarCorreo: vi.fn(),
        alBlurCorreo: vi.fn(),
        alEnviar: vi.fn(),
        alRegresar: vi.fn()
      };

      render(<FormularioRecuperacion {...props} />);

      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });
  });
});
