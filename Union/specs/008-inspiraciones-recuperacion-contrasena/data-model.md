# Data Model — 008 Recuperación de Contraseña# Data Model — 008 Recuperación de Contraseña# Data Model — 008 Recuperación de Contraseña



**Versión**: 1.0  

**Estado**: ✅ Modelo de Datos Completo  

**Fecha**: 2026-10-20  **Versión**: 1.0  **Versión**: 1.0  

**Módulo**: 008 Recuperación de Cuenta y Contraseña  

**Estado**: ✅ Modelo de Datos Completo  **Estado**: ✅ Modelo de Datos Completo  

---

**Fecha**: 2026-10-20  **Fecha**: 2026-10-20  

## Propósito

**Módulo**: 008 Recuperación de Cuenta y Contraseña  **Módulo**: 008 Recuperación de Cuenta y Contraseña  

Este documento define el modelo de datos, entidades, value objects y tipos TypeScript del módulo 008, siguiendo DDD (Domain-Driven Design) consistente con módulo 006.



---

------

## 1. Arquitectura General



```

Domain Layer## Propósito## Propósito

├── Value Objects

│   ├── CorreoElectronico

│   └── EstadoFormularioRecuperacion

├── EntitiesEste documento define el modelo de datos, entidades, value objects y tipos TypeScript del módulo 008, siguiendo DDD (Domain-Driven Design) consistente con módulo 006. Contiene definiciones de domain, application y presentation layers con énfasis en decisiones de arquitectura y trazabilidad.Este documento define el modelo de datos, entidades, value objects y tipos TypeScript del módulo 008, siguiendo DDD (Domain-Driven Design) consistente con módulo 006. Contiene definiciones de domain, application y presentation layers con énfasis en decisiones de arquitectura y trazabilidad.

│   └── SolicitudRecuperacion

└── Services

    └── ValidadorCorreoElectronico

------

Application Layer

├── Services

│   └── ServicioFormularioRecuperacion

├── DTOs## 1. Arquitectura General## 1. Arquitectura General

│   └── DTOFormularioRecuperacion

└── Factories

    └── FabricaSolicitudRecuperacion

``````

Presentation Layer

├── HooksDomain LayerDomain Layer

│   └── useFormularioRecuperacion

├── Components├── Value Objects├── Value Objects

│   ├── FormularioRecuperacion

│   └── ConfirmacionRecuperacion│   ├── CorreoElectronico│   ├── CorreoElectronico

└── Pages

    └── PaginaRecuperacion│   └── EstadoFormularioRecuperacion│   └── EstadoFormularioRecuperacion

```

├── Entities├── Entities

---

│   └── SolicitudRecuperacion│   └── SolicitudRecuperacion

## 2. Domain Layer

└── Services└── Services

### 2.1 Value Objects

    └── ValidadorCorreoElectronico    └── ValidadorCorreoElectronico

#### CorreoElectronico



**Responsabilidad**: Encapsular y validar un correo electrónico. Garantiza inmutabilidad y validez.

Application LayerApplication Layer

```typescript

// src/domain/valueObjects/CorreoElectronico.ts├── Services├── Services



class CorreoElectronico {│   └── ServicioFormularioRecuperacion│   └── ServicioFormularioRecuperacion

  private readonly valor: string;

├── DTOs├── DTOs

  private constructor(email: string) {

    const trimado = email.trim();│   └── DTOFormularioRecuperacion│   └── DTOFormularioRecuperacion

    

    if (!this.esValido(trimado)) {└── Factories└── Factories

      throw new ErrorCorreoInvalido(`Correo inválido: ${email}`);

    }    └── FabricaSolicitudRecuperacion    └── FabricaSolicitudRecuperacion

    

    this.valor = trimado.toLowerCase();

  }

Presentation LayerPresentation Layer

  private esValido(email: string): boolean {

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;├── Hooks├── Hooks

    return regex.test(email);

  }│   └── useFormularioRecuperacion│   └── useFormularioRecuperacion



  obtenerValor(): string {├── Components├── Components

    return this.valor;

  }│   ├── FormularioRecuperacion│   ├── FormularioRecuperacion



  static crear(email: string): CorreoElectronico {│   └── ConfirmacionRecuperacion│   └── ConfirmacionRecuperacion

    return new CorreoElectronico(email);

  }└── Pages└── Pages



  esIgual(otro: CorreoElectronico): boolean {    └── PaginaRecuperacion    └── PaginaRecuperacion

    return this.valor === otro.valor;

  }``````



  toString(): string {

    return this.valor;

  }------

}

```



**Propiedades**:## 2. Domain Layer## 2. Domain Layer

- `valor`: string (privado, inmutable)



**Métodos**:

- `obtenerValor()`: retorna correo normalizado### 2.1 Value Objects### 2.1 Value Objects

- `esIgual()`: comparación de igualdad

- `toString()`: representación en string

- `static crear()`: factory method

#### CorreoElectronico#### CorreoElectronico

**Validación**:

- Trimea automáticamente

- Normaliza a minúsculas

- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`**Responsabilidad**: Encapsular y validar un correo electrónico. Garantiza inmutabilidad y validez.**Responsabilidad**: Encapsular y validar un correo electrónico. Garantiza inmutabilidad y validez.

- Lanza `ErrorCorreoInvalido` si es inválido



---

```typescript```typescript

#### EstadoFormularioRecuperacion

// src/domain/valueObjects/CorreoElectronico.ts// src/domain/valueObjects/CorreoElectronico.ts

**Responsabilidad**: Encapsular el estado del formulario de forma segura.



```typescript

// src/domain/valueObjects/EstadoFormularioRecuperacion.tsclass CorreoElectronico {class CorreoElectronico {



enum EstadoEnum {  private readonly valor: string;  private readonly valor: string;

  REPOSO = 'reposo',

  CARGANDO = 'cargando',

  EXITO = 'exito',

  ERROR = 'error'  private constructor(email: string) {  private constructor(email: string) {

}

    const trimado = email.trim();    const trimado = email.trim();

class EstadoFormularioRecuperacion {

  private readonly estado: EstadoEnum;        

  private readonly mensaje?: string;

    if (!this.esValido(trimado)) {    if (!this.esValido(trimado)) {

  private constructor(estado: EstadoEnum, mensaje?: string) {

    this.estado = estado;      throw new ErrorCorreoInvalido(`Correo inválido: ${email}`);      throw new ErrorCorreoInvalido(`Correo inválido: ${email}`);

    this.mensaje = mensaje;

  }    }    }



  static reposo(): EstadoFormularioRecuperacion {        

    return new EstadoFormularioRecuperacion(EstadoEnum.REPOSO);

  }    this.valor = trimado.toLowerCase();    this.valor = trimado.toLowerCase();



  static cargando(): EstadoFormularioRecuperacion {  }  }

    return new EstadoFormularioRecuperacion(EstadoEnum.CARGANDO);

  }



  static exito(): EstadoFormularioRecuperacion {  private esValido(email: string): boolean {  private esValido(email: string): boolean {

    return new EstadoFormularioRecuperacion(EstadoEnum.EXITO);

  }    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



  static error(mensaje: string): EstadoFormularioRecuperacion {    return regex.test(email);    return regex.test(email);

    return new EstadoFormularioRecuperacion(EstadoEnum.ERROR, mensaje);

  }  }  }



  obtenerEstado(): EstadoEnum {

    return this.estado;

  }  obtenerValor(): string {  obtenerValor(): string {



  obtenerMensaje(): string | undefined {    return this.valor;    return this.valor;

    return this.mensaje;

  }  }  }



