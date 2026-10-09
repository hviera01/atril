const { LIBROS, normalizar, compacto } = require('./libros');

const ORDINALES = { i: 1, ii: 2, iii: 3, primera: 1, primero: 1, segunda: 2, segundo: 2, tercera: 3, tercero: 3, '1ra': 1, '1ro': 1, '2da': 2, '2do': 2, '3ra': 3, '3ro': 3 };

const PATRON = /^\s*(?:(\d|i{1,3}|primer[ao]|segund[ao]|tercer[ao]|1r[ao]|2d[ao]|3r[ao])\s*(?:de\s+)?)?([a-z]+(?:\s+de\s+los\s+[a-z]+)?)\.?\s*(?:(\d{1,3})(?:\s*[:.,]\s*|\s+)?(?:(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?)?)?\s*$/;

function numeroOrdinal(token) {
  if (!token) return 0;
  if (/^\d$/.test(token)) return Number(token);
  return ORDINALES[token] || 0;
}

function buscarLibros(numero, texto) {
  const base = compacto(texto);
  if (!base) return [];
  const clave = (numero ? String(numero) : '') + base;
  const exactos = LIBROS.filter((l) => l.clave === clave || l.alias.includes(clave));
  if (exactos.length) return exactos.map((l) => l.id);
  const candidatos = LIBROS.filter((l) => {
    const tieneNumero = /^\d/.test(l.clave);
    if (numero ? !tieneNumero : tieneNumero) return false;
    return l.clave.startsWith(clave) || l.alias.some((a) => a.startsWith(clave));
  });
  return candidatos.map((l) => l.id);
}

function interpretarReferencia(entrada) {
  const texto = normalizar(entrada || '');
  if (!texto.trim()) return null;
  const m = PATRON.exec(texto);
  if (!m) return null;
  const numero = numeroOrdinal(m[1]);
  if (m[1] && !numero) return null;
  const libros = buscarLibros(numero, m[2]);
  if (!libros.length) return null;
  const capitulo = m[3] ? Number(m[3]) : null;
  const desde = m[4] ? Number(m[4]) : null;
  let hasta = m[5] ? Number(m[5]) : null;
  if (desde && hasta && hasta < desde) hasta = desde;
  return { libros, capitulo, desde, hasta: hasta || desde || null };
}

function nombreReferencia(libroId, capitulo, desde, hasta) {
  const libro = LIBROS[libroId - 1];
  let r = libro.nombre;
  if (capitulo) r += ' ' + capitulo;
  if (desde) r += ':' + desde;
  if (hasta && hasta !== desde) r += '-' + hasta;
  return r;
}

module.exports = { interpretarReferencia, nombreReferencia };
