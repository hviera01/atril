const test = require('node:test');
const assert = require('node:assert');
const { interpretarReferencia } = require('../main/referencias');


const una = (txt) => {
  const r = interpretarReferencia(txt);
  assert.ok(r, 'no interpretó: ' + txt);
  return r;
};

test('referencias completas', () => {
  assert.deepStrictEqual(una('jn 3 16'), { libros: [43], capitulo: 3, desde: 16, hasta: 16 });
  assert.deepStrictEqual(una('Juan 3:16'), { libros: [43], capitulo: 3, desde: 16, hasta: 16 });
  assert.deepStrictEqual(una('juan3:16-18'), { libros: [43], capitulo: 3, desde: 16, hasta: 18 });
  assert.deepStrictEqual(una('sal23.1'), { libros: [19], capitulo: 23, desde: 1, hasta: 1 });
  assert.deepStrictEqual(una('Génesis 1'), { libros: [1], capitulo: 1, desde: null, hasta: null });
});

test('libros numerados', () => {
  assert.deepStrictEqual(una('1 co 13:4-7'), { libros: [46], capitulo: 13, desde: 4, hasta: 7 });
  assert.deepStrictEqual(una('1co13'), { libros: [46], capitulo: 13, desde: null, hasta: null });
  assert.deepStrictEqual(una('primera de juan 4 8').libros, [62]);
  assert.deepStrictEqual(una('2 timoteo 3:16').libros, [55]);
  assert.deepStrictEqual(una('3 jn 1').libros, [64]);
});

test('solo libro y prefijos', () => {
  assert.deepStrictEqual(una('salmos').libros, [19]);
  assert.deepStrictEqual(una('apoc 21:4').libros, [66]);
  assert.deepStrictEqual(una('cantar de los cantares 2').libros.length, 1);
  assert.ok(una('fil').libros.length >= 1);
  assert.ok(una('ju').libros.length > 1);
});

test('lo que no es referencia', () => {
  assert.strictEqual(interpretarReferencia('amor de dios'), null);
  assert.strictEqual(interpretarReferencia(''), null);
  assert.strictEqual(interpretarReferencia('3 16'), null);
});

test('letras: estrofas, etiquetas y partición', async () => {
  const { dividirLetra } = await import('../src/compartido/letras.mjs');
  const letra = '[Verso 1]\nlinea a\nlinea b\n\nCoro\nlinea c\nlinea d\n\nl1\nl2\nl3\nl4\nl5\nl6\nl7';
  const s = dividirLetra(letra, 4);
  assert.strictEqual(s[0].etiqueta, 'Verso 1');
  assert.deepStrictEqual(s[0].lineas, ['linea a', 'linea b']);
  assert.strictEqual(s[1].etiqueta, 'Coro');
  assert.strictEqual(s.length, 4);
  assert.deepStrictEqual(s[2].lineas.length + s[3].lineas.length, 7);
  assert.ok(Math.abs(s[2].lineas.length - s[3].lineas.length) <= 1);
});


test('organizar letra pegada sin estrofas', async () => {
  const { organizarLetra, dividirLetra } = await import('../src/compartido/letras.mjs');
  const pegada = ['Am G', 'Santo santo santo', 'Señor omnipotente', 'C F', 'Siempre los labios míos', 'Loores te dirán', 'Santo santo santo', 'Te adoro reverente', 'Dios en tres personas', 'Bendita Trinidad', 'Santo santo santo', 'Misericordioso y fuerte'].join('\n');
  const org = organizarLetra(pegada, 4);
  assert.ok(!/\bAm G\b|\bC F\b/.test(org), 'quita los acordes');
  const partes = org.split('\n\n');
  assert.strictEqual(partes.length, 3);
  assert.deepStrictEqual(partes.map((p) => p.split('\n').length - 1), [4, 3, 3]);
  assert.strictEqual(partes[0].split('\n')[0], '[Verso 1]');
  assert.strictEqual(dividirLetra(org, 4).length, 3);
});

test('organizar letra detecta el coro repetido y respeta estrofas existentes', async () => {
  const { organizarLetra } = await import('../src/compartido/letras.mjs');
  const letra = 'Uno\nDos\n\nCoro aquí\nCoro allá\n\nTres\nCuatro\n\ncoro aquí\nCORO ALLÁ';
  const partes = organizarLetra(letra, 4).split('\n\n');
  assert.strictEqual(partes.length, 4);
  assert.deepStrictEqual(partes.map((p) => p.split('\n')[0]), ['[Verso 1]', '[Coro]', '[Verso 2]', '[Coro]']);
  assert.strictEqual(organizarLetra('[Coro]\nA\nB\n\n[Verso 1]\nC\nD', 4), '[Coro]\nA\nB\n\n[Verso 1]\nC\nD');
});
