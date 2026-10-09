const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { URL } = require('node:url');
const { LIBROS } = require('./libros');

const PUERTO_BASE = 7878;

function direccionesLocales() {
  const privadas = [];
  const otras = [];
  for (const lista of Object.values(os.networkInterfaces())) {
    for (const i of lista || []) {
      if (i.family !== 'IPv4' || i.internal) continue;
      if (/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(i.address)) privadas.push(i.address);
      else otras.push(i.address);
    }
  }
  return [...privadas, ...otras];
}

class ServidorRemoto {
  constructor({ datos, alComando }) {
    this.datos = datos;
    this.alComando = alComando;
    this.estado = { servicio: '', elementos: [], vivo: null, modo: 'contenido' };
    this.clientes = new Set();
    this.server = null;
    this.puerto = 0;
    this.clave = datos.ajuste('remotoClave');
    if (!this.clave) {
      this.clave = crypto.randomBytes(3).toString('hex');
      datos.guardarAjuste('remotoClave', this.clave);
    }
    this.logo = fs.readFileSync(path.join(__dirname, 'remoto-logo.png'));
  }

  iniciar() {
    return new Promise((resolve) => {
      let puerto = PUERTO_BASE;
      const intentar = () => {
        const server = http.createServer((req, res) => this.atender(req, res));
        server.once('error', (e) => {
          if (e.code === 'EADDRINUSE' && puerto < PUERTO_BASE + 20) { puerto++; intentar(); return; }
          resolve(false);
        });
        server.listen(puerto, '0.0.0.0', () => {
          this.server = server;
          this.puerto = puerto;
          resolve(true);
        });
      };
      intentar();
    });
  }

  urls() {
    if (!this.server) return [];
    return direccionesLocales().map((ip) => `http://${ip}:${this.puerto}/?k=${this.clave}`);
  }

  publicar(estado) {
    this.estado = estado;
    const linea = `data: ${JSON.stringify(estado)}\n\n`;
    for (const c of this.clientes) c.write(linea);
  }

  autorizado(url) {
    return url.searchParams.get('k') === this.clave;
  }

  atender(req, res) {
    const url = new URL(req.url, 'http://x');
    if (!this.autorizado(url)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Escanea el código QR que aparece en Atril (Ajustes > Control remoto).');
      return;
    }
    if (url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(fs.readFileSync(path.join(__dirname, 'remoto.html'), 'utf8'));
      return;
    }
    if (url.pathname === '/logo.png') {
      res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'max-age=86400' });
      res.end(this.logo);
      return;
    }
    if (url.pathname === '/libros') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(LIBROS.map(({ id, nombre, capitulos, testamento }) => ({ id, nombre, capitulos, testamento }))));
      return;
    }
    if (url.pathname === '/capitulo') {
      const libro = Number(url.searchParams.get('libro'));
      const cap = Number(url.searchParams.get('cap'));
      const valido = libro >= 1 && libro <= 66 && cap >= 1 && cap <= LIBROS[libro - 1].capitulos;
      res.writeHead(valido ? 200 : 400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(valido ? this.datos.capitulo(libro, cap) : []));
      return;
    }
    if (url.pathname === '/eventos') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
      res.write(`data: ${JSON.stringify(this.estado)}\n\n`);
      this.clientes.add(res);
      req.on('close', () => this.clientes.delete(res));
      return;
    }
    if (url.pathname === '/buscar') {
      const r = this.datos.buscar(url.searchParams.get('q') || '');
      const ligero = {
        referencia: r.referencia,
        libros: r.libros,
        versiculos: r.versiculos.slice(0, 200),
        palabras: r.palabras.slice(0, 40),
        canciones: r.canciones,
      };
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(ligero));
      return;
    }
    if (url.pathname === '/cmd' && req.method === 'POST') {
      let cuerpo = '';
      req.on('data', (d) => { cuerpo += d; if (cuerpo.length > 20000) req.destroy(); });
      req.on('end', () => {
        try { this.alComando(JSON.parse(cuerpo)); } catch {}
        res.writeHead(204);
        res.end();
      });
      return;
    }
    res.writeHead(404);
    res.end();
  }

  detener() {
    for (const c of this.clientes) c.end();
    this.clientes.clear();
    if (this.server) this.server.close();
  }
}

module.exports = { ServidorRemoto };
