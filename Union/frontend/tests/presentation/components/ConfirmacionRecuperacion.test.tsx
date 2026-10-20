import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmacionRecuperacion, PropsConfirmacionRecuperacion } from '../../../src/presentation/components/recuperacion/ConfirmacionRecuperacion';

describe('ConfirmacionRecuperacion', () => {
  const mockAlRegresar = vi.fn();

  const defaultProps: PropsConfirmacionRecuperacion = {
    alRegresar: mockAlRegresar
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado básico', () => {
    it('debería renderizar el componente correctamente', () => {
      render(<ConfirmacionRecuperacion {...defaultProps} />);

      expect(screen.getByText('Solicitud Procesada')).toBeInTheDocument();
    });

    it('debería renderizar el título correcto', () => {
      render(<ConfirmacionRecuperacion {...defaultProps} />);

      const titulo = screen.getByRole('heading', { level: 2, name: 'Solicitud Procesada' });
      expect(titulo).toBeInTheDocument();
    });

    it('debería renderizar el botón Regresar al Login', () => {
      render(<ConfirmacionRecuperacion {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Regresar al Login' })).toBeInTheDocument();
    });
  });

  describe('Icono de éxito', () => {
    it('debería renderizar el icono de éxito (✓)', () => {
      render(<ConfirmacionRecuperacion {...defaultProps} />);

      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('debería tener la clase icono-exito', () => {
      const { container } = render(<ConfirmacionRecuperacion {...defaultProps} />);

      expect(container.querySelector('.icono-exito')).toBeInTheDocument();
    });

    it('debería contener exactamente el símbolo ✓', () => {
      const { container } = render(<ConfirmacionRecuperacion {...defaultProps} />);

      const icono = container.querySelector('.icono-exito');
      expect(icono?.textContent).toBe('✓');
    });
  });

  describe('Mensaje de confirmación', () => {
    it('debería mostrar mensaje sobre neutralidad de cuenta', () => {
      render(<ConfirmacionRecuperacion {...defaultProps} />);

      expect(screen.getByText(/Si el correo electrónico corresponde a una cuenta registrada/i)).toBeInTheDocument();
    });

    it('debería mencionar que recibirá instrucciones', () => {
      render(<ConfirmacionRecuperacion {...defaultProps} />);

      expect(screen.getByText(/recibirás instrucciones para recuperar tu contraseña/i)).toBeInTheDocument();
    });

    it('debería tener la clase mensaje-confirmacion', () => {
      const { container } = render(<ConfirmacionRecuperacion {...defaultProps} />);

      expect(container.querySelector('.mensaje-confirmacion')).toBeInTheDocument();
    });

    it('debería ser un párrafo (p tag)', () => {
      const { container } = render(<ConfirmacionRecuperacion {...defaultProps} />);

      const mensaje = container.querySelector('.mensaje-confirmacion');
      expect(mensaje?.tagName).toBe('P');
    });
  });

  describe('Botón Regresar', () => {
    it('debería llamar alRegresar al hacer click', () => {
      render(<ConfirmacionRecuperacion {...defaultProps} />);

      const boton = screen.getByRole('button', { name: 'Regresar al Login' });
      fireEvent.click(boton);

      expect(mockAlRegresar).toHaveBeenCalled();
    });

    it('debería llamar alRegresar solo una vez por click', () => {
      render(<ConfirmacionRecuperacion {...defaultProps} />);

      const boton = screen.getByRole('button', { name: 'Regresar al Login' });
      fireEvent.click(boton);

      expect(mockAlRegresar).toHaveBeenCalledTimes(1);
    });

    it('debería tener la clase button--primary', () => {
      render(<ConfirmacionRecuperacion {...defaultProps} />);

      const boton = screen.getByRole('button', { name: 'Regresar al Login' });
      expect(boton).toHaveClass('button--primary');
    });

    it('debería tener atributo type="button"', () => {
      render(<ConfirmacionRecuperacion {...defaultProps} />);

      const boton = screen.getByRole('button', { name: 'Regresar al Login' });
      expect(boton).toHaveAttribute('type', 'button');
    });
  });

  describe('Accesibilidad', () => {
    it('debería tener estructura semántica correcta', () => {
      const { container } = render(<ConfirmacionRecuperacion {...defaultProps} />);

      expect(container.querySelector('.confirmacion-recuperacion')).toBeInTheDocument();
      expect(container.querySelector('.icono-exito')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('debería ser navegable con teclado', () => {
      render(<ConfirmacionRecuperacion {...defaultProps} />);

      const boton = screen.getByRole('button', { name: 'Regresar al Login' });
      boton.focus();
      fireEvent.keyDown(boton, { key: 'Enter', code: 'Enter' });

      // El botón debería poder recibir foco
      expect(document.activeElement).toBe(boton);
    });
  });

  describe('Props y composición', () => {
    it('debería aceptar alRegresar como prop', () => {
      const customHandler = vi.fn();
      const props: PropsConfirmacionRecuperacion = {
        alRegresar: customHandler
      };

      render(<ConfirmacionRecuperacion {...props} />);

      const boton = screen.getByRole('button', { name: 'Regresar al Login' });
      fireEvent.click(boton);

      expect(customHandler).toHaveBeenCalled();
    });

    it('debería renderizar correctamente con múltiples instancias', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const { rerender } = render(<ConfirmacionRecuperacion alRegresar={handler1} />);

      expect(screen.getByText('Solicitud Procesada')).toBeInTheDocument();

      rerender(<ConfirmacionRecuperacion alRegresar={handler2} />);

      const boton = screen.getByRole('button', { name: 'Regresar al Login' });
      fireEvent.click(boton);

      expect(handler2).toHaveBeenCalled();
      expect(handler1).not.toHaveBeenCalled();
    });
  });

  describe('Clases CSS', () => {
    it('debería aplicar clase confirmacion-recuperacion al contenedor', () => {
      const { container } = render(<ConfirmacionRecuperacion {...defaultProps} />);

      expect(container.querySelector('.confirmacion-recuperacion')).toBeInTheDocument();
    });

    it('debería aplicar clase button al botón', () => {
      render(<ConfirmacionRecuperacion {...defaultProps} />);

      const boton = screen.getByRole('button', { name: 'Regresar al Login' });
      expect(boton).toHaveClass('button');
    });
  });
});
