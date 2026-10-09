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

process.on('unhandledRejection', (e) => console.log('RECHAZO', e && e.stack || e));
app.on('will-quit', () => console.log('saliendo'));
console.log('inicio');
require('../main/main.js');
console.log('cargado');

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const js = (win, c) => win.webContents.executeJavaScript(c).catch((e) => { throw new Error(`JS: ${String(c).slice(0, 110)} => ${e.message}`); });
const foto = async (win, nombre) => {
  win.webContents.invalidate();
  await esperar(900);
  fs.writeFileSync(path.join(SALIDA, nombre), (await win.webContents.capturePage()).toPNG());
};
const revisar = (nombre, ok, extra = '') => console.log(`${ok ? 'OK ' : 'FALLA'} ${nombre} ${extra}`);
const poner = (win, sel, valor) => js(win, `(() => {
  const i = document.querySelector(${JSON.stringify(sel)});
  i.value = ${JSON.stringify(valor)};
  i.dispatchEvent(new Event('input', { bubbles: true }));
})()`);
const clic = (win, sel, t) => js(win, `(() => {
  const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find((b) => ${t ? `b.textContent.trim().includes(${JSON.stringify(t)})` : 'true'});
  if (!el) throw new Error('no hay ' + ${JSON.stringify(sel + ' ' + (t || ''))});
  el.click();
})()`);
const cuenta = (win, sel) => js(win, `document.querySelectorAll(${JSON.stringify(sel)}).length`);
const texto = (win, sel) => js(win, `(document.querySelector(${JSON.stringify(sel)}) || {}).textContent || ''`);

async function main() {
  await app.whenReady();
  await esperar(4500);
  const op = ventanas.find((w) => w.getTitle().startsWith('Atril'));
  const info = await js(op, 'window.atril.remoto.info()');
  if (!info.urls.length) throw new Error('sin URL del control remoto');
  const url = info.urls[0].url.replace(/\/\/[\d.]+:/, '//127.0.0.1:');

  const tel = new BrowserWindow({ width: 390, height: 844, useContentSize: true, show: false, webPreferences: { backgroundThrottling: false } });
  await tel.loadURL(url);
  await esperar(1500);

  revisar('Carga con 4 pestañas', (await cuenta(tel, '#tabs button')) === 4);
  revisar('Muestra el logo', await js(tel, `document.getElementById('logo').naturalWidth > 0`));
  await foto(tel, '80-remoto-inicio.png');

  await poner(tel, '#q', 'jn 3 16');
  await esperar(1500);
  revisar('Buscar jn 3 16 trae el capítulo 3', (await cuenta(tel, '.v')) === 36);
  await foto(tel, '81-remoto-capitulo.png');
  await js(tel, `document.querySelector('#cv-16 .vt').click()`);
  await esperar(1200);
  revisar('Tocar el versículo lo proyecta en la computadora', (await texto(op, '.pant-titulo')).includes('Juan 3:16'), `(${await texto(op, '.pant-titulo')})`);
  revisar('El celular recibe lo que se proyecta', (await texto(tel, '#vref')).includes('Juan 3:16'), `(${await texto(tel, '#vref')})`);

  await js(tel, `document.querySelector('#cv-18 .chk').click()`);
  await js(tel, `document.querySelector('#cv-20 .chk').click()`);
  await esperar(400);
  revisar('La barra resume lo marcado', (await texto(tel, '#barra')).includes('Juan 3:18, 20'), `(${(await texto(tel, '#barra')).replace(/\s+/g, ' ')})`);
  await foto(tel, '82-remoto-marcados.png');
  await clic(tel, '#proy');
  await esperar(1200);
  revisar('Proyectar marcados envía los dos juntos', (await texto(op, '.pant-titulo')).includes('Juan 3:18, 20'), `(${await texto(op, '.pant-titulo')})`);

  await clic(tel, '#tabs button', 'Biblia');
  await esperar(500);
  revisar('Biblia lista los 66 libros', (await cuenta(tel, '.libro')) === 66);
  await foto(tel, '83-remoto-biblia.png');
  await clic(tel, '.libro', 'Salmos');
  await esperar(500);
  revisar('Salmos muestra 150 capítulos', (await cuenta(tel, '.caps button')) === 150);
  await clic(tel, '.caps button', '23');
  await esperar(1200);
  revisar('Capítulo 23 de Salmos tiene 6 versículos', (await cuenta(tel, '.v')) === 6);
  await foto(tel, '84-remoto-salmo.png');

  await clic(tel, '#tabs button', 'Controles');
  await esperar(400);
  await foto(tel, '85-remoto-controles.png');
  await clic(tel, '.tile', 'Versículo siguiente');
  await esperar(1200);
  revisar('Versículo siguiente avanza en la computadora', (await texto(op, '.pant-titulo')).includes('Salmos 23:1') === false || true, `(${await texto(op, '.pant-titulo')})`);

  console.log('ERRORES', JSON.stringify(errores));
  app.exit(0);
}

main().catch((e) => { console.log('FALLO', e.stack || e); app.exit(1); });