  esReposo(): boolean {

    return this.estado === EstadoEnum.REPOSO;

  }  static crear(email: string): CorreoElectronico {  static crear(email: string): CorreoElectronico {



  esCargando(): boolean {    return new CorreoElectronico(email);    return new CorreoElectronico(email);

    return this.estado === EstadoEnum.CARGANDO;

  }  }  }



  esExito(): boolean {

    return this.estado === EstadoEnum.EXITO;

  }  esIgual(otro: CorreoElectronico): boolean {  esIgual(otro: CorreoElectronico): boolean {



  esError(): boolean {    return this.valor === otro.valor;    return this.valor === otro.valor;

    return this.estado === EstadoEnum.ERROR;

  }  }  }

}

```



**Factory Methods**:  toString(): string {  toString(): string {

- `static reposo()`, `static cargando()`, `static exito()`, `static error(mensaje)`

    return this.valor;    return this.valor;

**Predicados**:

- `esReposo()`, `esCargando()`, `esExito()`, `esError()`  }  }



---}}



### 2.2 Entities``````



#### SolicitudRecuperacion



**Responsabilidad**: Representar el estado del formulario localmente (sin persistencia). Immutable.**Propiedades**:**Propiedades**:



```typescript- `valor`: string (privado, inmutable)- `valor`: string (privado, inmutable)

// src/domain/entities/SolicitudRecuperacion.ts



class SolicitudRecuperacion {

  private readonly correo: string;**Métodos Públicos**:**Métodos**:

  private readonly tocado: boolean;

  private readonly errores: Map<string, string>;- `obtenerValor()`: string- `obtenerValor()`: retorna correo normalizado



  constructor(correo?: string, tocado?: boolean) {- `esIgual(otro: CorreoElectronico)`: boolean- `esIgual()`: comparación de igualdad

    this.correo = correo || '';

    this.tocado = tocado || false;- `toString()`: string- `toString()`: representación en string

    this.errores = new Map();

  }- `static crear(email: string)`: CorreoElectronico- `static crear()`: factory method



  establecerCorreo(correo: string): SolicitudRecuperacion {

    const nueva = new SolicitudRecuperacion(correo, this.tocado);

    nueva.errores = new Map(this.errores);**Validación**:**Validación**:

    return nueva;

  }- Trimea automáticamente- Trimea automáticamente



  obtenerCorreo(): string {- Normaliza a minúsculas- Normaliza a minúsculas

    return this.correo;

  }- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`



  obtenerCorreoTrimado(): string {- Lanza `ErrorCorreoInvalido` si es inválido- Lanza `ErrorCorreoInvalido` si es inválido

    return this.correo.trim();

  }



  establecerTocado(tocado: boolean): SolicitudRecuperacion {**Casos Cubiertos** (Ref: spec.md CB-004, CB-005):**Casos Cubiertos**:

    const nueva = new SolicitudRecuperacion(this.correo, tocado);

    nueva.errores = new Map(this.errores);- ✅ usuario@dominio.com- ✅ usuario@dominio.com

    return nueva;

  }- ✅ nombre.apellido@empresa.co.uk- ✅ nombre.apellido@empresa.co.uk



  estaTocado(): boolean {- ✅ usuario+tag@dominio.com- ❌ usuario@dominio (sin punto)

    return this.tocado;

  }- ❌ usuario@dominio (sin punto)- ❌ usuariodominio



  agregarError(campo: string, mensaje: string): SolicitudRecuperacion {- ❌ usuariodominio (sin @)

    const nueva = new SolicitudRecuperacion(this.correo, this.tocado);

    nueva.errores = new Map(this.errores);- ❌ usuario@@dominio (@ duplicado)---

    nueva.errores.set(campo, mensaje);

    return nueva;

  }

---#### EstadoFormularioRecuperacion

  obtenerError(campo: string): string | undefined {

    return this.errores.get(campo);

  }

#### EstadoFormularioRecuperacion**Responsabilidad**: Encapsular el estado del formulario (reposo, cargando, éxito, error)

  tieneErrores(): boolean {

    return this.errores.size > 0;

  }

**Responsabilidad**: Encapsular el estado del formulario de forma segura.```typescript

