const { spawn } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const URL_DEV = 'http://localhost:5199';
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const vite = spawn(npx, ['vite'], { cwd: RAIZ, stdio: 'inherit', shell: true });

function esperar() {
  return new Promise((resolve) => {
    const intento = () => {
      http.get(URL_DEV, (res) => { res.resume(); resolve(); }).on('error', () => setTimeout(intento, 300));
    };
    intento();
  });
}

esperar().then(() => {
  const electron = spawn(require('electron'), ['.'], { cwd: RAIZ, stdio: 'inherit', env: { ...process.env, ATRIL_DEV_URL: URL_DEV } });
  electron.on('exit', () => { vite.kill(); process.exit(0); });
});
