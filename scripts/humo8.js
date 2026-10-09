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

require('../main/main.js');

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const js = (win, c) => win.webContents.executeJavaScript(c).catch((e) => { throw new Error(`JS: ${String(c).slice(0, 110)} => ${e.message}`); });
const foto = async (win, nombre) => {
  win.webContents.invalidate();
  await esperar(1000);
  fs.writeFileSync(path.join(SALIDA, nombre), (await win.webContents.capturePage()).toPNG());
};
const poner = (win, sel, valor) => js(win, `(() => {
  const i = document.querySelector(${JSON.stringify(sel)});
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, ${JSON.stringify(valor)});
  i.dispatchEvent(new Event('input', { bubbles: true }));
})()`);
const marcar = (win, n, shift = false) => js(win, `document.getElementById('v-${n}').parentElement.querySelector('.verso-check').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: ${shift} }))`);
const texto = (win, sel) => js(win, `(document.querySelector(${JSON.stringify(sel)}) || {}).textContent || ''`);
const cuenta = (win, sel) => js(win, `document.querySelectorAll(${JSON.stringify(sel)}).length`);
const clic = (win, sel, t) => js(win, `(() => {
  const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find((b) => b.textContent.trim().includes(${JSON.stringify(t)}));
  if (!el) throw new Error('no hay ' + ${JSON.stringify(sel + ' ' + t)});
  el.click();
})()`);
const revisar = (nombre, ok, extra = '') => console.log(`${ok ? 'OK ' : 'FALLA'} ${nombre} ${extra}`);

async function main() {
  await app.whenReady();
  await esperar(4500);
  const op = ventanas.find((w) => w.getTitle().startsWith('Atril'));

  await poner(op, '.buscador input', 'jn 3');
  await esperar(900);
  await marcar(op, 16);
  await marcar(op, 18);
  await marcar(op, 20);
  await esperar(500);
  const barra = await texto(op, '.barra-sel-txt');
  revisar('La barra resume los versículos marcados', barra.includes('3') && barra.includes('Juan 3:16, 18, 20'), `(${barra})`);
  await foto(op, '70-marcados.png');

  await marcar(op, 22);
  await marcar(op, 25, true);
  await esperar(400);
  const barra2 = await texto(op, '.barra-sel-txt');
  revisar('Shift marca un rango', barra2.includes('16, 18, 20, 22-25'), `(${barra2})`);

  await clic(op, '.barra-seleccion .btn-lleno', 'Proyectar');
  await esperar(900);
  const titulo = await texto(op, '.pant-titulo');
  revisar('Proyecta los marcados juntos', titulo.includes('Juan 3:16, 18, 20, 22-25'), `(${titulo})`);

  await clic(op, '.barra-seleccion .btn', 'Agregar al culto');
  await esperar(800);
  revisar('Sin culto abierto pide crear uno', (await cuenta(op, '.modal')) === 1);
  await clic(op, '.modal-pie .btn-lleno', 'Crear');
  await esperar(1500);
  const lista = await js(op, `[...document.querySelectorAll('.culto-lista .item .item-titulo')].map((n) => n.textContent.trim())`);
  revisar('Crea un pasaje por cada grupo seguido', JSON.stringify(lista) === JSON.stringify(['Juan 3:16', 'Juan 3:18', 'Juan 3:20', 'Juan 3:22-25']), JSON.stringify(lista));
  await foto(op, '71-culto-con-grupos.png');

  console.log('ERRORES', JSON.stringify(errores));
  app.exit(0);
}

main().catch((e) => { console.log('FALLO', e.stack || e); app.exit(1); });
