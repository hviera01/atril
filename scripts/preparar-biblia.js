const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

const FUENTE = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/es_rvr1960.json';
const DESTINO = path.join(__dirname, '..', 'data', 'rvr1960.json');

function bajar(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'atril-build' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        bajar(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) { reject(new Error('HTTP ' + res.statusCode)); return; }
      const trozos = [];
      res.on('data', (d) => trozos.push(d));
      res.on('end', () => resolve(Buffer.concat(trozos).toString('utf8')));
    }).on('error', reject);
  });
}

async function main() {
  if (fs.existsSync(DESTINO)) { console.log('data/rvr1960.json ya existe'); return; }
  const crudo = (await bajar(FUENTE)).replace(/^﻿/, '');
  const libros = JSON.parse(crudo);
  if (libros.length !== 66) throw new Error('La fuente no trae 66 libros');
  const compacto = libros.map((l) => l.chapters.map((c) => c.map((v) => v.trim())));
  const total = compacto.reduce((a, l) => a + l.reduce((b, c) => b + c.length, 0), 0);
  if (total < 31000) throw new Error('La fuente está incompleta: ' + total);
  fs.writeFileSync(DESTINO, JSON.stringify(compacto));
  console.log('Biblia preparada:', total, 'versículos');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
