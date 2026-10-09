const { app, BrowserWindow, dialog } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

dialog.showErrorBox = () => {};
process.on('uncaughtException', (e) => { console.log('EXCEPCION', e.stack || e); app.exit(1); });

BrowserWindow.prototype.show = function () {};
BrowserWindow.prototype.maximize = function () {};

const datos = fs.mkdtempSync(path.join(os.tmpdir(), 'atril-datos-'));
const original = path.join(process.env.APPDATA, 'atril', 'atril.db');
if (process.env.ATRIL_COPIAR_DB && fs.existsSync(original)) {
  fs.copyFileSync(original, path.join(datos, 'atril.db'));
  console.log('Usando copia de la base real de', original);
}
app.setPath('userData', datos);

const ventanas = [];
app.on('browser-window-created', (_e, win) => ventanas.push(win));
require('../main/main.js');

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const js = (win, c) => win.webContents.executeJavaScript(c);
const revisar = (nombre, ok, extra = '') => console.log(`${ok ? 'OK ' : 'FALLA'} ${nombre} ${extra}`);

async function main() {
  await app.whenReady();
  await esperar(5000);
  const op = ventanas.find((w) => w.getTitle().startsWith('Atril'));

  const servicios = await js(op, 'window.atril.servicios.listar()');
  revisar('Los cultos existentes conservan nombre y fecha', servicios.length >= 1 && servicios.every((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.fecha)), JSON.stringify(servicios.map((s) => [s.nombre, s.fecha, s.cantidad])));
  const canciones = await js(op, 'window.atril.canciones.listar("")');
  console.log('Canciones en la base:', canciones.length);

  let est = await js(op, 'window.atril.proyeccion.estado()');
  console.log('Pantallas:', est.pantallas.map((p) => `${p.numero}:${p.ancho}x${p.alto}${p.principal ? '*' : ''}`).join(' '));
  for (const p of est.pantallas) await js(op, `window.atril.proyeccion.activar(${p.id}, true)`);
  await js(op, 'window.atril.proyeccion.abrir()');
  await esperar(2500);
  est = await js(op, 'window.atril.proyeccion.estado()');
  revisar('Abre una ventana por pantalla elegida', est.abierta && est.pantallas.filter((p) => p.activa).length === est.pantallas.length, `(${est.pantallas.filter((p) => p.activa).length} activas)`);

  await js(op, `window.atril.proyeccion.activar(${est.pantallas[0].id}, false)`);
  await esperar(1500);
  est = await js(op, 'window.atril.proyeccion.estado()');
  revisar('Apagar una pantalla cierra solo esa ventana', est.pantallas.filter((p) => p.activa).length === est.pantallas.length - 1);

  await js(op, 'window.atril.proyeccion.cerrar()');
  await esperar(1000);
  est = await js(op, 'window.atril.proyeccion.estado()');
  revisar('Cerrar proyección cierra todas', !est.abierta);
  app.exit(0);
}

main().catch((e) => { console.log('FALLO', e.stack || e); app.exit(1); });
