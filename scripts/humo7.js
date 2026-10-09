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
  await esperar(900);
  fs.writeFileSync(path.join(SALIDA, nombre), (await win.webContents.capturePage()).toPNG());
};
const clic = (win, sel, texto) => js(win, `(() => {
  const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find((b) => ${texto ? `b.textContent.trim().startsWith(${JSON.stringify(texto)})` : 'true'});
  if (!el) throw new Error('no hay ' + ${JSON.stringify(sel + ' ' + (texto || ''))});
  el.click();
})()`);
const poner = (win, sel, valor) => js(win, `(() => {
  const i = document.querySelector(${JSON.stringify(sel)});
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, ${JSON.stringify(valor)});
  i.dispatchEvent(new Event('input', { bubbles: true }));
})()`);
const cuenta = (win, sel) => js(win, `document.querySelectorAll(${JSON.stringify(sel)}).length`);
const revisar = (nombre, ok, extra = '') => console.log(`${ok ? 'OK ' : 'FALLA'} ${nombre} ${extra}`);

async function main() {
  await app.whenReady();
  await esperar(4500);
  const op = ventanas.find((w) => w.getTitle().startsWith('Atril'));

  await js(op, `(async () => {
    for (const [n, f] of [['Culto dominical', '2026-08-02'], ['Vigilia', '2026-09-13'], ['Culto de jóvenes', '2026-09-25'], ['Culto dominical', '2026-10-04']]) await window.atril.servicios.crear(n, f);
    location.reload();
  })()`);
  await esperar(4500);

  revisar('Arranca sin ningún culto abierto', (await cuenta(op, '.inicio-culto')) === 1 && (await cuenta(op, '.culto-lista')) === 0);
  revisar('Muestra 4 cultos recientes', (await cuenta(op, '.reciente')) === 4);
  await foto(op, '60-inicio-sin-culto.png');

  await clic(op, '.inicio-culto .btn', 'Historial');
  await esperar(900);
  revisar('Historial lista los 4 cultos', (await cuenta(op, '.culto-fila')) === 4);

  await poner(op, '.filtros-fecha input[type="date"]', '2026-09-01');
  await esperar(500);
  revisar('Desde 2026-09-01 deja 3', (await cuenta(op, '.culto-fila')) === 3, `(${await cuenta(op, '.culto-fila')})`);
  await js(op, `(() => { const i = document.querySelectorAll('.filtros-fecha input[type="date"]')[1]; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, '2026-09-30'); i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await esperar(500);
  revisar('Entre 2026-09-01 y 2026-09-30 deja 2', (await cuenta(op, '.culto-fila')) === 2, `(${await cuenta(op, '.culto-fila')})`);
  await foto(op, '61-historial-rango.png');

  await clic(op, '.presets button', 'Este mes');
  await esperar(500);
  revisar('Este mes (octubre) deja 1', (await cuenta(op, '.culto-fila')) === 1, `(${await cuenta(op, '.culto-fila')})`);
  await clic(op, '.presets button', 'Todos');
  await esperar(400);
  revisar('Todos vuelve a 4', (await cuenta(op, '.culto-fila')) === 4);

  await clic(op, '.culto-fila');
  await esperar(1000);
  revisar('Abrir un culto lo carga en el panel', (await cuenta(op, '.culto-actual')) === 1 && (await cuenta(op, '.inicio-culto')) === 0);

  await clic(op, '.culto-botones .icono-btn');
  await esperar(600);
  revisar('Cerrar culto vuelve al inicio', (await cuenta(op, '.inicio-culto')) === 1);

  await poner(op, '.buscador input', 'jn 3');
  await esperar(900);
  await js(op, `document.getElementById('v-16').click()`);
  await esperar(500);
  await clic(op, '.foco-acciones .btn, .capitulo .foco-acciones .btn', 'Agregar Juan 3:16');
  await esperar(800);
  revisar('Agregar sin culto abierto propone crear uno', (await cuenta(op, '.modal')) === 1);
  await foto(op, '62-nuevo-con-pendiente.png');
  await clic(op, '.modal-pie .btn-lleno');
  await esperar(1500);
  const lista = await js(op, `[...document.querySelectorAll('.culto-lista .item')].map((n) => n.textContent.trim().slice(0, 20))`);
  revisar('El pasaje queda en el culto nuevo', lista.some((t) => t.startsWith('Juan 3:16')), JSON.stringify(lista));

  console.log('ERRORES', JSON.stringify(errores));
  app.exit(0);
}

main().catch((e) => { console.log('FALLO', e.stack || e); app.exit(1); });