  limpiarErrores(): SolicitudRecuperacion {

    const nueva = new SolicitudRecuperacion(this.correo, this.tocado);// src/domain/valueObjects/EstadoFormularioRecuperacion.ts

    nueva.errores = new Map();

    return nueva;```typescript

  }

// src/domain/valueObjects/EstadoFormularioRecuperacion.tsenum EstadoEnum {

  reiniciar(): SolicitudRecuperacion {

    return new SolicitudRecuperacion();  REPOSO = 'reposo',

  }

enum EstadoEnum {  CARGANDO = 'cargando',

  static crear(): SolicitudRecuperacion {

    return new SolicitudRecuperacion();  REPOSO = 'reposo',  EXITO = 'exito',

  }

}  CARGANDO = 'cargando',  ERROR = 'error'

```

  EXITO = 'exito',}

**Propiedades**:

- `correo`: string  ERROR = 'error'

- `tocado`: boolean

- `errores`: Map<string, string>}class EstadoFormularioRecuperacion {



**Métodos**:  private readonly estado: EstadoEnum;

- `establecerCorreo()`: retorna nueva instancia

- `obtenerCorreo()`: getterclass EstadoFormularioRecuperacion {  private readonly mensaje?: string;

- `establecerTocado()`: retorna nueva instancia

- `estaTocado()`: boolean  private readonly estado: EstadoEnum;

- `agregarError()`: retorna nueva instancia

- `obtenerError()`: getter  private readonly mensaje?: string;  private constructor(estado: EstadoEnum, mensaje?: string) {

- `tieneErrores()`: boolean

- `limpiarErrores()`: retorna nueva instancia    this.estado = estado;

- `reiniciar()`: limpia todo

- `static crear()`: factory  private constructor(estado: EstadoEnum, mensaje?: string) {    this.mensaje = mensaje;



---    this.estado = estado;  }



### 2.3 Services    this.mensaje = mensaje;



#### ValidadorCorreoElectronico  }  static reposo(): EstadoFormularioRecuperacion {



**Responsabilidad**: Validar emails con mensajes específicos.    return new EstadoFormularioRecuperacion(EstadoEnum.REPOSO);



```typescript  static reposo(): EstadoFormularioRecuperacion {  }

// src/domain/services/ValidadorCorreoElectronico.ts

    return new EstadoFormularioRecuperacion(EstadoEnum.REPOSO);

type ResultadoValidacion = {

  esValido: boolean;  }  static cargando(): EstadoFormularioRecuperacion {

  error?: string;

};    return new EstadoFormularioRecuperacion(EstadoEnum.CARGANDO);



class ValidadorCorreoElectronico {  static cargando(): EstadoFormularioRecuperacion {  }

  private readonly regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return new EstadoFormularioRecuperacion(EstadoEnum.CARGANDO);

  validar(correo: string): ResultadoValidacion {

    const trimado = correo.trim();  }  static exito(): EstadoFormularioRecuperacion {



    if (!trimado) {    return new EstadoFormularioRecuperacion(EstadoEnum.EXITO);

      return {

        esValido: false,  static exito(): EstadoFormularioRecuperacion {  }

        error: 'El correo electrónico es requerido'

      };    return new EstadoFormularioRecuperacion(EstadoEnum.EXITO);

    }

  }  static error(mensaje: string): EstadoFormularioRecuperacion {

    if (!this.esFormatoValido(trimado)) {

      return {    return new EstadoFormularioRecuperacion(EstadoEnum.ERROR, mensaje);

        esValido: false,

        error: 'Ingresa un correo electrónico válido'  static error(mensaje: string): EstadoFormularioRecuperacion {  }

      };

    }    return new EstadoFormularioRecuperacion(EstadoEnum.ERROR, mensaje);



    return { esValido: true };  }  obtenerEstado(): EstadoEnum {

  }

    return this.estado;

  esFormatoValido(correo: string): boolean {

    return this.regex.test(correo);  obtenerEstado(): EstadoEnum {  }

  }

    return this.estado;

  esValido(correo: string): boolean {

    const trimado = correo.trim();  }  obtenerMensaje(): string | undefined {

    return trimado.length > 0 && this.esFormatoValido(trimado);

  }    return this.mensaje;



  static crear(): ValidadorCorreoElectronico {  obtenerMensaje(): string | undefined {  }

    return new ValidadorCorreoElectronico();

  }    return this.mensaje;

}

```  }  esReposo(): boolean {



**Métodos**:    return this.estado === EstadoEnum.REPOSO;

- `validar()`: retorna `{esValido, error?}`

- `esFormatoValido()`: boolean simple  esReposo(): boolean {  }

- `esValido()`: boolean simple

- `static crear()`: factory    return this.estado === EstadoEnum.REPOSO;



---  }  esCargando(): boolean {



### 2.4 Errors    return this.estado === EstadoEnum.CARGANDO;



#### ErrorCorreoInvalido  esCargando(): boolean {  }



```typescript    return this.estado === EstadoEnum.CARGANDO;

// src/domain/errors/ErrorCorreoInvalido.ts

  }  esExito(): boolean {

class ErrorCorreoInvalido extends Error {

  constructor(message: string) {    return this.estado === EstadoEnum.EXITO;

    super(message);

    this.name = 'ErrorCorreoInvalido';  esExito(): boolean {  }

  }

}    return this.estado === EstadoEnum.EXITO;

```

  }  esError(): boolean {

---

    return this.estado === EstadoEnum.ERROR;

## 3. Application Layer

  esError(): boolean {  }

### 3.1 Services

    return this.estado === EstadoEnum.ERROR;}

#### ServicioFormularioRecuperacion

  }```

**Responsabilidad**: Orquestar validación y cambios de estado.

}

```typescript

// src/application/services/ServicioFormularioRecuperacion.ts```**Factory Methods**:



class ServicioFormularioRecuperacion {- `static reposo()`, `static cargando()`, `static exito()`, `static error(mensaje)`

  private emailValidator: ValidadorCorreoElectronico;

**Enum Valores**:

  constructor(emailValidator: ValidadorCorreoElectronico) {

    this.emailValidator = emailValidator;- `REPOSO` - Sin interacción, inicial**Predicados**:

  }

- `CARGANDO` - Procesando envío- `esReposo()`, `esCargando()`, `esExito()`, `esError()`

  validarCorreo(solicitud: SolicitudRecuperacion): SolicitudRecuperacion {

    const validacion = this.emailValidator.validar(solicitud.obtenerCorreo());- `EXITO` - Enviado correctamente

    

    if (!validacion.esValido) {- `ERROR` - Error en validación/envío---

      return solicitud

        .establecerTocado(true)

        .agregarError('correo', validacion.error || 'Error');

    }**Factory Methods**:### 2.2 Entities

    

    return solicitud.establecerTocado(true).limpiarErrores();- `static reposo()`, `static cargando()`, `static exito()`, `static error(mensaje)`

  }

#### SolicitudRecuperacion

  manejarCambioCorreo(solicitud: SolicitudRecuperacion, correo: string): SolicitudRecuperacion {

    const actualizada = solicitud.establecerCorreo(correo);**Predicados**:

    

    if (solicitud.estaTocado() && correo.length > 0) {- `esReposo()`, `esCargando()`, `esExito()`, `esError()`**Responsabilidad**: Representar el estado del formulario localmente (sin persistencia). Immutable.

      return actualizada.limpiarErrores();

    }

    

    return actualizada;---```typescript

  }

// domain/valueObjects/Email.ts

  manejarBlurCorreo(solicitud: SolicitudRecuperacion): SolicitudRecuperacion {

    return this.validarCorreo(solicitud);### 2.2 Entities

  }

/**

  prepararParaEnvio(solicitud: SolicitudRecuperacion): { esValido: boolean; solicitud: SolicitudRecuperacion } {

    const validada = this.validarCorreo(solicitud);#### SolicitudRecuperacion * Email - Value Object que encapsula la validación y lógica de email

    return {

      esValido: !validada.tieneErrores(), * Garantiza que un Email siempre es válido

      solicitud: validada

    };**Responsabilidad**: Representar el estado del formulario localmente (sin persistencia). Immutable. */

  }

export class Email {

  static crear(): ServicioFormularioRecuperacion {

    return new ServicioFormularioRecuperacion(ValidadorCorreoElectronico.crear());```typescript  private readonly value: string;

  }

}// src/domain/entities/SolicitudRecuperacion.ts

```

  constructor(email: string) {

---

class SolicitudRecuperacion {    const trimmed = email.trim();

### 3.2 Factories

  private readonly correo: string;    

#### FabricaSolicitudRecuperacion

  private readonly tocado: boolean;    if (!this.isValid(trimmed)) {

```typescript

// src/application/factories/FabricaSolicitudRecuperacion.ts  private readonly errores: Map<string, string>;      throw new EmailInvalidError(`Email inválido: ${email}`);



class FabricaSolicitudRecuperacion {    }

  static crear(): SolicitudRecuperacion {

    return new SolicitudRecuperacion();  constructor(correo?: string, tocado?: boolean) {    

  }

    this.correo = correo || '';    this.value = trimmed.toLowerCase();

  static desdeCorreo(correo: string): SolicitudRecuperacion {

    return new SolicitudRecuperacion(correo, false);    this.tocado = tocado || false;  }

  }

    this.errores = new Map();

  static conError(correo: string, error: string): SolicitudRecuperacion {

    return new SolicitudRecuperacion(correo, true)  }  private isValid(email: string): boolean {

      .agregarError('correo', error);

  }    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



  static reiniciar(): SolicitudRecuperacion {  establecerCorreo(correo: string): SolicitudRecuperacion {    return emailRegex.test(email);

    return new SolicitudRecuperacion();

  }    const nueva = new SolicitudRecuperacion(correo, this.tocado);  }

}

