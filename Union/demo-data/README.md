# Base de datos de muestra

`publicaciones-demo.sql` es un volcado completo de una base H2 de prueba generada con la API Java. Contiene dos cuentas ficticias y tres publicaciones ilustradas para recorrer Descubre. No incluye datos de personas reales ni configuración de producción.

Las imágenes que usa el feed están en `Union/frontend/public/demo/`. Para que la API las entregue con una URL accesible desde el frontend, el volcado apunta a `http://localhost:5175/demo/`.

## Cuentas de prueba

| Correo | Contraseña | Uso |
| --- | --- | --- |
| `autor.preview@example.com` | `VistaDemo2026!` | Cuenta autora de los ejemplos |
| `lector.preview@example.com` | `VistaDemo2026!` | Cuenta para abrir Descubre |

Son credenciales exclusivas de esta base local de muestra.

## Restaurar el volcado H2

Ejecute desde la raíz de este repositorio. Con Java y H2 2.2.224 disponibles, restaure el script en una base nueva:

```powershell
$h2 = "$env:USERPROFILE\.m2\repository\com\h2database\h2\2.2.224\h2-2.2.224.jar"
$root = (Get-Location).Path.Replace('\', '/')
$null = New-Item -ItemType Directory -Force .local-data
$url = "jdbc:h2:file:$root/.local-data/inspiraciones-demo;MODE=MySQL;NON_KEYWORDS=USER"
java -cp $h2 org.h2.tools.RunScript -url $url -user sa -script Union/demo-data/publicaciones-demo.sql
```

En esa sesión de PowerShell, configure la API con la misma URL y ejecute el backend:

```powershell
$env:DB_URL = $url
$env:DB_DRIVER = 'org.h2.Driver'
$env:DB_USER = 'sa'
$env:DB_PASSWORD = ''
```

Desde el checkout de la API Java, arránquela con `mvn spring-boot:run` conservando esas variables en la sesión.

En el frontend, use `npm run dev`; Vite sirve las imágenes por el puerto 5175 y reenvía `/api` a la API en el puerto 8080.

El SQL es un respaldo H2 para desarrollo y pruebas. No es una migración ni un respaldo compatible con producción MySQL.
