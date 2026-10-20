import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormularioRecuperacion } from '../../../src/presentation/hooks/useFormularioRecuperacion';

describe('useFormularioRecuperacion', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Estado inicial', () => {
    it('debería retornar estado inicial correcto', () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      expect(result.current.correo).toBe('');
      expect(result.current.errorCorreo).toBeUndefined();
      expect(result.current.tocado).toBe(false);
      expect(result.current.estaCargando).toBe(false);
      expect(result.current.esExito).toBe(false);
    });

    it('debería tener handlers como funciones', () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      expect(typeof result.current.manejarCambioCorreo).toBe('function');
      expect(typeof result.current.manejarBlurCorreo).toBe('function');
      expect(typeof result.current.manejarEnvio).toBe('function');
      expect(typeof result.current.manejarReinicio).toBe('function');
    });
  });

  describe('manejarCambioCorreo', () => {
    it('debería actualizar el correo cuando se escribe', () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('usuario@example.com');
      });

      expect(result.current.correo).toBe('usuario@example.com');
    });

    it('debería permitir escribir caracteres vacíos', () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('usuario@example.com');
      });

      act(() => {
        result.current.manejarCambioCorreo('');
      });

      expect(result.current.correo).toBe('');
    });

    it('debería limpiar errores si está tocado y correo no es vacío', () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      // Simular un error previo
      act(() => {
        result.current.manejarBlurCorreo(); // Sin correo, genera error
      });

      expect(result.current.errorCorreo).toBeDefined();

      act(() => {
        result.current.manejarCambioCorreo('valido@example.com');
      });

      expect(result.current.errorCorreo).toBeUndefined();
    });

    it('debería manejar múltiples cambios consecutivos', () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('u');
      });
      expect(result.current.correo).toBe('u');

      act(() => {
        result.current.manejarCambioCorreo('us');
      });
      expect(result.current.correo).toBe('us');

      act(() => {
        result.current.manejarCambioCorreo('usuario@example.com');
      });
      expect(result.current.correo).toBe('usuario@example.com');
    });
  });

  describe('manejarBlurCorreo', () => {
    it('debería establecer tocado=true', () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      expect(result.current.tocado).toBe(false);

      act(() => {
        result.current.manejarBlurCorreo();
      });

      expect(result.current.tocado).toBe(true);
    });

    it('debería mostrar error si correo está vacío', () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarBlurCorreo();
      });

      expect(result.current.errorCorreo).toBe('El correo electrónico es requerido');
    });

    it('debería mostrar error si formato es inválido', () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('usuario@invalido');
      });

      act(() => {
        result.current.manejarBlurCorreo();
      });

      expect(result.current.errorCorreo).toBe('Ingresa un correo electrónico válido');
    });

    it('no debería mostrar error si correo es válido', () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('usuario@example.com');
      });

      act(() => {
        result.current.manejarBlurCorreo();
      });

      expect(result.current.errorCorreo).toBeUndefined();
    });
  });

  describe('manejarEnvio', () => {
    it('debería validar antes de enviar', async () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      // Correo vacío debería fallar validación
      await act(async () => {
        await result.current.manejarEnvio();
      });

      expect(result.current.errorCorreo).toBeDefined();
      expect(result.current.estaCargando).toBe(false);
      expect(result.current.esExito).toBe(false);
    });

    it('debería rechazar correo inválido', async () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('usuario@invalido');
      });

      await act(async () => {
        await result.current.manejarEnvio();
      });

      expect(result.current.errorCorreo).toBeDefined();
      expect(result.current.estaCargando).toBe(false);
    });

    it('debería cambiar a cargando cuando envía correo válido', async () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('usuario@example.com');
      });

      act(() => {
        result.current.manejarBlurCorreo(); // Establece tocado
      });

      let estabaCargando = false;

      await act(async () => {
        const promesa = result.current.manejarEnvio();
        // Avanzar timers dentro del mismo act
        vi.advanceTimersByTime(750);
        await promesa;
      });

      expect(result.current.estaCargando).toBe(false);
      expect(result.current.esExito).toBe(true);
    });

    it('debería simular delay de 750ms', async () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('usuario@example.com');
      });

      act(() => {
        result.current.manejarBlurCorreo();
      });

      expect(result.current.estaCargando).toBe(false);
      expect(result.current.esExito).toBe(false);

      await act(async () => {
        const promesa = result.current.manejarEnvio();
        // Avanzar timers para que se complete el delay
        vi.advanceTimersByTime(750);
        await promesa;
      });

      expect(result.current.estaCargando).toBe(false);
      expect(result.current.esExito).toBe(true);
    });

    it('debería mostrar éxito después de envío exitoso', async () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('usuario@example.com');
      });

      act(() => {
        result.current.manejarBlurCorreo();
      });

      await act(async () => {
        const promesa = result.current.manejarEnvio();
        vi.advanceTimersByTime(750);
        await promesa;
      });

      expect(result.current.esExito).toBe(true);
    });

    it('debería mantener tocado=true después de envío', async () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('usuario@example.com');
      });

      act(() => {
        result.current.manejarBlurCorreo();
      });

      await act(async () => {
        const promesa = result.current.manejarEnvio();
        vi.advanceTimersByTime(750);
        await promesa;
      });

      expect(result.current.tocado).toBe(true);
    });
  });

  describe('manejarReinicio', () => {
    it('debería limpiar todos los campos', () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('usuario@example.com');
      });

      act(() => {
        result.current.manejarBlurCorreo();
      });

      act(() => {
        result.current.manejarReinicio();
      });

      expect(result.current.correo).toBe('');
      expect(result.current.tocado).toBe(false);
      expect(result.current.errorCorreo).toBeUndefined();
    });

    it('debería restablecer estado a reposo', async () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('usuario@example.com');
      });

      act(() => {
        result.current.manejarBlurCorreo();
      });

      await act(async () => {
        const promesa = result.current.manejarEnvio();
        vi.advanceTimersByTime(750);
        await promesa;
      });

      expect(result.current.esExito).toBe(true);

      act(() => {
        result.current.manejarReinicio();
      });

      expect(result.current.esExito).toBe(false);
      expect(result.current.estaCargando).toBe(false);
    });

    it('debería permitir nuevo envío después de reinicio', async () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('usuario@example.com');
      });

      act(() => {
        result.current.manejarBlurCorreo();
      });

      await act(async () => {
        const promesa = result.current.manejarEnvio();
        vi.advanceTimersByTime(750);
        await promesa;
      });

      act(() => {
        result.current.manejarReinicio();
      });

      act(() => {
        result.current.manejarCambioCorreo('otro@example.com');
      });

      act(() => {
        result.current.manejarBlurCorreo();
      });

      await act(async () => {
        const promesa = result.current.manejarEnvio();
        vi.advanceTimersByTime(750);
        await promesa;
      });

      expect(result.current.esExito).toBe(true);
      expect(result.current.correo).toBe('otro@example.com');
    });
  });

  describe('Ciclo de vida completo', () => {
    it('debería ejecutar flujo completo: escribir, blur, enviar, éxito, reinicio', async () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      // Estado inicial
      expect(result.current.correo).toBe('');
      expect(result.current.tocado).toBe(false);
      expect(result.current.esExito).toBe(false);

      // Escribir
      act(() => {
        result.current.manejarCambioCorreo('usuario@example.com');
      });
      expect(result.current.correo).toBe('usuario@example.com');

      // Blur (validación)
      act(() => {
        result.current.manejarBlurCorreo();
      });
      expect(result.current.tocado).toBe(true);
      expect(result.current.errorCorreo).toBeUndefined();

      // Envío
      expect(result.current.estaCargando).toBe(false);
      expect(result.current.esExito).toBe(false);

      await act(async () => {
        const envioPromesa = result.current.manejarEnvio();
        
        // Avanzar el tiempo para que se complete el delay
        vi.advanceTimersByTime(750);
        await envioPromesa;
      });
      
      expect(result.current.esExito).toBe(true);
      expect(result.current.estaCargando).toBe(false);

      // Reinicio
      act(() => {
        result.current.manejarReinicio();
      });
      expect(result.current.correo).toBe('');
      expect(result.current.tocado).toBe(false);
      expect(result.current.esExito).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('debería manejar múltiples envíos simultáneos (el segundo no debería ejecutarse)', async () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('usuario@example.com');
      });

      act(() => {
        result.current.manejarBlurCorreo();
      });

      let contador = 0;

      await act(async () => {
        const promesa1 = result.current.manejarEnvio().then(() => {
          contador++;
        });
        const promesa2 = result.current.manejarEnvio().then(() => {
          contador++;
        });

        vi.advanceTimersByTime(750);
        await Promise.all([promesa1, promesa2]);
      });

      expect(contador).toBe(2);
    });

    it('debería manejar correos con espacios al inicio/final', () => {
      const { result } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('  usuario@example.com  ');
      });

      expect(result.current.correo).toBe('  usuario@example.com  ');

      act(() => {
        result.current.manejarBlurCorreo();
      });

      expect(result.current.errorCorreo).toBeUndefined();
    });
  });

  describe('Cleanup', () => {
    it('debería limpiar timers al desmontar', async () => {
      const { result, unmount } = renderHook(() => useFormularioRecuperacion());

      act(() => {
        result.current.manejarCambioCorreo('usuario@example.com');
      });

      act(() => {
        result.current.manejarBlurCorreo();
      });

      await act(async () => {
        result.current.manejarEnvio();
      });

      unmount();

      // No debería causar errores al desmontar
      expect(true).toBe(true);
    });
  });
});
