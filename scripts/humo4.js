const { app, BrowserWindow, dialog } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

dialog.showErrorBox = () => {};
process.on('uncaughtException', (e) => { console.log('EXCEPCION', e.stack || e); app.exit(1); });

const SALIDA = process.env.ATRIL_HUMO_SALIDA || path.join(os.tmpdir(), 'atril-humo');
fs.mkdirSync(SALIDA, { recursive: true });
BrowserWindow.prototype.show = function () {};
BrowserWindow.prototype.maximize = function () {};
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'atril-datos-')));

const errores = [];
const ventanas = [];
app.on('browser-window-created', (_e, win) => {
  ventanas.push(win);
  win.webContents.on('console-message', (e) => { if (e.level === 'error' || e.level === 3) errores.push(e.message); });
});

require(process.env.ATRIL_MAIN || '../main/main.js');

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const js = (win, c) => win.webContents.executeJavaScript(c).catch((e) => { throw new Error(`JS: ${String(c).slice(0, 110)} => ${e.message}`); });
const foto = async (win, nombre) => {
  win.webContents.invalidate();
  await esperar(900);
  fs.writeFileSync(path.join(SALIDA, nombre), (await win.webContents.capturePage()).toPNG());
};
const clic = (win, sel, texto) => js(win, `(() => {
  const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find((b) => ${texto ? `b.textContent.trim().startsWith(${JSON.stringify(texto)})` : 'true'});
  if (!el) throw new Error('no hay ' + ${JSON.stringify(sel + ' ' + (texto || ''))});
  el.click();
})()`);
const tecla = (win, key) => js(win, `window.dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(key)}, bubbles: true }))`);
const texto = (win, sel) => js(win, `(document.querySelector(${JSON.stringify(sel)}) || {}).textContent || ''`);
const revisar = (nombre, ok, extra = '') => console.log(`${ok ? 'OK ' : 'FALLA'} ${nombre} ${extra}`);

async function main() {
  await app.whenReady();
  await esperar(5000);
  const op = ventanas.find((w) => w.getTitle().startsWith('Atril'));

  await clic(op, '.pestanas button', 'Biblia');
  await esperar(400);
  await clic(op, '.sel-libro', 'Juan');
  await esperar(900);
  const caps = await js(op, `document.querySelectorAll('.caps button').length`);
  const palabras = await js(op, `document.querySelectorAll('.verso').length`);
  revisar('Libro Juan muestra 21 capítulos y ninguna búsqueda por palabra', caps === 21 && palabras === 0, `(caps=${caps}, versos=${palabras})`);
  await foto(op, '40-biblia-libro.png');

  await clic(op, '.caps button', '3');
  await esperar(900);
  await js(op, `document.getElementById('v-16').click()`);
  await esperar(900);
  let vivo = await texto(op, '.pant-titulo');
  revisar('Proyecta Juan 3:16', vivo.includes('Juan 3:16'), `(${vivo})`);
  await tecla(op, 'ArrowDown');
  await esperar(900);
  vivo = await texto(op, '.pant-titulo');
  revisar('Flecha abajo sigue al 3:17', vivo.includes('Juan 3:17'), `(${vivo})`);
  await foto(op, '41-verso-siguiente.png');

  await clic(op, '.pestanas button', 'Culto');
  await esperar(400);
  await clic(op, '.inicio-culto .btn-lleno');
  await esperar(700);
  await js(op, `document.querySelector('.modal input:not([type])').value`);
  await clic(op, '.modal-pie .btn-lleno');
  await esperar(1200);
  await foto(op, '42-culto-nuevo.png');
  const secciones = await js(op, `document.querySelectorAll('.seccion-item').length`);
  revisar('Culto nuevo trae 5 secciones', secciones === 5, `(${secciones})`);

  await js(op, `document.querySelectorAll('.seccion-item')[2].querySelector('.icono-btn').click()`);
  await esperar(500);
  await clic(op, '.menu-agregar button', 'Pasaje');
  await esperar(900);
  await clic(op, '.sel-libro', 'Salmos');
  await esperar(500);
  await clic(op, '.sel-caps button', '23');
  await esperar(800);
  await js(op, `document.querySelectorAll('.sel-verso')[0].click()`);
  await js(op, `document.querySelectorAll('.sel-verso')[1].click()`);
  await js(op, `document.querySelectorAll('.sel-verso')[2].click()`);
  await esperar(500);
  await foto(op, '43-selector-pasaje.png');
  const etiqueta = await texto(op, '.sel-etiqueta');
  revisar('Selector arma Salmos 23:1-3', etiqueta.includes('Salmos 23:1-3'), `(${etiqueta})`);
  await clic(op, '.modal-pie .btn-lleno');
  await esperar(900);
  const lista = await js(op, `[...document.querySelectorAll('.culto-lista > *')].map((n) => n.textContent.trim().slice(0, 28))`);
  console.log('Lista del culto:', JSON.stringify(lista));
  const idxSalmo = lista.findIndex((t) => t.startsWith('Salmos 23:1-3'));
  const idxSec = lista.findIndex((t) => t.startsWith('Ofrenda'));
  const idxPalabra = lista.findIndex((t) => t.startsWith('Palabra'));
  revisar('Pasaje queda dentro de la sección Ofrenda', idxSalmo > idxSec && idxSalmo < idxPalabra);
  await foto(op, '44-culto-con-pasaje.png');

  await clic(op, '.culto-actual');
  await esperar(900);
  const filas = await js(op, `document.querySelectorAll('.culto-fila').length`);
  revisar('Historial lista el culto creado', filas === 1, `(${filas})`);
  await foto(op, '45-historial.png');
  await tecla(op, 'Escape');

  const estado = await js(op, `window.atril.proyeccion.estado()`);
  console.log('Pantallas:', JSON.stringify(estado.pantallas));
  console.log('ERRORES', JSON.stringify(errores));
  app.exit(0);
}

main().catch((e) => { console.log('FALLO', e.stack || e); app.exit(1); });
