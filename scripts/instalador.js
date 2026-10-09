const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const version = require(path.join(RAIZ, 'package.json')).version;
const ISCC = [
  'C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe',
  'C:\\Program Files\\Inno Setup 6\\ISCC.exe',
].find((p) => fs.existsSync(p));

function correr(comando, args, opciones = {}) {
  console.log(`\n> ${comando} ${args.join(' ')}`);
  const r = spawnSync(comando, args, { cwd: RAIZ, stdio: 'inherit', shell: true, ...opciones });
  if (r.status !== 0) { console.error(`Falló: ${comando}`); process.exit(r.status || 1); }
}

if (!ISCC) { console.error('No encontré Inno Setup 6.'); process.exit(1); }

const entorno = { ...process.env };
delete entorno.ELECTRON_RUN_AS_NODE;

correr('node', ['scripts/preparar-biblia.js']);
correr('npx', ['vite', 'build'], { env: entorno });
fs.rmSync(path.join(RAIZ, 'dist'), { recursive: true, force: true });
correr('npx', ['electron-builder', '--win', 'dir', '--x64'], { env: entorno });
correr(`"${ISCC}"`, [`/DMyAppVersion=${version}`, 'installer\\atril.iss']);

const salida = path.join(RAIZ, 'instalador', `Atril-Setup-${version}.exe`);
console.log(`\nListo: ${salida} (${(fs.statSync(salida).size / 1048576).toFixed(1)} MB)`);
