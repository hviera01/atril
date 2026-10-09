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
const revisar = (nombre, ok, extra = '') => console.log(`${ok ? 'OK ' : 'FALLA'} ${nombre} ${extra}`);

const CANCION = { titulo: 'Santo, santo, santo', autor: 'Reginald Heber', letra: ['Santo, santo, santo, Señor omnipotente', 'Siempre los labios míos loores te dirán', 'Santo, santo, santo, te adoro reverente', 'Dios en tres personas, bendita Trinidad'].join('\n') };

async function main() {
  await app.whenReady();
  await esperar(4500);
  const op = ventanas.find((w) => w.getTitle().startsWith('Atril'));
  await js(op, `window.atril.canciones.guardar(${JSON.stringify(CANCION)})`);

  const est = await js(op, 'window.atril.proyeccion.estado()');
  const [a, b] = est.pantallas;
  console.log('Pantallas:', est.pantallas.map((p) => `${p.numero}:${p.ancho}x${p.alto}`).join(' '));
  await js(op, `window.atril.guardarAjuste('pantallasCfg', ${JSON.stringify({ [a.id]: { rol: 'escenario' }, [b.id]: { rol: 'letras', tema: 'biblia' } })})`);
  await js(op, 'location.reload()');
  await esperar(4500);

  for (const p of est.pantallas) await js(op, `window.atril.proyeccion.activar(${p.id}, true)`);
  await js(op, 'window.atril.proyeccion.abrir()');
  await esperar(2800);
  const proys = ventanas.filter((w) => w.getTitle().includes('Proyección'));
  revisar('Hay una ventana por pantalla', proys.length === 2, `(${proys.length})`);

  await poner(op, '.buscador input', 'jn 3');
  await esperar(900);
  await js(op, `document.getElementById('v-16').click()`);
  await esperar(1800);
  const tipos = [];
  for (const w of proys) tipos.push(await js(w, `document.querySelector('.esc-stage') ? 'escenario' : (document.querySelector('.esc-negro') && document.querySelector('.esc-negro').style.opacity === '1' ? 'negro' : 'contenido')`));
  revisar('Con un versículo: una es escenario y la otra de solo canciones queda en negro', tipos.includes('escenario') && tipos.includes('negro'), JSON.stringify(tipos));
  const iEsc = tipos.indexOf('escenario');
  const textoEsc = await js(proys[iEsc], `document.querySelector('.st-actual').textContent`);
  revisar('El escenario muestra el versículo actual', textoEsc.includes('Porque de tal manera'), `(${textoEsc.slice(0, 40)})`);
  const textoSig = await js(proys[iEsc], `document.querySelector('.st-sigue').textContent`);
  revisar('El escenario muestra lo que sigue', textoSig.includes('Porque no envió'), `(${textoSig.slice(0, 40)})`);
  await foto(proys[iEsc], '90-escenario.png');

  await poner(op, '.buscador input', 'santo santo');
  await esperar(900);
  await js(op, `[...document.querySelectorAll('.fila-botones .btn')].find((b) => b.textContent.includes('Proyectar')).click()`);
  await esperar(2000);
  const iLetras = 1 - iEsc;
  const hayLetra = await js(proys[iLetras], `!!document.querySelector('.esc-linea-letra') && document.querySelector('.lib-der') !== null`);
  revisar('La pantalla de canciones muestra la letra con su propio diseño (Biblia abierta)', hayLetra);
  await foto(proys[iLetras], '91-solo-canciones.png');
  const escLetra = await js(proys[iEsc], `document.querySelector('.st-actual').textContent`);
  revisar('El escenario sigue la canción', escLetra.includes('Santo, santo'), `(${escLetra.slice(0, 30)})`);

  console.log('ERRORES', JSON.stringify(errores));
  app.exit(0);
}

main().catch((e) => { console.log('FALLO', e.stack || e); app.exit(1); });
