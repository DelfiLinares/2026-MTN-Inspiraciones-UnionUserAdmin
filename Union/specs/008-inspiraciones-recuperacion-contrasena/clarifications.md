# Clarifications — 008 Recuperación de Contraseña

**Versión**: 1.0  
**Estado**: ✅ Aclaraciones Completas  
**Fecha**: 2026-10-20  
**Módulo**: 008 Recuperación de Cuenta y Contraseña  

---

## Propósito

Este documento resuelve explícitamente las **10 ambigüedades** marcadas en `spec.md` para garantizar que el equipo de desarrollo tenga claridad total sobre los requisitos.

Cada aclaración incluye:
- **Decisión tomada**
- **Justificación**
- **Implicaciones**
- **Validación**

---

## Aclaración A-001: Validación de Dominio sin Punto

### Pregunta
¿Debe aceptarse "usuario@dominio" (sin extensión como .com)?

### Decisión
✅ **RECHAZAR** correos sin punto en el dominio.

### Justificación
1. **Práctica común**: El 99.9% de correos válidos tienen al menos un punto (ej: .com, .co, .ar)
2. **RFC pragmático**: Aunque RFC 5321 permite dominios sin punto, son excepciones (localhost, dominios internos)
3. **Experiencia de usuario**: Los usuarios esperan ver puntos en dominio
4. **MVP**: Mantenemos la validación simple y pragmática
5. **Consistencia**: Coincide con validación de HTML5 `<input type="email">`

### Implicaciones
- **Regex final**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Casos rechazados**: "usuario@dominio" (será error), "test@localhost" (será error)
- **Casos aceptados**: "usuario@dominio.com" ✓, "usuario@sub.dominio.co.uk" ✓

### Validación
```javascript
// Regex validada
const validRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Casos de prueba
validRegex.test("usuario@dominio.com");      // true ✓
validRegex.test("usuario@dominio");          // false ✓
validRegex.test("usuario@sub.dominio.co.uk");// true ✓
validRegex.test("test@localhost");           // false ✓
```

### Test Esperado
```javascript
describe("EmailValidator", () => {
  it("debe rechazar correo sin punto en dominio", () => {
    expect(isValidEmail("usuario@dominio")).toBe(false);
  });
  
  it("debe aceptar correo con punto en dominio", () => {
    expect(isValidEmail("usuario@dominio.com")).toBe(true);
  });
});
```

---

## Aclaración A-002: Validación en Tiempo Real vs Al Enviar

### Pregunta
¿Cuándo se valida el correo: mientras se escribe, al hacer blur, o solo al enviar?

### Decisión
✅ **VALIDACIÓN AL HACER BLUR + VALIDACIÓN AL ENVIAR** (Estrategia Mixta).

### Justificación
1. **UX**: Al hacer blur (salir del campo), el usuario recibe feedback sin frustración
2. **Accesibilidad**: El campo blur es un momento natural de validación
3. **Feedback**: Si el usuario intenta enviar y hay error, se muestra inmediatamente
4. **No validar en onChange**: Evita mostrar errores mientras el usuario está escribiendo
5. **Balance**: Feedback oportuno sin ser invasivo

### Comportamiento Esperado

**Escenario 1: Escribir y Salir del Campo**
```
1. Usuario hace focus en el campo
2. Usuario escribe: "usuario@" (inválido, pero sin error aún)
3. Usuario hace clic fuera del campo (blur)
4. Ahora aparece el error: "Ingresa un correo válido"
5. Usuario vuelve a escribir: "usuario@dominio.com"
6. El error desaparece al dejar de escribir (onChange debería limpiar error)
```

**Escenario 2: Intentar Enviar Sin Llenar**
```
1. Campo vacío
2. Usuario hace clic en "Continuar"
3. Error aparece: "El correo electrónico es requerido"
4. Usuario no puede avanzar
```

**Escenario 3: Intentar Enviar Con Error**
```
1. Usuario ingresa: "usuariodominio"
2. Usuario hace clic en "Continuar"
3. Error de validación aparece inmediatamente
4. El formulario no se envía
```

