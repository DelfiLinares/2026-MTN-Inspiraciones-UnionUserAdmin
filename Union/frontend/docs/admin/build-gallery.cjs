const fs = require('node:fs')
const path = require('node:path')
const screens = [
  ['resumen', 'Resumen de la comunidad', '/admin/dashboard'],
  ['usuarios', 'Gestión de usuarios', '/admin/usuarios'],
  ['publicaciones', 'Publicaciones', '/admin/publicaciones'],
  ['moderacion', 'Moderación', '/admin/moderacion'],
  ['desafios', 'Desafíos publicados', '/admin/desafios'],
  ['nuevo-desafio', 'Publicar desafío', '/admin/desafios/nuevo'],
  ['propuestas', 'Propuestas de la comunidad', '/admin/desafios/propuestas'],
  ['solicitudes', 'Solicitudes', '/admin/solicitudes'],
  ['reportes', 'Reportes y analíticas', '/admin/reportes'],
  ['gestion-reportes', 'Gestión de reportes', '/admin/reportes/gestion'],
  ['accesos', 'Accesos de administración', '/admin/promocion'],
  ['login', 'Ingreso administrativo', '/login-admin'],
  ['detalle-reporte-error', 'Detalle del reporte · Recurso no disponible', '/admin/moderacion/:reporteId'],
  ['editar-desafio-error', 'Editar desafío · Recurso no disponible', '/admin/desafios/:desafioId/editar'],
  ['detalle-propuesta-error', 'Detalle de propuesta · Recurso no disponible', '/admin/desafios/propuestas/:propuestaId'],
  ['editar-solicitud-error', 'Editar solicitud · Recurso no disponible', '/admin/solicitudes/:solicitudId'],
]
const sections = screens.map(([name,title,route]) => {
  const images = ['escritorio','movil'].filter(device => fs.existsSync(path.join(__dirname,'capturas',`${name}-${device}.jpg`))).map(device=>`<a class="capture ${device}" href="capturas/${name}-${device}.jpg"><img src="capturas/${name}-${device}.jpg" alt="${title}, vista ${device}" loading="lazy"><span>${device === 'movil' ? 'Móvil · 390 px' : 'Escritorio'}</span></a>`).join('')
  const link = route.includes(':') ? `<code>${route}</code>` : `<a href="http://localhost:5175${route}" target="_blank" rel="noreferrer">Abrir pantalla</a><code>${route}</code>`
  return `<section id="${name}"><header><h2>${title}</h2><div>${link}</div></header><div class="captures">${images}</div></section>`
}).join('')
fs.writeFileSync(path.join(__dirname,'index.html'),`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Administración · Pantallas y rutas</title><style>
*{box-sizing:border-box}body{margin:0;color:#2f2f2f;background:#fff;font:14px/1.6 Manrope,Arial,sans-serif}main{width:min(100% - 40px,1200px);margin:auto;padding:40px 0}h1{font-size:36px;line-height:1.2;margin:0 0 12px;letter-spacing:-1px}h2{font-size:20px;margin:0}p{color:#686868;max-width:75ch}a{color:inherit;text-underline-offset:4px}nav{display:flex;gap:10px;flex-wrap:wrap;margin:24px 0}button{font:inherit;padding:10px 18px;min-height:44px;border:1px solid #ccc;border-radius:24px;background:#fff;color:#414141;cursor:pointer}button[aria-pressed=true]{background:#414141;color:#fff}button:focus-visible,a:focus-visible{outline:3px solid #555;outline-offset:4px}section{padding:28px 0;border-top:1px solid #e6e6e6}section header{display:flex;justify-content:space-between;gap:16px;align-items:baseline;margin-bottom:20px}section header div{display:grid;justify-items:end;gap:4px}code{font-size:11px;color:#686868;overflow-wrap:anywhere}.captures{display:flex;gap:20px;align-items:flex-start;background:#f5f5f5;padding:20px;border-radius:20px}.capture{display:block;flex:1;min-width:0;text-decoration:none}.capture.movil{flex:0 0 min(32%,390px)}img{display:block;width:100%;height:auto;border:1px solid #e6e6e6;border-radius:8px}.capture span{display:block;margin-top:10px;color:#686868;font-size:12px}body[data-device=escritorio] .movil,body[data-device=movil] .escritorio{display:none}body[data-device=movil] .capture.movil{flex:0 0 min(100%,390px)}@media(max-width:700px){h1{font-size:28px}section header{display:block}section header div{justify-items:start;margin-top:10px}.captures{padding:12px;gap:12px}.capture.movil{flex-basis:35%}}
</style></head><body data-device="todos"><main><h1>Administración de InspiraBoard</h1><p>Diseño aplicado a la app: navegación común, tablas, formularios y confirmaciones. Las capturas utilizan los datos y estados del servicio local. Desafíos y Solicitudes incluyen los errores de consulta que devuelve el backend actual.</p><p><a href="http://localhost:5175/admin/dashboard">Abrir el panel navegable</a> · <a href="README.md">Mapa de rutas y verificación</a></p><nav aria-label="Vista de capturas"><button data-device="todos" aria-pressed="true">Todas</button><button data-device="escritorio" aria-pressed="false">Escritorio</button><button data-device="movil" aria-pressed="false">Móvil</button></nav>${sections}</main><script>document.querySelectorAll('button[data-device]').forEach(button=>button.addEventListener('click',()=>{document.body.dataset.device=button.dataset.device;document.querySelectorAll('button[data-device]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)))}))</script></body></html>`)
console.log(`Galería: ${screens.length} pantallas y estados.`)
