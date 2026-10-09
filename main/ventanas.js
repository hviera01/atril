const { BrowserWindow, screen } = require('electron');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const DEV_URL = process.env.ATRIL_DEV_URL || '';
const ICONO = path.join(RAIZ, 'build', 'icon.png');

function cargar(win, pagina, hash = '') {
  if (DEV_URL) win.loadURL(`${DEV_URL}/${pagina}/index.html${hash}`);
  else win.loadFile(path.join(RAIZ, 'dist-web', pagina, 'index.html'), hash ? { hash: hash.slice(1) } : undefined);
}

function crearOperador(titulo) {
  const win = new BrowserWindow({
    width: 1440,
    height: 880,
    minWidth: 1120,
    minHeight: 680,
    show: false,
    backgroundColor: '#15110e',
    title: titulo,
    icon: ICONO,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });
  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  cargar(win, 'operador');
  return win;
}

class Proyeccion {
  constructor(datos, alCambiar) {
    this.datos = datos;
    this.alCambiar = alCambiar;
    this.wins = new Map();
    this.ultimo = null;
    screen.on('display-added', () => this.alCambiar());
    screen.on('display-removed', (_e, d) => {
      const w = this.wins.get(d.id);
      if (w) w.close();
      this.alCambiar();
    });
  }

  idsElegidos() {
    const todas = screen.getAllDisplays();
    const principal = screen.getPrimaryDisplay().id;
    const guardado = this.datos.ajuste('pantallasIds', null);
    if (Array.isArray(guardado)) {
      if (guardado.length === 0) return [];
      const vigentes = guardado.filter((id) => todas.some((d) => d.id === id));
      if (vigentes.length) return vigentes;
    }
    return todas.filter((d) => d.id !== principal).map((d) => d.id);
  }

  pantallas() {
    const principal = screen.getPrimaryDisplay().id;
    const elegidas = new Set(this.idsElegidos());
    return screen.getAllDisplays().map((d, i) => ({
      id: d.id,
      nombre: `Pantalla ${i + 1}${d.id === principal ? ' (principal)' : ''}`,
      numero: i + 1,
      ancho: d.bounds.width,
      alto: d.bounds.height,
      principal: d.id === principal,
      elegida: elegidas.has(d.id),
      activa: this.wins.has(d.id),
    }));
  }

  estado() {
    const ventana = this.wins.get('ventana');
    return {
      abierta: this.wins.size > 0,
      enVentana: !!ventana,
      pantallaCompleta: ventana ? ventana.isFullScreen() : false,
      pantallas: this.pantallas(),
      hayExterna: screen.getAllDisplays().length > 1,
    };
  }

  crear(id) {
    const destino = id === null ? null : screen.getAllDisplays().find((d) => d.id === id);
    const clave = destino ? destino.id : 'ventana';
    if (this.wins.has(clave)) return;
    const opciones = {
      show: false,
      backgroundColor: '#000000',
      title: 'Atril — Proyección',
      icon: ICONO,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        backgroundThrottling: false,
        autoplayPolicy: 'no-user-gesture-required',
      },
    };
    if (destino) {
      Object.assign(opciones, { x: destino.bounds.x, y: destino.bounds.y, width: destino.bounds.width, height: destino.bounds.height, frame: false, fullscreen: true });
    } else {
      Object.assign(opciones, { width: 960, height: 540 });
    }
    const win = new BrowserWindow(opciones);
    this.wins.set(clave, win);
    if (!destino) win.setAspectRatio(16 / 9);
    win.webContents.on('before-input-event', (e, input) => {
      if (input.type !== 'keyDown') return;
      if (input.key === 'F11') { this.alternarPantallaCompleta(win); e.preventDefault(); }
      if (input.key === 'Escape' && win.isFullScreen() && !destino) { win.setFullScreen(false); e.preventDefault(); }
    });
    win.once('ready-to-show', () => { win.show(); this.alCambiar(); });
    win.on('enter-full-screen', () => this.alCambiar());
    win.on('leave-full-screen', () => this.alCambiar());
    win.on('closed', () => { this.wins.delete(clave); this.alCambiar(); });
    cargar(win, 'proyeccion');
  }

  abrir() {
    if (this.wins.size) { for (const w of this.wins.values()) w.show(); return; }
    const ids = this.idsElegidos();
    if (!ids.length) this.crear(null);
    else ids.forEach((id) => this.crear(id));
  }

  cerrar() {
    for (const w of [...this.wins.values()]) w.close();
  }

  activar(id, encendida) {
    const ids = new Set(this.idsElegidos());
    if (encendida) ids.add(id); else ids.delete(id);
    this.datos.guardarAjuste('pantallasIds', [...ids]);
    if (this.wins.size) {
      if (encendida) {
        const ventana = this.wins.get('ventana');
        if (ventana) ventana.close();
        this.crear(id);
      } else if (this.wins.has(id)) {
        this.wins.get(id).close();
      }
    }
    this.alCambiar();
  }

  alternarPantallaCompleta(win) {
    const w = win || this.wins.get('ventana');
    if (!w || w.isDestroyed()) return;
    if (w.isFullScreen()) { w.setFullScreen(false); return; }
    w.setBounds(screen.getDisplayMatching(w.getBounds()).bounds);
    w.setFullScreen(true);
  }

  identificar() {
    screen.getAllDisplays().forEach((d, i) => {
      const w = new BrowserWindow({
        x: d.bounds.x + Math.round(d.bounds.width / 2) - 130,
        y: d.bounds.y + Math.round(d.bounds.height / 2) - 130,
        width: 260,
        height: 260,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        focusable: false,
        skipTaskbar: true,
        resizable: false,
        show: true,
      });
      const html = `<body style="margin:0;display:grid;place-items:center;height:100vh;background:rgba(21,17,14,.92);border:6px solid #d8a24a;box-sizing:border-box;color:#f1e8d8;font:700 150px Georgia,serif">${i + 1}</body>`;
      w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
      setTimeout(() => { if (!w.isDestroyed()) w.close(); }, 2600);
    });
  }

  cargaPara(clave) {
    const p = this.ultimo;
    if (!p) return null;
    if (clave !== 'ventana' && p.porPantalla && p.porPantalla[String(clave)]) return p.porPantalla[String(clave)];
    return p.base;
  }

  enviar(payload) {
    this.ultimo = payload;
    for (const [clave, w] of this.wins) {
      if (w.isDestroyed() || w.webContents.isLoading()) continue;
      const carga = this.cargaPara(clave);
      if (carga) w.webContents.send('pantalla', carga);
    }
  }

  reenviarA(contenidos) {
    for (const [clave, w] of this.wins) {
      if (w.isDestroyed() || w.webContents !== contenidos) continue;
      const carga = this.cargaPara(clave);
      if (carga) contenidos.send('pantalla', carga);
    }
  }

  ventanaDe(contenidos) {
    for (const w of this.wins.values()) if (!w.isDestroyed() && w.webContents === contenidos) return w;
    return null;
  }
}

module.exports = { crearOperador, Proyeccion };
