const { app, BrowserWindow, ipcMain, dialog, protocol, net, Menu } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const QRCode = require('qrcode');
const { Datos } = require('./datos');
const { LIBROS } = require('./libros');
const { Proyeccion, crearOperador } = require('./ventanas');
const { ServidorRemoto } = require('./remoto');
const actualizador = require('./actualizador');

const TITULO = 'Atril — Iglesia Lirio de los Valles - AD';
const EXT_IMAGEN = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
const EXT_VIDEO = ['.mp4', '.webm'];

protocol.registerSchemesAsPrivileged([
  { scheme: 'atril', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, bypassCSP: true } },
]);

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let datos = null;
let operador = null;
let proyeccion = null;
let remoto = null;
let carpetaMedios = '';
let nuevaVersion = null;

function enviarOperador(canal, ...args) {
  if (operador && !operador.isDestroyed()) operador.webContents.send(canal, ...args);
}

function tipoMedio(nombre) {
  const ext = path.extname(nombre).toLowerCase();
  if (EXT_IMAGEN.includes(ext)) return 'imagen';
  if (EXT_VIDEO.includes(ext)) return 'video';
  return null;
}

function listarMedios() {
  if (!fs.existsSync(carpetaMedios)) return [];
  return fs.readdirSync(carpetaMedios)
    .map((archivo) => ({ archivo, tipo: tipoMedio(archivo) }))
    .filter((m) => m.tipo)
    .map((m) => {
      const limpio = m.archivo.replace(/^\d+-/, '').replace(path.extname(m.archivo), '');
      return { ...m, nombre: limpio, url: `atril://medios/${encodeURIComponent(m.archivo)}`, fecha: fs.statSync(path.join(carpetaMedios, m.archivo)).mtimeMs };
    })
    .sort((a, b) => b.fecha - a.fecha);
}

function registrarProtocolo() {
  protocol.handle('atril', (req) => {
    const url = new URL(req.url);
    if (url.hostname !== 'medios') return new Response('no encontrado', { status: 404 });
    const archivo = path.join(carpetaMedios, path.basename(decodeURIComponent(url.pathname)));
    if (!archivo.startsWith(carpetaMedios) || !fs.existsSync(archivo)) return new Response('no encontrado', { status: 404 });
    const headers = {};
    const rango = req.headers.get('range');
    if (rango) headers.Range = rango;
    return net.fetch(pathToFileURL(archivo).toString(), { headers });
  });
}

