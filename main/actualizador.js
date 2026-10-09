const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');

const REPO = 'hviera01/atril';
const AGENTE = 'Atril-App';
const URL_RELEASE = `https://api.github.com/repos/${REPO}/releases/latest`;

function pedir(url, opciones, saltos = 0) {
  return new Promise((resolve, reject) => {
    if (saltos > 5) { reject(new Error('demasiadas redirecciones')); return; }
    const req = https.get(url, { headers: { 'User-Agent': AGENTE, ...(opciones.headers || {}) } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        pedir(res.headers.location, opciones, saltos + 1).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) { res.resume(); reject(new Error('HTTP ' + res.statusCode)); return; }
      resolve(res);
    });
    req.on('error', reject);
    req.setTimeout(opciones.espera || 8000, () => req.destroy(new Error('tiempo agotado')));
  });
}

async function pedirJson(url) {
  const res = await pedir(url, { headers: { Accept: 'application/vnd.github+json' } });
  return new Promise((resolve, reject) => {
    let cuerpo = '';
    res.on('data', (d) => { cuerpo += d; });
    res.on('end', () => { try { resolve(JSON.parse(cuerpo)); } catch (e) { reject(e); } });
    res.on('error', reject);
  });
}

function comparar(a, b) {
  const pa = String(a).replace(/^v/i, '').split('.').map(Number);
  const pb = String(b).replace(/^v/i, '').split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x !== y) return x - y;
  }
  return 0;
}

async function buscarNueva(versionActual) {
  const info = await pedirJson(URL_RELEASE);
  if (!info || !info.tag_name || comparar(info.tag_name, versionActual) <= 0) return null;
  const asset = (info.assets || []).find((a) => /^Atril-Setup-.*\.exe$/i.test(a.name));
  if (!asset) return null;
  return { version: info.tag_name.replace(/^v/i, ''), url: asset.browser_download_url, tamano: asset.size, notas: info.body || '' };
}

async function descargar(url, destino, alProgreso) {
  const res = await pedir(url, { espera: 120000 });
  const total = Number(res.headers['content-length']) || 0;
  let recibido = 0;
  await new Promise((resolve, reject) => {
    const archivo = fs.createWriteStream(destino);
    res.on('data', (d) => {
      recibido += d.length;
      if (total && alProgreso) alProgreso(recibido / total);
    });
    res.pipe(archivo);
    archivo.on('finish', () => archivo.close(resolve));
    archivo.on('error', reject);
    res.on('error', reject);
  });
  return recibido;
}

async function instalar(nueva, alProgreso) {
  const destino = path.join(os.tmpdir(), `Atril-Setup-${nueva.version}.exe`);
  const bytes = await descargar(nueva.url, destino, alProgreso);
  if (bytes < 1024 * 1024 || (nueva.tamano && bytes !== nueva.tamano)) throw new Error('La descarga no se completó correctamente.');
  const hijo = spawn(destino, ['/SILENT', '/SUPPRESSMSGBOXES', '/NORESTART', '/CLOSEAPPLICATIONS'], { detached: true, stdio: 'ignore' });
  hijo.unref();
}

module.exports = { buscarNueva, instalar, comparar };
