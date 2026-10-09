const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const RAIZ = path.join(__dirname, '..');
const ORIGEN = path.join(RAIZ, 'assets', 'logo-origen.jpg');
const LOGO = path.join(RAIZ, 'src', 'compartido', 'logo-iglesia.png');
const LOGO_REDONDO = path.join(RAIZ, 'src', 'compartido', 'logo-redondo.png');
const ICONO_PNG = path.join(RAIZ, 'build', 'icon.png');
const ICONO_ICO = path.join(RAIZ, 'build', 'icon.ico');

async function logoTransparente() {
  const { data, info } = await sharp(ORIGEN).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const fondo = [data[0], data[1], data[2]];
  const salida = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const d = Math.max(Math.abs(data[i] - fondo[0]), Math.abs(data[i + 1] - fondo[1]), Math.abs(data[i + 2] - fondo[2]));
    const a = Math.min(1, Math.max(0, (d - 6) / 46));
    if (a === 0) { salida[i + 3] = 0; continue; }
    for (let c = 0; c < 3; c++) {
      const v = (data[i + c] - (1 - a) * fondo[c]) / a;
      salida[i + c] = Math.max(0, Math.min(255, Math.round(v)));
    }
    salida[i + 3] = Math.round(a * 255);
  }
  const recorte = await sharp(salida, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer().then((b) => sharp(b).trim({ threshold: 1 }).toBuffer());
  return sharp(recorte).extend({ top: 24, bottom: 24, left: 24, right: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

async function circulo(logo, lado) {
  const r = lado / 2;
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="' + lado + '" height="' + lado + '"><defs><radialGradient id="g" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#f7f0e1"/><stop offset="1" stop-color="#e4d6ba"/></radialGradient></defs><circle cx="' + r + '" cy="' + r + '" r="' + (r - 2) + '" fill="url(#g)"/><circle cx="' + r + '" cy="' + r + '" r="' + (r * 0.955) + '" fill="none" stroke="#d8a24a" stroke-width="' + (lado * 0.022) + '"/><circle cx="' + r + '" cy="' + r + '" r="' + (r * 0.90) + '" fill="none" stroke="#d8a24a" stroke-opacity=".35" stroke-width="' + (lado * 0.006) + '"/></svg>');
  const ancho = Math.round(lado * 0.64);
  const interior = await sharp(logo).resize({ width: ancho, height: ancho, fit: 'inside' }).toBuffer();
  return sharp(svg).composite([{ input: interior, gravity: 'center' }]).png().toBuffer();
}

async function main() {
  const logo = await logoTransparente();
  fs.writeFileSync(LOGO, logo);
  const redondo = await circulo(logo, 900);
  fs.writeFileSync(LOGO_REDONDO, redondo);
  const icono = await circulo(logo, 512);
  fs.writeFileSync(ICONO_PNG, icono);
  const tamanos = [256, 64, 48, 32, 16];
  const imagenes = await Promise.all(tamanos.map((t) => sharp(icono).resize(t, t).png().toBuffer()));
  const convertir = (await import('png-to-ico')).default;
  fs.writeFileSync(ICONO_ICO, await convertir(imagenes));
  console.log('Logo e iconos generados');
}

main().catch((e) => { console.error(e); process.exit(1); });