function registrarIpc() {
  const manejar = (canal, f) => ipcMain.handle(canal, (_e, ...args) => f(...args));

  manejar('app:version', () => app.getVersion());
  manejar('libros', () => LIBROS.map(({ id, nombre, capitulos, testamento }) => ({ id, nombre, capitulos, testamento })));
  manejar('buscar', (q) => datos.buscar(q));
  manejar('biblia:capitulo', (libro, capitulo) => datos.capitulo(libro, capitulo));

  manejar('canciones:listar', (q) => datos.listarCanciones(q));
  manejar('canciones:obtener', (id) => datos.obtenerCancion(id));
  manejar('canciones:guardar', (c) => datos.guardarCancion(c));
  manejar('canciones:borrar', (id) => datos.borrarCancion(id));
  manejar('canciones:uso', (id) => datos.sumarUsoCancion(id));
  manejar('canciones:importar', async () => {
    const r = await dialog.showOpenDialog(operador, {
      title: 'Importar canciones',
      filters: [{ name: 'Letras de canciones', extensions: ['txt'] }],
      properties: ['openFile', 'multiSelections'],
    });
    if (r.canceled) return 0;
    let n = 0;
    for (const f of r.filePaths) {
      const letra = fs.readFileSync(f, 'utf8').replace(/^﻿/, '');
      const titulo = path.basename(f, path.extname(f)).trim();
      if (titulo && letra.trim()) { datos.guardarCancion({ titulo, letra }); n++; }
    }
    return n;
  });

  manejar('servicios:listar', () => datos.listarServicios());
  manejar('servicios:crear', (nombre) => datos.crearServicio(nombre));
  manejar('servicios:renombrar', (id, nombre) => datos.renombrarServicio(id, nombre));
  manejar('servicios:borrar', (id) => datos.borrarServicio(id));
  manejar('servicios:duplicar', (id, nombre) => datos.duplicarServicio(id, nombre));
  manejar('servicios:elementos', (id) => datos.elementos(id));
  manejar('servicios:guardar', (id, elementos) => datos.guardarElementos(id, elementos));

  manejar('ajustes:leer', (clave, porDefecto) => datos.ajuste(clave, porDefecto));
  manejar('ajustes:guardar', (clave, valor) => datos.guardarAjuste(clave, valor));

  manejar('medios:listar', () => listarMedios());
  manejar('medios:importar', async (tipo) => {
    const filtros = tipo === 'video'
      ? [{ name: 'Videos', extensions: ['mp4', 'webm'] }]
      : tipo === 'imagen'
        ? [{ name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }]
        : [{ name: 'Imágenes y videos', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm'] }];
    const r = await dialog.showOpenDialog(operador, { title: 'Agregar archivos', filters: filtros, properties: ['openFile', 'multiSelections'] });
    if (r.canceled) return [];
    fs.mkdirSync(carpetaMedios, { recursive: true });
    const copiados = [];
    for (const f of r.filePaths) {
      const base = path.basename(f).replace(/[^\w.\-áéíóúñÁÉÍÓÚÑ ]/g, '_');
      const destino = `${Date.now()}${copiados.length}-${base}`;
      fs.copyFileSync(f, path.join(carpetaMedios, destino));
      copiados.push(destino);
    }
    return listarMedios().filter((m) => copiados.includes(m.archivo));
  });
  manejar('medios:borrar', (archivo) => {
    const f = path.join(carpetaMedios, path.basename(archivo));
    if (f.startsWith(carpetaMedios) && fs.existsSync(f)) fs.unlinkSync(f);
  });

  manejar('proyeccion:estado', () => proyeccion.estado());
  manejar('proyeccion:abrir', () => { proyeccion.abrir(); });
  manejar('proyeccion:cerrar', () => { proyeccion.cerrar(); });
  manejar('proyeccion:elegirPantalla', (id) => {
    datos.guardarAjuste('pantallaId', id);
    if (proyeccion.win) proyeccion.moverAExterna();
    enviarOperador('proyeccion:cambio', proyeccion.estado());
  });
  manejar('proyeccion:pantallaCompleta', () => proyeccion.alternarPantallaCompleta());
  manejar('proyeccion:moverAExterna', () => proyeccion.moverAExterna());
  ipcMain.on('proyeccion:enviar', (_e, frame) => proyeccion.enviar(frame));
  ipcMain.on('pantalla:listo', () => proyeccion.reenviar());
  ipcMain.on('pantalla:alternar', () => proyeccion.alternarPantallaCompleta());

  ipcMain.on('remoto:publicar', (_e, estado) => remoto && remoto.publicar(estado));
  manejar('remoto:info', async () => {
    if (!remoto) return { activo: false, urls: [] };
    const urls = await Promise.all(remoto.urls().map(async (url) => ({ url, qr: await QRCode.toDataURL(url, { margin: 1, width: 240, color: { dark: '#15110e', light: '#f1e8d8' } }) })));
    return { activo: true, urls };
  });

  manejar('actualizar:buscar', async () => {
    try {
      nuevaVersion = await actualizador.buscarNueva(app.getVersion());
      return { ok: true, nueva: nuevaVersion };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  manejar('actualizar:instalar', async () => {
    if (!nuevaVersion) return { ok: false, error: 'No hay una versión nueva.' };
    try {
      await actualizador.instalar(nuevaVersion, (p) => enviarOperador('actualizar:progreso', p));
      setTimeout(() => app.quit(), 600);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  manejar('respaldo:exportar', async () => {
    const r = await dialog.showSaveDialog(operador, {
      title: 'Guardar respaldo',
      defaultPath: `Atril-respaldo-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: 'Respaldo de Atril', extensions: ['json'] }],
    });
    if (r.canceled) return false;
    fs.writeFileSync(r.filePath, JSON.stringify(datos.exportar(), null, 1));
    return true;
  });
  manejar('respaldo:importar', async () => {
    const r = await dialog.showOpenDialog(operador, {
      title: 'Restaurar respaldo',
      filters: [{ name: 'Respaldo de Atril', extensions: ['json'] }],
      properties: ['openFile'],
    });
    if (r.canceled) return null;
    try {
      return { ok: true, ...datos.importar(JSON.parse(fs.readFileSync(r.filePaths[0], 'utf8'))) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
}

async function arrancar() {
  Menu.setApplicationMenu(null);
  carpetaMedios = path.join(app.getPath('userData'), 'medios');
  fs.mkdirSync(carpetaMedios, { recursive: true });
  datos = new Datos(path.join(app.getPath('userData'), 'atril.db'), path.join(__dirname, '..', 'data', 'rvr1960.json'));
  registrarProtocolo();
  proyeccion = new Proyeccion(datos, () => enviarOperador('proyeccion:cambio', proyeccion.estado()));
  remoto = new ServidorRemoto({ datos, alComando: (cmd) => enviarOperador('remoto:comando', cmd) });
  await remoto.iniciar();
  registrarIpc();
  operador = crearOperador(TITULO);
  operador.on('closed', () => {
    operador = null;
    if (proyeccion) proyeccion.cerrar();
    app.quit();
  });
  setTimeout(async () => {
    try {
      nuevaVersion = await actualizador.buscarNueva(app.getVersion());
      if (nuevaVersion) enviarOperador('actualizar:disponible', nuevaVersion);
    } catch {}
  }, 8000);
}

app.on('second-instance', () => {
  if (operador) {
    if (operador.isMinimized()) operador.restore();
    operador.focus();
  }
});

app.whenReady().then(arrancar);

app.on('before-quit', () => {
  if (remoto) remoto.detener();
  if (datos) datos.cerrar();
});

app.on('window-all-closed', () => app.quit());
