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
});

require('../main/main.js');

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const js = (win, codigo) => win.webContents.executeJavaScript(codigo).catch((e) => { throw new Error('JS fallo: ' + String(codigo).slice(0, 110) + ' => ' + e.message); });
const foto = async (win, nombre) => {
  win.webContents.invalidate();
  await esperar(500);
  const img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(SALIDA, nombre), img.toPNG());
};
const tecla = (win, key) => js(win, `window.dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(key)}, bubbles: true }))`);

async function main() {
  await app.whenReady();
  await esperar(3500);
  const op = ventanas.find((w) => w.getTitle().startsWith('Atril'));
  await js(op, `(async () => {
    const a = window.atril;
    const c1 = await a.canciones.guardar({ titulo: 'Santo, santo, santo', autor: 'Reginald Heber', letra: '[Verso 1]\\nSanto, santo, santo, Señor omnipotente\\nSiempre los labios míos loores te dirán\\nSanto, santo, santo, te adoro reverente\\nDios en tres personas, bendita Trinidad\\n\\n[Coro]\\nSanto, santo, santo\\nMisericordioso y fuerte\\nDios en tres personas\\nBendita Trinidad' });
    await a.canciones.guardar({ titulo: 'Cuán grande es Él', autor: 'Stuart Hine', letra: 'Señor mi Dios, al contemplar los cielos\\nEl firmamento y las estrellas mil\\n\\nCoro\\nEntonces mi alma canta a ti Señor\\nCuán grande es Él' });
    const s = (await a.servicios.listar())[0];
    await a.servicios.guardar(s.id, [
      { id: 'a1', tipo: 'seccion', titulo: 'Alabanza' },
      { id: 'a2', tipo: 'cancion', cancionId: c1, titulo: 'Santo, santo, santo' },
      { id: 'a3', tipo: 'seccion', titulo: 'Palabra' },
      { id: 'a4', tipo: 'biblia', libro: 19, capitulo: 23, desde: null, hasta: null, agrupar: 1 },
      { id: 'a5', tipo: 'biblia', libro: 46, capitulo: 13, desde: 4, hasta: 7, agrupar: 2 },
      { id: 'a6', tipo: 'texto', titulo: 'Anuncios', cuerpo: 'Reunión de jóvenes el viernes a las 7 pm\\n\\nAyuno congregacional el miércoles' },
      { id: 'a7', tipo: 'temporizador', titulo: 'El culto comienza en', minutos: 5 },
    ]);
    location.reload();
  })()`);
  await esperar(3500);
  await js(op, `document.querySelectorAll('.item')[0].click()`);
  await esperar(900);
  await foto(op, '10-cancion-foco.png');

  await js(op, `document.querySelectorAll('.item')[0].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))`);
  await esperar(500);
  await js(op, `window.atril.proyeccion.abrir()`);
  await esperar(2000);
  const proy = ventanas.find((w) => w.getTitle().includes('Proyección'));
  await foto(proy, '11-letra-madrugada.png');
  for (const [id, nombre] of [['brasa', 'brasa'], ['alba', 'alba'], ['pergamino', 'pergamino'], ['monte', 'monte'], ['lienzo', 'lienzo']]) {
    await js(op, `[...document.querySelectorAll('.tema-chip')].find((b) => b.title.toLowerCase() === ${JSON.stringify(id)}).click()`);
    await esperar(900);
    await foto(proy, `12-letra-${nombre}.png`);
  }
  await js(op, `[...document.querySelectorAll('.tema-chip')].find((b) => b.title === 'Madrugada').click()`);
  await tecla(op, 'PageDown');
  await esperar(1000);
  await tecla(op, 'ArrowRight');
  await esperar(900);
  await foto(op, '13-salmo.png');
  await foto(proy, '14-salmo-proy.png');

  await js(op, `document.querySelectorAll('.item')[2].click()`);
  await esperar(700);
  await js(op, `document.querySelectorAll('.diap')[0].click()`);
  await esperar(1000);
  await foto(proy, '15-corintios-agrupado.png');

  await js(op, `document.querySelectorAll('.item')[3].click()`);
  await esperar(500);
  await js(op, `document.querySelectorAll('.diap')[0].click()`);
  await esperar(1000);
  await foto(proy, '16-anuncio.png');
  await js(op, `document.querySelectorAll('.item')[4].click()`);
  await esperar(500);
  await js(op, `document.querySelectorAll('.diap')[0].click()`);
  await esperar(1200);
  await foto(proy, '17-cuenta.png');
  await tecla(op, 'l');
  await esperar(1200);
  await foto(proy, '18-logo.png');
  await tecla(op, 'b');
  await esperar(700);
  await foto(proy, '19-negro.png');
  await tecla(op, 'b');

  await js(op, `[...document.querySelectorAll('.temas-cab .btn')][0].click()`);
  await esperar(1000);
  await foto(op, '20-editor-tema.png');
  await tecla(op, 'Escape');
  await esperar(300);
  await js(op, `document.querySelector('.barra-der .icono-btn').click()`);
  await esperar(800);
  await foto(op, '21-ajustes.png');
  await tecla(op, 'Escape');
  await esperar(300);
  await js(op, `[...document.querySelectorAll('.barra-der .btn')][0].click()`);
  await esperar(1000);
  await foto(op, '22-remoto.png');
  await tecla(op, 'Escape');
  await esperar(300);
  await js(op, `[...document.querySelectorAll('.pestanas button')][1].click()`);
  await esperar(500);
  await js(op, `document.querySelector('.fila-cancion .icono-btn:last-child').click()`);
  await esperar(900);
  await foto(op, '23-editor-cancion.png');

  console.log('ERRORES', JSON.stringify(errores, null, 1));
  app.exit(0);
}

main().catch((e) => { console.log('FALLO', e.stack || e); app.exit(1); });