```    nueva.errores = new Map(this.errores);



---    return nueva;  getValue(): string {



### 3.3 DTOs  }    return this.value;



#### DTOFormularioRecuperacion  }



```typescript  obtenerCorreo(): string {

// src/application/dtos/DTOFormularioRecuperacion.ts

    return this.correo;  static create(email: string): Email {

type DTOFormularioRecuperacion = {

  correo: string;  }    return new Email(email);

  tocado: boolean;

  errores: Record<string, string>;  }

};

  obtenerCorreoTrimado(): string {

class MapeadorFormularioRecuperacion {

  static aDominio(dto: DTOFormularioRecuperacion): SolicitudRecuperacion {    return this.correo.trim();  equals(other: Email): boolean {

    let solicitud = new SolicitudRecuperacion(dto.correo, dto.tocado);

      }    return this.value === other.value;

    for (const [campo, mensaje] of Object.entries(dto.errores)) {

      solicitud = solicitud.agregarError(campo, mensaje);  }

    }

      establecerTocado(tocado: boolean): SolicitudRecuperacion {

    return solicitud;

  }    const nueva = new SolicitudRecuperacion(this.correo, tocado);  toString(): string {



  static aDTO(solicitud: SolicitudRecuperacion): DTOFormularioRecuperacion {    nueva.errores = new Map(this.errores);    return this.value;

    const errores: Record<string, string> = {};

        return nueva;  }

    const error = solicitud.obtenerError('correo');

    if (error) {  }}

      errores['correo'] = error;

    }```

    

    return {  estaTocado(): boolean {

      correo: solicitud.obtenerCorreo(),

      tocado: solicitud.estaTocado(),    return this.tocado;**Validación**:

      errores

    };  }- No permite instanciación sin email válido

  }

}- Trimea automáticamente espacios

```

  agregarError(campo: string, mensaje: string): SolicitudRecuperacion {- Normaliza a minúsculas

---

    const nueva = new SolicitudRecuperacion(this.correo, this.tocado);- Lanza excepción específica si es inválido

## 4. Presentation Layer

    nueva.errores = new Map(this.errores);

### 4.1 Types

    nueva.errores.set(campo, mensaje);**Tests esperados**:

```typescript

// src/types/recuperacion.ts    return nueva;- Crear Email válido: `new Email("usuario@dominio.com")` ✓



export type EstadoFormularioRecuperacionUI = {  }- Crear Email con espacios: `new Email("  usuario@dominio.com  ")` ✓ (trimea)

  correo: string;

  errorCorreo?: string;- Crear Email inválido: `new Email("usuariodominio")` ❌ (lanza error)

  tocado: boolean;

};  obtenerError(campo: string): string | undefined {- Crear Email sin dominio: `new Email("usuario@")` ❌ (lanza error)



export type EstadoProceso = 'reposo' | 'cargando' | 'exito' | 'error';    return this.errores.get(campo);



export type PropsFormularioRecuperacion = {  }---

  correo: string;

  errorCorreo?: string;

  tocado: boolean;

  estaCargando: boolean;  tieneErrores(): boolean {#### `RecoveryState`

  alCambiarCorreo: (correo: string) => void;

  alBlurCorreo: () => void;    return this.errores.size > 0;Representa los posibles estados del proceso de recuperación.

  alEnviar: () => void;

  alRegresar: () => void;  }

};

```typescript

export type PropsConfirmacionRecuperacion = {

  alRegresar: () => void;  limpiarErrores(): SolicitudRecuperacion {// domain/valueObjects/RecoveryState.ts

};

```    const nueva = new SolicitudRecuperacion(this.correo, this.tocado);



---    nueva.errores = new Map();export enum RecoveryStatusEnum {



### 4.2 Hooks    return nueva;  IDLE = 'idle',



#### useFormularioRecuperacion  }  LOADING = 'loading',



```typescript  SUCCESS = 'success',

// src/presentation/hooks/useFormularioRecuperacion.ts

  reiniciar(): SolicitudRecuperacion {  ERROR = 'error'

export const useFormularioRecuperacion = () => {

  const [solicitud, setSolicitud] = useState<SolicitudRecuperacion>(    return new SolicitudRecuperacion();}

    FabricaSolicitudRecuperacion.crear()

  );  }

  

  const [estado, setEstado] = useState<EstadoFormularioRecuperacion>(export class RecoveryState {

    EstadoFormularioRecuperacion.reposo()

  );  static crear(): SolicitudRecuperacion {  private readonly status: RecoveryStatusEnum;



  const servicio = ServicioFormularioRecuperacion.crear();    return new SolicitudRecuperacion();  private readonly error?: string;



  const manejarCambioCorreo = useCallback((correo: string) => {  }

    setSolicitud(prev => servicio.manejarCambioCorreo(prev, correo));

  }, [servicio]);}  private constructor(status: RecoveryStatusEnum, error?: string) {



  const manejarBlurCorreo = useCallback(() => {```    this.status = status;

    setSolicitud(prev => servicio.manejarBlurCorreo(prev));

  }, [servicio]);    this.error = error;



  const manejarEnvio = useCallback(async () => {**Propiedades**:  }

    const { esValido, solicitud: validada } = servicio.prepararParaEnvio(solicitud);

- `correo`: string

    if (!esValido) {

      setSolicitud(validada);- `tocado`: boolean (¿el usuario ha interactuado?)  static idle(): RecoveryState {

      return;

    }- `errores`: Map<string, string>    return new RecoveryState(RecoveryStatusEnum.IDLE);



    setEstado(EstadoFormularioRecuperacion.cargando());  }

    

    await new Promise(resolve => setTimeout(resolve, 750));**Métodos**:

    

    setEstado(EstadoFormularioRecuperacion.exito());- Setters: `establecerCorreo()`, `establecerTocado()`, `agregarError()`  static loading(): RecoveryState {

  }, [solicitud, servicio]);

- Getters: `obtenerCorreo()`, `obtenerCorreoTrimado()`, `estaTocado()`, `obtenerError()`    return new RecoveryState(RecoveryStatusEnum.LOADING);

  const manejarReinicio = useCallback(() => {

    setSolicitud(FabricaSolicitudRecuperacion.crear());- Queries: `tieneErrores()`  }

    setEstado(EstadoFormularioRecuperacion.reposo());

  }, []);- Actions: `limpiarErrores()`, `reiniciar()`



  return {- Factory: `static crear()`  static success(): RecoveryState {

    correo: solicitud.obtenerCorreo(),

    errorCorreo: solicitud.obtenerError('correo'),    return new RecoveryState(RecoveryStatusEnum.SUCCESS);

    tocado: solicitud.estaTocado(),

    estaCargando: estado.esCargando(),**Características**:  }

    esExito: estado.esExito(),

    manejarCambioCorreo,- Immutable (cada método retorna nueva instancia)

    manejarBlurCorreo,

    manejarEnvio,- Mantiene estado de "tocado" para mostrar errores en UI  static error(message: string): RecoveryState {

    manejarReinicio

  };- Acumula errores por campo    return new RecoveryState(RecoveryStatusEnum.ERROR, message);

};

```  }



---**Ref**: spec.md HU-005 (Manejo de errores de validación)



### 4.3 Components  getStatus(): RecoveryStatusEnum {



#### FormularioRecuperacion---    return this.status;



```typescript  }

// src/presentation/components/FormularioRecuperacion.tsx

### 2.3 Domain Services

export const FormularioRecuperacion: React.FC<PropsFormularioRecuperacion> = ({

  correo,  getError(): string | undefined {

  errorCorreo,

  tocado,#### ValidadorCorreoElectronico    return this.error;

  estaCargando,

  alCambiarCorreo,  }

  alBlurCorreo,

  alEnviar,**Responsabilidad**: Validar correos con mensajes específicos y contextualizados.

  alRegresar

}) => {  isLoading(): boolean {

  const hasError = tocado && !!errorCorreo;

```typescript    return this.status === RecoveryStatusEnum.LOADING;

  return (

    <div className="formulario-recuperacion">// src/domain/services/ValidadorCorreoElectronico.ts  }

      <h2>Recuperación de Contraseña</h2>

      

      <div className="form-group">

        <label htmlFor="correo">Correo Electrónico</label>type ResultadoValidacion = {  isSuccess(): boolean {

        

        <input  esValido: boolean;    return this.status === RecoveryStatusEnum.SUCCESS;

          id="correo"

          type="text"  error?: string;  }

          className={`input ${hasError ? 'input--error' : ''}`}

          placeholder="usuario@ejemplo.com"};

          value={correo}

          onChange={(e) => alCambiarCorreo(e.target.value)}  isError(): boolean {

          onBlur={alBlurCorreo}

          disabled={estaCargando}class ValidadorCorreoElectronico {    return this.status === RecoveryStatusEnum.ERROR;

          aria-invalid={hasError}

          aria-describedby={hasError ? 'correo-error' : undefined}  private readonly regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  }

        />

        

        {hasError && (

          <div id="correo-error" className="error-message">  validar(correo: string): ResultadoValidacion {  isIdle(): boolean {

            {errorCorreo}

          </div>    const trimado = correo.trim();    return this.status === RecoveryStatusEnum.IDLE;

        )}

      </div>  }



      <div className="form-actions">    if (!trimado) {}

        <button

          className="btn btn-primary"      return {```

          onClick={alEnviar}

          disabled={estaCargando}        esValido: false,

        >

          {estaCargando ? 'Procesando...' : 'Continuar'}        error: 'El correo electrónico es requerido'---

        </button>

              };

        <button

          className="btn btn-secondary"    }### 2.2 Entities

          onClick={alRegresar}

          disabled={estaCargando}

        >

          ← Regresar al Login    if (!this.esFormatoValido(trimado)) {#### `RecoveryForm`

        </button>

      </div>      return {Entidad que representa el formulario de recuperación con su estado.

    </div>

  );        esValido: false,

};

```        error: 'Ingresa un correo electrónico válido'```typescript



---      };// domain/entities/RecoveryForm.ts



#### ConfirmacionRecuperacion    }



```typescriptexport class RecoveryForm {

// src/presentation/components/ConfirmacionRecuperacion.tsx

    return { esValido: true };  private email: string;

export const ConfirmacionRecuperacion: React.FC<PropsConfirmacionRecuperacion> = ({

  alRegresar  }  private touched: boolean;

}) => {

  return (  private errors: Map<string, string>;

    <div className="confirmacion-recuperacion">

      <div className="icono-exito">✓</div>  esFormatoValido(correo: string): boolean {

      

      <h2>Solicitud Procesada</h2>    return this.regex.test(correo.trim());  constructor(email?: string, touched?: boolean) {

      

      <p className="mensaje-confirmacion">  }    this.email = email || "";

        Si el correo electrónico corresponde a una cuenta registrada,

        recibirás instrucciones para recuperar tu contraseña.    this.touched = touched || false;

      </p>

        esValido(correo: string): boolean {    this.errors = new Map();

      <button className="btn btn-primary" onClick={alRegresar}>

        Regresar al Login    return this.validar(correo).esValido;  }

      </button>

    </div>  }

  );

};  setEmail(email: string): RecoveryForm {

```

  static crear(): ValidadorCorreoElectronico {    const newForm = new RecoveryForm(email, this.touched);

---

    return new ValidadorCorreoElectronico();    newForm.errors = new Map(this.errors);

#### PaginaRecuperacion

  }    return newForm;

```typescript

// src/presentation/pages/recuperar-contrasena/PaginaRecuperacion.tsx}  }



export const PaginaRecuperacion: React.FC = () => {```

  const navigate = useNavigate();

    getEmail(): string {

  const {

    correo,**Métodos Públicos**:    return this.email;

    errorCorreo,

    tocado,- `validar(correo)`: ResultadoValidacion (con mensaje)  }

    estaCargando,

    esExito,- `esFormatoValido(correo)`: boolean (sin mensaje)

    manejarCambioCorreo,

    manejarBlurCorreo,- `esValido(correo)`: boolean (booleano simple)  getTrimmedEmail(): string {

    manejarEnvio,

    manejarReinicio    return this.email.trim();

  } = useFormularioRecuperacion();

**Mensajes de Error** (Ref: clarifications.md A-004, A-005):  }

  const manejarRegresar = () => {

    manejarReinicio();1. Campo vacío: "El correo electrónico es requerido"

    navigate('/login');

  };2. Formato inválido: "Ingresa un correo electrónico válido"  setTouched(touched: boolean): RecoveryForm {



  if (esExito) {    const newForm = new RecoveryForm(this.email, touched);

    return <ConfirmacionRecuperacion alRegresar={manejarRegresar} />;

  }**Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (Ref: clarifications.md A-009)    newForm.errors = new Map(this.errors);



  return (    return newForm;

    <FormularioRecuperacion

      correo={correo}---  }

      errorCorreo={errorCorreo}

      tocado={tocado}

      estaCargando={estaCargando}

      alCambiarCorreo={manejarCambioCorreo}## 3. Application Layer  isTouched(): boolean {

      alBlurCorreo={manejarBlurCorreo}

      alEnviar={manejarEnvio}    return this.touched;

      alRegresar={manejarRegresar}

    />### 3.1 Services  }

  );

};

```

#### ServicioFormularioRecuperacion  addError(field: string, message: string): RecoveryForm {

---

    const newForm = new RecoveryForm(this.email, this.touched);

## 5. Trazabilidad: Entidades ↔ Especificación

**Responsabilidad**: Orquestar flujo de validación y cambios de estado.    newForm.errors = new Map(this.errors);

| Entidad | HU | RF | RNF | Propósito |

|---------|----|----|-----|----------|    newForm.errors.set(field, message);

| CorreoElectronico | HU-003, HU-004 | RF-003, RF-006 | RNF-005 | Validar formato |

| EstadoFormularioRecuperacion | HU-006, HU-007 | RF-008, RF-009 | RNF-001 | Estados UI |```typescript    return newForm;

| SolicitudRecuperacion | HU-002 a HU-006 | RF-003, RF-005, RF-007 | RNF-004 | Estado formulario |

| ValidadorCorreoElectronico | HU-004, HU-005 | RF-005, RF-006 | RNF-005 | Validación |// src/application/services/ServicioFormularioRecuperacion.ts  }

| ServicioFormularioRecuperacion | HU-003 a HU-008 | RF-004 a RF-016 | RNF-002 | Orquestación |

| useFormularioRecuperacion | HU-006, HU-007 | RF-008, RF-009 | RNF-001 | State |

| FormularioRecuperacion | HU-002, HU-005, HU-006 | RF-002, RF-007 | RNF-006 | UI formulario |

| ConfirmacionRecuperacion | HU-007, HU-008 | RF-010, RF-011 | RNF-007 | UI confirmación |class ServicioFormularioRecuperacion {  getError(field: string): string | undefined {

| PaginaRecuperacion | HU-001, HU-008 | RF-001, RF-012 | RNF-006 | Navegación |

  private validador: ValidadorCorreoElectronico;    return this.errors.get(field);

---

  }

## 6. Invariantes

  constructor(validador: ValidadorCorreoElectronico) {

1. **Correo siempre trimado**: `obtenerCorreoTrimado()` sin espacios

2. **Correo siempre lowercase**: CorreoElectronico normaliza    this.validador = validador;  hasErrors(): boolean {

3. **Estado immutable**: Cada cambio retorna nueva instancia

4. **Validación consistente**: Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`  }    return this.errors.size > 0;

5. **Mensajes neutrales**: Confirmación idéntica para todos

  }

---

  validarCorreo(solicitud: SolicitudRecuperacion): SolicitudRecuperacion {

**Estado**: Modelo de datos 100% definido  

**Versión**: 1.0      const validacion = this.validador.validar(solicitud.obtenerCorreoTrimado());  clearErrors(): RecoveryForm {

**Fecha**: 2026-10-20

    const newForm = new RecoveryForm(this.email, this.touched);

    if (!validacion.esValido) {    newForm.errors = new Map();

      return solicitud    return newForm;

        .establecerTocado(true)  }

        .agregarError('correo', validacion.error || 'Error de validación');

    }  reset(): RecoveryForm {

    return new RecoveryForm();

    return solicitud  }

      .establecerTocado(true)

      .limpiarErrores();  static create(): RecoveryForm {

  }    return new RecoveryForm();

  }

  manejarCambioCorreo(solicitud: SolicitudRecuperacion, correo: string): SolicitudRecuperacion {}

    const actualizada = solicitud.establecerCorreo(correo);```



    // Limpiar errores si usuario retoma edición**Notas**:

    if (solicitud.estaTocado() && correo.length > 0) {- Es inmutable (cada cambio retorna nueva instancia)

      return actualizada.limpiarErrores();- Mantiene estado de "tocado" (touched)

    }- Acumula errores por campo

- Useful para tests y debugging

    return actualizada;

  }---



  manejarBlurCorreo(solicitud: SolicitudRecuperacion): SolicitudRecuperacion {### 2.3 Services (Domain Services)

    return this.validarCorreo(solicitud);

  }#### `EmailValidator`

Servicio que valida emails y proporciona mensajes de error específicos.

  prepararParaEnvio(solicitud: SolicitudRecuperacion): {

    esValido: boolean;```typescript

    solicitud: SolicitudRecuperacion;// domain/services/EmailValidator.ts

  } {

    const validada = this.validarCorreo(solicitud);export type EmailValidationResult = {

    return {  isValid: boolean;

      esValido: !validada.tieneErrores(),  error?: string;

      solicitud: validada};

    };

  }export class EmailValidator {

  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  static crear(): ServicioFormularioRecuperacion {

    return new ServicioFormularioRecuperacion(ValidadorCorreoElectronico.crear());  /**

  }   * Valida un email y retorna resultado con mensaje específico

}   */

```  validate(email: string): EmailValidationResult {

    const trimmed = email.trim();

**Métodos**:

- `validarCorreo()`: Valida y marca como tocado    // Validación 1: Campo requerido

- `manejarCambioCorreo()`: Limpia errores si se reedita    if (!trimmed) {

- `manejarBlurCorreo()`: Valida al perder foco      return {

- `prepararParaEnvio()`: Valida antes de submit        isValid: false,

        error: 'El correo electrónico es requerido'

**Ref**: spec.md RF-005, RF-007 (Validación en blur y submit)      };

    }

---

    // Validación 2: Formato válido

### 3.2 DTOs    if (!this.isValidFormat(trimmed)) {

      return {

#### DTOFormularioRecuperacion        isValid: false,

        error: 'Ingresa un correo electrónico válido'

```typescript      };

// src/application/dtos/DTOFormularioRecuperacion.ts    }



type DTOFormularioRecuperacion = {    return { isValid: true };

  correo: string;  }

  tocado: boolean;

  errores: Record<string, string>;  /**

};   * Solo verifica el formato (sin mensajes)

   */

class MapeadorFormularioRecuperacion {  isValidFormat(email: string): boolean {

  static aDominio(dto: DTOFormularioRecuperacion): SolicitudRecuperacion {    return this.emailRegex.test(email.trim());

    let solicitud = new SolicitudRecuperacion(dto.correo, dto.tocado);  }

    

    Object.entries(dto.errores).forEach(([campo, error]) => {  /**

      if (error) {   * Retorna true si el email es válido (simplificado)

        solicitud = solicitud.agregarError(campo, error);   */

      }  isValid(email: string): boolean {

    });    return this.validate(email).isValid;

      }

    return solicitud;

  }  static create(): EmailValidator {

    return new EmailValidator();

  static aDTO(solicitud: SolicitudRecuperacion): DTOFormularioRecuperacion {  }

    return {}

      correo: solicitud.obtenerCorreo(),```

      tocado: solicitud.estaTocado(),

      errores: {**Tests esperados**:

        correo: solicitud.obtenerError('correo') || ''- `validate("")` → `{ isValid: false, error: "El correo electrónico es requerido" }`

      }- `validate("usuariodominio")` → `{ isValid: false, error: "Ingresa un correo electrónico válido" }`

    };- `validate("usuario@dominio.com")` → `{ isValid: true }`

  }- `validate("  usuario@dominio.com  ")` → `{ isValid: true }`

}

```---



---## 3. Application Layer (Aplicación)



### 3.3 Factories### 3.1 DTOs



#### FabricaSolicitudRecuperacion#### `RecoveryFormDTO`

Data Transfer Object para el formulario.

```typescript

// src/application/factories/FabricaSolicitudRecuperacion.ts```typescript

// application/dtos/RecoveryFormDTO.ts

class FabricaSolicitudRecuperacion {

  static crear(): SolicitudRecuperacion {export type RecoveryFormDTO = {

    return SolicitudRecuperacion.crear();  email: string;

  }  touched: boolean;

  errors: Record<string, string>;

  static desdeCorreo(correo: string): SolicitudRecuperacion {};

    return new SolicitudRecuperacion(correo, false);

  }export class RecoveryFormDTOMapper {

  static toDomain(dto: RecoveryFormDTO): RecoveryForm {

  static reiniciar(): SolicitudRecuperacion {    const form = new RecoveryForm(dto.email, dto.touched);

    return new SolicitudRecuperacion().reiniciar();    Object.entries(dto.errors).forEach(([field, error]) => {

  }      form = form.addError(field, error);

    });

  static conError(correo: string, error: string): SolicitudRecuperacion {    return form;

    return new SolicitudRecuperacion(correo, true)  }

      .agregarError('correo', error);

  }  static toDTO(form: RecoveryForm): RecoveryFormDTO {

}    return {

```      email: form.getEmail(),

      touched: form.isTouched(),

---      errors: {

        email: form.getError('email') || ''

## 4. Presentation Layer      }

    };

### 4.1 Types  }

}

```typescript```

// src/types/recuperacion.ts

---

export type EstadoFormularioRecuperacionUI = {

  correo: string;#### `RecoverySubmitDTO`

  errorCorreo?: string;DTO para el submit (preparación para futura integración).

  tocado: boolean;

};```typescript

// application/dtos/RecoverySubmitDTO.ts

export type EstadoProceso = 'reposo' | 'cargando' | 'exito' | 'error';

export type RecoverySubmitDTO = {

export type PropsFormularioRecuperacion = {  email: string;

  correo: string;  timestamp: Date;

  errorCorreo?: string;  userAgent?: string;

  tocado: boolean;};

  estaCargando: boolean;

  alCambiarCorreo: (correo: string) => void;export class RecoverySubmitDTOBuilder {

  alBlurCorreo: () => void;  private email: string = '';

  alEnviar: () => void;  private timestamp: Date = new Date();

  alRegresar: () => void;  private userAgent?: string = navigator.userAgent;

};

  setEmail(email: string): RecoverySubmitDTOBuilder {

export type PropsConfirmacionRecuperacion = {    this.email = email;

  alRegresar: () => void;    return this;

};  }

```

  build(): RecoverySubmitDTO {

---    return {

      email: this.email,

### 4.2 Hooks      timestamp: this.timestamp,

      userAgent: this.userAgent

#### useFormularioRecuperacion    };

  }

```typescript

// src/presentation/hooks/useFormularioRecuperacion.ts  static create(): RecoverySubmitDTOBuilder {

    return new RecoverySubmitDTOBuilder();

export const useFormularioRecuperacion = () => {  }

  const [solicitud, setSolicitud] = useState<SolicitudRecuperacion>(}

    FabricaSolicitudRecuperacion.crear()```

  );

  const [estado, setEstado] = useState<EstadoFormularioRecuperacion>(---

    EstadoFormularioRecuperacion.reposo()

  );### 3.2 Factories



  const servicio = ServicioFormularioRecuperacion.crear();#### `RecoveryFormFactory`

Factory para crear instancias de RecoveryForm.

  const manejarCambioCorreo = useCallback((correo: string) => {

    setSolicitud(prev => servicio.manejarCambioCorreo(prev, correo));```typescript

  }, [servicio]);// application/factories/RecoveryFormFactory.ts



  const manejarBlurCorreo = useCallback(() => {export class RecoveryFormFactory {

    setSolicitud(prev => servicio.manejarBlurCorreo(prev));  static create(): RecoveryForm {

  }, [servicio]);    return RecoveryForm.create();

  }

  const manejarEnvio = useCallback(async () => {

    const { esValido, solicitud: validada } = servicio.prepararParaEnvio(solicitud);  static fromEmail(email: string): RecoveryForm {

        return new RecoveryForm(email, false);

    if (!esValido) {  }

      setSolicitud(validada);

      return;  static reset(): RecoveryForm {

    }    return new RecoveryForm().reset();

  }

    setEstado(EstadoFormularioRecuperacion.cargando());

    await new Promise(resolve => setTimeout(resolve, 750));  static withError(email: string, error: string): RecoveryForm {

    setEstado(EstadoFormularioRecuperacion.exito());    return new RecoveryForm(email, true)

  }, [solicitud, servicio]);      .addError('email', error);

  }

  const manejarReinicio = useCallback(() => {}

    setSolicitud(FabricaSolicitudRecuperacion.crear());```

    setEstado(EstadoFormularioRecuperacion.reposo());

  }, []);---



  return {### 3.3 Use Cases / Services

    correo: solicitud.obtenerCorreo(),

    errorCorreo: solicitud.obtenerError('correo'),#### `RecoveryFormService`

    tocado: solicitud.estaTocado(),Servicio que coordina la lógica de aplicación del formulario.

    estaCargando: estado.esCargando(),

    esExito: estado.esExito(),```typescript

    manejarCambioCorreo,// application/services/RecoveryFormService.ts

    manejarBlurCorreo,

    manejarEnvio,export class RecoveryFormService {

    manejarReinicio  private emailValidator: EmailValidator;

  };

};  constructor(emailValidator: EmailValidator) {

```    this.emailValidator = emailValidator;

  }

**Ref**: spec.md RNF-001, RNF-002 (Performance, responsiveness)

  /**

---   * Valida el email del formulario

   */

### 4.3 Components  validateEmail(form: RecoveryForm): RecoveryForm {

    const validation = this.emailValidator.validate(form.getTrimmedEmail());

**FormularioRecuperacion.tsx**

- Componente presentacional puro    if (!validation.isValid) {

- Props-driven (no lógica de negocio)      return form

- Renderiza inputs, labels, errores        .setTouched(true)

- Accesibilidad: `htmlFor`, `aria-*`        .addError('email', validation.error || 'Error de validación');

    }

**ConfirmacionRecuperacion.tsx**

- Pantalla de confirmación    return form

- Mensaje neutral (igual para todas las validaciones)      .setTouched(true)

- Botón "Regresar al login"      .clearErrors();

- No revela si correo existía o no  }



**PaginaRecuperacion.tsx**  /**

- Container que orquesta   * Maneja el cambio del campo de email

- Usa `useFormularioRecuperacion`   */

- Renderiza FormularioRecuperacion o ConfirmacionRecuperacion según estado  handleEmailChange(form: RecoveryForm, email: string): RecoveryForm {

- Integra navegación a `/login`    const updated = form.setEmail(email);



---    // Limpiar errores si el usuario está corrigiendo

    if (form.isTouched() && email.length > 0) {

## 5. Trazabilidad: Entidades ↔ Especificación      return updated.clearErrors();

    }

| Entidad | HU | RF | RNF | Propósito |

|---------|----|----|-----|----------|    return updated;

| CorreoElectronico | HU-003, HU-004 | RF-003, RF-006 | RNF-005 | Validar formato |  }

| EstadoFormularioRecuperacion | HU-006, HU-007 | RF-008, RF-009 | RNF-001 | Estados UI |

| SolicitudRecuperacion | HU-002 a HU-006 | RF-003, RF-005, RF-007 | RNF-004 | Estado formulario |  /**

| ValidadorCorreoElectronico | HU-004, HU-005 | RF-005, RF-006 | RNF-005 | Validación |   * Maneja el blur del campo de email

| ServicioFormularioRecuperacion | HU-003 a HU-008 | RF-004 a RF-016 | RNF-002 | Orquestación |   */

| useFormularioRecuperacion | HU-006, HU-007 | RF-008, RF-009 | RNF-001 | State management |  handleEmailBlur(form: RecoveryForm): RecoveryForm {

| FormularioRecuperacion | HU-002, HU-005, HU-006 | RF-002, RF-003, RF-007 | RNF-006 | UI formulario |    return this.validateEmail(form);

| ConfirmacionRecuperacion | HU-007, HU-008 | RF-010, RF-011 | RNF-007 | UI confirmación |  }



---  /**

   * Prepara el formulario para submit

## 6. Invariantes   * Retorna true si es válido

   */

1. **Correo siempre trimado**: `obtenerCorreoTrimado()` sin espacios  prepareForSubmit(form: RecoveryForm): { isValid: boolean; form: RecoveryForm } {

2. **Correo siempre lowercase**: CorreoElectronico normaliza    const validated = this.validateEmail(form);

3. **Estado immutable**: Cada cambio retorna nueva instancia    return {

4. **Validación consistente**: Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`      isValid: !validated.hasErrors(),

5. **Mensajes neutrales**: Confirmación idéntica (Ref: clarifications.md A-008)      form: validated

6. **Un error por campo**: Map<string, string> máximo una entrada por campo    };

  }

---

  /**

## 7. Referencias Cruzadas   * Crea un DTO para envío (preparado para futura integración)

   */

- **spec.md**: Requisitos funcionales y casos de uso  createSubmitDTO(form: RecoveryForm): RecoverySubmitDTO {

- **clarifications.md**: Decisiones sobre ambigüedades (A-004 a A-010)    return RecoverySubmitDTOBuilder.create()

- **research.md**: Justificación de decisiones técnicas      .setEmail(form.getTrimmedEmail())

- **plan.md**: Plan de implementación por fases      .build();

- **Módulo 006**: Referencia de patrones DDD  }

- **tasks.md**: 40 tareas de implementación (T001-T040)

  static create(): RecoveryFormService {

---    return new RecoveryFormService(EmailValidator.create());

  }

**Estado**: Modelo de datos 100% definido  }

**Versión**: 1.0  ```

**Fecha**: 2026-10-20  

**Próximo**: Crear contracts/openapi.yaml, quickstart.md, reemplazar plan.md (body)---


## 4. Presentation Layer (Interfaz)

### 4.1 React Hooks

#### `useRecoveryForm`
Hook principal para gestionar el estado del formulario.

```typescript
// presentation/hooks/useRecoveryForm.ts

import { useState, useCallback } from 'react';

export const useRecoveryForm = () => {
  const [form, setForm] = useState<RecoveryForm>(RecoveryFormFactory.create());
  const [state, setState] = useState<RecoveryState>(RecoveryState.idle());
  
  const service = RecoveryFormService.create();

  const handleEmailChange = useCallback((email: string) => {
    setForm(prev => service.handleEmailChange(prev, email));
  }, [service]);

  const handleEmailBlur = useCallback(() => {
    setForm(prev => service.handleEmailBlur(prev));
  }, [service]);

  const handleSubmit = useCallback(async () => {
    const { isValid, form: validatedForm } = service.prepareForSubmit(form);
    
    if (!isValid) {
      setForm(validatedForm);
      return;
    }

    // Simulación de envío
    setState(RecoveryState.loading());
    
    // Simular latencia
    await new Promise(resolve => setTimeout(resolve, 750));
    
    setState(RecoveryState.success());
  }, [form, service]);

  const handleReset = useCallback(() => {
    setForm(RecoveryFormFactory.create());
    setState(RecoveryState.idle());
  }, []);

  return {
    // Estado del formulario
    email: form.getEmail(),
    emailError: form.getError('email'),
    touched: form.isTouched(),

    // Estado del proceso
    isLoading: state.isLoading(),
    isSuccess: state.isSuccess(),
    isError: state.isError(),
    errorMessage: state.getError(),

    // Handlers
    handleEmailChange,
    handleEmailBlur,
    handleSubmit,
    handleReset
  };
};
```

---

### 4.2 Components

#### `RecoveryForm` Component
Componente del formulario de recuperación.

```typescript
// presentation/components/RecoveryForm.tsx

interface RecoveryFormProps {
  email: string;
  emailError?: string;
  touched: boolean;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onEmailBlur: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

export const RecoveryForm: React.FC<RecoveryFormProps> = ({
  email,
  emailError,
  touched,
  isLoading,
  onEmailChange,
  onEmailBlur,
  onSubmit,
  onBack
}) => {
  const hasError = touched && !!emailError;

  return (
    <div className="recovery-form">
      <h2>Recuperación de Contraseña</h2>

      <div className="form-group">
        <label htmlFor="email" className="label">
          Correo Electrónico
        </label>

        <input
          id="email"
          type="text"
          className={`input ${hasError ? 'input--error' : ''}`}
          placeholder="usuario@ejemplo.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onBlur={onEmailBlur}
          disabled={isLoading}
          aria-invalid={hasError}
          aria-describedby={hasError ? 'email-error' : undefined}
        />

        {hasError && (
          <div id="email-error" className="error-message">
            <span className="error-icon">✕</span>
            <span className="error-text">{emailError}</span>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          className="button button--primary"
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Procesando...' : 'Continuar'}
        </button>

        <button
          className="button button--secondary"
          onClick={onBack}
          disabled={isLoading}
        >
          ← Regresar al Login
        </button>
      </div>
    </div>
  );
};
```

---

#### `RecoveryConfirmation` Component
Componente de confirmación.

```typescript
// presentation/components/RecoveryConfirmation.tsx

interface RecoveryConfirmationProps {
  onBack: () => void;
}

export const RecoveryConfirmation: React.FC<RecoveryConfirmationProps> = ({
  onBack
}) => {
  return (
    <div className="recovery-confirmation">
      <div className="success-icon">✓</div>

      <h2>Solicitud Procesada</h2>

      <p className="confirmation-message">
        Si el correo electrónico corresponde a una cuenta registrada,
        recibirás instrucciones para recuperar tu contraseña.
      </p>

      <p className="secondary-text">
        Por favor, revisa tu bandeja de entrada y la carpeta de spam.
      </p>

      <button
        className="button button--primary"
        onClick={onBack}
      >
        Regresar al Login
      </button>
    </div>
  );
};
```

---

#### `RecoveryPage` Container
Página principal que orquesta todo.

```typescript
// presentation/pages/RecoveryPage.tsx

import { useNavigate } from 'react-router-dom';

export const RecoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    email,
    emailError,
    touched,
    isLoading,
    isSuccess,
    handleEmailChange,
    handleEmailBlur,
    handleSubmit,
    handleReset
  } = useRecoveryForm();

  const handleBack = () => {
    handleReset();
    navigate('/login');
  };

  if (isSuccess) {
    return <RecoveryConfirmation onBack={handleBack} />;
  }

  return (
    <RecoveryForm
      email={email}
      emailError={emailError}
      touched={touched}
      isLoading={isLoading}
      onEmailChange={handleEmailChange}
      onEmailBlur={handleEmailBlur}
      onSubmit={handleSubmit}
      onBack={handleBack}
    />
  );
};
```

---

## 5. Error Handling

### Custom Exceptions

```typescript
// domain/errors/index.ts

export class EmailInvalidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailInvalidError';
  }
}

export class RecoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RecoveryError';
  }
}
```

---

## 6. Tipos TypeScript

```typescript
// types/recovery.ts

/**
 * Estados posibles del formulario de recuperación
 */
export type RecoveryFormState = {
  email: string;
  touched: boolean;
  errors: Record<string, string>;
};

/**
 * Estados posibles del proceso
 */
export type ProcessState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Respuesta de validación
 */
export type ValidationResponse = {
  isValid: boolean;
  error?: string;
};

/**
 * Props de componentes
 */
export type RecoveryFormComponentProps = {
  email: string;
  emailError?: string;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};
```

---

## 7. Archivo de Índices (Barrels)

```typescript
// domain/index.ts
export * from './entities/RecoveryForm';
export * from './valueObjects/Email';
export * from './valueObjects/RecoveryState';
export * from './services/EmailValidator';
export * from './errors';

// application/index.ts
export * from './services/RecoveryFormService';
export * from './dtos/RecoveryFormDTO';
export * from './factories/RecoveryFormFactory';

// presentation/index.ts
export * from './pages/RecoveryPage';
export * from './components/RecoveryForm';
export * from './components/RecoveryConfirmation';
export * from './hooks/useRecoveryForm';
```

---

## 8. Estructura de Carpetas

```
src/
  domain/
    entities/
      RecoveryForm.ts
    valueObjects/
      Email.ts
      RecoveryState.ts
    services/
      EmailValidator.ts
    errors/
      index.ts
    index.ts

  application/
    services/
      RecoveryFormService.ts
    dtos/
      RecoveryFormDTO.ts
      RecoverySubmitDTO.ts
    factories/
      RecoveryFormFactory.ts
    index.ts

  presentation/
    pages/
      RecoveryPage.tsx
    components/
      RecoveryForm.tsx
      RecoveryConfirmation.tsx
    hooks/
      useRecoveryForm.ts
    index.ts

  types/
    recovery.ts

  routes/
    (integración con AppRoutes existente)
```

---

## 9. Matriz de Trazabilidad: Entidades vs Historias de Usuario

| Entidad | HU | Propósito |
|---------|----|---------
| Email | HU-003, HU-004 | Validar formato de correo |
| RecoveryState | HU-006, HU-007 | Manejar estados de proceso |
| RecoveryForm | HU-002, HU-003, HU-005 | Estado del formulario |
| EmailValidator | HU-004, HU-005 | Validar y mostrar errores |
| RecoveryFormService | HU-003 a HU-008 | Coordinar lógica de aplicación |
| useRecoveryForm | HU-006, HU-007 | Hook de estado |
| RecoveryForm Component | HU-002, HU-003, HU-005, HU-006 | UI del formulario |
| RecoveryConfirmation | HU-007, HU-008 | UI de confirmación |
| RecoveryPage | HU-001, HU-008 | Orquestación y navegación |

---

## 10. Notas de Implementación

### Principios de Diseño
1. **Immutabilidad**: Las entidades del dominio son inmutables
2. **Separación de capas**: Cada capa tiene responsabilidades claras
3. **DDD**: Lógica de dominio separada de framework
4. **Testabilidad**: Servicios sin dependencias de React
5. **Type safety**: TypeScript fuerte tipado

### Consideraciones Futuras
- **Backend**: Cuando se implemente, reemplazar simulación con API calls
- **State management**: Si crece, considerar Zustand/Context
- **Validación**: Expandir EmailValidator con más reglas si es necesario
- **I18n**: Mensajes de error podrían ser internacionalizados

---

**Estado**: Modelo de datos 100% definido  
**Versión**: 1.0  
**Fecha**: 2026-10-20  
**Próximo paso**: Crear plan.md
