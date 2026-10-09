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
    this.win = null;
    this.ultimo = null;
  }

  pantallas() {
    const principal = screen.getPrimaryDisplay().id;
    return screen.getAllDisplays().map((d, i) => ({
      id: d.id,
      nombre: `Pantalla ${i + 1}${d.id === principal ? ' (principal)' : ''}`,
      ancho: d.bounds.width,
      alto: d.bounds.height,
      principal: d.id === principal,
    }));
  }

  elegida() {
    const todas = screen.getAllDisplays();
    const principal = screen.getPrimaryDisplay();
    const guardada = this.datos.ajuste('pantallaId');
    return todas.find((d) => d.id === guardada) || todas.find((d) => d.id !== principal.id) || null;
  }

  estado() {
    const abierta = !!this.win;
    return {
      abierta,
      pantallaCompleta: abierta ? this.win.isFullScreen() : false,
      pantallas: this.pantallas(),
      pantallaId: (this.elegida() || screen.getPrimaryDisplay()).id,
      hayExterna: screen.getAllDisplays().length > 1,
    };
  }

  abrir() {
    if (this.win) { this.win.show(); return; }
    const destino = this.elegida();
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
    this.win = win;
    if (!destino) win.setAspectRatio(16 / 9);
    win.webContents.on('before-input-event', (e, input) => {
      if (input.type !== 'keyDown') return;
      if (input.key === 'F11') { this.alternarPantallaCompleta(); e.preventDefault(); }
      if (input.key === 'Escape' && win.isFullScreen() && !destino) { win.setFullScreen(false); e.preventDefault(); }
    });
    win.once('ready-to-show', () => { win.show(); this.alCambiar(); });
    win.on('enter-full-screen', () => this.alCambiar());
    win.on('leave-full-screen', () => this.alCambiar());
    win.on('closed', () => { this.win = null; this.alCambiar(); });
    cargar(win, 'proyeccion');
  }

  cerrar() {
    if (this.win) this.win.close();
  }

  alternarPantallaCompleta() {
    if (!this.win) return;
    if (this.win.isFullScreen()) {
      this.win.setFullScreen(false);
      return;
    }
    const d = screen.getDisplayMatching(this.win.getBounds());
    this.win.setBounds(d.bounds);
    this.win.setFullScreen(true);
  }

  moverAExterna() {
    const destino = this.elegida();
    if (!this.win || !destino) return;
    this.win.setFullScreen(false);
    this.win.setBounds(destino.bounds);
    this.win.setFullScreen(true);
  }

  enviar(frame) {
    this.ultimo = frame;
    if (this.win && !this.win.webContents.isLoading()) this.win.webContents.send('pantalla', frame);
  }

  reenviar() {
    if (this.win && this.ultimo) this.win.webContents.send('pantalla', this.ultimo);
  }
}

module.exports = { crearOperador, Proyeccion };