### Implicaciones
- **Handlers necesarios**:
  - `onBlur`: Validar y mostrar errores
  - `onChange`: Limpiar errores si el usuario retoma edición
  - `onSubmit`: Validar antes de enviar
- **Estado**: Necesita flag de "tocado" para no mostrar errores inicialmente
- **Accesibilidad**: `aria-invalid="true"` y `aria-describedby` cuando hay error

### Validación en Código
```javascript
// Estructura esperada en componente
const [email, setEmail] = useState("");
const [touched, setTouched] = useState(false);
const [errors, setErrors] = useState("");

const handleBlur = () => {
  setTouched(true);
  if (!isValidEmail(email)) {
    setErrors("Ingresa un correo válido");
  }
};

const handleChange = (value) => {
  setEmail(value.trim());
  // Limpiar error si el usuario retoma edición
  if (touched && value.length > 0) {
    setErrors("");
  }
};

const handleSubmit = () => {
  if (!isValidEmail(email)) {
    setTouched(true);
    setErrors("...mensaje específico...");
    return;
  }
  // Avanzar a confirmación
};
```

### Test Esperado
```javascript
describe("EmailValidation - Timing", () => {
  it("no debe mostrar error mientras se escribe", () => {
    // Usuario escribe, no hay error
  });
  
  it("debe mostrar error al hacer blur con email inválido", () => {
    // Usuario hace blur, aparece error
  });
  
  it("debe limpiar error si retoma edición después de blur", () => {
    // Usuario corrige, error desaparece
  });
  
  it("debe validar al hacer submit", () => {
    // Submit con error muestra validación
  });
});
```

---

## Aclaración A-003: Ruta de la Pantalla de Recuperación

### Pregunta
¿Cuál debe ser la ruta exacta en React Router?

### Decisión
✅ **RUTA**: `/recuperar-contrasena`

**Ruta alternativa** (si es bajo login): `/login/recuperar`

### Justificación
1. **Claridad**: Nombre en español, comprensible para usuarios
2. **Independencia**: Ruta propia, no anidada bajo `/login/`
3. **URL amigable**: Legible y descriptiva
4. **Flexibilidad**: Fácil de cambiar sin afectar estructura general
5. **SEO**: Si se abre a público, URL es razonable

### Estructura de Rutas
```javascript
// Opción A (Recomendada)
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/recuperar-contrasena" element={<RecoveryPage />} />
</Routes>

// Opción B (Alternativa)
<Routes>
  <Route path="/login" element={<LoginPage />}>
    <Route path="recuperar" element={<RecoveryPage />} />
  </Route>
</Routes>

// URL resultante:
// Opción A: /recuperar-contrasena
// Opción B: /login/recuperar
```

### Decisión Final
**USAR: `/recuperar-contrasena`** (Opción A)

### Navegación
```javascript
// En LoginPage (agregar enlace)
<Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>

// En RecoveryPage (regresar)
const navigate = useNavigate();
<button onClick={() => navigate("/login")}>Regresar al Login</button>
```

### Test Esperado
```javascript
describe("Navigation - Recovery Route", () => {
  it("debe navegar a /recuperar-contrasena al hacer clic", () => {
    // Verificar navegación a ruta correcta
  });
  
  it("debe renderizar componente Recovery en ruta correcta", () => {
    // Renderizar en /recuperar-contrasena y verificar componente
  });
  
  it("debe regresar a /login desde recovery", () => {
    // Verificar navegación hacia atrás
  });
});
```

---

## Aclaración A-004: Diseño Visual de Errores

### Pregunta
¿Cómo se muestran exactamente los errores visualmente?

### Decisión
✅ **COMBINACIÓN DE ESTILOS** (Borde Rojo + Mensaje):

### Especificación Visual

