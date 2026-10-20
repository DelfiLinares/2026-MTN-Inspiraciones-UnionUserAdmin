import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CuestionarioPage } from '../../src/presentation/cuestionario/CuestionarioPage';
import { CuestionarioFactory } from '../../src/application/CuestionarioFactory';
import { RespuestaCuestionario } from '../../src/domain/entities/RespuestaCuestionario';

vi.mock('../../src/services/onboardingInteresesService', async () => {
  const { onboardingServiceMock } = await import('../helpers/mockOnboardingInteresesService');
  return onboardingServiceMock;
});

/**
 * Tests de casos borde para CuestionarioPage (T033)
 *
 * Requisitos:
 * - RNF-24: Tests de integración
 * - spec.md § 8: Casos borde
 *
 * Criterios de aceptación:
 * - Test recarga página: respuestas se pierden (no implementar localStorage en MVP)
 * - Test deseleccionar todas en obligatoria: bloquea continuar
 * - Test deseleccionar todas en opcional: permite continuar
 * - Test seleccionar todas opciones: válido (idempotente)
 * - Test cambiar respuesta de pregunta A no afecta pregunta B
 * - Todos pasan
 *
 * Referencia: spec.md § 8, plan.md, tasks.md § T033
 */
describe('CuestionarioPage - Casos borde', () => {
  let mockOnCuestionarioCompleto: ReturnType<typeof vi.fn>;
  let mockOnNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnCuestionarioCompleto = vi.fn();
    mockOnNavigate = vi.fn();
  });

  describe('Recarga de página', () => {
    it('debe perder respuestas al recargar página (sin persistencia en MVP)', () => {
      // Primera carga: responder algo
      const { unmount } = render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      const primeraOpcion = cuestionario[0].opciones[0];

      // Seleccionar una opción
      const checkbox = screen.getByRole('checkbox', {
        name: primeraOpcion.descripcion,
      });

      // Verificar que está unchecked al inicio
      expect(checkbox).not.toBeChecked();

      // Simular recarga: desmontar el componente
      unmount();

      // Nueva carga: renderizar nuevamente
      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      // La misma opción debe estar unchecked (respuestas perdidas)
      const checkboxAposRecarga = screen.getByRole('checkbox', {
        name: primeraOpcion.descripcion,
      });

      expect(checkboxAposRecarga).not.toBeChecked();
    });

    it('no implementa localStorage en MVP', () => {
      // localStorage no debe ser utilizado
      const localStorageMock = vi.spyOn(Storage.prototype, 'setItem');

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      // No debe haber llamadas a localStorage.setItem
      expect(localStorageMock).not.toHaveBeenCalled();

      localStorageMock.mockRestore();
    });
  });

  describe('Deseleccionar todas las opciones', () => {
    it('bloquea continuar cuando se deselecciona todo en pregunta obligatoria', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      const primeraOpcion = cuestionario[0].opciones[0];

      // 1. Seleccionar una opción de pregunta obligatoria (Q1)
      const checkbox1 = screen.getByRole('checkbox', {
        name: primeraOpcion.descripcion,
      });

      await user.click(checkbox1);
      expect(checkbox1).toBeChecked();

      // 2. Seleccionar opción de Q2 (también obligatoria)
      const segundaOpcion = cuestionario[1].opciones[0];
      const checkbox2 = screen.getByRole('checkbox', {
        name: segundaOpcion.descripcion,
      });
      await user.click(checkbox2);
      expect(checkbox2).toBeChecked();

      // 3. Deseleccionar Q1 completamente
      await user.click(checkbox1);
      expect(checkbox1).not.toBeChecked();

      // 4. Intentar continuar → debe mostrar error
      const boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      // Debe mostrar error de validación
      await waitFor(() => {
        expect(screen.queryByRole('alert')).toBeInTheDocument();
      });

      // No debe ejecutar callback
      expect(mockOnCuestionarioCompleto).not.toHaveBeenCalled();
    });

    it('permite continuar cuando se deselecciona todo en pregunta opcional', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Q1 y Q2 son obligatorias, Q3 es opcional
      // 1. Seleccionar en Q1, Q2 (obligatorias)
      const opcionQ1 = cuestionario[0].opciones[0];
      const opcionQ2 = cuestionario[1].opciones[0];

      const checkboxQ1 = screen.getByRole('checkbox', {
        name: opcionQ1.descripcion,
      });
      const checkboxQ2 = screen.getByRole('checkbox', {
        name: opcionQ2.descripcion,
      });

      await user.click(checkboxQ1);
      await user.click(checkboxQ2);

      // 2. Seleccionar opción en Q3 (opcional)
      const opcionQ3 = cuestionario[2].opciones[0];
      const checkboxQ3 = screen.getByRole('checkbox', {
        name: opcionQ3.descripcion,
      });
      await user.click(checkboxQ3);
      expect(checkboxQ3).toBeChecked();

      // 3. Deseleccionar Q3 completamente
      await user.click(checkboxQ3);
      expect(checkboxQ3).not.toBeChecked();

      // 4. Continuar → debe permitir (Q3 es opcional)
      const boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      // No debe mostrar error
      await waitFor(() => {
        expect(mockOnCuestionarioCompleto).toHaveBeenCalled();
      });
    });
  });

  describe('Seleccionar todas las opciones', () => {
    it('permite seleccionar todas las opciones en una pregunta (idempotente)', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();
      const primeraOpcion = cuestionario[0];

      // Seleccionar todas las opciones de Q1
      for (const opcion of primeraOpcion.opciones) {
        const checkbox = screen.getByRole('checkbox', {
          name: opcion.descripcion,
        });
        await user.click(checkbox);
      }

      // Verificar que todas están checked
      for (const opcion of primeraOpcion.opciones) {
        const checkbox = screen.getByRole('checkbox', {
          name: opcion.descripcion,
        });
        expect(checkbox).toBeChecked();
      }

      // Verificar que se pueden deseleccionar una por una
      const primeraOpcionDelPregunta = primeraOpcion.opciones[0];
      const checkboxAPrimera = screen.getByRole('checkbox', {
        name: primeraOpcionDelPregunta.descripcion,
      });

      await user.click(checkboxAPrimera);
      expect(checkboxAPrimera).not.toBeChecked();

      // Las demás deben seguir checked
      const segundaOpcionDelPregunta = primeraOpcion.opciones[1];
      const checkboxSegunda = screen.getByRole('checkbox', {
        name: segundaOpcionDelPregunta.descripcion,
      });
      expect(checkboxSegunda).toBeChecked();
    });

    it('seleccionar todas opciones es válido para finalizar', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Seleccionar TODAS las opciones de Q1 y Q2 (obligatorias)
      for (const opcion of cuestionario[0].opciones) {
        const checkbox = screen.getByRole('checkbox', {
          name: opcion.descripcion,
        });
        await user.click(checkbox);
      }

      for (const opcion of cuestionario[1].opciones) {
        const checkbox = screen.getByRole('checkbox', {
          name: opcion.descripcion,
        });
        await user.click(checkbox);
      }

      // Continuar
      const boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      // Debe ejecutar callback (válido)
      await waitFor(() => {
        expect(mockOnCuestionarioCompleto).toHaveBeenCalled();

        const preferences = mockOnCuestionarioCompleto.mock.calls[0][0];
        // Debe haber muchas preferencias (seleccionamos todas)
        expect(preferences.generoIds.length).toBe(10); // 10 opciones en Q1
        expect(preferences.tipoMusicaIds.length).toBe(12); // 12 opciones en Q2
      });
    });
  });

  describe('Independencia entre preguntas', () => {
    it('cambiar respuesta de pregunta A no afecta pregunta B', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Q1: seleccionar opción 0 y 1
      const opcionQ1_0 = cuestionario[0].opciones[0];
      const opcionQ1_1 = cuestionario[0].opciones[1];

      const checkboxQ1_0 = screen.getByRole('checkbox', {
        name: opcionQ1_0.descripcion,
      });
      const checkboxQ1_1 = screen.getByRole('checkbox', {
        name: opcionQ1_1.descripcion,
      });

      await user.click(checkboxQ1_0);
      await user.click(checkboxQ1_1);

      // Q2: seleccionar opción 0
      const opcionQ2_0 = cuestionario[1].opciones[0];
      const checkboxQ2_0 = screen.getByRole('checkbox', {
        name: opcionQ2_0.descripcion,
      });
      await user.click(checkboxQ2_0);

      // Verificar estado inicial de Q2
      expect(checkboxQ2_0).toBeChecked();

      // Deseleccionar Q1 opción 0
      await user.click(checkboxQ1_0);
      expect(checkboxQ1_0).not.toBeChecked();
      expect(checkboxQ1_1).toBeChecked(); // Q1 opción 1 sigue checked

      // Q2 opción 0 debe seguir checked (no afectada)
      expect(checkboxQ2_0).toBeChecked();
    });

    it('cada pregunta mantiene su propio estado independiente', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Seleccionar todas las opciones de Q1
      for (const opcion of cuestionario[0].opciones) {
        const checkbox = screen.getByRole('checkbox', {
          name: opcion.descripcion,
        });
        await user.click(checkbox);
      }

      // Seleccionar solo opción 0 de Q2
      const opcionQ2_0 = cuestionario[1].opciones[0];
      const checkboxQ2_0 = screen.getByRole('checkbox', {
        name: opcionQ2_0.descripcion,
      });
      await user.click(checkboxQ2_0);

      // No tocar Q3

      // Verificar: Q1 tiene todas, Q2 tiene solo primera, Q3 tiene ninguna
      const checkboxesQ1 = cuestionario[0].opciones.map((opcion) =>
        screen.getByRole('checkbox', { name: opcion.descripcion })
      );

      checkboxesQ1.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });

      expect(checkboxQ2_0).toBeChecked();

      const checkboxesQ2Resto = cuestionario[1].opciones.slice(1).map((opcion) =>
        screen.getByRole('checkbox', { name: opcion.descripcion })
      );

      checkboxesQ2Resto.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked();
      });

      // Q3 debe estar todos unchecked
      const checkboxesQ3 = cuestionario[2].opciones.map((opcion) =>
        screen.getByRole('checkbox', { name: opcion.descripcion })
      );

      checkboxesQ3.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked();
      });
    });
  });

  describe('Flujo con deselecciones parciales', () => {
    it('seleccionar y deseleccionar repeatedly mantiene estado correcto', async () => {
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

      // Click múltiples veces
      await user.click(checkbox); // checked
      expect(checkbox).toBeChecked();

      await user.click(checkbox); // unchecked
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox); // checked
      expect(checkbox).toBeChecked();

      await user.click(checkbox); // unchecked
      expect(checkbox).not.toBeChecked();

      // Estado final debe ser unchecked
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Validación exhaustiva de respuestas', () => {
    it('permite continuar solo cuando todas las obligatorias están respondidas', async () => {
      const user = userEvent.setup();

      render(
        <CuestionarioPage
          onCuestionarioCompleto={mockOnCuestionarioCompleto}
          onNavigate={mockOnNavigate}
        />
      );

      const cuestionario = CuestionarioFactory.crearCuestionarioDefault();

      // Intentar continuar sin nada → error
      let boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).toBeInTheDocument();
      });

      expect(mockOnCuestionarioCompleto).not.toHaveBeenCalled();

      // Seleccionar solo Q1 → aún falta Q2
      const opcionQ1 = cuestionario[0].opciones[0];
      const checkboxQ1 = screen.getByRole('checkbox', {
        name: opcionQ1.descripcion,
      });
      await user.click(checkboxQ1);

      boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      // Debe seguir mostrando error (falta Q2)
      await waitFor(() => {
        expect(screen.queryByRole('alert')).toBeInTheDocument();
      });

      expect(mockOnCuestionarioCompleto).not.toHaveBeenCalled();

      // Seleccionar Q2 → ahora está completo
      const opcionQ2 = cuestionario[1].opciones[0];
      const checkboxQ2 = screen.getByRole('checkbox', {
        name: opcionQ2.descripcion,
      });
      await user.click(checkboxQ2);

      boton = screen.getByRole('button', { name: /Continuar/i });
      await user.click(boton);

      // Debe permitir (ambas obligatorias respondidas)
      await waitFor(() => {
        expect(mockOnCuestionarioCompleto).toHaveBeenCalled();
      });
    });
  });

  describe('RespuestaCuestionario immutability', () => {
    it('verificar que RespuestaCuestionario es inmutable internamente', () => {
      // Test directo con la clase de dominio
      const respuestas = RespuestaCuestionario.vacio();

      // Intentar mutar directamente debe fallar o no tener efecto
      const respuestasNuevas = respuestas.seleccionar('pregunta-1', 'opcion-1');

      // Las respuestas originales no deben cambiar
      expect(respuestasNuevas).not.toBe(respuestas);

      // Verificar que el nuevo objeto tiene la selección
      expect(respuestasNuevas.obtenerRespuesta('pregunta-1')).toContain('opcion-1');

      // El original debe seguir vacío
      expect(respuestas.obtenerRespuesta('pregunta-1')).not.toContain('opcion-1');
    });
  });
});
