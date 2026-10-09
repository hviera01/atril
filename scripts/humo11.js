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
  await esperar(1000);
  fs.writeFileSync(path.join(SALIDA, nombre), (await win.webContents.capturePage()).toPNG());
};
const escribir = (win, texto) => js(win, `(() => {
  const i = document.querySelector('.buscador input');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, ${JSON.stringify(texto)});
  i.dispatchEvent(new Event('input', { bubbles: true }));
})()`);
const chip = (win, nombre) => js(win, `[...document.querySelectorAll('.tema-chip')].find((b) => b.title === ${JSON.stringify(nombre)}).click()`);

const TEMAS = [['Aurora', 'aurora'], ['Fuego vivo', 'fuego'], ['Luz flotante', 'luz'], ['Mar', 'mar'], ['Noche estrellada', 'noche'], ['Gloria', 'gloria'], ['Nubes', 'nubes'], ['Resplandor', 'resplandor']];
const CANCION = { titulo: 'Santo, santo, santo', autor: 'Reginald Heber', letra: ['[Verso 1]', 'Santo, santo, santo, Señor omnipotente', 'Siempre los labios míos loores te dirán', 'Santo, santo, santo, te adoro reverente', 'Dios en tres personas, bendita Trinidad'].join('\n') };

async function main() {
  await app.whenReady();
  await esperar(5000);
  const op = ventanas.find((w) => w.getTitle().startsWith('Atril'));
  await js(op, `window.atril.canciones.guardar(${JSON.stringify(CANCION)})`);

  await escribir(op, 'jn 3');
  await esperar(900);
  await js(op, `document.getElementById('v-16').click()`);
  await esperar(500);
  await js(op, `window.atril.proyeccion.abrir()`);
  await esperar(2200);
  const proy = ventanas.find((w) => w.getTitle().includes('Proyección'));

  for (const [nombre, id] of TEMAS) {
    await chip(op, nombre);
    await esperar(1300);
    await foto(proy, `50-${id}-verso.png`);
  }

  console.log('ERRORES', JSON.stringify(errores));
  app.exit(0);
}

main().catch((e) => { console.log('FALLO', e.stack || e); app.exit(1); });
