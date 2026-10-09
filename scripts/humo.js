const { app, BrowserWindow, dialog } = require('electron');
dialog.showErrorBox = () => {};
process.on('uncaughtException', (e) => { console.log('EXCEPCION', e.stack || e); app.exit(1); });
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const SALIDA = process.env.ATRIL_HUMO_SALIDA || path.join(os.tmpdir(), 'atril-humo');
fs.mkdirSync(SALIDA, { recursive: true });
BrowserWindow.prototype.show = function () {};
BrowserWindow.prototype.maximize = function () {};
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'atril-datos-')));

const errores = [];
const ventanas = [];
app.on('browser-window-created', (_e, win) => {
  ventanas.push(win);
  win.webContents.on('console-message', (e) => {
    const nivel = e.level !== undefined ? e.level : 0;
    if (nivel === 'error' || nivel === 3) errores.push(`[${win.getTitle()}] ${e.message}`);
  });
  win.webContents.on('render-process-gone', (_ev, d) => errores.push('proceso caído: ' + d.reason));
});

require(process.env.ATRIL_MAIN || '../main/main.js');

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const foto = async (win, nombre) => {
  const img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(SALIDA, nombre), img.toPNG());
};
const js = (win, codigo) => win.webContents.executeJavaScript(codigo);

async function escribir(win, texto) {
  await js(win, `(() => {
    const i = document.querySelector('.buscador input');
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    set.call(i, ${JSON.stringify(texto)});
    i.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
}

async function main() {
  await app.whenReady();
  await esperar(4500);
  const operador = ventanas.find((w) => w.getTitle().startsWith('Atril'));
  if (!operador) throw new Error('No apareció la ventana del operador');
  await foto(operador, '1-inicio.png');

  await escribir(operador, 'jn 3 16');
  await esperar(900);
  await foto(operador, '2-busqueda.png');

  await js(operador, `[...document.querySelectorAll('.verso')].find((b) => b.id === 'v-16').click()`);
  await esperar(600);
  await js(operador, `window.atril.proyeccion.abrir()`);
  await esperar(2200);
  await foto(operador, '3-vivo.png');
  const proy = ventanas.find((w) => w.getTitle().includes('Proyección'));
  if (proy) await foto(proy, '4-proyeccion.png'); else errores.push('no se abrió la ventana de proyección');

  await escribir(operador, 'amor de dios');
  await esperar(900);
  await foto(operador, '5-palabras.png');

  const resumen = await js(operador, `({ versos: document.querySelectorAll('.verso').length })`);
  console.log('RESUMEN', JSON.stringify(resumen));
  console.log('ERRORES', JSON.stringify(errores, null, 1));
  app.exit(0);
}

main().catch((e) => { console.log('FALLO', e.stack || e); app.exit(1); });