**1. Campo con Error**
- **Borde**: Color rojo (#E53E3E o similar, según paleta de la app)
- **Ancho del borde**: 2px (más visible que borde normal)
- **Fondo**: Sin cambio (mantener consistencia)
- **Ejemplo CSS**:
  ```css
  input.error {
    border-color: #E53E3E;
    border-width: 2px;
  }
  ```

**2. Mensaje de Error**
- **Posición**: Debajo del campo de entrada
- **Color**: Rojo (#E53E3E, mismo que borde)
- **Tamaño fuente**: Ligeramente menor que label (12px-13px)
- **Espaciado**: 4-8px de distancia desde el campo
- **Icono**: Opcional, pero recomendado (ej: ⚠️, ✕)
- **Ejemplo HTML**:
  ```html
  <div class="error-message">
    <span class="error-icon">✕</span>
    <span class="error-text">El correo electrónico es requerido</span>
  </div>
  ```

**3. Transición**
- **Mostrar error**: Inmediato (sin delay)
- **Ocultar error**: Inmediato (sin delay)
- **Fade opcional**: Transición suave de 200ms (opcional, no requerida)

**4. Accesibilidad**
- **ARIA**: `aria-invalid="true"` en el input
- **ARIA describe**: `aria-describedby="error-message-id"`
- **Label vinculado**: `<label for="email">Correo Electrónico</label>`

### Ejemplo de Implementación HTML/CSS

```html
<!-- Estado Normal -->
<div class="form-group">
  <label for="email" class="label">Correo Electrónico</label>
  <input 
    id="email"
    type="text"
    class="input"
    placeholder="usuario@ejemplo.com"
  />
</div>

<!-- Estado Con Error -->
<div class="form-group">
  <label for="email" class="label">Correo Electrónico</label>
  <input 
    id="email"
    type="text"
    class="input input--error"
    placeholder="usuario@ejemplo.com"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <div id="email-error" class="error-message">
    <span class="error-icon">✕</span>
    <span class="error-text">Ingresa un correo válido</span>
  </div>
</div>
```

```css
/* Estilos */
.input {
  border: 1px solid #CBD5E0;
  border-radius: 4px;
  padding: 8px 12px;
}

.input--error {
  border-color: #E53E3E;
  border-width: 2px;
}

.error-message {
  color: #E53E3E;
  font-size: 13px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.error-icon {
  font-weight: bold;
}
```

### Test Esperado
```javascript
describe("Error Display", () => {
  it("debe mostrar mensaje de error debajo del campo", () => {
    // Verificar que mensaje aparece en DOM
  });
  
  it("debe aplicar clase error al input", () => {
    // Verificar input tiene clase 'input--error'
  });
  
  it("debe tener atributo aria-invalid", () => {
    // Verificar accesibilidad
  });
});
```

---

## Aclaración A-005: Mensaje de Confirmación Exacto

### Pregunta
¿Cuál es el texto exacto del mensaje de confirmación?

### Decisión
✅ **MENSAJE ESTÁNDAR (Neutral y Claro)**:

```
"Si el correo electrónico corresponde a una cuenta registrada, 
recibirás instrucciones para recuperar tu contraseña."
```

### Requisitos del Mensaje
- ✅ **Neutral**: No revela si cuenta existe
- ✅ **Claro**: Fácil de entender para usuarios no técnicos
- ✅ **Honesto**: No promete envío real (dice "recibirás", no "hemos enviado")
- ✅ **Futura-proof**: Preparado para integración con backend
- ✅ **En español**: Según contexto de la app

### Contexto de Visualización

**Componente Recovery Confirmation**:
```jsx
const RecoveryConfirmation = ({ email }) => {
  return (
    <div className="confirmation-container">
      <h2>Solicitud Procesada</h2>
      
      {/* Icono o imagen de éxito */}
      <div className="success-icon">✓</div>
      
      {/* Mensaje neutral */}
      <p className="confirmation-message">
        Si el correo electrónico corresponde a una cuenta registrada,
        recibirás instrucciones para recuperar tu contraseña.
      </p>
      
      {/* Instrucciones adicionales */}
      <p className="secondary-text">
        Por favor, revisa tu bandeja de entrada y la carpeta de spam.
      </p>
      
      {/* Botón para regresar */}
      <button onClick={() => navigate("/login")}>
        Regresar al Login
      </button>
    </div>
  );
};
```

### Variantes (No Recomendadas, pero Mencionadas)

| Opción | Texto | Problema |
|--------|-------|----------|
| ❌ Opción 1 | "Se envió un correo de recuperación" | Promete envío real |
| ❌ Opción 2 | "Este correo está registrado" | Revela existencia de cuenta |
| ❌ Opción 3 | "Nada. Espera." | Demasiado casual, poco claro |
| ✅ Opción 4 | "Si el correo corresponde a una cuenta..." | **ESTA** |

### Test Esperado
```javascript
describe("Confirmation Message", () => {
  it("debe mostrar mensaje neutral sin revelar existencia de cuenta", () => {
    // Verificar texto exacto
    expect(screen.getByText(/Si el correo electrónico corresponde.../)).toBeInTheDocument();
  });
  
  it("debe ser el MISMO mensaje para cualquier correo ingresado", () => {
    // Enviar email-que-existe.com: mismo mensaje
    // Enviar email-falso.com: mismo mensaje
  });
  
  it("NO debe decir 'Se envió un correo'", () => {
    // Verificar que NO aparece texto de envío
    expect(screen.queryByText(/Se envió/)).not.toBeInTheDocument();
  });
});
```

---

## Aclaración A-006: Botón/Enlace para Regresar

### Pregunta
¿Debe ser un botón o un enlace para regresar?

### Decisión
✅ **BUTTON SECUNDARIO CLARO** en ambas pantallas:

- **En formulario**: Botón secundario "Regresar al Login"
- **En confirmación**: Botón primario "Regresar al Login"

### Especificación Visual

**En Pantalla de Formulario**:
```jsx
<div className="form-actions">
  {/* Botón primario - continuar */}
  <button className="button button--primary">Continuar</button>
  
  {/* Botón secundario - regresar */}
  <button className="button button--secondary" onClick={handleBack}>
    ← Regresar al Login
  </button>
</div>
```

**En Pantalla de Confirmación**:
```jsx
<div className="confirmation-actions">
  {/* Botón primario - regresar */}
  <button className="button button--primary" onClick={handleBack}>
    Regresar al Login
  </button>
</div>
```

### Estilos Esperados
- **Primario**: Fondo de color principal, texto blanco, prominente
- **Secundario**: Borde, sin fondo (outline), texto oscuro, menos prominente
- **Ambos**: Cursor pointer, hover effect, accesible

### Accesibilidad
- `aria-label` descriptivo (opcional): `aria-label="Regresar a la pantalla de login"`
- Tab order correcto
- Focus visible (outline cuando recibe foco)

### Test Esperado
```javascript
describe("Back Button", () => {
  it("debe navegar a /login al hacer clic", () => {
    // Verificar navegación
  });
  
  it("debe limpiar el formulario antes de navegar", () => {
    // Verificar que estado se reinicia
  });
  
  it("debe ser accesible con teclado (Enter/Space)", () => {
    // Tab + Enter debe funcionar
  });
});
```

---

## Aclaración A-007: Limpieza de Datos al Regresar

### Pregunta
¿Se limpian automáticamente los datos del formulario cuando se navega?

### Decisión
✅ **LIMPIEZA AUTOMÁTICA** al montar el componente:

```javascript
// Usar state local + useEffect para limpieza
useEffect(() => {
  return () => {
    // Al desmontar, limpiar no es necesario si usamos state local
    // El state se destruye automáticamente
  };
}, []);
```

### Estrategia de Gestión de Estado

**OPCIÓN A (Recomendada): State Local en Componente**
```javascript
const RecoveryPage = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState("");
  const [touched, setTouched] = useState(false);
  
  // State se destruye automáticamente al desmontar
  // No necesita limpieza explícita
  
  return (
    // ...
  );
};
```

**Ventajas**:
- ✅ Automático (no requiere lógica extra)
- ✅ Seguro (sin riesgo de datos persistidos)
- ✅ Simple (sin context o global state)

**OPCIÓN B (NO Recomendada): Limpieza Explícita**
```javascript
useEffect(() => {
  return () => {
    // Limpiar explícitamente (innecesario si usamos state local)
    setEmail("");
    setErrors("");
  };
}, []);
```

**OPCIÓN C (NO Recomendada): localStorage o SessionStorage**
```javascript
// NO hacer esto - requiere limpieza y riesgo de privacidad
localStorage.setItem("recoveryEmail", email);
```

### Comportamiento Esperado

**Flujo Completo**:
```
1. Usuario navega a /recuperar-contrasena
2. Ve formulario vacío (primer render)
3. Ingresa: "usuario@dominio.com"
4. Hace clic en "Regresar"
5. Navega a /login
6. Usuario navega nuevamente a /recuperar-contrasena
7. Ve formulario completamente vacío ✓
```

### Test Esperado
```javascript
describe("Data Cleanup", () => {
  it("debe mostrar formulario vacío al montar componente", () => {
    // Renderizar componente
    // Verificar que email === ""
  });
  
  it("debe limpiar datos al desmontar", () => {
    // Simular desmontaje (unmount)
    // Renderizar nuevamente
    // Verificar que datos están limpios
  });
  
  it("no debe persistir email entre visitas", () => {
    // Navegar a recovery
    // Ingresar email
    // Navegar a login
    // Navegar nuevamente a recovery
    // Verificar que email está vacío
  });
});
```

---

## Aclaración A-008: Integración con Login Existente

### Pregunta
¿Cómo se integra exactamente con el componente Login?

### Decisión
✅ **AGREGAR ENLACE AL COMPONENTE LOGIN EXISTENTE**:

Modificar el componente `LoginPage` para incluir el enlace "¿Olvidaste tu contraseña?".

### Ubicación en Pantalla

**Ubicación Recomendada**:
```jsx
<LoginPage>
  {/* Formulario de login */}
  <form>
    <input placeholder="Email" />
    <input placeholder="Contraseña" />
    <button>Iniciar Sesión</button>
  </form>
  
  {/* Nuevo: Enlace de recuperación */}
  <div className="login-footer">
    <p>
      ¿Olvidaste tu contraseña? 
      <Link to="/recuperar-contrasena">Recupera aquí</Link>
    </p>
  </div>
  
  {/* Otros enlaces existentes (ej: Registro) */}
  <p>
    ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
  </p>
</LoginPage>
```

### Implementación

**En archivo `LoginPage.tsx` o `Login.tsx`**:
```jsx
import { Link } from 'react-router-dom';

export const LoginPage = () => {
  return (
    <div className="login-container">
      <h1>Iniciar Sesión</h1>
      
      {/* Formulario existente */}
      <form>
        {/* ... campos de login ... */}
      </form>
      
      {/* Nuevo: Agregar aquí */}
      <div className="login-links">
        <Link to="/recuperar-contrasena" className="link-recovery">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </div>
  );
};
```

### Estilos CSS

```css
.login-links {
  margin-top: 16px;
  text-align: center;
}

.link-recovery {
  color: #3182CE;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
}

.link-recovery:hover {
  text-decoration: underline;
}

.link-recovery:focus {
  outline: 2px solid #3182CE;
  outline-offset: 2px;
}
```

### Test Esperado
```javascript
describe("LoginPage - Recovery Link", () => {
  it("debe mostrar enlace '¿Olvidaste tu contraseña?'", () => {
    const { getByText } = render(<LoginPage />);
    expect(getByText(/Olvidaste tu contraseña/)).toBeInTheDocument();
  });
  
  it("debe navegar a /recuperar-contrasena al hacer clic", () => {
    const { getByText } = render(<LoginPage />);
    fireEvent.click(getByText(/Olvidaste tu contraseña/));
    expect(window.location.pathname).toBe("/recuperar-contrasena");
  });
  
  it("debe ser accesible con teclado", () => {
    // Tab + Enter debe funcionar
  });
});
```

---

## Aclaración A-009: Regex Exacto para Validación

### Pregunta
¿Cuál es el regex exacto para validar correos?

### Decisión
✅ **REGEX PRAGMÁTICO SIMPLE**:

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### Desglose del Regex
```
^          = Inicio de la cadena
[^\s@]+    = Una o más caracteres que NO sean espacio ni @
@          = Símbolo @
[^\s@]+    = Una o más caracteres que NO sean espacio ni @
\.         = Un punto literal (escapado)
[^\s@]+    = Una o más caracteres que NO sean espacio ni @
$          = Fin de la cadena
```

### Casos de Prueba Validados

| Email | Válido | Razón |
|-------|--------|-------|
| usuario@dominio.com | ✅ | Formato estándar |
| nombre.apellido@empresa.co.uk | ✅ | Subdominio con puntos |
| usuario+tag@dominio.com | ✅ | Plus addressing |
| usuario_nombre@dominio.com | ✅ | Underscore válido |
| usuario-nombre@dominio.com | ✅ | Guión válido |
| Usuario@Dominio.COM | ✅ | Mayúsculas válidas |
| usuario@dominio | ❌ | Sin punto en dominio |
| usuario@@dominio.com | ❌ | Doble @ |
| usuario @dominio.com | ❌ | Espacio antes de @ |
| @dominio.com | ❌ | Sin usuario |
| usuario@.com | ❌ | Sin dominio entre @ y . |
| usuario@dominio. | ❌ | Sin extensión |
| "" (vacío) | ❌ | Campo requerido |

### Implementación en Validador

```javascript
// archivo: emailValidator.ts

export const isValidEmail = (email: string): boolean => {
  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmedEmail);
};

// Casos de validación
export const validateEmail = (email: string): {
  isValid: boolean;
  error?: string;
} => {
  const trimmed = email.trim();
  
  if (!trimmed) {
    return {
      isValid: false,
      error: "El correo electrónico es requerido"
    };
  }
  
  if (!isValidEmail(trimmed)) {
    return {
      isValid: false,
      error: "Ingresa un correo electrónico válido"
    };
  }
  
  return { isValid: true };
};
```

### Test Esperado
```javascript
describe("EmailValidator", () => {
  describe("isValidEmail", () => {
    it("debe aceptar formato estándar", () => {
      expect(isValidEmail("usuario@dominio.com")).toBe(true);
    });
    
    it("debe aceptar subdominios con puntos", () => {
      expect(isValidEmail("usuario@empresa.co.uk")).toBe(true);
    });
    
    it("debe rechazar correo sin punto en dominio", () => {
      expect(isValidEmail("usuario@dominio")).toBe(false);
    });
    
    it("debe rechazar correo con doble @", () => {
      expect(isValidEmail("usuario@@dominio.com")).toBe(false);
    });
    
    it("debe rechazar correo con espacio", () => {
      expect(isValidEmail("usuario @dominio.com")).toBe(false);
    });
    
    it("debe trimear espacios automáticamente", () => {
      expect(isValidEmail("  usuario@dominio.com  ")).toBe(true);
    });
  });
  
  describe("validateEmail", () => {
    it("debe retornar error específico si está vacío", () => {
      const result = validateEmail("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("El correo electrónico es requerido");
    });
    
    it("debe retornar error específico si formato es inválido", () => {
      const result = validateEmail("usuariodominio");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Ingresa un correo electrónico válido");
    });
  });
});
```

---

## Aclaración A-010: Estados de Carga/Procesamiento

### Pregunta
¿Se muestra un spinner o estado de carga?

### Decisión
✅ **SIMULAR ESTADO DE CARGA CON SPINNER OPCIONAL**:

- **Durante formulario**: No mostrar spinner (sin procesamiento)
- **Al enviar (submit)**: Mostrar spinner brevemente (500ms-1000ms) para simular procesamiento
- **Estructura**: Preparada para futura integración con API real

### Comportamiento en Fases

**Fase 1: Formulario (Sin Spinner)**
```
Estado: "idle" o "editing"
Lo que se muestra: Formulario, sin spinner
Botón: Habilitado (si email es válido)
```

**Fase 2: Enviando (Con Spinner Simulado)**
```
Estado: "loading"
Lo que se muestra: Spinner/loader con texto "Procesando..."
Botón: Deshabilitado, con spinner dentro
Duración: 500ms-1000ms (simulado)
```

**Fase 3: Confirmación (Sin Spinner)**
```
Estado: "success"
Lo que se muestra: Pantalla de confirmación
Botón: Regresar al Login (habilitado)
```

### Implementación Recomendada

```javascript
// Estados posibles
type RecoveryState = 'idle' | 'loading' | 'success' | 'error';

export const RecoveryPage = () => {
  const [state, setState] = useState<RecoveryState>('idle');
  const [email, setEmail] = useState("");
  
  const handleSubmit = async () => {
    // Validar
    if (!isValidEmail(email)) return;
    
    // Entrar en estado loading
    setState('loading');
    
    // Simular procesamiento (500-1000ms)
    await new Promise(resolve => 
      setTimeout(resolve, 750) // 750ms de espera
    );
    
    // Ir a confirmación
    setState('success');
  };
  
  if (state === 'success') {
    return <RecoveryConfirmation />;
  }
  
  if (state === 'loading') {
    return (
      <div className="recovery-loading">
        <Spinner />
        <p>Procesando tu solicitud...</p>
      </div>
    );
  }
  
  return <RecoveryForm onSubmit={handleSubmit} />;
};
```

### Componente Spinner

```jsx
// Usar CSS animado o librería existente
const Spinner = () => (
  <div className="spinner">
    <div className="spinner-ring"></div>
  </div>
);
```

```css
.spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.spinner-ring {
  border: 4px solid #E2E8F0;
  border-top: 4px solid #3182CE;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### Test Esperado
```javascript
describe("Loading State", () => {
  it("debe mostrar spinner cuando está enviando", async () => {
    const { getByText } = render(<RecoveryPage />);
    fireEvent.click(getByText("Continuar"));
    
    expect(getByText("Procesando tu solicitud...")).toBeInTheDocument();
  });
  
  it("debe desaparecer spinner después de 1s y mostrar confirmación", async () => {
    jest.useFakeTimers();
    // ... test ...
    jest.advanceTimersByTime(1000);
    // ... verificar confirmación visible ...
    jest.useRealTimers();
  });
  
  it("debe desabilitar botón durante carga", () => {
    // Verificar que botón está disabled durante loading
  });
});
```

### Notas Importantes
- **SIN API real**: El delay es simulado (setTimeout)
- **Preparado para integración**: Puede reemplazarse fácilmente con async/await + fetch
- **UX**: El spinner proporciona feedback visual al usuario

---

## Resumen de Decisiones

| Ambigüedad | Decisión | Impacto |
|-----------|----------|--------|
| A-001 | Rechazar emails sin punto | Regex más específico |
| A-002 | Validación blur + submit | Mejor UX, menos frustración |
| A-003 | Ruta: `/recuperar-contrasena` | Estructura de rutas clara |
| A-004 | Borde rojo + mensaje | Accesibilidad visual |
| A-005 | Mensaje neutral estándar | Privacidad garantizada |
| A-006 | Button secundario | Navegación clara |
| A-007 | State local (limpieza automática) | Seguridad, simplicidad |
| A-008 | Enlace en Login | Integración minimal |
| A-009 | Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | Validación pragmática |
| A-010 | Spinner 500-1000ms (simulado) | Feedback visual |

---

**Estado**: Todas las aclaraciones completadas  
**Versión**: 1.0  
**Fecha**: 2026-10-20  
**Próximo paso**: Crear data-model.md
