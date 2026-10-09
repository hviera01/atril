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
const datos = fs.mkdtempSync(path.join(os.tmpdir(), 'atril-datos-'));
app.setPath('userData', datos);

const errores = [];
const ventanas = [];
app.on('browser-window-created', (_e, win) => {
  ventanas.push(win);
  win.webContents.on('console-message', (e) => { if (e.level === 'error' || e.level === 3) errores.push(e.message); });
});

require('../main/main.js');

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const js = (win, c) => win.webContents.executeJavaScript(c, true).catch((e) => { throw new Error(`JS: ${String(c).slice(0, 110)} => ${e.message}`); });
const foto = async (win, nombre) => {
  win.webContents.invalidate();
  await esperar(1000);
  fs.writeFileSync(path.join(SALIDA, nombre), (await win.webContents.capturePage()).toPNG());
};
const revisar = (nombre, ok, extra = '') => console.log(`${ok ? 'OK ' : 'FALLA'} ${nombre} ${extra}`);
const clic = (win, sel, t) => js(win, `(() => {
  const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find((b) => ${t ? `b.textContent.trim().includes(${JSON.stringify(t)})` : 'true'});
  if (!el) throw new Error('no hay ' + ${JSON.stringify(sel + ' ' + (t || ''))});
  el.click();
})()`);
const cuenta = (win, sel) => js(win, `document.querySelectorAll(${JSON.stringify(sel)}).length`);
const elegir = (win, sel, valor) => js(win, `(() => {
  const s = document.querySelector(${JSON.stringify(sel)});
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, ${JSON.stringify(valor)});
  s.dispatchEvent(new Event('change', { bubbles: true }));
})()`);
const poner = (win, sel, valor) => js(win, `(() => {
  const i = document.querySelector(${JSON.stringify(sel)});
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, ${JSON.stringify(valor)});
  i.dispatchEvent(new Event('input', { bubbles: true }));
})()`);

async function crearVideoDePrueba() {
  const w = new BrowserWindow({ show: false, width: 700, height: 400 });
  await w.loadURL('about:blank');
  const b64 = await js(w, `(async () => {
    const c = document.createElement('canvas'); c.width = 640; c.height = 360;
    const x = c.getContext('2d');
    const rec = new MediaRecorder(c.captureStream(30), { mimeType: 'video/webm' });
    const partes = [];
    rec.ondataavailable = (e) => partes.push(e.data);
    rec.start();
    let t = 0;
    const id = setInterval(() => { x.fillStyle = 'hsl(' + ((t * 6) % 360) + ',65%,42%)'; x.fillRect(0, 0, 640, 360); x.fillStyle = '#fff'; x.font = '60px sans-serif'; x.fillText('Video ' + t, 60, 200); t++; }, 33);
    await new Promise((r) => setTimeout(r, 3000));
    clearInterval(id);
    const fin = new Promise((r) => { rec.onstop = r; });
    rec.stop();
    await fin;
    const buf = new Uint8Array(await new Blob(partes, { type: 'video/webm' }).arrayBuffer());
    let s = '';
    for (let i = 0; i < buf.length; i += 8192) s += String.fromCharCode.apply(null, buf.subarray(i, i + 8192));
    return btoa(s);
  })()`);
  w.destroy();
  return Buffer.from(b64, 'base64');
}

