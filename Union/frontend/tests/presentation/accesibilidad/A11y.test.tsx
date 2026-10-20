import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormularioRecuperacion } from '../../../src/presentation/components/recuperacion/FormularioRecuperacion';
import { ConfirmacionRecuperacion } from '../../../src/presentation/components/recuperacion/ConfirmacionRecuperacion';
import { PropsFormularioRecuperacion } from '../../../src/types/recuperacion';

/**
 * T059 - Validar accesibilidad (a11y) en componentes
 * 
 * Tests para verificar cumplimiento WCAG 2.1 AA:
 * - aria-label: etiquetas descriptivas
 * - aria-invalid: estado de validación
 * - aria-describedby: asociación con mensajes
 * - roles ARIA: role="alert", role="status", etc.
 * - aria-required: campos requeridos
 * - aria-busy: estado de carga
 * - aria-live: anuncios dinámicos
 * - aria-hidden: elementos decorativos
 */

describe('T059: Validar Accesibilidad (a11y) en Componentes', () => {
  describe('FormularioRecuperacion - ARIA Attributes', () => {
    let props: PropsFormularioRecuperacion;

    beforeEach(() => {
      props = {
        correo: '',
        errorCorreo: '',
        tocado: false,
        estaCargando: false,
        alCambiarCorreo: vi.fn(),
        alBlurCorreo: vi.fn(),
        alEnviar: vi.fn(),
        alRegresar: vi.fn()
      };
    });

    it('T059-001: Debe tener role="region" en contenedor principal', () => {
      render(<FormularioRecuperacion {...props} />);
      const region = screen.getByRole('region', { name: /formulario de recuperación/i });
      expect(region).toBeInTheDocument();
    });

    it('T059-002: Debe tener aria-label descriptivo en formulario', () => {
      render(<FormularioRecuperacion {...props} />);
      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Formulario de recuperación de contraseña');
    });

    it('T059-003: Input debe tener aria-required="true"', () => {
      render(<FormularioRecuperacion {...props} />);
      const input = screen.getByRole('textbox', { name: /ingresa tu correo/i });
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('T059-004: Input debe tener aria-invalid="false" cuando está válido', () => {
      render(<FormularioRecuperacion {...props} />);
      const input = screen.getByRole('textbox', { name: /ingresa tu correo/i });
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('T059-005: Input debe tener aria-invalid="true" cuando hay error y tocado', () => {
      const propsConError = {
        ...props,
        tocado: true,
        errorCorreo: 'Correo inválido'
      };
      render(<FormularioRecuperacion {...propsConError} />);
      const input = screen.getByRole('textbox', { name: /ingresa tu correo/i });
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('T059-006: Input debe tener aria-describedby cuando hay error', () => {
      const propsConError = {
        ...props,
        tocado: true,
        errorCorreo: 'Correo inválido'
      };
      render(<FormularioRecuperacion {...propsConError} />);
      const input = screen.getByRole('textbox', { name: /ingresa tu correo/i });
      expect(input).toHaveAttribute('aria-describedby', 'correo-error');
    });

    it('T059-007: Input debe tener aria-describedby="correo-help" cuando es válido', () => {
      render(<FormularioRecuperacion {...props} />);
      const input = screen.getByRole('textbox', { name: /ingresa tu correo/i });
      expect(input).toHaveAttribute('aria-describedby', 'correo-help');
    });

    it('T059-008: Debe existir elemento helper text con id="correo-help"', () => {
      render(<FormularioRecuperacion {...props} />);
      const helpText = document.getElementById('correo-help');
      expect(helpText).toBeInTheDocument();
      expect(helpText?.textContent).toBe('Ingresa una dirección de correo electrónico válida');
    });

    it('T059-009: Mensaje de error debe tener role="alert"', () => {
      const propsConError = {
        ...props,
        tocado: true,
        errorCorreo: 'Correo inválido'
      };
      render(<FormularioRecuperacion {...propsConError} />);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('T059-010: Input debe tener aria-label descriptivo', () => {
      render(<FormularioRecuperacion {...props} />);
      const input = screen.getByRole('textbox', { name: /ingresa tu correo/i });
      expect(input).toHaveAttribute('aria-label', 'Ingresa tu correo electrónico');
    });

    it('T059-011: Botón continuar debe tener aria-busy="false" cuando no carga', () => {
      render(<FormularioRecuperacion {...props} />);
      const button = screen.getByRole('button', { name: /enviar solicitud/i });
      expect(button).toHaveAttribute('aria-busy', 'false');
    });

    it('T059-012: Botón continuar debe tener aria-busy="true" cuando carga', () => {
      const propsConCarga = { ...props, estaCargando: true };
      render(<FormularioRecuperacion {...propsConCarga} />);
      const button = screen.getByRole('button', { name: /enviando solicitud/i });
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('T059-013: Botón continuar debe tener aria-label descriptivo', () => {
      render(<FormularioRecuperacion {...props} />);
      const button = screen.getByRole('button', { name: /enviar solicitud/i });
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-label', 'Enviar solicitud de recuperación');
    });

    it('T059-014: Botón regresar debe tener aria-label descriptivo', () => {
      render(<FormularioRecuperacion {...props} />);
      const button = screen.getByRole('button', { name: /regresar/i });
      expect(button).toHaveAttribute('aria-label', 'Regresar a la pantalla anterior');
    });

    it('T059-015: Form debe ser un elemento form accesible', () => {
      render(<FormularioRecuperacion {...props} />);
      // Verifica que el formulario sea un form (semántica correcta)
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('ConfirmacionRecuperacion - ARIA Attributes', () => {
    const props = {
      alRegresar: vi.fn()
    };

    it('T059-016: Debe tener role="region" en contenedor principal', () => {
      render(<ConfirmacionRecuperacion {...props} />);
      const region = screen.getByRole('region', { name: /confirmación de recuperación/i });
      expect(region).toBeInTheDocument();
    });

    it('T059-017: Debe tener aria-label descriptivo', () => {
      render(<ConfirmacionRecuperacion {...props} />);
      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Confirmación de recuperación de contraseña');
    });

    it('T059-018: Icono debe tener role="status"', () => {
      render(<ConfirmacionRecuperacion {...props} />);
      // Selecciona el primer elemento con role="status" (el icono)
      const statuses = screen.getAllByRole('status', { hidden: false });
      expect(statuses.length).toBeGreaterThan(0);
      const icon = statuses[0];
      expect(icon).toBeInTheDocument();
    });

    it('T059-019: Mensaje confirmación debe tener role="status"', () => {
      render(<ConfirmacionRecuperacion {...props} />);
      // El párrafo con clase "mensaje-confirmacion" debe tener role="status"
      const statuses = screen.getAllByRole('status');
      expect(statuses.length).toBeGreaterThan(0);
      // Verifica que al menos uno tenga aria-live
      const statusWithLive = statuses.find(s => s.hasAttribute('aria-live'));
      expect(statusWithLive).toBeInTheDocument();
      expect(statusWithLive).toHaveAttribute('aria-live', 'polite');
    });

    it('T059-020: Botón debe tener aria-label descriptivo', () => {
      render(<ConfirmacionRecuperacion {...props} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Aceptar y regresar al formulario de inicio de sesión');
    });
  });

  describe('WCAG 2.1 AA Compliance - Focus Management', () => {
    let props: PropsFormularioRecuperacion;

    beforeEach(() => {
      props = {
        correo: '',
        errorCorreo: '',
        tocado: false,
        estaCargando: false,
        alCambiarCorreo: vi.fn(),
        alBlurCorreo: vi.fn(),
        alEnviar: vi.fn(),
        alRegresar: vi.fn()
      };
    });

    it('T059-021: Inputs deben ser focusables', () => {
      render(<FormularioRecuperacion {...props} />);
      const input = screen.getByRole('textbox', { name: /ingresa tu correo/i });
      input.focus();
      expect(document.activeElement).toBe(input);
    });

    it('T059-022: Botones deben ser focusables', () => {
      render(<FormularioRecuperacion {...props} />);
      const button = screen.getByRole('button', { name: /enviar solicitud/i });
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('T059-023: Disabled buttons no deben ser focusables (accesibilidad)', () => {
      const propsDisabled = { ...props, estaCargando: true };
      render(<FormularioRecuperacion {...propsDisabled} />);
      const button = screen.getByRole('button', { name: /enviando solicitud/i });
      expect(button).toBeDisabled();
    });
  });

  describe('WCAG 2.1 AA Compliance - Color Independence', () => {
    let props: PropsFormularioRecuperacion;

    beforeEach(() => {
      props = {
        correo: '',
        errorCorreo: '',
        tocado: false,
        estaCargando: false,
        alCambiarCorreo: vi.fn(),
        alBlurCorreo: vi.fn(),
        alEnviar: vi.fn(),
        alRegresar: vi.fn()
      };
    });

    it('T059-024: Error debe indicarse con aria-invalid, no solo color', () => {
      const propsConError = {
        ...props,
        tocado: true,
        errorCorreo: 'Correo inválido'
      };
      render(<FormularioRecuperacion {...propsConError} />);
      const input = screen.getByRole('textbox', { name: /ingresa tu correo/i });
      // No solo por color (clase input--error) sino por aria-invalid
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('T059-025: Error debe ser anunciado como alert para screen readers', () => {
      const propsConError = {
        ...props,
        tocado: true,
        errorCorreo: 'Correo inválido'
      };
      render(<FormularioRecuperacion {...propsConError} />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('WCAG 2.1 AA Compliance - Semantic HTML', () => {
    let props: PropsFormularioRecuperacion;

    beforeEach(() => {
      props = {
        correo: '',
        errorCorreo: '',
        tocado: false,
        estaCargando: false,
        alCambiarCorreo: vi.fn(),
        alBlurCorreo: vi.fn(),
        alEnviar: vi.fn(),
        alRegresar: vi.fn()
      };
    });

    it('T059-026: Label debe estar asociado con input via htmlFor', () => {
      render(<FormularioRecuperacion {...props} />);
      const label = screen.getByText('Correo');
      const input = screen.getByRole('textbox', { name: /ingresa tu correo/i });
      expect(label).toHaveAttribute('for', 'correo');
      expect(input).toHaveAttribute('id', 'correo');
    });

    it('T059-027: Estructura de heading debe ser lógica (h1 -> h2)', () => {
      render(<FormularioRecuperacion {...props} />);
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toHaveTextContent('Recuperá tu cuenta');
    });
  });
});