async function main() {
  await app.whenReady();
  await esperar(4500);
  const op = ventanas.find((w) => !w.isDestroyed() && w.getTitle().startsWith('Atril'));
  const carpeta = path.join(datos, 'medios');
  fs.mkdirSync(carpeta, { recursive: true });
  fs.writeFileSync(path.join(carpeta, '1111-video-prueba.webm'), await crearVideoDePrueba());
  fs.copyFileSync(path.join(__dirname, '..', 'assets', 'logo-origen.jpg'), path.join(carpeta, '2222-foto-prueba.jpg'));
  console.log('Video de prueba:', fs.statSync(path.join(carpeta, '1111-video-prueba.webm')).size, 'bytes');

  await js(op, 'window.atril.proyeccion.abrir()');
  await esperar(2500);
  const proy = ventanas.find((w) => !w.isDestroyed() && w.getTitle().includes('Proyección'));

  console.log('ERR', JSON.stringify(errores.slice(0, 3)));
  console.log('TABS', JSON.stringify(await js(op, "[...document.querySelectorAll('.pestanas button')].map((b) => b.textContent)")), JSON.stringify(await js(op, 'document.body.innerText.slice(0, 120)')));
  await clic(op, '.pestanas button', 'Medios');
  await esperar(900);
  revisar('Medios lista imagen y video', (await cuenta(op, '.medio')) === 2);
  await js(op, `[...document.querySelectorAll('.medio')].find((m) => m.querySelector('video')).click()`);
  await esperar(800);
  await clic(op, '.logo-op .btn', 'Logo');
  await esperar(500);
  await elegir(op, '.logo-pop select', 'banda');
  await esperar(900);
  await foto(op, '100-logo-opciones.png');
  await js(op, `document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))`);
  await esperar(300);
  await clic(op, '.diap', '');
  await esperar(1500);
  const v1 = await js(proy, `(() => { const v = document.querySelector('video.esc-imagen'); return v ? { t: v.currentTime, pausado: v.paused, mudo: v.muted } : null; })()`);
  revisar('El video se reproduce en la proyección con sonido', !!v1 && v1.t > 0.5 && !v1.pausado && !v1.mudo, JSON.stringify(v1));
  await foto(proy, '101-video-con-banda.png');
  revisar('Aparecen los controles del video', (await cuenta(op, '.video-ctl .btn')) === 3);
  await clic(op, '.video-ctl .btn', 'Pausar');
  await esperar(700);
  const v2 = await js(proy, `document.querySelector('video.esc-imagen').paused`);
  revisar('Pausar detiene el video en la proyección', v2 === true);
  await clic(op, '.video-ctl .btn', 'Reproducir');
  await esperar(500);
  await clic(op, '.video-ctl .btn', 'Sonido');
  await esperar(500);
  const v3 = await js(proy, `document.querySelector('video.esc-imagen').muted`);
  revisar('Silenciar apaga el sonido en la proyección', v3 === true);

  await js(op, `[...document.querySelectorAll('.medio')].find((m) => m.querySelector('img')).click()`);
  await esperar(700);
  await clic(op, '.logo-op .btn', 'Logo');
  await esperar(400);
  await elegir(op, '.logo-pop select', 'redondo');
  await esperar(500);
  await elegir(op, '.logo-pop select:nth-of-type(1)', 'redondo');
  await js(op, `document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))`);
  await clic(op, '.diap', '');
  await esperar(1800);
  const logoImg = await js(proy, `!!document.querySelector('.esc-marca')`);
  revisar('La imagen lleva el logo redondo en una esquina', logoImg);
  await foto(proy, '102-imagen-con-logo.png');

  const antes = await cuenta(op, '.tema-chip');
  await js(op, `document.querySelector('.medio-acciones .icono-btn[title^="Usar como fondo"]').click()`);
  await esperar(1000);
  const despues = await cuenta(op, '.tema-chip');
  revisar('Usar como fondo crea un diseño nuevo', despues === antes + 1, `(${antes} -> ${despues})`);
  await poner(op, '.buscador input', 'jn 3');
  await esperar(900);
  await js(op, `document.getElementById('v-16').click()`);
  await esperar(2000);
  await foto(proy, '103-fondo-imagen.png');

  await clic(op, '.pestanas button', 'Canciones');
  await esperar(500);
  await clic(op, '.biblio-botones .btn-lleno', 'Nueva');
  await esperar(900);
  const pegada = ['Am G', 'Santo santo santo', 'Señor omnipotente', 'C F', 'Siempre los labios míos', 'Loores te dirán', 'Santo santo santo', 'Te adoro reverente', 'Dios en tres personas', 'Bendita Trinidad'].join('\n');
  await js(op, `(() => {
    const t = document.querySelector('.editor-izq textarea');
    const dt = new DataTransfer();
    dt.setData('text', ${JSON.stringify(pegada)});
    t.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  })()`);
  await esperar(700);
  const letra = await js(op, `document.querySelector('.editor-izq textarea').value`);
  revisar('Pegar una letra la organiza sola en estrofas', letra.includes('[Verso 1]') && letra.split('\n\n').length >= 2 && !letra.includes('Am G'), JSON.stringify(letra.slice(0, 60)));
  await foto(op, '104-letra-organizada.png');
  await js(op, `document.querySelector('.modal-cab .icono-btn').click()`);
  await esperar(400);

  await clic(op, '.temas-cab .btn', 'Editar');
  await esperar(900);
  await clic(op, '.tema-lista .btn', 'Nuevo desde cero');
  await esperar(500);
  await elegir(op, '.tema-controles select', 'animado');
  await esperar(900);
  await foto(op, '105-editor-fondo-animado.png');
  revisar('Hay controles de animación', (await cuenta(op, '.tema-controles input[type="range"]')) >= 1);

  console.log('ERRORES', JSON.stringify(errores.filter((e) => !/vibrate/.test(e))));
  app.exit(0);
}

main().catch((e) => { console.log('FALLO', e.stack || e); app.exit(1); });
